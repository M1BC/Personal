"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EXERCICIOS } from "@/data/exercicios";
import { FREQUENCIAS, OBJETIVOS, PONTOS_FRACOS, type Freq, type ObjetivoId } from "@/data/treinos";
import { useHistoricoTreinos } from "@/hooks/useHistoricoTreinos";
import {
  chaveDoDia, chaveRascunho, lerRascunhos, limparRascunho, novoId, salvarRascunho, ultimaVez,
  type ExercicioRegistro, type SerieRegistro, type TreinoRegistrado,
} from "@/lib/historico";
import { montarFicha, type DiaFicha } from "@/lib/treino";
import type { GrupoMuscular } from "@/lib/types";

const CAMPO = "min-h-[48px] w-full bg-fundo px-3 text-lg font-bold tabular-nums text-tinta";

interface Parametros { freq: Freq; obj: ObjetivoId; grupo: GrupoMuscular; d: number }

function lerParametros(p: { get(nome: string): string | null }): Parametros | null {
  const f = Number(p.get("f"));
  const d = Number(p.get("d"));
  const freq = FREQUENCIAS.find((x) => x === f);
  const obj = OBJETIVOS.find((x) => x.id === p.get("o"))?.id;
  const grupo = PONTOS_FRACOS.find((x) => x.id === p.get("g"))?.id;
  if (!freq || !obj || !grupo || !Number.isInteger(d) || d < 0) return null;
  return { freq, obj, grupo, d };
}

function Invalido({ mensagem }: { mensagem: string }) {
  return (
    <div>
      <p className="max-w-[62ch] border-l-4 border-primario bg-superficie p-6 text-xl">{mensagem}</p>
      <Link href="/treinos" className="btn mt-4">Voltar para Treinos</Link>
    </div>
  );
}

export function TreinoAtivo() {
  const params = useSearchParams();
  const parametros = params ? lerParametros(params) : null;
  if (!parametros) return <Invalido mensagem="Não encontramos esse treino. Volte para Treinos e inicie a ficha novamente." />;

  const r = montarFicha(parametros.freq, parametros.obj, parametros.grupo);
  if ("erro" in r) return <Invalido mensagem={r.erro} />;
  const dia = r.ficha.dias[parametros.d];
  if (!dia) return <Invalido mensagem="Esse dia não existe nesta ficha. Volte para Treinos e inicie a ficha novamente." />;

  return <Sessao key={chaveRascunho(parametros.freq, parametros.obj, parametros.grupo, parametros.d)} parametros={parametros} dia={dia} ficha={r.ficha.titulo} />;
}

type Linha = { peso: string; reps: string };

function Sessao({ parametros, dia, ficha }: { parametros: Parametros; dia: DiaFicha; ficha: string }) {
  const { freq, obj, grupo, d } = parametros;
  const chave = chaveRascunho(freq, obj, grupo, d);
  const router = useRouter();
  const { treinos, adicionar } = useHistoricoTreinos();
  const [valores, setValores] = useState<Record<string, Linha[]>>({});
  const [concluidos, setConcluidos] = useState<Record<string, boolean>>({});
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState("");

  // Recupera o rascunho deste treino, se houver.
  useEffect(() => {
    const salvo = lerRascunhos()[chave];
    if (salvo) {
      setValores(salvo.valores ?? {});
      setConcluidos(salvo.concluidos ?? {});
    }
    setPronto(true);
  }, [chave]);

  // Salva o rascunho automaticamente a cada mudança.
  useEffect(() => {
    if (!pronto) return;
    const temAlgo =
      Object.values(valores).some((ls) => ls.some((s) => s.peso !== "" || s.reps !== "")) || Object.values(concluidos).some(Boolean);
    if (!temAlgo) {
      limparRascunho(chave);
      return;
    }
    salvarRascunho(chave, {
      f: freq, o: obj, g: grupo, d, titulo: dia.titulo, diaPlanejado: dia.dia,
      atualizadoEm: new Date().toISOString(), valores, concluidos,
    });
  }, [valores, concluidos, pronto, chave, freq, obj, grupo, d, dia.titulo, dia.dia]);

  const mudar = (id: string, i: number, campo: "peso" | "reps", valor: string, sets: number) => {
    setValores((atual) => {
      const linhas: Linha[] = Array.from({ length: sets }, (_, k) => atual[id]?.[k] ?? { peso: "", reps: "" });
      linhas[i] = { ...linhas[i], [campo]: valor };
      return { ...atual, [id]: linhas };
    });
  };

  const finalizar = () => {
    setErro("");
    const exercicios: ExercicioRegistro[] = [];
    for (const it of dia.itens) {
      const e = EXERCICIOS.find((x) => x.id === it.id);
      if (!e) continue;
      const linhas = valores[it.id] ?? [];
      const series: SerieRegistro[] = [];
      for (let k = 0; k < it.sets; k++) {
        const l = linhas[k] ?? { peso: "", reps: "" };
        if (l.peso.trim() === "" && l.reps.trim() === "") continue;
        const peso = l.peso.trim() === "" ? null : Number(l.peso.replace(",", "."));
        const reps = l.reps.trim() === "" ? null : Number(l.reps.replace(",", "."));
        const invalido = (n: number | null) => n !== null && (!Number.isFinite(n) || n < 0 || n > 1000);
        if (invalido(peso) || invalido(reps)) {
          setErro(`Confira os valores de ${e.nome}, série ${k + 1}.`);
          return;
        }
        series.push({ peso, reps });
      }
      const concluido = !!concluidos[it.id];
      if (series.length > 0 || concluido) exercicios.push({ id: it.id, nome: e.nome, unidade: it.unidade, concluido, series });
    }
    if (exercicios.length === 0) {
      setErro("Preencha pelo menos uma série ou marque um exercício como concluído.");
      return;
    }
    const agora = new Date();
    const treino: TreinoRegistrado = {
      id: novoId(), data: agora.toISOString(), dia: chaveDoDia(agora), nome: dia.titulo,
      diaPlanejado: dia.dia, objetivo: obj, freq, exercicios,
    };
    if (!adicionar(treino)) {
      setErro("Não foi possível salvar no navegador (o armazenamento pode estar desativado ou cheio). Seu rascunho continua aqui.");
      return;
    }
    limparRascunho(chave);
    router.push("/historico");
  };

  const descartar = () => {
    if (!window.confirm("Descartar este treino? Os dados digitados serão perdidos.")) return;
    limparRascunho(chave);
    router.push("/treinos");
  };

  const feitos = dia.itens.filter((it) => concluidos[it.id]).length;

  return (
    <div>
      <Link href="/treinos" className="inline-flex min-h-[48px] items-center underline underline-offset-4">← Voltar às fichas</Link>
      <h2 className="mt-2 text-4xl font-extrabold leading-none tracking-tight">{dia.dia} · {dia.titulo}</h2>
      <p className="mt-2 text-base text-suave">{ficha}</p>
      <p className="mt-1 text-lg font-semibold" aria-live="polite">{feitos} de {dia.itens.length} exercícios concluídos</p>

      <ol className="mt-6 grid gap-4 lg:grid-cols-2">
        {dia.itens.map((it) => {
          const e = EXERCICIOS.find((x) => x.id === it.id);
          if (!e) return null;
          const feito = !!concluidos[it.id];
          const ultima = ultimaVez(treinos, it.id);
          const rotuloReps = it.unidade === "segundos" ? "Tempo (s)" : "Repetições";
          return (
            <li key={it.id} className="bg-superficie p-5">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-2xl font-extrabold leading-tight">{e.nome}</h3>
                  <p className="text-base">{it.series}{it.lado && it.unidade === "segundos" ? "" : it.lado ? ` (${it.lado})` : ""}</p>
                  <p className="text-base text-suave">Descanso: {it.descanso}</p>
                  {ultima && <p className="text-base text-suave">Última vez: {ultima}</p>}
                </div>
                <button
                  aria-pressed={feito}
                  aria-label={`Marcar ${e.nome} como concluído`}
                  onClick={() => setConcluidos((a) => ({ ...a, [it.id]: !a[it.id] }))}
                  className={`min-h-[48px] min-w-[48px] border-2 border-tinta text-xl font-bold transition-transform duration-100 ease-out active:scale-[0.95] ${feito ? "bg-tinta text-fundo" : "hover:bg-tinta hover:text-fundo"}`}
                >
                  ✓
                </button>
              </div>
              <div className="mt-3 grid grid-cols-[4.5rem_1fr_1fr] gap-2 text-base text-suave">
                <span />
                <span>Peso (kg)</span>
                <span>{rotuloReps}</span>
              </div>
              <div className="mt-1 grid gap-2">
                {Array.from({ length: it.sets }, (_, k) => {
                  const v = valores[it.id]?.[k] ?? { peso: "", reps: "" };
                  return (
                    <div key={k} className="grid grid-cols-[4.5rem_1fr_1fr] items-center gap-2">
                      <span className="text-base font-semibold">Série {k + 1}</span>
                      <input
                        type="number" inputMode="decimal" min={0} step="0.5" placeholder="kg" value={v.peso}
                        aria-label={`Peso em kg da série ${k + 1} de ${e.nome}`}
                        onChange={(ev) => mudar(it.id, k, "peso", ev.target.value, it.sets)}
                        className={CAMPO}
                      />
                      <input
                        type="number" inputMode="numeric" min={0} placeholder={it.repsAlvo} value={v.reps}
                        aria-label={`${rotuloReps} da série ${k + 1} de ${e.nome}`}
                        onChange={(ev) => mudar(it.id, k, "reps", ev.target.value, it.sets)}
                        className={CAMPO}
                      />
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-6 min-h-[1.5rem] font-semibold text-primario" aria-live="polite">{erro}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2">
        <button onClick={finalizar} className="btn">Finalizar Treino</button>
        <button onClick={descartar} className="min-h-[48px] underline underline-offset-4">Descartar treino</button>
      </div>
      <p className="mt-4 max-w-[70ch] text-base text-suave">
        Os registros ficam salvos só neste navegador. Deixe em branco o peso de exercícios sem carga, como a prancha.
      </p>
    </div>
  );
}
