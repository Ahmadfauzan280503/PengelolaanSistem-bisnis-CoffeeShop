"use client";
import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  Input, 
  Button, 
  Tooltip,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import Link from "next/link";
import { EditIcon } from "@/components/icons/table/edit-icon";
import { EyeIcon } from "@/components/icons/table/eye-icon";
import { DeleteIcon } from "@/components/icons/table/delete-icon";
import { Trash2, Search, Info, Edit, Package, Calendar, AlertTriangle } from "lucide-react";
import { AddReport } from "./add-report";
import { supabase } from "@/lib/supabase";

export const ReportBarang = () => {
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBranch, setActiveBranch] = useState("Sultan Alauddin");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  
  const branches = ["Sultan Alauddin", "Minasaupa", "HERTASNING", "Antang", "Pusat"];

  const { isOpen: isDeleteOpen, onOpen: openDelete, onOpenChange: onDeleteChange } = useDisclosure();
  const { isOpen: isDetailsOpen, onOpen: openDetails, onOpenChange: onDetailsChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: openEdit, onOpenChange: onEditChange } = useDisclosure();
  
  const [mounted, setMounted] = useState(false);

  // Form state for editing
  const [editFormData, setEditFormData] = useState<any>(null);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("laporan_stok_harian")
      .select("*")
      .eq("tipe_laporan", "Data Laporan Bahan Yang Rusak")
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Map database columns to the component's expected format
      const formattedData = data.map((item: any) => ({
        id: item.id,
        name: item.nama_bahan || "N/A",
        category: item.kategori || "Bahan Baku",
        quantity: item.jumlah || "0",
        reason: item.alasan || "N/A",
        date: item.tanggal,
        status: item.status || "Dilaporkan",
        cabang: item.cabang || "Pusat",
      }));
      setReportData(formattedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    setMounted(true);
    fetchReports();

    // Subscribe to changes
    const channel = supabase
      .channel("report_barang_changes")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "laporan_stok_harian",
          filter: "tipe_laporan=eq.Data Laporan Bahan Yang Rusak" 
        },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!mounted) return null;

  const handleAddReport = async (newReport: any) => {
    // This function can be kept for manual adding, but now it should save to Supabase
    const { error } = await supabase.from("laporan_stok_harian").insert([{
      tanggal: newReport.date,
      nama_bahan: newReport.name,
      kategori: newReport.category,
      jumlah: newReport.quantity,
      alasan: newReport.reason,
      status: newReport.status,
      tipe_laporan: "Data Laporan Bahan Yang Rusak",
      karyawan: "Admin", // Default for manual entries
      cabang: activeBranch, // Save to current active branch
    }]);

    if (!error) {
      fetchReports();
    }
  };

  const handleOpenDelete = (report: any) => {
    setSelectedReport(report);
    openDelete();
  };

  const handleOpenDetails = (report: any) => {
    setSelectedReport(report);
    openDetails();
  };

  const handleOpenEdit = (report: any) => {
    setSelectedReport(report);
    setEditFormData({ ...report });
    openEdit();
  };

  const handleDelete = async () => {
    if (selectedReport) {
      const { error } = await supabase
        .from("laporan_stok_harian")
        .delete()
        .eq("id", selectedReport.id);
      
      if (!error) {
        setReportData((prev) => prev.filter((item) => item.id !== selectedReport.id));
      }
    }
  };

  const handleUpdateReport = async () => {
    if (editFormData) {
      const { error } = await supabase
        .from("laporan_stok_harian")
        .update({
          nama_bahan: editFormData.name,
          kategori: editFormData.category,
          jumlah: editFormData.quantity,
          alasan: editFormData.reason,
          status: editFormData.status,
        })
        .eq("id", editFormData.id);

      if (!error) {
        setReportData((prev) => 
          prev.map((item) => item.id === editFormData.id ? editFormData : item)
        );
        onEditChange();
      }
    }
  };

  const filteredData = reportData.filter((item) =>
    (activeBranch === "Semua" || item.cabang === activeBranch) &&
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.reason.toLowerCase().includes(searchQuery.toLowerCase()))
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
          <span>Bahan Rusak</span>
        </li>
      </ul>

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

      <div className="flex justify-between flex-wrap gap-4 items-center bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-3 w-full md:max-w-md">
          <Input
            placeholder="Cari bahan rusak..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            isClearable
            onClear={() => setSearchQuery("")}
            startContent={<Search size={18} className="text-default-400" />}
            classNames={{
              inputWrapper: "bg-neutral-100 dark:bg-neutral-800",
            }}
          />
        </div>
        <div className="flex flex-row gap-3.5 flex-wrap">
          <AddReport onAddReport={handleAddReport} />
        </div>
      </div>

      <div className="max-w-[95rem] mx-auto w-full">
        <Table 
          aria-label="Table Bahan Rusak"
          classNames={{
            wrapper: "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm",
            th: "bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold",
          }}
        >
          <TableHeader>
            <TableColumn>NAMA BAHAN</TableColumn>
            <TableColumn>KATEGORI</TableColumn>
            <TableColumn>JUMLAH</TableColumn>
            <TableColumn>ALASAN</TableColumn>
            <TableColumn>TANGGAL</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn align="center">AKSI</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Tidak ada laporan bahan rusak">
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-semibold">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.reason}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>
                  <Chip 
                    color={item.status === "Selesai" ? "success" : "warning"} 
                    variant="flat" 
                    size="sm"
                  >
                    {item.status}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4 justify-center">
                    <Tooltip content="Details">
                      <button onClick={() => handleOpenDetails(item)}>
                        <EyeIcon size={20} fill="#979797" />
                      </button>
                    </Tooltip>
                    <Tooltip content="Edit" color="warning">
                      <button onClick={() => handleOpenEdit(item)}>
                        <EditIcon size={20} fill="#979797" />
                      </button>
                    </Tooltip>
                    <Tooltip content="Delete" color="danger">
                      <button onClick={() => handleOpenDelete(item)}>
                        <DeleteIcon size={20} fill="#FF0080" />
                      </button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Details Modal */}
      <Modal isOpen={isDetailsOpen} onOpenChange={onDetailsChange} backdrop="blur" size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex gap-2 items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Info className="text-primary" size={20} />
                </div>
                <span>Detail Bahan Rusak</span>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Package size={20} className="text-neutral-400" />
                      <span className="text-sm font-medium">Nama Bahan</span>
                    </div>
                    <span className="font-bold">{selectedReport?.name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Search size={20} className="text-neutral-400" />
                      <span className="text-sm font-medium">Kategori</span>
                    </div>
                    <span className="text-sm">{selectedReport?.category}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Package size={20} className="text-neutral-400" />
                      <span className="text-sm font-medium">Jumlah</span>
                    </div>
                    <span className="text-sm font-semibold">{selectedReport?.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar size={20} className="text-neutral-400" />
                      <span className="text-sm font-medium">Tanggal</span>
                    </div>
                    <span className="text-sm">{selectedReport?.date}</span>
                  </div>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle size={20} className="text-neutral-400" />
                      <span className="text-sm font-medium">Alasan Kerusakan</span>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 pl-8 italic">
                      {selectedReport?.reason}
                    </p>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <span className="text-sm font-medium">Status</span>
                    <Chip 
                      color={selectedReport?.status === "Selesai" ? "success" : "warning"} 
                      variant="shadow"
                    >
                      {selectedReport?.status}
                    </Chip>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>Tutup</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditChange} backdrop="blur" size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex gap-2 items-center">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Edit className="text-warning" size={20} />
                </div>
                <span>Edit Laporan</span>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="space-y-4">
                  <Input
                    label="Nama Bahan"
                    variant="bordered"
                    value={editFormData?.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  />
                  <Select 
                    label="Kategori"
                    variant="bordered"
                    selectedKeys={editFormData ? [editFormData.category] : []}
                    onSelectionChange={(keys) => setEditFormData({...editFormData, category: Array.from(keys)[0] as string})}
                  >
                    <SelectItem key="Bahan Baku" value="Bahan Baku">Bahan Baku</SelectItem>
                    <SelectItem key="Bahan Tambahan" value="Bahan Tambahan">Bahan Tambahan</SelectItem>
                    <SelectItem key="Kemasan" value="Kemasan">Kemasan</SelectItem>
                  </Select>
                  <Input
                    label="Jumlah"
                    variant="bordered"
                    value={editFormData?.quantity}
                    onChange={(e) => setEditFormData({...editFormData, quantity: e.target.value})}
                  />
                  <Textarea
                    label="Alasan Kerusakan"
                    variant="bordered"
                    value={editFormData?.reason}
                    onChange={(e) => setEditFormData({...editFormData, reason: e.target.value})}
                  />
                  <Select 
                    label="Status"
                    variant="bordered"
                    selectedKeys={editFormData ? [editFormData.status] : []}
                    onSelectionChange={(keys) => setEditFormData({...editFormData, status: Array.from(keys)[0] as string})}
                  >
                    <SelectItem key="Dilaporkan" value="Dilaporkan">Dilaporkan</SelectItem>
                    <SelectItem key="Selesai" value="Selesai">Selesai</SelectItem>
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button color="warning" className="text-white shadow-lg shadow-warning/30 font-semibold" onPress={handleUpdateReport}>
                  Simpan Perubahan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onOpenChange={onDeleteChange} backdrop="blur" size="sm">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-danger">Konfirmasi Hapus</ModalHeader>
              <ModalBody className="py-6 text-center">
                <div className="flex justify-center mb-4">
                    <div className="p-4 bg-danger/10 rounded-full">
                        <Trash2 size={40} className="text-danger" />
                    </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Apakah Anda yakin ingin menghapus laporan <span className="font-bold text-neutral-900 dark:text-white">{selectedReport ? selectedReport.name : ""}</span>? 
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button 
                  color="danger" 
                  className="shadow-lg shadow-danger/30 font-semibold"
                  onPress={() => {
                    handleDelete();
                    onClose();
                  }}
                >
                  Ya, Hapus
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
