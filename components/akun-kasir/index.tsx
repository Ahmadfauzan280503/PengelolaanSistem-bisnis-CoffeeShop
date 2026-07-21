"use client";
import React, { useState, useEffect } from "react";
import { Input, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner } from "@nextui-org/react";
import { Plus, Trash2, KeyRound, Search, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { AnimatePresence, motion } from "framer-motion";

export const AkunKasir = () => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [newBranch, setNewBranch] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newPin, setNewPin] = useState("");

  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);

  const showToast = (message: string, type: 'error' | 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Ambil data dari Supabase saat komponen dimuat
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('cashier_accounts')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setAccounts(data);
    } else {
      console.error("Gagal mengambil data akun:", error);
    }
    setIsLoading(false);
  };

  const handleAdd = async (onClose: () => void) => {
    if (newName && newBranch && newRole && newPin) {
      const { data, error } = await supabase
        .from('cashier_accounts')
        .insert([
          { name: newName, branch: newBranch, role: newRole, pin: newPin }
        ])
        .select();

      if (!error && data) {
        setAccounts([data[0], ...accounts]);
        setNewName("");
        setNewBranch("");
        setNewRole("");
        setNewPin("");
        onClose();
        showToast("Akun kasir berhasil dibuat!", "success");
      } else {
        showToast("Gagal menambahkan akun kasir.", "error");
      }
    } else {
      showToast("Harap isi semua bidang formulir!", "error");
    }
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from('cashier_accounts')
      .delete()
      .eq('id', id);

    if (!error) {
      setAccounts(accounts.filter(a => a.id !== id));
      showToast("Akun kasir berhasil dihapus!", "success");
    } else {
      showToast("Gagal menghapus akun.", "error");
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 max-w-7xl mx-auto w-full p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase flex items-center gap-3">
          <ShieldCheck className="text-purple-500" size={36} strokeWidth={2.5} />
          Data Akun Kasir
        </h1>
        <p className="text-sm font-bold text-gray-500 tracking-wide uppercase">
          Kelola akses karyawan untuk login ke Dashboard Kasir Cabang
        </p>
      </div>

      {/* Toolbar - Diperbaiki agar responsif di layar kecil */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-3xl border-2 border-gray-100 shadow-sm mt-4 gap-4">
        <div className="w-full sm:max-w-sm flex items-center gap-3 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari akun kasir..." 
            className="bg-transparent border-none outline-none w-full text-sm font-bold text-gray-700 placeholder:text-gray-400"
          />
        </div>
        <Button 
          onPress={onOpen}
          className="w-full sm:w-auto bg-black text-white font-black uppercase text-xs tracking-wider px-6 py-6 rounded-xl hover:-translate-y-1 hover:shadow-lg transition-all"
          startContent={<Plus size={18} strokeWidth={3} />}
        >
          Buat Akun Baru
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-x-auto p-2">
        <Table aria-label="Tabel Akun Kasir" classNames={{
          wrapper: "shadow-none border-none min-w-[600px]",
          th: "bg-gray-50 text-gray-800 font-black tracking-widest text-xs uppercase py-4",
          td: "py-4 font-bold text-gray-700 text-sm",
        }}>
          <TableHeader>
            <TableColumn>NAMA KARYAWAN</TableColumn>
            <TableColumn>CABANG</TableColumn>
            <TableColumn>ROLE AKSES</TableColumn>
            <TableColumn align="center">AKSI</TableColumn>
          </TableHeader>
          <TableBody 
            items={accounts} 
            emptyContent={isLoading ? <Spinner color="secondary" label="Memuat data..." /> : "Belum ada akun kasir terdaftar."}
          >
            {(item) => (
              <TableRow key={item.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center border border-purple-200">
                      <KeyRound size={20} className="text-purple-600" />
                    </div>
                    <span className="font-black text-gray-900">{item.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat" color="secondary" className="font-bold border-none uppercase tracking-wider text-[10px]">
                    {item.branch}
                  </Chip>
                </TableCell>
                <TableCell>{item.role}</TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    <Button isIconOnly variant="light" color="danger" onPress={() => handleDelete(item.id)} className="hover:bg-red-100 rounded-xl">
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} classNames={{ base: "bg-white rounded-3xl border-2 border-gray-200 mx-4" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-100">
                <h3 className="font-black text-xl text-gray-900 uppercase">Tambah Akun Kasir</h3>
              </ModalHeader>
              <ModalBody className="py-6 space-y-4">
                <Input 
                  label="Nama Karyawan" 
                  placeholder="Contoh: Zack Kasir" 
                  variant="bordered"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  classNames={{ 
                    inputWrapper: "rounded-xl border-gray-200 font-bold",
                    input: "text-gray-900 placeholder:text-gray-400",
                    label: "text-gray-700 font-bold"
                  }}
                />
                <Input 
                  label="Penempatan Cabang" 
                  placeholder="Contoh: Sultan Alauddin" 
                  variant="bordered"
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                  classNames={{ 
                    inputWrapper: "rounded-xl border-gray-200 font-bold",
                    input: "text-gray-900 placeholder:text-gray-400",
                    label: "text-gray-700 font-bold"
                  }}
                />
                <Input 
                  label="Role (Jabatan)" 
                  placeholder="Contoh: Head Barista" 
                  variant="bordered"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  classNames={{ 
                    inputWrapper: "rounded-xl border-gray-200 font-bold",
                    input: "text-gray-900 placeholder:text-gray-400",
                    label: "text-gray-700 font-bold"
                  }}
                />
                <Input 
                  label="Kode Keamanan (PIN)" 
                  placeholder="Masukkan 4-6 digit angka" 
                  variant="bordered"
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  classNames={{ 
                    inputWrapper: "rounded-xl border-gray-200 font-bold",
                    input: "text-gray-900 placeholder:text-gray-400",
                    label: "text-gray-700 font-bold"
                  }}
                />
              </ModalBody>
              <ModalFooter className="border-t border-gray-100">
                <Button variant="light" onPress={onClose} className="font-bold">
                  Batal
                </Button>
                <Button className="bg-black text-white font-black uppercase tracking-wider rounded-xl px-6" onPress={() => handleAdd(onClose)}>
                  Buat Akun
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl border-4 border-[#2D1B4E] shadow-[8px_8px_0px_#2D1B4E] font-black tracking-wide ${toast.type === 'error' ? 'bg-[#FFE4E6] text-[#E11D48]' : 'bg-[#DCFCE7] text-[#16A34A]'}`}
          >
            {toast.type === 'error' ? <AlertCircle strokeWidth={3} /> : <CheckCircle2 strokeWidth={3} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
