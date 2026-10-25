import type { Config } from "tailwindcss";

// Cores vêm de variáveis CSS (ver globals.css), para alternar entre modo escuro e claro.
const v = (nome: string) => `rgb(var(--${nome}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        fundo: v("fundo"),
        superficie: v("superficie"),
        corpo: v("corpo"),
        linha: v("linha"),
        tinta: v("tinta"),
        suave: v("suave"),
        primario: v("primario"),
        secundario: v("secundario"),
        "sobre-secundario": v("sobre-secundario"),
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
