import { createBrowserClient } from "@supabase/ssr";

// Cliente do Supabase usado nos componentes do navegador.
export const criarCliente = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
