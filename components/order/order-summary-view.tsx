"use client";
import React, { useMemo } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, Printer, ArrowLeft } from "lucide-react";

export const OrderSummaryView = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const params = useParams();
  const urlBrand = params?.brand as string || "KTCF";
  const urlBranch = params?.branch as string || "KTCF-01";

  const orderId = searchParams.get("orderId") || "ORD-" + Date.now();
  const name = searchParams.get("name") || "Pelanggan KOTACOFFEE.ID";
  const table = searchParams.get("table") || "Meja 1";
  const branchName = searchParams.get("branch") || "KOTACOFFEE.ID";
  const total = Number(searchParams.get("total") || 0);
  const subtotal = Number(searchParams.get("subtotal") || 0);
  const tax = Number(searchParams.get("tax") || 0);
  const service = Number(searchParams.get("service") || 0);
  
  const items = useMemo(() => {
    try {
      const itemsStr = searchParams.get("items");
      if (itemsStr) return JSON.parse(itemsStr);
    } catch (e) {
      console.error("Error parsing items:", e);
    }
    return [];
  }, [searchParams]);

  const formatCurrency = (v: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(v);
  };

  const todayStr = useMemo(() => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F9F9] text-[#2D1B4E] py-12 px-4 font-sans relative">
      <div className="max-w-md mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-[#E6F4F1] text-[#0D5C4D] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#0D5C4D] shadow-md"
          >
            <CheckCircle2 size={40} />
          </motion.div>
          <h1 className="text-2xl font-black text-[#0D5C4D]">Pembayaran Berhasil!</h1>
          <p className="text-zinc-400 text-xs font-semibold mt-1">Pesanan Anda telah diteruskan ke antrean kasir</p>
        </div>

        {/* Receipt Invoice Card (ESB/Yotta receipt layout) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white text-[#2D1B4E] rounded-[36px] shadow-sm relative overflow-hidden border border-gray-200"
        >
          {/* Top Teal Ribbon */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#0D5C4D]" />
          
          {/* Stamp/Badge "LUNAS" */}
          <div className="absolute top-8 right-6 border-4 border-emerald-600 text-emerald-600 font-black text-xs px-3.5 py-1.5 rounded-2xl rotate-12 uppercase tracking-widest bg-emerald-50/50 backdrop-blur-[1px] select-none">
            Lunas QRIS
          </div>

          <div className="p-8">
            {/* Cafe Info */}
            <div className="mb-6">
              <h2 className="text-lg font-black text-[#0D5C4D] uppercase flex items-center gap-1.5">
                <svg viewBox="0 0 100 100" className="w-5 h-5 fill-[#0D5C4D] inline">
                  <path d="M50 15 C 30 15, 15 35, 15 55 C 15 70, 30 85, 50 85 C 50 85, 75 75, 80 50 C 85 25, 65 15, 50 15 Z M50 78 C 35 78, 23 68, 23 55 C 23 45, 33 33, 50 23 C 58 35, 72 45, 72 55 C 72 68, 62 78, 50 78 Z" />
                </svg> KOTACOFFEE.ID
              </h2>
              <p className="text-xs text-zinc-500 font-bold mt-1.5">{branchName}</p>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5 font-bold uppercase tracking-wider">Official Receipt</p>
            </div>

            {/* Meta Details */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-dashed border-gray-200 text-xs font-mono font-bold text-[#2D1B4E]/80 mb-6 bg-gray-50/50 rounded-2xl px-4">
              <div>
                <p className="text-zinc-400 text-[10px]">Order ID:</p>
                <p className="text-gray-800 uppercase">{orderId.substring(0, 12)}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-[10px]">Waktu Transaksi:</p>
                <p className="text-gray-800">{todayStr}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-[10px]">Meja / Outlet:</p>
                <p className="text-gray-800">{table}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-[10px]">Nama Pelanggan:</p>
                <p className="text-gray-800 truncate">{name}</p>
              </div>
            </div>

            {/* Items Purchased */}
            <div className="space-y-4 mb-6">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Daftar Menu Terbeli</p>
              {items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start text-xs font-bold text-gray-700">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-gray-800 truncate">{item.name}</p>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">{item.quantity} x {formatCurrency(item.price)}</p>
                    {item.notes && (
                      <p className="text-[9px] text-orange-500 font-semibold italic mt-0.5">Note: {item.notes}</p>
                    )}
                  </div>
                  <span className="text-[#0D5C4D]">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="border-t border-dashed border-gray-200 pt-4 space-y-2.5 text-xs font-bold text-gray-500">
              <div className="flex justify-between">
                <span>Subtotal Belanja</span>
                <span className="text-gray-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pajak Restoran PB1 (10%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Pelayanan (5%)</span>
                <span>{formatCurrency(service)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#0D5C4D] border-t border-gray-200 pt-3.5 mt-2">
                <span>TOTAL TRANSAKSI</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Bottom Receipt footer */}
          <div className="bg-gray-50 py-3.5 px-6 flex justify-between items-center border-t border-gray-150">
            <span className="text-[9px] text-zinc-400 font-mono font-bold uppercase tracking-wider">Paid QRIS • Server synchronized</span>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs font-black text-[#0D5C4D] hover:text-[#084539] transition-colors uppercase tracking-wider"
            >
              <Printer size={13} /> Cetak
            </button>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => router.push(`/${urlBrand}/${urlBranch}/order?tableNumber=${encodeURIComponent(table)}`)}
            className="w-full bg-[#0D5C4D] hover:bg-[#084539] text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#0D5C4D]/15 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 border-2 border-white"
          >
            <ShoppingBag size={16} /> Pesan Menu Lainnya
          </button>
          
          <button
            onClick={() => router.push("/")}
            className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-zinc-500 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} /> Kembali ke Landing Page
          </button>
        </div>
      </div>
    </div>
  );
};
