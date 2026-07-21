"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Input,
  Button,
  Chip,
  Divider,
  Spinner,
} from "@nextui-org/react";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import Link from "next/link";
import {
  ClipboardEdit,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Package,
  TrendingDown,
  ShieldCheck,
  Calendar,
  User,
  MapPin,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface LaporanStok {
  id: string;
  tanggal: string;
  cabang: string;
  karyawan: string;
  tipe_laporan: string;
  susu_diamond: number;
  susu_greenfield: number;
  bubuk_coklat: number;
  bubuk_matcha: number;
  bubuk_redvelvet: number;
  bubuk_taro: number;
  created_at: string;
}

interface ItemStatus {
  name: string;
  sisa: number;
  stokAwal: number;
  satuan: string;
  image: string;
}

const STOK_AWAL_CONFIG = {
  susu_diamond: 10,
  susu_greenfield: 10,
  bubuk_coklat: 1000,
  bubuk_matcha: 1000,
  bubuk_redvelvet: 1000,
  bubuk_taro: 1000,
};

const IMAGE_CONFIG = {
  susu_diamond: "/daftar bahan/Susu Oatside.jpg", // Placeholder
  susu_greenfield: "/daftar bahan/Susu Oatside.jpg", // Placeholder
  bubuk_coklat: "/daftar bahan/Bubuk Chocolate.jpg",
  bubuk_matcha: "/daftar bahan/Bubuk macha.jpg",
  bubuk_redvelvet: "/daftar bahan/Bubuk Chocolate.jpg", // Placeholder
  bubuk_taro: "/daftar bahan/Bubuk Chocolate.jpg", // Placeholder
};

export const SisaStok = () => {
  const [reports, setReports] = useState<Record<string, LaporanStok>>({});
  const [activeBranch, setActiveBranch] = useState("Sultan Alauddin");
  const [loading, setLoading] = useState(true);

  const branches = ["Sultan Alauddin", "Minasaupa", "HERTASNING", "Antang"];

  const fetchLatestPerBranch = async () => {
    setLoading(true);
    const results: Record<string, LaporanStok> = {};
    
    // Fetch latest for each branch
    for (const branch of branches) {
      const { data, error } = await supabase
        .from("laporan_stok_harian")
        .select("*")
        .eq("tipe_laporan", "Laporan Sisa Stok Bahan")
        .eq("cabang", branch)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        results[branch] = data;
      }
    }
    
    setReports(results);
    setLoading(false);
  };

  useEffect(() => {
    fetchLatestPerBranch();

    // Subscribe to changes
    const channel = supabase
      .channel("laporan_stok_changes")
      .on(
        "postgres_changes",
        { 
          event: "INSERT", 
          schema: "public", 
          table: "laporan_stok_harian",
          filter: "tipe_laporan=eq.Laporan Sisa Stok Bahan"
        },
        (payload) => {
          const newReport = payload.new as LaporanStok;
          setReports(prev => ({
            ...prev,
            [newReport.cabang]: newReport
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const latestReport = reports[activeBranch];

  const items: ItemStatus[] = useMemo(() => {
    if (!latestReport) return [];
    return [
      { name: "Susu Diamond", sisa: latestReport.susu_diamond, stokAwal: STOK_AWAL_CONFIG.susu_diamond, satuan: "liter", image: IMAGE_CONFIG.susu_diamond },
      { name: "Susu Greenfield", sisa: latestReport.susu_greenfield, stokAwal: STOK_AWAL_CONFIG.susu_greenfield, satuan: "liter", image: IMAGE_CONFIG.susu_greenfield },
      { name: "Bubuk Coklat", sisa: latestReport.bubuk_coklat, stokAwal: STOK_AWAL_CONFIG.bubuk_coklat, satuan: "gram", image: IMAGE_CONFIG.bubuk_coklat },
      { name: "Bubuk Matcha", sisa: latestReport.bubuk_matcha, stokAwal: STOK_AWAL_CONFIG.bubuk_matcha, satuan: "gram", image: IMAGE_CONFIG.bubuk_matcha },
      { name: "Bubuk Redvelvet", sisa: latestReport.bubuk_redvelvet, stokAwal: STOK_AWAL_CONFIG.bubuk_redvelvet, satuan: "gram", image: IMAGE_CONFIG.bubuk_redvelvet },
      { name: "Bubuk Taro", sisa: latestReport.bubuk_taro, stokAwal: STOK_AWAL_CONFIG.bubuk_taro, satuan: "gram", image: IMAGE_CONFIG.bubuk_taro },
    ];
  }, [latestReport]);

  const getPercentUsed = (item: ItemStatus) => {
    if (item.stokAwal === 0) return 0;
    return ((item.stokAwal - item.sisa) / item.stokAwal) * 100;
  };

  const getStatus = (item: ItemStatus) => {
    const pct = getPercentUsed(item);
    if (pct >= 80) return { label: "Kritis", color: "danger" as const, icon: XCircle, bgGradient: "from-red-500/10 to-red-500/5" };
    if (pct >= 50) return { label: "Hampir Habis", color: "warning" as const, icon: AlertTriangle, bgGradient: "from-amber-500/10 to-amber-500/5" };
    return { label: "Aman", color: "success" as const, icon: CheckCircle2, bgGradient: "from-emerald-500/10 to-emerald-500/5" };
  };

  const getProgressColor = (item: ItemStatus) => {
    const pct = getPercentUsed(item);
    if (pct >= 80) return "bg-gradient-to-r from-red-500 to-rose-400";
    if (pct >= 50) return "bg-gradient-to-r from-amber-500 to-yellow-400";
    return "bg-gradient-to-r from-emerald-500 to-teal-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" label="Memuat data stok terbaru..." color="primary" />
      </div>
    );
  }

  return (
    <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
      {/* Breadcrumb */}
      <ul className="flex">
        <li className="flex gap-2">
          <HouseIcon />
          <Link href={"/"}>
            <span>Home</span>
          </Link>
          <span> / </span>{" "}
        </li>
        <li className="flex gap-2 text-primary">
          <span>Sisa Stok Bahan (Real-time)</span>
        </li>
      </ul>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-bold">Sisa Stok Bahan</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Status stok real-time berdasarkan laporan terbaru dari Google Form
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            as={Link}
            href="https://forms.gle/akXKhoyJTNFeHLxj8"
            target="_blank"
            size="sm"
            className="rounded-full font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
            startContent={<ClipboardEdit className="w-3.5 h-3.5" />}
          >
            Isi Laporan Baru
          </Button>
        </div>
      </div>

      {/* Branch Selector */}
      <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        {branches.map((branch) => (
          <Button
            key={branch}
            size="sm"
            variant={activeBranch === branch ? "solid" : "light"}
            color={activeBranch === branch ? "primary" : "default"}
            className={`rounded-full font-bold transition-all duration-300 ${
              activeBranch === branch ? "shadow-lg shadow-primary/30" : ""
            }`}
            onClick={() => setActiveBranch(branch)}
          >
            {branch}
          </Button>
        ))}
      </div>

      {/* Latest Report Info */}
      {latestReport ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="flex items-center gap-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl px-4 py-3">
            <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <div>
              <p className="text-[10px] text-sky-600/70 uppercase font-bold tracking-wider">Pelapor</p>
              <p className="text-sm font-bold text-sky-900 dark:text-sky-100">{latestReport.karyawan}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-3">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-[10px] text-indigo-600/70 uppercase font-bold tracking-wider">Tanggal Laporan</p>
              <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">{new Date(latestReport.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-[10px] text-emerald-600/70 uppercase font-bold tracking-wider">Cabang</p>
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">{latestReport.cabang}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-6 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Belum ada data laporan yang masuk.</p>
          <p className="text-xs text-amber-600 mt-1">Silakan isi Google Form untuk melihat status stok di sini.</p>
        </div>
      )}

      {/* Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {items.map((item) => {
          const terpakai = item.stokAwal - item.sisa;
          const percentUsed = getPercentUsed(item);
          const status = getStatus(item);
          const StatusIcon = status.icon;

          return (
            <div
              key={item.name}
              className={`relative overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${status.bgGradient} opacity-50`} />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-sm ring-1 ring-neutral-200 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <Chip
                    size="sm"
                    color={status.color}
                    variant="flat"
                    className="font-bold text-[10px]"
                    startContent={<StatusIcon className="w-3 h-3 ml-1" />}
                  >
                    {status.label}
                  </Chip>
                </div>

                <h4 className="text-lg font-black text-neutral-900 dark:text-white mb-1">
                  {item.name}
                </h4>
                
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Sisa Stok</p>
                    <p className="text-2xl font-black text-neutral-900 dark:text-white">
                      {item.sisa.toLocaleString("id-ID")} <span className="text-xs font-normal text-neutral-400">{item.satuan}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Keep the file clean, removing the dummy Button at the end if it was there

