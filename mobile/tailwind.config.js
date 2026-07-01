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
          on: "#05210f",
        },
        background: "#0a0a0a",
        "background-elevated": "#0d130d",
        foreground: "#ededed",
        // Semantic accents — keep in sync with src/lib/theme/tokens.ts `colors`.
        accent: {
          blue: "#60a5fa",
          purple: "#a78bfa",
          red: "#f87171",
          amber: "#f59e0b",
          cyan: "#67e8f9",
          violet: "#c4b5fd",
        },
      },
      // Keep in sync with src/lib/theme/tokens.ts `spacing`.
      spacing: {
        "screen-x": "20px",
        "screen-top": "72px",
        "screen-bottom": "140px",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "18px",
        "3xl": "24px",
        // Bottom-sheet top corners (RandomNostalgiaSheet/DateRangeSheet/
        // ShareSheet/BottomSheet) — was a bare `rounded-t-[28px]` per file.
        sheet: "28px",
      },
      // A deliberately small scale replacing ad hoc `text-[Npx]` arbitrary
      // values, named by literal pixel size (`text-11`, `text-17`, ...) so it
      // *adds* tokens without colliding with Tailwind's own default named
      // scale (text-xs/sm/base/lg/xl/2xl/3xl), which the app already uses
      // elsewhere at its default sizes. Keep in sync with
      // src/lib/theme/tokens.ts `fontSize`.
      fontSize: {
        9: ["9px", { lineHeight: "13px" }],
        10: ["10px", { lineHeight: "14px" }],
        11: ["11px", { lineHeight: "15px" }],
        12: ["12px", { lineHeight: "17px" }],
        13: ["13px", { lineHeight: "18px" }],
        14: ["14px", { lineHeight: "20px" }],
        15: ["15px", { lineHeight: "21px" }],
        17: ["17px", { lineHeight: "23px" }],
        20: ["20px", { lineHeight: "26px" }],
        26: ["26px", { lineHeight: "32px" }],
        30: ["30px", { lineHeight: "36px" }],
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
