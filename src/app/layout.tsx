import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { DM_Sans } from 'next/font/google';
import { I18nProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';
import './globals.css';
import 'leaflet/dist/leaflet.css';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' });

export const metadata: Metadata = {
  title: { template: '%s — NovaRide', default: 'NovaRide Admin' },
  description: 'NovaRide Operations Dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={dmSans.variable} style={{ fontFamily: 'var(--font-dm-sans), system-ui' }}>
        <ThemeProvider>
          <I18nProvider>
            {children}
          </I18nProvider>
        </ThemeProvider>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-1)',
            },
          }}
        />
      </body>
    </html>
  );
}