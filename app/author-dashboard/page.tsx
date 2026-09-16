"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { RealtimeChannel } from "@supabase/supabase-js";

type Sale = {
  id: string | number;
  book_id?: string | number | null;
  platform?: string | null;
  quantity?: number | string | null;
  order_id?: string | number | null;
  sale_amount?: number | string | null;
  royalty_amount?: number | string | null;
  sale_date?: string | null;
};

type BankDetails = {
  author_id: string;
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  branch_name: string;
  created_at?: string | null;
  updated_at?: string | null;
};

type Profile = {
  name: string;
  email: string;
  phone: string;
};

type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
};

export default function AuthorDashboard() {
  const router = useRouter();

  const [active, setActive] = useState("Overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [sales, setSales] = useState<Sale[]>([]);
  const [booksCount, setBooksCount] = useState(0);
  const [inProductionCount, setInProductionCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  const [bank, setBank] = useState<BankDetails | null>(null);

  const [bankForm, setBankForm] = useState({
    account_holder_name: "",
    account_number: "",
    bank_name: "",
    ifsc_code: "",
    branch_name: "",
  });

  const [savingBank, setSavingBank] = useState(false);
  const [bankLoading, setBankLoading] = useState(true);

  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    phone: "",
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
  });

  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);

  /*
   * PROFILE
   */
  const loadProfile = async () => {
    const client = createClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      router.replace("/author-login");
      return;
    }

    const { data: author, error } = await client
      .from("authors")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      const fallbackName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        "";

      const fallbackPhone =
        user.user_metadata?.phone ||
        user.phone ||
        "";

      const fallbackEmail = user.email || "";

      setProfile({
        name: fallbackName,
        email: fallbackEmail,
        phone: fallbackPhone,
      });

      setProfileForm({
        name: fallbackName,
        phone: fallbackPhone,
      });

      setProfileLoading(false);
      return;
    }

    const name = author?.full_name || "";
    const email = author?.email || user.email || "";
    const phone = author?.phone || "";

    setProfile({
      name,
      email,
      phone,
    });

    setProfileForm({
      name,
      phone,
    });

    setProfileLoading(false);
  };

  /*
   * DASHBOARD DATA
   */
  const loadDashboardData = async (
    manualRefresh = false
  ) => {
    if (manualRefresh) {
      setRefreshing(true);
    }

    try {
      const client = createClient();

      const {
        data: { user },
      } = await client.auth.getUser();

      if (!user) {
        router.replace("/author-login");
        return;
      }

      /*
       * SALES
       */
      const salesResult = await client
        .from("daily_sales")
        .select(
          "id, book_id, platform, quantity, order_id, sale_amount, royalty_amount, sale_date"
        )
        .eq("author_id", user.id)
        .order("sale_date", { ascending: false });

      if (salesResult.error) {
        console.error("Sales fetch error:", {
          message: salesResult.error.message,
          details: salesResult.error.details,
          hint: salesResult.error.hint,
          code: salesResult.error.code,
        });
      } else {
        setSales((salesResult.data as Sale[]) || []);
      }

      /*
       * BOOKS
       */
      const booksResult = await client
        .from("books")
        .select("id")
        .eq("author_id", user.id);

      if (booksResult.error) {
        console.error("Books fetch error:", {
          message: booksResult.error.message,
          details: booksResult.error.details,
          hint: booksResult.error.hint,
          code: booksResult.error.code,
        });
      } else {
        setBooksCount((booksResult.data || []).length);
      }

      /*
       * MANUSCRIPTS
       */
      const manuscriptsResult = await client
        .from("manuscripts")
        .select("id, status")
        .eq("author_id", user.id);

      if (manuscriptsResult.error) {
        console.error("Manuscripts fetch error:", {
          message: manuscriptsResult.error.message,
          details: manuscriptsResult.error.details,
          hint: manuscriptsResult.error.hint,
          code: manuscriptsResult.error.code,
        });
      } else {
        const manuscripts = manuscriptsResult.data || [];

        setInProductionCount(
          manuscripts.filter(
            (item: { status?: string | null }) =>
              String(item.status || "").toLowerCase() ===
              "in production"
          ).length
        );
      }

      /*
       * ORDERS
       */
      const ordersResult = await client
        .from("orders")
        .select("id")
        .eq("author_id", user.id);

      if (ordersResult.error) {
        console.error("Orders fetch error:", {
          message: ordersResult.error.message,
          details: ordersResult.error.details,
          hint: ordersResult.error.hint,
          code: ordersResult.error.code,
        });
      } else {
        setOrdersCount((ordersResult.data || []).length);
      }

      /*
       * BANK DETAILS
       */
      const bankResult = await client
        .from("author_bank_details")
        .select(
          "author_id, account_holder_name, account_number, bank_name, ifsc_code, branch_name, created_at, updated_at"
        )
        .eq("author_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (bankResult.error) {
        console.error("Bank details fetch error:", {
          message: bankResult.error.message,
          details: bankResult.error.details,
          hint: bankResult.error.hint,
          code: bankResult.error.code,
        });

        setBank(null);

        setBankForm({
          account_holder_name: "",
          account_number: "",
          bank_name: "",
          ifsc_code: "",
          branch_name: "",
        });
      } else {
        const bankData =
          (bankResult.data?.[0] as
            | BankDetails
            | undefined) || null;

        setBank(bankData);

        setBankForm({
          account_holder_name:
            bankData?.account_holder_name || "",
          account_number:
            bankData?.account_number || "",
          bank_name: bankData?.bank_name || "",
          ifsc_code: bankData?.ifsc_code || "",
          branch_name: bankData?.branch_name || "",
        });
      }

      setBankLoading(false);

      await loadProfile();
    } catch (error) {
      console.error("Dashboard refresh error:", error);
    } finally {
      if (manualRefresh) {
        setRefreshing(false);
      }
    }
  };

  /*
   * LOGOUT
   */
  const handleLogout = async () => {
    const client = createClient();

    await client.auth.signOut();

    setMobileMenuOpen(false);

    router.replace("/author-login");
  };

  /*
   * REALTIME + INITIAL LOAD
   *
   * Realtime is treated as an optional enhancement.
   * If Supabase Realtime is not enabled for one or more
   * tables, the dashboard still works normally through
   * the regular data queries and manual refresh.
   */
  useEffect(() => {
    let cancelled = false;
    let channel: RealtimeChannel | null = null;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    let fallbackTimer: ReturnType<typeof setInterval> | null = null;

    const scheduleRealtimeRefresh = () => {
      if (cancelled) {
        return;
      }

      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      refreshTimer = setTimeout(() => {
        if (!cancelled) {
          void loadDashboardData(false);
        }
      }, 350);
    };

    const startFallbackRefresh = () => {
      if (fallbackTimer || cancelled) {
        return;
      }

      /*
       * Fallback polling keeps the dashboard updated even when
       * Supabase Realtime is unavailable or not enabled.
       */
      fallbackTimer = setInterval(() => {
        if (!cancelled) {
          void loadDashboardData(false);
        }
      }, 30000);
    };

    const stopFallbackRefresh = () => {
      if (fallbackTimer) {
        clearInterval(fallbackTimer);
        fallbackTimer = null;
      }
    };

    const startDashboard = async () => {
      const client = createClient();

      const {
        data: { session },
      } = await client.auth.getSession();

      if (!session) {
        router.replace("/author-login");
        return;
      }

      if (cancelled) {
        return;
      }

      const user = session.user;

      /*
       * Load the dashboard first. Realtime must never block
       * the initial dashboard data from appearing.
       */
      await loadDashboardData(false);

      if (cancelled) {
        return;
      }

      /*
       * Realtime channel is optional. The dashboard falls back
       * to 30-second polling if the channel cannot connect.
       */
      channel = client.channel(
        `author-dashboard-live-${user.id}-${Date.now()}`
      );

      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "daily_sales",
          filter: `author_id=eq.${user.id}`,
        },
        scheduleRealtimeRefresh
      );

      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "books",
          filter: `author_id=eq.${user.id}`,
        },
        scheduleRealtimeRefresh
      );

      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "manuscripts",
          filter: `author_id=eq.${user.id}`,
        },
        scheduleRealtimeRefresh
      );

      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `author_id=eq.${user.id}`,
        },
        scheduleRealtimeRefresh
      );

      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "author_bank_details",
          filter: `author_id=eq.${user.id}`,
        },
        scheduleRealtimeRefresh
      );

      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "authors",
          filter: `id=eq.${user.id}`,
        },
        scheduleRealtimeRefresh
      );

      channel.subscribe((status) => {
        if (cancelled) {
          return;
        }

        if (status === "SUBSCRIBED") {
          setLiveConnected(true);
          stopFallbackRefresh();

          console.info(
            "Author Dashboard realtime connected."
          );
          return;
        }

        if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          setLiveConnected(false);
          startFallbackRefresh();

          /*
           * Do not treat a Realtime failure as a dashboard
           * failure. Data fetching continues normally.
           */
          console.warn(
            "Author Dashboard realtime unavailable. Using automatic refresh fallback."
          );
        }
      });
    };

    void startDashboard();

    const authClient = createClient();

    const {
      data: { subscription },
    } = authClient.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_IN") {
          void loadDashboardData(false);
        }

        if (event === "USER_UPDATED") {
          void loadProfile();
        }

        if (event === "SIGNED_OUT") {
          router.replace("/author-login");
        }
      }
    );

    return () => {
      cancelled = true;

      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      stopFallbackRefresh();
      subscription.unsubscribe();

      if (channel) {
        setLiveConnected(false);

        const cleanupClient = createClient();
        void cleanupClient.removeChannel(channel);

        channel = null;
      }
    };
  }, [router]);

  /*
   * MANUAL REFRESH
   */
  const handleManualRefresh = async () => {
    await loadDashboardData(true);
  };

  /*
   * TODAY
   */
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  const todaySales = sales.filter((sale) => {
    if (!sale.sale_date) {
      return false;
    }

    if (sale.sale_date.length === 10) {
      return sale.sale_date === today;
    }

    const saleDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date(sale.sale_date));

    return saleDate === today;
  });

  const totalBooksSold = todaySales.reduce(
    (sum, sale) =>
      sum + Number(sale.quantity || 0),
    0
  );

  const amazonSales = todaySales
    .filter(
      (sale) =>
        sale.platform?.toLowerCase() === "amazon"
    )
    .reduce(
      (sum, sale) =>
        sum + Number(sale.quantity || 0),
      0
    );

  const flipkartSales = todaySales
    .filter(
      (sale) =>
        sale.platform?.toLowerCase() === "flipkart"
    )
    .reduce(
      (sum, sale) =>
        sum + Number(sale.quantity || 0),
      0
    );

  const todayRevenue = todaySales.reduce(
    (sum, sale) =>
      sum + Number(sale.sale_amount || 0),
    0
  );

  const todayRoyalty = todaySales.reduce(
    (sum, sale) =>
      sum + Number(sale.royalty_amount || 0),
    0
  );

  /*
   * LIVE ACTIVITY
   */
  const liveActivities: ActivityItem[] = sales
    .filter((sale) => sale.sale_date)
    .slice(0, 20)
    .map((sale) => ({
      id: `sale-${sale.id}`,
      title: "Book sale recorded",
      subtitle: `${sale.platform || "Platform"} · Book ID ${
        sale.book_id || "N/A"
      } · ${Number(sale.quantity || 0)} ${
        Number(sale.quantity || 0) === 1
          ? "copy"
          : "copies"
      }`,
      date: sale.sale_date
        ? new Date(sale.sale_date).toLocaleDateString(
            "en-IN",
            {
              day: "numeric",
              month: "short",
              year: "numeric",
            }
          )
        : "Recently",
    }));

  const defaultActivities: ActivityItem[] = [
    {
      id: "cover-design",
      title: "Cover design approved",
      subtitle: "The Soul Recovery — Part II",
      date: "2 days ago",
    },
    {
      id: "manuscript",
      title: "Manuscript received",
      subtitle: "A&G Publication",
      date: "5 days ago",
    },
    {
      id: "royalty",
      title: "Royalty statement generated",
      subtitle: "July 2026",
      date: "1 week ago",
    },
  ];

  const allActivities =
    liveActivities.length > 0
      ? [...liveActivities, ...defaultActivities]
      : defaultActivities;

  const visibleActivities = showAllActivity
    ? allActivities
    : allActivities.slice(0, 3);

  /*
   * MENU
   */
  const menu = [
    { name: "Overview", icon: "⌂" },
    { name: "Profile", icon: "◉" },
    { name: "My Books", icon: "▤" },
    { name: "Submit Manuscript", icon: "＋" },
    { name: "Publishing Progress", icon: "◷" },
    { name: "Orders", icon: "□" },
    { name: "Royalties", icon: "₹" },
    { name: "Bank Details", icon: "🏦" },
    { name: "Support", icon: "?" },
    { name: "Logout", icon: "↪" },
  ];

  const scrollToSection = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const handleMenuClick = (itemName: string) => {
    setMobileMenuOpen(false);

    if (itemName === "Logout") {
      void handleLogout();
      return;
    }

    if (itemName === "My Books") {
      router.push("/my-books");
      return;
    }

    if (itemName === "Submit Manuscript") {
      router.push("/submit-manuscript");
      return;
    }

    if (itemName === "Publishing Progress") {
      router.push("/publishing-progress");
      return;
    }

    if (itemName === "Orders") {
      router.push("/orders");
      return;
    }

    if (itemName === "Royalties") {
      router.push("/royalties");
      return;
    }

    if (itemName === "Support") {
      router.push("/support");
      return;
    }

    if (itemName === "Profile") {
      setActive(itemName);

      setTimeout(() => {
        scrollToSection("profile-section");
      }, 50);

      return;
    }

    if (itemName === "Bank Details") {
      setActive(itemName);

      setTimeout(() => {
        scrollToSection("bank-details");
      }, 50);

      return;
    }

    setActive(itemName);

    if (itemName === "Overview") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /*
   * PROFILE UPDATE
   */
  const handleProfileSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const name = profileForm.name.trim();
    const phone = profileForm.phone.trim();

    if (!name) {
      alert("Please enter your name.");
      return;
    }

    setSavingProfile(true);

    try {
      const client = createClient();

      const {
        data: { user },
      } = await client.auth.getUser();

      if (!user) {
        router.replace("/author-login");
        return;
      }

      const { error } = await client
        .from("authors")
        .update({
          full_name: name,
          phone,
        })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      await loadProfile();

      alert("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to update profile. Please try again."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  /*
   * BANK DETAILS UPDATE / INSERT
   */
  const handleBankSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const accountHolder =
      bankForm.account_holder_name.trim();

    const accountNumber =
      bankForm.account_number.trim();

    const bankName =
      bankForm.bank_name.trim();

    const ifsc =
      bankForm.ifsc_code.trim().toUpperCase();

    const branch =
      bankForm.branch_name.trim();

    if (
      !accountHolder ||
      !accountNumber ||
      !bankName ||
      !ifsc ||
      !branch
    ) {
      alert("Please fill all bank details.");
      return;
    }

    setSavingBank(true);

    try {
      const client = createClient();

      const {
        data: { user },
      } = await client.auth.getUser();

      if (!user) {
        router.replace("/author-login");
        return;
      }

      const payload = {
        author_id: user.id,
        account_holder_name: accountHolder,
        account_number: accountNumber,
        bank_name: bankName,
        ifsc_code: ifsc,
        branch_name: branch,
        updated_at: new Date().toISOString(),
      };

      const existingResult = await client
        .from("author_bank_details")
        .select(
          "author_id, account_holder_name, account_number, bank_name, ifsc_code, branch_name, created_at, updated_at"
        )
        .eq("author_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (existingResult.error) {
        throw existingResult.error;
      }

      const existingBank =
        (existingResult.data?.[0] as
          | BankDetails
          | undefined) || null;

      if (existingBank) {
        const { error } = await client
          .from("author_bank_details")
          .update(payload)
          .eq("author_id", user.id);

        if (error) {
          throw error;
        }

        setBank({
          author_id: user.id,
          account_holder_name: accountHolder,
          account_number: accountNumber,
          bank_name: bankName,
          ifsc_code: ifsc,
          branch_name: branch,
          created_at: existingBank.created_at,
          updated_at: payload.updated_at,
        });
      } else {
        const { error } = await client
          .from("author_bank_details")
          .insert(payload);

        if (error) {
          throw error;
        }

        setBank({
          author_id: user.id,
          account_holder_name: accountHolder,
          account_number: accountNumber,
          bank_name: bankName,
          ifsc_code: ifsc,
          branch_name: branch,
          updated_at: payload.updated_at,
        });
      }

      setBankForm({
        account_holder_name: accountHolder,
        account_number: accountNumber,
        bank_name: bankName,
        ifsc_code: ifsc,
        branch_name: branch,
      });

      alert("Bank details saved successfully.");

      await loadDashboardData(false);
    } catch (error) {
      console.error("Bank details save error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to save bank details. Please try again."
      );
    } finally {
      setSavingBank(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f3ed] text-[#171717]">
      <div className="flex min-h-screen">

        {/* =========================================================
            DESKTOP SIDEBAR
        ========================================================= */}
        <aside className="hidden w-64 shrink-0 border-r border-black/10 bg-[#1c1c1a] text-white lg:flex lg:flex-col">

          <div className="border-b border-white/10 px-7 py-6">
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight"
            >
              A&G{" "}
              <span className="font-light">
                PUBLICATION
              </span>
            </Link>

            <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-white/35">
              Author Portal
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <p className="mb-4 px-3 text-[10px] uppercase tracking-[0.25em] text-white/30">
              Dashboard
            </p>

            <div className="space-y-1">
              {menu.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() =>
                    handleMenuClick(item.name)
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                    active === item.name
                      ? "bg-white text-black"
                      : "text-white/55 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center text-sm">
                    {item.icon}
                  </span>

                  {item.name}
                </button>
              ))}
            </div>
          </nav>

          <div className="border-t border-white/10 p-5">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
            >
              <span>↗</span>
              Visit Website
            </Link>
          </div>
        </aside>

        {/* =========================================================
            MOBILE SIDEBAR OVERLAY
        ========================================================= */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Author dashboard navigation"
          >
            {/* Backdrop */}
            <button
              type="button"
              aria-label="Close menu"
              onClick={() =>
                setMobileMenuOpen(false)
              }
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            />

            {/* Mobile Drawer */}
            <aside className="relative z-10 flex h-full w-[min(82vw,320px)] flex-col bg-[#1c1c1a] text-white shadow-2xl">

              <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
                <div>
                  <Link
                    href="/"
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className="text-lg font-semibold tracking-tight"
                  >
                    A&G{" "}
                    <span className="font-light">
                      PUBLICATION
                    </span>
                  </Link>

                  <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-white/35">
                    Author Portal
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-lg text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close navigation"
                >
                  ×
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-6">
                <p className="mb-4 px-3 text-[10px] uppercase tracking-[0.25em] text-white/30">
                  Dashboard
                </p>

                <div className="space-y-1">
                  {menu.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() =>
                        handleMenuClick(item.name)
                      }
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                        active === item.name
                          ? "bg-white text-black"
                          : "text-white/55 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm">
                        {item.icon}
                      </span>

                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              </nav>

              <div className="border-t border-white/10 p-5">
                <Link
                  href="/"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
                >
                  <span>↗</span>
                  Visit Website
                </Link>
              </div>
            </aside>
          </div>
        )}

        {/* =========================================================
            MAIN
        ========================================================= */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* =======================================================
              TOPBAR
          ======================================================= */}
          <header className="border-b border-black/10 bg-[#f6f3ed] px-4 py-4 sm:px-8 sm:py-5 lg:px-10">

            <div className="flex items-center justify-between gap-3">

              <div className="flex min-w-0 items-center gap-3">

                {/* MOBILE MENU BUTTON */}
                <button
                  type="button"
                  onClick={() =>
                    setMobileMenuOpen(true)
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white text-xl transition hover:border-black/25 hover:bg-[#faf9f6] lg:hidden"
                  aria-label="Open navigation menu"
                  aria-expanded={mobileMenuOpen}
                >
                  ☰
                </button>

                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/35 sm:text-xs">
                    Author Dashboard
                  </p>

                  <h1 className="mt-1 truncate text-lg font-medium sm:text-2xl">
                    Good morning,{" "}
                    {profile.name || "Author"}
                  </h1>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">

                {/* LIVE STATUS */}
                <div className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-[11px] sm:flex">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      liveConnected
                        ? "bg-green-500"
                        : "bg-red-400"
                    }`}
                  />

                  <span className="text-black/50">
                    {liveConnected
                      ? "Live"
                      : "Offline"}
                  </span>
                </div>

                {/* REFRESH BUTTON */}
                <button
                  type="button"
                  onClick={() =>
                    void handleManualRefresh()
                  }
                  disabled={refreshing}
                  className="flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-3 text-xs font-medium transition hover:border-black/25 hover:bg-[#faf9f6] disabled:cursor-not-allowed disabled:opacity-60 sm:h-auto sm:px-4 sm:py-2"
                  title="Refresh dashboard data"
                >
                  <span
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  >
                    ↻
                  </span>

                  <span className="hidden sm:inline">
                    {refreshing
                      ? "Refreshing..."
                      : "Refresh Data"}
                  </span>
                </button>

                {/* DESKTOP PROFILE BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    setActive("Profile");
                    scrollToSection("profile-section");
                  }}
                  className="hidden h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-sm sm:flex"
                  aria-label="Open profile"
                >
                  ♧
                </button>

                {/* AVATAR */}
                <button
                  type="button"
                  onClick={() => {
                    setActive("Profile");
                    scrollToSection("profile-section");
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1c1c1a] text-sm font-medium text-white"
                  aria-label="Open profile"
                >
                  {(profile.name || "A")
                    .trim()
                    .charAt(0)
                    .toUpperCase() || "A"}
                </button>

              </div>
            </div>

            {/* MOBILE LIVE STATUS */}
            <div className="mt-3 flex items-center gap-2 text-[11px] text-black/45 sm:hidden">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  liveConnected
                    ? "bg-green-500"
                    : "bg-red-400"
                }`}
              />

              {liveConnected
                ? "Live data connection active"
                : "Live connection unavailable — use Refresh Data"}
            </div>

          </header>

          {/* =======================================================
              CONTENT
          ======================================================= */}
          <section className="flex-1 px-4 py-6 sm:px-8 sm:py-7 lg:px-10 lg:py-10">

            {/* Welcome */}
            <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm sm:mb-8 sm:p-8">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/35 sm:text-xs">
                    Your publishing journey
                  </p>

                  <h2 className="mt-2 text-xl font-medium tracking-tight sm:text-3xl">
                    Welcome to your author space.
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-black/50">
                    Manage your books, manuscripts and publishing journey
                    from one place.
                  </p>
                </div>

                <Link
                  href="/publishing-progress"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-[#171717] px-5 py-3 text-sm font-medium text-white transition hover:bg-black sm:w-auto"
                >
                  View Publishing Progress →
                </Link>

              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">

              {[
                {
                  label: "My Books",
                  value: String(booksCount),
                  note: "Published & ongoing",
                },
                {
                  label: "In Production",
                  value: String(inProductionCount),
                  note: "Currently active",
                },
                {
                  label: "Orders",
                  value: String(ordersCount),
                  note: "Total orders",
                },
                {
                  label: "Royalties",
                  value: `₹${todayRoyalty.toLocaleString("en-IN")}`,
                  note: "Today's recorded royalty",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-black/10 bg-white p-5"
                >
                  <p className="text-xs text-black/40">
                    {stat.label}
                  </p>

                  <p className="mt-3 text-2xl font-medium tracking-tight sm:text-3xl">
                    {stat.value}
                  </p>

                  <p className="mt-2 text-xs text-black/35">
                    {stat.note}
                  </p>
                </div>
              ))}

            </div>

            {/* Daily Sales */}
            <div className="mt-5 rounded-2xl border border-black/10 bg-white p-5 sm:mt-6 sm:p-7">

              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/35 sm:text-xs">
                    Sales overview
                  </p>

                  <h3 className="mt-2 text-xl font-medium">
                    Daily Sales
                  </h3>

                  <p className="mt-1 text-sm text-black/45">
                    Automatically tracked sales from Amazon and Flipkart.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-[#f2eee6] px-3 py-1.5 text-[11px] font-medium">
                  ● Auto Sync
                </span>

              </div>

              {/* Summary Cards */}
              <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">

                <div className="rounded-xl border border-black/10 bg-[#f8f6f1] p-5">
                  <p className="text-xs text-black/40">
                    Today
                  </p>

                  <p className="mt-3 text-2xl font-medium">
                    {totalBooksSold}
                  </p>

                  <p className="mt-2 text-xs text-black/35">
                    Books sold
                  </p>
                </div>

                <div className="rounded-xl border border-black/10 bg-[#f8f6f1] p-5">
                  <p className="text-xs text-black/40">
                    Amazon
                  </p>

                  <p className="mt-3 text-2xl font-medium">
                    {amazonSales}
                  </p>

                  <p className="mt-2 text-xs text-black/35">
                    Books sold
                  </p>
                </div>

                <div className="rounded-xl border border-black/10 bg-[#f8f6f1] p-5">
                  <p className="text-xs text-black/40">
                    Flipkart
                  </p>

                  <p className="mt-3 text-2xl font-medium">
                    {flipkartSales}
                  </p>

                  <p className="mt-2 text-xs text-black/35">
                    Books sold
                  </p>
                </div>

                <div className="rounded-xl border border-black/10 bg-[#f8f6f1] p-5">
                  <p className="text-xs text-black/40">
                    Revenue
                  </p>

                  <p className="mt-3 text-2xl font-medium">
                    ₹{todayRevenue.toLocaleString("en-IN")}
                  </p>

                  <p className="mt-2 text-xs text-black/35">
                    Today's sales
                  </p>
                </div>

                <div className="rounded-xl border border-black/10 bg-[#f8f6f1] p-5">
                  <p className="text-xs text-black/40">
                    Your Royalty
                  </p>

                  <p className="mt-3 text-2xl font-medium">
                    ₹{todayRoyalty.toLocaleString("en-IN")}
                  </p>

                  <p className="mt-2 text-xs text-black/35">
                    Today's royalty
                  </p>
                </div>

              </div>

              {/* Individual Sales */}
              <div className="mt-6">

                <div className="flex items-center justify-between border-b border-black/10 pb-4">

                  <div>
                    <p className="text-sm font-medium">
                      Today's Sales
                    </p>

                    <p className="mt-1 text-xs text-black/40">
                      Individual book orders
                    </p>
                  </div>

                  <span className="text-xs text-black/40">
                    {todaySales.length} orders
                  </span>

                </div>

                {todaySales.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-black/45">
                      No sales recorded today.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-black/10">

                    {todaySales.map((sale) => (
                      <div
                        key={sale.id}
                        className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                      >

                        <div className="min-w-0">
                          <p className="break-all text-sm font-medium">
                            Book ID: {sale.book_id || "N/A"}
                          </p>

                          <p className="mt-1 text-xs text-black/40">
                            {sale.platform || "Unknown"} ·{" "}
                            {sale.quantity || 0}{" "}
                            {Number(sale.quantity) === 1
                              ? "copy"
                              : "copies"}
                          </p>

                          <p className="mt-1 break-all text-xs text-black/35">
                            Order ID:{" "}
                            {sale.order_id || "N/A"}
                          </p>
                        </div>

                        <div className="sm:text-right">

                          <p className="text-sm font-medium">
                            ₹
                            {Number(
                              sale.sale_amount || 0
                            ).toLocaleString("en-IN")}
                          </p>

                          <p className="mt-1 text-xs text-black/40">
                            Royalty: ₹
                            {Number(
                              sale.royalty_amount || 0
                            ).toLocaleString("en-IN")}
                          </p>

                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </div>

              <div className="mt-5 flex flex-col gap-2 border-t border-black/10 pt-5 text-xs text-black/40 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Amazon + Flipkart automatic sales tracking
                </span>

                <span>
                  {liveConnected
                    ? "● Live Supabase updates"
                    : "● Live connection unavailable"}
                </span>
              </div>

            </div>

            {/* Lower Grid */}
            <div className="mt-5 grid gap-5 xl:mt-6 xl:grid-cols-[1.4fr_1fr]">

              {/* Current Book */}
              <div className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-black/35 sm:text-xs">
                      Current project
                    </p>

                    <h3 className="mt-2 text-lg font-medium sm:text-xl">
                      The Soul Recovery — Part II
                    </h3>
                  </div>

                  <span className="w-fit shrink-0 rounded-full bg-[#f2eee6] px-3 py-1.5 text-[11px] font-medium">
                    In Production
                  </span>

                </div>

                <div className="mt-6">

                  <div className="flex justify-between text-xs">
                    <span className="text-black/45">
                      Publishing progress
                    </span>

                    <span className="font-medium">
                      68%
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
                    <div className="h-full w-[68%] rounded-full bg-[#171717]" />
                  </div>

                </div>

                <div className="mt-7 grid gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">

                  {[
                    ["01", "Manuscript"],
                    ["02", "Design"],
                    ["03", "Publishing"],
                  ].map(([number, title]) => (
                    <div
                      key={number}
                      className="rounded-xl bg-[#f8f6f1] p-4"
                    >
                      <span className="text-xs text-black/30">
                        STEP {number}
                      </span>

                      <p className="mt-2 text-sm font-medium">
                        {title}
                      </p>

                      <p className="mt-1 text-[11px] text-black/40">
                        Completed
                      </p>
                    </div>
                  ))}

                </div>

                <Link
                  href="/track-order"
                  className="mt-6 inline-block text-sm font-medium underline underline-offset-4"
                >
                  See complete journey
                </Link>

              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl border border-black/10 bg-white p-5 sm:p-7">

                <p className="text-[10px] uppercase tracking-[0.2em] text-black/35 sm:text-xs">
                  Quick actions
                </p>

                <h3 className="mt-2 text-xl font-medium">
                  What would you like to do?
                </h3>

                <div className="mt-5 space-y-3 sm:mt-6">

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/submit-manuscript")
                    }
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-black/10 p-4 text-left transition hover:border-black/30 hover:bg-[#faf9f6]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        Submit a manuscript
                      </p>

                      <p className="mt-1 text-xs text-black/40">
                        Start a new publishing project
                      </p>
                    </div>

                    <span className="shrink-0">→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/my-books")
                    }
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-black/10 p-4 text-left transition hover:border-black/30 hover:bg-[#faf9f6]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        View my books
                      </p>

                      <p className="mt-1 text-xs text-black/40">
                        Manage your published titles
                      </p>
                    </div>

                    <span className="shrink-0">→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/support")
                    }
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-black/10 p-4 text-left transition hover:border-black/30 hover:bg-[#faf9f6]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        Contact support
                      </p>

                      <p className="mt-1 text-xs text-black/40">
                        Get help from A&G team
                      </p>
                    </div>

                    <span className="shrink-0">→</span>
                  </button>

                </div>
              </div>

            </div>

            {/* Recent Activity */}
            <div className="mt-5 rounded-2xl border border-black/10 bg-white p-5 sm:mt-6 sm:p-7">

              <div className="flex items-center justify-between gap-3">

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/35 sm:text-xs">
                    Recent activity
                  </p>

                  <h3 className="mt-2 text-xl font-medium">
                    Latest updates
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowAllActivity(
                      (current) => !current
                    )
                  }
                  className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-black/50 transition hover:bg-[#f8f6f1] hover:text-black"
                >
                  {showAllActivity
                    ? "Show less"
                    : "View all"}
                </button>

              </div>

              <div className="mt-5 divide-y divide-black/10 sm:mt-6">

                {visibleActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {activity.title}
                      </p>

                      <p className="mt-1 text-xs text-black/40">
                        {activity.subtitle}
                      </p>
                    </div>

                    <span className="text-xs text-black/35">
                      {activity.date}
                    </span>

                  </div>
                ))}

              </div>

              {showAllActivity &&
                liveActivities.length > 0 && (
                  <div className="mt-5 rounded-xl bg-[#f8f6f1] p-4 text-xs text-black/45">
                    Live sales activity is synced directly
                    from your Supabase account.
                  </div>
                )}

            </div>

            {/* Profile */}
            <div
              id="profile-section"
              className="mt-5 scroll-mt-6 rounded-2xl border border-black/10 bg-white p-5 sm:mt-6 sm:p-7"
            >

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/35 sm:text-xs">
                    Account
                  </p>

                  <h3 className="mt-2 text-xl font-medium">
                    Profile
                  </h3>

                  <p className="mt-1 text-xs text-black/40">
                    Manage your author profile information.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-[#f2eee6] px-3 py-1.5 text-[11px] font-medium">
                  Author Profile
                </span>

              </div>

              {profileLoading ? (
                <div className="mt-6 rounded-xl bg-[#f8f6f1] p-4 text-sm text-black/45">
                  Loading profile...
                </div>
              ) : (
                <form
                  className="mt-6 grid gap-4 sm:grid-cols-2"
                  onSubmit={handleProfileSubmit}
                >

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="w-full rounded-xl border border-black/10 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition focus:border-black/30 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Email
                    </label>

                    <input
                      type="email"
                      value={profile.email}
                      readOnly
                      className="w-full cursor-not-allowed rounded-xl border border-black/10 bg-[#f3f1ec] px-4 py-3 text-sm text-black/50 outline-none"
                    />

                    <p className="mt-2 text-[11px] text-black/35">
                      Login email is managed securely by your account.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Phone
                    </label>

                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(event) =>
                        setProfileForm((current) => ({
                          ...current,
                          phone: event.target.value,
                        }))
                      }
                      placeholder="Enter phone number"
                      autoComplete="tel"
                      className="w-full rounded-xl border border-black/10 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition focus:border-black/30 focus:bg-white"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="w-full rounded-xl bg-[#171717] px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingProfile
                        ? "Saving..."
                        : "Save Profile"}
                    </button>
                  </div>

                </form>
              )}

            </div>

            {/* Bank Details */}
            <div
              id="bank-details"
              className="mt-5 scroll-mt-6 rounded-2xl border border-black/10 bg-white p-5 sm:mt-6 sm:p-7"
            >

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/35 sm:text-xs">
                    Payments
                  </p>

                  <h3 className="mt-2 text-xl font-medium">
                    Bank Details
                  </h3>

                  <p className="mt-1 text-xs text-black/40">
                    Update your bank information for royalty and payout processing.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-[#f2eee6] px-3 py-1.5 text-[11px] font-medium">
                  Private &amp; Secure
                </span>

              </div>

              {bankLoading ? (
                <div className="mt-6 rounded-xl bg-[#f8f6f1] p-4 text-sm text-black/45">
                  Loading bank details...
                </div>
              ) : (
                <form
                  className="mt-6 grid gap-4 sm:grid-cols-2"
                  onSubmit={handleBankSubmit}
                >

                  {[
                    [
                      "account_holder_name",
                      "Account Holder Name",
                      "Enter account holder name",
                    ],
                    [
                      "bank_name",
                      "Bank Name",
                      "Enter bank name",
                    ],
                    [
                      "account_number",
                      "Account Number",
                      "Enter account number",
                    ],
                    [
                      "ifsc_code",
                      "IFSC Code",
                      "Enter IFSC code",
                    ],
                    [
                      "branch_name",
                      "Branch Name",
                      "Enter branch name",
                    ],
                  ].map(
                    ([name, label, placeholder]) => (
                      <div key={name}>

                        <label className="mb-2 block text-sm font-medium">
                          {label}
                        </label>

                        <input
                          type="text"
                          value={
                            bankForm[
                              name as keyof typeof bankForm
                            ]
                          }
                          onChange={(event) =>
                            setBankForm((current) => ({
                              ...current,
                              [name]:
                                name === "ifsc_code"
                                  ? event.target.value.toUpperCase()
                                  : event.target.value,
                            }))
                          }
                          placeholder={placeholder}
                          autoComplete="off"
                          className="w-full rounded-xl border border-black/10 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition focus:border-black/30 focus:bg-white"
                        />

                      </div>
                    )
                  )}

                  <div className="flex flex-col gap-3 border-t border-black/10 pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-xs leading-5 text-black/40">
                      Bank details are private and used only for royalty/payout processing.
                    </p>

                    <button
                      type="submit"
                      disabled={savingBank}
                      className="w-full rounded-xl bg-[#171717] px-5 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {savingBank
                        ? "Saving..."
                        : bank
                        ? "Update Bank Details"
                        : "Save Bank Details"}
                    </button>

                  </div>

                </form>
              )}

            </div>

            {/* Footer */}
            <div className="mt-7 flex flex-col justify-between gap-3 border-t border-black/10 pt-6 text-xs text-black/35 sm:mt-8 sm:flex-row">

              <span>
                © 2026 A&amp;G Publication
              </span>

              <span>
                Author Portal • Secure Workspace
              </span>

            </div>

          </section>
        </div>
      </div>
    </main>
  );
}