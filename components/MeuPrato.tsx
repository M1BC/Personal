"use client";
import { alimentoPorId, frase, porMedida } from "@/lib/cardapio";
import { mudarQuantidade, remover, type ItemPrato } from "@/lib/diario";
import { fmt } from "@/lib/nutricao";

const BTN =
  "min-h-[48px] min-w-[48px] btn-contorno px-3 font-bold";

type Props = {
  itens: ItemPrato[];
  onMudar: (novo: ItemPrato[]) => void;
  onAdicionar: () => void;
  onTrocar: (idx: number) => void;
};

export function MeuPrato({ itens, onMudar, onAdicionar, onTrocar }: Props) {
  return (
    <div>
      {itens.length === 0 && <p className="mt-4 text-lg text-suave">Prato vazio. Adicione um alimento.</p>}
      <ul className="mt-4 divide-y divide-linha border-y border-linha">
        {itens.map((i, k) => {
          const a = alimentoPorId[i.id];
          if (!a) return null;
          const m = porMedida(a);
          return (
            <li key={`${i.id}-${k}`} className="py-3">
              <p className="text-lg">{frase(a, i.q)}</p>
              <p className="text-base text-suave">
                ≈ {fmt(m.p * i.q, 0)} g prot · {fmt(m.c * i.q, 0)} g carb · {fmt(m.g * i.q, 0)} g gord
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className={BTN} aria-label={`Diminuir ${a.nome}`} onClick={() => onMudar(mudarQuantidade(itens, k, -1))}>−</button>
                <button className={BTN} aria-label={`Aumentar ${a.nome}`} onClick={() => onMudar(mudarQuantidade(itens, k, 1))}>+</button>
                <button className={BTN} onClick={() => onTrocar(k)}>Trocar</button>
                <button className={BTN} aria-label={`Remover ${a.nome}`} onClick={() => onMudar(remover(itens, k))}>Remover</button>
              </div>
            </li>
          );
        })}
      </ul>
      <button className="btn mt-3" onClick={onAdicionar}>Adicionar alimento</button>
    </div>
  );
}
