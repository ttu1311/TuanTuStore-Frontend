import type { Config } from "tailwindcss";

// Design tokens of TuanTuStore. Change a value here and the whole site follows.
// The palette comes from the products themselves: chàm (indigo dye) for text and actions,
// and one colour per region — chè (tea green) for Bắc, cà phê (dark roast) for Trung, nước mắm (amber) for Nam.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  future: {
    // :hover styles only apply on devices that can really hover (not touch screens)
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      colors: {
        paper: "#FCFCFA", // page background
        ink: { DEFAULT: "#1C2333", muted: "#586074" },
        line: "#DEE0E3",
        surface: "#F0F1EE", // cool rice-paper grey used for alternating sections
        primary: { DEFAULT: "#24315A", dark: "#18213F", soft: "#E5E8F1" }, // chàm indigo
        che: { DEFAULT: "#3F6A3B", soft: "#E4EDE1" }, // Miền Bắc — tea green
        brown: { DEFAULT: "#5B3B2A", soft: "#F0E7E1" }, // Miền Trung — dark-roast coffee
        gold: { DEFAULT: "#C7891F", ink: "#7A4F05", soft: "#F8EDD5", light: "#E2B65C" }, // Miền Nam — fish-sauce amber
        sale: "#B3261E",
        footer: { DEFAULT: "#18213F", text: "#DDE1EC", muted: "#A6AEC4" },
      },
      fontFamily: {
        // --font-display / --font-sans are set in src/app/layout.tsx
        display: ["var(--font-display)", "Arial Narrow", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      fontSize: {
        // Phudu is a condensed face, so titles run a size larger than a regular-width face would
        title: ["2.75rem", { lineHeight: "1.05" }], // section titles (44px)
        hero: ["6rem", { lineHeight: "0.92" }], // hero headline (96px)
      },
      maxWidth: {
        container: "1280px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(28, 35, 51, 0.05), 0 10px 28px rgba(28, 35, 51, 0.08)",
        soft: "0 1px 2px rgba(28, 35, 51, 0.05)",
      },
      scrollPadding: {
        header: "140px",
      },
    },
  },
  plugins: [],
};

export default config;
