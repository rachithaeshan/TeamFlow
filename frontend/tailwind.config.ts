import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1E3D",       // deep navy from the logo - primary text/headers
        paper: "#F7F8FB",     // cool off-white background
        line: "#E4E7F0",      // hairline borders
        accent: "#0E71F5",    // logo blue - primary CTA / brand accent
        teal: "#1FB79D",      // logo teal - secondary accent (success/progress)
        amber: "#C98A12",     // logo gold, deepened for text contrast (medium priority)
        red: "#C0392B",       // urgent / blocked
        slate: "#5C6178",
      },
      fontFamily: {
        display: ["'Sora'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
