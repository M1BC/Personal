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
} as const;

export type NomeIcone = keyof typeof CAMINHOS;

export function Icone({ nome, className = "h-6 w-6" }: { nome: NomeIcone; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {CAMINHOS[nome]}
    </svg>
  );
}
