"use client";
import { CARDAPIOS, montar } from "@/lib/cardapio";
import { calcularPlano, dividir, fmt, projetar, validar } from "@/lib/nutricao";
import { PerfilForm } from "./PerfilForm";
import { usePerfil } from "./PerfilProvider";

const meses = (semanas: number) => semanas / 4.345;

export function Refeicoes() {
  const { perfil } = usePerfil();
  const { dados } = validar(perfil);
  const plano = dados ? calcularPlano(dados) : null;
  const proj = dados && plano ? projetar(dados, plano) : null;

  return (
    <div>
      <PerfilForm />

      {proj && plano && (
        <section className="mt-6 max-w-[70ch] bg-superficie p-6" aria-live="polite">
          {proj.tipo === "perto" && <p className="text-xl">Você já está a menos de 0,5 kg do seu peso meta. O plano abaixo é de manutenção.</p>}
          {proj.tipo === "sem_margem" && (
            <p className="text-xl">
              Seu gasto estimado está perto do mínimo seguro de calorias ({fmt(plano.piso, 0)} kcal). Não dá para calcular um
              déficit seguro por aqui. Procure um nutricionista.
            </p>
          )}
          {proj.tipo === "imc_baixo" && (
            <p className="text-xl">
              Esse peso meta fica abaixo do peso saudável para a sua altura (IMC {fmt(proj.imc, 1)}). Não vou calcular uma projeção
              para ele. Converse com um médico ou nutricionista antes de buscar esse peso.
            </p>
          )}
          {(proj.tipo === "perder" || proj.tipo === "ganhar") && (
            <>
              <p className="text-3xl font-extrabold leading-tight tracking-tight">Faltam {fmt(proj.kg, 1)} kg para sua meta.</p>
              <p className="mt-2 text-xl">
                Seguindo esse plano ({proj.tipo === "perder" ? "déficit" : "superávit"} de{" "}
                {proj.ajusteMin === proj.ajusteMax ? `cerca de ${fmt(proj.ajusteMax, 0)}` : `${fmt(proj.ajusteMin, 0)} a ${fmt(proj.ajusteMax, 0)}`}{" "}
                kcal por dia), você deve atingir seu objetivo em aproximadamente{" "}
                <strong>
                  {proj.semanasMin === proj.semanasMax ? `${fmt(proj.semanasMax, 0)} semanas` : `${fmt(proj.semanasMin, 0)} a ${fmt(proj.semanasMax, 0)} semanas`}
                </strong>{" "}
                (cerca de {proj.semanasMin === proj.semanasMax ? `${fmt(meses(proj.semanasMax), 1)} meses` : `${fmt(meses(proj.semanasMin), 1)} a ${fmt(meses(proj.semanasMax), 1)} meses`}).
              </p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-base text-suave">
                <li>Ritmo estimado: {fmt(proj.ritmoMin, 2)} a {fmt(proj.ritmoMax, 2)} kg por semana.</li>
                <li>É uma estimativa (1 kg ≈ 7.700 kcal). Na prática o ritmo costuma diminuir com o tempo, porque o gasto do corpo muda com o peso.</li>
                {proj.tipo === "ganhar" && (
                  <li>O músculo cresce mais devagar do que a balança sobe: parte do peso ganho costuma ser gordura. Treino de força e proteína adequada ajudam a direcionar o ganho para músculo.</li>
                )}
                {proj.tipo === "perder" && proj.ajusteMax < 500 && (
                  <li>O déficit ficou menor que o habitual para respeitar o mínimo seguro de calorias ({fmt(plano.piso, 0)} kcal).</li>
                )}
                <li>Reavalie a cada 3 ou 4 semanas e ajuste com um nutricionista.</li>
              </ul>
            </>
          )}
        </section>
      )}

      {plano && dados && (
        <div className="mt-10">
          <p className="text-lg font-semibold">
            Meta do dia: {fmt(plano.kcal, 0)} kcal · {fmt(plano.proteina, 0)} g prot · {fmt(plano.carbo, 0)} g carb ·{" "}
            {fmt(plano.gordura, 0)} g gord
          </p>
          {plano.abaixoDoPiso && (
            <p className="mt-3 max-w-[62ch] border-l-4 border-primario bg-superficie p-4 text-base">
              Mantive as calorias no mínimo de {fmt(plano.piso, 0)} kcal. Procure um nutricionista antes de reduzir mais.
            </p>
          )}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {dividir(plano).map((r) => (
              <section key={r.id} className="bg-superficie p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-2xl font-extrabold">{r.nome}</h2>
                  <p className="text-base text-suave">{Math.round(r.pct * 100)}% do dia</p>
                </div>
                <p className="mt-1 text-lg font-semibold tabular-nums">
                  {fmt(r.proteina, 0)} g prot · {fmt(r.carbo, 0)} g carb · {fmt(r.gordura, 0)} g gord
                </p>
                <ul className="mt-4 divide-y divide-linha border-y border-linha">
                  {CARDAPIOS[r.id].map((c, i) => {
                    const m = montar(c, r);
                    return (
                      <li key={i} className="py-3">
                        <p className="text-lg">
                          {m.partes.join(" + ")}
                          {m.extra && ` + ${m.extra}`}
                        </p>
                        <p className="text-base text-suave">
                          ≈ {fmt(m.proteina, 0)} g prot · {fmt(m.carbo, 0)} g carb · {fmt(m.gordura, 0)} g gord
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
          <p className="mt-6 max-w-[70ch] text-base text-suave">
            Quantidades em medidas caseiras aproximadas (as colheres e conchas variam de pessoa para pessoa). Verduras e legumes
            entram como complemento, sem entrar na conta. Valores nutricionais da tabela TACO (Unicamp).
          </p>
        </div>
      )}
      <p className="mt-6 text-base text-suave">Estas são referências educacionais, consulte um nutricionista.</p>
    </div>
  );
}
