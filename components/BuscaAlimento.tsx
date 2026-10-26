"use client";
import { useEffect, useState } from "react";
import { ALIMENTOS, CATEGORIAS_ALIMENTO } from "@/data/alimentos";
import { combina } from "@/lib/busca";
import { porMedida } from "@/lib/cardapio";
import { fmt } from "@/lib/nutricao";
import type { CategoriaAlimento } from "@/lib/types";
import { Modal } from "./Modal";

type Props = {
  aberto: boolean;
  titulo: string;
  categoriaInicial?: CategoriaAlimento;
  onEscolher: (id: string) => void;
  onFechar: () => void;
};


export function BuscaAlimento({ aberto, titulo, categoriaInicial, onEscolher, onFechar }: Props) {
  const [texto, setTexto] = useState("");
  const [cat, setCat] = useState<CategoriaAlimento | "Todos">("Todos");

  useEffect(() => {
    if (aberto) {
      setTexto("");
      setCat(categoriaInicial ?? "Todos");
    }
  }, [aberto, categoriaInicial]);

  const lista = ALIMENTOS.filter((a) => (cat === "Todos" || a.categoria === cat) && (texto.trim() === "" || combina(a.nome, texto)));

  return (
    <Modal aberto={aberto} titulo={titulo} onFechar={onFechar}>
      <label htmlFor="busca-alimento" className="mt-4 block text-base font-semibold">Buscar alimento</label>
      <input
        id="busca-alimento"
        type="search"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Ex.: arroz, frango, banana"
        className="mt-1 min-h-[48px] w-full bg-superficie px-4 text-lg"
      />
      <div role="group" aria-label="Categoria" className="mt-3 flex flex-wrap gap-2">
        {(["Todos", ...CATEGORIAS_ALIMENTO] as const).map((c) => (
          <button key={c} aria-pressed={c === cat} onClick={() => setCat(c)} className="chip">
            {c}
          </button>
        ))}
      </div>
      <p className="mt-3 text-base text-suave" aria-live="polite">{lista.length} {lista.length === 1 ? "alimento" : "alimentos"}</p>
      <ul className="mt-1 max-h-[40dvh] divide-y divide-linha overflow-y-auto overscroll-contain border-y border-linha">
        {lista.map((a) => {
          const m = porMedida(a);
          return (
            <li key={a.id}>
              <button onClick={() => onEscolher(a.id)} className="block min-h-[56px] w-full px-1 py-3 text-left hover:bg-superficie">
                <span className="block text-lg font-semibold">{a.nome}</span>
                <span className="block text-base text-suave">
                  {a.medida_caseira} ({a.medida_g} {a.liquido ? "ml" : "g"}) ≈ {fmt(m.p, 0)} g prot · {fmt(m.c, 0)} g carb · {fmt(m.g, 0)} g gord
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {lista.length === 0 && <p className="mt-3 text-lg text-suave">Nenhum alimento encontrado.</p>}
    </Modal>
  );
}
