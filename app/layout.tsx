import type { Metadata } from "next";
import "./globals.css";
import {
  Courier_Prime,
  Oswald,
  Playfair_Display
} from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap"
});

const courier = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-courier",
  display: "swap"
});

const oswald = Oswald({
  weight: ["300", "500", "700"],
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap"
});

export const metadata: Metadata = {
  title: "AdVerse.media | Cinematic B2B",
  description:
    "AdVerse Media turns B2B brands into cinematic stories. French New Wave aesthetics for SaaS, fintech, and enterprise launches.",
  keywords: [
    "AdVerse",
    "B2B cinema",
    "film production",
    "SaaS marketing",
    "creative agency"
  ],
  metadataBase: new URL("https://adverse.media"),
  openGraph: {
    title: "AdVerse.media | Cinematic B2B",
    description:
      "Stop making content. Start making cinema. Production-grade storytelling for ambitious B2B brands.",
    url: "https://adverse.media",
    siteName: "AdVerse Media",
    images: [
      {
        url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Cinematic B2B marketing reel"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    site: "@adversemedia",
    creator: "@adversemedia",
    title: "AdVerse.media | Cinematic B2B",
    description:
      "French New Wave aesthetics for SaaS, fintech, and enterprise launches.",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop"
    ]
  },
  icons: {
    icon: "/icon.svg"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${courier.variable} ${oswald.variable}`}
    >
      <body className="bg-film-black text-silver-screen antialiased">
        {children}
      </body>
    </html>
  );
}

