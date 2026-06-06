import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: [], // No dark mode in Sky Fantasy theme
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Base design system (Sky Fantasy)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Legacy HTML reference colors (kept for backward compat)
        ink: "#080b12",
        panel: "#101522",
        cyan: {
          100: "#d5f4f9",
          200: "#82b7c2",
          300: "#8bb8c2",
        },
        // ===== SKY FANTASY COLOR SYSTEM =====
        // Primary palette
        sky: {
          DEFAULT: "#5CB8FF", // Primary Sky Blue
          soft: "#8DD3FF", // Soft Blue
          light: "#D9F1FF", // Light Blue
        },
        // Secondary palette (Ice/Mist)
        cloud: "#FFFFFF", // Cloud White
        mist: "#F7FBFF", // Mist White
        ice: "#EEF8FF", // Ice Blue
        // Accent palette
        diamond: "#39AFFF", // Diamond Blue
        fantasy: "#63CFFF", // Fantasy Cyan
        glow: "#7FD7FF", // Glow Blue
        // Text colors
        "text-primary": "#1B3A57",
        "text-secondary": "#53718E",
        "text-muted": "#7F99B0",
        // Background gradient stops
        "skybg-start": "#F7FBFF",
        "skybg-mid": "#EAF7FF",
        "skybg-end": "#DFF2FF",
        // Border colors
        "sky-border": "#A8D8F5",   // Visible sky blue border
        "card-border": "#C8E8F8",  // Light card border
      },
      fontFamily: {
        heading: ["var(--font-montserrat)", "sans-serif"],
        body: ["var(--font-poppins)", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Sky Fantasy custom radii
        "sky-sm": "12px",
        "sky-md": "20px",
        "sky-lg": "24px",
        "sky-hero": "32px",
      },
      boxShadow: {
        neon: "0 10px 30px rgba(15, 23, 42, .26)",
        "neon-cyan": "0 0 20px rgba(139, 184, 194, 0.4), 0 0 40px rgba(139, 184, 194, 0.2)",
        // Sky Fantasy shadows
        "sky-soft": "0 8px 20px rgba(92,184,255,.12)",
        "sky-medium": "0 12px 30px rgba(92,184,255,.18)",
        "sky-glow": "0 0 25px rgba(92,184,255,.35)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Legacy shimmer animation kept for Sky Fantasy shimmer
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "auto-shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite linear",
        float: "float 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "auto-shimmer": "auto-shimmer 6s infinite linear",
        fadeIn: "fadeIn 0.25s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
