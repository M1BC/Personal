"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { carregarDados, salvarDado } from "@/lib/nuvem";
import { PERFIL_PADRAO, type Perfil } from "@/lib/nutricao";

// Os dados digitados em uma tela valem nas outras (ficam salvos na conta, no Supabase).
const Ctx = createContext<{ perfil: Perfil; atualizar: (p: Partial<Perfil>) => void }>({
  perfil: PERFIL_PADRAO,
  atualizar: () => {},
});
export const usePerfil = () => useContext(Ctx);

export function PerfilProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_PADRAO);

  useEffect(() => {
    carregarDados().then((d) => {
      if (d.perfil) setPerfil({ ...PERFIL_PADRAO, ...(d.perfil as Partial<Perfil>) });
    });
  }, []);

  const atualizar = (p: Partial<Perfil>) =>
    setPerfil((atual) => {
      const novo = { ...atual, ...p };
      salvarDado("perfil", novo);
      return novo;
    });

  return <Ctx.Provider value={{ perfil, atualizar }}>{children}</Ctx.Provider>;
}
