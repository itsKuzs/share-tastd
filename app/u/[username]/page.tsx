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

// Match côté DB : usernames stockés en lowercase, alphanumériques + `.-_`, 3-20 chars.
// On garde la même contrainte côté serveur pour ne pas hit Supabase sur du junk URL.
const USERNAME_REGEX = /^[a-z0-9._-]{3,20}$/;

function normalizeUsername(raw: string): string | null {
  const decoded = (() => {
    try { return decodeURIComponent(raw); } catch { return raw; }
  })();
  const lower = decoded.toLowerCase().trim();
  return USERNAME_REGEX.test(lower) ? lower : null;
}

async function fetchProfileMeta(username: string): Promise<Profile | null> {
  try {
    // `eq.` au lieu de `ilike.` : pas de wildcards % et _ à échapper,
    // exact match (les usernames sont lowercase en DB via RLS / contrainte).
    const res = await fetch(
      `${SUPABASE_REST_URL}?username=eq.${encodeURIComponent(username)}&select=username,display_name,avatar_url,bio&limit=1`,
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
