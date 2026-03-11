import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: {
    default: 'FBO Airport — Compare Aviation Fuel Prices Nationwide',
    template: '%s | FBO Airport',
  },
  description: 'Compare Jet-A and 100LL fuel prices at FBOs across the United States. Find the cheapest aviation fuel near you with real-time price rankings.',
  metadataBase: new URL('https://fboairport.com'),
  openGraph: {
    type: 'website',
    siteName: 'FBO Airport',
    title: 'FBO Airport — Compare Aviation Fuel Prices Nationwide',
    description: 'Compare Jet-A and 100LL fuel prices at FBOs across the United States.',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
