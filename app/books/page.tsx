"use client";

import { useEffect, useState } from "react";

const books = [
  {
    title: "The Soul Recovery",
    author: "Adarsh Pal",
    genre: "Self Growth",
    price: 211,
    description:
      "A journey through healing, self-discovery and finding your way back to yourself.",
    cover: "bg-[#332f2b]",
  },
  {
    title: "You Are Not Alone",
    author: "A&G Author",
    genre: "Mental Wellness",
    price: 189,
    description:
      "A collection of thoughts and stories for anyone navigating the difficult moments of life.",
    cover: "bg-[#29313a]",
  },
  {
    title: "The Writer Within",
    author: "A&G Author",
    genre: "Literature",
    price: 199,
    description:
      "Stories, ideas and reflections from a voice waiting to be heard.",
    cover: "bg-[#40352d]",
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
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export default function BooksPage() {
  const [selectedBook, setSelectedBook] = useState<
    (typeof books)[number] | null
  >(null);

  const [showOrderModal, setShowOrderModal] = useState(false);

  const [loadingAuthor, setLoadingAuthor] = useState(true);

  const [loadingBook, setLoadingBook] = useState<string | null>(null);

  const [customer, setCustomer] = useState<CustomerDetails>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const loadAuthor = async () => {
      try {
        const response = await fetch("/api/current-author");
        const data = await response.json();

        if (response.ok && data.author) {
          setCustomer((previous) => ({
            ...previous,
            name: data.author.full_name || "",
            email: data.author.email || "",
            phone: data.author.phone || "",
          }));
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

  const openOrderModal = (book: (typeof books)[number]) => {
    setSelectedBook(book);
    setShowOrderModal(true);
  };

  const updateCustomer = (
    field: keyof CustomerDetails,
    value: string
  ) => {
    setCustomer((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleBookPayment = async () => {
    if (!selectedBook) return;

    const name = customer.name.trim();
    const email = customer.email.trim();
    const phone = customer.phone.replace(/\D/g, "");
    const address = customer.address.trim();
    const city = customer.city.trim();
    const state = customer.state.trim();
    const pincode = customer.pincode.replace(/\D/g, "");

    if (!name) {
      alert("Please enter your full name.");
      return;
    }

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    if (phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!address) {
      alert("Please enter your delivery address.");
      return;
    }

    if (!city) {
      alert("Please enter your city.");
      return;
    }

    if (!state) {
      alert("Please enter your state.");
      return;
    }

    if (pincode.length !== 6) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    try {
      setLoadingBook(selectedBook.title);
      setShowOrderModal(false);

      const loaded = await loadRazorpay();

      if (!loaded) {
        alert(
          "Razorpay Checkout load nahi ho paya. Please try again."
        );

        setLoadingBook(null);
        return;
      }

      const response = await fetch("/api/create-order", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          amount: selectedBook.price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Unable to create payment order."
        );

        setLoadingBook(null);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: data.amount,

        currency: data.currency,

        name: "A&G PUBLICATION",

        description: `Physical Copy - ${selectedBook.title}`,

        order_id: data.id,

        prefill: {
          name,
          email,
          contact: phone,
        },

        notes: {
          order_type: "Physical Book",
          book_name: selectedBook.title,
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          delivery_address: address,
          city,
          state,
          pincode,
        },

        theme: {
          color: "#171717",
        },

        handler: async function (
          paymentResponse: any
        ) {
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

                  packageName: selectedBook.title,

                  amount: selectedBook.price,

                  customer_name: name,

                  customer_phone: phone,

                  customer_email: email,

                  delivery_address: address,

                  city,

                  state,

                  pincode,

                  orderType: "Physical Book",
                }),
              }
            );

            const verifyData =
              await verifyResponse.json();

            if (
              verifyResponse.ok &&
              verifyData.success
            ) {
              alert(
                "Payment successful! Your book order has been created."
              );

              window.location.href = "/orders";
            } else {
              alert(
                verifyData.error ||
                  "Payment verification failed."
              );

              setLoadingBook(null);
            }
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            alert(
              "Payment verification mein problem aa gayi."
            );

            setLoadingBook(null);
          }
        },

        modal: {
          ondismiss: function () {
            setLoadingBook(null);
          },
        },
      };

      const razorpay =
        new window.Razorpay(options);

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

          setLoadingBook(null);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Book payment error:",
        error
      );

      alert(
        "Something went wrong. Please try again."
      );

      setLoadingBook(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#171717]">

      {/* HEADER */}
      <header className="border-b border-black/10 bg-[#f7f4ee]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">

          {/* A&G LOGO */}
          <a
            href="/"
            className="inline-flex shrink-0 transition-opacity hover:opacity-80"
            aria-label="A&G Publication Home"
          >
            <img
              src="/ag-logo.png"
              alt="A&G Publication"
              className="h-16 w-16 object-contain sm:h-[72px] sm:w-[72px]"
            />
          </a>

          {/* BACK HOME */}
          <a
            href="/"
            className="rounded-full border border-black/15 px-5 py-2.5 text-sm transition hover:bg-white"
          >
            ← Back Home
          </a>

        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-black/45">
          A&G Library
        </p>

        <h1 className="mt-5 max-w-4xl font-serif text-6xl leading-[0.95] tracking-[-0.03em] md:text-8xl">
          Stories worth
          <br />

          <span className="italic font-normal">
            remembering.
          </span>
        </h1>

        <p className="mt-8 max-w-2xl text-base leading-7 text-black/55">
          Explore books published and supported by A&G
          Publication — from personal journeys and fiction
          to ideas that inspire.
        </p>

      </section>

      {/* BOOK GRID */}
      <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-10">

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">

          {books.map((book) => (

            <article
              key={book.title}
              className="group"
            >

              {/* BOOK COVER */}
              <div className="flex h-[460px] items-center justify-center bg-[#e2dbcf]">

                <div
                  className={`relative h-[330px] w-[220px] p-6 shadow-2xl transition duration-500 group-hover:-translate-y-3 ${book.cover}`}
                >

                  <div className="flex h-full flex-col justify-between border border-white/20 p-5 text-white">

                    <div>

                      <p className="text-[8px] tracking-[0.28em] text-white/50">
                        A&G PUBLICATION
                      </p>

                      <div className="mt-12 h-px w-10 bg-white/40" />

                    </div>

                    <div>

                      <h2 className="font-serif text-3xl leading-tight">
                        {book.title}
                      </h2>

                      <p className="mt-4 text-[9px] uppercase tracking-[0.2em] text-white/45">
                        {book.genre}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* INFO */}
              <div className="pt-6">

                <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                  {book.genre}
                </p>

                <h2 className="mt-2 font-serif text-3xl">
                  {book.title}
                </h2>

                <p className="mt-2 text-sm text-black/45">
                  By {book.author}
                </p>

                <p className="mt-5 text-sm leading-6 text-black/55">
                  {book.description}
                </p>

                {/* PRICE */}
                <div className="mt-5 flex items-center justify-between">

                  <p className="text-2xl font-semibold">
                    ₹{book.price.toLocaleString("en-IN")}
                  </p>

                  <button
                    onClick={() =>
                      openOrderModal(book)
                    }
                    disabled={
                      loadingBook !== null ||
                      loadingAuthor
                    }
                    className="rounded-full bg-[#171717] px-5 py-3 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingBook === book.title
                      ? "Processing..."
                      : loadingAuthor
                      ? "Loading..."
                      : "Order Book"}
                  </button>

                </div>

                <button
                  onClick={() =>
                    openOrderModal(book)
                  }
                  disabled={
                    loadingBook !== null ||
                    loadingAuthor
                  }
                  className="mt-5 border-b border-black pb-1 text-sm font-medium"
                >
                  View Book →
                </button>

              </div>

            </article>

          ))}

        </div>

      </section>

      {/* CTA */}
      <section className="border-t border-black/10 bg-[#171717] text-white">

        <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-10">

          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Have a story?
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-5xl leading-tight md:text-6xl">
            Your book could be
            <br />

            <span className="italic">
              our next story.
            </span>
          </h2>

          <a
            href="/publishing"
            className="mt-9 inline-block rounded-full bg-white px-8 py-4 text-sm font-medium text-black transition hover:bg-white/85"
          >
            Publish With A&G
          </a>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="bg-white">

        <div className="mx-auto max-w-7xl px-6 py-8 text-center text-xs text-black/40 lg:px-10">
          © 2026 A&G Publication. All rights reserved.
        </div>

      </footer>

      {/* ORDER MODAL */}
      {showOrderModal && selectedBook && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-8">

          <div className="w-full max-w-2xl rounded-2xl bg-white p-7 shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-black/40">
                  Physical Book Order
                </p>

                <h2 className="mt-2 font-serif text-3xl">
                  {selectedBook.title}
                </h2>

              </div>

              <button
                onClick={() =>
                  setShowOrderModal(false)
                }
                className="text-2xl text-black/40 hover:text-black"
              >
                ×
              </button>

            </div>

            <div className="mt-4 rounded-xl bg-[#f7f4ee] p-4">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs text-black/40">
                    Physical Copy
                  </p>

                  <p className="mt-1 font-medium">
                    {selectedBook.title}
                  </p>
                </div>

                <p className="text-xl font-semibold">
                  ₹{selectedBook.price}
                </p>

              </div>

            </div>

            <p className="mt-5 text-sm leading-6 text-black/50">
              Enter your details below. Your delivery address
              is required because this is a physical book order.
            </p>

            {/* FORM */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">

              {/* NAME */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-black/50">
                  Full Name
                </label>

                <input
                  value={customer.name}
                  onChange={(e) =>
                    updateCustomer(
                      "name",
                      e.target.value
                    )
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
                    updateCustomer(
                      "email",
                      e.target.value
                    )
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
                    updateCustomer(
                      "phone",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="10-digit phone number"
                  maxLength={10}
                  className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              {/* PINCODE */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-black/50">
                  Pincode
                </label>

                <input
                  type="text"
                  value={customer.pincode}
                  onChange={(e) =>
                    updateCustomer(
                      "pincode",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="6-digit pincode"
                  maxLength={6}
                  className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              {/* CITY */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-black/50">
                  City
                </label>

                <input
                  value={customer.city}
                  onChange={(e) =>
                    updateCustomer(
                      "city",
                      e.target.value
                    )
                  }
                  placeholder="Enter your city"
                  className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              {/* STATE */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-black/50">
                  State
                </label>

                <input
                  value={customer.state}
                  onChange={(e) =>
                    updateCustomer(
                      "state",
                      e.target.value
                    )
                  }
                  placeholder="Enter your state"
                  className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              {/* ADDRESS */}
              <div className="md:col-span-2">

                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-black/50">
                  Complete Delivery Address
                </label>

                <textarea
                  value={customer.address}
                  onChange={(e) =>
                    updateCustomer(
                      "address",
                      e.target.value
                    )
                  }
                  placeholder="House/Flat No., Street, Area, Landmark..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />

              </div>

            </div>

            {/* BOTTOM */}
            <div className="mt-7 flex flex-col gap-4 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-xs text-black/40">
                  Total
                </p>

                <p className="mt-1 text-2xl font-semibold">
                  ₹{selectedBook.price.toLocaleString("en-IN")}
                </p>

              </div>

              <button
                onClick={handleBookPayment}
                disabled={
                  loadingBook !== null
                }
                className="rounded-full bg-[#171717] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingBook
                  ? "Opening Payment..."
                  : "Continue to Payment"}
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}