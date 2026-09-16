import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(
                ({ name, value, options }) => {
                  cookieStore.set(name, value, options);
                }
              );
            } catch {}
          },
        },
      }
    );

    // --------------------------------
    // AUTHENTICATION
    // --------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // --------------------------------
    // ADMIN CHECK
    // --------------------------------

    const { data: author, error: authorError } =
      await supabase
        .from("authors")
        .select("id, role")
        .eq("id", user.id)
        .single();

    if (
      authorError ||
      !author ||
      author.role !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required",
        },
        { status: 403 }
      );
    }

    // --------------------------------
    // REQUEST BODY
    // --------------------------------

    const body = await request.json();

    const {
      author_id,
      book_id,
      platform,
      quantity,
      sale_amount,
      sale_date,
      order_id,
    } = body;

    // --------------------------------
    // VALIDATION
    // --------------------------------

    if (
      !author_id ||
      !book_id ||
      !platform ||
      !quantity ||
      sale_amount === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing sales information",
        },
        { status: 400 }
      );
    }

    const units = Number(quantity);
    const saleAmount = Number(sale_amount);

    if (
      !Number.isFinite(units) ||
      !Number.isFinite(saleAmount) ||
      units <= 0 ||
      saleAmount < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid sale quantity or amount",
        },
        { status: 400 }
      );
    }

    const finalSaleDate =
      sale_date ||
      new Date().toISOString().split("T")[0];

    // --------------------------------
    // RECORD SALE + ROYALTY
    // --------------------------------

    const { data: result, error: recordError } =
      await supabase.rpc("record_sale", {
        p_author_id: author_id,
        p_book_id: book_id,
        p_platform: platform,
        p_quantity: units,
        p_sale_amount: saleAmount,
        p_sale_date: finalSaleDate,
        p_order_id: order_id || null,
      });

    if (recordError) {
      console.error(
        "Record sale error:",
        recordError
      );

      // Log failed sync
      await supabase
        .from("sales_sync_logs")
        .insert({
          platform,
          sync_date: finalSaleDate,
          status: "failed",
          orders_synced: 0,
          message: recordError.message,
        });

      return NextResponse.json(
        {
          success: false,
          error: recordError.message,
          details: recordError.details,
          hint: recordError.hint,
        },
        { status: 500 }
      );
    }

    // --------------------------------
    // SUCCESS LOG
    // --------------------------------

    await supabase
      .from("sales_sync_logs")
      .insert({
        platform,
        sync_date: finalSaleDate,
        status: "success",
        orders_synced: units,
        message: "Sale synced successfully",
      });

    // --------------------------------
    // RESPONSE
    // --------------------------------

    return NextResponse.json({
      success: true,
      message:
        "Sale and royalty recorded successfully",

      platform,
      units,
      sale_amount: saleAmount,
      sale_date: finalSaleDate,

      result,
    });
  } catch (error) {
    console.error(
      "Sales sync error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Sales sync failed",
      },
      { status: 500 }
    );
  }
}