"use client";
import { EXERCICIOS, GRUPOS } from "@/data/exercicios";
import type { GrupoMuscular } from "@/lib/types";
import { Modal } from "./Modal";

type Props = {
  grupo: GrupoMuscular | null;
  onFechar: () => void;
  onEscolher: (idExercicio: string) => void;
};

export function ModalGrupo({ grupo, onFechar, onEscolher }: Props) {
  const info = grupo ? GRUPOS[grupo] : null;
  const usados = grupo
    ? EXERCICIOS.filter((e) => e.grupo_primario === grupo || e.grupos_secundarios.includes(grupo))
    : [];

  return (
    <Modal aberto={!!info} titulo={info?.nome ?? ""} onFechar={onFechar}>
      {info && (
        <>
          <p className="mt-4 text-lg font-semibold">O que faz</p>
          <p className="text-lg text-suave">{info.funcao}</p>
          <p className="mt-4 text-lg font-semibold">Como se liga aos outros músculos</p>
          <p className="text-lg text-suave">{info.ligacao}</p>
          <p className="mt-6 text-lg font-semibold">Aparece nestes exercícios</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {usados.map((e) => (
              <button key={e.id} onClick={() => onEscolher(e.id)} className="btn">
                {e.nome}
              </button>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}
