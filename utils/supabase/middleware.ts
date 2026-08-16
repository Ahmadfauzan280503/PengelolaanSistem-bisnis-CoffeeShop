import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// =====================================================================
// RBAC Route Protection — Active in production
// =====================================================================

// Routes that require authentication and role check
const PROTECTED_ROUTE_ROLES: Record<string, string[]> = {
  "/hrd": ["Owner", "HRD"],
  "/supervaisor": ["Owner", "Supervisor"],
  "/finance": ["Owner", "Finance"],
  "/cashier": ["Owner", "Kasir", "Leader", "Barista"],
};

// Auth routes (login, signup) — redirect away if already logged in
const AUTH_ROUTES = ["/login", "/signup", "/register"];

// Public routes — no auth needed
const PUBLIC_ROUTES = ["/", "/order", "/api/checkout", "/api/webhook", "/unauthorized"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function getProtectedRouteRoles(pathname: string): string[] | null {
  for (const [route, roles] of Object.entries(PROTECTED_ROUTE_ROLES)) {
    if (pathname.startsWith(route)) {
      return roles;
    }
  }
  return null;
}

function getDefaultRouteForRole(roleName: string): string {
  switch (roleName) {
    case "Owner":
    case "HRD":
      return "/hrd";
    case "Finance":
      return "/finance";
    case "Supervisor":
      return "/supervaisor";
    case "Kasir":
    case "Leader":
    case "Barista":
      return "/cashier/cabang-1";
    default:
      return "/";
  }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
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

  const pathname = request.nextUrl.pathname;

  // =====================================================================
  // 1. Public routes — always allow
  // =====================================================================
  if (isPublicRoute(pathname)) {
    return supabaseResponse;
  }

  // =====================================================================
  // 2. Auth routes — redirect to dashboard if already logged in
  // =====================================================================
  if (isAuthRoute(pathname)) {
    if (user) {
      // Fetch user role to redirect to correct dashboard
      const { data: employee } = await supabase
        .from("employees")
        .select("id, roles(name)")
        .eq("user_id", user.id)
        .single();

      const roleName = (employee?.roles as any)?.name || "Kasir";
      const url = request.nextUrl.clone();
      url.pathname = getDefaultRouteForRole(roleName);
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // =====================================================================
  // 3. Protected routes — require authentication + correct role
  // =====================================================================
  const requiredRoles = getProtectedRouteRoles(pathname);

  if (requiredRoles) {
    // Not logged in → redirect to login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Fetch user role from employees table
    const { data: employee } = await supabase
      .from("employees")
      .select("id, roles(name)")
      .eq("user_id", user.id)
      .single();

    const roleName = (employee?.roles as any)?.name;

    // No employee record or no role → unauthorized
    if (!roleName) {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    // Role doesn't have access → return 404 (hide the route existence)
    if (!requiredRoles.includes(roleName)) {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  return supabaseResponse;
}
