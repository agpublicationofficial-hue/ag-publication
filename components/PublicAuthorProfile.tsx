"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";

export type PublicAuthorProfileProps = {
  username: string;
};

type ProfileRow = Record<string, any>;
type LinkRow = Record<string, any>;
type BookRow = Record<string, any>;
type ServiceRow = Record<string, any>;

function firstValue(row: ProfileRow | null | undefined, keys: string[]) {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== null && value !== undefined && String(value).trim() !== "") {
      return value;
    }
  }
  return null;
}

function normalizeUsername(value: string) {
  return decodeURIComponent(value || "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
}

function safeUrl(value: unknown) {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  try {
    const url = new URL(raw.match(/^https?:\/\//i) ? raw : `https://${raw}`);
    return url.href;
  } catch {
    return null;
  }
}

export default function PublicAuthorProfile({
  username,
}: PublicAuthorProfileProps) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [author, setAuthor] = useState<ProfileRow | null>(null);
  const [socialLinks, setSocialLinks] = useState<LinkRow[]>([]);
  const [customLinks, setCustomLinks] = useState<LinkRow[]>([]);
  const [externalBooks, setExternalBooks] = useState<BookRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);

  const normalizedUsername = useMemo(
    () => normalizeUsername(username),
    [username]
  );

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const supabase = createClient();

        const { data: profileData, error: profileError } = await supabase
          .from("author_profiles")
          .select("*")
          .ilike("username", normalizedUsername)
          .maybeSingle();

        if (profileError) {
          console.error("Public author profile error:", profileError);
          if (active) setNotFound(false);
          return;
        }

        if (!profileData) {
          if (active) setNotFound(true);
          return;
        }

        if (!active) return;

        setProfile(profileData);

        const authorId =
          profileData.author_id ||
          profileData.user_id ||
          profileData.id ||
          null;

        const results = await Promise.allSettled([
          authorId
            ? supabase
                .from("authors")
                .select("id, full_name, role")
                .eq("id", authorId)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null }),
          authorId
            ? supabase
                .from("author_social_links")
                .select("*")
                .eq("author_id", authorId)
                .order("created_at", { ascending: true })
            : Promise.resolve({ data: [], error: null }),
          authorId
            ? supabase
                .from("author_custom_links")
                .select("*")
                .eq("author_id", authorId)
                .order("created_at", { ascending: true })
            : Promise.resolve({ data: [], error: null }),
          authorId
            ? supabase
                .from("author_external_books")
                .select("*")
                .eq("author_id", authorId)
                .order("created_at", { ascending: true })
            : Promise.resolve({ data: [], error: null }),
          authorId
            ? supabase
                .from("author_services")
                .select("*")
                .eq("author_id", authorId)
                .order("created_at", { ascending: true })
            : Promise.resolve({ data: [], error: null }),
        ]);

        if (!active) return;

        const [authorResult, socialResult, customResult, booksResult, servicesResult] =
          results;

        if (authorResult.status === "fulfilled") {
          setAuthor(authorResult.value.data || null);
        }

        if (socialResult.status === "fulfilled") {
          setSocialLinks(socialResult.value.data || []);
        }

        if (customResult.status === "fulfilled") {
          setCustomLinks(customResult.value.data || []);
        }

        if (booksResult.status === "fulfilled") {
          setExternalBooks(booksResult.value.data || []);
        }

        if (servicesResult.status === "fulfilled") {
          setServices(servicesResult.value.data || []);
        }
      } catch (error) {
        console.error("Public author profile exception:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (normalizedUsername) {
      loadProfile();
    } else {
      setLoading(false);
      setNotFound(true);
    }

    return () => {
      active = false;
    };
  }, [normalizedUsername]);

  const displayName =
    firstValue(profile, [
      "display_name",
      "name",
      "full_name",
      "author_name",
      "title",
    ]) ||
    firstValue(author, ["full_name", "name"]) ||
    `@${normalizedUsername}`;

  const headline = firstValue(profile, [
    "headline",
    "tagline",
    "designation",
    "profession",
  ]);

  const bio = firstValue(profile, [
    "bio",
    "about",
    "description",
    "short_bio",
  ]);

  const avatarUrl = safeUrl(
    firstValue(profile, [
      "avatar_url",
      "profile_image_url",
      "profile_photo_url",
      "image_url",
      "photo_url",
    ])
  );

  const websiteUrl = safeUrl(
    firstValue(profile, ["website", "website_url", "portfolio_url"])
  );

  const visibleSocialLinks = socialLinks
    .map((item) => {
      const url = safeUrl(
        firstValue(item, ["url", "link", "profile_url", "href"])
      );
      const label =
        firstValue(item, ["label", "platform", "title", "name"]) ||
        "Social profile";
      return url ? { url, label: String(label) } : null;
    })
    .filter(Boolean) as { url: string; label: string }[];

  const visibleCustomLinks = customLinks
    .map((item) => {
      const url = safeUrl(
        firstValue(item, ["url", "link", "href", "target_url"])
      );
      const label =
        firstValue(item, ["label", "title", "name", "text"]) ||
        "Open link";
      return url ? { url, label: String(label) } : null;
    })
    .filter(Boolean) as { url: string; label: string }[];

  const location = firstValue(profile, ["location", "city"]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f3ed] px-6 text-[#171717]">
        <div className="rounded-3xl border border-black/10 bg-white px-8 py-7 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-black" />
          <p className="mt-4 text-sm text-black/55">Loading author profile...</p>
        </div>
      </main>
    );
  }

  if (notFound || !profile) {
    return (
      <main className="min-h-screen bg-[#f6f3ed] px-6 py-20 text-[#171717]">
        <div className="mx-auto max-w-xl rounded-3xl border border-black/10 bg-white p-8 text-center shadow-sm">
          <p className="text-xs uppercase tracking-[0.25em] text-black/40">
            A&G PUBLICATION
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Author profile not found
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/50">
            The username <span className="font-medium text-black">@{normalizedUsername}</span> does not have a public profile yet, or the profile link is no longer active.
          </p>
          <a
            href="/authors"
            className="mt-7 inline-flex rounded-full bg-[#171717] px-5 py-3 text-sm font-medium text-white transition hover:bg-black/80"
          >
            Browse Authors
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f3ed] text-[#171717]">
      <header className="border-b border-black/10 bg-[#f6f3ed]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <a href="/" className="tracking-tight">
            <span className="text-xl font-semibold">A&G</span>{" "}
            <span className="font-light">PUBLICATION</span>
          </a>

          <div className="flex items-center gap-3">
            <a
              href="/authors"
              className="rounded-full border border-black/15 px-4 py-2 text-xs font-medium transition hover:bg-black/5 sm:px-5 sm:text-sm"
            >
              Authors
            </a>
            <a
              href="/"
              className="hidden rounded-full bg-[#171717] px-5 py-2 text-sm font-medium text-white transition hover:bg-black/80 sm:inline-flex"
            >
              A&G Home
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm">
          <div className="h-36 bg-[#1c1c1a] sm:h-44" />

          <div className="px-6 pb-8 sm:px-10 sm:pb-10">
            <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-5">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#e9e3d8] text-3xl font-semibold shadow-md sm:h-32 sm:w-32">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={String(displayName)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    String(displayName).slice(0, 1).toUpperCase()
                  )}
                </div>

                <div className="pb-1">
                  <p className="text-xs uppercase tracking-[0.22em] text-black/40">
                    Author Profile
                  </p>
                  <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
                    {displayName}
                  </h1>
                  <p className="mt-1 text-sm text-black/45">@{normalizedUsername}</p>
                </div>
              </div>

              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit rounded-full bg-[#171717] px-5 py-3 text-sm font-medium text-white transition hover:bg-black/80"
                >
                  Visit Website ↗
                </a>
              )}
            </div>

            {headline && (
              <p className="mt-7 text-base font-medium text-black/70">{headline}</p>
            )}

            {bio && (
              <div className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-black/55">
                {bio}
              </div>
            )}

            {location && (
              <p className="mt-4 text-sm text-black/40">📍 {location}</p>
            )}

            {visibleSocialLinks.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2">
                {visibleSocialLinks.map((item, index) => (
                  <a
                    key={`${item.url}-${index}`}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-black/15 px-4 py-2 text-xs font-medium transition hover:bg-black/5"
                  >
                    {item.label} ↗
                  </a>
                ))}
              </div>
            )}

            {visibleCustomLinks.length > 0 && (
              <section className="mt-10">
                <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                  Links
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {visibleCustomLinks.map((item, index) => (
                    <a
                      key={`${item.url}-${index}`}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-black/10 bg-[#faf9f6] p-5 transition hover:border-black/25 hover:bg-white"
                    >
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="mt-1 break-all text-xs text-black/40">{item.url}</p>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {externalBooks.length > 0 && (
              <section className="mt-10">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                    Books
                  </p>
                  <h2 className="mt-2 text-2xl font-medium tracking-tight">
                    Published & featured titles
                  </h2>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {externalBooks.map((book, index) => {
                    const bookUrl = safeUrl(
                      firstValue(book, ["url", "link", "book_url", "purchase_url"])
                    );
                    const title =
                      firstValue(book, ["title", "book_title", "name"]) ||
                      "Book";
                    const subtitle = firstValue(book, [
                      "description",
                      "subtitle",
                      "publisher",
                    ]);

                    return (
                      <div
                        key={`${String(title)}-${index}`}
                        className="rounded-2xl border border-black/10 bg-[#faf9f6] p-5"
                      >
                        <p className="font-medium">{title}</p>
                        {subtitle && (
                          <p className="mt-2 text-sm leading-6 text-black/50">
                            {subtitle}
                          </p>
                        )}
                        {bookUrl && (
                          <a
                            href={bookUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 inline-flex text-sm font-medium underline underline-offset-4"
                          >
                            View book ↗
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {services.length > 0 && (
              <section className="mt-10">
                <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                  Services
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {services.map((service, index) => {
                    const title =
                      firstValue(service, ["title", "name", "service_name"]) ||
                      "Publishing Service";
                    const description = firstValue(service, [
                      "description",
                      "details",
                      "subtitle",
                    ]);

                    return (
                      <div
                        key={`${String(title)}-${index}`}
                        className="rounded-2xl border border-black/10 p-5"
                      >
                        <p className="font-medium">{title}</p>
                        {description && (
                          <p className="mt-2 text-sm leading-6 text-black/50">
                            {description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <div className="mt-12 border-t border-black/10 pt-6 text-center text-xs text-black/35">
              Public author profile • A&G PUBLICATION
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
