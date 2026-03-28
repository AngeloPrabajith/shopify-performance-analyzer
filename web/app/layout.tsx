import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loadly",
  description:
    "Analyze any Shopify storefront in seconds. Detect performance issues, heavy scripts, render-blocking resources, and installed apps affecting your store's speed.",
  keywords: "Shopify, performance, analyzer, page speed, Core Web Vitals, store optimization",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Loadly",
    description: "Detect what's slowing down your Shopify store, for free.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
