"use client";
import { Card, CardBody, Divider, Spinner, Button } from "@nextui-org/react";
import React, { useEffect, useState, useCallback } from "react";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import { UsersIcon } from "@/components/icons/breadcrumb/users-icon";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const Payments = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const fetchSalesData = useCallback(async () => {
    setLoading(true);
    const { data: sales, error } = await supabase
      .from("sales")
      .select("*")
      .order("tanggal", { ascending: false });

    if (error) {
      console.error("Error fetching sales for payments:", error);
    } else if (sales) {
      // Group by branch AND date
      const grouped = sales.reduce((acc: any, item: any) => {
        const branch = item.cabang || "Tanpa Cabang";
        const date = item.tanggal; // YYYY-MM-DD
        const key = `${branch}_${date}`;

        if (!acc[key]) {
          const d = new Date(date);
          const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
          const months = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
          ];
          
          acc[key] = {
            id: key,
            cabang: branch,
            hari: days[d.getDay()],
            tanggal: d.getDate().toString().padStart(2, "0"),
            bulan: months[d.getMonth()],
            tahun: d.getFullYear().toString(),
            qris: 0,
            cash: 0,
            gojek: 0,
            grab: 0,
            shopeefood: 0,
          };
        }
        
        acc[key].qris += Number(item.qris_kotacoffee || 0);
        acc[key].cash += Number(item.cash || 0);
        acc[key].gojek += Number(item.gojek_kotacoffee || 0);
        acc[key].grab += Number(item.grab_kotacoffee || 0);
        acc[key].shopeefood += Number(item.shopeefood_kotacoffee || 0);
        
        return acc;
      }, {});

      setData(Object.values(grouped));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  return (
    <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
      <ul className="flex">
        <li className="flex gap-2">
          <HouseIcon />
          <Link href={"/"}>
            <span>Home</span>
          </Link>
          <span> / </span>{" "}
        </li>
        <li className="flex gap-2">
          <UsersIcon />
          <span>Finance</span>
          <span> / </span>{" "}
        </li>
        <li className="flex gap-2">
          <span>Laporan Pembayaran</span>
        </li>
      </ul>

      <h3 className="text-xl font-semibold">Laporan Pembayaran</h3>

      <div className="flex flex-wrap gap-4 mb-6">
        {[
          { name: "Gojek", href: "/payments/gojek", color: "success" },
          { name: "Grab", href: "/payments/grab", color: "primary" },
          { name: "ShopeeFood", href: "/payments/shopefood", color: "warning" },
          { name: "Cash", href: "/payments/cash", color: "secondary" },
          { name: "QRIS", href: "/payments/qris", color: "danger" },
        ].map((item) => (
          <Link key={item.name} href={item.href}>
            <Card className="hover:scale-105 transition-transform cursor-pointer bg-default-100 border border-default-200">
              <CardBody className="px-6 py-3">
                <span className="font-bold text-default-700">{item.name}</span>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <Spinner label="Memuat data pembayaran..." />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-default-50 rounded-xl border-2 border-dashed border-default-200">
          <p className="text-default-500 text-lg font-medium">Belum ada data laporan penjualan.</p>
          <p className="text-default-400 text-sm">Tambahkan data di halaman Penjualan untuk melihat ringkasan di sini.</p>
          <Button 
            as={Link} 
            href="/Penjualan" 
            color="primary" 
            variant="flat" 
            className="mt-4"
          >
            Ke Halaman Penjualan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((payment: any) => (
            <Card key={payment.id} className="bg-default-50 shadow-md">
              <CardBody className="p-5 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">{payment.hari}</span>
                    <span className="text-sm text-default-500">
                      {payment.tanggal} {payment.bulan} {payment.tahun}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-primary">{payment.cabang}</span>
                </div>
                <Divider />
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-default-600">Qris</span>
                    <span className="text-lg font-semibold text-primary">
                      {formatCurrency(payment.qris)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-default-600">Cash</span>
                    <span className="text-lg font-semibold text-success">
                      {formatCurrency(payment.cash)}
                    </span>
                  </div>
                  {payment.gojek > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-default-600">Gojek</span>
                      <span className="text-lg font-semibold text-warning">
                        {formatCurrency(payment.gojek)}
                      </span>
                    </div>
                  )}
                  {payment.grab > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-default-600">Grab</span>
                      <span className="text-lg font-semibold text-secondary">
                        {formatCurrency(payment.grab)}
                      </span>
                    </div>
                  )}
                  {payment.shopeefood > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-default-600">ShopeeFood</span>
                      <span className="text-lg font-semibold text-danger">
                        {formatCurrency(payment.shopeefood)}
                      </span>
                    </div>
                  )}
                </div>
                <Divider />
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold">
                    {formatCurrency(payment.qris + payment.cash + payment.gojek + payment.grab + payment.shopeefood)}
                  </span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

