"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Author = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  royalty_rate?: number | null;
  created_at?: string | null;
};

type BankDetails = {
  author_id: string;
  account_holder_name?: string | null;
  account_number?: string | null;
  bank_name?: string | null;
  ifsc_code?: string | null;
  branch_name?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type Book = {
  id: string;
  title: string;
  author_id: string;
  royalty_rate?: number | null;
  progress?: number | null;
};

type Manuscript = {
  id: string;
  title: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  genre?: string | null;
  language?: string | null;
  pages?: number | null;
  description?: string | null;
  file_path?: string | null;
  status?: string | null;
  created_at?: string | null;
};

type Sale = {
  id?: string | number;
  author_id?: string;
  book_id?: string;
  platform?: string | null;
  quantity?: number | null;
  sale_amount?: number | null;
  royalty_amount?: number | null;
  sale_date?: string | null;
  order_id?: string | null;
  created_at?: string | null;
};

type Royalty = {
  id?: string;
  author_id?: string;
  book_id?: string;
  platform?: string | null;
  units?: number | null;
  sale_amount?: number | null;
  royalty_amount?: number | null;
  royalty_rate?: number | null;
  effective_royalty_rate?: number | null;
  sale_date?: string | null;
  status?: string | null;
};

export default function AdminDashboard() {
  const router = useRouter();

  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [royalties, setRoyalties] = useState<Royalty[]>([]);

  const [loading, setLoading] = useState(true);
  const [testingSale, setTestingSale] = useState(false);
  const [savingBookProgress, setSavingBookProgress] =
    useState<string | null>(null);

  const [authorSearch, setAuthorSearch] = useState("");
  const [selectedAuthor, setSelectedAuthor] =
    useState<Author | null>(null);

  // ---------------------------------------
  // FETCH ADMIN DASHBOARD DATA
  // ---------------------------------------

  const fetchManuscripts = async () => {
    const supabase = createClient();

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/author-login");
        return;
      }

      const { data: author, error: authorError } =
        await supabase
          .from("authors")
          .select("role")
          .eq("id", user.id)
          .single();

      if (authorError || author?.role !== "admin") {
        alert("Access denied. Admin only.");
        router.replace("/author-dashboard");
        return;
      }

      // ---------------------------------------
      // MANUSCRIPTS
      // ---------------------------------------

      const {
        data: manuscriptsData,
        error: manuscriptsError,
      } = await supabase
        .from("manuscripts")
        .select("*")
        .order("created_at", { ascending: false });

      if (manuscriptsError) {
        console.error(
          "Admin manuscripts error:",
          manuscriptsError
        );
        setManuscripts([]);
      } else {
        setManuscripts(manuscriptsData || []);
      }

      // ---------------------------------------
      // AUTHORS
      // ---------------------------------------

      const {
        data: authorsData,
        error: authorsError,
      } = await supabase
        .from("authors")
        .select("*")
        .order("created_at", { ascending: false });

      if (authorsError) {
        console.error(
          "Admin authors error:",
          authorsError
        );
        setAuthors([]);
      } else {
        setAuthors(authorsData || []);
      }

      // ---------------------------------------
      // BANK DETAILS
      // ---------------------------------------

      const {
        data: bankDetailsData,
        error: bankDetailsError,
      } = await supabase
        .from("author_bank_details")
        .select(
          "author_id, account_holder_name, account_number, bank_name, ifsc_code, branch_name, created_at, updated_at"
        );

      if (bankDetailsError) {
        console.error(
          "Admin bank details error:",
          bankDetailsError
        );
        setBankDetails([]);
      } else {
        setBankDetails(
          (bankDetailsData || []) as BankDetails[]
        );
      }

      // ---------------------------------------
      // BOOKS
      // ---------------------------------------

      const {
        data: booksData,
        error: booksError,
      } = await supabase
        .from("books")
        .select(
          "id, title, author_id, royalty_rate, progress"
        )
        .order("created_at", { ascending: false });

      if (booksError) {
        console.error(
          "Books fetch error:",
          booksError
        );
        setBooks([]);
      } else {
        setBooks(booksData || []);
      }

      // ---------------------------------------
      // SALES
      // ---------------------------------------

      const loadedAuthors = authorsData || [];

      const salesResults = await Promise.all(
        loadedAuthors.map(async (currentAuthor) => {
          const {
            data: authorSales,
            error: authorSalesError,
          } = await supabase.rpc(
            "get_admin_author_sales",
            {
              p_author_id: currentAuthor.id,
            }
          );

          if (authorSalesError) {
            console.error(
              `Admin sales RPC error for author ${currentAuthor.id}:`,
              authorSalesError
            );

            return [];
          }

          return (authorSales || []).map(
            (sale: any) => ({
              ...sale,
              author_id:
                sale.author_id ??
                currentAuthor.id,
            })
          );
        })
      );

      const normalizedSales: Sale[] =
        salesResults.flat();

      setSales(normalizedSales);

      // ---------------------------------------
      // ROYALTY RECORDS
      // ---------------------------------------

      const royaltyRecords: Royalty[] =
        normalizedSales.map((sale: Sale) => {
          const saleAmount = Number(
            sale.sale_amount || 0
          );

          const royaltyAmount = Number(
            sale.royalty_amount || 0
          );

          const calculatedRate =
            saleAmount > 0
              ? (royaltyAmount / saleAmount) * 100
              : null;

          return {
            id:
              sale.id !== undefined
                ? String(sale.id)
                : undefined,

            author_id: sale.author_id,

            book_id: sale.book_id,

            platform: sale.platform,

            units: sale.quantity,

            sale_amount: saleAmount,

            royalty_amount: royaltyAmount,

            royalty_rate: calculatedRate,

            effective_royalty_rate:
              calculatedRate,

            sale_date: sale.sale_date,

            status: "recorded",
          };
        });

      setRoyalties(royaltyRecords);
    } catch (error) {
      console.error(
        "Admin dashboard fetch error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // REALTIME
  // ---------------------------------------

  useEffect(() => {
    let channel: any = null;
    let cancelled = false;

    const setupRealtime = async () => {
      const supabase = createClient();

      await fetchManuscripts();

      if (cancelled) return;

      channel = supabase
        .channel("admin-dashboard-realtime")

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "manuscripts",
          },
          (payload: any) => {
            if (cancelled) return;

            if (payload.eventType === "INSERT") {
              setManuscripts((current) => [
                payload.new as Manuscript,
                ...current,
              ]);
            } else if (
              payload.eventType === "UPDATE"
            ) {
              setManuscripts((current) =>
                current.map((item) =>
                  item.id === payload.new.id
                    ? (payload.new as Manuscript)
                    : item
                )
              );
            } else if (
              payload.eventType === "DELETE"
            ) {
              setManuscripts((current) =>
                current.filter(
                  (item) =>
                    item.id !== payload.old.id
                )
              );
            }
          }
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "books",
          },
          (payload: any) => {
            if (cancelled) return;

            if (payload.eventType === "INSERT") {
              setBooks((current) => [
                payload.new as Book,
                ...current,
              ]);
            } else if (
              payload.eventType === "UPDATE"
            ) {
              setBooks((current) =>
                current.map((item) =>
                  item.id === payload.new.id
                    ? (payload.new as Book)
                    : item
                )
              );
            } else if (
              payload.eventType === "DELETE"
            ) {
              setBooks((current) =>
                current.filter(
                  (item) =>
                    item.id !== payload.old.id
                )
              );
            }
          }
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "daily_sales",
          },
          async () => {
            if (cancelled) return;

            await fetchManuscripts();
          }
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "authors",
          },
          async () => {
            if (cancelled) return;

            await fetchManuscripts();
          }
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "author_bank_details",
          },
          async () => {
            if (cancelled) return;

            const {
              data,
              error,
            } = await supabase
              .from("author_bank_details")
              .select(
                "author_id, account_holder_name, account_number, bank_name, ifsc_code, branch_name, created_at, updated_at"
              );

            if (error) {
              console.error(
                "Bank details realtime refresh error:",
                error
              );
              return;
            }

            setBankDetails(
              (data || []) as BankDetails[]
            );
          }
        )

        .subscribe();
    };

    setupRealtime();

    return () => {
      cancelled = true;

      if (channel) {
        const supabase = createClient();

        supabase.removeChannel(channel);

        channel = null;
      }
    };
  }, []);

  // ---------------------------------------
  // FILTER AUTHORS
  // ---------------------------------------

  const filteredAuthors = useMemo(() => {
    const search =
      authorSearch.trim().toLowerCase();

    if (!search) {
      return authors;
    }

    return authors.filter((author) => {
      const name =
        author.full_name?.toLowerCase() || "";

      const email =
        author.email?.toLowerCase() || "";

      const phone =
        author.phone?.toLowerCase() || "";

      return (
        name.includes(search) ||
        email.includes(search) ||
        phone.includes(search)
      );
    });
  }, [authors, authorSearch]);

  // ---------------------------------------
  // AUTHOR BOOKS
  // ---------------------------------------

  const getAuthorBooks = (authorId: string) => {
    return books.filter(
      (book) =>
        book.author_id === authorId
    );
  };

  // ---------------------------------------
  // AUTHOR SALES
  // ---------------------------------------

  const getAuthorSales = (authorId: string) => {
    return sales.filter(
      (sale) =>
        sale.author_id === authorId
    );
  };

  // ---------------------------------------
  // AUTHOR ROYALTIES
  // ---------------------------------------

  const getAuthorRoyalties = (
    authorId: string
  ) => {
    return royalties.filter(
      (royalty) =>
        royalty.author_id === authorId
    );
  };

  // ---------------------------------------
  // AUTHOR BANK DETAILS
  // ---------------------------------------

  const getAuthorBankDetails = (
    authorId: string
  ) => {
    return (
      bankDetails.find(
        (details) =>
          details.author_id === authorId
      ) || null
    );
  };

  // ---------------------------------------
  // TOTAL AUTHOR UNITS
  // ---------------------------------------

  const getAuthorUnits = (
    authorId: string
  ) => {
    return getAuthorSales(authorId).reduce(
      (total, sale) =>
        total +
        Number(sale.quantity || 0),
      0
    );
  };

  // ---------------------------------------
  // TOTAL AUTHOR SALES
  // ---------------------------------------

  const getAuthorSalesAmount = (
    authorId: string
  ) => {
    return getAuthorSales(authorId).reduce(
      (total, sale) =>
        total +
        Number(sale.sale_amount || 0),
      0
    );
  };

  // ---------------------------------------
  // TOTAL AUTHOR ROYALTY
  // ---------------------------------------

  const getAuthorRoyaltyAmount = (
    authorId: string
  ) => {
    const royaltyRecords =
      getAuthorRoyalties(authorId);

    if (royaltyRecords.length > 0) {
      return royaltyRecords.reduce(
        (total, royalty) =>
          total +
          Number(
            royalty.royalty_amount || 0
          ),
        0
      );
    }

    return getAuthorSales(authorId).reduce(
      (total, sale) =>
        total +
        Number(
          sale.royalty_amount || 0
        ),
      0
    );
  };

  // ---------------------------------------
  // MANUSCRIPT STATUS
  // ---------------------------------------

  const getProgressForStatus = (
    status: string
  ) => {
    const progressMap: Record<
      string,
      number
    > = {
      Submitted: 10,
      "Under Review": 40,
      Approved: 55,
      "In Production": 75,
      Published: 100,
      Rejected: 0,
    };

    return progressMap[status] ?? 0;
  };

  const getManuscriptProgress = (
    manuscript: Manuscript
  ) => {
    const author = authors.find(
      (item) =>
        !!manuscript.email &&
        !!item.email &&
        item.email.toLowerCase() ===
          manuscript.email.toLowerCase()
    );

    if (author) {
      const book = books.find(
        (item) =>
          item.author_id === author.id &&
          item.title.trim().toLowerCase() ===
            manuscript.title
              .trim()
              .toLowerCase()
      );

      if (book) {
        const value = Number(
          book.progress ?? 0
        );

        if (Number.isFinite(value)) {
          return Math.min(
            100,
            Math.max(0, value)
          );
        }
      }
    }

    return getProgressForStatus(
      manuscript.status || "Submitted"
    );
  };

  // ---------------------------------------
  // UPDATE MANUSCRIPT STATUS
  // ---------------------------------------

  const updateStatus = async (
    id: string,
    status: string
  ) => {
    const supabase = createClient();

    const progress =
      getProgressForStatus(status);

    const manuscript =
      manuscripts.find(
        (item) => item.id === id
      );

    if (!manuscript) return;

    const { error } = await supabase
      .from("manuscripts")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setManuscripts((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
            }
          : item
      )
    );

    const author = authors.find(
      (item) =>
        !!manuscript.email &&
        !!item.email &&
        item.email.toLowerCase() ===
          manuscript.email.toLowerCase()
    );

    if (!author) return;

    const book = books.find(
      (item) =>
        item.author_id === author.id &&
        item.title.trim().toLowerCase() ===
          manuscript.title
            .trim()
            .toLowerCase()
    );

    if (!book) return;

    const {
      error: progressError,
    } = await supabase
      .from("books")
      .update({ progress })
      .eq("id", book.id);

    if (progressError) {
      console.error(
        "Book progress update error:",
        progressError
      );

      alert(progressError.message);

      return;
    }

    setBooks((current) =>
      current.map((item) =>
        item.id === book.id
          ? {
              ...item,
              progress,
            }
          : item
      )
    );
  };

  // ---------------------------------------
  // AUTHOR ROYALTY
  // ---------------------------------------

  const updateRoyaltyRate = async (
    id: string,
    royalty_rate: number
  ) => {
    const supabase = createClient();

    const safeRate = Math.min(
      100,
      Math.max(0, royalty_rate)
    );

    const { error } = await supabase
      .from("authors")
      .update({
        royalty_rate: safeRate,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setAuthors((current) =>
      current.map((author) =>
        author.id === id
          ? {
              ...author,
              royalty_rate: safeRate,
            }
          : author
      )
    );

    if (selectedAuthor?.id === id) {
      setSelectedAuthor((current) =>
        current
          ? {
              ...current,
              royalty_rate: safeRate,
            }
          : null
      );
    }

    alert(
      "Royalty rate updated successfully."
    );
  };

  // ---------------------------------------
  // BOOK ROYALTY
  // ---------------------------------------

  const updateBookRoyaltyRate = async (
    id: string,
    royalty_rate: number
  ) => {
    const supabase = createClient();

    const safeRate = Math.min(
      100,
      Math.max(0, royalty_rate)
    );

    const { error } = await supabase
      .from("books")
      .update({
        royalty_rate: safeRate,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    setBooks((current) =>
      current.map((book) =>
        book.id === id
          ? {
              ...book,
              royalty_rate: safeRate,
            }
          : book
      )
    );

    alert(
      "Book royalty rate updated successfully."
    );
  };

  // ---------------------------------------
  // BOOK PROGRESS
  // ---------------------------------------

  const updateBookProgress = async (
    id: string,
    progress: number
  ) => {
    if (savingBookProgress === id) {
      return;
    }

    const supabase = createClient();

    const numericProgress =
      Number(progress);

    const safeProgress =
      Number.isFinite(numericProgress)
        ? Math.min(
            100,
            Math.max(0, numericProgress)
          )
        : 0;

    setSavingBookProgress(id);

    try {
      const { error } = await supabase
        .from("books")
        .update({
          progress: safeProgress,
        })
        .eq("id", id);

      if (error) {
        console.error(
          "Book progress update error:",
          error
        );

        alert(
          "Progress update failed: " +
            error.message
        );

        return;
      }

      setBooks((current) =>
        current.map((book) =>
          book.id === id
            ? {
                ...book,
                progress: safeProgress,
              }
            : book
        )
      );
    } catch (error) {
      console.error(
        "Book progress update error:",
        error
      );

      alert(
        "Unable to update book progress."
      );
    } finally {
      setSavingBookProgress(null);
    }
  };

  // ---------------------------------------
  // TEST SALE SYNC
  // ---------------------------------------

  const testSaleSync = async () => {
    if (testingSale) return;

    setTestingSale(true);

    try {
      const response = await fetch(
        "/api/sales-sync",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            author_id:
              "3b2850cf-96c9-446f-82fb-9ec2694348cf",

            book_id:
              "7a4e3790-0566-4ff6-a5fe-f23685e96dee",

            platform: "Amazon",

            quantity: 2,

            sale_amount: 500,

            sale_date: "2026-09-13",

            order_id:
              "TEST-" + Date.now(),
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "Sales sync response:",
        data
      );

      if (
        !response.ok ||
        !data.success
      ) {
        alert(
          data.error ||
            "Sale sync failed."
        );

        return;
      }

      const result =
        data.result || {};

      const royaltyRate =
        result.royalty_rate ?? "N/A";

      const royaltyAmount =
        result.royalty_amount ?? 0;

      alert(
        "Sale synced successfully!\n\n" +
          "Platform: Amazon\n" +
          "Units: 2\n" +
          "Sale Amount: ₹500\n" +
          "Royalty Rate: " +
          royaltyRate +
          "%\n" +
          "Royalty: ₹" +
          royaltyAmount
      );

      await fetchManuscripts();
    } catch (error) {
      console.error(
        "Test sale error:",
        error
      );

      alert(
        "Something went wrong while testing sales sync."
      );
    } finally {
      setTestingSale(false);
    }
  };

  // ---------------------------------------
  // CURRENCY FORMAT
  // ---------------------------------------

  const formatCurrency = (
    value: number
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(value);
  };

  // ---------------------------------------
  // LOADING
  // ---------------------------------------

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f3ed] text-[#171717]">
        <div className="rounded-2xl border border-black/10 bg-white px-8 py-6 shadow-sm">
          <p className="text-sm text-black/55">
            Loading Admin Dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f3ed] text-[#171717]">

      {/* =====================================
          HEADER
      ===================================== */}

      <header className="border-b border-black/10 bg-white/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-4 lg:px-10">

          {/* A&G LOGO */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="shrink-0 transition-opacity hover:opacity-80"
            aria-label="A&G Publication Home"
          >
            <img
              src="/ag-logo.png"
              alt="A&G Publication"
              className="h-16 w-16 object-contain sm:h-[72px] sm:w-[72px]"
            />
          </button>

          <div className="flex flex-wrap items-center gap-3">

            <button
              onClick={() =>
                router.push(
                  "/admin-orders"
                )
              }
              className="rounded-full bg-[#171717] px-5 py-2 text-sm text-white transition hover:bg-black/80"
            >
              Orders
            </button>

            <button
              onClick={() =>
                router.push(
                  "/author-dashboard"
                )
              }
              className="rounded-full border border-black/15 px-5 py-2 text-sm transition hover:bg-black/5"
            >
              Author Dashboard
            </button>

            <button
              onClick={testSaleSync}
              disabled={testingSale}
              className="rounded-full bg-green-700 px-5 py-2 text-sm text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {testingSale
                ? "Testing..."
                : "Test Sale"}
            </button>

          </div>
        </div>
      </header>

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">

        <div className="mb-10">

          <p className="text-xs uppercase tracking-[0.25em] text-black/40">
            A&G Publication
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Admin Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/55">
            Manage submitted manuscripts,
            review author details, monitor
            publishing progress and manage
            royalty information.
          </p>

        </div>

        {/* =====================================
            STATS
        ===================================== */}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-wider text-black/40">
              Total Manuscripts
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {manuscripts.length}
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-wider text-black/40">
              Submitted
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {
                manuscripts.filter(
                  (manuscript) =>
                    manuscript.status ===
                    "Submitted"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-wider text-black/40">
              In Production
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {
                manuscripts.filter(
                  (manuscript) =>
                    manuscript.status ===
                    "In Production"
                ).length
              }
            </p>
          </div>

        </div>

        {/* =====================================
            AUTHORS
        ===================================== */}

        <div className="mb-8 rounded-2xl border border-black/10 bg-white">

          <div className="border-b border-black/10 px-6 py-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <h2 className="font-semibold">
                  Authors & Royalty Rates
                </h2>

                <p className="mt-1 text-xs text-black/40">
                  Manage individual author royalty
                  agreements and view author
                  performance.
                </p>
              </div>

              <div className="w-full lg:w-80">

                <input
                  type="text"
                  value={authorSearch}
                  onChange={(e) =>
                    setAuthorSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search author by name, email or phone..."
                  className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-black/30"
                />

              </div>

            </div>

          </div>

          <div className="divide-y divide-black/10">

            {filteredAuthors.length === 0 ? (

              <div className="p-6 text-sm text-black/50">
                {authors.length === 0
                  ? "No authors found."
                  : "No author matches your search."}
              </div>

            ) : (

              filteredAuthors.map(
                (author) => {

                  const authorBooks =
                    getAuthorBooks(
                      author.id
                    );

                  return (
                    <div
                      key={author.id}
                      className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between"
                    >

                      <div className="min-w-0">

                        <p className="font-medium">
                          {author.full_name ||
                            "Unnamed Author"}
                        </p>

                        <p className="mt-1 text-xs text-black/40">
                          {author.email ||
                            "No email"}
                        </p>

                        {author.phone && (
                          <p className="mt-1 text-xs text-black/40">
                            {author.phone}
                          </p>
                        )}

                        <p className="mt-1 text-xs text-black/40">
                          Role:{" "}
                          {author.role ||
                            "author"}
                        </p>

                        <p className="mt-1 text-xs text-black/40">
                          Books:{" "}
                          {authorBooks.length}
                        </p>

                      </div>

                      <div className="flex flex-wrap items-center gap-3">

                        <button
                          onClick={() =>
                            setSelectedAuthor(
                              author
                            )
                          }
                          className="rounded-full border border-black/15 px-4 py-2 text-xs font-medium transition hover:bg-black/5"
                        >
                          View Details
                        </button>

                        <div className="flex items-center gap-3">

                          <label className="text-xs text-black/50">
                            Royalty Rate
                          </label>

                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={
                              author.royalty_rate ??
                              70
                            }
                            onChange={(e) => {

                              const value =
                                Number(
                                  e.target.value
                                );

                              setAuthors(
                                (current) =>
                                  current.map(
                                    (item) =>
                                      item.id ===
                                      author.id
                                        ? {
                                            ...item,
                                            royalty_rate:
                                              value,
                                          }
                                        : item
                                  )
                              );

                            }}
                            onBlur={() =>
                              updateRoyaltyRate(
                                author.id,
                                Number(
                                  author.royalty_rate ??
                                    70
                                )
                              )
                            }
                            className="w-20 rounded-xl border border-black/15 px-3 py-2 text-sm outline-none"
                          />

                          <span className="text-sm">
                            %
                          </span>

                        </div>

                      </div>

                    </div>
                  );
                }
              )

            )}

          </div>
        </div>

        {/* =====================================
            BOOKS
        ===================================== */}

        <div className="mb-8 rounded-2xl border border-black/10 bg-white">

          <div className="border-b border-black/10 px-6 py-5">

            <h2 className="font-semibold">
              Books, Progress & Royalty
            </h2>

            <p className="mt-1 text-xs text-black/40">
              Manage each book's publishing
              progress and royalty rate
              individually.
            </p>

          </div>

          <div className="divide-y divide-black/10">

            {books.length === 0 ? (

              <div className="p-6 text-sm text-black/50">
                No books found.
              </div>

            ) : (

              books.map((book) => (

                <div
                  key={book.id}
                  className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between"
                >

                  <div className="min-w-0">

                    <p className="font-medium">
                      {book.title}
                    </p>

                    <p className="mt-1 text-xs text-black/40 break-all">
                      Book ID: {book.id}
                    </p>

                    <p className="mt-1 text-xs text-black/40">
                      Author ID:{" "}
                      {book.author_id}
                    </p>

                  </div>

                  <div className="flex flex-wrap items-center gap-5">

                    <div className="flex items-center gap-3">

                      <label className="text-xs text-black/50">
                        Progress
                      </label>

                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={
                          book.progress ?? 0
                        }
                        onChange={(e) => {

                          const value =
                            Number(
                              e.target.value
                            );

                          setBooks(
                            (current) =>
                              current.map(
                                (item) =>
                                  item.id ===
                                  book.id
                                    ? {
                                        ...item,
                                        progress:
                                          value,
                                      }
                                    : item
                              )
                          );

                        }}
                        className="w-20 rounded-xl border border-black/15 px-3 py-2 text-sm outline-none"
                      />

                      <span className="text-sm">
                        %
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateBookProgress(
                            book.id,
                            Number(
                              book.progress ??
                                0
                            )
                          )
                        }
                        disabled={
                          savingBookProgress ===
                          book.id
                        }
                        className="rounded-xl bg-[#171717] px-3 py-2 text-xs font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingBookProgress ===
                        book.id
                          ? "Saving..."
                          : "Save Progress"}
                      </button>

                    </div>

                    <div className="flex items-center gap-3">

                      <label className="text-xs text-black/50">
                        Royalty Rate
                      </label>

                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={
                          book.royalty_rate ??
                          70
                        }
                        onChange={(e) => {

                          const value =
                            Number(
                              e.target.value
                            );

                          setBooks(
                            (current) =>
                              current.map(
                                (item) =>
                                  item.id ===
                                  book.id
                                    ? {
                                        ...item,
                                        royalty_rate:
                                          value,
                                      }
                                    : item
                              )
                          );

                        }}
                        onBlur={() =>
                          updateBookRoyaltyRate(
                            book.id,
                            Number(
                              book.royalty_rate ??
                                70
                            )
                          )
                        }
                        className="w-20 rounded-xl border border-black/15 px-3 py-2 text-sm outline-none"
                      />

                      <span className="text-sm">
                        %
                      </span>

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>
        </div>

        {/* =====================================
            MANUSCRIPTS
        ===================================== */}

        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">

          <div className="border-b border-black/10 px-6 py-5">

            <h2 className="font-semibold">
              Submitted Manuscripts
            </h2>

            <p className="mt-1 text-xs text-black/40">
              Review manuscripts and update
              publishing status.
            </p>

          </div>

          {manuscripts.length === 0 ? (

            <div className="p-8 text-sm text-black/50">
              No manuscripts submitted yet.
            </div>

          ) : (

            <div className="divide-y divide-black/10">

              {manuscripts.map(
                (manuscript) => {

                  const manuscriptCreatedAt =
                    manuscript.created_at
                      ? new Date(
                          manuscript.created_at
                        )
                      : null;

                  return (
                    <div
                      key={manuscript.id}
                      className="p-6"
                    >

                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                        <div className="space-y-2 min-w-0">

                          <h3 className="text-lg font-semibold">
                            {manuscript.title}
                          </h3>

                          <p className="text-sm text-black/55">
                            Author:{" "}
                            {manuscript.name ||
                              "Not provided"}
                          </p>

                          <p className="text-sm text-black/55">
                            Email:{" "}
                            {manuscript.email ||
                              "Not provided"}
                          </p>

                          <p className="text-sm text-black/55">
                            Phone:{" "}
                            {manuscript.phone ||
                              "Not provided"}
                          </p>

                          <div className="flex flex-wrap gap-2 pt-2">

                            {manuscript.genre && (
                              <span className="rounded-full bg-black/5 px-3 py-1 text-xs">
                                {
                                  manuscript.genre
                                }
                              </span>
                            )}

                            {manuscript.language && (
                              <span className="rounded-full bg-black/5 px-3 py-1 text-xs">
                                {
                                  manuscript.language
                                }
                              </span>
                            )}

                            {manuscript.pages && (
                              <span className="rounded-full bg-black/5 px-3 py-1 text-xs">
                                {
                                  manuscript.pages
                                }{" "}
                                pages
                              </span>
                            )}

                          </div>

                          {manuscript.description && (
                            <p className="max-w-2xl pt-2 text-sm leading-6 text-black/55">
                              {
                                manuscript.description
                              }
                            </p>
                          )}

                          <p className="pt-2 text-xs text-black/35">
                            Submitted:{" "}
                            {manuscriptCreatedAt
                              ? manuscriptCreatedAt.toLocaleDateString(
                                  "en-IN"
                                )
                              : "N/A"}
                          </p>

                          {manuscript.file_path && (

                            <button
                              onClick={async () => {

                                const supabase =
                                  createClient();

                                const {
                                  data,
                                  error,
                                } =
                                  await supabase.storage
                                    .from(
                                      "manuscripts"
                                    )
                                    .createSignedUrl(
                                      manuscript.file_path!,
                                      60 * 10
                                    );

                                if (error) {
                                  alert(
                                    error.message
                                  );

                                  return;
                                }

                                if (
                                  data?.signedUrl
                                ) {
                                  window.open(
                                    data.signedUrl,
                                    "_blank"
                                  );
                                }

                              }}
                              className="mt-3 rounded-full bg-[#171717] px-4 py-2 text-xs font-medium text-white transition hover:bg-black/75"
                            >
                              View Manuscript
                            </button>

                          )}

                        </div>

                        <div className="w-full lg:w-56">

                          <label className="text-xs uppercase tracking-wider text-black/40">
                            Publishing Status
                          </label>

                          <select
                            value={
                              manuscript.status ||
                              "Submitted"
                            }
                            onChange={(e) =>
                              updateStatus(
                                manuscript.id,
                                e.target.value
                              )
                            }
                            className="mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none"
                          >

                            <option value="Submitted">
                              Submitted
                            </option>

                            <option value="Under Review">
                              Under Review
                            </option>

                            <option value="Approved">
                              Approved
                            </option>

                            <option value="In Production">
                              In Production
                            </option>

                            <option value="Published">
                              Published
                            </option>

                            <option value="Rejected">
                              Rejected
                            </option>

                          </select>

                          <div className="mt-4">

                            <div className="mb-2 flex items-center justify-between text-xs">

                              <span className="text-black/45">
                                Publishing Progress
                              </span>

                              <span className="font-semibold">
                                {
                                  getManuscriptProgress(
                                    manuscript
                                  )
                                }
                                %
                              </span>

                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-black/10">

                              <div
                                className="h-full rounded-full bg-[#171717] transition-all duration-500"
                                style={{
                                  width: `${getManuscriptProgress(
                                    manuscript
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>

      </section>

      {/* =====================================
          AUTHOR DETAILS MODAL
      ===================================== */}

      {selectedAuthor && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
          onClick={() =>
            setSelectedAuthor(null)
          }
        >

          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="border-b border-black/10 px-6 py-6">

              <div className="flex items-start justify-between gap-5">

                <div>

                  <p className="text-xs uppercase tracking-[0.25em] text-black/40">
                    Author Details
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    {selectedAuthor.full_name ||
                      "Unnamed Author"}
                  </h2>

                  <p className="mt-1 text-sm text-black/45">
                    {selectedAuthor.email ||
                      "No email provided"}
                  </p>

                </div>

                <button
                  onClick={() =>
                    setSelectedAuthor(null)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-lg transition hover:bg-black/5"
                >
                  ×
                </button>

              </div>

            </div>

            {/* MODAL BODY */}

            <div className="space-y-6 p-6">

              {/* PROFILE */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl border border-black/10 bg-[#f8f6f1] p-5">

                  <p className="text-xs uppercase tracking-wider text-black/40">
                    Full Name
                  </p>

                  <p className="mt-2 font-medium">
                    {selectedAuthor.full_name ||
                      "Not provided"}
                  </p>

                </div>

                <div className="rounded-2xl border border-black/10 bg-[#f8f6f1] p-5">

                  <p className="text-xs uppercase tracking-wider text-black/40">
                    Email
                  </p>

                  <p className="mt-2 break-all font-medium">
                    {selectedAuthor.email ||
                      "Not provided"}
                  </p>

                </div>

                <div className="rounded-2xl border border-black/10 bg-[#f8f6f1] p-5">

                  <p className="text-xs uppercase tracking-wider text-black/40">
                    Phone
                  </p>

                  <p className="mt-2 font-medium">
                    {selectedAuthor.phone ||
                      "Not provided"}
                  </p>

                </div>

                <div className="rounded-2xl border border-black/10 bg-[#f8f6f1] p-5">

                  <p className="text-xs uppercase tracking-wider text-black/40">
                    Role
                  </p>

                  <p className="mt-2 font-medium capitalize">
                    {selectedAuthor.role ||
                      "author"}
                  </p>

                </div>

              </div>

              {/* BANK DETAILS */}

              {(() => {
                const details =
                  getAuthorBankDetails(
                    selectedAuthor.id
                  );

                return (
                  <div>

                    <div className="mb-3 flex items-center justify-between">

                      <div>
                        <h3 className="font-semibold">
                          Bank Details
                        </h3>

                        <p className="mt-1 text-xs text-black/40">
                          Author's registered
                          payment information.
                        </p>
                      </div>

                      {details && (
                        <span className="rounded-full bg-black/5 px-3 py-1 text-xs">
                          Verified Record
                        </span>
                      )}

                    </div>

                    {!details ? (

                      <div className="rounded-2xl border border-dashed border-black/15 bg-[#f8f6f1] p-6 text-sm text-black/45">
                        No bank details have been
                        added by this author yet.
                      </div>

                    ) : (

                      <div className="grid gap-4 sm:grid-cols-2">

                        <div className="rounded-2xl border border-black/10 bg-[#f8f6f1] p-5">

                          <p className="text-xs uppercase tracking-wider text-black/40">
                            Account Holder Name
                          </p>

                          <p className="mt-2 font-medium">
                            {details.account_holder_name ||
                              "Not provided"}
                          </p>

                        </div>

                        <div className="rounded-2xl border border-black/10 bg-[#f8f6f1] p-5">

                          <p className="text-xs uppercase tracking-wider text-black/40">
                            Bank Name
                          </p>

                          <p className="mt-2 font-medium">
                            {details.bank_name ||
                              "Not provided"}
                          </p>

                        </div>

                        <div className="rounded-2xl border border-black/10 bg-[#f8f6f1] p-5">

                          <p className="text-xs uppercase tracking-wider text-black/40">
                            Account Number
                          </p>

                          <p className="mt-2 break-all font-medium">
                            {details.account_number ||
                              "Not provided"}
                          </p>

                        </div>

                        <div className="rounded-2xl border border-black/10 bg-[#f8f6f1] p-5">

                          <p className="text-xs uppercase tracking-wider text-black/40">
                            IFSC Code
                          </p>

                          <p className="mt-2 font-medium uppercase">
                            {details.ifsc_code ||
                              "Not provided"}
                          </p>

                        </div>

                        <div className="rounded-2xl border border-black/10 bg-[#f8f6f1] p-5 sm:col-span-2">

                          <p className="text-xs uppercase tracking-wider text-black/40">
                            Branch Name
                          </p>

                          <p className="mt-2 font-medium">
                            {details.branch_name ||
                              "Not provided"}
                          </p>

                        </div>

                      </div>

                    )}

                  </div>
                );
              })()}

              {/* SUMMARY */}

              <div>

                <h3 className="mb-3 font-semibold">
                  Performance Summary
                </h3>

                <div className="grid gap-4 sm:grid-cols-3">

                  <div className="rounded-2xl border border-black/10 bg-white p-5">

                    <p className="text-xs uppercase tracking-wider text-black/40">
                      Total Books
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {
                        getAuthorBooks(
                          selectedAuthor.id
                        ).length
                      }
                    </p>

                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-5">

                    <p className="text-xs uppercase tracking-wider text-black/40">
                      Units Sold
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {
                        getAuthorUnits(
                          selectedAuthor.id
                        )
                      }
                    </p>

                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-5">

                    <p className="text-xs uppercase tracking-wider text-black/40">
                      Royalty Earned
                    </p>

                    <p className="mt-2 text-xl font-semibold">
                      {formatCurrency(
                        getAuthorRoyaltyAmount(
                          selectedAuthor.id
                        )
                      )}
                    </p>

                  </div>

                </div>

              </div>

              {/* SALES */}

              <div>

                <h3 className="mb-3 font-semibold">
                  Sales Summary
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="rounded-2xl border border-black/10 bg-white p-5">

                    <p className="text-xs uppercase tracking-wider text-black/40">
                      Total Sales Value
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {formatCurrency(
                        getAuthorSalesAmount(
                          selectedAuthor.id
                        )
                      )}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white p-5">

                    <p className="text-xs uppercase tracking-wider text-black/40">
                      Current Royalty Rate
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {
                        selectedAuthor.royalty_rate ??
                        70
                      }
                      %
                    </p>

                  </div>

                </div>

              </div>

              {/* BOOKS */}

              <div>

                <div className="mb-3 flex items-center justify-between">

                  <h3 className="font-semibold">
                    Author Books
                  </h3>

                  <span className="rounded-full bg-black/5 px-3 py-1 text-xs">
                    {
                      getAuthorBooks(
                        selectedAuthor.id
                      ).length
                    }{" "}
                    book(s)
                  </span>

                </div>

                {getAuthorBooks(
                  selectedAuthor.id
                ).length === 0 ? (

                  <div className="rounded-2xl border border-dashed border-black/15 p-6 text-sm text-black/45">
                    No books assigned to this
                    author yet.
                  </div>

                ) : (

                  <div className="space-y-4">

                    {getAuthorBooks(
                      selectedAuthor.id
                    ).map((book) => (

                      <div
                        key={book.id}
                        className="rounded-2xl border border-black/10 p-5"
                      >

                        <div className="flex flex-col gap-4">

                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                              <p className="font-medium">
                                {book.title}
                              </p>

                              <p className="mt-1 break-all text-xs text-black/35">
                                ID: {book.id}
                              </p>

                            </div>

                            <div className="rounded-full bg-black/5 px-3 py-1 text-xs">
                              {
                                book.royalty_rate ??
                                70
                              }
                              % royalty
                            </div>

                          </div>

                          <div>

                            <div className="mb-2 flex items-center justify-between text-xs">

                              <span className="text-black/45">
                                Publishing Progress
                              </span>

                              <span className="font-medium">
                                {
                                  book.progress ??
                                  0
                                }
                                %
                              </span>

                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-black/10">

                              <div
                                className="h-full rounded-full bg-[#171717] transition-all"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      Number(
                                        book.progress ??
                                          0
                                      )
                                    )
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>

                          <div className="grid gap-3 sm:grid-cols-3">

                            <div className="rounded-xl bg-[#f8f6f1] p-3">

                              <p className="text-[10px] uppercase tracking-wider text-black/40">
                                Units
                              </p>

                              <p className="mt-1 font-semibold">
                                {
                                  sales
                                    .filter(
                                      (sale) =>
                                        sale.book_id ===
                                        book.id
                                    )
                                    .reduce(
                                      (
                                        total,
                                        sale
                                      ) =>
                                        total +
                                        Number(
                                          sale.quantity ||
                                            0
                                        ),
                                      0
                                    )
                                }
                              </p>

                            </div>

                            <div className="rounded-xl bg-[#f8f6f1] p-3">

                              <p className="text-[10px] uppercase tracking-wider text-black/40">
                                Sales
                              </p>

                              <p className="mt-1 font-semibold">
                                {formatCurrency(
                                  sales
                                    .filter(
                                      (sale) =>
                                        sale.book_id ===
                                        book.id
                                    )
                                    .reduce(
                                      (
                                        total,
                                        sale
                                      ) =>
                                        total +
                                        Number(
                                          sale.sale_amount ||
                                            0
                                        ),
                                      0
                                    )
                                )}
                              </p>

                            </div>

                            <div className="rounded-xl bg-[#f8f6f1] p-3">

                              <p className="text-[10px] uppercase tracking-wider text-black/40">
                                Royalty
                              </p>

                              <p className="mt-1 font-semibold">
                                {formatCurrency(
                                  royalties
                                    .filter(
                                      (royalty) =>
                                        royalty.book_id ===
                                        book.id
                                    )
                                    .reduce(
                                      (
                                        total,
                                        royalty
                                      ) =>
                                        total +
                                        Number(
                                          royalty.royalty_amount ||
                                            0
                                        ),
                                      0
                                    )
                                )}
                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

              {/* RECENT ROYALTIES */}

              <div>

                <h3 className="mb-3 font-semibold">
                  Recent Royalty Records
                </h3>

                {getAuthorRoyalties(
                  selectedAuthor.id
                ).length === 0 ? (

                  <div className="rounded-2xl border border-dashed border-black/15 p-6 text-sm text-black/45">
                    No royalty records found
                    for this author.
                  </div>

                ) : (

                  <div className="overflow-x-auto rounded-2xl border border-black/10">

                    <table className="w-full min-w-[650px] text-left text-sm">

                      <thead className="border-b border-black/10 bg-black/[0.02]">

                        <tr>

                          <th className="px-4 py-3 text-xs font-medium text-black/45">
                            Date
                          </th>

                          <th className="px-4 py-3 text-xs font-medium text-black/45">
                            Platform
                          </th>

                          <th className="px-4 py-3 text-xs font-medium text-black/45">
                            Units
                          </th>

                          <th className="px-4 py-3 text-xs font-medium text-black/45">
                            Rate
                          </th>

                          <th className="px-4 py-3 text-xs font-medium text-black/45">
                            Royalty
                          </th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-black/10">

                        {getAuthorRoyalties(
                          selectedAuthor.id
                        )
                          .slice(0, 10)
                          .map(
                            (
                              royalty,
                              index
                            ) => (

                              <tr
                                key={
                                  royalty.id ||
                                  index
                                }
                              >

                                <td className="px-4 py-3">
                                  {royalty.sale_date
                                    ? new Date(
                                        royalty.sale_date
                                      ).toLocaleDateString(
                                        "en-IN"
                                      )
                                    : "N/A"}
                                </td>

                                <td className="px-4 py-3">
                                  {royalty.platform ||
                                    "N/A"}
                                </td>

                                <td className="px-4 py-3">
                                  {royalty.units ??
                                    0}
                                </td>

                                <td className="px-4 py-3">
                                  {
                                    royalty.effective_royalty_rate ??
                                    royalty.royalty_rate ??
                                    selectedAuthor.royalty_rate ??
                                    70
                                  }
                                  %
                                </td>

                                <td className="px-4 py-3 font-medium">
                                  {formatCurrency(
                                    Number(
                                      royalty.royalty_amount ||
                                        0
                                    )
                                  )}
                                </td>

                              </tr>

                            )
                          )}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="border-t border-black/10 px-6 py-5">

              <button
                onClick={() =>
                  setSelectedAuthor(null)
                }
                className="w-full rounded-full bg-[#171717] px-5 py-3 text-sm font-medium text-white transition hover:bg-black/80"
              >
                Close Details
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}