import type { Config } from "tailwindcss";

// Cores vêm de variáveis CSS (ver globals.css): a paleta da BGS Pro Fitness.
const v = (nome: string) => `rgb(var(--${nome}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      fontFamily: {
        sans: ["Barlow", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        titulo: ["Big Shoulders Display", "Barlow", "system-ui", "sans-serif"],
      },
      colors: {
        fundo: v("fundo"),
        superficie: v("superficie"),
        corpo: v("corpo"),
        linha: v("linha"),
        tinta: v("tinta"),
        suave: v("suave"),
        primario: v("primario"),
        alerta: v("alerta"),
        brasa: v("brasa"),
        secundario: v("secundario"),
        "sobre-secundario": v("sobre-secundario"),
        aberto: v("aberto"),
        boneco: v("boneco"),
        "boneco-longe": v("boneco-longe"),
        fantasma: v("fantasma"),
        equip: v("equip"),
      },
    },
  },
  plugins: [],
};
export default config;
