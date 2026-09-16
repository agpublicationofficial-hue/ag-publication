"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Book = {
  id: string;
  title?: string | null;
  author_id?: string | null;
  royalty_rate?: number | null;
  progress?: number | null;
};

type Order = {
  id?: string;
  order_number?: string | null;
  book?: string | null;
  type?: string | null;
  amount?: number | null;
  status?: string | null;
  quantity?: number | null;
  created_at?: string | null;
};

type Manuscript = {
  id?: string;
  title?: string | null;
  genre?: string | null;
  language?: string | null;
  pages?: number | null;
  words?: number | null;
  status?: string | null;
  package?: string | null;
  publishing_preference?: string | null;
  created_at?: string | null;
};

const supabase = createClient();

function normalizeProgress(value: unknown): number {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(number)));
}

function formatCurrency(value: unknown): string {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return "₹0";
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getBookStatus(progress: number): string {
  if (progress >= 100) {
    return "Published";
  }

  if (progress > 0) {
    return "In Progress";
  }

  return "Not Started";
}

function getOrderStatus(status?: string | null): string {
  if (!status) {
    return "Processing";
  }

  const normalized = status.toLowerCase();

  if (
    normalized.includes("complete") ||
    normalized.includes("delivered") ||
    normalized.includes("published")
  ) {
    return "Completed";
  }

  if (
    normalized.includes("cancel") ||
    normalized.includes("reject")
  ) {
    return "Cancelled";
  }

  if (
    normalized.includes("confirm") ||
    normalized.includes("paid")
  ) {
    return "Confirmed";
  }

  return "Processing";
}

function getPackageProgress(status?: string | null): number {
  if (!status) {
    return 25;
  }

  const normalized = status.toLowerCase();

  if (
    normalized.includes("complete") ||
    normalized.includes("delivered") ||
    normalized.includes("published")
  ) {
    return 100;
  }

  if (
    normalized.includes("confirm") ||
    normalized.includes("paid")
  ) {
    return 40;
  }

  if (
    normalized.includes("process") ||
    normalized.includes("production")
  ) {
    return 65;
  }

  if (normalized.includes("review")) {
    return 50;
  }

  if (
    normalized.includes("cancel") ||
    normalized.includes("reject")
  ) {
    return 0;
  }

  return 25;
}

export default function PublishingProgressPage() {
  const router = useRouter();

  const [books, setBooks] = useState<Book[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  /*
   * =========================================================
   * LOAD ALL DATA
   * =========================================================
   */

  const loadData = useCallback(
    async (showLoader = false) => {
      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;

      if (showLoader) {
        setRefreshing(true);
      }

      try {
        setError("");

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error(
            "Publishing progress auth error:",
            userError
          );
        }

        if (!user) {
          router.replace("/author-login");
          return;
        }

        /*
         * =====================================================
         * BOOKS
         *
         * IMPORTANT:
         * Actual book progress comes directly from:
         *
         * books.progress
         *
         * =====================================================
         */

        const {
          data: booksData,
          error: booksError,
        } = await supabase
          .from("books")
          .select(
            "id, title, author_id, royalty_rate, progress"
          )
          .eq("author_id", user.id)
          .order("created_at", {
            ascending: false,
          });

        if (booksError) {
          console.error(
            "Publishing books error:",
            booksError
          );

          if (mountedRef.current) {
            setBooks([]);
            setError(
              booksError.message ||
                "Books could not be loaded."
            );
          }
        } else if (mountedRef.current) {
          setBooks(
            (booksData || []) as Book[]
          );
        }

        /*
         * =====================================================
         * ORDERS
         * =====================================================
         */

        const {
          data: ordersData,
          error: ordersError,
        } = await supabase
          .from("orders")
          .select("*")
          .eq("author_id", user.id)
          .order("created_at", {
            ascending: false,
          });

        if (ordersError) {
          console.error(
            "Publishing orders error:",
            ordersError
          );

          if (mountedRef.current) {
            setOrders([]);
          }
        } else if (mountedRef.current) {
          setOrders(
            (ordersData || []) as Order[]
          );
        }

        /*
         * =====================================================
         * MANUSCRIPTS
         * =====================================================
         */

        const {
          data: manuscriptsData,
          error: manuscriptsError,
        } = await supabase
          .from("manuscripts")
          .select("*")
          .eq("author_id", user.id)
          .order("created_at", {
            ascending: false,
          });

        if (manuscriptsError) {
          console.error(
            "Publishing manuscripts error:",
            manuscriptsError
          );

          if (mountedRef.current) {
            setManuscripts([]);
          }
        } else if (mountedRef.current) {
          setManuscripts(
            (manuscriptsData || []) as Manuscript[]
          );
        }

        if (mountedRef.current) {
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error(
          "Publishing progress error:",
          err
        );

        if (mountedRef.current) {
          setError(
            "Unable to load publishing progress."
          );
        }
      } finally {
        loadingRef.current = false;

        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [router]
  );

  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {
    mountedRef.current = true;

    loadData(true);

    return () => {
      mountedRef.current = false;
    };
  }, [loadData]);

  /*
   * =========================================================
   * REALTIME + FALLBACK LIVE SYNC
   *
   * IMPORTANT:
   * Every .on() is registered BEFORE .subscribe().
   *
   * This prevents:
   *
   * "cannot add postgres_changes callbacks after subscribe()"
   *
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    let booksChannel:
      | ReturnType<typeof supabase.channel>
      | null = null;

    let ordersChannel:
      | ReturnType<typeof supabase.channel>
      | null = null;

    let manuscriptsChannel:
      | ReturnType<typeof supabase.channel>
      | null = null;

    let fallbackInterval: number | null = null;

    const setupRealtime = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error(
          "Realtime auth error:",
          authError
        );
      }

      if (!user || cancelled) {
        return;
      }

      /*
       * =====================================================
       * BOOKS REALTIME
       * =====================================================
       */

      booksChannel = supabase
        .channel(
          `author-books-${user.id}-${Date.now()}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "books",
            filter: `author_id=eq.${user.id}`,
          },
          () => {
            if (!cancelled) {
              loadData(false);
            }
          }
        );

      /*
       * =====================================================
       * ORDERS REALTIME
       * =====================================================
       */

      ordersChannel = supabase
        .channel(
          `author-orders-${user.id}-${Date.now()}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `author_id=eq.${user.id}`,
          },
          () => {
            if (!cancelled) {
              loadData(false);
            }
          }
        );

      /*
       * =====================================================
       * MANUSCRIPTS REALTIME
       * =====================================================
       */

      manuscriptsChannel = supabase
        .channel(
          `author-manuscripts-${user.id}-${Date.now()}`
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "manuscripts",
            filter: `author_id=eq.${user.id}`,
          },
          () => {
            if (!cancelled) {
              loadData(false);
            }
          }
        );

      /*
       * =====================================================
       * NOW SUBSCRIBE
       *
       * DO NOT ADD .on() AFTER THIS POINT.
       * =====================================================
       */

      booksChannel.subscribe((status) => {
        if (cancelled) {
          return;
        }

        if (status === "SUBSCRIBED") {
          setIsLive(true);
        }
      });

      ordersChannel.subscribe();

      manuscriptsChannel.subscribe();

      /*
       * =====================================================
       * FALLBACK SYNC
       *
       * Even if Realtime is unavailable/misconfigured,
       * dashboard still checks latest data every 10 seconds.
       * =====================================================
       */

      fallbackInterval = window.setInterval(() => {
        if (!cancelled) {
          loadData(false);
        }
      }, 10000);
    };

    setupRealtime();

    return () => {
      cancelled = true;

      setIsLive(false);

      if (fallbackInterval) {
        window.clearInterval(
          fallbackInterval
        );
      }

      if (booksChannel) {
        supabase.removeChannel(
          booksChannel
        );
      }

      if (ordersChannel) {
        supabase.removeChannel(
          ordersChannel
        );
      }

      if (manuscriptsChannel) {
        supabase.removeChannel(
          manuscriptsChannel
        );
      }
    };
  }, [loadData]);

  /*
   * =========================================================
   * BOOK REPORTS
   * =========================================================
   */

  const bookReports = useMemo(
    () =>
      books.map((book) => {
        const progress =
          normalizeProgress(
            book.progress
          );

        return {
          ...book,
          progress,
          status:
            getBookStatus(progress),
        };
      }),
    [books]
  );

  /*
   * =========================================================
   * BOOK STATS
   * =========================================================
   */

  const totalBooks =
    bookReports.length;

  const publishedBooks =
    bookReports.filter(
      (book) =>
        book.progress >= 100
    ).length;

  const inProgressBooks =
    bookReports.filter(
      (book) =>
        book.progress > 0 &&
        book.progress < 100
    ).length;

  const overallProgress =
    totalBooks === 0
      ? 0
      : Math.round(
          bookReports.reduce(
            (sum, book) =>
              sum + book.progress,
            0
          ) / totalBooks
        );

  /*
   * =========================================================
   * LATEST ORDER
   * =========================================================
   */

  const latestOrder =
    orders.length > 0
      ? orders[0]
      : null;

  const packageProgress =
    getPackageProgress(
      latestOrder?.status
    );

  const packageStatus =
    getOrderStatus(
      latestOrder?.status
    );

  /*
   * =========================================================
   * LATEST MANUSCRIPT
   * =========================================================
   */

  const latestManuscript =
    manuscripts.length > 0
      ? manuscripts[0]
      : null;

  /*
   * =========================================================
   * REFRESH HANDLER
   * =========================================================
   */

  const handleRefresh = async () => {
    await loadData(true);
  };

  return (
    <main className="min-h-screen bg-[#f6f3ed] text-[#171717]">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="border-b border-black/10 bg-white/70">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">

          <div>

            <Link
              href="/author-dashboard"
              className="block shrink-0"
            >
              <img
                src="/ag-logo.png"
                alt="A&G Publication"
                className="h-auto w-[150px] object-contain"
              />
            </Link>

            <div className="mt-2 flex items-center gap-2">

              <p className="text-[10px] uppercase tracking-[0.25em] text-black/35">
                Author Portal
              </p>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-medium uppercase tracking-wide ${
                  isLive
                    ? "bg-green-100 text-green-700"
                    : "bg-black/5 text-black/40"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isLive
                      ? "bg-green-500"
                      : "bg-black/30"
                  }`}
                />

                {isLive ? "Live" : "Syncing"}
              </span>

            </div>

          </div>

          <div className="flex items-center gap-3">

            {lastUpdated && (
              <span className="hidden text-[10px] text-black/35 sm:block">
                Updated{" "}
                {lastUpdated.toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  }
                )}
              </span>
            )}

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-medium transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/author-dashboard"
                )
              }
              className="rounded-full bg-[#171717] px-4 py-2 text-xs font-medium text-white transition hover:bg-black"
            >
              Dashboard
            </button>

          </div>

        </div>

      </header>

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="mx-auto max-w-7xl px-5 pb-8 pt-10 sm:px-8 lg:px-10 lg:pt-14">

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <p className="text-xs uppercase tracking-[0.25em] text-black/35">
              Author Portal
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Publishing Progress
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50">
              Track your publishing package and
              see the actual progress of every book
              managed by A&G Publication.
            </p>

          </div>

          <div className="rounded-xl border border-black/10 bg-white px-4 py-3">

            <div className="flex items-center gap-2">

              <span
                className={`h-2 w-2 rounded-full ${
                  isLive
                    ? "bg-green-500"
                    : "bg-black/25"
                }`}
              />

              <span className="text-xs font-medium">
                {isLive
                  ? "Live Updates Active"
                  : "Connecting..."}
              </span>

            </div>

            <p className="mt-1 text-[10px] text-black/35">
              Changes sync automatically
            </p>

          </div>

        </div>

      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8 lg:px-10">

        {error && (
          <div className="mb-6 flex flex-col justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center">

            <span>{error}</span>

            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-lg bg-red-700 px-3 py-2 text-xs font-medium text-white"
            >
              Try Again
            </button>

          </div>
        )}

        {/* ==================================================
            TOP STATS
        ================================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-black/10 bg-white p-6">

            <p className="text-xs text-black/40">
              Total Books
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {totalBooks}
            </p>

            <p className="mt-2 text-xs text-black/35">
              Books in your publishing account
            </p>

          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6">

            <p className="text-xs text-black/40">
              In Production
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {inProgressBooks}
            </p>

            <p className="mt-2 text-xs text-black/35">
              Currently being published
            </p>

          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6">

            <p className="text-xs text-black/40">
              Published
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {publishedBooks}
            </p>

            <p className="mt-2 text-xs text-black/35">
              Publishing completed
            </p>

          </div>

          <div className="rounded-2xl bg-[#1c1c1a] p-6 text-white">

            <p className="text-xs text-white/45">
              Overall Progress
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {overallProgress}%
            </p>

            <p className="mt-2 text-xs text-white/35">
              Across all books
            </p>

          </div>

        </div>

        {/* ==================================================
            PACKAGE PROGRESS
        ================================================== */}

        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 sm:p-8">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-black/35">
                Publishing Package
              </p>

              <h2 className="mt-2 text-2xl font-medium">
                Package Progress
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
                This section shows the progress
                of your publishing order/package.
              </p>

            </div>

            <span className="rounded-full bg-[#f2eee6] px-4 py-2 text-xs font-medium">
              {packageStatus}
            </span>

          </div>

          {loading ? (
            <div className="mt-6 rounded-xl bg-[#f8f6f1] p-5 text-sm text-black/40">
              Loading package information...
            </div>
          ) : latestOrder ? (

            <div className="mt-7">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-sm font-medium">
                    {latestOrder.book ||
                      latestOrder.type ||
                      "Publishing Order"}
                  </p>

                  <p className="mt-1 text-xs text-black/40">
                    Order:{" "}
                    {latestOrder.order_number ||
                      latestOrder.id ||
                      "—"}
                  </p>

                </div>

                <span className="text-lg font-semibold">
                  {packageProgress}%
                </span>

              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/10">

                <div
                  className="h-full rounded-full bg-[#171717] transition-all duration-500"
                  style={{
                    width: `${packageProgress}%`,
                  }}
                />

              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">

                <div className="rounded-xl bg-[#f8f6f1] p-4">

                  <p className="text-xs text-black/40">
                    Status
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    {packageStatus}
                  </p>

                </div>

                <div className="rounded-xl bg-[#f8f6f1] p-4">

                  <p className="text-xs text-black/40">
                    Amount
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    {formatCurrency(
                      latestOrder.amount
                    )}
                  </p>

                </div>

                <div className="rounded-xl bg-[#f8f6f1] p-4">

                  <p className="text-xs text-black/40">
                    Order Date
                  </p>

                  <p className="mt-2 text-sm font-medium">
                    {formatDate(
                      latestOrder.created_at
                    )}
                  </p>

                </div>

              </div>

            </div>

          ) : (

            <div className="mt-6 rounded-xl bg-[#f8f6f1] p-6">

              <p className="text-sm font-medium">
                No publishing order found.
              </p>

              <p className="mt-2 text-xs text-black/40">
                Your publishing package will
                appear here after an order is
                created.
              </p>

            </div>

          )}

        </div>

        {/* ==================================================
            BOOK PUBLISHING REPORT
        ================================================== */}

        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 sm:p-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

            <div>

              <div className="flex items-center gap-2">

                <p className="text-xs uppercase tracking-[0.2em] text-black/35">
                  Book Publishing Report
                </p>

                {isLive && (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-[9px] font-medium uppercase text-green-700">
                    Live
                  </span>
                )}

              </div>

              <h2 className="mt-2 text-2xl font-medium">
                Actual Book Progress
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
                This percentage comes directly
                from your book record and is
                updated by the A&G Publication
                admin team.
              </p>

            </div>

            <Link
              href="/my-books"
              className="rounded-xl border border-black/15 px-4 py-2 text-sm font-medium transition hover:bg-black hover:text-white"
            >
              My Books
            </Link>

          </div>

          {loading ? (

            <div className="mt-7 rounded-xl bg-[#f8f6f1] p-5 text-sm text-black/40">
              Loading book reports...
            </div>

          ) : bookReports.length === 0 ? (

            <div className="mt-7 rounded-xl bg-[#f8f6f1] p-6">

              <p className="text-sm font-medium">
                No books found.
              </p>

              <p className="mt-2 text-xs text-black/40">
                Your actual book publishing
                report will appear here once a
                book is assigned to your account.
              </p>

            </div>

          ) : (

            <div className="mt-7 space-y-5">

              {bookReports.map((book) => (

                <div
                  key={book.id}
                  className="rounded-2xl border border-black/10 p-5 sm:p-6"
                >

                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div className="min-w-0">

                      <p className="truncate text-base font-semibold">
                        {book.title ||
                          "Untitled Book"}
                      </p>

                      <p className="mt-1 text-xs text-black/40">
                        {book.status}
                      </p>

                    </div>

                    <span className="text-2xl font-semibold">
                      {book.progress}%
                    </span>

                  </div>

                  <div className="mt-5 h-3 overflow-hidden rounded-full bg-black/10">

                    <div
                      className="h-full rounded-full bg-[#171717] transition-all duration-500"
                      style={{
                        width: `${book.progress}%`,
                      }}
                    />

                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">

                    <div className="rounded-xl bg-[#f8f6f1] p-4">

                      <p className="text-xs text-black/40">
                        Current Status
                      </p>

                      <p className="mt-2 text-sm font-medium">
                        {book.status}
                      </p>

                    </div>

                    <div className="rounded-xl bg-[#f8f6f1] p-4">

                      <p className="text-xs text-black/40">
                        Progress
                      </p>

                      <p className="mt-2 text-sm font-medium">
                        {book.progress}%
                      </p>

                    </div>

                    <div className="rounded-xl bg-[#f8f6f1] p-4">

                      <p className="text-xs text-black/40">
                        Royalty Rate
                      </p>

                      <p className="mt-2 text-sm font-medium">
                        {Number(
                          book.royalty_rate ?? 0
                        )}%
                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* ==================================================
            MANUSCRIPT INFORMATION
        ================================================== */}

        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6 sm:p-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-black/35">
                Manuscript
              </p>

              <h2 className="mt-2 text-2xl font-medium">
                Latest Submission
              </h2>

              <p className="mt-2 text-sm text-black/45">
                Manuscript information is synced
                automatically.
              </p>

            </div>

            <Link
              href="/submit-manuscript"
              className="rounded-xl bg-[#171717] px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
            >
              Submit Manuscript
            </Link>

          </div>

          {latestManuscript ? (

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              <div className="rounded-xl bg-[#f8f6f1] p-5">

                <p className="text-xs text-black/40">
                  Title
                </p>

                <p className="mt-2 text-sm font-medium">
                  {latestManuscript.title ||
                    "Untitled Manuscript"}
                </p>

              </div>

              <div className="rounded-xl bg-[#f8f6f1] p-5">

                <p className="text-xs text-black/40">
                  Status
                </p>

                <p className="mt-2 text-sm font-medium">
                  {latestManuscript.status ||
                    "Submitted"}
                </p>

              </div>

              <div className="rounded-xl bg-[#f8f6f1] p-5">

                <p className="text-xs text-black/40">
                  Package
                </p>

                <p className="mt-2 text-sm font-medium">
                  {latestManuscript.package ||
                    "—"}
                </p>

              </div>

              <div className="rounded-xl bg-[#f8f6f1] p-5">

                <p className="text-xs text-black/40">
                  Submitted
                </p>

                <p className="mt-2 text-sm font-medium">
                  {formatDate(
                    latestManuscript.created_at
                  )}
                </p>

              </div>

            </div>

          ) : (

            <div className="mt-6 rounded-xl bg-[#f8f6f1] p-6">

              <p className="text-sm font-medium">
                No manuscript submission found.
              </p>

              <p className="mt-2 text-xs text-black/40">
                Submit a manuscript to start your
                publishing journey.
              </p>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}