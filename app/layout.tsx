import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "tastd — share your spots",
  description: "Discover curated spots from real foodies. Restaurants, cafés, bars — the places people actually go.",
  metadataBase: new URL("https://share.tastdapp.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta name="apple-itunes-app" content="app-id=6762545598" />
      </head>
      <body>{children}</body>
    </html>
  );
}
