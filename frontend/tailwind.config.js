/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0e1a",
        card: "#111827",
        "card-foreground": "#f9fafb",
        popover: "#111827",
        "popover-foreground": "#f9fafb",
        primary: "#00d4ff",
        "primary-foreground": "#0a0e1a",
        secondary: "#7c3aed",
        "secondary-foreground": "#ffffff",
        muted: "#1f2937",
        "muted-foreground": "#9ca3af",
        accent: "#1f2937",
        "accent-foreground": "#f9fafb",
        destructive: "#ef4444",
        "destructive-foreground": "#ffffff",
        border: "#1f2937",
        input: "#1f2937",
        ring: "#00d4ff",
        success: "#10b981",
        foreground: "#f9fafb",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        heading: ["Syne", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
