"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const statusStyle: Record<string, string> = {
  Paid: "bg-[#e8eee7] text-[#425442]",
  Pending: "bg-[#f2ede2] text-[#6b5a35]",
};

export default function RoyaltiesPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [royaltyRate, setRoyaltyRate] = useState(70);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchRoyalties = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: author, error: authorError } = await supabase
        .from("authors")
        .select("royalty_rate")
        .eq("id", user.id)
        .single();

      if (!authorError && author?.royalty_rate !== undefined) {
        setRoyaltyRate(Number(author.royalty_rate));
      }

      const { data, error } = await supabase
        .from("royalties")
        .select("*")
        .eq("author_id", user.id)
        .order("sale_date", { ascending: false });

      if (error) {
        console.error("Royalties fetch error:", error);
        return;
      }

      setTransactions(data || []);
    };

    fetchRoyalties();
  }, []);

  const calculatedTransactions = transactions.map((item) => ({
    ...item,
    calculatedRoyalty:
      (Number(item.sale_amount || 0) *
        Number(item.royalty_rate ?? royaltyRate)) /
      100,
  }));

  const nextPaymentDate = new Date();
  nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
  nextPaymentDate.setDate(1);

  const filteredTransactions =
    filter === "All"
      ? calculatedTransactions
      : calculatedTransactions.filter((item) => item.status === filter);

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#222]">
      {/* Header */}
      <header className="border-b border-black/10 bg-[#f8f6f1]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a
            href="/"
            className="block shrink-0"
          >
            <img
              src="/ag-logo.png"
              alt="A&G Publication"
              className="h-auto w-[150px] object-contain"
            />
          </a>

          <nav className="hidden gap-8 text-sm md:flex">
            <a href="/author-dashboard" className="hover:opacity-60">
              Dashboard
            </a>

            <a href="/my-books" className="hover:opacity-60">
              My Books
            </a>

            <a
              href="/publishing-progress"
              className="hover:opacity-60"
            >
              Publishing Progress
            </a>

            <a href="/orders" className="hover:opacity-60">
              Orders
            </a>
          </nav>

          <a
            href="/author-dashboard"
            className="rounded-full border border-black/20 px-5 py-2 text-sm hover:bg-[#222] hover:text-white"
          >
            Dashboard
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/40">
          Author Portal
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
          Royalties
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-6 text-black/50">
          Track your book sales, royalty earnings and payment history
          in one place.
        </p>
      </section>

      {/* Earnings Cards */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Earnings */}
          <div className="rounded-[1.75rem] bg-[#222] p-7 text-white">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">
              Total Earnings
            </p>

            <p className="mt-5 text-4xl font-semibold">
              ₹
              {calculatedTransactions
                .reduce(
                  (sum, item) =>
                    sum + Number(item.calculatedRoyalty || 0),
                  0
                )
                .toLocaleString("en-IN")}
            </p>

            <p className="mt-3 text-xs text-white/45">
              Lifetime royalty earnings
            </p>
          </div>

          {/* This Month */}
          <div className="rounded-[1.75rem] border border-black/10 bg-white p-7">
            <p className="text-xs uppercase tracking-[0.18em] text-black/40">
              This Month
            </p>

            <p className="mt-5 text-3xl font-semibold">
              ₹
              {calculatedTransactions
                .filter((item) => {
                  const date = new Date(item.sale_date);
                  const now = new Date();

                  return (
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear()
                  );
                })
                .reduce(
                  (sum, item) =>
                    sum + Number(item.calculatedRoyalty || 0),
                  0
                )
                .toLocaleString("en-IN")}
            </p>

            <p className="mt-3 text-xs text-black/40">
              {new Date().toLocaleString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          {/* Books Sold */}
          <div className="rounded-[1.75rem] border border-black/10 bg-white p-7">
            <p className="text-xs uppercase tracking-[0.18em] text-black/40">
              Books Sold
            </p>

            <p className="mt-5 text-3xl font-semibold">
              {transactions.reduce(
                (sum, item) => sum + Number(item.units || 0),
                0
              )}
            </p>

            <p className="mt-3 text-xs text-black/40">
              Across all formats
            </p>
          </div>

          {/* Pending */}
          <div className="rounded-[1.75rem] border border-black/10 bg-white p-7">
            <p className="text-xs uppercase tracking-[0.18em] text-black/40">
              Pending
            </p>

            <p className="mt-5 text-3xl font-semibold">
              ₹
              {calculatedTransactions
                .filter((item) => item.status === "Pending")
                .reduce(
                  (sum, item) =>
                    sum + Number(item.calculatedRoyalty || 0),
                  0
                )
                .toLocaleString("en-IN")}
            </p>

            <p className="mt-3 text-xs text-black/40">
              Awaiting payment
            </p>
          </div>
        </div>
      </section>

      {/* Royalty Overview */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Earnings Overview */}
          <div className="rounded-[1.75rem] border border-black/10 bg-white p-7 md:p-9">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                  Earnings Overview
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Royalty performance
                </h2>
              </div>

              <span className="rounded-full bg-[#f1eee7] px-4 py-2 text-xs font-medium">
                Last 6 Months
              </span>
            </div>

            {/* Simple chart */}
            <div className="mt-10 flex h-56 items-end gap-3 border-b border-black/10 px-2">
              {[42, 58, 48, 72, 64, 88].map((height, index) => (
                <div
                  key={index}
                  className="group flex flex-1 flex-col items-center justify-end"
                >
                  <div
                    className="w-full max-w-12 rounded-t-xl bg-[#222] transition group-hover:opacity-70"
                    style={{ height: `${height}%` }}
                  />

                  <span className="mt-3 text-[10px] text-black/40">
                    {["Mar", "Apr", "May", "Jun", "Jul", "Aug"][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Royalty Rate */}
          <div className="rounded-[1.75rem] border border-black/10 bg-white p-7 md:p-9">
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">
              Current Agreement
            </p>

            <h2 className="mt-3 text-2xl font-semibold">
              Your Royalty
            </h2>

            <div className="mt-8 flex items-end gap-2">
              <span className="text-6xl font-semibold">
                {royaltyRate}
              </span>

              <span className="mb-2 text-2xl">%</span>
            </div>

            <p className="mt-4 text-sm leading-6 text-black/50">
              Your current royalty rate is based on your publishing
              agreement with A&G Publication.
            </p>

            <div className="mt-8 border-t border-black/10 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-black/50">
                  Next payment
                </span>

                <span className="font-medium">
                  {nextPaymentDate.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transactions */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/40">
              Royalty History
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Transactions
            </h2>
          </div>

          <div className="flex gap-2">
            {["All", "Paid", "Pending"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-full px-5 py-2.5 text-sm ${
                  filter === item
                    ? "bg-[#222] text-white"
                    : "border border-black/10 bg-white hover:bg-black/5"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-black/10 bg-white">
          {filteredTransactions.length === 0 ? (
            /* Empty State */
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f1eee7]">
                <span className="text-2xl">₹</span>
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                No royalty data found
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-black/45">
                Your royalty transactions will appear here once your
                books start generating verified sales.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block">
                <div className="grid grid-cols-[1.3fr_2fr_1fr_0.8fr_1fr_1fr] border-b border-black/10 bg-[#faf9f6] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-black/40">
                  <span>Transaction</span>
                  <span>Book</span>
                  <span>Format</span>
                  <span>Units</span>
                  <span>Royalty</span>
                  <span>Status</span>
                </div>

                {filteredTransactions.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1.3fr_2fr_1fr_0.8fr_1fr_1fr] items-center border-b border-black/10 px-6 py-6 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {item.id}
                      </p>

                      <p className="mt-1 text-xs text-black/40">
                        {new Date(
                          item.sale_date
                        ).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                    <p className="pr-5 text-sm font-medium">
                      {item.book}
                    </p>

                    <p className="text-sm text-black/60">
                      {item.type}
                    </p>

                    <p className="text-sm">{item.units}</p>

                    <p className="text-sm font-semibold">
                      ₹
                      {Number(
                        item.calculatedRoyalty
                      ).toLocaleString("en-IN")}
                    </p>

                    <span
                      className={`w-fit rounded-full px-3 py-1.5 text-xs font-medium ${
                        statusStyle[item.status] ||
                        "bg-black/5 text-black/50"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Mobile */}
              <div className="divide-y divide-black/10 md:hidden">
                {filteredTransactions.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">
                          ₹
                          {Number(
                            item.calculatedRoyalty
                          ).toLocaleString("en-IN")}
                        </p>

                        <p className="mt-1 text-xs text-black/40">
                          {new Date(
                            item.sale_date
                          ).toLocaleDateString("en-IN")}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                          statusStyle[item.status] ||
                          "bg-black/5 text-black/50"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3 className="mt-5 text-sm font-medium">
                      {item.book}
                    </h3>

                    <div className="mt-5 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-black/40">
                          Format
                        </p>

                        <p className="mt-1 text-sm">
                          {item.type}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-black/40">
                          Units
                        </p>

                        <p className="mt-1 text-sm">
                          {item.units}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-black/40">
                          Royalty
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          ₹
                          {Number(
                            item.calculatedRoyalty
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Note */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-[1.75rem] border border-black/10 bg-[#f1eee7] p-7 md:p-9">
          <p className="text-sm font-semibold">
            About royalty payments
          </p>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-black/55">
            Royalty figures shown here are illustrative for the current
            portal design. Once your author account is connected to the
            publishing database, sales and royalty amounts will be
            calculated automatically from verified transactions.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#222] px-6 pb-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 border-t border-white/10 pt-8 text-xs text-white/40 md:flex-row">
          <p>© 2026 A&G Publication. All rights reserved.</p>

          <div className="flex gap-6">
            <a href="/books" className="hover:text-white">
              Books
            </a>

            <a href="/publishing" className="hover:text-white">
              Publishing
            </a>

            <a href="/contact" className="hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}