"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AuthorLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [loginError, setLoginError] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleLogin = async () => {
    setLoginError("");
    setResetMessage("");

    if (!email.trim() || !password) {
      setLoginError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        console.error("Login error:", error);

        setLoginError(
          `Login error: ${error.message}`
        );

        return;
      }

      if (!data.session || !data.user) {
        setLoginError(
          "Login failed. No active session was created."
        );
        return;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 200)
      );

      router.replace("/author-dashboard");
    } catch (error) {
      console.error("Login exception:", error);

      setLoginError(
        error instanceof Error
          ? `Login error: ${error.message}`
          : "Something went wrong while signing in."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError("");
    setResetMessage("");
    setGoogleLoading(true);

    try {
      const supabase = createClient();

      const redirectTo =
        `${window.location.origin}/auth/callback?next=/author-dashboard`;

      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
            queryParams: {
              prompt: "select_account",
            },
          },
        });

      if (error) {
        console.error("Google login error:", error);

        setLoginError(
          `Google login error: ${error.message}`
        );

        setGoogleLoading(false);
      }
    } catch (error) {
      console.error(
        "Google login exception:",
        error
      );

      setLoginError(
        error instanceof Error
          ? `Google login error: ${error.message}`
          : "Something went wrong while connecting to Google."
      );

      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setLoginError("");
    setResetMessage("");

    if (!email.trim()) {
      setResetMessage(
        "Please enter your email address first."
      );
      return;
    }

    setResetLoading(true);

    try {
      const supabase = createClient();

      const redirectTo =
        `${window.location.origin}/author-reset-password`;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo,
          }
        );

      if (error) {
        console.error(
          "Password reset error:",
          error
        );

        setResetMessage(
          `Password reset error: ${error.message}`
        );

        return;
      }

      setResetMessage(
        "Password reset link has been sent to your email. Please check your inbox."
      );
    } catch (error) {
      console.error(
        "Password reset exception:",
        error
      );

      setResetMessage(
        error instanceof Error
          ? `Password reset error: ${error.message}`
          : "Something went wrong while sending the reset link."
      );
    } finally {
      setResetLoading(false);
    }
  };

  const anyLoading =
    loading || googleLoading || resetLoading;

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#171717]">

      {/* Navbar */}
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
            href="/"
            className="text-sm font-medium text-black/60 transition hover:text-black"
          >
            ← Back to website
          </Link>

        </div>
      </nav>

      {/* Login Section */}
      <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-5 py-12">

        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.08)] lg:grid-cols-2">

          {/* Left Side */}
          <div className="relative hidden min-h-[620px] overflow-hidden bg-[#1d1d1b] p-10 text-white lg:flex lg:flex-col lg:justify-between">

            <div>

              <p className="mb-8 text-xs uppercase tracking-[0.3em] text-white/50">
                A&G Author Portal
              </p>

              <h1 className="max-w-md text-5xl font-medium leading-[1.05] tracking-tight">
                Your book.
                <br />
                Your journey.
                <br />
                <span className="text-white/45">
                  Your story.
                </span>
              </h1>

              <p className="mt-8 max-w-sm text-sm leading-7 text-white/60">
                Manage your manuscripts, publishing progress,
                orders and author journey — all from one place.
              </p>

            </div>

            <div>

              <div className="mb-5 h-px w-full bg-white/10" />

              <div className="flex items-center justify-between text-xs text-white/45">
                <span>AUTHOR PORTAL</span>
                <span>EST. 2026</span>
              </div>

            </div>

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />

            <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/10" />

          </div>

          {/* Right Side */}
          <div className="flex min-h-[620px] flex-col justify-center px-7 py-12 sm:px-12 lg:px-14">

            <div className="mx-auto w-full max-w-md">

              {/* Heading */}
              <div className="mb-10">

                <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-black/40">
                  Welcome back
                </p>

                <h2 className="text-4xl font-medium tracking-tight">
                  Author Login
                </h2>

                <p className="mt-3 text-sm leading-6 text-black/50">
                  Sign in to continue to your A&G author dashboard.
                </p>

              </div>

              {/* Login Error */}
              {loginError && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-6 text-red-700">
                  {loginError}
                </div>
              )}

              {/* Reset Message */}
              {resetMessage && (
                <div className="mb-6 rounded-xl border border-black/10 bg-[#faf9f6] px-4 py-3.5 text-sm leading-6 text-black/65">
                  {resetMessage}
                </div>
              )}

              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={anyLoading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-black/15 bg-white px-5 py-3.5 text-sm font-medium text-black transition hover:border-black hover:bg-[#faf9f6] disabled:cursor-not-allowed disabled:opacity-60"
              >

                {googleLoading ? (
                  "Connecting to Google..."
                ) : (
                  <>
                    <span className="flex h-5 w-5 items-center justify-center">

                      <svg
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        aria-hidden="true"
                      >

                        <path
                          fill="#4285F4"
                          d="M21.35 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.23Z"
                        />

                        <path
                          fill="#34A853"
                          d="M12 21.73c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.74 9.74 0 0 0 12 21.73Z"
                        />

                        <path
                          fill="#FBBC05"
                          d="M6.53 13.82a5.86 5.86 0 0 1 0-3.64V7.65H3.28a9.75 9.75 0 0 0 0 8.7l3.25-2.53Z"
                        />

                        <path
                          fill="#EA4335"
                          d="M12 6.15c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.83 3.17 14.63 2.27 12 2.27a9.74 9.74 0 0 0-8.72 5.38l3.25 2.53C7.3 7.87 9.46 6.15 12 6.15Z"
                        />

                      </svg>

                    </span>

                    Continue with Google
                  </>
                )}

              </button>

              {/* Divider */}
              <div className="my-7 flex items-center gap-4">

                <div className="h-px flex-1 bg-black/10" />

                <span className="text-xs text-black/30">
                  OR CONTINUE WITH EMAIL
                </span>

                <div className="h-px flex-1 bg-black/10" />

              </div>

              {/* Login Form */}
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();

                  if (!anyLoading) {
                    handleLogin();
                  }
                }}
              >

                {/* Email */}
                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLoginError("");
                      setResetMessage("");
                    }}
                    disabled={anyLoading}
                    className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3.5 text-sm outline-none transition placeholder:text-black/30 focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>

                {/* Password */}
                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="block text-sm font-medium"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={anyLoading}
                      className="text-xs font-medium text-black/50 transition hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {resetLoading
                        ? "Sending..."
                        : "Forgot password?"}
                    </button>

                  </div>

                  <div className="relative">

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError("");
                      }}
                      disabled={anyLoading}
                      className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3.5 pr-20 text-sm outline-none transition placeholder:text-black/30 focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      disabled={anyLoading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-black/45 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2">

                  <input
                    id="remember"
                    type="checkbox"
                    defaultChecked
                    disabled={anyLoading}
                    className="h-4 w-4 rounded border-black/20"
                  />

                  <label
                    htmlFor="remember"
                    className="text-xs text-black/50"
                  >
                    Remember me
                  </label>

                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={anyLoading}
                  className="w-full rounded-xl bg-[#171717] px-5 py-4 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Signing in..."
                    : "Sign in to Author Portal"}
                </button>

              </form>

              {/* Divider */}
              <div className="my-8 flex items-center gap-4">

                <div className="h-px flex-1 bg-black/10" />

                <span className="text-xs text-black/30">
                  NEW AUTHOR?
                </span>

                <div className="h-px flex-1 bg-black/10" />

              </div>

              {/* Signup */}
              <Link
                href="/author-signup"
                className="block w-full rounded-xl border border-black/15 px-5 py-3.5 text-center text-sm font-medium transition hover:border-black hover:bg-[#faf9f6]"
              >
                Create Author Account
              </Link>

              {/* Footer */}
              <p className="mt-8 text-center text-xs leading-5 text-black/35">
                By continuing, you agree to A&G Publication&apos;s
                <br />
                terms and author publishing policies.
              </p>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}