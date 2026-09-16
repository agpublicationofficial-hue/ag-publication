import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const PACKAGE_PRICES: Record<string, number> = {
  Starter: 899,
  Basic: 1899,
  Professional: 5999,
  Premium: 8999,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const packageName =
      typeof body.packageName === "string"
        ? body.packageName.trim()
        : "";

    // --------------------------------
    // PUBLISHING PACKAGE
    // --------------------------------

    if (packageName) {
      if (!PACKAGE_PRICES[packageName]) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid publishing package",
          },
          {
            status: 400,
          }
        );
      }
    }

    // --------------------------------
    // AMOUNT
    // --------------------------------

    let amount: number;

    if (packageName) {
      // Package price is controlled by server.
      // Client cannot change the price.
      amount = PACKAGE_PRICES[packageName];
    } else {
      // Fallback for existing payment flows
      // such as physical book orders.
      amount = Number(body.amount);
    }

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment amount",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------
    // RAZORPAY CONFIGURATION CHECK
    // --------------------------------

    const keyId =
      process.env.RAZORPAY_KEY_ID;

    const keySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error(
        "Razorpay environment variables are missing."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Razorpay configuration is missing on the server.",
        },
        {
          status: 500,
        }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // --------------------------------
    // CREATE RAZORPAY ORDER
    // --------------------------------

    const order =
      await razorpay.orders.create({
        amount: Math.round(
          amount * 100
        ),

        currency: "INR",

        receipt:
          `ag_${Date.now()}`,
      });

    console.log(
      "Razorpay order created:",
      {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        packageName:
          packageName || null,
      }
    );

    // --------------------------------
    // RESPONSE
    // --------------------------------

    return NextResponse.json({
      success: true,

      id: order.id,

      amount:
        order.amount,

      currency:
        order.currency,

      packageName:
        packageName || null,
    });
  } catch (error: any) {
    console.error(
      "Razorpay order creation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.error?.description ||
          error?.message ||
          "Unable to create Razorpay order",
      },
      {
        status: 500,
      }
    );
  }
}