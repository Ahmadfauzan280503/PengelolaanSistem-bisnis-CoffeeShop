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
  Textarea,
} from "@nextui-org/react";
import React, { useState } from "react";
import { Plus } from "lucide-react";

export const AddReport = ({ onAddReport }: { onAddReport: (report: any) => void }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [formData, setFormData] = useState({
    name: "",
    category: "Bahan Baku",
    quantity: "",
    reason: "",
    status: "Dilaporkan",
  });

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (onClose: () => void) => {
    if (!formData.name || !formData.quantity || !formData.reason) {
      alert("Mohon isi semua field");
      return;
    }

    const newReport = {
      id: Date.now(),
      ...formData,
      date: new Date().toLocaleDateString("id-ID"),
    };
    onAddReport(newReport);
    onClose();
    // Reset form
    setFormData({
      name: "",
      category: "Bahan Baku",
      quantity: "",
      reason: "",
      status: "Dilaporkan",
    });
  };

  return (
    <div>
      <Button 
        onPress={onOpen}
        color="danger"
        variant="shadow"
        className="font-semibold"
        startContent={<Plus size={18} />}
      >
        Input Bahan Rusak
      </Button>
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
        classNames={{
            base: "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800",
            header: "border-b border-neutral-100 dark:border-neutral-800",
            footer: "border-t border-neutral-100 dark:border-neutral-800",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Input Bahan Rusak
              </ModalHeader>
              <ModalBody className="py-6">
                <Input
                  label="Nama Bahan"
                  placeholder="Contoh: Susu UHT"
                  variant="bordered"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                <Select 
                  label="Kategori"
                  variant="bordered"
                  selectedKeys={[formData.category]}
                  onSelectionChange={(keys) => handleInputChange("category", Array.from(keys)[0] as string)}
                >
                  <SelectItem key="Bahan Baku" value="Bahan Baku">Bahan Baku</SelectItem>
                  <SelectItem key="Bahan Tambahan" value="Bahan Tambahan">Bahan Tambahan</SelectItem>
                  <SelectItem key="Kemasan" value="Kemasan">Kemasan</SelectItem>
                </Select>
                <Input
                  label="Jumlah"
                  placeholder="Contoh: 2 Liter atau 500 Gram"
                  variant="bordered"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                />
                <Textarea
                  label="Alasan Kerusakan"
                  placeholder="Jelaskan alasan kerusakan..."
                  variant="bordered"
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                />
                <Select 
                  label="Status"
                  variant="bordered"
                  selectedKeys={[formData.status]}
                  onSelectionChange={(keys) => handleInputChange("status", Array.from(keys)[0] as string)}
                >
                  <SelectItem key="Dilaporkan" value="Dilaporkan">Dilaporkan</SelectItem>
                  <SelectItem key="Selesai" value="Selesai">Selesai</SelectItem>
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button 
                  className="bg-danger text-white shadow-lg shadow-danger/30"
                  onPress={() => handleSubmit(onClose)}
                >
                  Simpan Laporan
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
