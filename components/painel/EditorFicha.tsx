"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EXERCICIOS } from "@/data/exercicios";
import { FREQUENCIAS, NIVEIS, OBJETIVOS, PONTOS_FRACOS, type Freq, type Nivel, type ObjetivoId } from "@/data/treinos";
import { EditorDias } from "@/components/EditorDias";
import { FICHA_VAZIA, apagarFicha, lerFicha, nomeOuEmail, salvarFicha, type FichaTreinador, type Perfil } from "@/lib/equipe";
import { criarCliente } from "@/lib/supabase/client";
import { montarFicha } from "@/lib/treino";
import type { GrupoMuscular } from "@/lib/types";

const INPUT = "mt-1 min-h-[3rem] w-full bg-fundo px-3 text-base";
const ROTULO = "block text-base font-semibold";
const BTN_TEXTO = "min-h-[3rem] font-bold underline underline-offset-4";
const GERAVEIS = OBJETIVOS.filter((o): o is Extract<(typeof OBJETIVOS)[number], { id: ObjetivoId }> => o.id !== "criar");

export function EditorFicha({ alunoId }: { alunoId: string }) {
  const [aluno, setAluno] = useState<Perfil | null>(null);
  const [ficha, setFicha] = useState<FichaTreinador>(FICHA_VAZIA);
  const [existe, setExiste] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [mudou, setMudou] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [status, setStatus] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  // Gerador de ponto de partida
  const [freq, setFreq] = useState<Freq>(3);
  const [obj, setObj] = useState<ObjetivoId>("saude");
  const [grupo, setGrupo] = useState<GrupoMuscular>("peitoral");
  const [nivel, setNivel] = useState<Nivel>("intermediario");

  useEffect(() => {
    (async () => {
      const supabase = criarCliente();
      const [p, f] = await Promise.all([
        supabase.from("perfis").select("*").eq("id", alunoId).maybeSingle(),
        supabase.from("fichas").select("conteudo").eq("aluno_id", alunoId).maybeSingle(),
      ]);
      setAluno((p.data as Perfil | null) ?? null);
      if (f.data) {
        setFicha(lerFicha(f.data.conteudo));
        setExiste(true);
      }
      setCarregando(false);
    })();
  }, [alunoId]);

  // Avisa antes de sair com alterações não salvas.
  useEffect(() => {
    if (!mudou) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [mudou]);

  const alterar = (nova: FichaTreinador) => {
    setFicha(nova);
    setMudou(true);
    setStatus(null);
  };
  function gerar() {
    if (ficha.dias.length > 0 && !window.confirm("Isso substitui os dias e exercícios atuais pela ficha automática. Continuar?")) return;
    const r = montarFicha(freq, obj, grupo, "novo", nivel);
    if ("erro" in r) return setStatus({ tipo: "erro", texto: r.erro });
    alterar({
      titulo: ficha.titulo || r.ficha.titulo,
      observacoes: ficha.observacoes || r.ficha.justificativa,
      dias: r.ficha.dias.map((d) => ({ dia: d.dia, titulo: d.titulo, itens: d.itens.map((i) => ({ ...i, obs: i.obs ?? "" })) })),
    });
  }

  async function salvar() {
    const limpa: FichaTreinador = {
      titulo: ficha.titulo.trim(),
      observacoes: ficha.observacoes.trim(),
      dias: ficha.dias
        .map((d) => ({ ...d, dia: d.dia.trim(), titulo: d.titulo.trim(), itens: d.itens.filter((i) => EXERCICIOS.some((e) => e.id === i.id)) }))
        .filter((d) => d.itens.length > 0),
    };
    if (limpa.dias.length === 0) return setStatus({ tipo: "erro", texto: "Adicione pelo menos um dia com um exercício antes de salvar." });
    setSalvando(true);
    try {
      await salvarFicha(alunoId, limpa);
      setFicha(limpa);
      setExiste(true);
      setMudou(false);
      setStatus({ tipo: "ok", texto: "Ficha salva. O aluno já vê a nova versão na tela Treinos." });
    } catch {
      setStatus({ tipo: "erro", texto: "Não foi possível salvar. Confira a internet e tente de novo." });
    } finally {
      setSalvando(false);
    }
  }

  async function apagar() {
    if (!window.confirm("Apagar a ficha deste aluno? Ele volta a ver só a ficha automática.")) return;
    try {
      await apagarFicha(alunoId);
      setFicha(FICHA_VAZIA);
      setExiste(false);
      setMudou(false);
      setStatus({ tipo: "ok", texto: "Ficha apagada." });
    } catch {
      setStatus({ tipo: "erro", texto: "Não foi possível apagar. Tente de novo." });
    }
  }

  if (carregando) return <p className="text-lg text-suave">Carregando…</p>;
  if (!aluno)
    return (
      <div>
        <p className="text-xl">Aluno não encontrado.</p>
        <Link href="/painel" className={BTN_TEXTO}>← Voltar para a lista</Link>
      </div>
    );

  return (
    <div>
      <Link href="/painel" className={`${BTN_TEXTO} inline-flex items-center text-suave`}>← Todos os alunos</Link>
      <h1 className="mt-4 text-[clamp(2.25rem,6vw,4rem)] font-extrabold leading-[0.95]">{nomeOuEmail(aluno)}</h1>
      {aluno.nome.trim() && <p className="mt-2 text-lg text-suave">{aluno.email}</p>}

      {/* Ponto de partida */}
      <div className="mt-10 border-l-4 border-primario bg-superficie p-5 md:p-6">
        <p className="text-xl font-extrabold">{existe || ficha.dias.length ? "Recomeçar da ficha automática" : "Começar pela ficha automática"}</p>
        <p className="mt-1 max-w-[60ch] text-base text-suave">Gera a divisão, os exercícios e as séries pelo objetivo. Depois é só ajustar.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className={ROTULO}>
            Frequência
            <select value={freq} onChange={(e) => setFreq(Number(e.target.value) as Freq)} className={INPUT}>
              {FREQUENCIAS.map((f) => <option key={f} value={f}>{f}x por semana</option>)}
            </select>
          </label>
          <label className={ROTULO}>
            Objetivo
            <select value={obj} onChange={(e) => setObj(e.target.value as ObjetivoId)} className={INPUT}>
              {GERAVEIS.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
            </select>
          </label>
          {obj === "hipertrofia" && (
            <label className={ROTULO}>
              Nível
              <select value={nivel} onChange={(e) => setNivel(e.target.value as Nivel)} className={INPUT}>
                {NIVEIS.map((n) => <option key={n.id} value={n.id}>{n.nome}</option>)}
              </select>
            </label>
          )}
          {obj === "fraco" && (
            <label className={ROTULO}>
              Músculo
              <select value={grupo} onChange={(e) => setGrupo(e.target.value as GrupoMuscular)} className={INPUT}>
                {PONTOS_FRACOS.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </label>
          )}
        </div>
        <button onClick={gerar} className="btn mt-4">Gerar ficha</button>
      </div>

      <div className="mt-10">
        <EditorDias
          ficha={ficha}
          onMudar={alterar}
          rotuloObs="Observações para o aluno"
          placeholderObs="Ex.: aquecer 10 minutos na esteira antes. Usar esta ficha por 6 semanas."
        />
      </div>

      {existe && (
        <div className="mt-12">
          <button onClick={apagar} className={`${BTN_TEXTO} text-alerta`}>Apagar a ficha deste aluno</button>
        </div>
      )}

      {/* Barra de salvar */}
      <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] z-20 border-t border-linha bg-fundo/95 backdrop-blur-md md:bottom-0 md:pb-[env(safe-area-inset-bottom,0px)]">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 md:px-8">
          <p role="status" className={`min-w-0 flex-1 text-base font-semibold ${status?.tipo === "erro" ? "text-alerta" : status ? "" : "text-suave"}`}>
            {status?.texto ?? (mudou ? "Alterações não salvas" : existe ? "Tudo salvo" : "Ficha ainda não criada")}
          </p>
          <button onClick={salvar} disabled={salvando || !mudou} className="btn disabled:opacity-40">
            {salvando ? "Salvando…" : "Salvar ficha"}
          </button>
        </div>
      </div>
    </div>
  );
}
