"use client";
import { ATIVIDADES, validar, type Atividade, type Sexo } from "@/lib/nutricao";
import { usePerfil } from "./PerfilProvider";

const CAMPO = "mt-1 min-h-[48px] w-full bg-superficie px-4 text-lg font-semibold";
const ROTULO = "block text-base font-semibold";

export function PerfilForm() {
  const { perfil, atualizar } = usePerfil();
  const { erros } = validar(perfil);
  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className={ROTULO}>
          Peso atual (kg)
          <input type="number" inputMode="decimal" step="0.5" value={perfil.peso} onChange={(e) => atualizar({ peso: e.target.value })} className={`${CAMPO} tabular-nums`} />
        </label>
        <label className={ROTULO}>
          Peso meta (kg, opcional)
          <input type="number" inputMode="decimal" step="0.5" value={perfil.pesoMeta} onChange={(e) => atualizar({ pesoMeta: e.target.value })} className={`${CAMPO} tabular-nums`} />
        </label>
        <label className={ROTULO}>
          Altura (cm)
          <input type="number" inputMode="numeric" value={perfil.altura} onChange={(e) => atualizar({ altura: e.target.value })} className={`${CAMPO} tabular-nums`} />
        </label>
        <label className={ROTULO}>
          Idade (anos)
          <input type="number" inputMode="numeric" value={perfil.idade} onChange={(e) => atualizar({ idade: e.target.value })} className={`${CAMPO} tabular-nums`} />
        </label>
        <label className={ROTULO}>
          Sexo
          <select value={perfil.sexo} onChange={(e) => atualizar({ sexo: e.target.value as Sexo })} className={CAMPO}>
            <option value="m">Masculino</option>
            <option value="f">Feminino</option>
          </select>
        </label>
        <label className={ROTULO}>
          Nível de atividade
          <select value={perfil.atividade} onChange={(e) => atualizar({ atividade: e.target.value as Atividade })} className={CAMPO}>
            {(Object.keys(ATIVIDADES) as Atividade[]).map((k) => (
              <option key={k} value={k}>{ATIVIDADES[k]}</option>
            ))}
          </select>
        </label>
      </form>
      <ul className="mt-3 min-h-[1.5rem] font-semibold text-primario" aria-live="polite">
        {erros.map((e) => <li key={e}>{e}</li>)}
      </ul>
    </div>
  );
}
