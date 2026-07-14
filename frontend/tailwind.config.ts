import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#161A2E",       // deep indigo-navy - primary text/headers
        paper: "#F8F9FC",     // cool off-white background
        line: "#E3E6EF",      // hairline borders
        accent: "#5B5FEF",    // indigo - primary CTA / brand accent
        teal: "#12897F",      // secondary accent (success/progress)
        amber: "#B7791F",     // warnings / medium priority
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
