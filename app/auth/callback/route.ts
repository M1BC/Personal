import { NextResponse } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";

// Link do e-mail de confirmação de cadastro cai aqui: troca o código pela sessão e entra no app.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const codigo = searchParams.get("code");
  if (codigo) {
    const { error } = await criarClienteServidor().auth.exchangeCodeForSession(codigo);
    if (!error) return NextResponse.redirect(`${origin}/anatomia`);
  }
  return NextResponse.redirect(`${origin}/login?erro=link`);
}
