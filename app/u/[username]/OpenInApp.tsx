"use client";

import { useEffect } from "react";

const APP_STORE_URL = "https://apps.apple.com/app/id6762545598";

interface Props {
  username: string;
}

/**
 * Page de redirection :
 * - App tastd installée → s'ouvre sur le profil via custom scheme `tastd://u/<username>`
 * - Pas installée → redirection App Store après 1.5s
 * - Desktop ou non-iOS → redirection App Store immédiate
 */
export default function OpenInApp({ username }: Props) {
  useEffect(() => {
    // encodeURIComponent : si l'username contient `/`, `?`, `#` ou autre char spécial
    // (en théorie validé serveur via USERNAME_REGEX, mais on défend en profondeur),
    // on l'échappe pour ne pas injecter une route deep-link différente.
    const deepLink = `tastd://u/${encodeURIComponent(username)}`;
    const ua = navigator.userAgent || "";
    const isIOS = /iPhone|iPad|iPod/i.test(ua);

    if (!isIOS) {
      window.location.replace(APP_STORE_URL);
      return;
    }

    const start = Date.now();
    window.location.href = deepLink;

    const t = setTimeout(() => {
      const elapsed = Date.now() - start;
      if (document.visibilityState === "visible" && elapsed < 2500) {
        window.location.replace(APP_STORE_URL);
      }
    }, 1500);

    return () => clearTimeout(t);
  }, [username]);

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#000",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: 12,
          }}
        >
          tastd
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>
          Ouverture en cours…
        </div>
      </div>
    </main>
  );
}
