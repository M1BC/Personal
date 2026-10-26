"use client";
import { useEffect, useState } from "react";
import { EXERCICIOS } from "@/data/exercicios";
import { NIVEIS, OBJETIVOS, PONTOS_FRACOS, type Freq, type Nivel, type ObjetivoId } from "@/data/treinos";
import { FICHA_VAZIA, lerFicha, type FichaTreinador } from "@/lib/equipe";
import { carregarDados, salvarDado } from "@/lib/nuvem";
import { montarFicha } from "@/lib/treino";
import type { GrupoMuscular } from "@/lib/types";
import { DiasFicha } from "./DiasFicha";
import { EditorDias, NOVO_ITEM } from "./EditorDias";

const INPUT = "mt-1 min-h-[48px] w-full bg-fundo px-3 text-base";
const ROTULO = "block text-base font-semibold";
const GERAVEIS = OBJETIVOS.filter((o): o is Extract<(typeof OBJETIVOS)[number], { id: ObjetivoId }> => o.id !== "criar");

type Props = {
  freq: Freq;
  som: boolean;
  timerAtivo: string | null;
  onIniciarTimer: (id: string) => void;
  onExplicar: (id: string) => void;
};

// Aba "Criar": a pessoa monta a própria ficha (dias, exercícios, séries e descanso). Fica salva na conta.
export function MeuTreino({ freq, som, timerAtivo, onIniciarTimer, onExplicar }: Props) {
  const [ficha, setFicha] = useState<FichaTreinador>(FICHA_VAZIA);
  const [carregado, setCarregado] = useState(false);
  const [editando, setEditando] = useState(false);
  const [mudou, setMudou] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [base, setBase] = useState<ObjetivoId>("hipertrofia");
  const [nivel, setNivel] = useState<Nivel>("iniciante");
  const [grupo, setGrupo] = useState<GrupoMuscular>("ombros");

  useEffect(() => {
    carregarDados().then((d) => {
      const f = lerFicha(d.meuTreino);
      setFicha(f);
      setEditando(f.dias.length === 0);
      setCarregado(true);
    });
  }, []);

  // Avisa antes de sair com alterações não salvas.
  useEffect(() => {
    if (!mudou) return;
    const segurar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", segurar);
    return () => window.removeEventListener("beforeunload", segurar);
  }, [mudou]);

  const alterar = (f: FichaTreinador) => {
    setFicha(f);
    setMudou(true);
    setAviso(null);
  };

  function salvar() {
    const limpa: FichaTreinador = {
      titulo: ficha.titulo.trim(),
      observacoes: ficha.observacoes.trim(),
      dias: ficha.dias
        .map((d) => ({ ...d, dia: d.dia.trim(), titulo: d.titulo.trim(), itens: d.itens.filter((i) => EXERCICIOS.some((e) => e.id === i.id)) }))
        .filter((d) => d.itens.length > 0),
    };
    if (limpa.dias.length === 0) return setAviso("Adicione pelo menos um dia com um exercício antes de salvar.");
    salvarDado("meuTreino", limpa);
    setFicha(limpa);
    setMudou(false);
    setEditando(false);
    setAviso("Treino salvo na sua conta.");
  }

  function partirDe() {
    if (ficha.dias.length > 0 && !window.confirm("Isso substitui os dias e exercícios atuais. Continuar?")) return;
    const r = montarFicha(freq, base, grupo, "novo", nivel);
    if ("erro" in r) return setAviso(r.erro);
    alterar({
      titulo: ficha.titulo || "Meu treino",
      observacoes: ficha.observacoes,
      dias: r.ficha.dias.map((d) => ({ dia: d.dia, titulo: d.titulo, itens: d.itens.map((i) => ({ ...i, obs: i.obs ?? "" })) })),
    });
  }

  function apagar() {
    if (!window.confirm("Apagar o seu treino? Esta ação não pode ser desfeita.")) return;
    salvarDado("meuTreino", FICHA_VAZIA);
    setFicha(FICHA_VAZIA);
    setMudou(false);
    setEditando(true);
    setAviso("Treino apagado.");
  }

  if (!carregado) return <p className="mt-10 text-lg text-suave">Carregando…</p>;

  return (
    <div className="animar mt-10">
      <h2 className="text-4xl font-extrabold leading-none">{ficha.titulo || "Meu treino"}</h2>
      <p className="mt-3 max-w-[70ch] text-lg text-suave">
        Monte o seu treino do seu jeito: escolha os dias, os exercícios (por músculo, inclusive cardio), as séries e o descanso.
        Tocando em “?” você vê como cada exercício trabalha o corpo; a animação de cada um está na aba Anatomia.
      </p>

      {!editando ? (
        <>
          {ficha.observacoes && <p className="mt-4 max-w-[70ch] whitespace-pre-line border-l-4 border-secundario bg-superficie p-4 text-lg">{ficha.observacoes}</p>}
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            <button onClick={() => setEditando(true)} className="btn">Editar treino</button>
            <button onClick={apagar} className="min-h-[48px] font-bold text-alerta underline underline-offset-4">Apagar</button>
          </div>
          <p role="status" className="mt-3 min-h-[1.5rem] text-base font-semibold">{aviso}</p>
          <DiasFicha dias={ficha.dias} prefixo="meu" som={som} timerAtivo={timerAtivo} onIniciarTimer={onIniciarTimer} onExplicar={onExplicar} />
        </>
      ) : (
        <>
          <div className="mt-6 border-l-4 border-primario bg-superficie p-5 md:p-6">
            <p className="text-xl font-extrabold">Começar de um modelo (opcional)</p>
            <p className="mt-1 max-w-[60ch] text-base text-suave">
              Copia uma ficha automática ({freq}x por semana, a frequência escolhida acima) para você ajustar. Ou comece do zero logo abaixo.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className={ROTULO}>
                Modelo
                <select value={base} onChange={(e) => setBase(e.target.value as ObjetivoId)} className={INPUT}>
                  {GERAVEIS.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
                </select>
              </label>
              {base === "hipertrofia" && (
                <label className={ROTULO}>
                  Nível
                  <select value={nivel} onChange={(e) => setNivel(e.target.value as Nivel)} className={INPUT}>
                    {NIVEIS.map((n) => <option key={n.id} value={n.id}>{n.nome}</option>)}
                  </select>
                </label>
              )}
              {base === "fraco" && (
                <label className={ROTULO}>
                  Músculo
                  <select value={grupo} onChange={(e) => setGrupo(e.target.value as GrupoMuscular)} className={INPUT}>
                    {PONTOS_FRACOS.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </label>
              )}
            </div>
            <button onClick={partirDe} className="btn mt-4">Usar este modelo</button>
          </div>

          <div className="mt-8">
            <EditorDias ficha={ficha} onMudar={alterar} rotuloObs="Anotações" placeholderObs="Ex.: aumentar a carga do agachamento a cada 2 semanas." />
            {ficha.dias.length === 0 && (
              <button
                onClick={() => alterar({ ...ficha, dias: [{ dia: "Segunda-feira", titulo: "Treino A", itens: [{ ...NOVO_ITEM }] }] })}
                className="btn mt-4"
              >
                Começar do zero
              </button>
            )}
          </div>

          {/* Barra de salvar */}
          <div className="fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom,0px))] z-20 border-t border-linha bg-fundo/95 backdrop-blur-md md:bottom-0 md:pb-[env(safe-area-inset-bottom,0px)]">
            <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3 md:px-8">
              <p role="status" className={`min-w-0 flex-1 text-base font-semibold ${aviso && !aviso.startsWith("Treino") ? "text-alerta" : "text-suave"}`}>
                {aviso ?? (mudou ? "Alterações não salvas" : "Nada alterado")}
              </p>
              {ficha.dias.length > 0 && !mudou && (
                <button onClick={() => setEditando(false)} className="min-h-[48px] font-bold underline underline-offset-4">Ver treino</button>
              )}
              <button onClick={salvar} disabled={!mudou} className="btn disabled:opacity-40">Salvar treino</button>
            </div>
          </div>
          <div className="h-24" aria-hidden="true" />
        </>
      )}
    </div>
  );
}
