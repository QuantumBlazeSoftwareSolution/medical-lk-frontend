import type { Metadata } from 'next';
import {
  Inter,
  Plus_Jakarta_Sans,
  Playfair_Display,
  Montserrat,
  Raleway,
  Outfit,
  DM_Sans,
  Lora,
  Cormorant_Garamond,
  Space_Grotesk,
  Josefin_Sans,
  Nunito,
} from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import Providers from '@/components/Providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-raleway',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-josefin',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
});

const allFontVars = [
  inter.variable,
  plusJakartaSans.variable,
  playfairDisplay.variable,
  montserrat.variable,
  raleway.variable,
  outfit.variable,
  dmSans.variable,
  lora.variable,
  cormorantGaramond.variable,
  spaceGrotesk.variable,
  josefinSans.variable,
  nunito.variable,
].join(' ');

export const metadata: Metadata = {
  title: 'Medical.lk | Premium Pharmacy SaaS & POS',
  description: 'The ultimate multi-tenant pharmacy management and cloud Point of Sale (POS) system.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Medical.lk',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${allFontVars} font-sans bg-slate-950 text-slate-100 min-h-full antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
