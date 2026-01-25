import type { Metadata } from "next";
import { Montserrat, Cinzel } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import Footer from "@/components/Footer";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="pt-BR" className="dark">
      <body className={`${montserrat.variable} ${cinzel.variable} font-sans antialiased min-h-screen`}>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
