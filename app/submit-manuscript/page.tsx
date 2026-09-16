"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

const PACKAGES = {
  Starter: 899,
  Basic: 1899,
  Professional: 5999,
  Premium: 8999,
} as const;

type PackageName = keyof typeof PACKAGES;

type RazorpayPaymentResponse = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubmitManuscriptPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState("");

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [description, setDescription] = useState("");
  const [pages, setPages] = useState("");
  const [words, setWords] = useState("");

  const [
    publishingPreference,
    setPublishingPreference,
  ] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [
    selectedPackage,
    setSelectedPackage,
  ] = useState<PackageName>("Starter");

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  const [message, setMessage] = useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const selectedPrice =
    PACKAGES[selectedPackage];

  // ==========================================
  // FILE CHANGE + STORAGE UPLOAD
  // ==========================================

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    setErrorMessage("");
    setMessage("");
    setFilePath("");

    if (!file) {
      setFileName("");
      return;
    }

    // ========================================
    // FILE TYPE VALIDATION
    // ========================================

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();

    const allowedExtensions = [
      "pdf",
      "doc",
      "docx",
    ];

    const validFile =
      allowedTypes.includes(file.type) ||
      allowedExtensions.includes(
        extension || ""
      );

    if (!validFile) {
      alert(
        "Please upload a PDF, DOC or DOCX file."
      );

      event.target.value = "";
      setFileName("");
      setFilePath("");

      return;
    }

    // ========================================
    // FILE SIZE VALIDATION
    // ========================================

    if (
      file.size >
      25 * 1024 * 1024
    ) {
      alert(
        "File size must be less than 25 MB."
      );

      event.target.value = "";
      setFileName("");
      setFilePath("");

      return;
    }

    try {
      setIsUploading(true);

      setFileName(file.name);

      setMessage(
        "Uploading manuscript..."
      );

      console.log(
        "=========================================="
      );

      console.log(
        "MANUSCRIPT STORAGE UPLOAD STARTED"
      );

      console.log(
        "File:",
        file.name
      );

      console.log(
        "Size:",
        file.size
      );

      console.log(
        "Type:",
        file.type
      );

      console.log(
        "=========================================="
      );

      // ========================================
      // CHECK AUTHENTICATED USER
      // ========================================

      const {
        data: {
          user,
        },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        throw new Error(
          "Please login before uploading your manuscript."
        );
      }

      // ========================================
      // CREATE SAFE FILE NAME
      // ========================================

      const safeFileName =
        file.name
          .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
          );

      const uniqueFileName =
        `${Date.now()}-${safeFileName}`;

      // ========================================
      // AUTHOR-SPECIFIC STORAGE PATH
      // ========================================

      const storagePath =
        `${user.id}/${uniqueFileName}`;

      console.log(
        "Storage path:",
        storagePath
      );

      // ========================================
      // UPLOAD TO SUPABASE STORAGE
      // ========================================

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from("manuscripts")
          .upload(
            storagePath,
            file,
            {
              cacheControl:
                "3600",

              upsert:
                false,

              contentType:
                file.type ||
                "application/octet-stream",
            }
          );

      if (
        uploadError
      ) {
        console.error(
          "Manuscript upload error:",
          uploadError
        );

        throw new Error(
          uploadError.message ||
            "Manuscript upload failed."
        );
      }

      // ========================================
      // SAVE STORAGE PATH
      // ========================================

      setFilePath(
        storagePath
      );

      setMessage(
        "Manuscript uploaded successfully."
      );

      console.log(
        "=========================================="
      );

      console.log(
        "MANUSCRIPT UPLOAD SUCCESSFUL"
      );

      console.log(
        "File path:",
        storagePath
      );

      console.log(
        "=========================================="
      );
    } catch (
      error: any
    ) {
      console.error(
        "Manuscript upload error:",
        error
      );

      setFileName("");
      setFilePath("");

      setErrorMessage(
        error?.message ||
          "Unable to upload manuscript."
      );

      setMessage("");

      event.target.value = "";
    } finally {
      setIsUploading(false);
    }
  };

  // ==========================================
  // WAIT FOR RAZORPAY SCRIPT
  // ==========================================

  const waitForRazorpay =
    async () => {
      for (
        let attempt = 0;
        attempt < 30;
        attempt++
      ) {
        if (
          typeof window !==
            "undefined" &&
          window.Razorpay
        ) {
          return true;
        }

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              200
            )
        );
      }

      return false;
    };

  // ==========================================
  // PAYMENT
  // ==========================================

  const handlePayment =
    async () => {
      setErrorMessage("");
      setMessage("");

      // ========================================
      // VALIDATION
      // ========================================

      if (!title.trim()) {
        alert(
          "Please enter your book title."
        );
        return;
      }

      if (!genre.trim()) {
        alert(
          "Please enter your genre."
        );
        return;
      }

      if (!language.trim()) {
        alert(
          "Please select the language."
        );
        return;
      }

      if (!fileName.trim()) {
        alert(
          "Please select your manuscript file."
        );
        return;
      }

      // ========================================
      // IMPORTANT:
      // FILE MUST ACTUALLY BE UPLOADED
      // ========================================

      if (!filePath.trim()) {
        alert(
          "Please wait for the manuscript upload to complete."
        );
        return;
      }

      if (isUploading) {
        alert(
          "Please wait. Your manuscript is still uploading."
        );
        return;
      }

      if (
        !publishingPreference.trim()
      ) {
        alert(
          "Please select your publishing preference."
        );
        return;
      }

      if (!name.trim()) {
        alert(
          "Please enter your name."
        );
        return;
      }

      if (!email.trim()) {
        alert(
          "Please enter your email."
        );
        return;
      }

      if (!phone.trim()) {
        alert(
          "Please enter your phone number."
        );
        return;
      }

      try {
        setIsProcessing(true);

        console.log(
          "=========================================="
        );

        console.log(
          "A&G PUBLICATION PAYMENT STARTED"
        );

        console.log(
          "Package:",
          selectedPackage
        );

        console.log(
          "Amount:",
          selectedPrice
        );

        console.log(
          "File path:",
          filePath
        );

        console.log(
          "=========================================="
        );

        // ======================================
        // CREATE RAZORPAY ORDER
        // ======================================

        const orderResponse =
          await fetch(
            "/api/create-order",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                packageName:
                  selectedPackage,
              }),
            }
          );

        let orderData: any =
          null;

        try {
          orderData =
            await orderResponse.json();
        } catch {
          throw new Error(
            "Invalid response received while creating Razorpay order."
          );
        }

        console.log(
          "Razorpay order response:",
          orderData
        );

        if (
          !orderResponse.ok
        ) {
          throw new Error(
            orderData?.error ||
              "Unable to create Razorpay order."
          );
        }

        if (
          !orderData?.success
        ) {
          throw new Error(
            orderData?.error ||
              "Razorpay order creation failed."
          );
        }

        if (!orderData?.id) {
          throw new Error(
            "Razorpay order ID was not received."
          );
        }

        if (
          !orderData?.amount
        ) {
          throw new Error(
            "Razorpay order amount was not received."
          );
        }

        // ======================================
        // WAIT FOR RAZORPAY
        // ======================================

        const razorpayLoaded =
          await waitForRazorpay();

        if (
          !razorpayLoaded ||
          !window.Razorpay
        ) {
          throw new Error(
            "Razorpay is not loaded. Please refresh the page and try again."
          );
        }

        // ======================================
        // RAZORPAY CHECKOUT OPTIONS
        // ======================================

        const razorpayOptions =
          {
            key:
              process.env
                .NEXT_PUBLIC_RAZORPAY_KEY_ID,

            amount:
              orderData.amount,

            currency:
              orderData.currency ||
              "INR",

            name:
              "A&G PUBLICATION",

            description:
              `${selectedPackage} Publishing Package`,

            order_id:
              orderData.id,

            prefill: {
              name:
                name.trim(),

              email:
                email.trim(),

              contact:
                phone.trim(),
            },

            notes: {
              package:
                selectedPackage,

              book_title:
                title.trim(),
            },

            theme: {
              color:
                "#111827",
            },

            // ==================================
            // SUCCESS CALLBACK
            // ==================================

            handler:
              async function (
                response:
                  RazorpayPaymentResponse
              ) {
                console.log(
                  "=========================================="
                );

                console.log(
                  "RAZORPAY PAYMENT SUCCESS CALLBACK"
                );

                console.log(
                  "Full response:",
                  response
                );

                console.log(
                  "Order ID:",
                  response?.razorpay_order_id
                );

                console.log(
                  "Payment ID:",
                  response?.razorpay_payment_id
                );

                console.log(
                  "Signature received:",
                  Boolean(
                    response?.razorpay_signature
                  )
                );

                console.log(
                  "=========================================="
                );

                try {
                  // ==================================
                  // GET PAYMENT DETAILS
                  // ==================================

                  const razorpayOrderId =
                    response?.razorpay_order_id;

                  const razorpayPaymentId =
                    response?.razorpay_payment_id;

                  const razorpaySignature =
                    response?.razorpay_signature;

                  // ==================================
                  // VALIDATE PAYMENT RESPONSE
                  // ==================================

                  if (
                    !razorpayOrderId
                  ) {
                    throw new Error(
                      "Razorpay order ID is missing from the payment response."
                    );
                  }

                  if (
                    !razorpayPaymentId
                  ) {
                    throw new Error(
                      "Razorpay payment ID is missing from the payment response."
                    );
                  }

                  if (
                    !razorpaySignature
                  ) {
                    throw new Error(
                      "Razorpay payment signature is missing from the payment response."
                    );
                  }

                  setMessage(
                    "Payment received. Verifying payment..."
                  );

                  setErrorMessage("");

                  // ==================================
                  // SEND TO SERVER
                  // ==================================

                  console.log(
                    "Sending payment details to /api/verify-payment..."
                  );

                  const verifyResponse =
                    await fetch(
                      "/api/verify-payment",
                      {
                        method: "POST",

                        headers: {
                          "Content-Type":
                            "application/json",
                        },

                        body:
                          JSON.stringify({
                            // Razorpay
                            razorpay_order_id:
                              razorpayOrderId,

                            razorpay_payment_id:
                              razorpayPaymentId,

                            razorpay_signature:
                              razorpaySignature,

                            // Package
                            packageName:
                              selectedPackage,

                            amount:
                              selectedPrice,

                            orderType:
                              "Publishing Package",

                            // Manuscript
                            title:
                              title.trim(),

                            genre:
                              genre.trim(),

                            language:
                              language.trim(),

                            description:
                              description.trim(),

                            pages:
                              pages
                                ? Number(
                                    pages
                                  )
                                : null,

                            words:
                              words
                                ? Number(
                                    words
                                  )
                                : null,

                            file_name:
                              fileName.trim(),

                            // IMPORTANT:
                            // Actual Supabase Storage path
                            file_path:
                              filePath,

                            publishing_preference:
                              publishingPreference.trim(),

                            // Customer
                            customer_name:
                              name.trim(),

                            customer_email:
                              email.trim(),

                            customer_phone:
                              phone.trim(),
                          }),
                      }
                    );

                  // ==================================
                  // READ SERVER RESPONSE
                  // ==================================

                  let verifyData:
                    any =
                    null;

                  try {
                    verifyData =
                      await verifyResponse.json();
                  } catch {
                    throw new Error(
                      "Invalid response received from payment verification server."
                    );
                  }

                  console.log(
                    "Payment verification response:",
                    verifyData
                  );

                  // ==================================
                  // SERVER ERROR
                  // ==================================

                  if (
                    !verifyResponse.ok
                  ) {
                    throw new Error(
                      verifyData?.error ||
                        "Payment verification failed."
                    );
                  }

                  if (
                    !verifyData?.success
                  ) {
                    throw new Error(
                      verifyData?.error ||
                        "Manuscript submission failed."
                    );
                  }

                  // ==================================
                  // SUCCESS
                  // ==================================

                  console.log(
                    "=========================================="
                  );

                  console.log(
                    "PAYMENT VERIFIED SUCCESSFULLY"
                  );

                  console.log(
                    "MANUSCRIPT SUBMITTED SUCCESSFULLY"
                  );

                  console.log(
                    "Order:",
                    verifyData?.order
                  );

                  console.log(
                    "Manuscript:",
                    verifyData?.manuscript
                  );

                  console.log(
                    "Manuscript ID:",
                    verifyData?.manuscript_id
                  );

                  console.log(
                    "File Path:",
                    verifyData?.manuscript
                      ?.file_path
                  );

                  console.log(
                    "=========================================="
                  );

                  setMessage(
                    "Manuscript submitted successfully!"
                  );

                  setErrorMessage("");

                  setIsProcessing(
                    false
                  );

                  alert(
                    "Manuscript submitted successfully!"
                  );

                  router.push(
                    "/author-dashboard"
                  );
                } catch (
                  error: any
                ) {
                  console.log(
                    "=========================================="
                  );

                  console.log(
                    "PAYMENT VERIFICATION / SUBMISSION ERROR"
                  );

                  console.log(
                    error
                  );

                  console.log(
                    "=========================================="
                  );

                  const errorText =
                    error?.message ||
                    "Payment was successful, but manuscript submission failed.";

                  setErrorMessage(
                    errorText
                  );

                  setMessage("");

                  setIsProcessing(
                    false
                  );

                  alert(
                    errorText
                  );
                }
              },

            // ====================================
            // PAYMENT WINDOW CLOSED
            // ====================================

            modal: {
              ondismiss:
                function () {
                  console.log(
                    "Razorpay payment window closed."
                  );

                  setIsProcessing(
                    false
                  );

                  setMessage(
                    "Payment cancelled. Your manuscript has not been submitted."
                  );
                },
            },
          };

        // ======================================
        // CREATE RAZORPAY INSTANCE
        // ======================================

        console.log(
          "Opening Razorpay checkout..."
        );

        const razorpay =
          new window.Razorpay(
            razorpayOptions
          );

        // ======================================
        // PAYMENT FAILED EVENT
        // ======================================

        razorpay.on(
          "payment.failed",
          function (
            response: any
          ) {
            console.log(
              "=========================================="
            );

            console.log(
              "RAZORPAY PAYMENT FAILED"
            );

            console.log(
              "Full response:",
              response
            );

            console.log(
              "Error:",
              response?.error
            );

            console.log(
              "Error code:",
              response?.error?.code
            );

            console.log(
              "Description:",
              response?.error
                ?.description
            );

            console.log(
              "Source:",
              response?.error
                ?.source
            );

            console.log(
              "Step:",
              response?.error?.step
            );

            console.log(
              "Reason:",
              response?.error?.reason
            );

            console.log(
              "Order ID:",
              response?.error
                ?.metadata?.order_id
            );

            console.log(
              "Payment ID:",
              response?.error
                ?.metadata?.payment_id
            );

            console.log(
              "=========================================="
            );

            const reason =
              response?.error
                ?.description ||
              response?.error?.reason ||
              response?.error?.code ||
              "Razorpay payment failed.";

            setErrorMessage(
              reason
            );

            setMessage("");

            setIsProcessing(
              false
            );

            alert(
              `Payment failed: ${reason}`
            );
          }
        );

        // ======================================
        // OPEN CHECKOUT
        // ======================================

        razorpay.open();
      } catch (
        error: any
      ) {
        console.error(
          "=========================================="
        );

        console.error(
          "PAYMENT INITIALIZATION ERROR"
        );

        console.error(
          error
        );

        console.error(
          "=========================================="
        );

        const errorText =
          error?.message ||
          "Unable to start payment.";

        setErrorMessage(
          errorText
        );

        setMessage("");

        setIsProcessing(
          false
        );

        alert(
          errorText
        );
      }
    };

  return (
    <>
      {/* ====================================== */}
      {/* RAZORPAY SCRIPT */}
      {/* ====================================== */}

      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <main className="min-h-screen bg-gray-50">

        {/* ==================================== */}
        {/* HEADER */}
        {/* ==================================== */}

        <header className="border-b bg-white">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

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
              href="/author-dashboard"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Author Dashboard
            </Link>

          </div>

        </header>

        {/* ==================================== */}
        {/* CONTENT */}
        {/* ==================================== */}

        <section className="mx-auto max-w-5xl px-6 py-10">

          <div className="mb-10">

            <h1 className="text-3xl font-bold text-gray-900">
              Submit Your Manuscript
            </h1>

            <p className="mt-2 text-gray-600">
              Complete the form below. Payment
              will be processed first, and your
              manuscript will be submitted only
              after successful payment verification.
            </p>

          </div>

          {/* ================================== */}
          {/* SUCCESS */}
          {/* ================================== */}

          {message && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-800">
              {message}
            </div>
          )}

          {/* ================================== */}
          {/* ERROR */}
          {/* ================================== */}

          {errorMessage && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-800">
              {errorMessage}
            </div>
          )}

          <div className="space-y-8">

            {/* ================================= */}
            {/* BOOK INFORMATION */}
            {/* ================================= */}

            <section className="rounded-2xl border bg-white p-6 shadow-sm">

              <h2 className="text-xl font-semibold text-gray-900">
                1. Book Information
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Book Title *
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      setTitle(
                        e.target.value
                      )
                    }
                    placeholder="Enter your book title"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Genre *
                  </label>

                  <input
                    type="text"
                    value={genre}
                    onChange={(e) =>
                      setGenre(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Fiction, Self-Help, Poetry"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Language *
                  </label>

                  <select
                    value={language}
                    onChange={(e) =>
                      setLanguage(
                        e.target.value
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-900"
                  >

                    <option value="">
                      Select language
                    </option>

                    <option value="English">
                      English
                    </option>

                    <option value="Hindi">
                      Hindi
                    </option>

                    <option value="Hinglish">
                      Hinglish
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Number of Pages
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={pages}
                    onChange={(e) =>
                      setPages(
                        e.target.value
                      )
                    }
                    placeholder="e.g. 150"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Approx. Word Count
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={words}
                    onChange={(e) =>
                      setWords(
                        e.target.value
                      )
                    }
                    placeholder="e.g. 30000"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                  />

                </div>

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Book Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    rows={5}
                    placeholder="Tell us briefly about your book..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                  />

                </div>

              </div>

            </section>

            {/* ================================= */}
            {/* MANUSCRIPT */}
            {/* ================================= */}

            <section className="rounded-2xl border bg-white p-6 shadow-sm">

              <h2 className="text-xl font-semibold text-gray-900">
                2. Manuscript
              </h2>

              <div className="mt-6">

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Upload Manuscript *
                </label>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={
                    handleFileChange
                  }
                  disabled={
                    isUploading ||
                    isProcessing
                  }
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Accepted formats: PDF, DOC, DOCX.
                  Maximum size: 25 MB.
                </p>

                {isUploading && (
                  <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    Uploading manuscript to secure storage...
                  </div>
                )}

                {fileName &&
                  !isUploading && (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">

                      ✓ Manuscript uploaded:{" "}

                      <strong>
                        {fileName}
                      </strong>

                    </div>
                  )}

              </div>

            </section>

            {/* ================================= */}
            {/* PUBLISHING PREFERENCE */}
            {/* ================================= */}

            <section className="rounded-2xl border bg-white p-6 shadow-sm">

              <h2 className="text-xl font-semibold text-gray-900">
                3. Publishing Preference
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Please select how you would like
                A&G PUBLICATION to handle your book.
              </p>

              <div className="mt-6 space-y-3">

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 hover:bg-gray-50">

                  <input
                    type="radio"
                    name="publishingPreference"
                    value="Traditional Publishing"
                    checked={
                      publishingPreference ===
                      "Traditional Publishing"
                    }
                    onChange={(e) =>
                      setPublishingPreference(
                        e.target.value
                      )
                    }
                    className="mt-1"
                  />

                  <div>

                    <div className="font-medium text-gray-900">
                      Traditional Publishing
                    </div>

                    <div className="text-sm text-gray-500">
                      Submit your manuscript for
                      traditional publishing consideration.
                    </div>

                  </div>

                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 hover:bg-gray-50">

                  <input
                    type="radio"
                    name="publishingPreference"
                    value="Self Publishing"
                    checked={
                      publishingPreference ===
                      "Self Publishing"
                    }
                    onChange={(e) =>
                      setPublishingPreference(
                        e.target.value
                      )
                    }
                    className="mt-1"
                  />

                  <div>

                    <div className="font-medium text-gray-900">
                      Self Publishing
                    </div>

                    <div className="text-sm text-gray-500">
                      Publish your book independently
                      with our publishing services.
                    </div>

                  </div>

                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border p-4 hover:bg-gray-50">

                  <input
                    type="radio"
                    name="publishingPreference"
                    value="Hybrid Publishing"
                    checked={
                      publishingPreference ===
                      "Hybrid Publishing"
                    }
                    onChange={(e) =>
                      setPublishingPreference(
                        e.target.value
                      )
                    }
                    className="mt-1"
                  />

                  <div>

                    <div className="font-medium text-gray-900">
                      Hybrid Publishing
                    </div>

                    <div className="text-sm text-gray-500">
                      Combine author investment with
                      professional publishing support.
                    </div>

                  </div>

                </label>

              </div>

            </section>

            {/* ================================= */}
            {/* AUTHOR INFORMATION */}
            {/* ================================= */}

            <section className="rounded-2xl border bg-white p-6 shadow-sm">

              <h2 className="text-xl font-semibold text-gray-900">
                4. Author Information
              </h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                    placeholder="Your full name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email *
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                      )
                    }
                    placeholder="Your phone number"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-gray-900"
                  />

                </div>

              </div>

            </section>

            {/* ================================= */}
            {/* PACKAGE */}
            {/* ================================= */}

            <section className="rounded-2xl border bg-white p-6 shadow-sm">

              <h2 className="text-xl font-semibold text-gray-900">
                5. Select Publishing Package
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">

                {(
                  Object.keys(
                    PACKAGES
                  ) as PackageName[]
                ).map(
                  (
                    packageName
                  ) => {

                    const price =
                      PACKAGES[
                        packageName
                      ];

                    const isSelected =
                      selectedPackage ===
                      packageName;

                    return (
                      <label
                        key={
                          packageName
                        }
                        className={`cursor-pointer rounded-xl border p-5 transition ${
                          isSelected
                            ? "border-gray-900 bg-gray-50"
                            : "border-gray-300 hover:border-gray-500"
                        }`}
                      >

                        <div className="flex items-start gap-3">

                          <input
                            type="radio"
                            name="package"
                            value={
                              packageName
                            }
                            checked={
                              isSelected
                            }
                            onChange={() =>
                              setSelectedPackage(
                                packageName
                              )
                            }
                            className="mt-1"
                          />

                          <div className="flex-1">

                            <div className="flex items-center justify-between">

                              <span className="font-semibold text-gray-900">
                                {packageName}
                              </span>

                              <span className="text-lg font-bold text-gray-900">
                                ₹
                                {price.toLocaleString(
                                  "en-IN"
                                )}
                              </span>

                            </div>

                            <p className="mt-2 text-sm text-gray-500">

                              {packageName ===
                                "Starter" &&
                                "Essential publishing services."}

                              {packageName ===
                                "Basic" &&
                                "Complete publishing support for new authors."}

                              {packageName ===
                                "Professional" &&
                                "Advanced publishing and promotional support."}

                              {packageName ===
                                "Premium" &&
                                "Premium end-to-end publishing package."}

                            </p>

                          </div>

                        </div>

                      </label>
                    );
                  }
                )}

              </div>

            </section>

            {/* ================================= */}
            {/* PAYMENT SUMMARY */}
            {/* ================================= */}

            <section className="rounded-2xl border border-gray-900 bg-gray-900 p-6 text-white shadow-sm">

              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <p className="text-sm text-gray-300">
                    Selected Package
                  </p>

                  <h3 className="mt-1 text-2xl font-bold">
                    {selectedPackage}
                  </h3>

                  <p className="mt-1 text-sm text-gray-300">
                    Amount payable: ₹
                    {selectedPrice.toLocaleString(
                      "en-IN"
                    )}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    handlePayment
                  }
                  disabled={
                    isProcessing ||
                    isUploading ||
                    !filePath
                  }
                  className="rounded-xl bg-white px-7 py-4 font-semibold text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {isUploading
                    ? "Uploading manuscript..."
                    : isProcessing
                    ? "Processing..."
                    : `Pay ₹${selectedPrice.toLocaleString(
                        "en-IN"
                      )} & Submit →`}

                </button>

              </div>

              <p className="mt-5 border-t border-gray-700 pt-4 text-xs text-gray-400">
                Your manuscript will be uploaded
                securely before payment. Submission
                is completed only after Razorpay
                successfully verifies the payment.
              </p>

            </section>

          </div>

        </section>

      </main>
    </>
  );
}