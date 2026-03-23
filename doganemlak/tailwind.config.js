/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        cream: "#F0EBE3",
        surface: "#FFFFFF",
        "text-dark": "#30230D",
        muted: "#5C5348",
        primary: "#A66F2C",
        secondary: "#8B7355",
        accent: "#E8E4DC",
        border: "#D8D3CA",
        bordeaux: "#49111C",
        danger: "#B91C1C",
        success: "#2F855A",
        warning: "#B45309",
        highlight: "#8B7355",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(73 17 28 / 0.06), 0 1px 2px -1px rgb(48 35 13 / 0.05)",
        "card-hover":
          "0 14px 32px -10px rgb(73 17 28 / 0.1), 0 6px 12px -6px rgb(48 35 13 / 0.08)",
      },
    },
  },
  plugins: [],
};
