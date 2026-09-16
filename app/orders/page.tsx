"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";

type SupabaseOrder = {
  id: string;
  author_id: string;
  order_number: string;
  book: string;
  type: string;
  quantity: number;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  customer_email: string | null;
  manuscript_id: string | null;
};

type Sale = {
  id: number | string;
  author_id: string;
  book_id: string;
  platform: string;
  quantity: number;
  sale_amount: number;
  sale_date: string;
  order_id: string | null;
  royalty_amount: number;
  created_at?: string;
};

type Book = {
  id: string;
  title: string;
  cover_url?: string | null;
};

type Manuscript = {
  id: string;
  title: string;
  status: string;
  file_path: string | null;
  created_at: string;
  updated_at: string | null;
};

type DisplayOrder = {
  id: string;
  order_number: string;
  book: string;
  book_id: string;
  type: string;
  quantity: number;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string | null;

  customer_name: string;
  customer_email: string;
  customer_phone: string;

  delivery_address: string;
  city: string;
  state: string;
  pincode: string;

  razorpay_order_id: string;
  razorpay_payment_id: string;

  platform: string;
  royalty_amount: number;
  sale_date: string;

  manuscript_id: string | null;
  manuscript_title: string | null;
  manuscript_status: string | null;
  manuscript_progress: number | null;
  manuscript_created_at: string | null;
  manuscript_updated_at: string | null;

  source: "orders" | "sales";
};

const publishingStages = [
  "Payment Confirmed",
  "Submitted",
  "Under Review",
  "Approved",
  "In Production",
  "Published",
];

const getProgress = (status: string) => {
  switch (status) {
    case "Payment Confirmed":
      return 10;
    case "Submitted":
      return 20;
    case "Under Review":
      return 40;
    case "Approved":
      return 55;
    case "In Production":
      return 75;
    case "Published":
      return 100;
    case "Rejected":
      return 0;
    default:
      return 10;
  }
};

const statusStyle: Record<string, string> = {
  Delivered: "bg-[#e7eee6] text-[#40533f]",
  Shipped: "bg-[#e8edf2] text-[#435365]",
  Processing: "bg-[#f3ede0] text-[#705d35]",
  Cancelled: "bg-[#f3e6e4] text-[#70423c]",
  Paid: "bg-[#e7eee6] text-[#40533f]",
  "Payment Confirmed": "bg-[#e7eee6] text-[#40533f]",
  Submitted: "bg-[#e8edf2] text-[#435365]",
  "Under Review": "bg-[#f3ede0] text-[#705d35]",
  Approved: "bg-[#e7eee6] text-[#40533f]",
  "In Production": "bg-[#e8edf2] text-[#435365]",
  Published: "bg-[#e7eee6] text-[#40533f]",
  Rejected: "bg-[#f3e6e4] text-[#70423c]",
};

const getNextStep = (status: string) => {
  switch (status) {
    case "Payment Confirmed":
      return "Your manuscript is ready for submission.";
    case "Submitted":
      return "Our publishing team will review your manuscript.";
    case "Under Review":
      return "Your manuscript is currently being reviewed.";
    case "Approved":
      return "Your book has been approved for production.";
    case "In Production":
      return "Your book is currently being prepared for publication.";
    case "Published":
      return "Your publishing journey is complete.";
    case "Rejected":
      return "Please contact support to understand the next steps.";
    default:
      return "Your publishing project is being processed.";
  }
};

const formatDate = (date: string | null) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date: string | null) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatAmount = (amount: number) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
};

const isPublishingPackage = (order: DisplayOrder) => {
  if (order.source !== "orders") return false;

  const type = order.type.toLowerCase();

  return (
    !!order.manuscript_id ||
    type.includes("publishing") ||
    type.includes("package")
  );
};

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${
        statusStyle[status] ||
        "bg-black/5 text-black/50"
      }`}
    >
      {status}
    </span>
  );
}

function ProgressRing({
  progress,
  size = 120,
}: {
  progress: number;
  size?: number;
}) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference -
    (Math.min(100, Math.max(0, progress)) / 100) *
      circumference;

  return (
    <div
      className="relative shrink-0"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.07)"
          strokeWidth={stroke}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#222"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold">
          {Math.round(progress)}%
        </span>

        <span className="text-[9px] uppercase tracking-[0.16em] text-black/35">
          Progress
        </span>
      </div>
    </div>
  );
}

function PackageProgress({
  status,
}: {
  status: string;
}) {
  const progress = getProgress(status);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-black/35">
            Publishing Status
          </p>

          <p className="mt-1 text-sm font-semibold">
            {status}
          </p>
        </div>

        <p className="text-sm font-semibold">
          {progress}%
        </p>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full rounded-full bg-[#222] transition-all duration-700"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <p className="mt-3 text-xs leading-5 text-black/40">
        {getNextStep(status)}
      </p>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] =
    useState<DisplayOrder | null>(null);

  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [realtimeConnected, setRealtimeConnected] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const fetchOrders = async () => {
    try {
      setErrorMessage("");

      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setErrorMessage(
          authError?.message ||
            "Please login to view your orders."
        );

        return;
      }

      const [
        ordersResult,
        salesResult,
        booksResult,
        manuscriptsResult,
      ] = await Promise.all([
        supabase
          .from("orders")
          .select(
            `
              id,
              author_id,
              order_number,
              book,
              type,
              quantity,
              amount,
              status,
              created_at,
              updated_at,
              razorpay_order_id,
              razorpay_payment_id,
              customer_name,
              customer_phone,
              delivery_address,
              city,
              state,
              pincode,
              customer_email,
              manuscript_id
            `
          )
          .eq("author_id", user.id)
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("daily_sales")
          .select(
            `
              id,
              author_id,
              book_id,
              platform,
              quantity,
              sale_amount,
              sale_date,
              order_id,
              royalty_amount,
              created_at
            `
          )
          .eq("author_id", user.id)
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("books")
          .select("id, title, cover_url"),

        supabase
          .from("manuscripts")
          .select(
            `
              id,
              title,
              status,
              file_path,
              created_at,
              updated_at
            `
          )
          .eq("author_id", user.id)
          .order("created_at", {
            ascending: false,
          }),
      ]);

      if (ordersResult.error) {
        throw ordersResult.error;
      }

      const realOrders =
        (ordersResult.data || []) as SupabaseOrder[];

      const sales =
        (salesResult.data || []) as Sale[];

      const books =
        (booksResult.data || []) as Book[];

      const manuscripts =
        (manuscriptsResult.data || []) as Manuscript[];

      const bookMap = new Map(
        books.map((book) => [
          book.id,
          book,
        ])
      );

      const manuscriptMap = new Map(
        manuscripts.map((manuscript) => [
          manuscript.id,
          manuscript,
        ])
      );

      const mappedOrders: DisplayOrder[] =
        realOrders.map((order) => {
          const manuscript = order.manuscript_id
            ? manuscriptMap.get(
                order.manuscript_id
              )
            : undefined;

          return {
            id: order.id,

            order_number:
              order.order_number || order.id,

            book:
              order.book ||
              manuscript?.title ||
              "Publishing Order",

            book_id: "",

            type:
              order.type ||
              "Order",

            quantity:
              Number(order.quantity || 0),

            amount:
              Number(order.amount || 0),

            status:
              order.status ||
              "Processing",

            created_at:
              order.created_at,

            updated_at:
              order.updated_at || null,

            customer_name:
              order.customer_name || "—",

            customer_email:
              order.customer_email || "—",

            customer_phone:
              order.customer_phone || "—",

            delivery_address:
              order.delivery_address || "—",

            city:
              order.city || "—",

            state:
              order.state || "—",

            pincode:
              order.pincode || "—",

            razorpay_order_id:
              order.razorpay_order_id || "—",

            razorpay_payment_id:
              order.razorpay_payment_id || "—",

            platform: "Razorpay",

            royalty_amount: 0,

            sale_date:
              order.created_at,

            manuscript_id:
              order.manuscript_id || null,

            manuscript_title:
              manuscript?.title || null,

            manuscript_status:
              manuscript?.status || null,

            manuscript_progress:
              manuscript
                ? getProgress(
                    manuscript.status
                  )
                : null,

            manuscript_created_at:
              manuscript?.created_at || null,

            manuscript_updated_at:
              manuscript?.updated_at || null,

            source: "orders",
          };
        });

      const mappedSales: DisplayOrder[] =
        sales.map((sale) => {
          const book =
            bookMap.get(
              sale.book_id
            );

          return {
            id:
              `sale-${String(
                sale.id
              )}`,

            order_number:
              sale.order_id ||
              `SALE-${String(
                sale.id
              )}`,

            book:
              book?.title ||
              "Book",

            book_id:
              sale.book_id,

            type:
              sale.platform
                ? `${sale.platform} Sale`
                : "Book Sale",

            quantity:
              Number(
                sale.quantity || 0
              ),

            amount:
              Number(
                sale.sale_amount || 0
              ),

            status:
              "Delivered",

            created_at:
              sale.created_at ||
              `${sale.sale_date}T00:00:00`,

            updated_at:
              null,

            customer_name:
              "—",

            customer_email:
              "—",

            customer_phone:
              "—",

            delivery_address:
              "—",

            city:
              "—",

            state:
              "—",

            pincode:
              "—",

            razorpay_order_id:
              "—",

            razorpay_payment_id:
              "—",

            platform:
              sale.platform || "—",

            royalty_amount:
              Number(
                sale.royalty_amount || 0
              ),

            sale_date:
              sale.sale_date,

            manuscript_id:
              null,

            manuscript_title:
              null,

            manuscript_status:
              null,

            manuscript_progress:
              null,

            manuscript_created_at:
              null,

            manuscript_updated_at:
              null,

            source: "sales",
          };
        });

      const combined = [
        ...mappedOrders,
        ...mappedSales,
      ].sort(
        (a, b) =>
          new Date(
            b.created_at
          ).getTime() -
          new Date(
            a.created_at
          ).getTime()
      );

      setOrders(combined);
    } catch (error) {
      console.error(
        "Orders fetch error:",
        error
      );

      setErrorMessage(
        "Unable to load your orders right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const setupRealtime = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !mounted) {
        setLoading(false);
        return;
      }

      await fetchOrders();

      if (!mounted) return;

      const channel = supabase
        .channel(
          `orders-command-center-${user.id}`
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter:
              `author_id=eq.${user.id}`,
          },
          () => {
            fetchOrders();
          }
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "daily_sales",
            filter:
              `author_id=eq.${user.id}`,
          },
          () => {
            fetchOrders();
          }
        )

        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "manuscripts",
            filter:
              `author_id=eq.${user.id}`,
          },
          () => {
            fetchOrders();
          }
        )

        .subscribe((status) => {
          if (!mounted) return;

          setRealtimeConnected(
            status === "SUBSCRIBED"
          );
        });

      return channel;
    };

    let activeChannel:
      | ReturnType<
          ReturnType<
            typeof createClient
          >["channel"]
        >
      | undefined;

    setupRealtime().then(
      (channel) => {
        activeChannel = channel;
      }
    );

    return () => {
      mounted = false;

      if (activeChannel) {
        const supabase =
          createClient();

        supabase.removeChannel(
          activeChannel
        );
      }
    };
  }, []);

  const filteredOrders = useMemo(() => {
    let result =
      filter === "All"
        ? orders
        : orders.filter(
            (order) =>
              order.status ===
              filter
          );

    const search =
      searchQuery
        .trim()
        .toLowerCase();

    if (search) {
      result = result.filter(
        (order) =>
          order.order_number
            .toLowerCase()
            .includes(search) ||
          order.book
            .toLowerCase()
            .includes(search) ||
          order.type
            .toLowerCase()
            .includes(search) ||
          order.status
            .toLowerCase()
            .includes(search) ||
          (
            order.manuscript_title ||
            ""
          )
            .toLowerCase()
            .includes(search)
      );
    }

    return result;
  }, [
    orders,
    filter,
    searchQuery,
  ]);

  const publishingPackages =
    filteredOrders.filter(
      (order) =>
        isPublishingPackage(order)
    );

  const bookOrders =
    filteredOrders.filter(
      (order) =>
        !isPublishingPackage(order)
    );

  const activePackages =
    orders.filter(
      (order) =>
        isPublishingPackage(order) &&
        order.manuscript_status !==
          "Published"
    );

  const completedPackages =
    orders.filter(
      (order) =>
        isPublishingPackage(order) &&
        order.manuscript_status ===
          "Published"
    );

  const totalOrderCount =
    orders.filter(
      (order) =>
        order.source ===
        "orders"
    ).length;

  const totalBookOrders =
    orders.filter(
      (order) =>
        !isPublishingPackage(order)
    ).length;

  const totalPackages =
    orders.filter(
      (order) =>
        isPublishingPackage(order)
    ).length;

  const totalValue =
    orders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.amount || 0
        ),
      0
    );

  const getPublishingProgressHref = (
    order: DisplayOrder
  ) => {
    if (order.manuscript_id) {
      return `/publishing-progress?manuscriptId=${encodeURIComponent(
        order.manuscript_id
      )}`;
    }

    if (order.book_id) {
      return `/publishing-progress?bookId=${encodeURIComponent(
        order.book_id
      )}`;
    }

    if (order.book) {
      return `/publishing-progress?title=${encodeURIComponent(
        order.book
      )}`;
    }

    return "/publishing-progress";
  };

  const BookOrderCard = ({
    order,
  }: {
    order: DisplayOrder;
  }) => (
    <article className="group rounded-[1.75rem] border border-black/10 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eee9df] text-2xl">
            📖
          </div>

          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-black/35">
              {order.source ===
              "sales"
                ? "Book Sale"
                : "Book Order"}
            </p>

            <p className="mt-1 truncate text-sm font-semibold">
              {order.order_number}
            </p>
          </div>
        </div>

        <StatusBadge
          status={order.status}
        />
      </div>

      <h3 className="mt-6 text-xl font-semibold">
        {order.book}
      </h3>

      <p className="mt-2 text-xs text-black/40">
        Ordered on{" "}
        {formatDate(
          order.created_at
        )}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-[#f8f6f1] p-4">
          <p className="text-[10px] uppercase tracking-wider text-black/35">
            Quantity
          </p>

          <p className="mt-1 text-sm font-semibold">
            {order.quantity}
          </p>
        </div>

        <div className="rounded-2xl bg-[#f8f6f1] p-4">
          <p className="text-[10px] uppercase tracking-wider text-black/35">
            Amount
          </p>

          <p className="mt-1 text-sm font-semibold">
            {formatAmount(
              order.amount
            )}
          </p>
        </div>

        <div className="rounded-2xl bg-[#f8f6f1] p-4">
          <p className="text-[10px] uppercase tracking-wider text-black/35">
            Type
          </p>

          <p className="mt-1 truncate text-sm font-medium">
            {order.type}
          </p>
        </div>
      </div>

      {order.source ===
        "sales" && (
        <div className="mt-4 rounded-2xl border border-[#e8e1d3] bg-[#faf9f6] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-black/35">
                Platform
              </p>

              <p className="mt-1 text-sm font-medium">
                {order.platform}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-black/35">
                Royalty
              </p>

              <p className="mt-1 text-sm font-semibold">
                {formatAmount(
                  order.royalty_amount
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() =>
          setSelectedOrder(
            order
          )
        }
        className="mt-6 w-full rounded-full border border-black/15 py-3.5 text-sm font-medium transition group-hover:bg-[#222] group-hover:text-white"
      >
        View Book Order Details
      </button>
    </article>
  );

  const PublishingPackageCard = ({
    order,
  }: {
    order: DisplayOrder;
  }) => {
    const status =
      order.manuscript_status ||
      order.status;

    const progress =
      order.manuscript_progress ??
      getProgress(status);

    return (
      <article className="overflow-hidden rounded-[2rem] border border-black/10 bg-white">
        <div className="p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#eee9df] text-3xl">
                📦
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#222] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Publishing Package
                  </span>

                  {realtimeConnected && (
                    <span className="rounded-full bg-[#e8eee7] px-3 py-1.5 text-[10px] font-semibold text-[#425442]">
                      ● Live
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-2xl font-semibold">
                  {order.type}
                </h3>

                <p className="mt-2 text-base font-medium text-black/65">
                  {order.manuscript_title ||
                    order.book}
                </p>

                <p className="mt-2 text-xs text-black/40">
                  Order{" "}
                  {order.order_number}
                  {" · "}
                  {formatDate(
                    order.created_at
                  )}
                </p>
              </div>
            </div>

            <div className="lg:text-right">
              <p className="text-[10px] uppercase tracking-[0.18em] text-black/35">
                Package Amount
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {formatAmount(
                  order.amount
                )}
              </p>

              <div className="mt-3 lg:flex lg:justify-end">
                <StatusBadge
                  status={status}
                />
              </div>
            </div>
          </div>

          <div className="mt-7 rounded-[1.5rem] border border-[#e8e1d3] bg-[#faf9f6] p-5 md:p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.2em] text-black/35">
                  Publishing Package Status
                </p>

                <p className="mt-2 text-sm leading-6 text-black/50">
                  {getNextStep(
                    status
                  )}
                </p>

                <PackageProgress
                  status={status}
                />
              </div>

              <ProgressRing
                progress={progress}
                size={130}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[#f8f6f1] p-4">
              <p className="text-[10px] uppercase tracking-wider text-black/35">
                Package
              </p>

              <p className="mt-1 text-sm font-medium">
                {order.type}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8f6f1] p-4">
              <p className="text-[10px] uppercase tracking-wider text-black/35">
                Amount
              </p>

              <p className="mt-1 text-sm font-semibold">
                {formatAmount(
                  order.amount
                )}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f8f6f1] p-4">
              <p className="text-[10px] uppercase tracking-wider text-black/35">
                Order Date
              </p>

              <p className="mt-1 text-sm font-medium">
                {formatDate(
                  order.created_at
                )}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() =>
                setSelectedOrder(
                  order
                )
              }
              className="rounded-full border border-black/15 py-3.5 text-sm font-medium transition hover:bg-[#222] hover:text-white"
            >
              View Package Details
            </button>

            <a
              href={getPublishingProgressHref(
                order
              )}
              className="rounded-full bg-[#222] py-3.5 text-center text-sm font-medium text-white transition hover:bg-black"
            >
              Track Publishing Progress →
            </a>
          </div>
        </div>
      </article>
    );
  };

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#222]">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-[#f8f6f1]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a
            href="/"
            className="shrink-0"
          >
            <img
              src="/ag-logo.png"
              alt="A&G Publication"
              className="h-auto w-[150px] object-contain"
            />
          </a>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a
              href="/author-dashboard"
              className="hover:opacity-60"
            >
              Dashboard
            </a>

            <a
              href="/my-books"
              className="hover:opacity-60"
            >
              My Books
            </a>

            <a
              href="/orders"
              className="font-semibold"
            >
              Orders
            </a>

            <a
              href="/publishing-progress"
              className="hover:opacity-60"
            >
              Publishing Progress
            </a>
          </nav>

          <a
            href="/author-dashboard"
            className="rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium transition hover:bg-[#222] hover:text-white"
          >
            Dashboard
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-16 md:pt-20">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-black/35">
              A&G Order Center
            </p>

            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
              Your orders.
              <br />
              Clearly organized.
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-black/50 md:text-base">
              Manage your book orders and publishing
              packages separately, with all important
              order information in one place.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-black/10 bg-white p-5 lg:w-72">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.18em] text-black/35">
                System
              </p>

              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  realtimeConnected
                    ? "bg-[#425442]"
                    : "bg-[#9b8b63]"
                }`}
              />
            </div>

            <p className="mt-3 text-sm font-medium">
              {realtimeConnected
                ? "Live connection active"
                : "Connecting to live updates"}
            </p>

            <p className="mt-1 text-xs leading-5 text-black/40">
              Order status and publishing package
              updates refresh automatically.
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "Book Orders",
              totalBookOrders,
              "Books & recorded sales",
            ],
            [
              "Publishing Packages",
              totalPackages,
              "Publishing purchases",
            ],
            [
              "Active Packages",
              activePackages.length,
              "Currently in process",
            ],
            [
              "Total Value",
              formatAmount(
                totalValue
              ),
              "Recorded order value",
            ],
          ].map(
            ([title, value, subtitle]) => (
              <div
                key={title}
                className="rounded-[1.5rem] border border-black/10 bg-white p-6"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
                  {title}
                </p>

                <p className="mt-4 text-3xl font-semibold">
                  {loading
                    ? "—"
                    : value}
                </p>

                <p className="mt-2 text-xs text-black/35">
                  {subtitle}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* SEARCH / FILTER */}
      <section className="mx-auto max-w-7xl px-6 pt-12">
        <div className="rounded-[1.5rem] border border-black/10 bg-white p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                "All",
                "Processing",
                "Payment Confirmed",
                "Shipped",
                "Delivered",
                "Cancelled",
                "Submitted",
                "Under Review",
                "Approved",
                "In Production",
                "Published",
              ].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() =>
                      setFilter(
                        item
                      )
                    }
                    className={`rounded-full px-4 py-2.5 text-xs font-medium transition ${
                      filter === item
                        ? "bg-[#222] text-white"
                        : "border border-black/10 hover:bg-black/5"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            <input
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              placeholder="Search order, book or package..."
              className="w-full rounded-full border border-black/10 bg-[#faf9f6] px-5 py-3 text-sm outline-none lg:max-w-sm"
            />
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        {loading ? (
          <div className="mt-10 rounded-[2rem] border border-black/10 bg-white py-24 text-center">
            <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-black/10" />

            <p className="mt-5 text-sm text-black/40">
              Loading your orders...
            </p>
          </div>
        ) : errorMessage ? (
          <div className="mt-10 rounded-[2rem] border border-black/10 bg-white px-6 py-20 text-center">
            <p className="text-lg font-semibold">
              Something went wrong
            </p>

            <p className="mt-2 text-sm text-black/40">
              {errorMessage}
            </p>

            <button
              onClick={() => {
                setLoading(true);
                fetchOrders();
              }}
              className="mt-6 rounded-full bg-[#222] px-6 py-3 text-sm font-medium text-white"
            >
              Try Again
            </button>
          </div>
        ) : filteredOrders.length ===
          0 ? (
          <div className="mt-10 rounded-[2rem] border border-black/10 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f0ece3] text-2xl">
              📦
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No orders found
            </h2>

            <p className="mt-2 text-sm text-black/40">
              Try changing your search or filter.
            </p>
          </div>
        ) : (
          <>
            {/* BOOK ORDERS */}
            {bookOrders.length >
              0 && (
              <section className="mt-14">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#222] text-lg text-white">
                        📚
                      </div>

                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/35">
                        Book Orders
                      </p>
                    </div>

                    <h2 className="mt-4 text-3xl font-semibold">
                      Your Books
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-black/40">
                      Physical book orders and recorded
                      book sales are kept here separately
                      from your publishing packages.
                    </p>
                  </div>

                  <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-black/50">
                    {bookOrders.length}{" "}
                    {bookOrders.length === 1
                      ? "record"
                      : "records"}
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {bookOrders.map(
                    (order) => (
                      <BookOrderCard
                        key={`${order.source}-${order.id}`}
                        order={order}
                      />
                    )
                  )}
                </div>
              </section>
            )}

            {/* PUBLISHING PACKAGES */}
            {publishingPackages.length >
              0 && (
              <section className="mt-16">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eee9df] text-lg">
                        📦
                      </div>

                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/35">
                        Publishing Packages
                      </p>
                    </div>

                    <h2 className="mt-4 text-3xl font-semibold">
                      Your Publishing Packages
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-black/40">
                      Your publishing purchases are
                      separated from normal book orders.
                      Track the package status and open
                      the dedicated publishing journey.
                    </p>
                  </div>

                  <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-black/50">
                    {publishingPackages.length}{" "}
                    {publishingPackages.length === 1
                      ? "package"
                      : "packages"}
                  </div>
                </div>

                <div className="space-y-5">
                  {publishingPackages.map(
                    (order) => (
                      <PublishingPackageCard
                        key={`${order.source}-${order.id}`}
                        order={order}
                      />
                    )
                  )}
                </div>
              </section>
            )}

            {/* COMPLETED PACKAGE INFO */}
            {completedPackages.length >
              0 && (
              <section className="mt-12">
                <div className="rounded-[1.75rem] border border-[#dfe8dd] bg-[#eef4ec] p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#425442]">
                        Publishing Complete
                      </p>

                      <p className="mt-2 text-sm leading-6 text-[#425442]/70">
                        {completedPackages.length}{" "}
                        {completedPackages.length === 1
                          ? "publishing package has"
                          : "publishing packages have"}{" "}
                        reached Published status.
                      </p>
                    </div>

                    <a
                      href="/my-books"
                      className="rounded-full bg-[#425442] px-5 py-3 text-center text-sm font-medium text-white"
                    >
                      View My Books →
                    </a>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </section>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-5"
          onClick={() =>
            setSelectedOrder(
              null
            )
          }
        >
          <div
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div className="shrink-0 border-b border-black/10 px-6 py-5 md:px-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#f4f1ea] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-black/45">
                      {isPublishingPackage(
                        selectedOrder
                      )
                        ? "Publishing Package"
                        : selectedOrder.source ===
                          "sales"
                        ? "Book Sale"
                        : "Book Order"}
                    </span>

                    {realtimeConnected && (
                      <span className="rounded-full bg-[#e8eee7] px-3 py-1 text-[10px] font-semibold text-[#425442]">
                        ● Live
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 text-2xl font-semibold">
                    {selectedOrder.book}
                  </h2>

                  <p className="mt-1 text-xs text-black/40">
                    {selectedOrder.order_number}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setSelectedOrder(
                      null
                    )
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-lg"
                >
                  ×
                </button>
              </div>
            </div>

            {/* MODAL BODY */}
            <div className="overflow-y-auto px-6 py-6 md:px-8 md:py-8">
              <div className="space-y-7">
                {/* SUMMARY */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-[#f8f6f1] p-4">
                    <p className="text-[10px] uppercase tracking-wider text-black/35">
                      Status
                    </p>

                    <div className="mt-2">
                      <StatusBadge
                        status={
                          selectedOrder.status
                        }
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#f8f6f1] p-4">
                    <p className="text-[10px] uppercase tracking-wider text-black/35">
                      Amount
                    </p>

                    <p className="mt-2 text-sm font-semibold">
                      {formatAmount(
                        selectedOrder.amount
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f8f6f1] p-4">
                    <p className="text-[10px] uppercase tracking-wider text-black/35">
                      Ordered
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {formatDate(
                        selectedOrder.created_at
                      )}
                    </p>
                  </div>
                </div>

                {/* PUBLISHING PACKAGE */}
                {isPublishingPackage(
                  selectedOrder
                ) && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
                      Publishing Package
                    </p>

                    <div className="mt-4 rounded-[1.5rem] border border-[#e8e1d3] bg-[#faf9f6] p-5 md:p-6">
                      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs text-black/40">
                            Package
                          </p>

                          <h3 className="mt-1 text-xl font-semibold">
                            {selectedOrder.type}
                          </h3>

                          <p className="mt-2 text-sm text-black/50">
                            {selectedOrder.manuscript_title ||
                              selectedOrder.book}
                          </p>

                          <div className="mt-4">
                            <StatusBadge
                              status={
                                selectedOrder.manuscript_status ||
                                selectedOrder.status
                              }
                            />
                          </div>
                        </div>

                        <ProgressRing
                          progress={
                            selectedOrder.manuscript_progress ??
                            getProgress(
                              selectedOrder.manuscript_status ||
                                selectedOrder.status
                            )
                          }
                          size={130}
                        />
                      </div>

                      <div className="mt-6 rounded-2xl bg-white p-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-black/35">
                          Current Stage
                        </p>

                        <p className="mt-2 text-sm font-semibold">
                          {selectedOrder.manuscript_status ||
                            selectedOrder.status}
                        </p>

                        <p className="mt-2 text-sm leading-6 text-black/50">
                          {getNextStep(
                            selectedOrder.manuscript_status ||
                              selectedOrder.status
                          )}
                        </p>
                      </div>

                      <a
                        href={getPublishingProgressHref(
                          selectedOrder
                        )}
                        className="mt-5 block rounded-full bg-[#222] py-3.5 text-center text-sm font-medium text-white"
                      >
                        Track Publishing Progress →
                      </a>
                    </div>
                  </div>
                )}

                {/* BOOK ORDER */}
                {!isPublishingPackage(
                  selectedOrder
                ) && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
                      Book Order
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-[#f8f6f1] p-4">
                        <p className="text-[10px] uppercase tracking-wider text-black/35">
                          Book
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {
                            selectedOrder.book
                          }
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8f6f1] p-4">
                        <p className="text-[10px] uppercase tracking-wider text-black/35">
                          Quantity
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {
                            selectedOrder.quantity
                          }
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8f6f1] p-4">
                        <p className="text-[10px] uppercase tracking-wider text-black/35">
                          Order Type
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {
                            selectedOrder.type
                          }
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8f6f1] p-4">
                        <p className="text-[10px] uppercase tracking-wider text-black/35">
                          Amount
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {formatAmount(
                            selectedOrder.amount
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ORDER INFORMATION */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
                    Order Information
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#f8f6f1] p-4">
                      <p className="text-[10px] uppercase tracking-wider text-black/35">
                        Order Number
                      </p>

                      <p className="mt-1 break-all font-mono text-xs">
                        {
                          selectedOrder.order_number
                        }
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f8f6f1] p-4">
                      <p className="text-[10px] uppercase tracking-wider text-black/35">
                        Order Type
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {
                          selectedOrder.type
                        }
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f8f6f1] p-4">
                      <p className="text-[10px] uppercase tracking-wider text-black/35">
                        Created
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {formatDateTime(
                          selectedOrder.created_at
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#f8f6f1] p-4">
                      <p className="text-[10px] uppercase tracking-wider text-black/35">
                        Last Updated
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {formatDateTime(
                          selectedOrder.updated_at
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PAYMENT */}
                {selectedOrder.source ===
                  "orders" && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
                      Payment
                    </p>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl bg-[#f8f6f1] p-4">
                        <p className="text-[10px] uppercase tracking-wider text-black/35">
                          Razorpay Order ID
                        </p>

                        <p className="mt-2 break-all font-mono text-xs">
                          {
                            selectedOrder.razorpay_order_id
                          }
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8f6f1] p-4">
                        <p className="text-[10px] uppercase tracking-wider text-black/35">
                          Razorpay Payment ID
                        </p>

                        <p className="mt-2 break-all font-mono text-xs">
                          {
                            selectedOrder.razorpay_payment_id
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* DELIVERY */}
                {selectedOrder.source ===
                  "orders" && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
                      Customer / Delivery
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-[#f8f6f1] p-4">
                        <p className="text-[10px] uppercase tracking-wider text-black/35">
                          Name
                        </p>

                        <p className="mt-1 text-sm">
                          {
                            selectedOrder.customer_name
                          }
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8f6f1] p-4">
                        <p className="text-[10px] uppercase tracking-wider text-black/35">
                          Phone
                        </p>

                        <p className="mt-1 text-sm">
                          {
                            selectedOrder.customer_phone
                          }
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8f6f1] p-4 sm:col-span-2">
                        <p className="text-[10px] uppercase tracking-wider text-black/35">
                          Email
                        </p>

                        <p className="mt-1 break-all text-sm">
                          {
                            selectedOrder.customer_email
                          }
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8f6f1] p-4 sm:col-span-2">
                        <p className="text-[10px] uppercase tracking-wider text-black/35">
                          Delivery Address
                        </p>

                        <p className="mt-1 text-sm leading-6">
                          {
                            selectedOrder.delivery_address
                          }

                          <br />

                          {
                            selectedOrder.city
                          }

                          {selectedOrder.state
                            ? `, ${selectedOrder.state}`
                            : ""}

                          {selectedOrder.pincode
                            ? ` - ${selectedOrder.pincode}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SALES */}
                {selectedOrder.source ===
                  "sales" && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35">
                      Sales Information
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-[#f8f6f1] p-4">
                        <p className="text-[10px] uppercase tracking-wider text-black/35">
                          Platform
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {
                            selectedOrder.platform
                          }
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8f6f1] p-4">
                        <p className="text-[10px] uppercase tracking-wider text-black/35">
                          Royalty
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {formatAmount(
                            selectedOrder.royalty_amount
                          )}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-[#f8f6f1] p-4 sm:col-span-2">
                        <p className="text-[10px] uppercase tracking-wider text-black/35">
                          Sale Date
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {formatDate(
                            selectedOrder.sale_date
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* LIVE STATUS */}
                <div className="rounded-[1.5rem] border border-[#e8e1d3] bg-[#faf9f6] p-5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-3 w-3 rounded-full ${
                        realtimeConnected
                          ? "bg-[#425442]"
                          : "bg-[#9b8b63]"
                      }`}
                    />

                    <div>
                      <p className="text-sm font-semibold">
                        {realtimeConnected
                          ? "Live updates connected"
                          : "Connecting to live updates"}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-black/40">
                        Order and publishing package
                        changes are monitored automatically.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="shrink-0 border-t border-black/10 bg-white px-6 py-4 md:px-8">
              <button
                onClick={() =>
                  setSelectedOrder(
                    null
                  )
                }
                className="w-full rounded-full bg-[#222] py-3.5 text-sm font-medium text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT */}
      <section className="bg-[#222] px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-white/35">
            A&G Support
          </p>

          <h2 className="mt-4 text-3xl font-semibold">
            Need help with an order?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/45">
            Get help with book orders, publishing
            packages, payments, delivery or your
            publishing progress.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="/contact"
              className="rounded-full bg-white px-7 py-3 text-sm font-medium text-[#222]"
            >
              Contact Support
            </a>

            <a
              href="/publishing-progress"
              className="rounded-full border border-white/15 px-7 py-3 text-sm font-medium text-white"
            >
              Publishing Progress
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#222] px-6 pb-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 border-t border-white/10 pt-8 text-xs text-white/35 md:flex-row">
          <p>
            © 2026 A&G Publication. All rights
            reserved.
          </p>

          <div className="flex gap-6">
            <a href="/books">
              Books
            </a>

            <a href="/publishing">
              Publishing
            </a>

            <a href="/contact">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}