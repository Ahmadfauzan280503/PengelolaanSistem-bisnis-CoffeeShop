// =========================================================================
// SECURITY UTILITIES — KOTACOFFEE Dashboard
// Input sanitization, validation, rate limiting
// =========================================================================

/**
 * Sanitize string input to prevent XSS attacks.
 * Strips HTML tags and escapes dangerous characters.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/`/g, "&#96;")
    .trim();
}

/**
 * Strip all HTML tags from input (for display-safe text).
 */
export function stripHtmlTags(input: string): string {
  if (typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Sanitize an object's string values recursively.
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === "string") {
      sanitized[key] = stripHtmlTags(value);
    } else if (typeof value === "number" || typeof value === "boolean") {
      sanitized[key] = value;
    } else if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string" ? stripHtmlTags(item) : item
      );
    } else if (typeof value === "object") {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}

/**
 * Validate email format.
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Indonesian).
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[0-9]{8,13}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ""));
}

/**
 * Validate string length constraints.
 */
export function validateLength(
  input: string,
  min: number,
  max: number
): boolean {
  if (typeof input !== "string") return false;
  return input.length >= min && input.length <= max;
}

/**
 * Validate that input is a safe number (not NaN, not Infinity).
 */
export function validateNumber(input: any): boolean {
  const num = Number(input);
  return !isNaN(num) && isFinite(num);
}

/**
 * Validate UUID format.
 */
export function validateUUID(input: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(input);
}

// =========================================================================
// IN-MEMORY RATE LIMITER
// =========================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of Array.from(rateLimitStore.entries())) {
      if (now > entry.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Check rate limit for a given key.
 * @returns true if the request is allowed, false if rate limited.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

// =========================================================================
// SECURITY HEADERS
// =========================================================================

/**
 * Get security headers to add to responses.
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "Strict-Transport-Security":
      "max-age=31536000; includeSubDomains; preload",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://*.supabase.co https://i.pravatar.cc https://*.googleusercontent.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com;",
  };
}

// =========================================================================
// ROLE CONSTANTS
// =========================================================================

export const ROLES = {
  OWNER: "Owner",
  HRD: "HRD",
  FINANCE: "Finance",
  SUPERVISOR: "Supervisor",
  LEADER: "Leader",
  BARISTA: "Barista",
  KASIR: "Kasir",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/**
 * Route-to-role mapping. Defines which roles can access which routes.
 */
export const ROUTE_PERMISSIONS: Record<string, RoleName[]> = {
  "/hrd": [ROLES.OWNER, ROLES.HRD],
  "/supervaisor": [ROLES.OWNER, ROLES.SUPERVISOR],
  "/finance": [ROLES.OWNER, ROLES.FINANCE],
  "/cashier": [ROLES.OWNER, ROLES.KASIR, ROLES.LEADER, ROLES.BARISTA],
};

/**
 * Get the default dashboard route for a given role.
 */
export function getDefaultRouteForRole(role: string): string {
  switch (role) {
    case ROLES.OWNER:
      return "/hrd";
    case ROLES.HRD:
      return "/hrd";
    case ROLES.FINANCE:
      return "/finance";
    case ROLES.SUPERVISOR:
      return "/supervaisor";
    case ROLES.KASIR:
    case ROLES.LEADER:
    case ROLES.BARISTA:
      return "/cashier/cabang-1";
    default:
      return "/";
  }
}

/**
 * Check if a role has access to a given route path.
 */
export function hasRouteAccess(role: string, pathname: string): boolean {
  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(role as RoleName);
    }
  }
  return true; // Allow access to non-protected routes
}
