/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "echo-green": "#18d87e",
        "echo-teal": "#0fb7a3",
        "echo-deep": "#02221a",
        spotify: {
          DEFAULT: "#1DB954",
          light: "#22e065",
          dark: "#168f42",
        },
        background: "#0a0a0a",
        foreground: "#ededed",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "18px",
        "3xl": "24px",
      },
      fontFamily: {
        // React Native registers one font family name per weight (no
        // automatic synthetic-weight switching for custom fonts like on web),
        // so each Tailwind weight gets its own family token. See src/lib/fonts.ts.
        sans: ["GeistSans"],
        "sans-medium": ["GeistSansMedium"],
        "sans-semibold": ["GeistSansSemiBold"],
        "sans-bold": ["GeistSansBold"],
        mono: ["GeistMono"],
        serif: ["PlayfairDisplayItalic"],
      },
      boxShadow: {
        "spotify-cta": "0 8px 30px rgba(24,216,126,0.12), inset 0 -2px 10px rgba(0,0,0,0.25)",
        "spotify-cta-hover": "0 14px 40px rgba(24,216,126,0.16)",
        "glow-spotify": "0 0 16px -2px rgba(29,185,84,0.5)",
      },
      letterSpacing: {
        widest2: "0.2em",
      },
    },
  },
  plugins: [],
};
