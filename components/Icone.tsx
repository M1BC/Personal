// Ícones de traço (24 px) da navegação. Desenhados aqui para não depender de biblioteca.
const CAMINHOS = {
  inicio: <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" />,
  treinos: (
    <>
      <path d="M7 8v8M17 8v8M4.5 10v4M19.5 10v4M7 12h10" />
    </>
  ),
  anatomia: (
    <>
      <circle cx="12" cy="4.8" r="2" />
      <path d="M6 9.5h12M12 9.5V14m0 0-3 6m3-6 3 6M8.5 9.5 7 14M15.5 9.5 17 14" />
    </>
  ),
  refeicoes: (
    <>
      <path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10" />
      <path d="M16.5 21V3c-2 1.5-3 4-3 7 0 1.6 1.3 3 3 3" />
    </>
  ),
  suplementos: (
    <>
      <rect x="3.5" y="9" width="17" height="6.5" rx="3.25" transform="rotate(-35 12 12.25)" />
      <path d="m10.4 8.6 3.6 5.2" />
    </>
  ),
  painel: (
    <>
      <rect x="5" y="4.5" width="14" height="16" rx="2" />
      <path d="M9 4.5V3.5h6v1M8.5 10h7M8.5 13.5h7M8.5 17h4" />
    </>
  ),
  sair: <path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l4-4-4-4M14 12H4" />,
} as const;

export type NomeIcone = keyof typeof CAMINHOS;

export function Icone({ nome, className = "h-6 w-6" }: { nome: NomeIcone; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {CAMINHOS[nome]}
    </svg>
  );
}
