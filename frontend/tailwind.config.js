/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#11d452", // Bright Green / Pista-ish neon
                "secondary": "#D4AF37", // Gold
                "background-light": "#f6f8f6",
                "background-dark": "#102216", // Deep Dark Green
                "surface-dark": "#162e1f", // Slightly lighter green for cards
            },
            fontFamily: {
                "display": ["Noto Serif", "serif"],
                "body": ["Noto Sans", "sans-serif"],
                "sans": ["Noto Sans", "sans-serif"],
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
        },
    },
    plugins: [],
}
