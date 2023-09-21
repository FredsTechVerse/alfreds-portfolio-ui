/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    fontFamily: {
      primary: ["Lexend Deca", "sans-serif"],
    },
    screens: {
      phone: "300px",
      tablet: "568px",
      laptop: "1024px",
      "2xl": "1400px",
    },
    extend: {
      colors: {
        primary: "#313bac",
        secondary: "#F0F7FF",
        card: "#F1F1F1",
      },
      aspectRatio: {
        "2/3": "2 / 3",
      },
    },
  },
  plugins: [],
};
