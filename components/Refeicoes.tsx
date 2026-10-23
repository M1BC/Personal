"use client";
import { useEffect, useState } from "react";
import { alimentoPorId, CARDAPIOS, montar } from "@/lib/cardapio";
import { adicionar, macrosDoPrato, trocar, type ItemPrato } from "@/lib/diario";
import { REFEICOES, calcularPlano, dividir, fmt, projetar, validar } from "@/lib/nutricao";
import type { CategoriaAlimento } from "@/lib/types";
import { BuscaAlimento } from "./BuscaAlimento";
import { MeuPrato } from "./MeuPrato";
import { PerfilForm } from "./PerfilForm";
import { usePerfil } from "./PerfilProvider";

const meses = (semanas: number) => semanas / 4.345;
const PADRAO: Record<string, string> = Object.fromEntries(REFEICOES.map((r) => [r.id, String(r.pct * 100)]));
const pctNum = (s: string) => Math.min(100, Math.max(0, Number(s.replace(",", ".")) || 0));
const BTN_TEXTO = "min-h-[48px] underline underline-offset-4";

const TEXTO_OBJETIVO = {
  manter: "Calorias próximas ao seu gasto, para manter o peso.",
  perder: "Déficit de cerca de 400 kcal por dia, a partir do seu peso meta.",
  ganhar: "Superávit de cerca de 400 kcal por dia, a partir do seu peso meta.",
} as const;

function Barra({ rotulo, atual, meta, un }: { rotulo: string; atual: number; meta: number; un: string }) {
  const frac = meta > 0 ? Math.min(1, atual / meta) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-base">
        <span>{rotulo}</span>
        <span className="tabular-nums">{fmt(atual, 0)} / {fmt(meta, 0)} {un}</span>
      </div>
      <div
        className="mt-1 h-2 bg-corpo"
        role="progressbar"
        aria-label={rotulo}
        aria-valuemin={0}
        aria-valuemax={Math.round(meta)}
        aria-valuenow={Math.round(atual)}
      >
        <div className="h-2 origin-left bg-tinta transition-transform duration-200 ease-out" style={{ transform: `scaleX(${frac})` }} />
      </div>
    </div>
  );
}

export function Refeicoes() {
  const { perfil } = usePerfil();
  const { dados } = validar(perfil);
  const plano = dados ? calcularPlano(dados) : null;
  const proj = dados && plano ? projetar(dados, plano) : null;

  const [personalizar, setPersonalizar] = useState(false);
  const [pcts, setPcts] = useState<Record<string, string>>(PADRAO);
  const [editados, setEditados] = useState<Record<string, ItemPrato[]>>({});
  const [busca, setBusca] = useState<{ ref: string; idx: number | null; cat?: CategoriaAlimento } | null>(null);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem("distribuicao");
      if (salvo) {
        const d = JSON.parse(salvo);
        setPersonalizar(!!d.ativa);
        setPcts({ ...PADRAO, ...d.pcts });
      }
      const pratos = localStorage.getItem("pratos");
      if (pratos) {
        const d = JSON.parse(pratos) as Record<string, ItemPrato[]>;
        setEditados(Object.fromEntries(Object.entries(d).map(([k, v]) => [k, (v ?? []).filter((i) => alimentoPorId[i.id] && i.q > 0)])));
      }
    } catch {
      // Sem armazenamento: usa o padrão.
    }
  }, []);

  const guardar = (chave: string, valor: unknown) => {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
      // Sem armazenamento: vale só nesta sessão.
    }
  };
  const alternar = () => {
    setPersonalizar(!personalizar);
    guardar("distribuicao", { ativa: !personalizar, pcts });
  };
  const mudarPct = (id: string, v: string) => {
    const novo = { ...pcts, [id]: v };
    setPcts(novo);
    guardar("distribuicao", { ativa: personalizar, pcts: novo });
  };
  const restaurarPct = () => {
    setPcts(PADRAO);
    guardar("distribuicao", { ativa: personalizar, pcts: PADRAO });
  };
  const definirPrato = (ref: string, itens: ItemPrato[]) => {
    const novo = { ...editados, [ref]: itens };
    setEditados(novo);
    guardar("pratos", novo);
  };
  const restaurarSugestoes = () => {
    setEditados({});
    guardar("pratos", {});
  };

  const efetivas = personalizar ? Object.fromEntries(REFEICOES.map((r) => [r.id, pctNum(pcts[r.id]) / 100])) : undefined;
  const refeicoes = plano ? dividir(plano, efetivas) : [];
  const detalhes = refeicoes.map((r) => {
    const sug = r.pct > 0 ? CARDAPIOS[r.id].map((c) => montar(c, r)) : [];
    const itens = editados[r.id] ?? sug[0]?.itens ?? [];
    return { r, sug, itens, prato: macrosDoPrato(itens) };
  });
  const soma = Math.round(refeicoes.reduce((s, r) => s + r.pct, 0) * 100);
  const meta = refeicoes.reduce((s, r) => ({ kcal: s.kcal + r.kcal, p: s.p + r.proteina, c: s.c + r.carbo, g: s.g + r.gordura }), { kcal: 0, p: 0, c: 0, g: 0 });
  const dia = detalhes.reduce((s, d) => ({ kcal: s.kcal + d.prato.kcal, p: s.p + d.prato.proteina, c: s.c + d.prato.carbo, g: s.g + d.prato.gordura }), { kcal: 0, p: 0, c: 0, g: 0 });
  const menuKcal = detalhes.reduce((s, d) => s + (d.sug[0]?.kcal ?? 0), 0);
  const cobertura = meta.kcal > 0 ? menuKcal / meta.kcal : 1;

  const escolher = (id: string) => {
    if (!busca) return;
    const atual = detalhes.find((d) => d.r.id === busca.ref)?.itens ?? [];
    definirPrato(busca.ref, busca.idx === null ? adicionar(atual, id) : trocar(atual, busca.idx, id));
    setBusca(null);
  };

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
            <button role="switch" aria-checked={personalizar} onClick={alternar} className="flex min-h-[48px] items-center gap-3 text-lg font-bold">
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
                <button onClick={restaurarPct} className={BTN_TEXTO}>Restaurar porcentagens</button>
                <button onClick={restaurarSugestoes} className={BTN_TEXTO}>Restaurar sugestões</button>
              </>
            )}
          </div>
          {personalizar && (
            <p className="mt-1 max-w-[70ch] text-base text-suave">
              Ajuste as porcentagens e monte o seu prato em cada refeição: adicione, troque ou remova alimentos e mude as quantidades. Os totais atualizam na hora.
            </p>
          )}

          {!personalizar && cobertura < 0.9 && (
            <p className="mt-4 max-w-[70ch] border-l-4 border-primario bg-superficie p-4 text-base">
              Com porções realistas, os cardápios abaixo (opção 1 de cada refeição) cobrem cerca de {fmt(cobertura * 100, 0)}% das
              calorias da sua meta. Para completar, inclua mais um lanche (por exemplo, iogurte com banana e aveia) ou aumente as
              porções aos poucos.
            </p>
          )}

          {personalizar && (
            <section className="mt-6 bg-superficie p-6" aria-live="polite">
              <h2 className="text-2xl font-extrabold">Total do dia</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Barra rotulo="Calorias" atual={dia.kcal} meta={meta.kcal} un="kcal" />
                <Barra rotulo="Proteína" atual={dia.p} meta={meta.p} un="g" />
                <Barra rotulo="Carboidrato" atual={dia.c} meta={meta.c} un="g" />
                <Barra rotulo="Gordura" atual={dia.g} meta={meta.g} un="g" />
              </div>
            </section>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {detalhes.map(({ r, sug, itens, prato }) => (
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
                        onChange={(e) => mudarPct(r.id, e.target.value)}
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
                ) : personalizar ? (
                  <>
                    <p className="mt-1 text-base text-suave">Meta: {fmt(r.kcal, 0)} kcal</p>
                    <div className="mt-3 grid gap-3" aria-live="polite">
                      <Barra rotulo="Proteína" atual={prato.proteina} meta={r.proteina} un="g" />
                      <Barra rotulo="Carboidrato" atual={prato.carbo} meta={r.carbo} un="g" />
                      <Barra rotulo="Gordura" atual={prato.gordura} meta={r.gordura} un="g" />
                    </div>
                    <p className="mt-4 text-lg font-semibold">Meu prato</p>
                    <MeuPrato
                      itens={itens}
                      onMudar={(novo) => definirPrato(r.id, novo)}
                      onAdicionar={() => setBusca({ ref: r.id, idx: null })}
                      onTrocar={(k) => setBusca({ ref: r.id, idx: k, cat: itens[k] ? alimentoPorId[itens[k].id]?.categoria : undefined })}
                    />
                    <p className="mt-3 text-base text-suave">Salada e legumes à vontade: não entram na conta.</p>
                    <details className="mt-2">
                      <summary className="flex min-h-[48px] cursor-pointer items-center font-semibold">Outras sugestões</summary>
                      <ul className="divide-y divide-linha border-y border-linha">
                        {sug.map((s, i) => (
                          <li key={i} className="py-3">
                            <p className="text-base">{s.partes.join(" + ")}{s.extra && ` + ${s.extra}`}</p>
                            <button className="btn mt-2" onClick={() => definirPrato(r.id, s.itens)}>Usar esta sugestão</button>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </>
                ) : (
                  <>
                    <dl className="mt-3 grid grid-cols-3 gap-2">
                      {([["Proteína", r.proteina], ["Carboidrato", r.carbo], ["Gordura", r.gordura]] as const).map(([nome, v]) => (
                        <div key={nome}>
                          <dt className="text-base text-suave">{nome}</dt>
                          <dd className="text-3xl font-extrabold tabular-nums">{fmt(v, 0)} g</dd>
                        </div>
                      ))}
                    </dl>
                    <ul className="mt-4 divide-y divide-linha border-y border-linha">
                      {sug.map((m, i) => (
                        <li key={i} className="py-3">
                          <p className="text-lg">{m.partes.join(" + ")}{m.extra && ` + ${m.extra}`}</p>
                          <p className="text-base text-suave">≈ {fmt(m.proteina, 0)} g prot · {fmt(m.carbo, 0)} g carb · {fmt(m.gordura, 0)} g gord</p>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            ))}
          </div>
          <p className="mt-6 max-w-[70ch] text-base text-suave">
            Quantidades em medidas caseiras aproximadas (as colheres e conchas variam de pessoa para pessoa). Verduras e legumes
            entram como complemento, sem entrar na conta. Valores nutricionais da tabela TACO (Unicamp), com algumas exceções
            indicadas no banco de alimentos.
          </p>
        </div>
      )}

      <BuscaAlimento
        aberto={busca !== null}
        titulo={busca && busca.idx !== null ? "Trocar alimento" : "Adicionar alimento"}
        categoriaInicial={busca?.cat}
        onEscolher={escolher}
        onFechar={() => setBusca(null)}
      />
      <p className="mt-6 text-base text-suave">Estas são referências educacionais, consulte um nutricionista.</p>
    </div>
  );
}
