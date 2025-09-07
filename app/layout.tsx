import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '../src/providers/AppProviders';


export const metadata: Metadata = {
  title: 'Toddle Ups - Master Software Skills',
  description: 'Learn Excel, PowerPoint, Photoshop, and more with gamified micro-lessons designed for young professionals.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}