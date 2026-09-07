import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#0B0D11",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-initiative-value-intelligence-we.vercel.app/"),
  title: {
    default: "AIVI — AI Initiative Value Intelligence",
    template: "%s | AIVI",
  },
  description: "Institutional AI investment decision intelligence platform to model ROIs, review governance stage-gates, and manage personal & enterprise workspaces.",
  keywords: [
    "AI Investment",
    "Value Intelligence",
    "ROI Modeling",
    "Stage-Gate Governance",
    "AI Financial Analytics",
    "Subscription Intelligence",
  ],
  authors: [{ name: "AIVI Team" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AIVI — AI Initiative Value Intelligence",
    description: "Institutional AI investment decision intelligence platform to model ROIs, review governance stage-gates, and audit value realization.",
    url: "https://ai-initiative-value-intelligence-we.vercel.app/",
    siteName: "AIVI",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/favicon.ico",
        width: 512,
        height: 512,
        alt: "AIVI — AI Initiative Value Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIVI — AI Initiative Value Intelligence",
    description: "Institutional AI investment decision intelligence platform.",
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

