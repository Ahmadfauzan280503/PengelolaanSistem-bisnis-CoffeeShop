"use client";

import { motion } from "framer-motion";
import { ShieldX, ArrowLeft, LogIn } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md"
      >
        {/* Shield Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8"
        >
          <ShieldX className="w-12 h-12 text-red-400" />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-black text-white mb-3">
          Akses Ditolak
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
          Anda tidak memiliki izin untuk mengakses halaman ini.
          <br />
          Hubungi HRD atau Admin jika Anda merasa ini kesalahan.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-all text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-zinc-900 rounded-xl hover:bg-zinc-100 transition-all text-sm font-semibold"
          >
            <LogIn className="w-4 h-4" />
            Login Ulang
          </Link>
        </div>

        {/* Footer */}
        <p className="text-zinc-600 text-xs mt-12">
          KOTACOFFEE.ID — Dashboard System
        </p>
      </motion.div>
    </div>
  );
}
