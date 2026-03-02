import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      /* ── ClearTrail Design Tokens ── */
      colors: {
        brand: {
          50: "#EEF6FF",
          100: "#D9EAFF",
          200: "#BCDBFF",
          300: "#8EC5FF",
          400: "#59A3FF",
          500: "#3381FF", /* Primary */
          600: "#1B5FF5",
          700: "#144AE1",
          800: "#173DB6",
          900: "#193990",
          950: "#142457",
        },
        surface: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#EEEEEE",
          300: "#E0E0E0",
          400: "#BDBDBD",
          500: "#9E9E9E",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121",
          950: "#121212",
        },
        success: {
          50: "#ECFDF5",
          500: "#10B981",
          700: "#047857",
        },
        warning: {
          50: "#FFFBEB",
          500: "#F59E0B",
          700: "#B45309",
        },
        danger: {
          50: "#FEF2F2",
          500: "#EF4444",
          700: "#B91C1C",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        display: ['"Outfit"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "sidebar": "260px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        dropdown: "0 4px 12px rgba(0,0,0,0.08)",
        modal: "0 20px 60px rgba(0,0,0,0.15)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-in": "slideIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
