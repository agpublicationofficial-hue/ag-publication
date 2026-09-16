import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const { data: author, error } = await supabase
      .from("authors")
      .select("id, full_name, email, phone")
      .eq("id", user.id)
      .single();

    if (error || !author) {
      return NextResponse.json(
        {
          error: "Author profile not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      author,
    });
  } catch (error) {
    console.error("Current author error:", error);

    return NextResponse.json(
      {
        error: "Unable to load author details",
      },
      { status: 500 }
    );
  }
}