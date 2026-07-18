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
        // Base design system
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
        // ===== DEEP TEAL COLOR SYSTEM (#28657E) =====
        // Keeping key names (sky, diamond, etc) for backward compatibility with existing components
        sky: {
          DEFAULT: "#28657E", // Primary Deep Teal
          soft: "#4CA1AF", // Soft Teal
          light: "#E8F1F5", // Light Background Teal
        },
        // Secondary palette
        cloud: "#FFFFFF",
        mist: "#F4F7F9",
        ice: "#E0E9EC",
        // Accent palette
        diamond: "#4CA1AF", // Accent Teal
        fantasy: "#28657E", // Main Teal
        glow: "#E28743", // Warm Orange/Gold Accent
        // Text colors
        "text-primary": "#1A2B35", // Darkest Teal/Slate
        "text-secondary": "#53718E",
        "text-muted": "#8A9EA8",
        // Background gradient stops
        "skybg-start": "#F4F7F9",
        "skybg-mid": "#E8F1F5",
        "skybg-end": "#DCE5EA",
        // Border colors
        "sky-border": "#9DB8C4",
        "card-border": "#C9D6DC",
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
