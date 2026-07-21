import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
  Select,
  SelectItem,
  Checkbox,
} from "@nextui-org/react";
import React, { useState } from "react";
import { Plus, Image as ImageIcon } from "lucide-react";

export const AddProduct = ({ onAddProduct }: { onAddProduct: (product: any) => void }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [formData, setFormData] = useState({
    name: "",
    category: "Drink",
    price: "",
    unit: "",
    status: "Active",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop", // Default URL
    is_best_seller: false,
  });

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange("image", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (onClose: () => void) => {
    const newProduct = {
      id: Date.now(),
      ...formData,
      price: Number(formData.price),
      rating: "5.0/5",
      badge: formData.is_best_seller ? "Best Seller" : "New",
      badgeColor: formData.is_best_seller ? "bg-orange-500" : "bg-blue-500",
    };
    onAddProduct(newProduct);
    onClose();
    // Reset form
    setFormData({
      name: "",
      category: "Drink",
      price: "",
      unit: "",
      status: "Active",
      image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop",
      is_best_seller: false,
    });
  };

  return (
    <div>
      <Button 
        onPress={onOpen}
        className="bg-[#2D1B4E] text-white shadow-lg border-4 border-[#2D1B4E] shadow-[4px_4px_0px_#E94E77] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all font-black px-8 rounded-2xl"
        startContent={<Plus size={18} />}
      >
        Tambah Produk
      </Button>
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
        classNames={{
            base: "bg-white border-4 border-[#2D1B4E] rounded-[32px] shadow-[8px_8px_0px_#2D1B4E]",
            header: "border-b-4 border-[#2D1B4E]",
            footer: "border-t-4 border-[#2D1B4E]",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-[#2D1B4E] font-black text-xl">
                Tambah Produk Baru
              </ModalHeader>
              <ModalBody className="py-6 space-y-2">
                <Input
                  label="Nama Produk"
                  placeholder="Masukkan nama produk"
                  variant="bordered"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  classNames={{ 
                    inputWrapper: "border-2 border-[#2D1B4E] rounded-xl",
                    input: "text-[#2D1B4E] font-bold placeholder:text-gray-400",
                    label: "text-[#2D1B4E] font-black"
                  }}
                />
                <Select 
                  label="Kategori"
                  variant="bordered"
                  selectedKeys={[formData.category]}
                  onSelectionChange={(keys) => handleInputChange("category", Array.from(keys)[0] as string)}
                  classNames={{ 
                    trigger: "border-2 border-[#2D1B4E] rounded-xl",
                    value: "text-[#2D1B4E] font-bold",
                    label: "text-[#2D1B4E] font-black"
                  }}
                >
                  <SelectItem key="Coffee" value="Coffee" className="text-[#2D1B4E] font-bold">Coffee</SelectItem>
                  <SelectItem key="Non Coffee" value="Non Coffee" className="text-[#2D1B4E] font-bold">Non Coffee</SelectItem>
                  <SelectItem key="Drink" value="Drink" className="text-[#2D1B4E] font-bold">Drink</SelectItem>
                  <SelectItem key="Food" value="Food" className="text-[#2D1B4E] font-bold">Food</SelectItem>
                </Select>
                <div className="flex gap-4">
                  <Input
                    label="Harga"
                    placeholder="0"
                    type="number"
                    variant="bordered"
                    startContent={<span className="text-[#2D1B4E] text-small font-bold">Rp</span>}
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    classNames={{ 
                      inputWrapper: "border-2 border-[#2D1B4E] rounded-xl",
                      input: "text-[#2D1B4E] font-bold placeholder:text-gray-400",
                      label: "text-[#2D1B4E] font-black"
                    }}
                  />
                  <Input
                    label="Satuan"
                    placeholder="Contoh: 1kg"
                    variant="bordered"
                    value={formData.unit}
                    onChange={(e) => handleInputChange("unit", e.target.value)}
                    classNames={{ 
                      inputWrapper: "border-2 border-[#2D1B4E] rounded-xl",
                      input: "text-[#2D1B4E] font-bold placeholder:text-gray-400",
                      label: "text-[#2D1B4E] font-black"
                    }}
                  />
                </div>
                
                <div className="border-2 border-dashed border-[#2D1B4E] rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 relative cursor-pointer hover:bg-gray-100 transition-colors min-h-[140px] mt-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  {formData.image && formData.image !== "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop" ? (
                    <div className="relative w-full h-32">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                        <span className="text-white font-bold text-xs">Ganti Gambar</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                      <ImageIcon size={32} className="text-[#2D1B4E] mb-2" />
                      <p className="text-xs font-black text-[#2D1B4E]">Klik atau Drag untuk upload gambar produk</p>
                      <p className="text-[10px] text-zinc-500 font-bold mt-1">Format: PNG, JPG (Maks. 5MB)</p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-3 border-2 border-[#2D1B4E] rounded-xl mt-2 bg-[#FCE7F3]">
                  <div>
                    <p className="text-sm font-black text-[#2D1B4E]">Jadikan Best Seller</p>
                    <p className="text-[10px] font-bold text-zinc-500">Akan tampil di Landing Page (Halaman Utama)</p>
                  </div>
                  <Checkbox 
                    isSelected={formData.is_best_seller}
                    onValueChange={(val) => handleInputChange("is_best_seller", val)}
                    color="primary"
                    size="lg"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant="bordered" 
                  onPress={onClose}
                  className="font-black border-2 border-[#2D1B4E] text-[#2D1B4E] rounded-xl"
                >
                  Batal
                </Button>
                <Button 
                  className="bg-[#E94E77] text-white border-2 border-[#2D1B4E] font-black rounded-xl shadow-[2px_2px_0px_#2D1B4E] hover:translate-y-0.5 hover:shadow-none transition-all"
                  onPress={() => handleSubmit(onClose)}
                >
                  Simpan Produk
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
