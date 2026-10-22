"use client";
import { useCallback, useEffect, useState } from "react";
import { CHAVE_HISTORICO, apagarTreino, chaveDoDia, lerHistorico, salvarTreino, type TreinoRegistrado } from "@/lib/historico";

// Lê o histórico depois que a página carrega no navegador (evita diferença entre servidor e navegador)
// e acompanha mudanças feitas em outras abas.
export function useHistoricoTreinos() {
  const [treinos, setTreinos] = useState<TreinoRegistrado[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setTreinos(lerHistorico());
    setCarregado(true);
    const aoMudar = (e: StorageEvent) => {
      if (e.key === CHAVE_HISTORICO || e.key === null) setTreinos(lerHistorico());
    };
    window.addEventListener("storage", aoMudar);
    return () => window.removeEventListener("storage", aoMudar);
  }, []);

  // Devolve false se o navegador não deixou gravar.
  const adicionar = useCallback((treino: TreinoRegistrado): boolean => {
    const ok = salvarTreino(treino);
    setTreinos(lerHistorico());
    return ok;
  }, []);

  const apagar = useCallback((id: string) => {
    setTreinos(apagarTreino(id));
  }, []);

  const treinouHoje = carregado && treinos.some((t) => t.dia === chaveDoDia(new Date()));

  return { treinos, carregado, treinouHoje, adicionar, apagar };
}
