"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FAQ = {
  id: number;
  category: string;
  question: string;
  answer: string;
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

export default function SupportPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

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
                  onClick={() => router.push("/contact")}
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
                Our support team can help with publishing,
                manuscripts, orders, payments, royalties and account
                issues.
              </p>
            </div>

            <div className="grid gap-3 self-center">
              <button
                type="button"
                onClick={() => router.push("/contact")}
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
    </main>
  );
}