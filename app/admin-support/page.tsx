"use client";

import { useEffect, useMemo, useState } from "react";
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

const statusOptions = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
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

export default function AdminSupportPage() {
  const router = useRouter();
  const supabase = createClient();

  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedQuery, setSelectedQuery] = useState<Query | null>(
    null
  );

  const [reply, setReply] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("In Progress");
  const [updating, setUpdating] = useState(false);

  const fetchQueries = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/author-login");
      return;
    }

    const { data: author } = await supabase
      .from("authors")
      .select("role")
      .eq("id", user.id)
      .single();

    if (author?.role !== "admin") {
      alert("Access denied. Admin only.");
      router.replace("/author-dashboard");
      return;
    }

    const { data, error } = await supabase.rpc(
      "get_admin_support_queries"
    );

    if (error) {
      console.error("Admin support fetch error:", error);
      setQueries([]);
    } else {
      setQueries((data || []) as Query[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchQueries();

    const channel = supabase
      .channel("admin-support-queries")
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

  const filteredQueries = useMemo(() => {
    const term = search.trim().toLowerCase();

    return queries.filter((query) => {
      const matchesSearch =
        !term ||
        query.subject.toLowerCase().includes(term) ||
        query.message.toLowerCase().includes(term) ||
        query.category.toLowerCase().includes(term) ||
        query.author_id.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" ||
        query.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [queries, search, statusFilter]);

  const openQuery = (query: Query) => {
    setSelectedQuery(query);
    setReply(query.admin_reply || "");
    setSelectedStatus(query.status || "Open");
  };

  const updateQuery = async () => {
    if (!selectedQuery) return;

    if (
      selectedStatus === "Resolved" &&
      !reply.trim()
    ) {
      alert("Please add a reply before resolving the query.");
      return;
    }

    setUpdating(true);

    try {
      const { data, error } = await supabase.rpc(
        "admin_update_support_query",
        {
          p_query_id: selectedQuery.id,
          p_status: selectedStatus,
          p_admin_reply: reply.trim() || null,
        }
      );

      if (error) {
        console.error("Support update error:", error);
        alert(error.message);
        return;
      }

      if (data) {
        setQueries((current) =>
          current.map((item) =>
            item.id === selectedQuery.id
              ? (data as Query)
              : item
          )
        );

        setSelectedQuery(data as Query);
        setReply((data as Query).admin_reply || "");
        setSelectedStatus((data as Query).status);

        alert("Support query updated successfully.");
      }
    } catch (error) {
      console.error("Support update exception:", error);
      alert("Something went wrong.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f3ed] text-[#171717]">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-white/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">
              A&G PUBLICATION
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Support Queries
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() =>
                router.push("/admin-dashboard")
              }
              className="rounded-full border border-black/15 px-5 py-2 text-sm hover:bg-black/5"
            >
              Admin Dashboard
            </button>

            <button
              onClick={() =>
                router.push("/admin-orders")
              }
              className="rounded-full bg-[#171717] px-5 py-2 text-sm text-white hover:bg-black/80"
            >
              Orders
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {/* STATS */}
        <div className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-wider text-black/40">
              Total
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {queries.length}
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-wider text-black/40">
              Open
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {
                queries.filter(
                  (item) => item.status === "Open"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-wider text-black/40">
              In Progress
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {
                queries.filter(
                  (item) =>
                    item.status === "In Progress"
                ).length
              }
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-wider text-black/40">
              Resolved
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {
                queries.filter(
                  (item) =>
                    item.status === "Resolved"
                ).length
              }
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-6 rounded-2xl border border-black/10 bg-white p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject, category, message..."
              className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3 text-sm outline-none focus:border-black lg:max-w-xl"
            />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3 text-sm outline-none focus:border-black"
            >
              <option value="All">All Statuses</option>

              {statusOptions.map((status) => (
                <option key={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* QUERIES */}
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          <div className="border-b border-black/10 px-6 py-5">
            <h2 className="font-semibold">
              Author Queries
            </h2>

            <p className="mt-1 text-xs text-black/40">
              Review author questions and send replies.
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-sm text-black/50">
              Loading support queries...
            </div>
          ) : filteredQueries.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium">
                No support queries found.
              </p>

              <p className="mt-2 text-xs text-black/40">
                New author queries will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {filteredQueries.map((query) => (
                <div
                  key={query.id}
                  className="p-6 transition hover:bg-[#faf9f6]"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium">
                          {query.subject}
                        </h3>

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

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-black/50">
                        {query.message}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-black/35">
                        <span>
                          Author ID: {query.author_id}
                        </span>

                        <span>
                          Created:{" "}
                          {formatDate(query.created_at)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => openQuery(query)}
                      className="shrink-0 rounded-xl bg-[#171717] px-5 py-3 text-xs font-medium text-white hover:bg-black"
                    >
                      Open Query
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MODAL */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-5">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-black/35">
                  Query Details
                </p>

                <h3 className="mt-2 text-2xl font-medium">
                  {selectedQuery.subject}
                </h3>
              </div>

              <button
                onClick={() =>
                  setSelectedQuery(null)
                }
                className="rounded-full border border-black/10 px-3 py-1.5 text-sm text-black/50 hover:text-black"
              >
                ×
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
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

              <div className="rounded-xl bg-[#f8f6f1] p-4">
                <p className="text-[10px] uppercase tracking-wider text-black/40">
                  Created
                </p>

                <p className="mt-1 text-sm font-medium">
                  {formatDate(
                    selectedQuery.created_at
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-black/10 p-5">
              <p className="text-[10px] uppercase tracking-wider text-black/40">
                Author Message
              </p>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-black/65">
                {selectedQuery.message}
              </p>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Status
              </label>

              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value)
                }
                className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3 text-sm outline-none focus:border-black"
              >
                {statusOptions.map((status) => (
                  <option key={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium">
                Reply to Author
              </label>

              <textarea
                value={reply}
                onChange={(e) =>
                  setReply(e.target.value)
                }
                rows={7}
                placeholder="Write your response to the author..."
                className="w-full resize-none rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3.5 text-sm outline-none placeholder:text-black/30 focus:border-black focus:bg-white"
              />
            </div>

            {selectedQuery.admin_reply && (
              <div className="mt-5 rounded-xl bg-[#f8f6f1] p-5">
                <p className="text-[10px] uppercase tracking-wider text-black/40">
                  Previous Reply
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-black/60">
                  {selectedQuery.admin_reply}
                </p>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() =>
                  setSelectedQuery(null)
                }
                className="rounded-xl border border-black/15 px-5 py-3 text-sm hover:bg-black/5"
              >
                Cancel
              </button>

              <button
                onClick={updateQuery}
                disabled={updating}
                className="rounded-xl bg-[#171717] px-6 py-3 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating
                  ? "Updating..."
                  : "Save Reply & Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}