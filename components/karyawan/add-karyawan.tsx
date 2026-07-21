"use client";
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
} from "@nextui-org/react";
import React, { useState } from "react";
import { Plus } from "lucide-react";

export const AddKaryawan = ({ onAddKaryawan }: { onAddKaryawan: (karyawan: any) => void }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Barista",
    team: "Operational",
    cabang: "Kota Coffee (Sultan Alauddin)",
    status: "active",
  });

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (onClose: () => void) => {
    const newKaryawan = {
      id: Date.now(),
      ...formData,
      avatar: "https://i.pravatar.cc/150?u=" + Date.now(),
    };
    onAddKaryawan(newKaryawan);
    onClose();
    setFormData({
      name: "",
      email: "",
      role: "Barista",
      team: "Operational",
      cabang: "Kota Coffee (Sultan Alauddin)",
      status: "active",
    });
  };

  return (
    <div>
      <Button 
        onPress={onOpen}
        className="bg-gradient-to-tr from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/30 font-semibold px-8"
        startContent={<Plus size={18} />}
      >
        Tambah Karyawan
      </Button>
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Tambah Karyawan Baru
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Nama Lengkap"
                  placeholder="Masukkan nama karyawan"
                  variant="bordered"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                <Input
                  label="Email"
                  placeholder="fauzan@example.com"
                  variant="bordered"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                <div className="flex gap-4">
                  <Select 
                    label="Role"
                    variant="bordered"
                    selectedKeys={[formData.role]}
                    onSelectionChange={(keys) => handleInputChange("role", Array.from(keys)[0] as string)}
                  >
                    <SelectItem key="Barista" value="Barista">Barista</SelectItem>
                    <SelectItem key="Kasir" value="Kasir">Kasir</SelectItem>
                    <SelectItem key="Supervisor" value="Supervisor">Supervisor</SelectItem>
                    <SelectItem key="Admin" value="Admin">Admin</SelectItem>
                  </Select>
                  <Select 
                    label="Team"
                    variant="bordered"
                    selectedKeys={[formData.team]}
                    onSelectionChange={(keys) => handleInputChange("team", Array.from(keys)[0] as string)}
                  >
                    <SelectItem key="Operational" value="Operational">Operational</SelectItem>
                    <SelectItem key="Management" value="Management">Management</SelectItem>
                  </Select>
                </div>
                <Select 
                  label="Cabang"
                  variant="bordered"
                  selectedKeys={[formData.cabang]}
                  onSelectionChange={(keys) => handleInputChange("cabang", Array.from(keys)[0] as string)}
                >
                  <SelectItem key="Kota Coffee (Sultan Alauddin)" value="Kota Coffee (Sultan Alauddin)">Kota Coffee (Sultan Alauddin)</SelectItem>
                  <SelectItem key="Kota Coffee (Minasaupa)" value="Kota Coffee (Minasaupa)">Kota Coffee (Minasaupa)</SelectItem>
                  <SelectItem key="Kota Coffee (Hertasning)" value="Kota Coffee (Hertasning)">Kota Coffee (Hertasning)</SelectItem>
                  <SelectItem key="Kota Coffee (Antang)" value="Kota Coffee (Antang)">Kota Coffee (Antang)</SelectItem>
                  <SelectItem key="Kota Coffee (Tamalate)" value="Kota Coffee (Tamalate)">Kota Coffee (Tamalate)</SelectItem>
                  <SelectItem key="Kota Coffee (Veteran)" value="Kota Coffee (Veteran)">Kota Coffee (Veteran)</SelectItem>
                  <SelectItem key="Kota Coffee (Ratualangi)" value="Kota Coffee (Ratualangi)">Kota Coffee (Ratualangi)</SelectItem>
                  <SelectItem key="Kota Coffee (Perintis)" value="Kota Coffee (Perintis)">Kota Coffee (Perintis)</SelectItem>
                  <SelectItem key="Kota Coffee (BTP)" value="Kota Coffee (BTP)">Kota Coffee (BTP)</SelectItem>
                  <SelectItem key="Kota Coffee (Cendrawasih)" value="Kota Coffee (Cendrawasih)">Kota Coffee (Cendrawasih)</SelectItem>
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Batal
                </Button>
                <Button color="primary" onPress={() => handleSubmit(onClose)}>
                  Simpan Data
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
