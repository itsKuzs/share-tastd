export default function Home() {
  return (
    <main className="shell" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <img
        src="/logo.svg"
        alt="tastd"
        style={{ height: 56, width: "auto", filter: "brightness(0) invert(1)", marginBottom: 16 }}
      />
      <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", maxWidth: 420, marginBottom: 28 }}>
        L'app pour sauvegarder, stamper et partager tes spots préférés — restaurants, cafés, bars.
      </p>
      <a
        href="https://apps.apple.com/app/id6762545598"
        className="cta-button"
        style={{ maxWidth: 320 }}
        target="_blank"
        rel="noopener"
      >
        Télécharger sur l'App Store
      </a>
    </main>
  );
}
