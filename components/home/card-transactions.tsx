import { Avatar, Card, CardBody } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export const CardTransactions = () => {
  const [items, setItems] = useState<any[]>([]);
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from("cashier_orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setItems(data);
      }

      // Fetch today's total
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: todayData } = await supabase
        .from("cashier_orders")
        .select("total_price")
        .in("order_status", ["COMPLETED"])
        .gte("created_at", today.toISOString());
        
      if (todayData) {
        setTodayTotal(todayData.reduce((sum, o) => sum + (o.total_price || 0), 0));
      }
    };

    fetchTransactions();
    
    // Optional: Realtime subscription
    const channel = supabase.channel("realtime-cashier_orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "cashier_orders" }, () => {
        fetchTransactions();
      }).subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatCurrency = (v: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(v);
  };

  return (
    <Card className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl shadow-lg shadow-purple-500/5 px-3">
      <CardBody className="py-5 gap-4">
        <div className="flex gap-2.5 justify-center">
          <div className="flex flex-col border border-purple-500/20 bg-purple-500/5 py-3 px-6 rounded-xl text-center w-full">
            <span className="text-white text-sm font-black tracking-wide uppercase text-gray-400">
              🏆 Total Hasil Penjualan
            </span>
            <span className="text-green-400 text-2xl font-black mt-1">
              {formatCurrency(todayTotal)}
            </span>
            <span className="text-gray-500 text-[10px] mt-1">Hari Ini</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-4 w-full items-center bg-[#0a0a0f] border border-[#1e1e2e] rounded-xl px-3 py-3">
              <div className="w-full">
                <Avatar
                  isBordered
                  color="secondary"
                  name={item.customer_name?.charAt(0) || "U"}
                />
              </div>

              <div className="flex flex-col">
                <span className="text-white font-bold truncate text-sm">
                  {item.customer_name}
                </span>
                <span className="text-gray-500 text-[10px] truncate">
                  {item.cabang || "Outlet"}
                </span>
              </div>
              
              <div>
                <span className="text-green-400 text-xs font-black">{formatCurrency(item.total_price)}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-600 text-[10px] font-medium">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center text-sm text-gray-600 py-4">No recent transactions.</div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};
