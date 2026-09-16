import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  /*
   * AUTHOR PROTECTED ROUTES
   */
  const protectedAuthorRoutes = [
    "/author-dashboard",
    "/my-books",
    "/orders",
    "/royalties",
    "/publishing-progress",
    "/track-order",
    "/submit-manuscript",
    "/support",
  ];

  const isProtectedAuthorRoute = protectedAuthorRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  /*
   * ADMIN PROTECTED ROUTES
   */
  const protectedAdminRoutes = [
    "/admin-dashboard",
    "/admin-orders",
    "/admin-support",
  ];

  const isProtectedAdminRoute = protectedAdminRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  /*
   * AUTHOR ROUTES
   *
   * If there is no Supabase session,
   * send the user to Author Login.
   */
  if (isProtectedAuthorRoute && !user) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/author-login";
    loginUrl.searchParams.set(
      "error",
      "login_required"
    );

    return NextResponse.redirect(loginUrl);
  }

  /*
   * ADMIN ROUTES
   *
   * If there is no Supabase session,
   * send the user to ADMIN Login,
   * NOT Author Login.
   */
  if (isProtectedAdminRoute && !user) {
    const adminLoginUrl = request.nextUrl.clone();

    adminLoginUrl.pathname = "/admin-login";
    adminLoginUrl.searchParams.set(
      "error",
      "login_required"
    );

    return NextResponse.redirect(adminLoginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/author-dashboard/:path*",
    "/my-books/:path*",
    "/orders/:path*",
    "/royalties/:path*",
    "/publishing-progress/:path*",
    "/track-order/:path*",
    "/submit-manuscript/:path*",
    "/support/:path*",

    "/admin-dashboard/:path*",
    "/admin-orders/:path*",
    "/admin-support/:path*",
  ],
};