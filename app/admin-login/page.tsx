"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const ADMIN_EMAIL = "agpublicationofficial@gmail.com";

export default function AdminLogin() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleLogin = async () => {
    setLoginError("");

    const enteredEmail = email.trim().toLowerCase();

    if (!enteredEmail || !password) {
      setLoginError(
        "Please enter your admin email and password."
      );
      return;
    }

    if (enteredEmail !== ADMIN_EMAIL) {
      setLoginError(
        "Access denied. This portal is only for administrators."
      );
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: enteredEmail,
          password,
        });

      if (error || !data.user || !data.session) {
        setLoginError(
          "Invalid admin email or password. Please try again."
        );
        return;
      }

      const { data: author, error: authorError } =
        await supabase
          .from("authors")
          .select("id, email, role")
          .eq("id", data.user.id)
          .maybeSingle();

      if (
        authorError ||
        !author ||
        author.role !== "admin" ||
        author.email?.toLowerCase() !== ADMIN_EMAIL
      ) {
        await supabase.auth.signOut();

        setLoginError(
          "Access denied. This account is not authorized for the admin portal."
        );

        return;
      }

      router.replace("/admin-dashboard");
    } catch {
      setLoginError(
        "Something went wrong while signing in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError("");
    setLoading(true);

    try {
      const supabase = createClient();

      const redirectTo =
        `${window.location.origin}/auth/callback?next=/admin-dashboard`;

      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
          },
        });

      if (error) {
        setLoginError(
          "Unable to continue with Google. Please try again."
        );
        setLoading(false);
      }
    } catch {
      setLoginError(
        "Something went wrong while connecting to Google."
      );
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#171717]">
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
            href="/"
            className="text-sm font-medium text-black/60 transition hover:text-black"
          >
            ← Back to website
          </Link>
        </div>
      </nav>

      <section className="flex min-h-[calc(100vh-81px)] items-center justify-center px-5 py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.08)] lg:grid-cols-2">
          {/* LEFT PANEL */}

          <div className="relative hidden min-h-[650px] overflow-hidden bg-[#1d1d1b] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="mb-8 text-xs uppercase tracking-[0.3em] text-white/50">
                A&G Administration
              </p>

              <h1 className="max-w-md text-5xl font-medium leading-[1.05] tracking-tight">
                Manage.
                <br />
                Publish.
                <br />
                <span className="text-white/45">
                  Grow.
                </span>
              </h1>

              <p className="mt-8 max-w-sm text-sm leading-7 text-white/60">
                Secure access to the A&G Publication
                administration portal. Manage authors,
                manuscripts, books, orders, royalties and
                publishing operations from one place.
              </p>
            </div>

            <div>
              <div className="mb-5 h-px w-full bg-white/10" />

              <div className="flex items-center justify-between text-xs text-white/45">
                <span>ADMIN PORTAL</span>
                <span>EST. 2026</span>
              </div>
            </div>

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />

            <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/10" />

            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full border border-white/10" />
          </div>

          {/* RIGHT PANEL */}

          <div className="flex min-h-[650px] flex-col justify-center px-7 py-12 sm:px-12 lg:px-14">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-10">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-black/40">
                  Restricted access
                </p>

                <h2 className="text-4xl font-medium tracking-tight">
                  Admin Login
                </h2>

                <p className="mt-3 text-sm leading-6 text-black/50">
                  Sign in to access the A&G Publication
                  administration dashboard.
                </p>
              </div>

              {loginError && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm leading-6 text-red-700">
                  {loginError}
                </div>
              )}

              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();

                  if (!loading) {
                    handleLogin();
                  }
                }}
              >
                <div>
                  <label
                    htmlFor="admin-email"
                    className="mb-2 block text-sm font-medium"
                  >
                    Admin email address
                  </label>

                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    placeholder="agpublicationofficial@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLoginError("");
                    }}
                    disabled={loading}
                    className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3.5 text-sm outline-none transition placeholder:text-black/30 focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-password"
                    className="mb-2 block text-sm font-medium"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="admin-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginError("");
                      }}
                      disabled={loading}
                      className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3.5 pr-20 text-sm outline-none transition placeholder:text-black/30 focus:border-black focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      disabled={loading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-black/45 transition hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#171717] px-5 py-4 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Verifying..."
                    : "Sign in to Admin Portal"}
                </button>
              </form>

              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-black/10" />

                <span className="text-xs text-black/30">
                  OR CONTINUE WITH
                </span>

                <div className="h-px flex-1 bg-black/10" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-black/15 bg-white px-5 py-3.5 text-sm font-medium transition hover:border-black hover:bg-[#faf9f6] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-black/10 text-xs font-semibold">
                  G
                </span>

                {loading
                  ? "Please wait..."
                  : "Continue with Google"}
              </button>

              <div className="mt-8 rounded-xl border border-black/10 bg-[#faf9f6] px-4 py-3.5">
                <p className="text-center text-xs leading-5 text-black/45">
                  This is a restricted administration portal.
                  Only authorized A&G administrators can access
                  the dashboard.
                </p>
              </div>

              <p className="mt-8 text-center text-xs leading-5 text-black/35">
                A&G PUBLICATION
                <br />
                Secure Administration Portal
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}