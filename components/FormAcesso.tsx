"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { listarUnidades, nomeUnidade, type Unidade } from "@/lib/equipe";
import { criarCliente } from "@/lib/supabase/client";

const ERROS: [RegExp, string][] = [
  [/invalid login credentials/i, "E-mail ou senha incorretos."],
  [/email not confirmed/i, "Confirme seu e-mail pelo link que enviamos antes de entrar."],
  [/already registered|already exists/i, "Este e-mail já tem conta. Entre com sua senha."],
  [/password should be at least|weak password/i, "A senha precisa de pelo menos 6 caracteres."],
  [/rate limit|too many/i, "Muitas tentativas seguidas. Espere um minuto e tente de novo."],
  [/invalid email|unable to validate email/i, "Confira o e-mail digitado."],
  [/failed to fetch|network/i, "Sem conexão com a internet. Tente de novo."],
];
const traduzir = (msg: string) => ERROS.find(([re]) => re.test(msg))?.[1] ?? "Não deu certo. Tente de novo.";

// Só aceita voltar para uma página interna do app.
function destino() {
  const v = new URLSearchParams(window.location.search).get("voltar");
  return v && v.startsWith("/") && !v.startsWith("//") ? v : "/";
}

const INPUT = "mt-1 min-h-[48px] w-full bg-superficie px-4 text-lg";

export function FormAcesso({ modo }: { modo: "entrar" | "cadastrar" }) {
  const cadastro = modo === "cadastrar";
  const [nome, setNome] = useState("");
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [unidade, setUnidade] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (cadastro) listarUnidades().then(setUnidades).catch(() => setUnidades([]));
  }, [cadastro]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro("");
    if (cadastro && !nome.trim()) return setErro("Digite seu nome.");
    if (!email || !senha) return setErro("Preencha o e-mail e a senha.");
    if (cadastro && unidades.length > 0 && !unidade) return setErro("Escolha a unidade onde você treina.");
    if (cadastro && senha !== confirma) return setErro("As duas senhas não são iguais.");
    setEnviando(true);
    const supabase = criarCliente();
    try {
      if (cadastro) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: { nome: nome.trim(), unidade_id: unidade || null } },
        });
        if (error) throw error;
        // Se o projeto exige confirmação por e-mail, não vem sessão: avisa e espera o link.
        if (!data.session) {
          setAviso(`Enviamos um link de confirmação para ${email}. Abra o e-mail e toque no link para entrar.`);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
      }
      window.location.assign(destino());
    } catch (err) {
      setErro(traduzir(err instanceof Error ? err.message : String(err)));
    } finally {
      setEnviando(false);
    }
  }

  if (aviso) {
    return (
      <div className="max-w-md">
        <p className="text-xl leading-relaxed">{aviso}</p>
        <Link href="/login" className="btn mt-8">Ir para o login</Link>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="max-w-md" noValidate>
      {cadastro && (
        <>
          <label htmlFor="nome" className="block text-lg font-semibold">Nome</label>
          <input
            id="nome"
            name="nome"
            autoComplete="name"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={`${INPUT} mb-5`}
          />
          {unidades.length > 0 && (
            <>
              <label htmlFor="unidade" className="block text-lg font-semibold">Unidade onde você treina</label>
              <select id="unidade" name="unidade" required value={unidade} onChange={(e) => setUnidade(e.target.value)} className={`${INPUT} mb-5`}>
                <option value="" disabled>Escolha a unidade</option>
                {unidades.map((u) => <option key={u.id} value={u.id}>{nomeUnidade(u)}</option>)}
              </select>
            </>
          )}
        </>
      )}
      <label htmlFor="email" className="block text-lg font-semibold">E-mail</label>
      <input
        id="email"
        name="email"
        type="email"
        spellCheck={false}
        autoCapitalize="none"
        autoComplete="email"
        inputMode="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value.trim())}
        className={INPUT}
      />

      <label htmlFor="senha" className="mt-5 block text-lg font-semibold">Senha</label>
      <input
        id="senha"
        name="senha"
        type="password"
        autoComplete={cadastro ? "new-password" : "current-password"}
        required
        minLength={6}
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        className={INPUT}
      />
      {cadastro && <p className="mt-1 text-base text-suave">Pelo menos 6 caracteres.</p>}

      {cadastro && (
        <>
          <label htmlFor="confirma" className="mt-5 block text-lg font-semibold">Repita a senha</label>
          <input
            id="confirma"
            name="confirma"
            type="password"
            autoComplete="new-password"
            required
            value={confirma}
            onChange={(e) => setConfirma(e.target.value)}
            className={INPUT}
          />
        </>
      )}

      <p role="alert" className="mt-4 min-h-[1.75rem] text-lg font-semibold text-alerta">{erro}</p>

      <button type="submit" disabled={enviando} className="btn mt-2 w-full disabled:opacity-60">
        {enviando ? "Aguarde…" : cadastro ? "Criar conta" : "Entrar"}
      </button>

      <p className="mt-6 text-lg">
        {cadastro ? "Já tem conta? " : "Ainda não tem conta? "}
        <Link href={cadastro ? "/login" : "/cadastro"} className="font-bold underline underline-offset-4">
          {cadastro ? "Entrar" : "Criar conta"}
        </Link>
      </p>
    </form>
  );
}
