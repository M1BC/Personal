import type { MetadataRoute } from "next";

// Gera /manifest.webmanifest: é o que permite "Instalar app" / "Adicionar à tela inicial" (e a publicação na Play Store).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "BGS Pro Fitness",
    short_name: "BGS",
    description: "Seu treino, sua alimentação e seus suplementos na BGS Pro Fitness, com o porquê de cada escolha.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#100D0C",
    theme_color: "#100D0C",
    categories: ["health", "fitness", "education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
