"use client";
import { useEffect, useState } from "react";
import { CARDAPIOS, montar } from "@/lib/cardapio";
import { REFEICOES, calcularPlano, dividir, fmt, projetar, validar } from "@/lib/nutricao";
import { PerfilForm } from "./PerfilForm";
import { usePerfil } from "./PerfilProvider";

const meses = (semanas: number) => semanas / 4.345;
const PADRAO: Record<string, string> = Object.fromEntries(REFEICOES.map((r) => [r.id, String(r.pct * 100)]));
const pctNum = (s: string) => Math.min(100, Math.max(0, Number(s.replace(",", ".")) || 0));

const TEXTO_OBJETIVO = {
  manter: "Calorias próximas ao seu gasto, para manter o peso.",
  perder: "Déficit de cerca de 400 kcal por dia, a partir do seu peso meta.",
  ganhar: "Superávit de cerca de 400 kcal por dia, a partir do seu peso meta.",
} as const;

export function Refeicoes() {
  const { perfil } = usePerfil();
  const { dados } = validar(perfil);
  const plano = dados ? calcularPlano(dados) : null;
  const proj = dados && plano ? projetar(dados, plano) : null;

  const [personalizar, setPersonalizar] = useState(false);
  const [pcts, setPcts] = useState<Record<string, string>>(PADRAO);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem("distribuicao");
      if (salvo) {
        const d = JSON.parse(salvo);
        setPersonalizar(!!d.ativa);
        setPcts({ ...PADRAO, ...d.pcts });
      }
    } catch {
      // Sem armazenamento: usa o padrão.
    }
  }, []);

  const salvar = (ativa: boolean, p: Record<string, string>) => {
    try {
      localStorage.setItem("distribuicao", JSON.stringify({ ativa, pcts: p }));
    } catch {
      // Sem armazenamento: vale só nesta sessão.
    }
  };
  const alternar = () => {
    setPersonalizar(!personalizar);
    salvar(!personalizar, pcts);
  };
  const mudar = (id: string, v: string) => {
    const novo = { ...pcts, [id]: v };
    setPcts(novo);
    salvar(personalizar, novo);
  };
  const restaurar = () => {
    setPcts(PADRAO);
    salvar(personalizar, PADRAO);
  };

  const efetivas = personalizar ? Object.fromEntries(REFEICOES.map((r) => [r.id, pctNum(pcts[r.id]) / 100])) : undefined;
  const refeicoes = plano ? dividir(plano, efetivas) : [];
  const soma = Math.round(refeicoes.reduce((s, r) => s + r.pct, 0) * 100);
  const metaKcal = refeicoes.reduce((s, r) => s + r.kcal, 0);
  const menuKcal = refeicoes.reduce((s, r) => (r.pct > 0 ? s + montar(CARDAPIOS[r.id][0], r).kcal : s), 0);
  const cobertura = metaKcal > 0 ? menuKcal / metaKcal : 1;

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

      {plano && (
        <div className="mt-10">
          <p className="text-lg font-semibold">Meta do dia: {fmt(plano.kcal, 0)} kcal</p>
          <p className="text-[clamp(2.25rem,8vw,4rem)] font-extrabold leading-none tracking-tighter tabular-nums">
            {fmt(plano.proteina, 0)} g prot · {fmt(plano.carbo, 0)} g carb · {fmt(plano.gordura, 0)} g gord
          </p>
          <p className="mt-2 max-w-[62ch] text-base text-suave">
            {TEXTO_OBJETIVO[plano.objetivo]} Proteína: 1,6 g por kg. Gordura: 25% das calorias. Carboidrato: o restante.
          </p>
          {plano.abaixoDoPiso && (
            <p className="mt-3 max-w-[62ch] border-l-4 border-primario bg-superficie p-4 text-base">
              Seu gasto estimado deixa pouca margem para déficit. Mantive as calorias no mínimo de {fmt(plano.piso, 0)} kcal.
              Procure um nutricionista antes de reduzir mais.
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
            <button
              role="switch"
              aria-checked={personalizar}
              onClick={alternar}
              className="flex min-h-[48px] items-center gap-3 text-lg font-bold"
            >
              <span className={`relative h-7 w-12 transition-colors duration-150 ease-out ${personalizar ? "bg-primario" : "bg-corpo"}`}>
                <span className={`absolute top-1 h-5 w-5 bg-white transition-transform duration-150 ease-out ${personalizar ? "translate-x-6" : "translate-x-1"}`} />
              </span>
              Personalizar distribuição
            </button>
            {personalizar && (
              <>
                <p className={`text-base font-semibold ${soma === 100 ? "text-suave" : "text-primario"}`} aria-live="polite">
                  Soma: {soma}%{soma !== 100 && " (o ideal é 100%)"}
                </p>
                <button onClick={restaurar} className="min-h-[48px] underline underline-offset-4">
                  Restaurar padrão
                </button>
              </>
            )}
          </div>

          {cobertura < 0.9 && (
            <p className="mt-4 max-w-[70ch] border-l-4 border-primario bg-superficie p-4 text-base">
              Com porções realistas, os cardápios abaixo (opção 1 de cada refeição) cobrem cerca de {fmt(cobertura * 100, 0)}% das
              calorias da sua meta. Para completar, inclua mais um lanche (por exemplo, iogurte com banana e aveia) ou aumente as
              porções aos poucos.
            </p>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {refeicoes.map((r) => (
              <section key={r.id} className="bg-superficie p-6">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <h2 className="text-2xl font-extrabold">{r.nome}</h2>
                  {personalizar ? (
                    <label className="flex items-center gap-2 text-base text-suave">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={100}
                        value={pcts[r.id]}
                        onChange={(e) => mudar(r.id, e.target.value)}
                        aria-label={`Porcentagem do dia para ${r.nome}`}
                        className="min-h-[48px] w-20 bg-fundo px-3 text-lg font-bold tabular-nums text-tinta"
                      />
                      % do dia
                    </label>
                  ) : (
                    <p className="text-base text-suave">{Math.round(r.pct * 100)}% do dia · {fmt(r.kcal, 0)} kcal</p>
                  )}
                </div>
                {r.pct <= 0 ? (
                  <p className="mt-3 text-lg text-suave">Refeição desativada (0%).</p>
                ) : (
                  <>
                    {personalizar && <p className="mt-1 text-base text-suave">{fmt(r.kcal, 0)} kcal</p>}
                    <dl className="mt-3 grid grid-cols-3 gap-2">
                      {([["Proteína", r.proteina], ["Carboidrato", r.carbo], ["Gordura", r.gordura]] as const).map(([nome, v]) => (
                        <div key={nome}>
                          <dt className="text-base text-suave">{nome}</dt>
                          <dd className="text-3xl font-extrabold tabular-nums">{fmt(v, 0)} g</dd>
                        </div>
                      ))}
                    </dl>
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
                  </>
                )}
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
