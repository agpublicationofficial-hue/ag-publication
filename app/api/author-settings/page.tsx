"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type BankDetails = {
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  branch_name: string;
};

type NotificationPreferences = {
  email_notifications: boolean;
  stage_updates: boolean;
  query_responses: boolean;
  royalty_alerts: boolean;
  marketing_emails: boolean;
  sound_alerts: boolean;
  notification_sound_enabled: boolean;
};

const defaultBank: BankDetails = {
  account_holder_name: "",
  account_number: "",
  bank_name: "",
  ifsc_code: "",
  branch_name: "",
};

const defaultNotifications: NotificationPreferences = {
  email_notifications: true,
  stage_updates: true,
  query_responses: true,
  royalty_alerts: true,
  marketing_emails: false,
  sound_alerts: false,
  notification_sound_enabled: false,
};

export default function AuthorSettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [savingBank, setSavingBank] = useState(false);
  const [savingNotifications, setSavingNotifications] =
    useState(false);

  const [bank, setBank] =
    useState<BankDetails>(defaultBank);

  const [notifications, setNotifications] =
    useState<NotificationPreferences>(
      defaultNotifications
    );

  const [activeTab, setActiveTab] =
    useState<"bank" | "notifications">("bank");

  const loadSettings = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/author-login");
      return;
    }

    const [bankResult, notificationResult] =
      await Promise.all([
        supabase
          .from("author_bank_details")
          .select("*")
          .eq("author_id", user.id)
          .maybeSingle(),

        supabase
          .from("author_notification_preferences")
          .select("*")
          .eq("author_id", user.id)
          .maybeSingle(),
      ]);

    if (bankResult.data) {
      setBank({
        account_holder_name:
          bankResult.data.account_holder_name || "",
        account_number:
          bankResult.data.account_number || "",
        bank_name:
          bankResult.data.bank_name || "",
        ifsc_code:
          bankResult.data.ifsc_code || "",
        branch_name:
          bankResult.data.branch_name || "",
      });
    }

    if (notificationResult.data) {
      setNotifications({
        email_notifications:
          notificationResult.data
            .email_notifications ?? true,
        stage_updates:
          notificationResult.data.stage_updates ?? true,
        query_responses:
          notificationResult.data.query_responses ?? true,
        royalty_alerts:
          notificationResult.data.royalty_alerts ?? true,
        marketing_emails:
          notificationResult.data.marketing_emails ?? false,
        sound_alerts:
          notificationResult.data.sound_alerts ?? false,
        notification_sound_enabled:
          notificationResult.data
            .notification_sound_enabled ?? false,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateBank = (
    key: keyof BankDetails,
    value: string
  ) => {
    setBank((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateNotification = (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    setNotifications((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const saveBankDetails = async () => {
    setSavingBank(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/author-login");
      return;
    }

    const { error } = await supabase
      .from("author_bank_details")
      .upsert(
        {
          author_id: user.id,
          ...bank,
        },
        {
          onConflict: "author_id",
        }
      );

    if (error) {
      console.error(error);
      alert(error.message);
      setSavingBank(false);
      return;
    }

    alert("Bank details saved successfully.");
    setSavingBank(false);
  };

  const saveNotifications = async () => {
    setSavingNotifications(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/author-login");
      return;
    }

    const { error } = await supabase
      .from("author_notification_preferences")
      .upsert(
        {
          author_id: user.id,
          ...notifications,
        },
        {
          onConflict: "author_id",
        }
      );

    if (error) {
      console.error(error);
      alert(error.message);
      setSavingNotifications(false);
      return;
    }

    alert("Notification preferences saved.");
    setSavingNotifications(false);
  };

  const testSound = () => {
    try {
      const AudioContext =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof window.AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContext) {
        alert(
          "Your browser does not support notification sound."
        );
        return;
      }

      const context = new AudioContext();
      const oscillator =
        context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 660;

      gain.gain.setValueAtTime(
        0.001,
        context.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        0.12,
        context.currentTime + 0.02
      );

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + 0.25
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.25);
    } catch (error) {
      console.error(error);
      alert("Unable to play test sound.");
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f3ed]">
        <p className="text-sm text-black/50">
          Loading settings...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f3ed] text-[#171717]">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}

        <aside className="hidden w-64 shrink-0 bg-[#1c1c1a] text-white lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-7 py-6">
            <button
              onClick={() => router.push("/")}
              className="text-xl font-semibold"
            >
              A&G{" "}
              <span className="font-light">
                PUBLICATION
              </span>
            </button>

            <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-white/35">
              Author Portal
            </p>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-6">
            <button
              onClick={() =>
                router.push("/author-dashboard")
              }
              className="flex w-full rounded-xl px-3 py-3 text-left text-sm text-white/55 hover:bg-white/5 hover:text-white"
            >
              <span className="mr-3">⌂</span>
              Dashboard
            </button>

            <button
              onClick={() => router.push("/my-books")}
              className="flex w-full rounded-xl px-3 py-3 text-left text-sm text-white/55 hover:bg-white/5 hover:text-white"
            >
              <span className="mr-3">▤</span>
              My Books
            </button>

            <button
              onClick={() =>
                router.push("/submit-manuscript")
              }
              className="flex w-full rounded-xl px-3 py-3 text-left text-sm text-white/55 hover:bg-white/5 hover:text-white"
            >
              <span className="mr-3">＋</span>
              Submit Manuscript
            </button>

            <button
              onClick={() =>
                router.push("/publishing-progress")
              }
              className="flex w-full rounded-xl px-3 py-3 text-left text-sm text-white/55 hover:bg-white/5 hover:text-white"
            >
              <span className="mr-3">◷</span>
              Publishing Progress
            </button>

            <button
              onClick={() => router.push("/orders")}
              className="flex w-full rounded-xl px-3 py-3 text-left text-sm text-white/55 hover:bg-white/5 hover:text-white"
            >
              <span className="mr-3">□</span>
              Orders
            </button>

            <button
              onClick={() => router.push("/royalties")}
              className="flex w-full rounded-xl px-3 py-3 text-left text-sm text-white/55 hover:bg-white/5 hover:text-white"
            >
              <span className="mr-3">₹</span>
              Royalties
            </button>

            <button
              onClick={() => router.push("/support")}
              className="flex w-full rounded-xl px-3 py-3 text-left text-sm text-white/55 hover:bg-white/5 hover:text-white"
            >
              <span className="mr-3">?</span>
              Support
            </button>

            <button
              onClick={() =>
                router.push("/author-profile")
              }
              className="flex w-full rounded-xl px-3 py-3 text-left text-sm text-white/55 hover:bg-white/5 hover:text-white"
            >
              <span className="mr-3">◎</span>
              Profile
            </button>

            <button
              className="flex w-full rounded-xl bg-white px-3 py-3 text-left text-sm text-black"
            >
              <span className="mr-3">⚙</span>
              Settings
            </button>
          </nav>

          <div className="border-t border-white/10 p-5">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace("/author-login");
              }}
              className="w-full rounded-xl px-3 py-3 text-left text-sm text-white/50 hover:bg-white/5 hover:text-white"
            >
              ↪ Logout
            </button>
          </div>
        </aside>

        {/* MAIN */}

        <section className="min-w-0 flex-1">
          <header className="border-b border-black/10 px-5 py-6 sm:px-8 lg:px-10">
            <p className="text-xs uppercase tracking-[0.2em] text-black/35">
              Author Portal
            </p>

            <div className="mt-2">
              <h1 className="text-3xl font-medium">
                Settings
              </h1>

              <p className="mt-2 text-sm text-black/45">
                Manage your account preferences and
                payment information.
              </p>
            </div>
          </header>

          <div className="mx-auto max-w-5xl px-5 py-7 sm:px-8 lg:px-10 lg:py-10">

            {/* TABS */}

            <div className="mb-6 flex gap-2 rounded-2xl border border-black/10 bg-white p-2">
              <button
                onClick={() =>
                  setActiveTab("bank")
                }
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium ${
                  activeTab === "bank"
                    ? "bg-[#171717] text-white"
                    : "text-black/50 hover:bg-black/5"
                }`}
              >
                Bank Details
              </button>

              <button
                onClick={() =>
                  setActiveTab("notifications")
                }
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium ${
                  activeTab === "notifications"
                    ? "bg-[#171717] text-white"
                    : "text-black/50 hover:bg-black/5"
                }`}
              >
                Notifications
              </button>
            </div>

            {/* BANK */}

            {activeTab === "bank" && (
              <section className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
                <p className="text-xs uppercase tracking-[0.2em] text-black/35">
                  Payment Information
                </p>

                <h2 className="mt-2 text-2xl font-medium">
                  Bank Details
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-black/45">
                  These details are used for royalty
                  payment processing.
                </p>

                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  <Field
                    label="Account Holder Name"
                    value={bank.account_holder_name}
                    onChange={(value) =>
                      updateBank(
                        "account_holder_name",
                        value
                      )
                    }
                  />

                  <Field
                    label="Account Number"
                    value={bank.account_number}
                    onChange={(value) =>
                      updateBank(
                        "account_number",
                        value.replace(/\D/g, "")
                      )
                    }
                    type="password"
                  />

                  <Field
                    label="Bank Name"
                    value={bank.bank_name}
                    onChange={(value) =>
                      updateBank(
                        "bank_name",
                        value
                      )
                    }
                  />

                  <Field
                    label="IFSC Code"
                    value={bank.ifsc_code}
                    onChange={(value) =>
                      updateBank(
                        "ifsc_code",
                        value.toUpperCase()
                      )
                    }
                  />

                  <Field
                    label="Branch Name"
                    value={bank.branch_name}
                    onChange={(value) =>
                      updateBank(
                        "branch_name",
                        value
                      )
                    }
                  />
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={saveBankDetails}
                    disabled={savingBank}
                    className="rounded-xl bg-[#171717] px-6 py-3.5 text-sm text-white disabled:opacity-50"
                  >
                    {savingBank
                      ? "Saving..."
                      : "Save Bank Details"}
                  </button>
                </div>
              </section>
            )}

            {/* NOTIFICATIONS */}

            {activeTab === "notifications" && (
              <section className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8">
                <p className="text-xs uppercase tracking-[0.2em] text-black/35">
                  Communication
                </p>

                <h2 className="mt-2 text-2xl font-medium">
                  Notification Preferences
                </h2>

                <div className="mt-7 space-y-3">
                  <Toggle
                    title="Email Notifications"
                    description="Receive important account notifications by email."
                    checked={
                      notifications.email_notifications
                    }
                    onChange={(value) =>
                      updateNotification(
                        "email_notifications",
                        value
                      )
                    }
                  />

                  <Toggle
                    title="Stage Updates"
                    description="Get notified when your publishing stage changes."
                    checked={
                      notifications.stage_updates
                    }
                    onChange={(value) =>
                      updateNotification(
                        "stage_updates",
                        value
                      )
                    }
                  />

                  <Toggle
                    title="Query Responses"
                    description="Receive updates when A&G responds to your queries."
                    checked={
                      notifications.query_responses
                    }
                    onChange={(value) =>
                      updateNotification(
                        "query_responses",
                        value
                      )
                    }
                  />

                  <Toggle
                    title="Royalty Alerts"
                    description="Get notified about royalty statements and updates."
                    checked={
                      notifications.royalty_alerts
                    }
                    onChange={(value) =>
                      updateNotification(
                        "royalty_alerts",
                        value
                      )
                    }
                  />

                  <Toggle
                    title="Marketing Emails"
                    description="Receive optional news and promotional updates."
                    checked={
                      notifications.marketing_emails
                    }
                    onChange={(value) =>
                      updateNotification(
                        "marketing_emails",
                        value
                      )
                    }
                  />

                  <Toggle
                    title="Website Sound Alerts"
                    description="Enable sound alerts inside the author portal."
                    checked={
                      notifications.sound_alerts
                    }
                    onChange={(value) =>
                      updateNotification(
                        "sound_alerts",
                        value
                      )
                    }
                  />

                  <Toggle
                    title="Enable Notification Sound"
                    description="Allow the portal to play notification sounds."
                    checked={
                      notifications.notification_sound_enabled
                    }
                    onChange={(value) =>
                      updateNotification(
                        "notification_sound_enabled",
                        value
                      )
                    }
                  />
                </div>

                <div className="mt-8 rounded-2xl border border-black/10 bg-[#f8f6f1] p-5">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-medium">
                        Test Notification Sound
                      </p>

                      <p className="mt-1 text-xs text-black/40">
                        Check whether your browser can
                        play the portal alert sound.
                      </p>
                    </div>

                    <button
                      onClick={testSound}
                      className="rounded-xl border border-black/15 bg-white px-5 py-3 text-sm"
                    >
                      Test Sound
                    </button>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={saveNotifications}
                    disabled={savingNotifications}
                    className="rounded-xl bg-[#171717] px-6 py-3.5 text-sm text-white disabled:opacity-50"
                  >
                    {savingNotifications
                      ? "Saving..."
                      : "Save Preferences"}
                  </button>
                </div>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3 outline-none focus:border-black"
      />
    </div>
  );
}

function Toggle({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-xl border border-black/10 bg-[#faf9f6] p-5">
      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 text-xs text-black/40">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full ${
          checked
            ? "bg-[#171717]"
            : "bg-black/15"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}