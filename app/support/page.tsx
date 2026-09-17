"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type FAQ = {
  id: number;
  category: string;
  question: string;
  answer: string;
};

type SupportTicket = {
  id: string;
  name?: string | null;
  email?: string | null;
  category: string;
  subject: string;
  message: string;
  status: "Open" | "In Progress" | "Resolved";
  admin_reply?: string | null;
  created_at: string;
  updated_at: string;
};

const categories = [
  {
    title: "Publishing",
    description: "Manuscript, ISBN, formatting & publishing",
    icon: "✦",
  },
  {
    title: "Payments",
    description: "Payments, invoices & refunds",
    icon: "₹",
  },
  {
    title: "Orders",
    description: "Order status, delivery & tracking",
    icon: "□",
  },
  {
    title: "Royalties",
    description: "Sales, royalties & statements",
    icon: "◆",
  },
  {
    title: "Account",
    description: "Login, password & profile",
    icon: "♙",
  },
  {
    title: "Technical",
    description: "Website, dashboard & other issues",
    icon: "⌘",
  },
];

const faqs: FAQ[] = [
  {
    id: 1,
    category: "Publishing",
    question: "How do I submit my manuscript?",
    answer:
      "Log in to your A&G author account and open the Submit Manuscript section. Enter your book details, upload the required files and submit the manuscript for review.",
  },
  {
    id: 2,
    category: "Publishing",
    question: "How can I check my publishing progress?",
    answer:
      "Open your Author Dashboard and go to your publishing progress. You can view the current stage of your manuscript and related updates there.",
  },
  {
    id: 3,
    category: "Publishing",
    question: "Can I update my manuscript after submission?",
    answer:
      "Changes may depend on the current publishing stage. Contact the A&G team before replacing or modifying files that are already under review or production.",
  },
  {
    id: 4,
    category: "Payments",
    question: "How can I verify my payment?",
    answer:
      "After a successful payment, your order and payment information are recorded in your account. You can also check your Orders section for the latest status.",
  },
  {
    id: 5,
    category: "Payments",
    question: "What should I do if my payment failed?",
    answer:
      "First check whether the amount was actually deducted. If it was deducted but your order was not created or updated, contact support and share the payment reference or order details.",
  },
  {
    id: 6,
    category: "Orders",
    question: "Where can I track my order?",
    answer:
      "Open the Track Order section from your author account to view the latest available order and publishing status.",
  },
  {
    id: 7,
    category: "Orders",
    question: "What if my order is delayed?",
    answer:
      "Open your order details and contact support with your order number. The A&G team can check the current status and provide the latest update.",
  },
  {
    id: 8,
    category: "Royalties",
    question: "Where can I see my royalty information?",
    answer:
      "Your royalty records can be viewed from the Royalties section of the Author Dashboard. Sales and royalty updates depend on verified sales data.",
  },
  {
    id: 9,
    category: "Royalties",
    question: "When are sales and royalties updated?",
    answer:
      "Sales information is updated when verified platform data becomes available. Marketplace reporting schedules can vary by platform.",
  },
  {
    id: 10,
    category: "Account",
    question: "I forgot my password. What should I do?",
    answer:
      "Use the Forgot Password option on the Author Login page and follow the password-reset link sent to your registered email address.",
  },
  {
    id: 11,
    category: "Account",
    question: "Can I sign in using Google?",
    answer:
      "Yes. A&G Author Login supports Google sign-in when your Google account is connected to the author account.",
  },
  {
    id: 12,
    category: "Technical",
    question: "My dashboard is not loading. What should I do?",
    answer:
      "Refresh the page and try signing in again. If the issue continues, contact support with the page name and a short description of what you see.",
  },
];

const ticketCategories = [
  "General",
  "Publishing",
  "Payments",
  "Orders",
  "Royalties",
  "Account",
  "Technical",
];

export default function SupportPage() {
  const router = useRouter();
  const supabase = createClient();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const [showTicketForm, setShowTicketForm] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const [ticketForm, setTicketForm] = useState({
    category: "General",
    subject: "",
    message: "",
  });

  const [ticketSuccess, setTicketSuccess] = useState<string | null>(
    null
  );
  const [ticketError, setTicketError] = useState("");

  const filteredFAQs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesCategory =
        activeCategory === "All" ||
        faq.category === activeCategory;

      const matchesSearch =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  const categoryNames = [
    "All",
    ...categories.map((category) => category.title),
  ];

  /* -------------------------------------------------------
     LOAD CURRENT USER + AUTHOR DETAILS
  ------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      setLoadingUser(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Support user error:", userError);
        }

        if (!mounted) return;

        if (!user) {
          setUserId(null);
          setUserName("");
          setUserEmail("");
          setLoadingUser(false);
          return;
        }

        setUserId(user.id);
        setUserEmail(user.email || "");

        const { data: author } = await supabase
          .from("authors")
          .select("full_name, email")
          .eq("id", user.id)
          .maybeSingle();

        if (!mounted) return;

        setUserName(author?.full_name || "");
        setUserEmail(author?.email || user.email || "");
      } catch (error) {
        console.error("Support user loading error:", error);
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  /* -------------------------------------------------------
     LOAD USER TICKETS
  ------------------------------------------------------- */

  const loadTickets = async (currentUserId: string) => {
    setLoadingTickets(true);

    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select(
          "id, name, email, category, subject, message, status, admin_reply, created_at, updated_at"
        )
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Support tickets load error:", error);
        setTickets([]);
        return;
      }

      setTickets((data || []) as SupportTicket[]);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setTickets([]);
      return;
    }

    loadTickets(userId);
  }, [userId]);

  /* -------------------------------------------------------
     OPEN TICKET FORM FROM ?ticket=new
  ------------------------------------------------------- */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("ticket") === "new") {
      setShowTicketForm(true);
    }
  }, []);

  /* -------------------------------------------------------
     FAQ HELPERS
  ------------------------------------------------------- */

  const scrollToFAQs = () => {
    document
      .getElementById("faqs")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const selectCategory = (category: string) => {
    setActiveCategory(category);
    setOpenFAQ(null);

    setTimeout(() => {
      document
        .getElementById("faqs")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  /* -------------------------------------------------------
     OPEN CONTACT SUPPORT
  ------------------------------------------------------- */

  const openSupportForm = () => {
    setTicketError("");
    setTicketSuccess(null);
    setShowTicketForm(true);
  };

  const closeSupportForm = () => {
    if (submittingTicket) return;

    setShowTicketForm(false);
    setTicketError("");
    setTicketSuccess(null);

    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, "", cleanUrl);
  };

  /* -------------------------------------------------------
     SUBMIT TICKET
  ------------------------------------------------------- */

  const submitTicket = async () => {
    setTicketError("");
    setTicketSuccess(null);

    if (!userId) {
      setTicketError(
        "Please log in to your A&G author account before contacting support."
      );
      return;
    }

    const subject = ticketForm.subject.trim();
    const message = ticketForm.message.trim();

    if (!subject) {
      setTicketError("Please enter a subject.");
      return;
    }

    if (subject.length < 4) {
      setTicketError(
        "Subject should contain at least 4 characters."
      );
      return;
    }

    if (!message) {
      setTicketError("Please describe your issue.");
      return;
    }

    if (message.length < 10) {
      setTicketError(
        "Please provide a little more detail about the issue."
      );
      return;
    }

    setSubmittingTicket(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setTicketError(
          "Your login session has expired. Please log in again."
        );
        return;
      }

      const { data, error } = await supabase
        .from("support_tickets")
        .insert({
          user_id: user.id,
          name: userName || null,
          email: userEmail || user.email || null,
          category: ticketForm.category,
          subject,
          message,
          status: "Open",
        })
        .select(
          "id, name, email, category, subject, message, status, admin_reply, created_at, updated_at"
        )
        .single();

      if (error) {
        console.error("Support ticket insert error:", error);

        setTicketError(
          error.message ||
            "Unable to create your support ticket. Please try again."
        );

        return;
      }

      if (data) {
        setTickets((current) => [
          data as SupportTicket,
          ...current,
        ]);
      }

      setTicketForm({
        category: "General",
        subject: "",
        message: "",
      });

      setTicketSuccess(
        `Ticket created successfully. Ticket ID: ${data.id}`
      );
    } catch (error) {
      console.error("Support ticket error:", error);

      setTicketError(
        "Something went wrong while creating your ticket."
      );
    } finally {
      setSubmittingTicket(false);
    }
  };

  const formatTicketDate = (value: string) => {
    try {
      return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  const statusStyles: Record<string, string> = {
    Open: "bg-amber-50 text-amber-700 border-amber-200",
    "In Progress":
      "bg-blue-50 text-blue-700 border-blue-200",
    Resolved:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <main className="min-h-screen bg-[#f6f3ed] text-[#171717]">
      {/* TOP NAV */}
      <header className="border-b border-black/10 bg-[#f6f3ed]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="shrink-0">
            <img
              src="/ag-logo.png"
              alt="A&G Publication"
              className="h-auto w-[145px] object-contain"
            />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/author-dashboard"
              className="hidden text-sm text-black/55 transition hover:text-black sm:block"
            >
              Author Dashboard
            </Link>

            <Link
              href="/"
              className="rounded-full border border-black/15 px-4 py-2 text-sm font-medium transition hover:border-black hover:bg-white"
            >
              ← Website
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-20 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/35">
            A&G PUBLICATION
          </p>

          <h1 className="mt-4 font-serif text-5xl leading-tight tracking-tight sm:text-6xl">
            Help Center
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-black/50 sm:text-lg">
            Find answers about publishing, payments, orders, royalties,
            your account and everything in between.
          </p>

          {/* SEARCH */}
          <div className="mx-auto mt-9 max-w-2xl">
            <div className="flex items-center rounded-2xl border border-black/10 bg-[#faf9f6] px-5 py-4 shadow-[0_15px_45px_rgba(0,0,0,0.05)] focus-within:border-black/25">
              <span className="mr-3 text-lg text-black/35">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setOpenFAQ(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    scrollToFAQs();
                  }
                }}
                placeholder="Search your issue..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-black/30 sm:text-base"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setOpenFAQ(null);
                  }}
                  className="ml-3 text-xs font-medium text-black/40 transition hover:text-black"
                >
                  Clear
                </button>
              )}
            </div>

            <p className="mt-3 text-xs text-black/30">
              Try &quot;payment&quot;, &quot;royalty&quot;,
              &quot;order&quot; or &quot;manuscript&quot;
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORY CARDS */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-black/35">
              Browse by topic
            </p>

            <h2 className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">
              What can we help with?
            </h2>
          </div>

          <button
            type="button"
            onClick={() => selectCategory("All")}
            className="hidden text-sm font-medium text-black/45 transition hover:text-black sm:block"
          >
            View all
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <button
              key={category.title}
              type="button"
              onClick={() => selectCategory(category.title)}
              className={`group rounded-2xl border p-6 text-left transition duration-200 ${
                activeCategory === category.title
                  ? "border-black bg-[#171717] text-white shadow-[0_15px_45px_rgba(0,0,0,0.12)]"
                  : "border-black/10 bg-white hover:-translate-y-0.5 hover:border-black/25 hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)]"
              }`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg ${
                  activeCategory === category.title
                    ? "bg-white/10 text-white"
                    : "bg-[#f1eee7] text-black"
                }`}
              >
                {category.icon}
              </div>

              <h3 className="mt-5 text-lg font-medium">
                {category.title}
              </h3>

              <p
                className={`mt-2 text-sm leading-6 ${
                  activeCategory === category.title
                    ? "text-white/55"
                    : "text-black/45"
                }`}
              >
                {category.description}
              </p>

              <div
                className={`mt-5 text-sm font-medium ${
                  activeCategory === category.title
                    ? "text-white/70"
                    : "text-black/45"
                }`}
              >
                Explore →
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faqs"
        className="scroll-mt-8 border-y border-black/10 bg-[#faf9f6]"
      >
        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-10">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black/35">
                Frequently asked questions
              </p>

              <h2 className="mt-2 text-3xl font-medium tracking-tight">
                {activeCategory === "All"
                  ? "Popular questions"
                  : `${activeCategory} questions`}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {categoryNames.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    setOpenFAQ(null);
                  }}
                  className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                    activeCategory === category
                      ? "bg-[#171717] text-white"
                      : "border border-black/10 bg-white text-black/50 hover:border-black/25 hover:text-black"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-white">
            {filteredFAQs.length === 0 ? (
              <div className="px-6 py-16 text-center sm:px-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f1eee7] text-xl">
                  ?
                </div>

                <h3 className="mt-5 text-lg font-medium">
                  No matching help articles
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/45">
                  We couldn&apos;t find an answer for that search.
                  Try another phrase or contact the A&G support team.
                </p>

                <button
                  type="button"
                  onClick={openSupportForm}
                  className="mt-6 rounded-full bg-[#171717] px-5 py-3 text-sm font-medium text-white transition hover:bg-black"
                >
                  Contact Support
                </button>
              </div>
            ) : (
              <div className="divide-y divide-black/10">
                {filteredFAQs.map((faq) => {
                  const isOpen = openFAQ === faq.id;

                  return (
                    <div key={faq.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFAQ(isOpen ? null : faq.id)
                        }
                        className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition hover:bg-[#faf9f6] sm:px-7"
                      >
                        <div className="min-w-0">
                          <div className="mb-2">
                            <span className="rounded-full bg-[#f1eee7] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/45">
                              {faq.category}
                            </span>
                          </div>

                          <h3 className="text-sm font-medium leading-6 sm:text-base">
                            {faq.question}
                          </h3>
                        </div>

                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 text-lg transition ${
                            isOpen
                              ? "rotate-45 bg-[#171717] text-white"
                              : "bg-white text-black/50"
                          }`}
                        >
                          +
                        </span>
                      </button>

                      {isOpen && (
                        <div className="px-6 pb-6 sm:px-7">
                          <div className="rounded-xl bg-[#faf9f6] px-5 py-4">
                            <p className="text-sm leading-7 text-black/55">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-black/30">
            Showing {filteredFAQs.length}{" "}
            {filteredFAQs.length === 1 ? "article" : "articles"}
          </p>
        </div>
      </section>

      {/* MY SUPPORT TICKETS */}
      {userId && (
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-black/35">
                Support activity
              </p>

              <h2 className="mt-2 text-3xl font-medium tracking-tight">
                My Support Tickets
              </h2>

              <p className="mt-2 text-sm text-black/45">
                View your previous support requests and their latest status.
              </p>
            </div>

            <button
              type="button"
              onClick={openSupportForm}
              className="rounded-full bg-[#171717] px-5 py-3 text-sm font-medium text-white transition hover:bg-black"
            >
              + New Ticket
            </button>
          </div>

          {loadingTickets ? (
            <div className="mt-8 rounded-2xl border border-black/10 bg-white px-6 py-10 text-center text-sm text-black/45">
              Loading your support tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-black/10 bg-white px-6 py-10 text-center">
              <h3 className="text-lg font-medium">
                No support tickets yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/45">
                Need help? Create a ticket and the A&G team can respond
                from the support dashboard.
              </p>

              <button
                type="button"
                onClick={openSupportForm}
                className="mt-5 rounded-full bg-[#171717] px-5 py-3 text-sm font-medium text-white"
              >
                Contact Support
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-2xl border border-black/10 bg-white p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-black/30">
                        Ticket
                      </p>

                      <p className="mt-1 break-all font-mono text-xs text-black/45">
                        {ticket.id}
                      </p>

                      <h3 className="mt-4 text-lg font-medium">
                        {ticket.subject}
                      </h3>

                      <p className="mt-2 text-xs text-black/40">
                        {ticket.category} ·{" "}
                        {formatTicketDate(ticket.created_at)}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full border px-3 py-1.5 text-xs font-medium ${
                        statusStyles[ticket.status] ||
                        "border-black/10 bg-black/5 text-black/60"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <div className="mt-5 rounded-xl bg-[#faf9f6] px-4 py-4">
                    <p className="text-sm leading-6 text-black/55">
                      {ticket.message}
                    </p>
                  </div>

                  {ticket.admin_reply && (
                    <div className="mt-4 rounded-xl border border-black/10 bg-white px-4 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
                        A&G Support Reply
                      </p>

                      <p className="mt-2 text-sm leading-6 text-black/60">
                        {ticket.admin_reply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* NEED MORE HELP */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="overflow-hidden rounded-[2rem] bg-[#171717] text-white">
          <div className="grid gap-10 px-7 py-10 md:grid-cols-[1.4fr_1fr] md:px-12 md:py-12 lg:px-16">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/35">
                Need more help?
              </p>

              <h2 className="mt-3 max-w-xl font-serif text-4xl leading-tight sm:text-5xl">
                Still can&apos;t find what you&apos;re looking for?
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/50">
                Our support team can help with publishing, manuscripts,
                orders, payments, royalties and account issues.
              </p>
            </div>

            <div className="grid gap-3 self-center">
              <button
                type="button"
                onClick={openSupportForm}
                className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 text-left text-sm font-medium text-[#171717] transition hover:bg-[#f1eee7]"
              >
                <span>Contact Support</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/track-order")}
                className="flex items-center justify-between rounded-2xl border border-white/15 px-5 py-4 text-left text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5"
              >
                <span>Track an Order</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/author-dashboard")}
                className="flex items-center justify-between rounded-2xl border border-white/15 px-5 py-4 text-left text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/5"
              >
                <span>Open Author Dashboard</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-xs text-black/35 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>© 2026 A&G Publication. All rights reserved.</p>

          <div className="flex flex-wrap gap-5">
            <Link
              href="/books"
              className="transition hover:text-black"
            >
              Books
            </Link>

            <Link
              href="/publishing"
              className="transition hover:text-black"
            >
              Publishing
            </Link>

            <Link
              href="/contact"
              className="transition hover:text-black"
            >
              Contact
            </Link>

            <Link
              href="/author-dashboard"
              className="transition hover:text-black"
            >
              Author Portal
            </Link>
          </div>
        </div>
      </footer>

      {/* SUPPORT TICKET MODAL */}
      {showTicketForm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
            <div className="border-b border-black/10 px-6 py-6 sm:px-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-black/35">
                    A&G PUBLICATION
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold">
                    Contact Support
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-black/50">
                    Tell us what you need help with and our team can
                    review your support request.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeSupportForm}
                  disabled={submittingTicket}
                  aria-label="Close support form"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 text-lg text-black/50 transition hover:bg-black/5 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ×
                </button>
              </div>
            </div>

            {!userId && !loadingUser ? (
              <div className="px-6 py-10 text-center sm:px-8">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f1eee7] text-xl">
                  ♙
                </div>

                <h3 className="mt-5 text-xl font-medium">
                  Login required
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-black/45">
                  Please log in to your A&G author account before opening
                  a support ticket.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/author-login")}
                  className="mt-6 rounded-full bg-[#171717] px-6 py-3 text-sm font-medium text-white transition hover:bg-black"
                >
                  Go to Author Login
                </button>
              </div>
            ) : (
              <div className="px-6 py-6 sm:px-8 sm:py-8">
                <div className="grid gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
                        Name
                      </label>

                      <input
                        value={loadingUser ? "Loading..." : userName}
                        readOnly
                        className="mt-2 w-full rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-black/55 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
                        Email
                      </label>

                      <input
                        value={
                          loadingUser ? "Loading..." : userEmail
                        }
                        readOnly
                        className="mt-2 w-full rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-sm text-black/55 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
                      Category
                    </label>

                    <select
                      value={ticketForm.category}
                      onChange={(e) =>
                        setTicketForm((current) => ({
                          ...current,
                          category: e.target.value,
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3 text-sm outline-none focus:border-black/30"
                    >
                      {ticketCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
                      Subject
                    </label>

                    <input
                      value={ticketForm.subject}
                      onChange={(e) =>
                        setTicketForm((current) => ({
                          ...current,
                          subject: e.target.value,
                        }))
                      }
                      placeholder="Briefly describe your issue"
                      maxLength={180}
                      className="mt-2 w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3 text-sm outline-none placeholder:text-black/25 focus:border-black/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
                      Message
                    </label>

                    <textarea
                      value={ticketForm.message}
                      onChange={(e) =>
                        setTicketForm((current) => ({
                          ...current,
                          message: e.target.value,
                        }))
                      }
                      placeholder="Explain your issue in detail..."
                      rows={6}
                      maxLength={4000}
                      className="mt-2 w-full resize-none rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3 text-sm leading-6 outline-none placeholder:text-black/25 focus:border-black/30"
                    />

                    <p className="mt-2 text-right text-[11px] text-black/30">
                      {ticketForm.message.length}/4000
                    </p>
                  </div>

                  {ticketError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                      {ticketError}
                    </div>
                  )}

                  {ticketSuccess && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <p className="text-sm leading-6 text-emerald-700">
                        {ticketSuccess}
                      </p>

                      <button
                        type="button"
                        onClick={() => setTicketSuccess(null)}
                        className="mt-2 text-xs font-semibold text-emerald-800 underline underline-offset-4"
                      >
                        Create another ticket
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeSupportForm}
                      disabled={submittingTicket}
                      className="rounded-full border border-black/15 px-6 py-3 text-sm font-medium transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={submitTicket}
                      disabled={
                        submittingTicket ||
                        loadingUser ||
                        !userId
                      }
                      className="rounded-full bg-[#171717] px-7 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submittingTicket
                        ? "Sending..."
                        : "Send Support Request"}
                    </button>
                  </div>

                  <p className="text-center text-[11px] leading-5 text-black/30">
                    Your support request will be securely attached to
                    your A&G account.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}