"use client";
import { useCallback, useState } from "react";
import { CATEGORIAS, EXERCICIOS, GRUPOS, categoriaDe, type Categoria } from "@/data/exercicios";
import type { GrupoMuscular } from "@/lib/types";
import { Corpo } from "./Corpo";
import { ModalGrupo } from "./ModalGrupo";

export function ExplorerExercicios() {
  const [categoria, setCategoria] = useState<Categoria>("Todos");
  const [id, setId] = useState(EXERCICIOS[0].id);
  const [aberto, setAberto] = useState<GrupoMuscular | null>(null);
  const fechar = useCallback(() => setAberto(null), []);
  const lista = EXERCICIOS.filter((e) => categoria === "Todos" || categoriaDe(e.grupo_primario) === categoria);
  const ex = lista.find((e) => e.id === id) ?? lista[0];

  return (
    <div>
      <div role="group" aria-label="Filtrar por grupo muscular" className="flex flex-wrap gap-2">
        {CATEGORIAS.map((c) => (
          <button
            key={c}
            aria-pressed={c === categoria}
            onClick={() => setCategoria(c)}
            className={`min-h-[48px] border-2 border-tinta px-5 py-2 font-bold transition-transform duration-100 ease-out active:scale-[0.97] ${
              c === categoria ? "bg-tinta text-fundo" : "hover:bg-superficie"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div role="group" aria-label="Escolha o exercício" className="mt-4 flex flex-wrap gap-2">
        {lista.map((e) => (
          <button
            key={e.id}
            aria-pressed={e.id === ex.id}
            onClick={() => setId(e.id)}
            className={`min-h-[48px] px-4 py-2 font-semibold transition-transform duration-100 ease-out active:scale-[0.97] ${
              e.id === ex.id ? "bg-tinta text-fundo" : "bg-superficie hover:bg-corpo"
            }`}
          >
            {e.nome}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <Corpo primario={ex.grupo_primario} secundarios={ex.grupos_secundarios} onGrupo={setAberto} />
          <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-base text-suave">
            <span className="flex items-center gap-2"><span className="h-3 w-3 bg-primario" /> Músculo principal</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 bg-secundario/50" /> Músculos que ajudam</span>
          </p>
          <p className="mt-1 text-base text-suave">Toque em qualquer músculo do mapa para entender o que ele faz.</p>
        </div>

        <div key={ex.id} className="animar">
          <h3 className="text-5xl font-extrabold leading-none tracking-tight">{ex.nome}</h3>
          <p className="mt-3 text-base text-suave">Equipamento: {ex.equipamento}</p>

          <p className="mt-6 text-lg font-semibold">Músculo principal</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="bg-primario px-4 py-3 font-bold text-white">{GRUPOS[ex.grupo_primario].nome}</span>
            <button
              onClick={() => setAberto(ex.grupo_primario)}
              aria-label={`Explicar ${GRUPOS[ex.grupo_primario].nome}`}
              className="min-h-[48px] min-w-[48px] border-2 border-tinta text-xl font-bold active:scale-[0.95] hover:bg-tinta hover:text-fundo"
            >
              ?
            </button>
          </div>

          {ex.grupos_secundarios.length > 0 && (
            <>
              <p className="mt-5 text-lg font-semibold">Músculos que ajudam</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ex.grupos_secundarios.map((g) => (
                  <button
                    key={g}
                    onClick={() => setAberto(g)}
                    className="min-h-[48px] border-2 border-secundario px-4 py-2 font-semibold active:scale-[0.97] hover:bg-secundario hover:text-sobre-secundario"
                  >
                    {GRUPOS[g].nome}
                  </button>
                ))}
              </div>
            </>
          )}

          <p className="mt-6 max-w-[60ch] text-xl leading-relaxed">{ex.explicacao_anatomica}</p>
        </div>
      </div>

      <ModalGrupo
        grupo={aberto}
        onFechar={fechar}
        onEscolher={(novo) => {
          setCategoria("Todos");
          setId(novo);
          fechar();
        }}
      />
    </div>
  );
}
