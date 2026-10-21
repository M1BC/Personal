"use client";
import Link from "next/link";
import { CARDAPIOS, montar } from "@/lib/cardapio";
import { calcularPlano, dividir, fmt, validar } from "@/lib/nutricao";
import { PerfilForm } from "./PerfilForm";
import { usePerfil } from "./PerfilProvider";

const TEXTO_OBJETIVO = {
  manter: "Calorias próximas ao seu gasto, para manter o peso.",
  perder: "Déficit de cerca de 400 kcal por dia, a partir do seu peso meta.",
  ganhar: "Superávit de cerca de 400 kcal por dia, a partir do seu peso meta.",
} as const;

export function DivisorRefeicoes() {
  const { perfil } = usePerfil();
  const { dados } = validar(perfil);
  const plano = dados ? calcularPlano(dados) : null;

  return (
    <div>
      <PerfilForm />
      {plano && (
        <div aria-live="polite" className="mt-6">
          <p className="text-lg font-semibold">Meta do dia: {fmt(plano.kcal, 0)} kcal</p>
          <p className="text-[clamp(2.25rem,8vw,4rem)] font-extrabold leading-none tracking-tighter tabular-nums">
            {fmt(plano.proteina, 0)} g prot · {fmt(plano.carbo, 0)} g carb · {fmt(plano.gordura, 0)} g gord
          </p>
          <p className="mt-2 max-w-[62ch] text-base text-suave">
            {TEXTO_OBJETIVO[plano.objetivo]} Proteína: 1,6 g por kg. Gordura: 25% das calorias. Carboidrato: o restante.
            Para mudar o objetivo, informe um peso meta.
          </p>
          {plano.abaixoDoPiso && (
            <p className="mt-3 max-w-[62ch] border-l-4 border-primario bg-superficie p-4 text-base">
              Seu gasto estimado deixa pouca margem para déficit. Mantive as calorias no mínimo de {fmt(plano.piso, 0)} kcal.
              Procure um nutricionista antes de reduzir mais.
            </p>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {dividir(plano).map((r) => {
              const m = montar(CARDAPIOS[r.id][0], r);
              return (
                <section key={r.id} className="bg-superficie p-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-2xl font-extrabold">{r.nome}</h2>
                    <p className="text-base text-suave">{Math.round(r.pct * 100)}% do dia · {fmt(r.kcal, 0)} kcal</p>
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-2">
                    {([["Proteína", r.proteina], ["Carboidrato", r.carbo], ["Gordura", r.gordura]] as const).map(([nome, v]) => (
                      <div key={nome}>
                        <dt className="text-base text-suave">{nome}</dt>
                        <dd className="text-3xl font-extrabold tabular-nums">{fmt(v, 0)} g</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-4 text-lg">
                    <span className="font-semibold">Exemplo: </span>
                    {m.partes.join(" + ")}
                    {m.extra && ` + ${m.extra}`}
                  </p>
                  <p className="text-base text-suave">
                    ≈ {fmt(m.proteina, 0)} g prot · {fmt(m.carbo, 0)} g carb · {fmt(m.gordura, 0)} g gord
                  </p>
                </section>
              );
            })}
          </div>
          <p className="mt-6 text-base">
            Quer mais opções de cada refeição? Veja os{" "}
            <Link href="/refeicoes" className="font-bold underline underline-offset-4">cardápios completos</Link>.
          </p>
        </div>
      )}
      <p className="mt-6 text-base text-suave">Estas são referências educacionais, consulte um nutricionista.</p>
    </div>
  );
}
