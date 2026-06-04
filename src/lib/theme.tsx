'use client';

import {
    createContext, useContext,
    useState, useEffect, ReactNode,
} from 'react';

// ─── Types ────────────────────────────────────────────────────
export type ColorAccent = 'indigo' | 'violet' | 'cyan' | 'emerald' | 'rose' | 'amber';
export type FontSize = 'sm' | 'md' | 'lg';
export type PanelMode = 'dark' | 'light' | 'midnight' | 'dim';
export type SidebarSize = 'normal' | 'compact';
export type Radius = 'sharp' | 'normal' | 'round';
export type Density = 'comfortable' | 'compact' | 'spacious';

export interface ThemeSettings {
    mode: PanelMode;
    accent: ColorAccent;
    fontSize: FontSize;
    sidebarSize: SidebarSize;
    radius: Radius;
    density: Density;
    animations: boolean;
    blur: boolean;
}

const DEFAULT: ThemeSettings = {
    mode: 'dark',
    accent: 'indigo',
    fontSize: 'md',
    sidebarSize: 'normal',
    radius: 'normal',
    density: 'comfortable',
    animations: true,
    blur: true,
};

// ─── CSS Variables per theme ──────────────────────────────────
export const MODES: Record<PanelMode, Record<string, string>> = {
    dark: {
        '--bg': '#09090b',
        '--bg-card': '#111114',
        '--bg-hover': '#18181b',
        '--border': 'rgba(255,255,255,0.07)',
        '--border-2': 'rgba(255,255,255,0.12)',
        '--text-1': '#fafafa',
        '--text-2': '#a1a1aa',
        '--text-3': '#71717a',
        '--text-4': '#52525b',
        '--sidebar-bg': 'rgba(10,10,15,0.95)',
        '--header-bg': 'rgba(9,9,11,0.90)',
    },
    midnight: {
        '--bg': '#020208',
        '--bg-card': '#0a0a14',
        '--bg-hover': '#10101e',
        '--border': 'rgba(255,255,255,0.06)',
        '--border-2': 'rgba(255,255,255,0.10)',
        '--text-1': '#f0f0ff',
        '--text-2': '#9898bb',
        '--text-3': '#6868aa',
        '--text-4': '#444466',
        '--sidebar-bg': 'rgba(2,2,8,0.97)',
        '--header-bg': 'rgba(2,2,8,0.92)',
    },
    dim: {
        '--bg': '#1a1a24',
        '--bg-card': '#22222e',
        '--bg-hover': '#2a2a38',
        '--border': 'rgba(255,255,255,0.08)',
        '--border-2': 'rgba(255,255,255,0.14)',
        '--text-1': '#e8e8f0',
        '--text-2': '#9090a8',
        '--text-3': '#6868808',
        '--text-4': '#505068',
        '--sidebar-bg': 'rgba(26,26,36,0.97)',
        '--header-bg': 'rgba(26,26,36,0.92)',
    },
    light: {
        '--bg': '#f4f4f8',
        '--bg-card': '#22222e',
        '--bg-hover': '#2a2a38',
        '--border': 'rgba(0,0,0,0.08)',
        '--border-2': 'rgba(0,0,0,0.14)',
        '--text-1': '#111118',
        '--text-2': '#4a4a5a',
        '--text-3': '#050507',
        '--text-4': '#060608',
        '--sidebar-bg': 'rgba(26,26,36,0.97)',
        '--header-bg': 'rgba(2,2,8,0.92)',
    },
};

export const ACCENTS: Record<ColorAccent, Record<string, string>> = {
    indigo: { '--accent': '#6366f1', '--accent-2': '#818cf8', '--accent-glow': 'rgba(99,102,241,0.25)' },
    violet: { '--accent': '#8b5cf6', '--accent-2': '#a78bfa', '--accent-glow': 'rgba(139,92,246,0.25)' },
    cyan: { '--accent': '#06b6d4', '--accent-2': '#22d3ee', '--accent-glow': 'rgba(6,182,212,0.25)' },
    emerald: { '--accent': '#10b981', '--accent-2': '#34d399', '--accent-glow': 'rgba(16,185,129,0.25)' },
    rose: { '--accent': '#f43f5e', '--accent-2': '#fb7185', '--accent-glow': 'rgba(244,63,94,0.25)' },
    amber: { '--accent': '#f59e0b', '--accent-2': '#fbbf24', '--accent-glow': 'rgba(245,158,11,0.25)' },
};

export const FONT_SIZES: Record<FontSize, string> = {
    sm: '13px',
    md: '14px',
    lg: '15px',
};

export const RADII: Record<Radius, string> = {
    sharp: '6px',
    normal: '12px',
    round: '20px',
};

export const DENSITIES: Record<Density, string> = {
    compact: '12px',
    comfortable: '20px',
    spacious: '32px',
};

export const SIDEBAR_WIDTHS: Record<SidebarSize, string> = {
    normal: '260px',
    compact: '68px',
};

// ─── Context ──────────────────────────────────────────────────
interface ThemeContextType {
    theme: ThemeSettings;
    update: (patch: Partial<ThemeSettings>) => void;
    reset: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: DEFAULT,
    update: () => { },
    reset: () => { },
});

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<ThemeSettings>(() => {
        if (typeof window === 'undefined') return DEFAULT;
        try {
            const saved = localStorage.getItem('nr_theme');
            return saved ? { ...DEFAULT, ...JSON.parse(saved) } : DEFAULT;
        } catch { return DEFAULT; }
    });

    // Apply CSS variables whenever theme changes
    useEffect(() => {
        const root = document.documentElement;

        // Mode colors
        Object.entries(MODES[theme.mode]).forEach(([k, v]) => {
            root.style.setProperty(k, v);
        });

        // Accent colors
        Object.entries(ACCENTS[theme.accent]).forEach(([k, v]) => {
            root.style.setProperty(k, v);
        });

        // Font size
        root.style.setProperty('--font-size', FONT_SIZES[theme.fontSize]);
        root.style.fontSize = FONT_SIZES[theme.fontSize];

        // Border radius
        root.style.setProperty('--radius', RADII[theme.radius]);

        // Density (padding)
        root.style.setProperty('--density', DENSITIES[theme.density]);

        // Sidebar width
        root.style.setProperty('--sidebar-w', SIDEBAR_WIDTHS[theme.sidebarSize]);

        // Animations
        root.style.setProperty('--transition', theme.animations ? '0.15s' : '0s');

        // Save
        localStorage.setItem('nr_theme', JSON.stringify(theme));
    }, [theme]);

    function update(patch: Partial<ThemeSettings>) {
        setTheme(prev => ({ ...prev, ...patch }));
    }

    function reset() {
        setTheme(DEFAULT);
    }

    return (
        <ThemeContext.Provider value={{ theme, update, reset }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}