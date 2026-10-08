import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GoodWaste - Platform Pengelolaan Sampah Cerdas & Daur Ulang Berkelanjutan',
  description: 'Pindai sampah Anda, dapatkan panduan kerajinan DIY, kumpulkan Eco Points, dan temukan titik buang terdekat di Indonesia.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-medium text-slate-700">
                <span>GoodWaste Indonesia</span>
                <span className="text-slate-300">•</span>
                <span>Inisiatif Pengurangan Jejak Karbon</span>
              </div>
              <p>Mendukung pengelolaan sampah bertanggung jawab & ekonomi sirkular.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
