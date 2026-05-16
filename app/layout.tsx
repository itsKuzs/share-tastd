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
      <body>
        {children}
        <footer
          style={{
            padding: "24px 16px 40px",
            textAlign: "center",
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            background: "#000",
          }}
        >
          <div style={{ marginBottom: 6 }}>
            <a
              href="https://tastdapp.com/mentions-legales"
              style={{ color: "inherit", textDecoration: "underline" }}
              target="_blank"
              rel="noopener"
            >
              Mentions légales
            </a>
            {" · "}
            <a
              href="https://privacy.tastdapp.com"
              style={{ color: "inherit", textDecoration: "underline" }}
              target="_blank"
              rel="noopener"
            >
              Confidentialité
            </a>
            {" · "}
            <a
              href="https://tastdapp.com"
              style={{ color: "inherit", textDecoration: "underline" }}
              target="_blank"
              rel="noopener"
            >
              tastdapp.com
            </a>
          </div>
          <div>© 2026 tastd</div>
        </footer>
      </body>
    </html>
  );
}
