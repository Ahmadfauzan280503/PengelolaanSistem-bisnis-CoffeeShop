"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GalleryVerticalEndIcon, AlertCircle, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { loginWithEmail, loginWithPin } from "@/actions/auth.action";

export const Login = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginType, setLoginType] = useState<"pin" | "email">("pin");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = loginType === "pin" 
        ? await loginWithPin(pin) 
        : await loginWithEmail(email, password);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.success && result.redirectPath) {
        // If there was a redirect param, use it; otherwise use role-based redirect
        const target = redirectTo || result.redirectPath;
        router.replace(target);
      }
    } catch (err: any) {
      setError(err.message || "Login gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleLogin}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEndIcon className="size-6" />
              </div>
              <span className="sr-only">KOTACOFFEE Dashboard</span>
            </a>
            <h1 className="text-xl font-bold">Selamat Datang</h1>
            <FieldDescription>
              Login ke Dashboard KOTACOFFEE.ID
            </FieldDescription>
          </div>

          {/* Login Type Tabs */}
          <div className="flex bg-zinc-100 p-1 rounded-lg gap-1 mb-2">
            <button
              type="button"
              onClick={() => { setLoginType("pin"); setError(null); }}
              className={cn("flex-1 text-sm font-medium py-2 rounded-md transition-all", loginType === "pin" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-900")}
            >
              Staff Kantor (PIN)
            </button>
            <button
              type="button"
              onClick={() => { setLoginType("email"); setError(null); }}
              className={cn("flex-1 text-sm font-medium py-2 rounded-md transition-all", loginType === "email" ? "bg-white shadow-sm text-zinc-900" : "text-zinc-500 hover:text-zinc-900")}
            >
              Cashier (Email)
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loginType === "pin" ? (
            <Field>
              <FieldLabel htmlFor="pin">PIN Akses</FieldLabel>
              <Input
                id="pin"
                type="password"
                placeholder="••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                disabled={isLoading}
                maxLength={6}
                inputMode="numeric"
              />
            </Field>
          ) : (
            <>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@kotacoffee.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={8}
                  autoComplete="current-password"
                />
              </Field>
            </>
          )}
          <Field>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center text-xs text-zinc-500">
        Hubungi HRD untuk mendapatkan akun dashboard Anda.
      </FieldDescription>
    </div>
  );
};
