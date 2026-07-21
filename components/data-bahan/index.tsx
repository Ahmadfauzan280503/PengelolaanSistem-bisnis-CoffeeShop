"use client";
import React, { useState } from "react";
import { Input } from "@nextui-org/react";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import Link from "next/link";
import { BahanCard, BahanItem } from "./bahan-card";
import { Search, Coffee, Leaf, Edit, Save, X } from "lucide-react";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  useDisclosure,
  Button,
  Select,
  SelectItem,
  Textarea
} from "@nextui-org/react";

const initialBahanData: BahanItem[] = [
  {
    id: 1,
    name: "Beans Coffee Arabica",
    image: "/daftar bahan/beans coffee.jpg",
    description: "1 pack atau perbungkus isinya 500 satuan nya Gram",
    stokAwal: 1000,
    satuan: "gram",
    kategori: "Kopi",
  },
  {
    id: 2,
    name: "Blends Coffee",
    image: "/daftar bahan/blends coffee.jpg",
    description: "1 pack atau perbungkus isinya 500 satuan nya Gram",
    stokAwal: 500,
    satuan: "gram",
    kategori: "Kopi",
  },
  {
    id: 3,
    name: "Bubuk Chocolate",
    image: "/daftar bahan/Bubuk Chocolate.jpg",
    description: "1 pack atau perbungkus isinya 500 satuan nya Gram",
    stokAwal: 500,
    satuan: "gram",
    kategori: "Bubuk",
  },
  {
    id: 4,
    name: "Bubuk Green Tea",
    image: "/daftar bahan/Bubuk Green Tea.jpg",
    description: "1 pack atau perbungkus isinya 500 satuan nya Gram",
    stokAwal: 500,
    satuan: "gram",
    kategori: "Bubuk",
  },
  {
    id: 5,
    name: "Bubuk Matcha",
    image: "/daftar bahan/Bubuk macha.jpg",
    description: "1 pack atau perbungkus isinya 500 satuan nya Gram",
    stokAwal: 500,
    satuan: "gram",
    kategori: "Bubuk",
  },
  {
    id: 6,
    name: "Gula Aren",
    image: "/daftar bahan/Gula aren.jpg",
    description: "1 botol atau perbungkus isinya 1.000 satuan nya Gram",
    stokAwal: 1000,
    satuan: "gram",
    kategori: "Pemanis",
  },
  {
    id: 7,
    name: "Saos Caramel",
    image: "/daftar bahan/Saos Caramel.jpg",
    description: "1 botol atau perbungkus isinya 500 satuan nya ml",
    stokAwal: 500,
    satuan: "ml",
    kategori: "Topping",
  },
  {
    id: 8,
    name: "Sprite 1000 ml",
    image: "/daftar bahan/Sprite 500 ml.jpg",
    description: "1 botol atau perbungkus isinya 1000 satuan nya ml",
    stokAwal: 1000,
    satuan: "ml",
    kategori: "Minuman",
  },
  {
    id: 9,
    name: "Susu Oatside",
    image: "/daftar bahan/Susu Oatside.jpg",
    description: "1 kotak atau perbungkus isinya 1.000 satuan nya ml",
    stokAwal: 6,
    satuan: "liter",
    kategori: "Susu",
  },
  {
    id: 10,
    name: "Marjan Sirup Markisa",
    image: "/daftar bahan/marjan sirup markisa.jpg",
    description: "1 botol atau perbungkus isinya 500 satuan nya ml",
    stokAwal: 3,
    satuan: "botol",
    kategori: "Sirup",
  },
];

export const DataBahan = () => {
  const [bahanList, setBahanList] = useState<BahanItem[]>(initialBahanData);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedBahan, setSelectedBahan] = useState<BahanItem | null>(null);
  const [editFormData, setEditFormData] = useState<BahanItem | null>(null);

  // Get unique categories
  const allCategories = ["Semua", ...Array.from(new Set(bahanList.map((b) => b.kategori)))];

  const filteredBahan = bahanList.filter((bahan) => {
    const matchSearch =
      bahan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bahan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bahan.kategori.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = activeCategory === "Semua" || bahan.kategori === activeCategory;
    return matchSearch && matchCategory;
  });

  const handleEditClick = (bahan: BahanItem) => {
    setSelectedBahan(bahan);
    setEditFormData({ ...bahan });
    onOpen();
  };

  const handleSaveEdit = () => {
    if (editFormData) {
      setBahanList((prev) => 
        prev.map((item) => item.id === editFormData.id ? editFormData : item)
      );
      onOpenChange();
    }
  };

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
          <span>Data Bahan</span>
        </li>
      </ul>

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h3 className="text-2xl font-bold">Daftar Bahan</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Kelola dan pantau semua bahan yang digunakan di outlet
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:max-w-md">
          <Input
            placeholder="Cari bahan berdasarkan nama atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            classNames={{
              input: "w-full",
              mainWrapper: "w-full",
              inputWrapper: "bg-neutral-100 dark:bg-neutral-800 border-none",
            }}
            startContent={<Search className="w-4 h-4 text-neutral-400" />}
            variant="flat"
            isClearable
            onClear={() => setSearchQuery("")}
          />
        </div>
        <div className="flex flex-row gap-2 flex-wrap">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-lg"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-2">
        {filteredBahan.length > 0 ? (
          filteredBahan.map((bahan) => (
            <BahanCard key={bahan.id} bahan={bahan} onEdit={handleEditClick} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-neutral-50 dark:bg-neutral-900 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
            <Search className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-3" />
            <p className="text-neutral-500 font-medium">Bahan tidak ditemukan</p>
            <p className="text-xs text-neutral-400 mt-1">Coba kata kunci lain atau ubah filter kategori</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex gap-2 items-center">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Edit className="text-amber-600 dark:text-amber-400" size={20} />
                </div>
                <span>Edit Data Bahan</span>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nama Bahan"
                    variant="bordered"
                    value={editFormData?.name}
                    onChange={(e) => setEditFormData(prev => prev ? {...prev, name: e.target.value} : null)}
                    className="md:col-span-2"
                  />
                  <Select 
                    label="Kategori"
                    variant="bordered"
                    selectedKeys={editFormData ? [editFormData.kategori] : []}
                    onSelectionChange={(keys) => setEditFormData(prev => prev ? {...prev, kategori: Array.from(keys)[0] as string} : null)}
                  >
                    {allCategories.filter(c => c !== "Semua").map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Berat Bahan"
                    type="number"
                    variant="bordered"
                    value={editFormData?.stokAwal.toString()}
                    onChange={(e) => setEditFormData(prev => prev ? {...prev, stokAwal: Number(e.target.value)} : null)}
                  />
                  <Input
                    label="Satuan"
                    variant="bordered"
                    value={editFormData?.satuan}
                    onChange={(e) => setEditFormData(prev => prev ? {...prev, satuan: e.target.value} : null)}
                  />
                  <Textarea
                    label="Deskripsi"
                    variant="bordered"
                    className="md:col-span-2"
                    value={editFormData?.description}
                    onChange={(e) => setEditFormData(prev => prev ? {...prev, description: e.target.value} : null)}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose} startContent={<X size={16}/>}>Batal</Button>
                <Button 
                  color="warning" 
                  className="text-white shadow-lg shadow-warning/30 font-semibold" 
                  onPress={handleSaveEdit}
                  startContent={<Save size={16}/>}
                >
                  Simpan Perubahan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
