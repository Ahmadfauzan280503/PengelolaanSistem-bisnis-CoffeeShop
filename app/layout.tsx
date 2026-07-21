import "../styles/globals.css"; 
import type { Metadata } from "next";
import { Providers } from "./providers";
import { fontSans } from "@/config/fonts";
import clsx from "clsx";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Supervisor Dashboard",
  description: "Dashboard Supervisor Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body className={clsx("font-sans antialiased", fontSans.className)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
