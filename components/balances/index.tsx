"use client";
import {
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Progress,
  Tab,
  Tabs,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  useDisclosure,
} from "@nextui-org/react";
import React, { useState, useMemo } from "react";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import { UsersIcon } from "@/components/icons/breadcrumb/users-icon";
import Link from "next/link";

interface Ingredient {
  id: number;
  name: string;
  total: number;
  remaining: number;
  unit: string;
}

const initialIngredients: Ingredient[] = [
  { id: 1, name: "Beans Coffee", total: 1000, remaining: 900, unit: "gram" },
  { id: 2, name: "Susu UHT", total: 1000, remaining: 800, unit: "ml" },
  { id: 3, name: "Gula Aren", total: 500, remaining: 450, unit: "gram" },
];

export const Balances = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [newName, setNewName] = useState("");
  const [newTotal, setNewTotal] = useState("");

  const autoUnit = useMemo(() => {
    const name = newName.toLowerCase();
    if (name.includes("susu") || name.includes("sirup") || name.includes("liquid")) return "ml";
    if (name.includes("beans") || name.includes("bubuk") || name.includes("powder") || name.includes("gula")) return "gram";
    return "pcs";
  }, [newName]);

  const handleAddIngredient = (onClose: () => void) => {
    if (!newName || !newTotal) return;
    const newIngredient: Ingredient = {
      id: Date.now(),
      name: newName,
      total: Number(newTotal),
      remaining: Number(newTotal),
      unit: autoUnit,
    };
    setIngredients([...ingredients, newIngredient]);
    setNewName("");
    setNewTotal("");
    onClose();
  };

  const handleUpdateRemaining = (id: number, val: string) => {
    setIngredients((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, remaining: Number(val) } : item
      )
    );
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
        <li className="flex gap-2">
          <UsersIcon />
          <span>Finance</span>
          <span> / </span>{" "}
        </li>
        <li className="flex gap-2">
          <span>Data Bahan</span>
        </li>
      </ul>

      <h3 className="text-xl font-semibold">Data Bahan</h3>

      <div className="flex w-full flex-col gap-4">
        <Tabs aria-label="Ingredient Options" color="primary" variant="bordered">
          <Tab key="daftar" title="Daftar Bahan">
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex justify-end">
                <Button color="primary" onPress={onOpen}>
                  Tambah Bahan
                </Button>
              </div>
              <Table aria-label="Table Daftar Bahan">
                <TableHeader>
                  <TableColumn>NAMA BAHAN</TableColumn>
                  <TableColumn>STOK AWAL</TableColumn>
                  <TableColumn>SATUAN</TableColumn>
                </TableHeader>
                <TableBody items={ingredients}>
                  {(item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.total}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Tab>
          <Tab key="sisa" title="Sisa Stok Bahan">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {ingredients.map((item) => (
                <Card key={item.id} className="bg-default-50">
                  <CardBody className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">{item.name}</span>
                      <span className="text-sm px-2 py-1 bg-primary-100 text-primary-700 rounded-md">
                        {item.unit}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-sm">
                        <span>Sisa Stok</span>
                        <span className="font-semibold">
                          {item.remaining} / {item.total} {item.unit}
                        </span>
                      </div>
                      <Progress
                        aria-label={item.name}
                        value={(item.remaining / item.total) * 100}
                        color={
                          item.remaining / item.total < 0.2
                            ? "danger"
                            : item.remaining / item.total < 0.5
                            ? "warning"
                            : "success"
                        }
                        className="max-w-md"
                      />
                      <Input
                        size="sm"
                        label="Update Sisa"
                        type="number"
                        value={item.remaining.toString()}
                        onChange={(e) =>
                          handleUpdateRemaining(item.id, e.target.value)
                        }
                        endContent={
                          <span className="text-xs text-default-400">
                            {item.unit}
                          </span>
                        }
                      />
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </Tab>
        </Tabs>
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Tambah Bahan
              </ModalHeader>
              <ModalBody>
                <Input
                  autoFocus
                  label="Nama Bahan"
                  placeholder="Contoh: Beans Coffee"
                  variant="bordered"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <Input
                  label="Stok Awal"
                  placeholder="0"
                  type="number"
                  variant="bordered"
                  value={newTotal}
                  onChange={(e) => setNewTotal(e.target.value)}
                />
                <div className="flex justify-between items-center px-1">
                  <span className="text-sm text-default-500">
                    Satuan Otomatis:
                  </span>
                  <span className="text-sm font-bold text-primary">
                    {autoUnit}
                  </span>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="flat" onPress={onClose}>
                  Batal
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleAddIngredient(onClose)}
                >
                  Tambah
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

