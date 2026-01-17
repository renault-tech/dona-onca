import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dona Onça | Lingerie & Lifestyle",
  description: "Elegância e sensualidade em cada peça. Descubra nossa coleção exclusiva de lingerie e produtos íntimos.",
  keywords: ["lingerie", "moda íntima", "sensualidade", "elegância", "Dona Onça"],
  openGraph: {
    title: "Dona Onça | Lingerie & Lifestyle",
    description: "Elegância e sensualidade em cada peça.",
    siteName: "Dona Onça",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <Providers>
          <Navbar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}

