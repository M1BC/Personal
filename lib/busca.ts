// Busca sem diferenciar maiúsculas e acentos: "acai" encontra "Açaí".
export const normalizar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Todas as palavras digitadas precisam aparecer no texto.
export const combina = (texto: string, busca: string) => {
  const t = normalizar(texto);
  return normalizar(busca).split(/\s+/).filter(Boolean).every((palavra) => t.includes(palavra));
};
