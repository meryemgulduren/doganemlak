/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Renk Yerleşim Planı - doganemlak
        background: "#FAF7F0",   // Floral White - arka plan
        "text-dark": "#30230D",  // Dark Coffee - metin
        primary: "#B4812E",      // Dark Goldenrod - ana renk, önemli butonlar
        secondary: "#CBA24B",    // Golden Bronze - alt başlıklar, ikonlar
        accent: "#F1D882",       // Jasmine - hover, ince ayırıcı çizgiler
      },
      fontFamily: {
        sans: ["system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
