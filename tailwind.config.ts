import type { Config } from "tailwindcss";

// Cores vêm de variáveis CSS (ver globals.css): tema escuro neutro com destaque azul-acinzentado.
const v = (nome: string) => `rgb(var(--${nome}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        titulo: ["Geist", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
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
