"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardBody, CardHeader, Divider, Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from "@nextui-org/react";
import { Wallet, DollarSign, ArrowUpRight, CheckCircle2 } from "lucide-react";

export const LaporanPenjualan = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    // Ambil order yang sudah selesai atau terbayar
    const { data, error } = await supabase
      .from("cashier_orders")
      .select("*")
      .in("order_status", ["COMPLETED"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sales:", error);
    } else if (data) {
      setSales(data);
    }
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Kalkulasi Pendapatan
  const totalGross = sales.reduce((sum, order) => sum + (order.total_price || 0), 0);
  const totalNet = sales.reduce((sum, order) => sum + (order.subtotal || 0), 0); // asumsi net adalah tanpa pajak/service
  const totalTax = sales.reduce((sum, order) => sum + (order.tax || 0), 0);
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-gray-800">Laporan Penjualan (Staf Finance)</h1>
        <p className="text-sm text-gray-500 font-medium">Ringkasan transaksi bersih dan kotor dari seluruh cabang KOTACOFFEE.ID.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Spinner size="lg" color="success" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="shadow-sm border border-gray-100 bg-white">
              <CardBody className="flex flex-row items-center gap-4 p-6">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Penjualan Kotor (Gross)</p>
                  <h2 className="text-2xl font-black text-gray-800 mt-1">{formatCurrency(totalGross)}</h2>
                </div>
              </CardBody>
            </Card>

            <Card className="shadow-sm border border-gray-100 bg-white">
              <CardBody className="flex flex-row items-center gap-4 p-6">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Penjualan Bersih (Net)</p>
                  <h2 className="text-2xl font-black text-gray-800 mt-1">{formatCurrency(totalNet)}</h2>
                </div>
              </CardBody>
            </Card>

            <Card className="shadow-sm border border-gray-100 bg-white">
              <CardBody className="flex flex-row items-center gap-4 p-6">
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                  <ArrowUpRight size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pajak (PB1) & Layanan</p>
                  <h2 className="text-2xl font-black text-gray-800 mt-1">{formatCurrency(totalTax + (sales.reduce((s,o)=>s+(o.service_charge||0),0)))}</h2>
                </div>
              </CardBody>
            </Card>
          </div>

          <Card className="shadow-sm border border-gray-100">
            <CardHeader className="px-6 py-4">
              <h3 className="text-lg font-black text-gray-800">Riwayat Penjualan Selesai</h3>
            </CardHeader>
            <Divider />
            <CardBody className="p-0">
              <Table aria-label="Tabel laporan penjualan" shadow="none" classNames={{ wrapper: "rounded-none" }}>
                <TableHeader>
                  <TableColumn className="bg-gray-50 font-black text-gray-500 uppercase">Order ID</TableColumn>
                  <TableColumn className="bg-gray-50 font-black text-gray-500 uppercase">Cabang</TableColumn>
                  <TableColumn className="bg-gray-50 font-black text-gray-500 uppercase">Pelanggan</TableColumn>
                  <TableColumn className="bg-gray-50 font-black text-gray-500 uppercase">Metode</TableColumn>
                  <TableColumn className="bg-gray-50 font-black text-gray-500 uppercase">Total (Gross)</TableColumn>
                  <TableColumn className="bg-gray-50 font-black text-gray-500 uppercase">Status</TableColumn>
                </TableHeader>
                <TableBody emptyContent={"Belum ada data penjualan tercatat."}>
                  {sales.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-mono text-xs font-bold">#{order.order_number?.slice(-8) || order.id?.slice(-8)}</TableCell>
                      <TableCell className="font-semibold text-gray-700">{order.cabang || "Pusat"}</TableCell>
                      <TableCell className="font-bold">{order.customer_name || "-"}</TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="warning" className="font-extrabold text-[10px] uppercase">
                          {order.payment_method || "QRIS"}
                        </Chip>
                      </TableCell>
                      <TableCell className="font-black text-gray-800">{formatCurrency(order.total_price)}</TableCell>
                      <TableCell>
                        <Chip size="sm" color="success" variant="flat" startContent={<CheckCircle2 size={12}/>} className="font-black uppercase tracking-wider text-[9px]">
                          COMPLETED
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
};
