"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function SupportWidget() {
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);

  const dragRef = useRef({
    offsetX: 0,
    offsetY: 0,
  });

  const movedRef = useRef(false);

  const isPaymentPage =
    pathname.includes("checkout") ||
    pathname.includes("payment") ||
    pathname.includes("razorpay") ||
    pathname.includes("order-payment");

  /* ---------------- MOUNT SAFETY ---------------- */

  useEffect(() => {
    setMounted(true);

    setPosition({
      x: window.innerWidth - 88,
      y: window.innerHeight - 100,
    });
  }, []);

  /* ---------------- DRAG HANDLING ---------------- */

  useEffect(() => {
    if (!dragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      movedRef.current = true;

      const nextX = event.clientX - dragRef.current.offsetX;
      const nextY = event.clientY - dragRef.current.offsetY;

      const buttonSize = 64;

      const maxX = window.innerWidth - buttonSize - 12;
      const maxY = window.innerHeight - buttonSize - 12;

      setPosition({
        x: Math.min(Math.max(12, nextX), maxX),
        y: Math.min(Math.max(12, nextY), maxY),
      });
    };

    const handlePointerUp = () => {
      setDragging(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragging]);

  /* ---------------- RAZORPAY CHECKOUT ---------------- */

  useEffect(() => {
    const handleRazorpayOpened = () => {
      setOpen(false);
    };

    window.addEventListener(
      "razorpay:opened",
      handleRazorpayOpened
    );

    return () => {
      window.removeEventListener(
        "razorpay:opened",
        handleRazorpayOpened
      );
    };
  }, []);

  /* ---------------- HYDRATION PROTECTION ---------------- */

  if (!mounted) return null;

  if (isPaymentPage) return null;

  return (
    <>
      {/* Floating support button */}
      <div
        className="fixed z-[9999]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <button
          type="button"
          aria-label="Open A&G Help Center"
          onPointerDown={(event) => {
            const rect =
              event.currentTarget.getBoundingClientRect();

            dragRef.current = {
              offsetX: event.clientX - rect.left,
              offsetY: event.clientY - rect.top,
            };

            movedRef.current = false;
            setDragging(true);
          }}
          onPointerUp={() => {
            setDragging(false);

            if (!movedRef.current) {
              setOpen((value) => !value);
            }
          }}
          className="flex h-16 w-16 touch-none select-none items-center justify-center rounded-full bg-[#171717] text-2xl font-medium text-white shadow-[0_15px_45px_rgba(0,0,0,0.22)] transition hover:scale-105 hover:bg-black"
        >
          ?
        </button>
      </div>

      {/* Help Center panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-[9998] w-[calc(100vw-40px)] max-w-sm overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.18)]">
          {/* Header */}
          <div className="bg-[#171717] px-6 py-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">
                  A&G PUBLICATION
                </p>

                <h3 className="mt-2 text-xl font-medium">
                  Help Center
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close Help Center"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                ×
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-white/50">
              Need help with publishing, payments, orders or your
              author account?
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3 p-5">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/support");
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-black/10 px-4 py-4 text-left transition hover:border-black/25 hover:bg-[#faf9f6]"
            >
              <div>
                <p className="text-sm font-medium">
                  Help Center
                </p>

                <p className="mt-1 text-xs text-black/40">
                  FAQs and common solutions
                </p>
              </div>

              <span>→</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/support?ticket=new");
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-black/10 px-4 py-4 text-left transition hover:border-black/25 hover:bg-[#faf9f6]"
            >
              <div>
                <p className="text-sm font-medium">
                  Contact Support
                </p>

                <p className="mt-1 text-xs text-black/40">
                  Open a support ticket
                </p>
              </div>

              <span>→</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/track-order");
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-black/10 px-4 py-4 text-left transition hover:border-black/25 hover:bg-[#faf9f6]"
            >
              <div>
                <p className="text-sm font-medium">
                  Track Order
                </p>

                <p className="mt-1 text-xs text-black/40">
                  Check your order status
                </p>
              </div>

              <span>→</span>
            </button>
          </div>

          {/* Footer */}
          <div className="border-t border-black/10 px-5 py-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/30">
              Drag the ? button anywhere
            </p>
          </div>
        </div>
      )}
    </>
  );
}