"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Button, Input, Tooltip, useDisclosure, Spinner, Select, SelectItem } from "@nextui-org/react";
import Link from "next/link";
import { DotsIcon } from "@/components/icons/accounts/dots-icon";
import { ExportIcon } from "@/components/icons/accounts/export-icon";
import { InfoIcon } from "@/components/icons/accounts/info-icon";
import { TrashIcon } from "@/components/icons/accounts/trash-icon";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import { UsersIcon } from "@/components/icons/breadcrumb/users-icon";
import { SettingsIcon } from "@/components/icons/sidebar/settings-icon";
import { SalesTable } from "./sales-table";
import { supabase } from "@/lib/supabase";
import { SaleModal } from "./sale-modal";
import { CustomAlert } from "../ui/custom-alert";
import { ConfirmModal } from "../ui/confirm-modal";

const branches = [
  "Kota Coffee (Sultan Alauddin)",
  "Kota Coffee (Minasaupa)",
  "Kota Coffee (Hertasning)",
  "Kota Coffee (Antang)",
  "Kota Coffee (Tamalate)",
  "Kota Coffee (Veteran)",
  "Kota Coffee (Ratualangi)",
  "Kota Coffee (Perintis)",
  "Kota Coffee (BTP)",
  "Kota Coffee (Cendrawasih)",
];

export const Accounts = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newSale, setNewSale] = useState<any>({
    tanggal: new Date().toISOString().split("T")[0],
    cabang: "",
    kasir: "",
    cash: "",
    gojek_kotacoffee: "",
    grab_kotacoffee: "",
    shopeefood_kotacoffee: "",
    qris_kotacoffee: "",
    pengeluaran: "",
  });

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");

  // Deletion Modal State
  const { 
    isOpen: isConfirmOpen, 
    onOpen: onConfirmOpen, 
    onOpenChange: onConfirmOpenChange 
  } = useDisclosure();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Alert State
  const [alertConfig, setAlertConfig] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  const showAlert = (message: string, type: "success" | "error" | "info" = "success") => {
    setAlertConfig({ isVisible: true, message, type });
  };

  const fetchSales = useCallback(async () => {
    setLoading(true);
    const { data: sales, error } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching sales:", error);
      showAlert("Gagal mengambil data dari database", "error");
    } else {
      setData(sales || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleAddSale = async () => {
    if (!newSale.cabang) return showAlert("Cabang wajib dipilih!", "error");
    if (!newSale.kasir) return showAlert("Nama Kasir wajib diisi!", "error");
    
    const p_kotor = Number(newSale.cash) + Number(newSale.gojek_kotacoffee) + 
                    Number(newSale.grab_kotacoffee) + Number(newSale.shopeefood_kotacoffee) + 
                    Number(newSale.qris_kotacoffee);
    const k_bersih = p_kotor - Number(newSale.pengeluaran);

    const { error } = await supabase.from("sales").insert([
      { ...newSale, pendapatan_kotor: p_kotor, kas_bersih: k_bersih }
    ]);

    if (error) {
      showAlert("Gagal menyimpan laporan: " + error.message, "error");
    } else {
      showAlert("Laporan berhasil disimpan secara permanen!", "success");
      setNewSale({
        tanggal: new Date().toISOString().split("T")[0],
        cabang: "",
        kasir: "",
        cash: "",
        gojek_kotacoffee: "",
        grab_kotacoffee: "",
        shopeefood_kotacoffee: "",
        qris_kotacoffee: "",
        pengeluaran: "",
      });
      fetchSales();
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    onConfirmOpen();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from("sales").delete().eq("id", deleteId);
    if (error) {
      showAlert("Gagal menghapus laporan: " + error.message, "error");
    } else {
      showAlert("Laporan berhasil dihapus", "success");
      setData((prev) => prev.filter((item) => item.id !== deleteId));
    }
    setDeleteId(null);
  };

  const handleEdit = (sale: any) => {
    setSelectedSale(sale);
    setModalMode("edit");
    onOpen();
  };

  const handleView = (sale: any) => {
    setSelectedSale(sale);
    setModalMode("view");
    onOpen();
  };

  const handleUpdate = async (updatedSale: any) => {
    const p_kotor = Number(updatedSale.cash) + Number(updatedSale.gojek_kotacoffee) + 
                    Number(updatedSale.grab_kotacoffee) + Number(updatedSale.shopeefood_kotacoffee) + 
                    Number(updatedSale.qris_kotacoffee);
    const k_bersih = p_kotor - Number(updatedSale.pengeluaran);

    const { error } = await supabase
      .from("sales")
      .update({ ...updatedSale, pendapatan_kotor: p_kotor, kas_bersih: k_bersih })
      .eq("id", updatedSale.id);

    if (error) {
      showAlert("Gagal memperbarui: " + error.message, "error");
    } else {
      showAlert("Laporan berhasil diperbarui!", "success");
      fetchSales();
    }
  };

  const filteredData = data.filter((item) => 
    item.kasir.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tanggal.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <li className="flex gap-2 text-primary">
          <span>Laporan Penjualan</span>
        </li>
      </ul>

      <h3 className="text-2xl font-bold">Laporan Penjualan</h3>

      {/* Input Section - Separated */}
      <div className="bg-default-50 rounded-xl p-6 border border-default-200 shadow-sm">
        <h4 className="text-lg font-semibold mb-4">Input Data Penjualan Baru</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input 
            label="Tanggal" 
            variant="flat" 
            type="date" 
            value={newSale.tanggal}
            onChange={(e) => setNewSale({...newSale, tanggal: e.target.value})}
          />
          <Select 
            label="Pilih Cabang" 
            variant="flat"
            selectedKeys={newSale.cabang ? [newSale.cabang] : []}
            onChange={(e) => setNewSale({...newSale, cabang: e.target.value})}
          >
            {branches.map((branch) => (
              <SelectItem key={branch} value={branch}>
                {branch}
              </SelectItem>
            ))}
          </Select>
          <Input 
            label="Nama Kasir" 
            variant="flat" 
            value={newSale.kasir}
            onChange={(e) => setNewSale({...newSale, kasir: e.target.value})}
          />
          <Input 
            label="Cash" 
            variant="flat" 
            type="number" 
            startContent="Rp" 
            value={newSale.cash}
            onChange={(e) => setNewSale({...newSale, cash: e.target.value})}
          />
          <Input 
            label="Gojek (Kota coffee)" 
            variant="flat" 
            type="number" 
            startContent="Rp" 
            value={newSale.gojek_kotacoffee}
            onChange={(e) => setNewSale({...newSale, gojek_kotacoffee: e.target.value})}
          />
          <Input 
            label="Grab (Kota coffee)" 
            variant="flat" 
            type="number" 
            startContent="Rp" 
            value={newSale.grab_kotacoffee}
            onChange={(e) => setNewSale({...newSale, grab_kotacoffee: e.target.value})}
          />
          <Input 
            label="ShopeeFood (Kota coffee)" 
            variant="flat" 
            type="number" 
            startContent="Rp" 
            value={newSale.shopeefood_kotacoffee}
            onChange={(e) => setNewSale({...newSale, shopeefood_kotacoffee: e.target.value})}
          />
          <Input 
            label="QRIS" 
            variant="flat" 
            type="number" 
            startContent="Rp" 
            value={newSale.qris_kotacoffee}
            onChange={(e) => setNewSale({...newSale, qris_kotacoffee: e.target.value})}
          />
          <Input 
            label="Pengeluaran" 
            variant="flat" 
            type="number" 
            startContent="Rp" 
            value={newSale.pengeluaran}
            onChange={(e) => setNewSale({...newSale, pengeluaran: e.target.value})}
          />
          <div className="flex items-end md:col-span-2 lg:col-span-4">
            <Button 
              color="success" 
              className="w-full text-white font-semibold" 
              variant="shadow"
              onClick={handleAddSale}
            >
              Simpan Laporan Ke Database
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-between flex-wrap gap-4 items-center mt-6">
        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
          <Input
            classNames={{
              input: "w-full",
              mainWrapper: "w-full",
            }}
            placeholder="Search by Kasir or Date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Tooltip content="Settings">
            <button className="hover:opacity-50 transition-opacity"><SettingsIcon /></button>
          </Tooltip>
          <Tooltip content="Delete selected" color="danger">
            <button className="hover:opacity-50 transition-opacity"><TrashIcon /></button>
          </Tooltip>
          <Tooltip content="Information">
            <button className="hover:opacity-50 transition-opacity"><InfoIcon /></button>
          </Tooltip>
          <Tooltip content="More options">
            <button className="hover:opacity-50 transition-opacity"><DotsIcon /></button>
          </Tooltip>
        </div>
        <div className="flex flex-row gap-3.5 flex-wrap">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                console.log("File selected:", file.name);
              }
            }}
          />
          <Button
            color="secondary"
            variant="flat"
            startContent={<ExportIcon />}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            Impor dari Excel
          </Button>
        </div>
      </div>

      <div className="max-w-[95rem] mx-auto w-full">
        {loading ? (
          <div className="flex justify-center p-10"><Spinner label="Loading data from Supabase..." /></div>
        ) : (
          <SalesTable 
            data={filteredData} 
            onDelete={handleDelete}
            onEdit={handleEdit}
            onView={handleView}
          />
        )}
      </div>

      <SaleModal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange} 
        sale={selectedSale} 
        mode={modalMode}
        onSave={handleUpdate}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onOpenChange={onConfirmOpenChange} 
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus laporan ini secara permanen dari database?"
        onConfirm={confirmDelete}
      />

      <CustomAlert 
        isVisible={alertConfig.isVisible}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ ...alertConfig, isVisible: false })}
      />
    </div>
  );
};
