import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { ConfirmationProvider } from '../providers/ConfirmationProvider';
import { Toaster } from 'react-hot-toast';
import ClientNavbarWrapper from '@/components/layout/ClientNavbarWrapper';
import FooterWrapper from '@/components/layout/FooterWrapper';
import ScrollManager from '@/components/layout/ScrollManager';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Restaurant Business',
  description: 'A comprehensive restaurant management system',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.className} min-h-screen relative flex flex-col`}
      >
        <AuthProvider>
          <CartProvider>
            <ConfirmationProvider>
              <ScrollManager />
              <ClientNavbarWrapper />
              <div className='flex-grow'>{children}</div>
              <FooterWrapper />
            </ConfirmationProvider>
          </CartProvider>
        </AuthProvider>
        <Toaster
          position='bottom-center'
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10b981',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
