import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  const safeNext =
    next && next.startsWith("/")
      ? next
      : "/admin-dashboard";

  if (!code) {
    return NextResponse.redirect(
      new URL(
        "/admin-login?error=google_auth_failed",
        request.url
      )
    );
  }

  const supabase = await createServerSupabaseClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error(
      "Google auth callback error:",
      error
    );

    return NextResponse.redirect(
      new URL(
        "/admin-login?error=google_auth_failed",
        request.url
      )
    );
  }

  return NextResponse.redirect(
    new URL(safeNext, request.url)
  );
}