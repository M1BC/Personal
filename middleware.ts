import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieNovo = { name: string; value: string; options: CookieOptions };

// Páginas abertas sem login. Todo o resto exige estar logado.
const PUBLICAS = ["/login", "/cadastro", "/auth"];

export async function middleware(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (lista: CookieNovo[]) => {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => resposta.cookies.set(name, value, options));
      },
    },
  });

  // getUser() valida a sessão no Supabase e renova o token quando precisa.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const caminho = request.nextUrl.pathname;
  const publica = PUBLICAS.some((p) => caminho === p || caminho.startsWith(`${p}/`));

  if (!user && !publica) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = caminho !== "/" ? `?voltar=${encodeURIComponent(caminho)}` : "";
    return NextResponse.redirect(url);
  }
  if (user && (caminho === "/login" || caminho === "/cadastro")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return resposta;
}

export const config = {
  // Arquivos estáticos, ícones, fontes, logo, manifest, service worker e o arquivo de vínculo com a Play Store
  // (/.well-known/assetlinks.json) ficam fora da proteção.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|icons/|fontes/|marca/|\\.well-known/|sw.js|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff2?)$).*)",
  ],
};
