// Service worker do app: faz o app funcionar sem internet.
// - Na instalação, baixa as 3 páginas, os arquivos de código e estilo delas, as fontes e os ícones.
// - Páginas e dados de navegação: rede primeiro (versão nova quando há conexão), cache quando cai.
// - Arquivos estáticos (código, fontes, ícones): cache primeiro.
const CACHE = "mt-v4"; // trocar o nome apaga o cache antigo
const PAGINAS = ["/", "/treinos", "/anatomia"];
const FIXOS = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/fontes/barlow-400.woff",
  "/fontes/barlow-500.woff",
  "/fontes/barlow-600.woff",
  "/fontes/barlow-700.woff",
  "/fontes/big-shoulders-display.woff",
];

// Baixa cada página e todos os arquivos /_next/static que ela usa, para abrir qualquer tela offline.
async function preparar() {
  const cache = await caches.open(CACHE);
  const arquivos = new Set(FIXOS);
  await Promise.all(
    PAGINAS.map(async (p) => {
      try {
        const resp = await fetch(p, { cache: "no-store" });
        if (!resp.ok) return;
        const html = await resp.clone().text();
        await cache.put(p, resp);
        for (const m of html.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) arquivos.add(m[0]);
      } catch {
        // Sem rede na instalação: as páginas entram no cache quando forem abertas.
      }
    })
  );
  await Promise.all(
    [...arquivos].map((u) =>
      cache.match(u).then((ja) => ja || fetch(u).then((r) => r.ok && cache.put(u, r)).catch(() => {}))
    )
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(preparar().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) => Promise.all(chaves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

// Rede primeiro; se falhar, a cópia salva. Guarda a resposta nova com a chave dada.
function redePrimeiro(req, chave, opcoes) {
  return fetch(req)
    .then((resp) => {
      if (resp.ok && !resp.redirected) {
        const copia = resp.clone();
        caches.open(CACHE).then((c) => c.put(chave, copia));
      }
      return resp;
    })
    .catch(() => caches.match(chave, opcoes).then((salvo) => salvo || Promise.reject(new Error("offline"))));
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // outros sites passam direto

  // Código, fontes e ícones: cache primeiro.
  if (/^\/(_next\/static|icons|fontes)\//.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (salvo) =>
          salvo ||
          fetch(req).then((resp) => {
            if (resp.ok) {
              const copia = resp.clone();
              caches.open(CACHE).then((c) => c.put(req, copia));
            }
            return resp;
          })
      )
    );
    return;
  }

  // Abrir uma página (link, recarregar, ícone da tela inicial).
  if (req.mode === "navigate") {
    event.respondWith(
      redePrimeiro(req, url.pathname, { ignoreSearch: true }).catch(() => caches.match("/").then((r) => r || Response.error()))
    );
    return;
  }

  // Dados da troca de tela do Next (cabeçalho RSC). Pré-carregamento e tela completa ficam separados.
  if (req.headers.get("RSC") === "1") {
    // Chave num caminho próprio, para nunca ser confundida com o HTML da página.
    const chave = `/__rsc${req.headers.get("Next-Router-Prefetch") ? "-pre" : ""}${url.pathname}`;
    // Sem cópia offline, o erro faz o Next abrir a página inteira, que vem do cache.
    event.respondWith(redePrimeiro(req, chave).catch(() => Response.error()));
    return;
  }

  // Resto do mesmo site (manifesto, ícone da aba): cache, atualizando em segundo plano.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((salvo) => {
      const rede = fetch(req)
        .then((resp) => {
          if (resp.ok) {
            const copia = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
          }
          return resp;
        })
        .catch(() => salvo || Response.error());
      return salvo || rede;
    })
  );
});
