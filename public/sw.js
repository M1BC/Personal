// Service worker do app: deixa abrir mais rápido e mostra a última versão vista quando a internet cai.
// Páginas: rede primeiro (sempre a versão nova quando há conexão). Arquivos estáticos: cache primeiro.
const CACHE = "bgs-v1"; // trocar o nome apaga o cache antigo (ícones e fontes novos)

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((chaves) => Promise.all(chaves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase e outros serviços passam direto
  if (url.pathname.startsWith("/auth") || url.pathname.startsWith("/api")) return;

  if (/^\/(_next\/static|icons|fontes|marca)\//.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (salvo) =>
          salvo ||
          fetch(req).then((resp) => {
            const copia = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
            return resp;
          })
      )
    );
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          if (resp.ok && !resp.redirected) {
            const copia = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
          }
          return resp;
        })
        .catch(() => caches.match(req).then((salvo) => salvo || caches.match("/")))
    );
  }
});
