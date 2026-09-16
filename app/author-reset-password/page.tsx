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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setErrorMessage(
          "This password reset link is invalid or has expired."
        );
      }

      setCheckingSession(false);
    };

    checkSession();
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

    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(
      "Your password has been updated successfully."
    );

    setPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      router.push("/author-login");
    }, 2000);
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

      {/* Navbar */}
      <nav className="border-b border-black/10 bg-[#f7f4ee]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">

          <Link
            href="/"
            className="text-2xl font-semibold tracking-tight"
          >
            A&G{" "}
            <span className="font-light">
              PUBLICATION
            </span>
          </Link>

          <Link
            href="/author-login"
            className="text-sm font-medium text-black/60 transition hover:text-black"
          >
            ← Back to Login
          </Link>

        </div>
      </nav>

      {/* Main */}
      <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-5 py-12">

        <div className="w-full max-w-md">

          {/* Card */}
          <div className="rounded-3xl border border-black/10 bg-white p-7 shadow-[0_25px_80px_rgba(0,0,0,0.08)] sm:p-10">

            {/* Heading */}
            <div className="mb-8 text-center">

              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171717] text-white">
                <span className="text-xl">🔒</span>
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

            {/* Error */}
            {errorMessage && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            {!errorMessage && !message && (
              <div className="space-y-6">

                {/* New Password */}
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
                      className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3.5 pr-20 text-sm outline-none transition placeholder:text-black/30 focus:border-black focus:bg-white"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-black/45 hover:text-black"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>

                  </div>

                </div>

                {/* Confirm Password */}
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
                        setConfirmPassword(e.target.value)
                      }
                      placeholder="Confirm new password"
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

                {/* Password Requirements */}
                <div className="rounded-xl bg-[#faf9f6] px-4 py-3">

                  <p className="text-xs font-medium text-black/60">
                    Password requirements
                  </p>

                  <p className="mt-1 text-xs leading-5 text-black/40">
                    Use at least 6 characters.
                  </p>

                </div>

                {/* Update Button */}
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

            {/* Login Link */}
            <div className="mt-8 text-center">

              <Link
                href="/author-login"
                className="text-sm font-medium text-black/50 transition hover:text-black"
              >
                Back to Author Login
              </Link>

            </div>

          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-black/35">
            A&G PUBLICATION • AUTHOR PORTAL
          </p>

        </div>

      </section>
    </main>
  );
}