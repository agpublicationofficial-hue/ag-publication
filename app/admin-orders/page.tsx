"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Order = {
  id: string;
  author_id?: string | null;
  order_number?: string | null;
  book?: string | null;
  type?: string | null;
  quantity?: number | null;
  amount?: number | null;
  status?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  delivery_address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  created_at?: string | null;
};

const STATUS_OPTIONS = [
  "Processing",
  "Confirmed",
  "In Production",
  "Ready for Delivery",
  "Completed",
  "Cancelled",
];

const statusClasses: Record<string, string> = {
  Processing:
    "bg-amber-50 text-amber-700 border-amber-200",
  Confirmed:
    "bg-blue-50 text-blue-700 border-blue-200",
  "In Production":
    "bg-purple-50 text-purple-700 border-purple-200",
  "Ready for Delivery":
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Completed:
    "bg-green-50 text-green-700 border-green-200",
  Cancelled:
    "bg-red-50 text-red-700 border-red-200",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [updatingOrderId, setUpdatingOrderId] =
    useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  async function verifyAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/author-login");
      return false;
    }

    const { data: author, error } =
      await supabase
        .from("authors")
        .select("role")
        .eq("id", user.id)
        .single();

    if (error || author?.role !== "admin") {
      alert("Access denied. Admin only.");
      router.replace("/author-dashboard");
      return false;
    }

    return true;
  }

  async function loadOrders(showLoader = true) {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const isAdmin = await verifyAdmin();

      if (!isAdmin) {
        return;
      }

      const {
        data,
        error,
      } = await supabase.rpc("get_admin_orders");

      if (error) {
        console.error(
          "Admin orders fetch error:",
          error
        );

        alert(
          error.message ||
            "Unable to load orders."
        );

        setOrders([]);
        return;
      }

      setOrders(
        Array.isArray(data)
          ? (data as Order[])
          : []
      );
    } catch (error) {
      console.error(
        "Admin orders exception:",
        error
      );

      alert(
        "Something went wrong while loading orders."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadOrders(true);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          loadOrders(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function updateOrderStatus(
    orderId: string,
    status: string
  ) {
    if (!orderId || !status) return;

    setUpdatingOrderId(orderId);

    try {
      const {
        data,
        error,
      } = await supabase.rpc(
        "admin_update_order_status",
        {
          p_order_id: orderId,
          p_status: status,
        }
      );

      if (error) {
        console.error(
          "Order status update error:",
          error
        );

        alert(
          error.message ||
            "Unable to update order status."
        );

        return;
      }

      const updatedOrder =
        Array.isArray(data)
          ? data[0]
          : data;

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status:
                  updatedOrder?.status ??
                  status,
              }
            : order
        )
      );

      setSelectedOrder((current) =>
        current?.id === orderId
          ? {
              ...current,
              status:
                updatedOrder?.status ??
                status,
            }
          : current
      );
    } catch (error) {
      console.error(
        "Order status update exception:",
        error
      );

      alert(
        "Something went wrong while updating order."
      );
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        String(
          order.order_number || ""
        )
          .toLowerCase()
          .includes(query) ||
        String(
          order.customer_name || ""
        )
          .toLowerCase()
          .includes(query) ||
        String(
          order.customer_email || ""
        )
          .toLowerCase()
          .includes(query) ||
        String(
          order.customer_phone || ""
        )
          .toLowerCase()
          .includes(query) ||
        String(
          order.book || ""
        )
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        String(order.status || "") ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [orders, search, statusFilter]);

  const totalOrders = orders.length;

  const processingOrders =
    orders.filter(
      (order) =>
        order.status === "Processing"
    ).length;

  const productionOrders =
    orders.filter(
      (order) =>
        order.status === "In Production"
    ).length;

  const completedOrders =
    orders.filter(
      (order) =>
        order.status === "Completed"
    ).length;

  const totalOrderValue =
    orders.reduce(
      (total, order) =>
        total +
        Number(order.amount || 0),
      0
    );

  return (
    <main className="min-h-screen bg-[#f6f3ed] text-[#171717]">
      <header className="border-b border-black/10 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">

          {/* A&G LOGO */}
          <div className="shrink-0">
            <img
              src="/ag-logo.png"
              alt="A&G Publication"
              className="h-auto w-[150px] object-contain"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                router.push(
                  "/admin-dashboard"
                )
              }
              className="rounded-full border border-black/15 bg-white px-5 py-2 text-sm transition hover:bg-black/5"
            >
              Admin Dashboard
            </button>

            <button
              onClick={() =>
                router.push(
                  "/author-dashboard"
                )
              }
              className="rounded-full border border-black/15 bg-white px-5 py-2 text-sm transition hover:bg-black/5"
            >
              Author Dashboard
            </button>

            <button
              onClick={() =>
                loadOrders(false)
              }
              disabled={refreshing}
              className="rounded-full bg-[#171717] px-5 py-2 text-sm text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-black/40">
            A&G Publication
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Order Management
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/55">
            Manage author orders, payment
            information and publishing
            progress from one place.
          </p>
        </div>

        {/* STATS */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-xs uppercase tracking-wider text-black/40">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {totalOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-xs uppercase tracking-wider text-black/40">
              Processing
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {processingOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-xs uppercase tracking-wider text-black/40">
              In Production
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {productionOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-xs uppercase tracking-wider text-black/40">
              Completed
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {completedOrders}
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-5">
            <p className="text-xs uppercase tracking-wider text-black/40">
              Order Value
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {formatCurrency(
                totalOrderValue
              )}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-6 rounded-2xl border border-black/10 bg-white p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-black/45">
                Search Orders
              </label>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search order number, author, email, phone or package..."
                className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition focus:border-black focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-black/45">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3 text-sm outline-none focus:border-black focus:bg-white"
              >
                <option value="All">
                  All Statuses
                </option>

                {STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>

        {/* ORDERS */}
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
          <div className="border-b border-black/10 px-6 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">
                  Orders
                </h2>

                <p className="mt-1 text-xs text-black/40">
                  {filteredOrders.length} order
                  {filteredOrders.length === 1
                    ? ""
                    : "s"} found
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-sm text-black/50">
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium">
                No orders found.
              </p>

              <p className="mt-2 text-xs text-black/40">
                New paid orders will appear
                here automatically.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/10">
              {filteredOrders.map(
                (order) => {
                  const status =
                    order.status ||
                    "Processing";

                  const isUpdating =
                    updatingOrderId ===
                    order.id;

                  return (
                    <div
                      key={order.id}
                      className="p-5 transition hover:bg-[#fcfbf8] sm:p-6"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-base font-semibold">
                              {order.order_number ||
                                `Order ${order.id}`}
                            </h3>

                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                                statusClasses[
                                  status
                                ] ||
                                "border-black/10 bg-black/5 text-black/60"
                              }`}
                            >
                              {status}
                            </span>
                          </div>

                          <p className="mt-2 font-medium">
                            {order.book ||
                              "Publishing Order"}
                          </p>

                          <div className="mt-3 grid gap-1 text-sm text-black/55 sm:grid-cols-2">
                            <p>
                              Author:{" "}
                              <span className="text-black/80">
                                {order.customer_name ||
                                  "Not provided"}
                              </span>
                            </p>

                            <p>
                              Type:{" "}
                              <span className="text-black/80">
                                {order.type ||
                                  "—"}
                              </span>
                            </p>

                            <p>
                              Email:{" "}
                              <span className="break-all text-black/80">
                                {order.customer_email ||
                                  "Not provided"}
                              </span>
                            </p>

                            <p>
                              Phone:{" "}
                              <span className="text-black/80">
                                {order.customer_phone ||
                                  "Not provided"}
                              </span>
                            </p>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-black/40">
                            <span>
                              Amount:{" "}
                              <strong className="text-black/70">
                                {formatCurrency(
                                  Number(
                                    order.amount ||
                                      0
                                  )
                                )}
                              </strong>
                            </span>

                            <span>
                              Quantity:{" "}
                              {order.quantity ??
                                1}
                            </span>

                            <span>
                              Created:{" "}
                              {formatDate(
                                order.created_at
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:shrink-0">
                          <select
                            value={status}
                            disabled={isUpdating}
                            onChange={(e) =>
                              updateOrderStatus(
                                order.id,
                                e.target.value
                              )
                            }
                            className="rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-black disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {STATUS_OPTIONS.map(
                              (option) => (
                                <option
                                  key={option}
                                  value={option}
                                >
                                  {option}
                                </option>
                              )
                            )}
                          </select>

                          <button
                            onClick={() =>
                              setSelectedOrder(
                                order
                              )
                            }
                            className="rounded-xl border border-black/15 px-4 py-3 text-sm font-medium transition hover:bg-black/5"
                          >
                            View Details
                          </button>
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

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-black/10 bg-white px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-black/35">
                  Order Details
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {selectedOrder.order_number ||
                    selectedOrder.id}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedOrder(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-lg transition hover:bg-black/5"
              >
                ×
              </button>
            </div>

            <div className="space-y-6 p-6">
              <section>
                <h3 className="mb-3 font-semibold">
                  Order Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#f8f6f1] p-4">
                    <p className="text-xs text-black/40">
                      Order Number
                    </p>

                    <p className="mt-1 break-all text-sm font-medium">
                      {selectedOrder.order_number ||
                        selectedOrder.id}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f8f6f1] p-4">
                    <p className="text-xs text-black/40">
                      Status
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {selectedOrder.status ||
                        "Processing"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f8f6f1] p-4">
                    <p className="text-xs text-black/40">
                      Order Type
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {selectedOrder.type ||
                        "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f8f6f1] p-4">
                    <p className="text-xs text-black/40">
                      Amount
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {formatCurrency(
                        Number(
                          selectedOrder.amount ||
                            0
                        )
                      )}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 font-semibold">
                  Author / Customer
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/10 p-4">
                    <p className="text-xs text-black/40">
                      Name
                    </p>

                    <p className="mt-1 text-sm">
                      {selectedOrder.customer_name ||
                        "Not provided"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-black/10 p-4">
                    <p className="text-xs text-black/40">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm">
                      {selectedOrder.customer_email ||
                        "Not provided"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-black/10 p-4">
                    <p className="text-xs text-black/40">
                      Phone
                    </p>

                    <p className="mt-1 text-sm">
                      {selectedOrder.customer_phone ||
                        "Not provided"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-black/10 p-4">
                    <p className="text-xs text-black/40">
                      Quantity
                    </p>

                    <p className="mt-1 text-sm">
                      {selectedOrder.quantity ??
                        1}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 font-semibold">
                  Payment Information
                </h3>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-black/10 p-4">
                    <p className="text-xs text-black/40">
                      Razorpay Order ID
                    </p>

                    <p className="mt-1 break-all text-sm">
                      {selectedOrder.razorpay_order_id ||
                        "Not available"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-black/10 p-4">
                    <p className="text-xs text-black/40">
                      Razorpay Payment ID
                    </p>

                    <p className="mt-1 break-all text-sm">
                      {selectedOrder.razorpay_payment_id ||
                        "Not available"}
                    </p>
                  </div>
                </div>
              </section>

              {(selectedOrder.delivery_address ||
                selectedOrder.city ||
                selectedOrder.state ||
                selectedOrder.pincode) && (
                <section>
                  <h3 className="mb-3 font-semibold">
                    Delivery Address
                  </h3>

                  <div className="rounded-2xl border border-black/10 p-4 text-sm leading-6">
                    {selectedOrder.delivery_address && (
                      <p>
                        {
                          selectedOrder.delivery_address
                        }
                      </p>
                    )}

                    <p>
                      {[
                        selectedOrder.city,
                        selectedOrder.state,
                        selectedOrder.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </section>
              )}

              <section>
                <h3 className="mb-3 font-semibold">
                  Update Status
                </h3>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <select
                    value={
                      selectedOrder.status ||
                      "Processing"
                    }
                    disabled={
                      updatingOrderId ===
                      selectedOrder.id
                    }
                    onChange={(e) =>
                      updateOrderStatus(
                        selectedOrder.id,
                        e.target.value
                      )
                    }
                    className="flex-1 rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-black disabled:opacity-60"
                  >
                    {STATUS_OPTIONS.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>

                  <button
                    onClick={() =>
                      setSelectedOrder(
                        null
                      )
                    }
                    className="rounded-xl bg-[#171717] px-5 py-3 text-sm font-medium text-white transition hover:bg-black/85"
                  >
                    Close
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}