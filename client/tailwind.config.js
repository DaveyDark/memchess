/** @type {import('tailwindcss').Config} */
export default {
  content: ["src/**/*.tsx"],
  theme: {
    fontFamily: {
      quicksand: ["Quicksand", "sans-serif"],
      mono: ["Major Mono Display", "monospace"],
    },
    extend: {
      colors: {
        "avatar-1": "#fa9dad",
        "avatar-2": "#ffc8dd",
        "avatar-3": "#bde0fe",
        "avatar-4": "#edede9",
        "avatar-5": "#afa5ec",
        "avatar-6": "#cff6a6",
        "avatar-7": "#fcf6bd",
        "avatar-8": "#95e6bd",
      },
    },
  },
  safelist: [
    "bg-avatar-1",
    "bg-avatar-2",
    "bg-avatar-3",
    "bg-avatar-4",
    "bg-avatar-5",
    "bg-avatar-6",
    "bg-avatar-7",
    "bg-avatar-8",
  ],
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
