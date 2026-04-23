/** @type {import('tailwindcss').Config} */
const config = {
    content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                dark: {
                    bg: '#0f172a',
                    card: '#1e293b',
                    border: '#334155',
                },
                accent: {
                    purple: '#a78bfa',
                    light: '#e9d5ff',
                },
            },
        },
    },
    plugins: [],
}

export default config
