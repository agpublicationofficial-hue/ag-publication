"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function MyBooks() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);

  const fetchMyBooks = async (showRefreshing = false) => {
    const supabase = createClient();

    if (showRefreshing) {
      setRefreshing(true);
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setBooks([]);
        return;
      }

      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("My Books fetch error:", error);
        setBooks([]);
        return;
      }

      setBooks(data || []);
    } catch (error) {
      console.error("My Books error:", error);
      setBooks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let channel: any = null;
    let cancelled = false;

    const setup = async () => {
      const supabase = createClient();

      await fetchMyBooks();

      if (cancelled) {
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) {
        return;
      }

      channel = supabase.channel(`my-books-live-${user.id}`);

      channel.on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "books",
          filter: `author_id=eq.${user.id}`,
        },
        async (payload: any) => {
          if (cancelled) {
            return;
          }

          console.log("My Books realtime update:", payload);

          await fetchMyBooks();
        }
      );

      channel.subscribe((status: string) => {
        if (cancelled) {
          return;
        }

        console.log("My Books realtime status:", status);

        if (status === "SUBSCRIBED") {
          setLiveConnected(true);
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          setLiveConnected(false);
        }
      });
    };

    setup();

    return () => {
      cancelled = true;

      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f6f3ed] text-[#171717]">
      {/* Header */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <div>
            <Link
              href="/author-dashboard"
              className="text-xs text-black/40 transition hover:text-black"
            >
              ← Author Dashboard
            </Link>

            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
                My Books
              </h1>

              <span
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-medium ${
                  liveConnected
                    ? "bg-green-100 text-green-700"
                    : "bg-black/5 text-black/40"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    liveConnected
                      ? "bg-green-500"
                      : "bg-black/30"
                  }`}
                />

                {liveConnected ? "Live" : "Connecting"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchMyBooks(true)}
              disabled={refreshing}
              className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-xs font-medium transition hover:border-black/25 hover:bg-[#faf9f6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1c1c1a] text-sm font-medium text-white">
              A
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        {/* Intro */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/35">
              Your library
            </p>

            <p className="mt-2 max-w-xl text-sm leading-6 text-black/50">
              View your books, publishing status and production progress.
            </p>
          </div>

          <Link
            href="/submit-manuscript"
            className="inline-flex w-fit rounded-xl bg-[#171717] px-5 py-3 text-sm font-medium text-white transition hover:bg-black"
          >
            + Submit New Manuscript
          </Link>
        </div>

        {/* Books */}
        {loading ? (
          <div className="rounded-2xl border border-black/10 bg-white p-10 text-center">
            <p className="text-sm text-black/50">
              Loading your books...
            </p>
          </div>
        ) : books.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 bg-white/60 px-6 py-14 text-center">
            <p className="text-sm font-medium">
              No books found
            </p>

            <p className="mt-2 text-xs text-black/40">
              Your submitted manuscripts and publishing projects will appear
              here.
            </p>

            <Link
              href="/submit-manuscript"
              className="mt-5 inline-block text-xs font-medium underline underline-offset-4"
            >
              Submit your manuscript
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {books.map((book) => {
              const rawProgress = Number(book.progress ?? 0);

              const progress = Number.isFinite(rawProgress)
                ? Math.min(100, Math.max(0, rawProgress))
                : 0;

              const status = book.status || "In Production";

              return (
                <article
                  key={book.id}
                  className="overflow-hidden rounded-2xl border border-black/10 bg-white"
                >
                  <div className="flex flex-col gap-6 p-6 sm:flex-row sm:p-7">
                    {/* Book Cover */}
                    <div className="flex h-64 w-full shrink-0 items-center justify-center rounded-xl bg-[#252523] text-center text-white shadow-lg sm:h-72 sm:w-48">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.35em] text-white/40">
                          A&G Publication
                        </p>

                        <div className="my-8 h-px w-20 bg-white/20" />

                        <p className="px-3 text-xl font-light leading-tight tracking-[0.06em]">
                          {book.title}
                        </p>

                        <div className="mt-8 h-px w-20 bg-white/20" />

                        <p className="mt-3 text-[9px] uppercase tracking-[0.25em] text-white/40">
                          A&G
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={`rounded-full px-3 py-1.5 text-[10px] font-medium ${
                            status === "Published"
                              ? "bg-[#e9eee8] text-[#38503a]"
                              : "bg-[#f1ece2] text-[#685a3c]"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <h2 className="mt-5 text-xl font-medium leading-snug">
                        {book.title}
                      </h2>

                      <p className="mt-2 text-sm text-black/45">
                        Publishing Project
                      </p>

                      <div className="my-6 h-px bg-black/10" />

                      {/* Publishing Progress */}
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-black/40">
                            Publishing Progress
                          </span>

                          <span className="font-semibold">
                            {progress}%
                          </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
                          <div
                            className="h-full rounded-full bg-[#171717] transition-all duration-500"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-[#f8f6f1] p-3">
                          <p className="text-[10px] uppercase tracking-wider text-black/35">
                            Royalty
                          </p>

                          <p className="mt-1 text-lg font-medium">
                            {book.royalty_rate ?? 70}%
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#f8f6f1] p-3">
                          <p className="text-[10px] uppercase tracking-wider text-black/35">
                            Status
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {status}
                          </p>
                        </div>
                      </div>

                      <Link
                        href="/publishing-progress"
                        className="mt-5 w-full rounded-xl border border-black/10 px-4 py-3 text-center text-sm font-medium transition hover:border-black hover:bg-[#faf9f6]"
                      >
                        View Publishing Progress →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 flex flex-col justify-between gap-3 border-t border-black/10 pt-6 text-xs text-black/35 sm:flex-row">
          <span>© 2026 A&G Publication</span>
          <span>Author Portal • My Books</span>
        </footer>
      </section>
    </main>
  );
}