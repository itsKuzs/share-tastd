import type { Metadata } from "next";
import OpenInApp from "./OpenInApp";

const SUPABASE_REST_URL = "https://chuinihsynmqmnyekibh.supabase.co/rest/v1/profiles";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodWluaWhzeW5tcW1ueWVraWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDAwMjIsImV4cCI6MjA3NjM3NjAyMn0.MOiyXFEEM-A8Sob_w5RFNF_LXEhe-9jD4nawWmtNDe8";

interface Profile {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

async function fetchProfileMeta(username: string): Promise<Profile | null> {
  try {
    const res = await fetch(
      `${SUPABASE_REST_URL}?username=ilike.${encodeURIComponent(username)}&select=username,display_name,avatar_url,bio&limit=1`,
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

function avatarSrc(avatar?: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  if (avatar.length > 100) return `data:image/jpeg;base64,${avatar}`;
  return null;
}

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchProfileMeta(username);

  if (!profile) {
    return {
      title: "Découvre ce profil sur tastd",
      description: "Ouvre tastd pour voir ce profil et ses spots préférés.",
    };
  }

  const displayName = profile.display_name ?? profile.username;
  const title = `${displayName} (@${profile.username}) sur tastd`;
  const description =
    profile.bio ??
    `Découvre ${displayName} sur tastd : ses spots préférés, ses collections et ses recommandations.`;
  const image = avatarSrc(profile.avatar_url) ?? "https://share.tastdapp.com/og-default.png";

  return {
    title,
    description,
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
  const { username } = await params;
  return <OpenInApp username={username.toLowerCase()} />;
}
