// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        vapor: {
          dark: "#0a0a1a", // Fundo principal (azul meia-noite muito escuro)
          surface: "#171430", // Fundo de cards e painéis (roxo muito escuro)
          border: "#2d2252", // Bordas de separação
        },
        neon: {
          blue: "#00f0ff", // Acentos, ícones ativos, botões primários
          purple: "#b026ff", // Destaques secundários, barras de progresso
          pink: "#ff00ff", // Alertas, streaks, recompensas
        },
      },
      boxShadow: {
        "neon-blue": "0 0 10px rgba(0, 240, 255, 0.5)",
        "neon-purple": "0 0 15px rgba(176, 38, 255, 0.5)",
        "neon-pink": "0 0 15px rgba(255, 0, 255, 0.5)",
      },
    },
  },
  plugins: [],
};
