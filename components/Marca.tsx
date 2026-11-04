// Símbolo do app (halter), o mesmo do ícone da tela inicial do celular.
export function Simbolo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-superficie" />
      <rect x="7" y="14.9" width="18" height="2.2" rx="1.1" className="fill-tinta" />
      <rect x="9.2" y="10.4" width="2.6" height="11.2" rx="1.2" className="fill-primario" />
      <rect x="20.2" y="10.4" width="2.6" height="11.2" rx="1.2" className="fill-primario" />
      <rect x="6.6" y="12.6" width="2" height="6.8" rx="1" className="fill-primario" />
      <rect x="23.4" y="12.6" width="2" height="6.8" rx="1" className="fill-primario" />
    </svg>
  );
}
