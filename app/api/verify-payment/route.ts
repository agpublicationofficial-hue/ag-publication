import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const PACKAGE_PRICES: Record<string, number> = {
  Starter: 899,
  Basic: 1899,
  Professional: 5999,
  Premium: 8999,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,

      packageName,
      amount,

      title,
      genre,
      language,
      description,
      pages,
      words,
      file_name,
      file_path,
      publishing_preference,

      customer_name,
      customer_email,
      customer_phone,

      delivery_address,
      city,
      state,
      pincode,

      orderType,
    } = body;

    // ==========================================
    // PAYMENT DETAILS VALIDATION
    // ==========================================

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Razorpay payment details",
        },
        { status: 400 }
      );
    }

    console.log("==========================================");
    console.log("PAYMENT VERIFICATION REQUEST");
    console.log({
      razorpay_order_id,
      razorpay_payment_id,
      signatureReceived: Boolean(razorpay_signature),
      packageName,
      amount,
      orderType,
      file_name,
      file_path,
    });
    console.log("==========================================");

    // ==========================================
    // RAZORPAY SIGNATURE VERIFICATION
    // ==========================================

    const razorpaySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!razorpaySecret) {
      console.error(
        "RAZORPAY_KEY_SECRET is missing."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Razorpay server configuration is missing.",
        },
        { status: 500 }
      );
    }

    const signatureBody =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          razorpaySecret
        )
        .update(signatureBody)
        .digest("hex");

    if (
      expectedSignature !==
      razorpay_signature
    ) {
      console.error(
        "Razorpay signature mismatch."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment verification failed",
        },
        { status: 400 }
      );
    }

    console.log(
      "Razorpay signature verified successfully."
    );

    // ==========================================
    // SUPABASE SERVER CLIENT
    // ==========================================

    const cookieStore = await cookies();

    const supabase =
      createServerClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,
        process.env
          .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },

            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(
                  ({
                    name,
                    value,
                    options,
                  }) => {
                    cookieStore.set(
                      name,
                      value,
                      options
                    );
                  }
                );
              } catch {}
            },
          },
        }
      );

    // ==========================================
    // AUTHENTICATED USER
    // ==========================================

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
      console.error(
        "Authentication error:",
        userError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "User authentication required",
        },
        { status: 401 }
      );
    }

    console.log(
      "Authenticated user:",
      user.id
    );

    // ==========================================
    // ORDER TYPE
    // ==========================================

    const isPublishingPackage =
      orderType ===
      "Publishing Package";

    const isPhysicalBook =
      orderType ===
      "Physical Book";

    const finalOrderType =
      isPhysicalBook
        ? "Physical Book"
        : "Publishing Package";

    // ==========================================
    // SERVER-SIDE PACKAGE PRICE
    // ==========================================

    let finalAmount =
      Number(amount || 0);

    if (
      isPublishingPackage
    ) {
      if (
        !packageName ||
        !PACKAGE_PRICES[
          packageName
        ]
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid publishing package",
          },
          { status: 400 }
        );
      }

      finalAmount =
        PACKAGE_PRICES[
          packageName
        ];
    }

    if (
      !Number.isFinite(
        finalAmount
      ) ||
      finalAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid order amount",
        },
        { status: 400 }
      );
    }

    console.log(
      "Final order amount:",
      finalAmount
    );

    // ==========================================
    // PUBLISHING FORM VALIDATION
    // ==========================================

    if (
      isPublishingPackage
    ) {
      if (!title?.trim()) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Book title is required",
          },
          { status: 400 }
        );
      }

      if (!genre?.trim()) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Genre is required",
          },
          { status: 400 }
        );
      }

      if (!language?.trim()) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Language is required",
          },
          { status: 400 }
        );
      }

      if (
        !publishing_preference?.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Please select your publishing preference",
          },
          { status: 400 }
        );
      }

      if (!file_name?.trim()) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Please select your manuscript file",
          },
          { status: 400 }
        );
      }

      if (
        !file_path ||
        typeof file_path !==
          "string" ||
        !file_path.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Manuscript file was not uploaded. Please upload the manuscript before payment.",
          },
          { status: 400 }
        );
      }

      const cleanFilePath =
        file_path.trim();

      // ========================================
      // SECURITY:
      // FILE MUST BELONG TO CURRENT USER
      // ========================================

      const expectedFolder =
        `${user.id}/`;

      if (
        !cleanFilePath.startsWith(
          expectedFolder
        )
      ) {
        console.error(
          "Invalid manuscript file path:",
          {
            userId:
              user.id,
            filePath:
              cleanFilePath,
          }
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid manuscript file path.",
          },
          { status: 403 }
        );
      }

      console.log(
        "Valid manuscript file path:",
        cleanFilePath
      );
    }

    // ==========================================
    // CHECK AUTHOR PROFILE
    // ==========================================

    const {
      data: author,
      error: authorError,
    } =
      await supabase
        .from("authors")
        .select(
          "id, royalty_rate"
        )
        .eq(
          "id",
          user.id
        )
        .maybeSingle();

    if (
      authorError
    ) {
      console.error(
        "Author profile lookup error:",
        authorError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to verify author profile",
          details:
            authorError.message,
        },
        { status: 500 }
      );
    }

    if (!author) {
      console.error(
        "Author profile not found:",
        user.id
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Author profile not found. Please complete your author profile first.",
        },
        { status: 404 }
      );
    }

    const royaltyRate =
      Number(
        author.royalty_rate ?? 0
      );

    console.log(
      "Author royalty rate:",
      royaltyRate
    );

    // ==========================================
    // CREATE ORDER NUMBER
    // ==========================================

    const orderNumber =
      `AG-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()}`;

    // ==========================================
    // CREATE ORDER
    // ==========================================

    const orderData = {
      author_id:
        user.id,

      order_number:
        orderNumber,

      book:
        packageName ||
        (isPhysicalBook
          ? "Physical Book"
          : "Publishing Package"),

      type:
        finalOrderType,

      quantity:
        1,

      amount:
        finalAmount,

      status:
        "Processing",

      razorpay_order_id:
        razorpay_order_id,

      razorpay_payment_id:
        razorpay_payment_id,

      customer_name:
        customer_name?.trim() ||
        user.user_metadata
          ?.full_name ||
        null,

      customer_phone:
        customer_phone?.trim() ||
        null,

      customer_email:
        customer_email?.trim() ||
        user.email ||
        null,

      delivery_address:
        isPhysicalBook
          ? delivery_address ||
            null
          : null,

      city:
        isPhysicalBook
          ? city || null
          : null,

      state:
        isPhysicalBook
          ? state || null
          : null,

      pincode:
        isPhysicalBook
          ? pincode || null
          : null,

      manuscript_id:
        null,
    };

    console.log(
      "Creating order in Supabase..."
    );

    const {
      data: order,
      error: orderError,
    } =
      await supabase
        .from("orders")
        .insert(
          orderData
        )
        .select()
        .single();

    if (
      orderError
    ) {
      console.error(
        "Order creation error:",
        orderError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Payment verified, but order creation failed",
          details:
            orderError.message,
        },
        { status: 500 }
      );
    }

    console.log(
      "Order created successfully:",
      order.id
    );

    // ==========================================
    // CREATE MANUSCRIPT
    // ==========================================

    if (
      isPublishingPackage
    ) {
      const cleanFilePath =
        file_path.trim();

      const manuscriptData = {
        author_id:
          user.id,

        title:
          title.trim(),

        genre:
          genre.trim(),

        language:
          language.trim(),

        description:
          description?.trim() ||
          null,

        pages:
          pages
            ? Number(pages)
            : null,

        words:
          words
            ? Number(words)
            : null,

        file_name:
          file_name.trim(),

        publishing_preference:
          publishing_preference.trim(),

        name:
          customer_name?.trim() ||
          user.user_metadata
            ?.full_name ||
          null,

        email:
          customer_email?.trim() ||
          user.email ||
          null,

        phone:
          customer_phone?.trim() ||
          null,

        package:
          packageName,

        status:
          "Payment Confirmed",

        file_path:
          cleanFilePath,
      };

      console.log(
        "Creating manuscript..."
      );

      const {
        data:
          manuscript,
        error:
          manuscriptError,
      } =
        await supabase
          .from("manuscripts")
          .insert(
            manuscriptData
          )
          .select()
          .single();

      if (
        manuscriptError
      ) {
        console.error(
          "Manuscript creation error:",
          manuscriptError
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Payment verified and order created, but manuscript submission failed",
            details:
              manuscriptError.message,
            order_id:
              order.id,
          },
          { status: 500 }
        );
      }

      console.log(
        "Manuscript created:",
        manuscript.id
      );

      // ========================================
      // CREATE BOOK
      // ========================================
      //
      // Payment Confirmed = 10%
      //
      // royalty_rate comes from authors table.
      // ========================================

      const bookData = {
        title:
          title.trim(),

        author_id:
          user.id,

        royalty_rate:
          Number.isFinite(
            royaltyRate
          )
            ? royaltyRate
            : 0,

        progress:
          10,
      };

      console.log(
        "Creating book in Supabase..."
      );

      console.log(
        "Book data:",
        bookData
      );

      const {
        data:
          book,
        error:
          bookError,
      } =
        await supabase
          .from("books")
          .insert(
            bookData
          )
          .select()
          .single();

      if (
        bookError
      ) {
        console.error(
          "Book creation error:",
          bookError
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Payment, order and manuscript were created, but book creation failed",
            details:
              bookError.message,
            code:
              bookError.code,
            hint:
              bookError.hint,
            order_id:
              order.id,
            manuscript_id:
              manuscript.id,
          },
          { status: 500 }
        );
      }

      console.log(
        "Book created successfully:",
        book.id
      );

      // ========================================
      // LINK ORDER ↔ MANUSCRIPT
      // ========================================

      console.log(
        "Linking order with manuscript..."
      );

      const {
        data:
          linkedOrder,
        error:
          linkError,
      } =
        await supabase.rpc(
          "link_order_manuscript",
          {
            p_order_id:
              order.id,

            p_manuscript_id:
              manuscript.id,
          }
        );

      if (
        linkError
      ) {
        console.error(
          "Order-manuscript linking error:",
          linkError
        );

        return NextResponse.json(
          {
            success: false,

            error:
              "Payment, manuscript and book were created, but order-manuscript linking failed",

            details:
              linkError.message,

            order_id:
              order.id,

            manuscript_id:
              manuscript.id,

            book_id:
              book.id,
          },
          { status: 500 }
        );
      }

      console.log(
        "=========================================="
      );

      console.log(
        "PUBLISHING FLOW COMPLETED"
      );

      console.log({
        order_id:
          order.id,

        manuscript_id:
          manuscript.id,

        book_id:
          book.id,

        title:
          book.title,

        progress:
          book.progress,

        royalty_rate:
          book.royalty_rate,
      });

      console.log(
        "=========================================="
      );

      // ========================================
      // FINAL SUCCESS
      // ========================================

      return NextResponse.json({
        success: true,

        message:
          "Payment verified, order created, manuscript submitted, book created and linked successfully",

        order:
          linkedOrder,

        manuscript,

        book,

        package:
          packageName,

        amount:
          finalAmount,

        payment_id:
          razorpay_payment_id,

        manuscript_id:
          manuscript.id,

        book_id:
          book.id,

        progress:
          book.progress,

        file_path:
          manuscript.file_path,
      });
    }

    // ==========================================
    // PHYSICAL BOOK SUCCESS
    // ==========================================

    return NextResponse.json({
      success: true,

      message:
        "Payment verified and order created successfully",

      order,

      payment_id:
        razorpay_payment_id,
    });
  } catch (error: any) {
    console.error(
      "Payment verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Verification error",
      },
      { status: 500 }
    );
  }
}