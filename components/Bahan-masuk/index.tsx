"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from "@nextui-org/react";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import Link from "next/link";
import {
  FileText,
  Calendar,
  User,
  Eye,
  Trash2,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3,
  Download,
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

const STOK_AWAL_CONFIG = {
  susu_diamond: 10,
  susu_greenfield: 10,
  bubuk_coklat: 1000,
  bubuk_matcha: 1000,
  bubuk_redvelvet: 1000,
  bubuk_taro: 1000,
};

export const BahanMasuk = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [laporanList, setLaporanList] = useState<LaporanStok[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBranch, setActiveBranch] = useState("Sultan Alauddin");
  const [selectedLaporan, setSelectedLaporan] = useState<LaporanStok | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const branches = ["Sultan Alauddin", "Minasaupa", "HERTASNING", "Antang"];

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();

  const fetchLaporan = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("laporan_stok_harian")
      .select("*")
      .eq("tipe_laporan", "Laporan Bahan masuk")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLaporanList(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLaporan();

    // Subscribe to changes
    const channel = supabase
      .channel("laporan_stok_history_changes")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "laporan_stok_harian",
          filter: "tipe_laporan=eq.Laporan Bahan masuk" 
        },
        () => {
          fetchLaporan();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredLaporan = laporanList.filter(l => activeBranch === "Semua" || l.cabang === activeBranch);

  const handleViewDetail = (laporan: LaporanStok) => {
    setSelectedLaporan(laporan);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      const { error } = await supabase
        .from("laporan_stok_harian")
        .delete()
        .eq("id", deleteTarget);
      
      if (!error) {
        setLaporanList((prev) => prev.filter((l) => l.id !== deleteTarget));
      }
      setDeleteTarget(null);
    }
  };

  const handleExportCSV = () => {
    if (laporanList.length === 0) return;
    let csv = "ID,Tanggal,Cabang,Karyawan,Susu Diamond,Susu Greenfield,Bubuk Coklat,Bubuk Matcha,Bubuk Redvelvet,Bubuk Taro\n";
    laporanList.forEach((l) => {
      csv += `${l.id},${l.tanggal},${l.cabang},${l.karyawan},${l.susu_diamond},${l.susu_greenfield},${l.bubuk_coklat},${l.bubuk_matcha},${l.bubuk_redvelvet},${l.bubuk_taro}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-stok-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatus = (sisa: number, awal: number) => {
    const terpakai = awal - sisa;
    const pct = (terpakai / awal) * 100;
    if (pct >= 80) return { label: "Kritis", color: "danger" as const, icon: XCircle };
    if (pct >= 50) return { label: "Hampir Habis", color: "warning" as const, icon: AlertTriangle };
    return { label: "Aman", color: "success" as const, icon: CheckCircle2 };
  };

  if (loading && laporanList.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" label="Memuat riwayat laporan..." color="primary" />
      </div>
    );
  }

  return (
    <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
      {/* Breadcrumb */}
      <ul className="flex">
        <li className="flex gap-2">
          <HouseIcon />
          <Link href={"/"}><span>Home</span></Link>
          <span> / </span>{" "}
        </li>
        <li className="flex gap-2 text-primary">
          <span>Laporan Bahan Masuk</span>
        </li>
      </ul>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-bold">Laporan Bahan Masuk</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Daftar seluruh laporan bahan masuk dari Google Form secara otomatis
          </p>
        </div>
        <Button
          size="sm"
          className="rounded-full font-semibold bg-emerald-600 text-white"
          onPress={handleExportCSV}
          startContent={<Download className="w-3.5 h-3.5" />}
          isDisabled={laporanList.length === 0}
        >
          Export CSV
        </Button>
      </div>

      {/* Branch Selector */}
      <div className="flex flex-wrap gap-2 p-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        {["Semua", ...branches].map((branch) => (
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

      {/* Reports List */}
      {filteredLaporan.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredLaporan.map((laporan, idx) => (
            <div
              key={laporan.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold flex-shrink-0">
                    #{filteredLaporan.length - idx}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                      Laporan Harian - {laporan.cabang}
                    </h4>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {laporan.karyawan}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(laporan.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    className="rounded-full font-semibold"
                    onPress={() => handleViewDetail(laporan)}
                    startContent={<Eye className="w-3.5 h-3.5" />}
                  >
                    Detail
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    className="rounded-full font-semibold"
                    isIconOnly
                    onPress={() => {
                      setDeleteTarget(laporan.id);
                      onDeleteOpen();
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
          <BarChart3 className="w-14 h-14 text-neutral-300 dark:text-neutral-600 mb-3" />
          <p className="text-neutral-500 font-medium">Belum ada laporan yang masuk</p>
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-bold">Detail Laporan</h3>
                <p className="text-xs text-neutral-500 font-normal">
                  Data sisa stok yang dilaporkan oleh {selectedLaporan?.karyawan}
                </p>
              </ModalHeader>
              <ModalBody className="py-4">
                {selectedLaporan && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl">
                       <div>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Cabang</p>
                          <p className="text-sm font-bold">{selectedLaporan.cabang}</p>
                       </div>
                       <div>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Tanggal</p>
                          <p className="text-sm font-bold">{selectedLaporan.tanggal}</p>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <p className="text-xs font-bold text-neutral-500 px-2 uppercase">Daftar Bahan</p>
                       {[
                         { name: "Susu Diamond", value: selectedLaporan.susu_diamond, awal: STOK_AWAL_CONFIG.susu_diamond, unit: "liter" },
                         { name: "Susu Greenfield", value: selectedLaporan.susu_greenfield, awal: STOK_AWAL_CONFIG.susu_greenfield, unit: "liter" },
                         { name: "Bubuk Coklat", value: selectedLaporan.bubuk_coklat, awal: STOK_AWAL_CONFIG.bubuk_coklat, unit: "gram" },
                         { name: "Bubuk Matcha", value: selectedLaporan.bubuk_matcha, awal: STOK_AWAL_CONFIG.bubuk_matcha, unit: "gram" },
                         { name: "Bubuk Redvelvet", value: selectedLaporan.bubuk_redvelvet, awal: STOK_AWAL_CONFIG.bubuk_redvelvet, unit: "gram" },
                         { name: "Bubuk Taro", value: selectedLaporan.bubuk_taro, awal: STOK_AWAL_CONFIG.bubuk_taro, unit: "gram" },
                       ].map((item) => {
                         const status = getStatus(item.value, item.awal);
                         return (
                           <div key={item.name} className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
                             <div>
                               <p className="text-sm font-bold">{item.name}</p>
                               <p className="text-xs text-neutral-400">Sisa: {item.value} {item.unit}</p>
                             </div>
                             <Chip size="sm" color={status.color} variant="flat" className="text-[10px] font-bold">
                               {status.label}
                             </Chip>
                           </div>
                         );
                       })}
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose} className="rounded-full">Tutup</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteOpenChange} size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Hapus Laporan</ModalHeader>
              <ModalBody>
                <p className="text-sm">Apakah Anda yakin ingin menghapus laporan ini?</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>Batal</Button>
                <Button color="danger" onPress={() => { handleDeleteConfirm(); onClose(); }}>Hapus</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
