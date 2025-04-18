import type { Metadata } from "next";

const siteConfig = {
  name: "Halal Bites ATL",
  description: "Discover the best halal restaurants and Muslim-owned cafes in Atlanta. Your comprehensive guide to authentic halal dining experiences in the ATL area.",
  url: "https://halalbitesatl.org",
  ogImage: "https://halalbitesatl.org/og-image.jpg",
  keywords: [
    "halal food atlanta",
    "muslim restaurants atlanta",
    "halal restaurants georgia",
    "atlanta halal guide",
    "muslim owned cafes atlanta",
    "zabiha restaurants atlanta",
    "halal dining atl",
    "islamic restaurants atlanta",
    "atlanta muslim food",
    "halal food near me"
  ].join(", "),
};

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: "Halal Bites ATL" }],
  creator: "Halal Bites ATL",
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@halalbitesatl",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
  },
}; 