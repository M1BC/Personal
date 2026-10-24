import type { MetadataRoute } from "next";

// Gera /manifest.webmanifest: é o que permite "Instalar app" / "Adicionar à tela inicial".
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Treino & Nutrição Consciente",
    short_name: "Treino & Nutrição",
    description: "Entenda o porquê de cada exercício e de cada grama de proteína.",
    lang: "pt-BR",
    start_url: "/anatomia",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0c0c0d",
    theme_color: "#0c0c0d",
    categories: ["health", "fitness", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
