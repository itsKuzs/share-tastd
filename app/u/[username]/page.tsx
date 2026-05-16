import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OpenInApp from "./OpenInApp";

const SUPABASE_REST_URL = "https://chuinihsynmqmnyekibh.supabase.co/rest/v1/profiles";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodWluaWhzeW5tcW1ueWVraWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDAwMjIsImV4cCI6MjA3NjM3NjAyMn0.MOiyXFEEM-A8Sob_w5RFNF_LXEhe-9jD4nawWmtNDe8";
const DEFAULT_OG_IMAGE = "https://share.tastdapp.com/og-default.png";

interface Profile {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

// Contrainte côté DB : usernames alphanumériques + `.-_`, 3-20 chars.
// Le regex tolère majuscules/minuscules car 6 users legacy ont des majuscules
// (Huvng, Chips, Lorna, LemVa, Luca, Lala) — on garde ilike pour rester
// case-insensitive sans devoir migrer la DB.
const USERNAME_REGEX = /^[A-Za-z0-9._-]{3,20}$/;

function normalizeUsername(raw: string): string | null {
  const decoded = (() => {
    try { return decodeURIComponent(raw); } catch { return raw; }
  })();
  const trimmed = decoded.trim();
  return USERNAME_REGEX.test(trimmed) ? trimmed : null;
}

/// Échappe les wildcards PostgREST ilike : `%` (multi-char), `_` (single-char), `\` (escape).
/// Notre regex bloque déjà `%` et `\`, mais `_` est autorisé dans les usernames donc
/// sans escape, `foo_bar` matcherait aussi `fooXbar`.
function escapeIlike(s: string): string {
  return s.replace(/[\\%_]/g, "\\$&");
}

async function fetchProfileMeta(username: string): Promise<Profile | null> {
  try {
    const pattern = escapeIlike(username);
    const res = await fetch(
      `${SUPABASE_REST_URL}?username=ilike.${encodeURIComponent(pattern)}&select=username,display_name,avatar_url,bio&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Profile[];
    return data[0] ?? null;
  } catch {
    return null;
  }
}

/// Avatar OG : seules les URLs HTTP marchent dans les scrapers (FB, Twitter, iMessage).
/// Les base64 data URLs ne sont PAS rendues comme preview → fallback sur og-default.
function ogImageURL(avatar?: string | null): string {
  if (avatar && avatar.startsWith("http")) return avatar;
  return DEFAULT_OG_IMAGE;
}

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username: rawUsername } = await params;
  const username = normalizeUsername(rawUsername);
  if (!username) {
    return {
      title: "Découvre ce profil sur tastd",
      description: "Ouvre tastd pour voir ce profil et ses spots préférés.",
      robots: { index: false, follow: false },
    };
  }
  const profile = await fetchProfileMeta(username);

  if (!profile) {
    return {
      title: "Découvre ce profil sur tastd",
      description: "Ouvre tastd pour voir ce profil et ses spots préférés.",
      robots: { index: false, follow: false },
    };
  }

  const displayName = profile.display_name ?? profile.username;
  const title = `${displayName} (@${profile.username}) sur tastd`;
  const description =
    profile.bio ??
    `Découvre ${displayName} sur tastd : ses spots préférés, ses collections et ses recommandations.`;
  const image = ogImageURL(profile.avatar_url);

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 1200, alt: displayName }],
      type: "profile",
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

export default async function ProfileSharePage(
  { params }: { params: Promise<{ username: string }> }
) {
  const { username: rawUsername } = await params;
  const username = normalizeUsername(rawUsername);
  if (!username) notFound();
  const profile = await fetchProfileMeta(username);
  if (!profile) notFound();
  return <OpenInApp username={username} />;
}
