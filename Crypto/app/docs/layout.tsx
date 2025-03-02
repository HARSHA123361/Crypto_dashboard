import '../globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { ThemeProvider } from '@/components/theme-provider';
import { ModeToggle } from '@/components/mode-toggle';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Documentation - Crypto Price Tracker',
  description: 'Documentation for the Crypto Price Tracker application',
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <header className="border-b">
          <div className="container mx-auto py-4 px-4 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-bold">
                Crypto Price Tracker
              </Link>
              <nav>
                <ul className="flex gap-4">
                  <li>
                    <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs" className="font-medium">
                      Documentation
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
            <ModeToggle />
          </div>
        </header>
        <main className={inter.className}>{children}</main>
      </ThemeProvider>
    </>
  );
}