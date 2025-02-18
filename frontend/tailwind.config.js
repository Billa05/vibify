/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
	  "./index.html",
	  "./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
	  extend: {
		borderRadius: {
		  lg: "var(--radius)",
		  md: "calc(var(--radius) - 2px)",
		  sm: "calc(var(--radius) - 4px)",
		},
		colors: {
		  background: "hsl(var(--background))",
		  foreground: "hsl(var(--foreground))",
		  card: {
			DEFAULT: "hsl(var(--card))",
			foreground: "hsl(var(--card-foreground))",
		  },
		  popover: {
			DEFAULT: "hsl(var(--popover))",
			foreground: "hsl(var(--popover-foreground))",
		  },
		  primary: {
			DEFAULT: "hsl(var(--primary))",
			foreground: "hsl(var(--primary-foreground))",
		  },
		  secondary: {
			DEFAULT: "hsl(var(--secondary))",
			foreground: "hsl(var(--secondary-foreground))",
		  },
		  muted: {
			DEFAULT: "hsl(var(--muted))",
			foreground: "hsl(var(--muted-foreground))",
		  },
		  accent: {
			DEFAULT: "hsl(var(--accent))",
			foreground: "hsl(var(--accent-foreground))",
		  },
		  destructive: {
			DEFAULT: "hsl(var(--destructive))",
			foreground: "hsl(var(--destructive-foreground))",
		  },
		  border: "hsl(var(--border))",
		  input: "hsl(var(--input))",
		  ring: "hsl(var(--ring))",
		  chart: {
			"1": "hsl(var(--chart-1))",
			"2": "hsl(var(--chart-2))",
			"3": "hsl(var(--chart-3))",
			"4": "hsl(var(--chart-4))",
			"5": "hsl(var(--chart-5))",
		  },
		},
		keyframes: {
		  scroll: {
			"0%": { transform: "translateX(0)" },
			"100%": { transform: "translateX(-100%)" },
		  },
		},
		animation: {
		  scroll: "scroll var(--animation-duration, 20s) linear infinite",
		},
	  },
	},
	plugins: [require("tailwindcss-animate"),
		addVariablesForColors,
	],
  };
  function addVariablesForColors({ addBase, theme }) {
    const colors = theme("colors");

    function flattenColors(colors, prefix = "") {
        return Object.entries(colors).reduce((acc, [key, value]) => {
            if (typeof value === "object") {
                Object.assign(acc, flattenColors(value, `${prefix}${key}-`));
            } else {
                acc[`--${prefix}${key}`] = value;
            }
            return acc;
        }, {});
    }

    const newVars = flattenColors(colors);

    addBase({
        ":root": newVars,
    });
}

  