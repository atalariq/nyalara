/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,ts,jsx,tsx}"],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        // ─────────────────────────────────────────────────────────
        // Brand
        // ─────────────────────────────────────────────────────────
        brand: {
          DEFAULT: "#25CE7F",
          hover: "#1FAC6A",
          subtle: "#D3F5E5",
          muted: "#B6EFD4",
        },

        // ─────────────────────────────────────────────────────────
        // Black / Neutral
        // ─────────────────────────────────────────────────────────
        black: {
          DEFAULT: "#111111",
          soft: "#1C1C1C",
          subtle: "#3A3A3A",
        },

        // ─────────────────────────────────────────────────────────
        // Background
        // ─────────────────────────────────────────────────────────
        background: {
          DEFAULT: "#FFFFFF",
          secondary: "#F5F5F5",
        },

        // ─────────────────────────────────────────────────────────
        // Surface
        // ─────────────────────────────────────────────────────────
        surface: {
          DEFAULT: "#FFFFFF",
          raised: "#F1F1F1",
          overlay: "#E5E5E5",
        },

        // ─────────────────────────────────────────────────────────
        // Foreground / Text
        // ─────────────────────────────────────────────────────────
        foreground: {
          DEFAULT: "#1C1C1C",
          secondary: "#686868",
          muted: "#8E8E8E",
          disabled: "#B3B3B3",
          inverse: "#FFFFFF",
        },

        // ─────────────────────────────────────────────────────────
        // Border
        // ─────────────────────────────────────────────────────────
        border: {
          DEFAULT: "#D2D2D2",
          strong: "#B3B3B3",
          brand: "#25CE7F",
        },
      },

      fontFamily: {
        sans: ["Manrope-Regular"],

        regular: ["Manrope-Regular"],
        medium: ["Manrope-Medium"],
        semibold: ["Manrope-SemiBold"],
        bold: ["Manrope-Bold"],
        extrabold: ["Manrope-ExtraBold"],
      },
    },
  },

  plugins: [],
};
