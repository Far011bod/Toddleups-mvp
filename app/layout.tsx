import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import { DataProvider } from '../src/contexts/DataContext';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <LanguageProvider>
          <AuthProvider>
            <DataProvider>
              {children}
            </DataProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}