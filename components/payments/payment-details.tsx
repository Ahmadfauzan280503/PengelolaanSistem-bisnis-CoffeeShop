"use client";
import React, { useEffect, useState, useCallback } from "react";
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  Spinner,
  Card,
  CardBody,
  Divider
} from "@nextui-org/react";
import { supabase } from "@/lib/supabase";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import { UsersIcon } from "@/components/icons/breadcrumb/users-icon";
import Link from "next/link";

interface Props {
  method: "cash" | "gojek" | "grab" | "shopeefood" | "qris";
  title: string;
}

export const PaymentDetails = ({ method, title }: Props) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFilteredSales = useCallback(async () => {
    setLoading(true);
    const { data: sales, error } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sales:", error);
    } else {
      // Filter sales where the specific payment method has a value > 0
      const filtered = (sales || []).filter((item: any) => {
        if (method === "cash") return Number(item.cash) > 0;
        if (method === "gojek") return Number(item.gojek_kotacoffee) > 0;
        if (method === "grab") return Number(item.grab_kotacoffee) > 0;
        if (method === "shopeefood") return Number(item.shopeefood_kotacoffee) > 0;
        if (method === "qris") return Number(item.qris_kotacoffee) > 0;
        return false;
      });
      setData(filtered);
    }
    setLoading(false);
  }, [method]);

  useEffect(() => {
    fetchFilteredSales();
  }, [fetchFilteredSales]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getMethodValue = (item: any) => {
    if (method === "cash") return item.cash;
    if (method === "gojek") return item.gojek_kotacoffee;
    if (method === "grab") return item.grab_kotacoffee;
    if (method === "shopeefood") return item.shopeefood_kotacoffee;
    if (method === "qris") return item.qris_kotacoffee;
    return 0;
  };

  const totalAmount = data.reduce((sum, item) => sum + Number(getMethodValue(item)), 0);

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
          <Link href={"/payments"}>
            <span>Finance</span>
          </Link>
          <span> / </span>{" "}
        </li>
        <li className="flex gap-2">
          <span>Laporan {title}</span>
        </li>
      </ul>

      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Laporan Pembayaran: {title}</h3>
        <Card className="bg-primary text-white px-4 py-2">
          <div className="flex flex-col items-end">
            <span className="text-xs opacity-80 uppercase font-semibold">Total Pendapatan {title}</span>
            <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
          </div>
        </Card>
      </div>

      <div className="bg-default-50 rounded-xl shadow-md overflow-hidden border border-default-200">
        {loading ? (
          <div className="flex justify-center p-10"><Spinner label="Loading data..." /></div>
        ) : (
          <Table aria-label={`Table Laporan ${title}`} className="p-0">
            <TableHeader>
              <TableColumn>TANGGAL</TableColumn>
              <TableColumn>CABANG</TableColumn>
              <TableColumn>KASIR</TableColumn>
              <TableColumn>NOMINAL {title.toUpperCase()}</TableColumn>
            </TableHeader>
            <TableBody emptyContent={`Tidak ada data pembayaran ${title}`}>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.tanggal}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-primary">{item.cabang || "-"}</span>
                  </TableCell>
                  <TableCell>{item.kasir}</TableCell>
                  <TableCell className="font-bold text-success">
                    {formatCurrency(getMethodValue(item))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
