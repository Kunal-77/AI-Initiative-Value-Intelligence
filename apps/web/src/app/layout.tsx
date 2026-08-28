import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "AI Initiative Value Intelligence",
  description: "B2B AI investment decision intelligence platform",
  alternates: {
    canonical: "https://ai-initiative-value-intelligence-we.vercel.app/",
  },
  openGraph: {
    title: "AI Initiative Value Intelligence",
    description: "B2B AI investment decision intelligence platform",
    url: "https://ai-initiative-value-intelligence-we.vercel.app/",
    type: "website",
    images: [
      {
        url: "https://ai-initiative-value-intelligence-we.vercel.app/hero-shield.png",
        width: 1024,
        height: 1024,
        alt: "AI Initiative Value Intelligence Logo",
      },
    ],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://ai-initiative-value-intelligence-we.vercel.app/#organization",
      "name": "AI Initiative Value Intelligence",
      "url": "https://ai-initiative-value-intelligence-we.vercel.app/",
      "logo": "https://ai-initiative-value-intelligence-we.vercel.app/favicon.ico"
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://ai-initiative-value-intelligence-we.vercel.app/#software",
      "name": "Value Intelligence",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "url": "https://ai-initiative-value-intelligence-we.vercel.app/",
      "description": "B2B AI investment decision intelligence platform to model ROIs, review governance gates, and manage personal workspaces.",
      "publisher": {
        "@id": "https://ai-initiative-value-intelligence-we.vercel.app/#organization"
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

