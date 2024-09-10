import { Analytics } from '@vercel/analytics/react';
import clsx from 'clsx';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Swift',
  description:
    'A fast, open-source voice assistant powered by Groq, Cartesia, and Vercel.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={clsx(
          GeistSans.variable,
          GeistMono.variable,
          'flex min-h-dvh select-none flex-col justify-between bg-white px-6 py-8 font-sans antialiased lg:p-10 dark:bg-black dark:text-white'
        )}>
        <main className="flex grow flex-col items-center justify-center">
          {children}
        </main>

        <Toaster richColors theme="system" />
        <Analytics />
      </body>
    </html>
  );
}
