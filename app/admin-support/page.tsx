"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type SupportTicket = {
  id: string;
  user_id: string;
  name?: string | null;
  email?: string | null;
  subject: string;
  category: string;
  message: string;
  status: "Open" | "In Progress" | "Resolved";
  admin_reply?: string | null;
  created_at: string;
  updated_at: string;
};

const statusOptions = ["Open", "In Progress", "Resolved"];

const statusClass: Record<string, string> = {
  Open: "bg-amber-50 text-amber-700",
  "In Progress": "bg-blue-50 text-blue-700",
  Resolved: "bg-green-50 text-green-700",
};

function formatDate(value?: string | null) {
  if (!value) return "N/A";

  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function AdminSupportPage() {
  const router = useRouter();
  const supabase = createClient();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedTicket, setSelectedTicket] =
    useState<SupportTicket | null>(null);

  const [reply, setReply] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<"Open" | "In Progress" | "Resolved">("In Progress");

  const [updating, setUpdating] = useState(false);

  /* -------------------------------------------------------
     ADMIN CHECK + FETCH TICKETS
  ------------------------------------------------------- */

  const fetchTickets = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Admin support user error:", userError);
      }

      if (!user) {
        router.replace("/author-login");
        return;
      }

      const { data: author, error: authorError } = await supabase
        .from("authors")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (authorError) {
        console.error("Admin role error:", authorError);
        alert("Unable to verify admin access.");
        router.replace("/author-dashboard");
        return;
      }

      const isAdminByRole = author?.role === "admin";
      const isOfficialAdmin =
        user.email?.toLowerCase() ===
        "agpublicationofficial@gmail.com";

      if (!isAdminByRole && !isOfficialAdmin) {
        alert("Access denied. Admin only.");
        router.replace("/author-dashboard");
        return;
      }

      const { data, error } = await supabase
        .from("support_tickets")
        .select(
          "id, user_id, name, email, subject, category, message, status, admin_reply, created_at, updated_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Admin support fetch error:", error);
        setTickets([]);
        return;
      }

      setTickets((data || []) as SupportTicket[]);
    } catch (error) {
      console.error("Admin support exception:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();

    const channel = supabase
      .channel("admin-support-tickets")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_tickets",
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* -------------------------------------------------------
     FILTER
  ------------------------------------------------------- */

  const filteredTickets = useMemo(() => {
    const term = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch =
        !term ||
        ticket.subject.toLowerCase().includes(term) ||
        ticket.message.toLowerCase().includes(term) ||
        ticket.category.toLowerCase().includes(term) ||
        (ticket.name || "").toLowerCase().includes(term) ||
        (ticket.email || "").toLowerCase().includes(term) ||
        ticket.id.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" ||
        ticket.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, search, statusFilter]);

  /* -------------------------------------------------------
     OPEN TICKET
  ------------------------------------------------------- */

  const openTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setReply(ticket.admin_reply || "");
    setSelectedStatus(ticket.status || "In Progress");
  };

  /* -------------------------------------------------------
     UPDATE TICKET
  ------------------------------------------------------- */

  const updateTicket = async () => {
    if (!selectedTicket) return;

    if (
      selectedStatus === "Resolved" &&
      !reply.trim()
    ) {
      alert("Please add a reply before resolving the ticket.");
      return;
    }

    setUpdating(true);

    try {
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
        .maybeSingle();

      const isAdminByRole = author?.role === "admin";
      const isOfficialAdmin =
        user.email?.toLowerCase() ===
        "agpublicationofficial@gmail.com";

      if (!isAdminByRole && !isOfficialAdmin) {
        alert("Access denied. Admin only.");
        router.replace("/author-dashboard");
        return;
      }

      const { data, error } = await supabase
        .from("support_tickets")
        .update({
          status: selectedStatus,
          admin_reply: reply.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedTicket.id)
        .select(
          "id, user_id, name, email, subject, category, message, status, admin_reply, created_at, updated_at"
        )
        .single();

      if (error) {
        console.error("Support ticket update error:", error);
        alert(error.message);
        return;
      }

      if (data) {
        const updatedTicket = data as SupportTicket;

        setTickets((current) =>
          current.map((item) =>
            item.id === updatedTicket.id
              ? updatedTicket
              : item
          )
        );

        setSelectedTicket(updatedTicket);
        setReply(updatedTicket.admin_reply || "");
        setSelectedStatus(updatedTicket.status);

        alert("Support ticket updated successfully.");
      }
    } catch (error) {
      console.error("Support update exception:", error);
      alert("Something went wrong while updating the ticket.");
    } finally {
      setUpdating(false);
    }
  };

  const closeModal = () => {
    if (updating) return;

    setSelectedTicket(null);
    setReply("");
  };

  return (
    <main className="min-h-screen bg-[#f6f3ed] text-[#171717]">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-white/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
          <div className="shrink-0">
            <img
              src="/ag-logo.png"
              alt="A&G Publication"
              className="h-auto w-[150px] object-contain"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                router.push("/admin-dashboard")
              }
              className="rounded-full border border-black/15 px-5 py-2 text-sm transition hover:bg-black/5"
            >
              Admin Dashboard
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/admin-orders")
              }
              className="rounded-full bg-[#171717] px-5 py-2 text-sm text-white transition hover:bg-black/80"
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
              {tickets.length}
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-wider text-black/40">
              Open
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {tickets.filter((item) => item.status === "Open").length}
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-xs uppercase tracking-wider text-black/40">
              In Progress
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {
                tickets.filter(
                  (item) => item.status === "In Progress"
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
                tickets.filter(
                  (item) => item.status === "Resolved"
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
              placeholder="Search ticket, subject, author, email..."
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
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* TICKETS */}
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          <div className="border-b border-black/10 px-6 py-5">
            <h2 className="font-semibold">
              Support Tickets
            </h2>

            <p className="mt-1 text-xs text-black/40">
              Review author support requests and send replies.
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-sm text-black/50">
              Loading support tickets...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium">
                No support tickets found.
              </p>

              <p className="mt-2 text-xs text-black/40">
                New tickets will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-6 transition hover:bg-[#faf9f6]"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium">
                          {ticket.subject}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-medium ${
                            statusClass[ticket.status] ||
                            "bg-black/5 text-black/50"
                          }`}
                        >
                          {ticket.status}
                        </span>

                        <span className="rounded-full bg-[#f2eee6] px-3 py-1 text-[10px] text-black/45">
                          {ticket.category}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-black/40">
                        <span>
                          {ticket.name || "Author"}
                        </span>

                        <span>
                          {ticket.email || "No email"}
                        </span>

                        <span>
                          Created:{" "}
                          {formatDate(ticket.created_at)}
                        </span>
                      </div>

                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-black/50">
                        {ticket.message}
                      </p>

                      <p className="mt-4 break-all font-mono text-[10px] text-black/25">
                        Ticket ID: {ticket.id}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => openTicket(ticket)}
                      className="shrink-0 rounded-xl bg-[#171717] px-5 py-3 text-xs font-medium text-white transition hover:bg-black"
                    >
                      Open Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/45 p-5">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-black/35">
                  Ticket Details
                </p>

                <h3 className="mt-2 text-2xl font-medium">
                  {selectedTicket.subject}
                </h3>

                <p className="mt-2 break-all font-mono text-[10px] text-black/30">
                  {selectedTicket.id}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={updating}
                className="rounded-full border border-black/10 px-3 py-1.5 text-sm text-black/50 transition hover:text-black disabled:opacity-40"
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
                  {selectedTicket.category}
                </p>
              </div>

              <div className="rounded-xl bg-[#f8f6f1] p-4">
                <p className="text-[10px] uppercase tracking-wider text-black/40">
                  Status
                </p>

                <p className="mt-1 text-sm font-medium">
                  {selectedTicket.status}
                </p>
              </div>

              <div className="rounded-xl bg-[#f8f6f1] p-4">
                <p className="text-[10px] uppercase tracking-wider text-black/40">
                  Created
                </p>

                <p className="mt-1 text-sm font-medium">
                  {formatDate(selectedTicket.created_at)}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-black/10 p-5">
              <p className="text-[10px] uppercase tracking-wider text-black/40">
                Author
              </p>

              <div className="mt-3 grid gap-2 text-sm">
                <p>
                  <span className="text-black/40">Name:</span>{" "}
                  {selectedTicket.name || "N/A"}
                </p>

                <p>
                  <span className="text-black/40">Email:</span>{" "}
                  {selectedTicket.email || "N/A"}
                </p>

                <p className="break-all">
                  <span className="text-black/40">User ID:</span>{" "}
                  {selectedTicket.user_id}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-black/10 p-5">
              <p className="text-[10px] uppercase tracking-wider text-black/40">
                Author Message
              </p>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-black/65">
                {selectedTicket.message}
              </p>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium">
                Status
              </label>

              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(
                    e.target.value as
                      | "Open"
                      | "In Progress"
                      | "Resolved"
                  )
                }
                className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3 text-sm outline-none focus:border-black"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
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
                onChange={(e) => setReply(e.target.value)}
                rows={7}
                placeholder="Write your response to the author..."
                className="w-full resize-none rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3.5 text-sm outline-none placeholder:text-black/30 focus:border-black focus:bg-white"
              />
            </div>

            {selectedTicket.admin_reply && (
              <div className="mt-5 rounded-xl bg-[#f8f6f1] p-5">
                <p className="text-[10px] uppercase tracking-wider text-black/40">
                  Previous Reply
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-black/60">
                  {selectedTicket.admin_reply}
                </p>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={updating}
                className="rounded-xl border border-black/15 px-5 py-3 text-sm transition hover:bg-black/5 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={updateTicket}
                disabled={updating}
                className="rounded-xl bg-[#171717] px-6 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
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