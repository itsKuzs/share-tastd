import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PlacesGrid from "./PlacesGrid";

const SUPABASE_FUNCTION_URL =
  "https://chuinihsynmqmnyekibh.supabase.co/functions/v1/get-public-collection-v7";

// Anon key publique (rotated 2026-04-21). Nécessaire car la function est en verify_jwt: true.
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodWluaWhzeW5tcW1ueWVraWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NTg5ODYsImV4cCI6MjA5MjMzNDk4Nn0.lTvEU1tDlA70aQhx7HcjIwLAmGHsmGJ4mPUN39L9auI";

const APP_STORE_URL = "https://apps.apple.com/app/id6762545598";

// ============================================================================
// Types
// ============================================================================

interface Owner {
  display_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  city?: string | null;
  is_verified?: boolean | null;
  supporter_tier?: string | null;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  emoji: string | null;
  cover: string | null;
  created_at: string;
  owner: Owner | null;
}

interface Place {
  id: string;
  name: string;
  address: string | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  cover_urls: string[] | null;
}

interface Stamp {
  place_id: string;
  note: string | null;
  recommendation: string | null;
  tags: string[] | null;
  photos: string[] | null;
  count: number | null;
  last_stamped_at: string | null;
}

interface Collaborator {
  id: string;
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  is_verified?: boolean | null;
  supporter_tier?: string | null;
}

interface AddedBy {
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
}

interface Review {
  user_id: string;
  note: string;
  recommendation: string;
  tags: string[];
  photos: string[];
  created_at: string;
  updated_at: string;
  profile?: {
    id?: string;
    display_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
    is_verified?: boolean | null;
    supporter_tier?: string | null;
  } | null;
}

interface Item {
  place_id: string;
  added_at: string;
  place: Place | null;
  stamp?: Stamp | null;  // legacy v6 fallback
  added_by?: AddedBy | null;
  reviews?: Review[];
}

interface ApiResponse {
  collection: Collection;
  items: Item[];
  collaborators?: Collaborator[];
  place_count: number;
}

// ============================================================================
// Data fetching
// ============================================================================

async function fetchCollection(id: string): Promise<ApiResponse | null> {
  try {
    const res = await fetch(`${SUPABASE_FUNCTION_URL}?id=${encodeURIComponent(id)}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as ApiResponse;
  } catch {
    return null;
  }
}

// ============================================================================
// Metadata (Open Graph for Insta / iMessage / Twitter)
// ============================================================================

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const data = await fetchCollection(id);
  if (!data) {
    return { title: "Collection introuvable — tastd" };
  }
  const { collection } = data;
  const ownerName = collection.owner?.display_name ?? "Quelqu'un";
  const title = `${collection.name} — par ${ownerName}`;
  const contributorNames: string[] = [];
  if (collection.owner?.username) contributorNames.push(`@${collection.owner.username}`);
  for (const c of (data.collaborators ?? [])) {
    if (c.username) contributorNames.push(`@${c.username}`);
  }
  let description: string;
  if (collection.description) {
    description = collection.description;
  } else if (contributorNames.length > 1) {
    const first = contributorNames.slice(0, 2).join(", ");
    const rest = contributorNames.length - 2;
    description = `${data.place_count} spot${data.place_count > 1 ? "s" : ""} • avis de ${first}${rest > 0 ? ` et ${rest} autres` : ""}.`;
  } else {
    description = `${data.place_count} spot${data.place_count > 1 ? "s" : ""} sélectionnés par ${ownerName} sur tastd.`;
  }
  // OG description : tronque à 200 chars pour rester safe sur tous les scrapers
  // (Facebook coupe à 300, Twitter Card à 200, certains tronquent salement).
  if (description.length > 200) {
    description = description.slice(0, 197) + "...";
  }
  const image = collection.cover || "https://share.tastdapp.com/og-default.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 800, alt: collection.name }],
      type: "website",
      siteName: "tastd",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

// ============================================================================
// Helpers
// ============================================================================

function ownerAvatarSrc(avatar?: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  // Legacy: base64 stored directly in DB
  if (avatar.length > 100) return `data:image/jpeg;base64,${avatar}`;
  return null;
}

function placePhotos(place: Place | null, stamp: Stamp | null): string[] {
  if (stamp?.photos && stamp.photos.length > 0) {
    const httpsPhotos = stamp.photos.filter((p) => p.startsWith("http"));
    if (httpsPhotos.length > 0) return httpsPhotos;
  }
  return place?.cover_urls ?? [];
}

function categoryStyle(category: string | null | undefined): {
  emoji: string;
  gradient: string;
} {
  const cat = (category ?? "").toLowerCase();
  if (cat.includes("coffee") || cat.includes("cafe") || cat.includes("café")) {
    return { emoji: "☕", gradient: "linear-gradient(135deg, #FF9F0A 0%, #C7621A 100%)" };
  }
  if (cat.includes("bar") || cat.includes("wine") || cat.includes("cocktail")) {
    return { emoji: "🍸", gradient: "linear-gradient(135deg, #AF52DE 0%, #5B2C82 100%)" };
  }
  if (cat.includes("restaurant") || cat.includes("food")) {
    return { emoji: "🍽️", gradient: "linear-gradient(135deg, #FF6B6B 0%, #B22D2D 100%)" };
  }
  return { emoji: "📍", gradient: "linear-gradient(135deg, #00C6FF 0%, #2F7BFF 100%)" };
}

// ============================================================================
// Page
// ============================================================================

export default async function CollectionSharePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await fetchCollection(id);
  if (!data) notFound();

  const { collection, items, place_count } = data;
  const collaborators = data.collaborators ?? [];
  const ownerName = collection.owner?.display_name ?? "Quelqu'un";
  const ownerHandle = collection.owner?.username ? `@${collection.owner.username}` : "";
  const avatarSrc = ownerAvatarSrc(collection.owner?.avatar_url);

  return (
    <main>
      {/* HERO CINEMATIQUE FULL-WIDTH */}
      <section className="hero-cinema">
        {collection.cover ? (
          <img src={collection.cover} alt={collection.name} className="hero-cinema-bg" />
        ) : (
          <div className="hero-cinema-bg" style={{ background: "linear-gradient(135deg, #00c6ff44, #2f7bff44)" }} />
        )}
        <div className="hero-cinema-overlay" />

        {/* Topbar : brand gauche + owner droite */}
        <div className="hero-topbar">
          <div className="hero-brand">
            <img src="/logo.svg" alt="tastd" className="hero-brand-logo" />
            <span className="hero-brand-sep">·</span>
            <span className="hero-brand-label">collection partagée</span>
          </div>
          <div className="hero-owner">
            <span className="hero-owner-prep">de</span>
            <div className="hero-owner-avatar">
              {avatarSrc ? (
                <img src={avatarSrc} alt={ownerName} />
              ) : (
                <div className="hero-owner-avatar-fallback" />
              )}
            </div>
            <div className="hero-owner-info">
              <div className="hero-owner-name">
                {ownerName}
                {collection.owner?.is_verified && <span className="verified" title="Compte vérifié">✓</span>}
              </div>
              {ownerHandle && <div className="hero-owner-handle">{ownerHandle}</div>}
            </div>
          </div>
        </div>

        {/* Bottom overlay : tag + titre + count + collaborateurs */}
        <div className="hero-bottom">
          <div className="hero-cinema-tag">
            {collection.emoji ?? "📁"} COLLECTION TASTD
          </div>
          <h1 className="hero-cinema-title">{collection.name}</h1>
          <div className="hero-cinema-count">
            {place_count} spot{place_count > 1 ? "s" : ""}{collection.owner?.city ? ` · ${collection.owner.city}` : ""}
          </div>
          {collaborators.length > 0 && (
            <div className="hero-collabs">
              <div className="hero-collabs-avatars">
                {collaborators.slice(0, 4).map((c, i) => {
                  const src = ownerAvatarSrc(c.avatar_url);
                  return (
                    <div key={c.id} className="hero-collab-avatar" style={{ zIndex: 10 - i }}>
                      {src ? <img src={src} alt={c.display_name ?? c.username ?? ""} /> : <div className="hero-collab-avatar-fallback">{(c.display_name ?? c.username ?? "?").slice(0, 1).toUpperCase()}</div>}
                    </div>
                  );
                })}
              </div>
              <span className="hero-collabs-label">
                avec {collaborators.length === 1
                  ? (collaborators[0].display_name ?? `@${collaborators[0].username}`)
                  : `${collaborators.length} collaborateurs`}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Description (si existe) */}
      {collection.description && (
        <div className="shell">
          <div className="description">{collection.description}</div>
        </div>
      )}

      {/* Grille des spots — Pinterest style avec modal au clic */}
      <div className="shell shell-grid">
        <h2 className="section-title">Les spots · tape pour voir les notes</h2>

        {items.length === 0 ? (
          <div className="empty">Cette collection ne contient encore aucun spot.</div>
        ) : (
          <PlacesGrid items={items} />
        )}

        <div className="footer">
          Créé sur tastd — l'app pour curer tes spots préférés.
        </div>

        <div className="cta-inline">
          <a href={APP_STORE_URL} className="cta-button" target="_blank" rel="noopener">
            Ouvrir dans tastd · télécharger l'app
          </a>
        </div>
      </div>
    </main>
  );
}

// (PlaceCard ancien rendu single-column supprimé — remplacé par PlacesGrid + modal)
