import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Insighta Labs+',
  description: 'Profile intelligence portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
