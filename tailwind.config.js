/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.ts",
    "./App.{ts,tsx}",
    "./src/screens/**/*.{tsx,ts,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}",
    "./src/**/**/*.{ts,tsx,js,jsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        title: ["SpaceGrotesk-Bold"],
        medium: ["SpaceGrotesk-Medium"],
        mono: ["SpaceMono-Regular"],
        "mono-bold": ["SpaceMono-Bold"],
      }
    },
  },
  plugins: [],
}
