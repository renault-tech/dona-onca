import type { Metadata } from "next";
import { Fraunces, Archivo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import Footer from "@/components/Footer";
import JsonLd from "@/components/seo/JsonLd";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dona-onca.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Dona Onça | Lingerie & Lifestyle",
    template: "%s | Dona Onça",
  },
  description: "Elegância e sensualidade em cada peça. Descubra nossa coleção exclusiva de lingerie e produtos íntimos.",
  keywords: ["lingerie", "moda íntima", "sensualidade", "elegância", "Dona Onça"],
  openGraph: {
    title: "Dona Onça | Lingerie & Lifestyle",
    description: "Elegância e sensualidade em cada peça.",
    siteName: "Dona Onça",
    type: "website",
    locale: "pt_BR",
    images: ["/og-default.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dona Onça | Lingerie & Lifestyle",
    description: "Elegância e sensualidade em cada peça.",
    images: ["/og-default.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-theme="dark">
      <body className={`${fraunces.variable} ${archivo.variable} font-sans antialiased min-h-screen`}>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Dona Onça',
            url: siteUrl,
            logo: `${siteUrl}/logo.png`,
          }}
        />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Dona Onça',
            url: siteUrl,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${siteUrl}/produtos?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          }}
        />
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
