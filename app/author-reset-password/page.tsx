"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AuthorResetPassword() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const setupRecoverySession = async () => {
      try {
        const supabase = createClient();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          if (mounted) {
            setCheckingSession(false);
          }
          return;
        }

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            if (!mounted) return;

            if (
              event === "PASSWORD_RECOVERY" ||
              currentSession
            ) {
              setCheckingSession(false);
              setErrorMessage("");
            }
          }
        );

        setTimeout(async () => {
          if (!mounted) return;

          const {
            data: { session: latestSession },
          } = await supabase.auth.getSession();

          if (!mounted) return;

          if (!latestSession) {
            setErrorMessage(
              "This password reset link is invalid or has expired."
            );
          }

          setCheckingSession(false);
          subscription.unsubscribe();
        }, 1000);
      } catch (error) {
        console.error(
          "Password recovery session error:",
          error
        );

        if (mounted) {
          setErrorMessage(
            "Unable to verify this password reset link. Please request a new one."
          );
          setCheckingSession(false);
        }
      }
    };

    setupRecoverySession();

    return () => {
      mounted = false;
    };
  }, []);

  const handleUpdatePassword = async () => {
    setErrorMessage("");
    setMessage("");

    if (!password || !confirmPassword) {
      setErrorMessage("Please enter your new password.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage(
        "Password must be at least 6 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setErrorMessage(
          "Your password reset session is invalid or has expired. Please request a new reset link."
        );
        setLoading(false);
        return;
      }

      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      setMessage(
        "Your password has been updated successfully."
      );

      setPassword("");
      setConfirmPassword("");

      await supabase.auth.signOut();

      setTimeout(() => {
        router.replace("/author-login");
      }, 2000);
    } catch (error) {
      console.error(
        "Password update error:",
        error
      );

      setErrorMessage(
        "Something went wrong while updating your password. Please try again."
      );

      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f4ee] text-[#171717]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black" />

          <p className="text-sm text-black/50">
            Checking password reset link...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#171717]">
      <nav className="border-b border-black/10 bg-[#f7f4ee]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/"
            className="shrink-0"
          >
            <img
              src="/ag-logo.png"
              alt="A&G Publication"
              className="h-auto w-[150px] object-contain"
            />
          </Link>

          <Link
            href="/author-login"
            className="text-sm font-medium text-black/60 transition hover:text-black"
          >
            ← Back to Login
          </Link>
        </div>
      </nav>

      <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-[0_25px_80px_rgba(0,0,0,0.08)] sm:p-10">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171717] text-white">
                <span className="text-xl">
                  🔒
                </span>
              </div>

              <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-black/40">
                A&G Author Portal
              </p>

              <h1 className="text-3xl font-medium tracking-tight">
                Create New Password
              </h1>

              <p className="mt-3 text-sm leading-6 text-black/50">
                Enter a new password for your A&G author account.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {message && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            {!errorMessage && !message && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium"
                  >
                    New password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3.5 pr-20 text-sm outline-none transition placeholder:text-black/30 focus:border-black focus:bg-white"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-black/45 hover:text-black"
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium"
                  >
                    Confirm new password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3.5 pr-20 text-sm outline-none transition placeholder:text-black/30 focus:border-black focus:bg-white"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-black/45 hover:text-black"
                    >
                      {showConfirmPassword
                        ? "Hide"
                        : "Show"}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-[#faf9f6] px-4 py-3">
                  <p className="text-xs font-medium text-black/60">
                    Password requirements
                  </p>

                  <p className="mt-1 text-xs leading-5 text-black/40">
                    Use at least 6 characters.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  disabled={loading}
                  className="w-full rounded-xl bg-[#171717] px-5 py-4 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Updating password..."
                    : "Update Password"}
                </button>
              </div>
            )}

            <div className="mt-8 text-center">
              <Link
                href="/author-login"
                className="text-sm font-medium text-black/50 transition hover:text-black"
              >
                Back to Author Login
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-black/35">
            A&G PUBLICATION • AUTHOR PORTAL
          </p>
        </div>
      </section>
    </main>
  );
}