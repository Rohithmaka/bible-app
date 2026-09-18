/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        card: "#1E1E2E",
        player: "#4FC3F7",
        rival: "#FF4655",
        win: "#69FF6E",
        loss: "#FF4655",
        gold: "#FFD700",
        border: "#2E2E3E",
        muted: "#8E8E9F"
      },
      fontFamily: {
        pixel: ["PressStart2P", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    },
  },
  plugins: [],
}
