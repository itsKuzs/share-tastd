"use client";

import { useEffect, useState } from "react";

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

interface AddedBy {
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
}

interface ReviewProfile {
  id?: string;
  display_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  is_verified?: boolean | null;
  supporter_tier?: string | null;
}

interface Review {
  user_id: string;
  note: string;
  recommendation: string;
  tags: string[];
  photos: string[];
  created_at: string;
  updated_at: string;
  profile?: ReviewProfile | null;
}

interface Item {
  place_id: string;
  added_at: string;
  place: Place | null;
  stamp?: Stamp | null;
  added_by?: AddedBy | null;
  reviews?: Review[];
}

function addedByAvatar(avatar?: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
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

export default function PlacesGrid({ items }: { items: Item[] }) {
  const [openItem, setOpenItem] = useState<Item | null>(null);

  // Bloque le scroll du body quand modal ouvert
  useEffect(() => {
    if (openItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [openItem]);

  return (
    <>
      <div className="spots-grid">
        {items.map((item) => (
          <GridCard key={item.place_id} item={item} onOpen={() => setOpenItem(item)} />
        ))}
      </div>

      {openItem && (
        <PlaceModal item={openItem} onClose={() => setOpenItem(null)} />
      )}
    </>
  );
}

function GridCard({ item, onOpen }: { item: Item; onOpen: () => void }) {
  const { place, stamp, added_by, reviews } = item;
  if (!place) return null;
  const photos = placePhotos(place, stamp ?? null);
  const style = categoryStyle(place.category);
  const reviewCount = (reviews ?? []).filter(r => (r.note?.trim() ?? "").length > 0 || (r.recommendation?.trim() ?? "").length > 0).length;
  const hasContent = reviewCount > 0 || (stamp?.note?.trim() ?? "").length > 0 || (stamp?.recommendation?.trim() ?? "").length > 0;
  const tagCount = (stamp?.tags ?? []).length;
  const adderSrc = addedByAvatar(added_by?.avatar_url);
  const adderName = added_by?.display_name ?? (added_by?.username ? `@${added_by.username}` : null);

  return (
    <button className="grid-card" onClick={onOpen}>
      {photos.length > 0 ? (
        <img src={photos[0]} alt={place.name} className="grid-card-img" />
      ) : (
        <div className="grid-card-placeholder" style={{ background: style.gradient }}>
          <span className="grid-card-placeholder-emoji">{style.emoji}</span>
        </div>
      )}
      <div className="grid-card-body">
        <div className="grid-card-name">{place.name}</div>
        {reviewCount > 0 ? (
          <div className="grid-card-hint">
            <span className="grid-card-tag-count">{reviewCount} avis</span>
          </div>
        ) : hasContent && (
          <div className="grid-card-hint">
            {stamp?.note && "📝"}
            {stamp?.recommendation && " ✨"}
            {tagCount > 0 && (
              <span className="grid-card-tag-count">
                {tagCount} tag{tagCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
        {adderName && (
          <div className="grid-card-adder">
            {adderSrc ? (
              <img src={adderSrc} alt={adderName} className="grid-card-adder-avatar" />
            ) : (
              <div className="grid-card-adder-avatar grid-card-adder-fallback">{adderName.replace("@", "").slice(0, 1).toUpperCase()}</div>
            )}
            <span className="grid-card-adder-name">par {adderName}</span>
          </div>
        )}
      </div>
    </button>
  );
}

function PlaceModal({ item, onClose }: { item: Item; onClose: () => void }) {
  const { place, stamp, reviews } = item;
  if (!place) return null;
  const photos = placePhotos(place, stamp ?? null);
  const style = categoryStyle(place.category);
  const tags = stamp?.tags ?? [];
  const validReviews = (reviews ?? []).filter(r => (r.note?.trim() ?? "").length > 0 || (r.recommendation?.trim() ?? "").length > 0);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fermer">
          ✕
        </button>
        {photos.length > 0 ? (
          <div className="modal-photos">
            {photos.length === 1 ? (
              <img src={photos[0]} alt={place.name} className="modal-photo-single" />
            ) : (
              <div className="modal-photo-strip">
                {photos.slice(0, 3).map((url, i) => (
                  <img key={i} src={url} alt={`${place.name} ${i + 1}`} className="modal-photo-strip-img" />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="modal-placeholder" style={{ background: style.gradient }}>
            <span className="modal-placeholder-emoji">{style.emoji}</span>
          </div>
        )}
        <div className="modal-body">
          <h3 className="modal-name">{place.name}</h3>
          {place.address && <div className="modal-address">{place.address}</div>}

          {tags.length > 0 && (
            <div className="tag-row">
              {tags.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          )}

          {validReviews.length > 0 ? (
            <div className="reviews-block">
              <div className="reviews-block-label">{validReviews.length} avis</div>
              {validReviews.map((r, i) => {
                const src = addedByAvatar(r.profile?.avatar_url);
                const name = r.profile?.display_name ?? (r.profile?.username ? `@${r.profile.username}` : "Anonyme");
                return (
                  <div key={i} className="review-card">
                    <div className="review-header">
                      {src ? (
                        <img src={src} alt={name} className="review-avatar" />
                      ) : (
                        <div className="review-avatar review-avatar-fallback">{name.replace("@", "").slice(0, 1).toUpperCase()}</div>
                      )}
                      <div className="review-name">{name}</div>
                    </div>
                    {r.note.trim().length > 0 && (
                      <div className="review-note">{r.note}</div>
                    )}
                    {r.recommendation.trim().length > 0 && (
                      <div className="review-reco">
                        <span className="review-reco-icon">✨</span>
                        <span>{r.recommendation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              {stamp?.note && stamp.note.trim().length > 0 && (
                <div className="block">
                  <div className="block-label">📝 Note</div>
                  <div className="block-text">{stamp.note}</div>
                </div>
              )}

              {stamp?.recommendation && stamp.recommendation.trim().length > 0 && (
                <div className="block">
                  <div className="block-label">✨ Recommandation</div>
                  <div className="block-text">{stamp.recommendation}</div>
                </div>
              )}

              {(!stamp?.note || !stamp.note.trim()) && (!stamp?.recommendation || !stamp.recommendation.trim()) && tags.length === 0 && (
                <div className="empty">Pas encore de note pour ce spot.</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
