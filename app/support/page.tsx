"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Query = {
  id: string;
  author_id: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  admin_reply?: string | null;
  created_at: string;
  updated_at: string;
  replied_at?: string | null;
};

const categories = [
  "General",
  "Publishing",
  "Order",
  "Payment",
  "Manuscript",
  "Royalty",
  "Certificate",
  "Technical",
];

const statusClass: Record<string, string> = {
  Open: "bg-amber-50 text-amber-700",
  "In Progress": "bg-blue-50 text-blue-700",
  Resolved: "bg-green-50 text-green-700",
  Closed: "bg-black/5 text-black/50",
};

function formatDate(value?: string | null) {
  if (!value) return "N/A";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function SupportPage() {
  const router = useRouter();
  const supabase = createClient();

  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General");
  const [message, setMessage] = useState("");

  const [selectedQuery, setSelectedQuery] = useState<Query | null>(
    null
  );

  const fetchQueries = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/author-login");
      return;
    }

    const { data, error } = await supabase
      .from("support_queries")
      .select("*")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Support queries error:", error);
      setQueries([]);
    } else {
      setQueries((data || []) as Query[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchQueries();

    const channel = supabase
      .channel("author-support-queries")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_queries",
        },
        () => {
          fetchQueries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const submitQuery = async () => {
    if (!subject.trim()) {
      alert("Please enter a subject.");
      return;
    }

    if (!message.trim()) {
      alert("Please enter your query.");
      return;
    }

    if (message.trim().length < 10) {
      alert("Please provide a little more detail.");
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/author-login");
        return;
      }

      const { error } = await supabase
        .from("support_queries")
        .insert({
          author_id: user.id,
          subject: subject.trim(),
          category,
          message: message.trim(),
          status: "Open",
        });

      if (error) {
        console.error("Create support query error:", error);
        alert(error.message);
        return;
      }

      setSubject("");
      setCategory("General");
      setMessage("");

      alert("Your query has been submitted successfully.");

      await fetchQueries();
    } catch (error) {
      console.error("Support submit error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f3ed] text-[#171717]">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-white/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <div>
            <Link
              href="/author-dashboard"
              className="text-xs text-black/40 transition hover:text-black"
            >
              ← Author Dashboard
            </Link>

            <h1 className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">
              Support & Queries
            </h1>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1c1c1a] text-sm font-medium text-white">
            A
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {/* INTRO */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-black/35">
            A&G Author Support
          </p>

          <h2 className="mt-2 text-3xl font-medium tracking-tight">
            How can we help?
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50">
            Raise a support query and the A&G Publication team can respond
            directly through your author portal.
          </p>
        </div>

        {/* NEW QUERY */}
        <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-black/35">
              New Query
            </p>

            <h3 className="mt-2 text-xl font-medium">
              Contact A&G Support
            </h3>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Subject
              </label>

              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What do you need help with?"
                className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3.5 text-sm outline-none placeholder:text-black/30 focus:border-black focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3.5 text-sm outline-none focus:border-black focus:bg-white"
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium">
              Your Query
            </label>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Describe your issue in detail..."
              className="w-full resize-none rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3.5 text-sm outline-none placeholder:text-black/30 focus:border-black focus:bg-white"
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-black/35">
              You will see the admin response here once your query is reviewed.
            </p>

            <button
              type="button"
              onClick={submitQuery}
              disabled={submitting}
              className="rounded-xl bg-[#171717] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : "Submit Query →"}
            </button>
          </div>
        </div>

        {/* MY QUERIES */}
        <div className="mt-8 rounded-2xl border border-black/10 bg-white">
          <div className="border-b border-black/10 px-6 py-5 sm:px-7">
            <p className="text-xs uppercase tracking-[0.2em] text-black/35">
              Support History
            </p>

            <h3 className="mt-2 text-xl font-medium">
              My Queries
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-sm text-black/50">
              Loading your queries...
            </div>
          ) : queries.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-medium">
                No support queries yet.
              </p>

              <p className="mt-2 text-xs text-black/40">
                Your submitted queries and admin replies will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {queries.map((query) => (
                <div
                  key={query.id}
                  className="p-6 transition hover:bg-[#faf9f6] sm:p-7"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-medium">
                          {query.subject}
                        </h4>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-medium ${
                            statusClass[query.status] ||
                            "bg-black/5 text-black/50"
                          }`}
                        >
                          {query.status}
                        </span>

                        <span className="rounded-full bg-[#f2eee6] px-3 py-1 text-[10px] text-black/45">
                          {query.category}
                        </span>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-black/55">
                        {query.message}
                      </p>

                      <p className="mt-3 text-[11px] text-black/35">
                        Submitted: {formatDate(query.created_at)}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedQuery(query)}
                      className="shrink-0 rounded-xl border border-black/15 px-4 py-2.5 text-xs font-medium transition hover:border-black hover:bg-white"
                    >
                      View Details
                    </button>
                  </div>

                  {query.admin_reply && (
                    <div className="mt-5 rounded-xl border border-black/10 bg-[#f8f6f1] p-5">
                      <p className="text-[10px] uppercase tracking-wider text-black/40">
                        A&G Admin Reply
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-black/65">
                        {query.admin_reply}
                      </p>

                      {query.replied_at && (
                        <p className="mt-3 text-[11px] text-black/35">
                          Replied: {formatDate(query.replied_at)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* DETAILS MODAL */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-5">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-black/35">
                  Support Query
                </p>

                <h3 className="mt-2 text-xl font-medium">
                  {selectedQuery.subject}
                </h3>
              </div>

              <button
                onClick={() => setSelectedQuery(null)}
                className="rounded-full border border-black/10 px-3 py-1.5 text-sm text-black/50 hover:text-black"
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#f8f6f1] p-4">
                <p className="text-[10px] uppercase tracking-wider text-black/40">
                  Category
                </p>

                <p className="mt-1 text-sm font-medium">
                  {selectedQuery.category}
                </p>
              </div>

              <div className="rounded-xl bg-[#f8f6f1] p-4">
                <p className="text-[10px] uppercase tracking-wider text-black/40">
                  Status
                </p>

                <p className="mt-1 text-sm font-medium">
                  {selectedQuery.status}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-black/10 p-5">
              <p className="text-[10px] uppercase tracking-wider text-black/40">
                Your Message
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-black/65">
                {selectedQuery.message}
              </p>
            </div>

            {selectedQuery.admin_reply && (
              <div className="mt-5 rounded-xl border border-black/10 bg-[#f8f6f1] p-5">
                <p className="text-[10px] uppercase tracking-wider text-black/40">
                  Admin Reply
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-black/65">
                  {selectedQuery.admin_reply}
                </p>
              </div>
            )}

            <button
              onClick={() => setSelectedQuery(null)}
              className="mt-6 w-full rounded-xl bg-[#171717] px-5 py-3 text-sm font-medium text-white hover:bg-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}