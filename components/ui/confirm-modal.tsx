import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { AlertTriangle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  message: string;
  onConfirm: () => void;
}

export const ConfirmModal = ({ isOpen, onOpenChange, title, message, onConfirm }: Props) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" backdrop="blur">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex gap-2 items-center text-danger">
              <AlertTriangle size={24} />
              {title}
            </ModalHeader>
            <ModalBody>
              <p className="text-default-600">{message}</p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Batal
              </Button>
              <Button
                color="danger"
                variant="flat"
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
              >
                Ya, Hapus Permanen
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
