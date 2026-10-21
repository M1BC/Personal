"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { PERFIL_PADRAO, type Perfil } from "@/lib/nutricao";

// Os dados digitados em uma tela valem nas outras (ficam salvos no navegador).
const Ctx = createContext<{ perfil: Perfil; atualizar: (p: Partial<Perfil>) => void }>({
  perfil: PERFIL_PADRAO,
  atualizar: () => {},
});
export const usePerfil = () => useContext(Ctx);

export function PerfilProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_PADRAO);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem("perfil");
      if (salvo) setPerfil({ ...PERFIL_PADRAO, ...JSON.parse(salvo) });
    } catch {
      // Sem armazenamento: usa os valores padrão.
    }
  }, []);

  const atualizar = (p: Partial<Perfil>) =>
    setPerfil((atual) => {
      const novo = { ...atual, ...p };
      try {
        localStorage.setItem("perfil", JSON.stringify(novo));
      } catch {
        // Sem armazenamento: os dados valem só nesta sessão.
      }
      return novo;
    });

  return <Ctx.Provider value={{ perfil, atualizar }}>{children}</Ctx.Provider>;
}
