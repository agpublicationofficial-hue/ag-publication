"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

const supabase = createClient();

export default function AuthorSignup() {
  const router = useRouter();

  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSignup = async () => {
    if (!agreed) {
      alert(
        "Please agree to the A&G Publication terms and author publishing policies."
      );
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (data.user) {
      alert("Account created successfully!");

      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session) {
        router.replace("/author-dashboard");
      } else {
        alert("Account created, please sign in.");
        router.replace("/author-login");
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#171717]">
      {/* Navbar */}
      <nav className="border-b border-black/10 bg-[#f7f4ee]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="shrink-0">
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
            Already have an account? Sign in
          </Link>
        </div>
      </nav>

      {/* Signup */}
      <section className="px-5 py-12 sm:py-16">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.08)] lg:grid-cols-2">
          {/* Left */}
          <div className="relative hidden min-h-[700px] overflow-hidden bg-[#1d1d1b] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <p className="mb-8 text-xs uppercase tracking-[0.3em] text-white/45">
                A&G Author Portal
              </p>

              <h1 className="max-w-md text-5xl font-medium leading-[1.05] tracking-tight">
                Your story
                <br />
                deserves
                <br />
                <span className="text-white/45">to be published.</span>
              </h1>

              <p className="mt-8 max-w-sm text-sm leading-7 text-white/60">
                Create your author account and take the first step toward
                turning your manuscript into a published book.
              </p>

              <div className="mt-12 space-y-5">
                {[
                  "Submit your manuscript",
                  "Track publishing progress",
                  "Manage your books & orders",
                  "Access your author dashboard",
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-4">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-xs text-white/60">
                      {index + 1}
                    </span>
                    <span className="text-sm text-white/65">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-5 h-px w-full bg-white/10" />

              <div className="flex items-center justify-between text-xs text-white/40">
                <span>AUTHOR PORTAL</span>
                <span>EST. 2026</span>
              </div>
            </div>

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/10" />
          </div>

          {/* Right */}
          <div className="px-7 py-12 sm:px-12 lg:px-14">
            <div className="mx-auto max-w-md">
              <div className="mb-9">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-black/40">
                  Begin your journey
                </p>

                <h2 className="text-4xl font-medium tracking-tight">
                  Create Account
                </h2>

                <p className="mt-3 text-sm leading-6 text-black/50">
                  Set up your A&G author account to access your publishing
                  dashboard.
                </p>
              </div>

              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSignup();
                }}
              >
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3.5 text-sm outline-none transition placeholder:text-black/30 focus:border-black focus:bg-white"
                  />
                </div>

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
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3.5 text-sm outline-none transition placeholder:text-black/30 focus:border-black focus:bg-white"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium"
                  >
                    Mobile number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3.5 text-sm outline-none transition placeholder:text-black/30 focus:border-black focus:bg-white"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium"
                  >
                    Create password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3.5 pr-20 text-sm outline-none transition placeholder:text-black/30 focus:border-black focus:bg-white"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-black/45 hover:text-black"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  <p className="mt-2 text-[11px] text-black/35">
                    Use at least 8 characters.
                  </p>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3 pt-1">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-black/20"
                  />

                  <label
                    htmlFor="terms"
                    className="text-xs leading-5 text-black/50"
                  >
                    I agree to the A&G Publication terms and author
                    publishing policies.
                  </label>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#171717] px-5 py-4 text-sm font-medium text-white transition hover:bg-black"
                >
                  Create Author Account
                </button>
              </form>

              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-black/10" />
                <span className="text-xs text-black/30">OR</span>
                <div className="h-px flex-1 bg-black/10" />
              </div>

              <Link
                href="/author-login"
                className="block w-full rounded-xl border border-black/15 px-5 py-3.5 text-center text-sm font-medium transition hover:border-black hover:bg-[#faf9f6]"
              >
                Sign in to existing account
              </Link>

              <p className="mt-8 text-center text-xs leading-5 text-black/35">
                Your account will give you access to your
                <br />
                personal author publishing dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}