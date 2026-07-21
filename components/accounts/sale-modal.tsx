"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  sale: any;
  mode: "view" | "edit";
  onSave?: (updatedSale: any) => void;
}

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

export const SaleModal = ({ isOpen, onOpenChange, sale, mode, onSave }: Props) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (sale) {
      setFormData(sale);
    }
  }, [sale]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave?.(formData);
  };

  if (!sale) return null;

  const isView = mode === "view";

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {isView ? "Detail Laporan" : "Edit Laporan"}
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Tanggal"
                  value={formData.tanggal}
                  readOnly={isView}
                  onChange={(e) => handleChange("tanggal", e.target.value)}
                />
                {isView ? (
                  <Input
                    label="Cabang"
                    value={formData.cabang}
                    readOnly
                  />
                ) : (
                  <Select
                    label="Cabang"
                    selectedKeys={formData.cabang ? [formData.cabang] : []}
                    onChange={(e) => handleChange("cabang", e.target.value)}
                  >
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </Select>
                )}
                <Input
                  label="Kasir"
                  value={formData.kasir}
                  readOnly={isView}
                  onChange={(e) => handleChange("kasir", e.target.value)}
                />
                <Input
                  label="Cash"
                  type="number"
                  value={formData.cash === 0 ? "" : formData.cash}
                  readOnly={isView}
                  onChange={(e) => handleChange("cash", e.target.value)}
                />
                <Input
                  label="Gojek"
                  type="number"
                  value={formData.gojek_kotacoffee === 0 ? "" : formData.gojek_kotacoffee}
                  readOnly={isView}
                  onChange={(e) => handleChange("gojek_kotacoffee", e.target.value)}
                />
                <Input
                  label="Grab"
                  type="number"
                  value={formData.grab_kotacoffee === 0 ? "" : formData.grab_kotacoffee}
                  readOnly={isView}
                  onChange={(e) => handleChange("grab_kotacoffee", e.target.value)}
                />
                <Input
                  label="ShopeeFood"
                  type="number"
                  value={formData.shopeefood_kotacoffee === 0 ? "" : formData.shopeefood_kotacoffee}
                  readOnly={isView}
                  onChange={(e) => handleChange("shopeefood_kotacoffee", e.target.value)}
                />
                <Input
                  label="QRIS"
                  type="number"
                  value={formData.qris_kotacoffee === 0 ? "" : formData.qris_kotacoffee}
                  readOnly={isView}
                  onChange={(e) => handleChange("qris_kotacoffee", e.target.value)}
                />
                <Input
                  label="Pengeluaran"
                  type="number"
                  value={formData.pengeluaran === 0 ? "" : formData.pengeluaran}
                  readOnly={isView}
                  onChange={(e) => handleChange("pengeluaran", e.target.value)}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Tutup
              </Button>
              {!isView && (
                <Button color="primary" onPress={() => { handleSave(); onClose(); }}>
                  Simpan Perubahan
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
