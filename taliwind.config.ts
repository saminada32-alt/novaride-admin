import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                zinc: {
                    950: '#09090b',
                },
            },
            fontFamily: {
                sans: ['DM Sans', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            borderColor: {
                DEFAULT: '#27272a',
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease forwards',
                'slide-in': 'slideIn 0.2s ease forwards',
                'pulse-slow': 'pulse 3s ease infinite',
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                slideIn: {
                    from: { opacity: '0', transform: 'translateY(8px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
};

export default config;