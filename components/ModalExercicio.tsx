"use client";
import { EXERCICIOS, GRUPOS } from "@/data/exercicios";
import { Boneco, temAnimacao } from "./Boneco";
import { Modal } from "./Modal";

// Botão "?" das fichas: o personagem mostrando a execução e, abaixo, a explicação anatômica.
export function ModalExercicio({ id, onFechar }: { id: string | null; onFechar: () => void }) {
  const ex = id ? EXERCICIOS.find((e) => e.id === id) : null;
  return (
    <Modal aberto={!!ex} titulo={ex?.nome ?? ""} onFechar={onFechar}>
      {ex && (
        <>
          {temAnimacao(ex.id) && (
            <div className="mt-4">
              <Boneco key={ex.id} exercicioId={ex.id} nome={ex.nome} primario={ex.grupo_primario} secundarios={ex.grupos_secundarios} />
            </div>
          )}
          <p className="mt-6 text-lg font-semibold">Equipamento</p>
          <p className="text-lg text-suave">{ex.equipamento}</p>
          <p className="mt-4 text-lg font-semibold">Músculo principal</p>
          <p className="text-lg text-suave">{GRUPOS[ex.grupo_primario].nome}</p>
          {ex.grupos_secundarios.length > 0 && (
            <>
              <p className="mt-4 text-lg font-semibold">Músculos auxiliares</p>
              <p className="text-lg text-suave">{ex.grupos_secundarios.map((g) => GRUPOS[g].nome).join(", ")}</p>
            </>
          )}
          <p className="mt-4 text-lg font-semibold">Como o corpo trabalha junto</p>
          <p className="text-lg text-suave">{ex.explicacao_anatomica}</p>
        </>
      )}
    </Modal>
  );
}
