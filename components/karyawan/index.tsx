"use client";
import React, { useEffect, useState } from "react";
import { 
  Input, 
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { AddKaryawan } from "@/components/karyawan/add-karyawan";

const columns = [
  { name: "NAMA", uid: "name" },
  { name: "ROLE", uid: "role" },
  { name: "CABANG", uid: "cabang" },
  { name: "STATUS", uid: "status" },
  { name: "ACTIONS", uid: "actions" },
];

const initialKaryawan = [
  {
    id: 1,
    name: "Ahmad Fauzan",
    role: "Supervisor",
    team: "Management",
    cabang: "Kota Coffee (Sultan Alauddin)",
    status: "active",
    email: "fauzan@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  {
    id: 2,
    name: "Nisa",
    role: "Kasir",
    team: "Operational",
    cabang: "Kota Coffee (Minasaupa)",
    status: "active",
    email: "yayang@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    id: 3,
    name: "Budi",
    role: "Barista",
    team: "Operational",
    cabang: "Kota Coffee (Hertasning)",
    status: "paused",
    email: "budi@example.com",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
  },
];

export const Karyawan = () => {
  const [karyawanList, setKaryawanList] = useState<any[]>(initialKaryawan);
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // Load data dari localStorage setelah komponen mounted (client-side only)
  useEffect(() => {
    setMounted(true);
    const savedData = localStorage.getItem("karyawan_data");
    if (savedData) {
      setKaryawanList(JSON.parse(savedData));
    }
  }, []);

  // Simpan data ke localStorage setiap ada perubahan, tapi hanya setelah mounted
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("karyawan_data", JSON.stringify(karyawanList));
    }
  }, [karyawanList, mounted]);

  // Hindari render konten yang bergantung pada localStorage sebelum mounted
  if (!mounted) {
    return null; // Atau kembalikan loading spinner
  }

  const handleAddKaryawan = (newKaryawan: any) => {
    setKaryawanList((prev) => [newKaryawan, ...prev]);
  };

  const openDeleteModal = (user: any) => {
    setUserToDelete(user);
    onOpen();
  };

  const handleDelete = () => {
    if (userToDelete) {
      setKaryawanList((prev) => prev.filter((k) => k.id !== userToDelete.id));
      setUserToDelete(null);
    }
  };

  const filteredKaryawan = karyawanList.filter((k) =>
    k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCell = (item: any, columnKey: React.Key) => {
    const cellValue = item[columnKey as keyof typeof item];

    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{ radius: "lg", src: item.avatar }}
            description={item.email}
            name={cellValue}
          >
            {item.email}
          </User>
        );
      case "role":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
            <p className="text-bold text-tiny capitalize text-default-400">{item.team}</p>
          </div>
        );
      case "cabang":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm font-semibold text-primary">{cellValue}</p>
          </div>
        );
      case "status":
        return (
          <Chip className="capitalize" color={item.status === "active" ? "success" : "warning"} size="sm" variant="flat">
            {cellValue}
          </Chip>
        );
      case "actions":
        return (
          <div className="flex items-center justify-center gap-4 w-full">
            <Tooltip content="Details">
              <button 
                onClick={() => alert(`Detail untuk: ${item.name}`)}
                className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-primary transition-colors"
              >
                <Eye size={20} />
              </button>
            </Tooltip>
            <Tooltip content="Edit user">
              <button 
                onClick={() => alert(`Edit data: ${item.name}`)}
                className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-warning transition-colors"
              >
                <Edit size={20} />
              </button>
            </Tooltip>
            <Tooltip color="danger" content="Delete user">
              <button 
                onClick={() => openDeleteModal(item)}
                className="text-lg text-danger cursor-pointer active:opacity-50 hover:text-red-700 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  };

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
          <span>Karyawan</span>
        </li>
      </ul>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-2xl font-bold">Data Karyawan</h3>
        <div className="flex flex-row gap-3.5 flex-wrap w-full md:w-auto">
          <AddKaryawan onAddKaryawan={handleAddKaryawan} />
        </div>
      </div>

      <div className="flex justify-between flex-wrap gap-4 items-center bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-3 w-full md:max-w-md">
          <Input
            placeholder="Cari karyawan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="flat"
            isClearable
            onClear={() => setSearchQuery("")}
            classNames={{
              inputWrapper: "bg-neutral-100 dark:bg-neutral-800",
            }}
          />
        </div>
      </div>

      <Table 
        aria-label="Tabel Karyawan"
        classNames={{
            wrapper: "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm",
            th: "bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-semibold",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={filteredKaryawan}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Custom Delete Confirmation Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        backdrop="blur"
        size="sm"
        classNames={{
          base: "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800",
          header: "border-b border-neutral-100 dark:border-neutral-800",
        }}
      >
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
                  Apakah Anda yakin ingin menghapus karyawan <span className="font-bold text-neutral-900 dark:text-white">&ldquo;{userToDelete?.name}&rdquo;</span>? 
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button 
                  color="danger" 
                  className="shadow-lg shadow-danger/30 font-semibold"
                  onPress={() => {
                    setKaryawanList((prev) => prev.filter((k) => k.id !== userToDelete.id));
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
