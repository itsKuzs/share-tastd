import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — tastd",
  description: "Page en construction.",
};

export default function MentionsLegalesPage() {
  return (
    <main
      style={{
        minHeight: "calc(100vh - 200px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
        gap: 14,
      }}
    >
      <div style={{ fontSize: 48 }} aria-hidden>🚧</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
        Page en construction
      </h1>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", maxWidth: 420, lineHeight: 1.5 }}>
        Les mentions légales de tastd seront publiées ici très bientôt. En attendant, tu peux
        nous écrire à <a href="mailto:hello@tastd.app" style={{ color: "#66c8ff" }}>hello@tastd.app</a> pour toute demande.
      </p>
      <a
        href="/"
        style={{
          marginTop: 18,
          padding: "12px 22px",
          borderRadius: 999,
          background: "linear-gradient(90deg, #66c8ff 0%, #2f7bff 100%)",
          color: "#fff",
          fontWeight: 600,
          fontSize: 14,
          textDecoration: "none",
        }}
      >
        Retour
      </a>
    </main>
  );
}
