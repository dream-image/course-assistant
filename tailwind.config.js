const { nextui } = require("@nextui-org/react");
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        opacity: "opacity 1s ease-in-out",
        bgColor: " bgColor 0.5s ease-in-out forwards",
      },
      keyframes: {
        opacity: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        bgColor: {
          "0%": {
            backgroundColor: "rgba(0,0,0,0)",
            boxShadow: "0 0 0 0 rgba(0,0,0,0)",
          },
          "100%": {
            backgroundColor: "#eef2ff",
            boxShadow: "0 0 8px 0.3px rgba(0,0,0,0.1)",
          },
        },
      },
    },
    fontFamily: {
      song: ["宋体"],
      kai: ["华文行楷"],
    },
  },
  plugins: [
    nextui({
      layout: {
        borderWidth: {
          small: "1px", // border-small
          medium: "1px", // border-medium
          large: "2px", // border-large
        },
      },
    }),
  ],
};
