// Símbolo do app (halter visto de lado), o mesmo do ícone da tela inicial do celular.
export function Simbolo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="14" className="fill-superficie" />
      {/* Barra com a pegada recartilhada */}
      <rect x="10" y="29" width="44" height="6" rx="1.5" fill="#D7D1CB" />
      <path d="M25 29h1.4v6H25zM28 29h1.4v6H28zM31.3 29h1.4v6h-1.4zM34.6 29H36v6h-1.4zM37.6 29H39v6h-1.4z" fill="#8A827C" />
      {/* Anilhas: a grande por dentro, a menor por fora, com o brilho em cima */}
      <rect x="13" y="13" width="8" height="38" rx="2" className="fill-primario" />
      <rect x="43" y="13" width="8" height="38" rx="2" className="fill-primario" />
      <rect x="13" y="13" width="8" height="3" rx="1.5" className="fill-alerta" />
      <rect x="43" y="13" width="8" height="3" rx="1.5" className="fill-alerta" />
      <rect x="6" y="19" width="7" height="26" rx="2" fill="#B51A12" />
      <rect x="51" y="19" width="7" height="26" rx="2" fill="#B51A12" />
      {/* Presilhas */}
      <rect x="21" y="26.5" width="2.5" height="11" rx="1" className="fill-tinta" />
      <rect x="40.5" y="26.5" width="2.5" height="11" rx="1" className="fill-tinta" />
    </svg>
  );
}
