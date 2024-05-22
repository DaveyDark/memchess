/** @type {import('tailwindcss').Config} */
export default {
  content: ["src/**/*.tsx"],
  theme: {
    fontFamily: {
      quicksand: ["Quicksand", "sans-serif"],
    },
    extend: {},
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#51958f",
          secondary: "#263044",
          accent: "#92b8b3",
          neutral: "#53c2cf",
          "base-100": "#d0e9dd",
          info: "#92b8b3",
          success: "#51958f",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
