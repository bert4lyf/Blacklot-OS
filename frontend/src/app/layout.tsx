import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Backlot | Autonomous Media & Render Farm AI Agent',
  description: 'Autonomous Media Production & VFX Render Farm Agent powered by Google Gemini and ClickHouse',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased bg-studio-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
