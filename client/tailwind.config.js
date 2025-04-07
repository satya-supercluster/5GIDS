/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      primary: "Orbitron",
      secondary: "Rajdhani",
      tertiary: "Aldrich",
      quarternary: "exo",
    },
    container: {
      padding: {
        DEFAULT: "15px",
      },
    },
    maxWidth: {
      page: "1200px",
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "960px",
      xl: "1200px",
    },
    extend: {
      colors: {
        primary: "#074A43",
        accent: "#0c5b1c",
      },
    },
  },
  plugins: [],
};
