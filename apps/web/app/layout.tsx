import type { Metadata } from 'next';
import { Inter, Poppins, Noto_Sans_Ethiopic } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

import { Providers } from '@/components/providers';

import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});
const notoSansEthiopic = Noto_Sans_Ethiopic({
  subsets: ['ethiopic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-ethiopic',
});

export const metadata: Metadata = {
  title: 'DineFlow',
  description: 'DineFlow - Modern Restaurant Ordering System',
  manifest: '/manifest.json',
  applicationName: 'DineFlow',
  themeColor: '#F59E0B',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DineFlow',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} ${notoSansEthiopic.variable} font-sans`}
      >
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
