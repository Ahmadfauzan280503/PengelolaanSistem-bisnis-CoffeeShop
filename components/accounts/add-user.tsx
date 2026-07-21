import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import React from "react";

export const AddUser = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div>
      <>
        <Button onPress={onOpen} color="primary">
          Tambah Laporan Pendapatan
        </Button>
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          placement="top-center"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Tambah Laporan Pendapatan
                </ModalHeader>
                <ModalBody>
                  <Input label="Tanggal" variant="bordered" type="date" placeholder=" " />
                  <Input label="Nama Kasir" variant="bordered" />
                  <Input label="Cash" variant="bordered" type="number" startContent="Rp" />
                  <div className="flex gap-4">
                    <Input label="Gojek (Kota coffee)" variant="bordered" type="number" startContent="Rp" />
                  </div>
                  <div className="flex gap-4">
                    <Input label="Grab (Kota coffee)" variant="bordered" type="number" startContent="Rp" />
                  </div>
                  <div className="flex gap-4">
                    <Input label="ShopeeFood (Kota coffee)" variant="bordered" type="number" startContent="Rp" />
                  </div>
                  <Input label="QRIS" variant="bordered" type="number" startContent="Rp" />
                  <Input label="Pengeluaran" variant="bordered" type="number" startContent="Rp" />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" onPress={onClose}>
                    Simpan Laporan
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    </div>
  );
};
