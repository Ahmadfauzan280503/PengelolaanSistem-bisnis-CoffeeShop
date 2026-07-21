import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// =====================================================================
// RBAC_ENABLED: Set to true once login system is fully operational.
// When false, all dashboard routes are accessible without authentication.
// When true, unauthenticated users are redirected to /login.
// =====================================================================
const RBAC_ENABLED = false;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Only attempt Supabase session refresh if env vars are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Supabase not configured — allow all requests through
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh the auth token (keeps session alive)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // =====================================================================
  // RBAC Route Protection (Only active when RBAC_ENABLED = true)
  // =====================================================================
  if (RBAC_ENABLED) {
    const isAuthRoute =
      request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/signup");
    const isProtectedRoute =
      request.nextUrl.pathname.startsWith("/hrd") ||
      request.nextUrl.pathname.startsWith("/finance") ||
      request.nextUrl.pathname.startsWith("/supervaisor") ||
      request.nextUrl.pathname.startsWith("/cashier");

    if (isProtectedRoute && !user) {
      // Redirect unauthenticated users to login page
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (isAuthRoute && user) {
      // Redirect authenticated users away from auth pages
      // TODO: Fetch user role from 'employees' table and redirect to their specific dashboard
      const url = request.nextUrl.clone();
      url.pathname = "/hrd";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
