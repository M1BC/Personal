"use client";
import { useCallback, useRef, useState } from "react";
import { CATEGORIAS, EXERCICIOS, GRUPOS, categoriaDoExercicio, type Categoria } from "@/data/exercicios";
import { combina } from "@/lib/busca";
import type { GrupoMuscular } from "@/lib/types";
import { Boneco, temAnimacao } from "./Boneco";
import { Corpo } from "./Corpo";
import { ModalGrupo } from "./ModalGrupo";

type Grupo = Exclude<Categoria, "Todos">;
const GRUPOS_CARD = CATEGORIAS.filter((c): c is Grupo => c !== "Todos");
const contar = (g: Grupo) => EXERCICIOS.filter((e) => categoriaDoExercicio(e) === g).length;

export function ExplorerExercicios() {
  const [grupo, setGrupo] = useState<Grupo>("Peito");
  const [busca, setBusca] = useState("");
  const [id, setId] = useState(EXERCICIOS[0].id);
  const [aberto, setAberto] = useState<GrupoMuscular | null>(null);
  const detalhe = useRef<HTMLDivElement>(null);
  const fechar = useCallback(() => setAberto(null), []);

  const buscando = busca.trim() !== "";
  const lista = buscando
    ? EXERCICIOS.filter((e) => combina(`${e.nome} ${e.equipamento} ${GRUPOS[e.grupo_primario].nome}`, busca))
    : EXERCICIOS.filter((e) => categoriaDoExercicio(e) === grupo);
  const ex = EXERCICIOS.find((e) => e.id === id) ?? lista[0];

  function escolherGrupo(g: Grupo) {
    setGrupo(g);
    setBusca("");
    const primeiro = EXERCICIOS.find((e) => categoriaDoExercicio(e) === g);
    if (primeiro) setId(primeiro.id);
  }

  function escolher(novo: string) {
    setId(novo);
    // No celular a ficha do exercício fica abaixo da lista: leva até ela.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      detalhe.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  }

  return (
    <div>
      {/* 1. Grupo muscular */}
      <p className="text-lg font-semibold">Escolha o grupo muscular</p>
      <div role="group" aria-label="Grupo muscular" className="mt-2 grid grid-cols-2 gap-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-5">
        {GRUPOS_CARD.map((g) => {
          const ativo = !buscando && g === grupo;
          return (
            <button
              key={g}
              aria-pressed={ativo}
              onClick={() => escolherGrupo(g)}
              className="opcao flex min-h-[4.5rem] min-w-0 flex-col justify-between gap-1 p-3 text-left"
            >
              <span className="font-titulo text-[1.1875rem] font-extrabold leading-none md:text-2xl">{g}</span>
              <span className="text-sm text-suave">{contar(g)} exercícios</span>
            </button>
          );
        })}
      </div>

      <label htmlFor="busca-exercicio" className="mt-6 block text-lg font-semibold">Ou busque pelo nome</label>
      <input
        id="busca-exercicio"
        type="search"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Ex.: rosca, agachamento, polia"
        className="mt-1 min-h-[3rem] w-full max-w-md bg-superficie px-4 text-lg"
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
        {/* 2. Lista do grupo */}
        <div>
          <p className="text-base text-suave" aria-live="polite">
            {buscando ? `${lista.length} ${lista.length === 1 ? "resultado" : "resultados"} para "${busca.trim()}"` : `${grupo} · ${lista.length} exercícios`}
          </p>
          <ul role="list" className="mt-2 divide-y divide-linha border-y border-linha lg:max-h-[70vh] lg:overflow-y-auto lg:overscroll-contain">
            {lista.map((e) => {
              const ativo = e.id === ex?.id;
              return (
                <li key={e.id}>
                  <button
                    aria-pressed={ativo}
                    onClick={() => escolher(e.id)}
                    className={`flex min-h-[3.75rem] w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors duration-100 ${
                      ativo ? "bg-primario/15 shadow-[inset_4px_0_0_rgb(var(--primario))]" : "hover:bg-superficie"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block font-bold leading-tight">{e.nome}</span>
                      <span className="block text-sm text-suave">
                        {buscando ? `${e.cardio ? "Cardio" : GRUPOS[e.grupo_primario].nome} · ` : ""}
                        {e.equipamento}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
            {lista.length === 0 && (
              <li className="py-4">
                <p className="text-lg text-suave">Nenhum exercício encontrado.</p>
                <button onClick={() => setBusca("")} className="mt-2 min-h-[3rem] underline underline-offset-4">Limpar busca</button>
              </li>
            )}
          </ul>
        </div>

        {/* 3. O exercício */}
        {ex && (
          <div ref={detalhe} key={ex.id} className="animar scroll-mt-24">
            <h3 className="text-[clamp(2rem,5vw,3rem)] font-extrabold leading-none">{ex.nome}</h3>
            <p className="mt-2 text-base text-suave">Equipamento: {ex.equipamento}</p>

            <div className={`mt-6 grid gap-6 ${temAnimacao(ex.id) ? "md:grid-cols-2" : ""} md:items-start`}>
              {temAnimacao(ex.id) && (
                <Boneco exercicioId={ex.id} nome={ex.nome} primario={ex.grupo_primario} secundarios={ex.grupos_secundarios} />
              )}
              <div>
                <Corpo primario={ex.grupo_primario} secundarios={ex.grupos_secundarios} onGrupo={setAberto} />
              </div>
            </div>
            <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-base text-suave">
              <span className="flex items-center gap-2"><span className="h-3 w-3 bg-primario" /> Músculo principal</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 bg-secundario/50" /> Músculos auxiliares</span>
            </p>
            <p className="mt-1 text-base text-suave">Toque em qualquer músculo do mapa para entender o que ele faz.</p>

            <p className="mt-6 text-lg font-semibold">Músculo principal</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="bg-primario px-4 py-3 font-bold text-white">{GRUPOS[ex.grupo_primario].nome}</span>
              <button
                onClick={() => setAberto(ex.grupo_primario)}
                aria-label={`Explicar ${GRUPOS[ex.grupo_primario].nome}`}
                className="min-h-[3rem] min-w-[3rem] btn-contorno text-xl font-bold"
              >
                ?
              </button>
            </div>

            {ex.grupos_secundarios.length > 0 && (
              <>
                <p className="mt-5 text-lg font-semibold">Músculos auxiliares</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ex.grupos_secundarios.map((g) => (
                    <button
                      key={g}
                      onClick={() => setAberto(g)}
                      className="min-h-[3rem] border-2 border-secundario px-4 py-2 font-semibold active:scale-[0.97] hover:bg-secundario hover:text-sobre-secundario"
                    >
                      {GRUPOS[g].nome}
                    </button>
                  ))}
                </div>
              </>
            )}

            <p className="mt-6 max-w-[60ch] text-xl leading-relaxed">{ex.explicacao_anatomica}</p>
          </div>
        )}
      </div>

      <ModalGrupo
        grupo={aberto}
        onFechar={fechar}
        onEscolher={(novo) => {
          const e = EXERCICIOS.find((x) => x.id === novo);
          if (e) setGrupo(categoriaDoExercicio(e));
          setBusca("");
          setId(novo);
          fechar();
        }}
      />
    </div>
  );
}
