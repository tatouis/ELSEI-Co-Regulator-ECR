import type { Metadata } from 'next';
import './globals.css';
import { SimulationProvider } from '@/lib/simulationStore';

export const metadata: Metadata = {
  title: 'ECR – ELSEI Co-Regulator | AI for Self-Regulated Learning',
  description:
    'An AI pedagogical co-regulator for the Master ELSEI program at École Normale Supérieure, Abdelmalek Essaâdi University.',
  keywords: ['learning analytics', 'self-regulated learning', 'metacognition', 'ELSEI', 'ENS'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <SimulationProvider>{children}</SimulationProvider>
      </body>
    </html>
  );
}
