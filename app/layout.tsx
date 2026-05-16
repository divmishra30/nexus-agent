import './globals.css';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import { GA_TRACKING_ID } from '@/lib/gtag';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Nexus Agent | Premium AI Workspace',
  description: 'Industrial-grade AI agent orchestration with high-fidelity UI components and autonomous development capabilities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans flex flex-col min-h-screen bg-[var(--color-background-default)] text-slate-900 antialiased`}>
        <Header />
        
        {/* 
          Main content wrapper: 
          - pt-20 to account for fixed header height
          - flex-grow to push footer to the bottom of the viewport
          - overflow-x-hidden to prevent horizontal scrollbars from entrance animations
        */}
        <div className="flex-grow pt-20 overflow-x-hidden">
          {children}
        </div>
        {/* Agent Widget Script */}
        <Script src="/agent-widget.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
