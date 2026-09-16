"use client";

import { useEffect, useState } from "react";

const packages = [
  {
    name: "Starter",
    price: "₹899",
    amount: 899,
    description: "For new writers taking their first step toward publishing.",
    features: [
      "Basic manuscript review",
      "Author consultation",
      "Publishing guidance",
      "Digital author profile",
    ],
  },
  {
    name: "Basic",
    price: "₹1,899",
    amount: 1899,
    description: "A simple publishing package for authors ready to get started.",
    features: [
      "Manuscript review",
      "Basic proofreading",
      "Professional cover design",
      "ISBN assistance",
      "Author support",
    ],
  },
  {
    name: "Professional",
    price: "₹5,999",
    amount: 5999,
    description: "A complete package for authors who want a polished book.",
    features: [
      "Manuscript evaluation",
      "Editing & proofreading",
      "Professional cover design",
      "Interior formatting",
      "ISBN & publishing support",
      "Distribution assistance",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "₹8,999",
    amount: 8999,
    description: "Our most complete publishing experience for serious authors.",
    features: [
      "Advanced manuscript evaluation",
      "Professional editing",
      "Premium cover design",
      "Interior book formatting",
      "ISBN & publishing support",
      "Distribution assistance",
      "Author branding support",
      "Priority author support",
    ],
  },
];

declare global {
  interface Window {
    Razorpay: any;
  }
}

type CustomerDetails = {
  name: string;
  email: string;
  phone: string;
};

export default function PackagesPage() {
  const [loadingPackage, setLoadingPackage] = useState<string | null>(null);
  const [loadingAuthor, setLoadingAuthor] = useState(true);

  const [customer, setCustomer] = useState<CustomerDetails>({
    name: "",
    email: "",
    phone: "",
  });

  const [showDetails, setShowDetails] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{
    name: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    const loadAuthor = async () => {
      try {
        const response = await fetch("/api/current-author");
        const data = await response.json();

        if (response.ok && data.author) {
          setCustomer({
            name: data.author.full_name || "",
            email: data.author.email || "",
            phone: data.author.phone || "",
          });
        }
      } catch (error) {
        console.error("Author details error:", error);
      } finally {
        setLoadingAuthor(false);
      }
    };

    loadAuthor();
  }, []);

  const loadRazorpay = () => {
    return new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const openPackageDetails = (packageName: string, amount: number) => {
    setSelectedPackage({
      name: packageName,
      amount,
    });

    setShowDetails(true);
  };

  const handlePayment = async () => {
    if (!selectedPackage) return;

    if (!customer.name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!customer.email.trim()) {
      alert("Please enter your email.");
      return;
    }

    if (!customer.phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    const cleanPhone = customer.phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      setLoadingPackage(selectedPackage.name);
      setShowDetails(false);

      const loaded = await loadRazorpay();

      if (!loaded) {
        alert("Razorpay Checkout load nahi ho paya. Please try again.");
        setLoadingPackage(null);
        return;
      }

      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: selectedPackage.amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Unable to create payment order.");
        setLoadingPackage(null);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: data.amount,
        currency: data.currency,

        name: "A&G PUBLICATION",

        description: `${selectedPackage.name} Publishing Package`,

        order_id: data.id,

        prefill: {
          name: customer.name,
          email: customer.email,
          contact: cleanPhone,
        },

        notes: {
          customer_name: customer.name,
          customer_email: customer.email,
          customer_phone: cleanPhone,
          package_name: selectedPackage.name,
        },

        handler: async function (paymentResponse: any) {
          try {
            const verifyResponse = await fetch(
              "/api/verify-payment",
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                },

                body: JSON.stringify({
                  razorpay_order_id:
                    paymentResponse.razorpay_order_id,

                  razorpay_payment_id:
                    paymentResponse.razorpay_payment_id,

                  razorpay_signature:
                    paymentResponse.razorpay_signature,

                  packageName: selectedPackage.name,

                  amount: selectedPackage.amount,

                  customer_name: customer.name,

                  customer_phone: cleanPhone,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              alert(
                "Payment successful! Your order has been created."
              );

              window.location.href = "/orders";
            } else {
              alert(
                verifyData.error ||
                  "Payment verification failed."
              );

              setLoadingPackage(null);
            }
          } catch (error) {
            console.error(error);

            alert(
              "Payment verification mein problem aa gayi."
            );

            setLoadingPackage(null);
          }
        },

        theme: {
          color: "#171717",
        },

        modal: {
          ondismiss: function () {
            setLoadingPackage(null);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response: any) {
          console.error(
            "Razorpay payment failed:",
            response.error
          );

          alert(
            response.error?.description ||
              "Payment failed. Please try again."
          );

          setLoadingPackage(null);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);

      alert("Something went wrong. Please try again.");

      setLoadingPackage(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#171717]">

      {/* HEADER */}
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">

          <a href="/" className="group">
            <p className="text-xl font-bold tracking-[0.18em]">
              A&G
            </p>

            <p className="text-[10px] tracking-[0.32em] text-black/50">
              PUBLICATION
            </p>
          </a>

          <div className="hidden items-center gap-8 text-sm md:flex">
            <a href="/" className="hover:opacity-60">
              Home
            </a>

            <a href="/books" className="hover:opacity-60">
              Books
            </a>

            <a href="/publishing" className="hover:opacity-60">
              Publishing
            </a>
          </div>

          <a
            href="#packages"
            className="rounded-full bg-[#171717] px-5 py-2.5 text-sm text-white"
          >
            View Packages
          </a>

        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-10 lg:py-28">

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/45">
          Publishing Packages
        </p>

        <h1 className="mx-auto mt-5 max-w-4xl font-serif text-6xl leading-[0.95] tracking-[-0.04em] md:text-8xl">
          Choose the way
          <br />

          <span className="font-normal italic">
            you publish.
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-black/55">
          Flexible publishing options designed for writers at
          different stages of their publishing journey.
        </p>

      </section>

      {/* PACKAGES */}
      <section
        id="packages"
        className="mx-auto max-w-7xl px-6 pb-24 lg:px-10"
      >

        <div className="grid gap-6 lg:grid-cols-4">

          {packages.map((pkg) => (

            <article
              key={pkg.name}
              className={`relative flex flex-col border p-7 transition duration-300 hover:-translate-y-1 ${
                pkg.popular
                  ? "border-[#171717] bg-[#171717] text-white shadow-xl"
                  : "border-black/10 bg-white"
              }`}
            >

              {pkg.popular && (
                <span className="absolute right-5 top-5 rounded-full bg-white px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-black">
                  Most Popular
                </span>
              )}

              <p
                className={`text-xs uppercase tracking-[0.2em] ${
                  pkg.popular
                    ? "text-white/45"
                    : "text-black/40"
                }`}
              >
                A&G {pkg.name}
              </p>

              <h2 className="mt-8 font-serif text-3xl">
                {pkg.name}
              </h2>

              <div className="mt-5">
                <span className="text-4xl font-semibold">
                  {pkg.price}
                </span>

                <span
                  className={`ml-2 text-xs ${
                    pkg.popular
                      ? "text-white/40"
                      : "text-black/40"
                  }`}
                >
                  onwards
                </span>
              </div>

              <p
                className={`mt-5 min-h-[72px] text-sm leading-6 ${
                  pkg.popular
                    ? "text-white/55"
                    : "text-black/55"
                }`}
              >
                {pkg.description}
              </p>

              <div
                className={`my-7 h-px ${
                  pkg.popular
                    ? "bg-white/15"
                    : "bg-black/10"
                }`}
              />

              <ul className="flex-1 space-y-4">

                {pkg.features.map((feature) => (

                  <li
                    key={feature}
                    className="flex gap-3 text-sm leading-5"
                  >

                    <span
                      className={
                        pkg.popular
                          ? "text-white/60"
                          : "text-black/40"
                      }
                    >
                      ✓
                    </span>

                    <span
                      className={
                        pkg.popular
                          ? "text-white/75"
                          : "text-black/65"
                      }
                    >
                      {feature}
                    </span>

                  </li>

                ))}

              </ul>

              <button
                onClick={() =>
                  openPackageDetails(pkg.name, pkg.amount)
                }
                disabled={
                  loadingPackage !== null ||
                  loadingAuthor
                }
                className={`mt-8 w-full rounded-full px-5 py-3.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  pkg.popular
                    ? "bg-white text-black hover:bg-white/85"
                    : "bg-[#171717] text-white hover:bg-black/75"
                }`}
              >

                {loadingPackage === pkg.name
                  ? "Opening Payment..."
                  : loadingAuthor
                  ? "Loading..."
                  : `Choose ${pkg.name}`}

              </button>

            </article>

          ))}

        </div>

      </section>

      {/* NOTE */}
      <section className="border-y border-black/10 bg-white">

        <div className="mx-auto max-w-4xl px-6 py-14 text-center">

          <p className="text-xs uppercase tracking-[0.25em] text-black/40">
            A&G Publication
          </p>

          <h2 className="mt-4 font-serif text-3xl">
            Not sure which package is right for you?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-black/50">
            Tell us about your manuscript and publishing goals.
            We can help you understand which option best fits
            your project.
          </p>

          <a
            href="/publishing"
            className="mt-7 inline-block rounded-full border border-black/20 px-7 py-3 text-sm font-medium transition hover:bg-[#f7f4ee]"
          >
            Talk to A&G
          </a>

        </div>

      </section>

      {/* CTA */}
      <section className="px-6 py-24 lg:px-10">

        <div className="mx-auto max-w-7xl bg-[#d9cdb9] px-8 py-20 text-center">

          <p className="text-xs uppercase tracking-[0.3em] text-black/40">
            Start your journey
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-5xl leading-tight md:text-6xl">
            Your story.
            <br />
            Your book.
          </h2>

          <a
            href="#packages"
            className="mt-9 inline-block rounded-full bg-[#171717] px-8 py-4 text-sm font-medium text-white"
          >
            Begin Publishing
          </a>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 bg-white">

        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-xs text-black/40 lg:px-10">
          © 2026 A&G Publication. All rights reserved.
        </div>

      </footer>

      {/* CUSTOMER DETAILS MODAL */}
      {showDetails && selectedPackage && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                  {selectedPackage.name} Package
                </p>

                <h2 className="mt-2 font-serif text-3xl">
                  Your Details
                </h2>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="text-xl text-black/40 hover:text-black"
              >
                ×
              </button>

            </div>

            <p className="mt-4 text-sm leading-6 text-black/50">
              Please confirm your details before continuing
              to secure payment.
            </p>

            <div className="mt-7 space-y-4">

              {/* NAME */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-black/50">
                  Full Name
                </label>

                <input
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-black/50">
                  Email
                </label>

                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      email: e.target.value,
                    })
                  }
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              {/* PHONE */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-black/50">
                  Phone Number
                </label>

                <input
                  type="tel"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      phone: e.target.value,
                    })
                  }
                  placeholder="10-digit phone number"
                  maxLength={10}
                  className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

            </div>

            <div className="mt-7 flex items-center justify-between border-t border-black/10 pt-5">

              <div>
                <p className="text-xs text-black/40">
                  Package Price
                </p>

                <p className="mt-1 text-xl font-semibold">
                  ₹{selectedPackage.amount.toLocaleString("en-IN")}
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={loadingPackage !== null}
                className="rounded-full bg-[#171717] px-6 py-3 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue to Payment
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}