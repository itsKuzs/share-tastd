export default function NotFound() {
  return (
    <main className="shell" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🤷</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Collection introuvable</h1>
      <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", maxWidth: 360, marginBottom: 28 }}>
        Le lien est peut-être expiré ou la collection a été supprimée par son créateur.
      </p>
      <a
        href="https://apps.apple.com/app/id6762545598"
        className="cta-button"
        style={{ maxWidth: 320 }}
        target="_blank"
        rel="noopener"
      >
        Découvrir tastd
      </a>
    </main>
  );
}
