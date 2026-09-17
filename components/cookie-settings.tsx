"use client";

import { useEffect, useState } from "react";

const COOKIE_KEY = "ag-cookie-preferences";

type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const defaultPreferences: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export default function CookieSettings() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] =
    useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    setMounted(true);

    const saved = localStorage.getItem(COOKIE_KEY);

    if (!saved) {
      setShowBanner(true);
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      setPreferences({
        necessary: true,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
      });
    } catch {
      setShowBanner(true);
    }
  }, []);

  const savePreferences = (next: CookiePreferences) => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify(next));
    setPreferences(next);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const rejectNonEssential = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  if (!mounted) return null;

  return (
    <>
      {/* COOKIE BANNER */}
      {showBanner && (
        <div className="fixed inset-x-0 bottom-0 z-[99996] px-3 pb-3 sm:px-5 sm:pb-5">
          <div className="mx-auto max-w-6xl rounded-3xl border border-black/10 bg-white shadow-[0_-10px_60px_rgba(0,0,0,0.16)]">
            <div className="px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                {/* TEXT */}
                <div className="max-w-3xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
                      🍪
                    </div>

                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-black/40">
                        A&G PUBLICATION
                      </p>

                      <h3 className="mt-1 text-lg font-semibold text-black sm:text-xl">
                        Your privacy matters
                      </h3>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-black/60 sm:text-[15px]">
                    We use necessary cookies to keep A&G PUBLICATION
                    working properly. Optional cookies help us improve
                    the website and understand how visitors use it.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowSettings(true)}
                    className="mt-3 text-sm font-semibold text-black underline underline-offset-4 transition hover:text-black/60"
                  >
                    Manage Cookie Settings
                  </button>
                </div>

                {/* BUTTONS */}
                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                  <button
                    type="button"
                    onClick={rejectNonEssential}
                    className="min-h-12 rounded-full border border-black/15 px-5 text-sm font-medium text-black transition hover:bg-black/5"
                  >
                    Reject Non-Essential
                  </button>

                  <button
                    type="button"
                    onClick={acceptAll}
                    className="min-h-12 rounded-full bg-black px-6 text-sm font-medium text-white transition hover:bg-black/85"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALWAYS AVAILABLE COOKIE SETTINGS BUTTON */}
      {!showBanner && !showSettings && (
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          aria-label="Open Cookie Settings"
          className="fixed bottom-4 left-4 z-[99995] flex h-11 items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-xs font-medium text-black shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(0,0,0,0.16)]"
        >
          <span className="text-base">🍪</span>
          Cookie Settings
        </button>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="fixed inset-0 z-[99997] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
            {/* HEADER */}
            <div className="border-b border-black/10 px-6 py-6 sm:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-black/40">
                    A&G PUBLICATION
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-black">
                    Cookie Settings
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-black/50">
                    Choose which optional cookies you want to allow.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  aria-label="Close Cookie Settings"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 text-lg text-black/50 transition hover:bg-black/5 hover:text-black"
                >
                  ×
                </button>
              </div>
            </div>

            {/* OPTIONS */}
            <div className="space-y-3 px-6 py-6 sm:px-7">
              {/* Necessary */}
              <div className="rounded-2xl border border-black/10 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="pr-3">
                    <p className="font-semibold text-black">
                      Necessary Cookies
                    </p>

                    <p className="mt-1 text-xs leading-5 text-black/45">
                      Required for login, security, navigation and
                      essential website features.
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-black px-3 py-1.5 text-[10px] font-semibold text-white">
                    Always On
                  </span>
                </div>
              </div>

              {/* Analytics */}
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-black/10 p-4 transition hover:bg-black/[0.02]">
                <div className="pr-3">
                  <p className="font-semibold text-black">
                    Analytics Cookies
                  </p>

                  <p className="mt-1 text-xs leading-5 text-black/45">
                    Help us understand website usage and improve
                    performance.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(event) =>
                    setPreferences((current) => ({
                      ...current,
                      analytics: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 shrink-0 accent-black"
                />
              </label>

              {/* Marketing */}
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-black/10 p-4 transition hover:bg-black/[0.02]">
                <div className="pr-3">
                  <p className="font-semibold text-black">
                    Marketing Cookies
                  </p>

                  <p className="mt-1 text-xs leading-5 text-black/45">
                    Support relevant promotional and marketing
                    experiences.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(event) =>
                    setPreferences((current) => ({
                      ...current,
                      marketing: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 shrink-0 accent-black"
                />
              </label>
            </div>

            {/* ACTIONS */}
            <div className="border-t border-black/10 px-6 py-5 sm:px-7">
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={rejectNonEssential}
                  className="min-h-12 rounded-full border border-black/15 px-5 text-sm font-medium transition hover:bg-black/5"
                >
                  Reject Non-Essential
                </button>

                <button
                  type="button"
                  onClick={() => savePreferences(preferences)}
                  className="min-h-12 rounded-full border border-black/15 px-5 text-sm font-medium transition hover:bg-black/5"
                >
                  Save Preferences
                </button>

                <button
                  type="button"
                  onClick={acceptAll}
                  className="min-h-12 rounded-full bg-black px-6 text-sm font-medium text-white transition hover:bg-black/85"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}