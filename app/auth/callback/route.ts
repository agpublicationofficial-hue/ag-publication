import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const flowId = requestUrl.searchParams.get("sb_flow_id");

  const safeNext =
    next && next.startsWith("/")
      ? next
      : "/author-dashboard";

  if (!code) {
    console.error(
      "Google auth callback: authorization code missing."
    );

    return NextResponse.redirect(
      new URL(
        "/author-login?error=google_auth_failed",
        request.url
      )
    );
  }

  try {
    const supabase =
      await createServerSupabaseClient();

    const { error } =
      await supabase.auth.exchangeCodeForSession(
        code,
        flowId ? { flowId } : undefined
      );

    if (error) {
      console.error(
        "Google auth callback error:",
        error
      );

      return NextResponse.redirect(
        new URL(
          `/author-login?error=${encodeURIComponent(
            error.message
          )}`,
          request.url
        )
      );
    }

    return NextResponse.redirect(
      new URL(safeNext, request.url)
    );
  } catch (error) {
    console.error(
      "Google auth callback exception:",
      error
    );

    return NextResponse.redirect(
      new URL(
        `/author-login?error=${encodeURIComponent(
          error instanceof Error
            ? error.message
            : "Google authentication failed."
        )}`,
        request.url
      )
    );
  }
}