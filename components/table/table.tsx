import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  useDisclosure,
  User as UserComponent
} from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import { columns, users } from "./data";
import { RenderCell } from "./render-cell";
import { AlertCircle, UserCircle2, Pencil } from "lucide-react";

export const TableWrapper = () => {
  const [usersList, setUsersList] = useState(users);
  
  // Ambil data dari localStorage agar tersinkron dengan halaman karyawan
  useEffect(() => {
    const savedData = localStorage.getItem("karyawan_data");
    if (savedData) {
      setUsersList(JSON.parse(savedData));
    }
  }, []);

  // Modal states
  const {isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose} = useDisclosure();
  const {isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose} = useDisclosure();
  const {isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose} = useDisclosure();

  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editTeam, setEditTeam] = useState("");

  const handleDeleteClick = (user: any) => {
    setSelectedUser(user);
    onDeleteOpen();
  };

  const confirmDelete = () => {
    if (selectedUser) {
      setUsersList(usersList.filter(u => u.id !== selectedUser.id));
      onDeleteClose();
    }
  };

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditRole(user.role);
    setEditTeam(user.team);
    onEditOpen();
  };

  const confirmEdit = () => {
    if (selectedUser) {
      setUsersList(usersList.map(u => {
        if (u.id === selectedUser.id) {
          return { ...u, name: editName, role: editRole, team: editTeam };
        }
        return u;
      }));
      onEditClose();
    }
  };

  const handleViewClick = (user: any) => {
    setSelectedUser(user);
    onViewOpen();
  };
  return (
    <div className=" w-full flex flex-col gap-4">
      <Table aria-label="Example table with custom cells">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              hideHeader={column.uid === "actions"}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={usersList}>
          {(item) => (
            <TableRow>
              {(columnKey) => (
                <TableCell>
                  {RenderCell({ 
                    user: item, 
                    columnKey: columnKey,
                    onDelete: () => handleDeleteClick(item),
                    onEdit: () => handleEditClick(item),
                    onView: () => handleViewClick(item)
                  })}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* DELETE MODAL */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} classNames={{base: "bg-[#12121a] border-2 border-red-500 rounded-none shadow-[8px_8px_0px_0px_rgba(239,68,68,0.5)]"}}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-white font-black uppercase tracking-widest border-b border-[#1e1e2e]">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-500" />
              Hapus Anggota
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            <p className="text-gray-300 font-bold">
              Apakah Anda yakin ingin menghapus <span className="text-red-400">&quot;{selectedUser?.name}&quot;</span> dari tim? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </ModalBody>
          <ModalFooter className="border-t border-[#1e1e2e]">
            <Button className="bg-transparent text-gray-400 font-bold hover:text-white" onPress={onDeleteClose}>
              BATAL
            </Button>
            <Button className="bg-red-500 text-white font-black uppercase rounded-none border-2 border-red-500 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-all" onPress={confirmDelete}>
              HAPUS PERMANEN
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} classNames={{base: "bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"}}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-black font-black uppercase tracking-widest border-b-4 border-black">
            <div className="flex items-center gap-3">
              <Pencil className="text-purple-600" />
              Edit Data Karyawan
            </div>
          </ModalHeader>
          <ModalBody className="py-6 space-y-4">
            <Input 
              label="Nama Lengkap" 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              variant="bordered"
              classNames={{ inputWrapper: "border-2 border-gray-300 rounded-none font-bold text-black hover:border-black focus-within:border-black" }}
            />
            <Input 
              label="Jabatan (Role)" 
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              variant="bordered"
              classNames={{ inputWrapper: "border-2 border-gray-300 rounded-none font-bold text-black hover:border-black focus-within:border-black" }}
            />
            <Input 
              label="Cabang (Team)" 
              value={editTeam}
              onChange={(e) => setEditTeam(e.target.value)}
              variant="bordered"
              classNames={{ inputWrapper: "border-2 border-gray-300 rounded-none font-bold text-black hover:border-black focus-within:border-black" }}
            />
          </ModalBody>
          <ModalFooter className="border-t-4 border-black bg-gray-50">
            <Button className="bg-white border-2 border-black text-black font-black uppercase rounded-none hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all" onPress={onEditClose}>
              BATAL
            </Button>
            <Button className="bg-purple-600 border-2 border-black text-white font-black uppercase rounded-none hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all" onPress={confirmEdit}>
              SIMPAN PERUBAHAN
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* VIEW MODAL */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} classNames={{base: "bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"}}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 text-black font-black uppercase tracking-widest border-b-4 border-black">
            <div className="flex items-center gap-3">
              <UserCircle2 className="text-cyan-500" />
              Detail Profil Karyawan
            </div>
          </ModalHeader>
          <ModalBody className="py-6">
            {selectedUser && (
              <div className="flex flex-col gap-6 items-center">
                <div className="w-24 h-24 rounded-full border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-black uppercase text-black">{selectedUser.name}</h2>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{selectedUser.role} • {selectedUser.team}</p>
                </div>
                
                <div className="w-full border-2 border-dashed border-gray-300 p-4 space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="font-bold text-gray-500 text-xs uppercase">Email</span>
                    <span className="font-black text-black text-sm">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="font-bold text-gray-500 text-xs uppercase">Status</span>
                    <span className={`font-black text-sm uppercase ${selectedUser.status === 'active' ? 'text-green-600' : 'text-orange-500'}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-500 text-xs uppercase">Umur</span>
                    <span className="font-black text-black text-sm">{selectedUser.age} Tahun</span>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter className="border-t-4 border-black">
            <Button className="w-full bg-black text-white font-black uppercase rounded-none hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(168,85,247,1)] transition-all" onPress={onViewClose}>
              TUTUP
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </div>
  );
};
