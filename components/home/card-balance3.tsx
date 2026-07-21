import { Card, CardBody } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TrendingUp } from "lucide-react";

export const CardBalance3 = () => {
  const [avgOrder, setAvgOrder] = useState(0);

  useEffect(() => {
    const fetchTodaySales = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("cashier_orders")
        .select("total_price")
        .in("order_status", ["COMPLETED"])
        .gte("created_at", today.toISOString());

      if (!error && data && data.length > 0) {
        const total = data.reduce((sum, order) => sum + (order.total_price || 0), 0);
        setAvgOrder(total / data.length);
      }
    };
    fetchTodaySales();
  }, []);

  const formatCurrency = (v: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(v);
  };
  return (
    <Card className="xl:max-w-sm bg-[#12121a] border border-[#1e1e2e] rounded-2xl shadow-lg shadow-purple-500/5 px-4 w-full relative overflow-hidden">
      {/* Neon glow accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full translate-x-8 -translate-y-8 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-500/5 rounded-full -translate-x-4 translate-y-4 blur-xl" />

      <CardBody className="py-6 overflow-visible relative z-10">
        <div className="flex gap-3 items-center">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <TrendingUp className="text-purple-400" size={22} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-base leading-tight">Rata-rata Order</span>
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Average per Order</span>
          </div>
        </div>
        <div className="flex gap-2.5 py-5 items-center">
          <span className="text-purple-400 text-3xl font-black tracking-tight">{formatCurrency(avgOrder)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-black text-cyan-400 text-[10px] bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg uppercase tracking-wider">● Stabil</span>
          <span className="text-[10px] font-bold text-gray-500">Bulan Ini</span>
        </div>
      </CardBody>
    </Card>
  );
};
