"use client";
import React, { useState } from "react";
import { Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Textarea } from "@nextui-org/react";
import { Plus, Trash2 } from "lucide-react";
import { updateInvoiceStatus, deleteInvoice, updatePOStatus, deletePurchaseOrder, addInvoice, addPurchaseOrder } from "@/app/actions/finance";

interface FinanceInvoicesProps {
  invoices: any[];
  purchaseOrders: any[];
  formatRp: (num: number) => string;
  refreshData: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export const FinanceInvoices = ({ invoices, purchaseOrders, formatRp, refreshData, showToast }: FinanceInvoicesProps) => {
  const { isOpen: isInvOpen, onOpen: onInvOpen, onClose: onInvClose } = useDisclosure();
  const [invForm, setInvForm] = useState<any>({ client_name: "", client_email: "", amount: 0, status: "Draft", due_date: "", notes: "" });

  const { isOpen: isPOOpen, onOpen: onPOOpen, onClose: onPOClose } = useDisclosure();
  const [poForm, setPOForm] = useState<any>({ supplier: "", item_description: "", amount: 0 });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl font-bold text-gray-900">Invoices & Purchase Orders</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="flat" 
            className="rounded-xl font-semibold bg-white border border-gray-200 shadow-sm flex-1 sm:flex-initial text-xs sm:text-sm" 
            onPress={() => { setPOForm({ supplier: "", item_description: "", amount: 0 }); onPOOpen(); }}
          >
            Buat PO Baru
          </Button>
          <Button 
            className="bg-indigo-600 text-white rounded-xl font-semibold shadow-md shadow-indigo-200 flex-1 sm:flex-initial text-xs sm:text-sm" 
            startContent={<Plus className="w-4 h-4" />} 
            onPress={() => { setInvForm({ client_name: "", client_email: "", amount: 0, status: "Draft", due_date: "", notes: "" }); onInvOpen(); }}
          >
            Generate Invoice
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Invoices Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Daftar Invoice</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px]">
              <thead className="bg-gray-50/50">
                <tr>
                  {["ID", "Klien", "Nominal", "Status", "Aksi"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv: any) => (
                  <tr key={inv.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-indigo-600 whitespace-nowrap">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap truncate max-w-[150px]" title={inv.client_name}>{inv.client_name}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 whitespace-nowrap">{formatRp(Number(inv.amount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Chip size="sm" color={inv.status === "Paid" ? "success" : inv.status === "Draft" ? "default" : "danger"} variant="flat">{inv.status}</Chip>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        {inv.status !== "Paid" && (
                          <Button size="sm" color="success" variant="flat" className="text-xs" onPress={async () => { 
                            try {
                              await updateInvoiceStatus(inv.id, "Paid"); 
                              refreshData(); 
                              showToast("Invoice marked as Paid!"); 
                            } catch (e: any) { showToast(e.message, "error"); }
                          }}>
                            Paid
                          </Button>
                        )}
                        <Button isIconOnly aria-label="Hapus invoice" size="sm" variant="light" onPress={async () => { 
                          try {
                            await deleteInvoice(inv.id); 
                            refreshData(); 
                            showToast("Invoice dihapus"); 
                          } catch (e: any) { showToast(e.message, "error"); }
                        }}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">Belum ada invoice</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Purchase Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Purchase Orders (PO)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead className="bg-gray-50/50">
                <tr>
                  {["ID PO", "Supplier", "Barang", "Total", "Status", "Aksi"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((po: any) => (
                  <tr key={po.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-indigo-600 whitespace-nowrap">{po.po_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap truncate max-w-[120px]" title={po.supplier}>{po.supplier}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap truncate max-w-[150px]" title={po.item_description}>{po.item_description}</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900 whitespace-nowrap">{formatRp(Number(po.amount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap flex gap-2 items-center">
                      {po.status === "Pending" ? (
                        <Button size="sm" color="success" variant="flat" onPress={async () => { 
                          try {
                            await updatePOStatus(po.id, "Approved"); 
                            refreshData(); 
                            showToast("PO Approved!"); 
                          } catch (e: any) { showToast(e.message, "error"); }
                        }}>
                          Approve
                        </Button>
                      ) : (
                        <Chip size="sm" color={po.status === "Approved" ? "success" : "default"} variant="flat">{po.status}</Chip>
                      )}
                      <Button isIconOnly aria-label="Hapus PO" size="sm" variant="light" onPress={async () => { 
                        try {
                          await deletePurchaseOrder(po.id); 
                          refreshData(); 
                          showToast("PO dihapus permanen"); 
                        } catch (e: any) { showToast(e.message, "error"); }
                      }}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {purchaseOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Belum ada PO</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <Modal isOpen={isInvOpen} onClose={onInvClose} size="lg" classNames={{ base: "rounded-3xl", backdrop: "z-50" }} scrollBehavior="outside" placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Generate Invoice Baru</ModalHeader>
              <ModalBody className="space-y-4 pb-4">
                <Input label="Nama Klien" variant="bordered" value={invForm.client_name} onChange={(e) => setInvForm({...invForm, client_name: e.target.value})} />
                <Input label="Email Klien" variant="bordered" type="email" value={invForm.client_email} onChange={(e) => setInvForm({...invForm, client_email: e.target.value})} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Nominal" variant="bordered" type="number" value={String(invForm.amount)} onChange={(e) => setInvForm({...invForm, amount: Number(e.target.value)})} />
                  <Input label="Jatuh Tempo" variant="bordered" type="date" value={invForm.due_date} onChange={(e) => setInvForm({...invForm, due_date: e.target.value})} />
                </div>
                <Textarea label="Catatan" variant="bordered" minRows={2} value={invForm.notes} onChange={(e) => setInvForm({...invForm, notes: e.target.value})} />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button className="bg-indigo-600 text-white font-bold" onPress={async () => {
                  try { 
                    await addInvoice(invForm); 
                    showToast("Invoice dibuat!"); 
                    onClose(); 
                    refreshData(); 
                  } catch (e: any) { 
                    showToast(e.message || "Gagal membuat invoice", "error"); 
                  }
                }}>Generate</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* PO Modal */}
      <Modal isOpen={isPOOpen} onClose={onPOClose} size="md" classNames={{ base: "rounded-3xl", backdrop: "z-50" }} scrollBehavior="outside" placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Buat Purchase Order Baru</ModalHeader>
              <ModalBody className="space-y-4 pb-4">
                <Input label="Supplier" variant="bordered" value={poForm.supplier} onChange={(e) => setPOForm({...poForm, supplier: e.target.value})} />
                <Input label="Deskripsi Barang" variant="bordered" value={poForm.item_description} onChange={(e) => setPOForm({...poForm, item_description: e.target.value})} />
                <Input label="Total Harga" variant="bordered" type="number" value={String(poForm.amount)} onChange={(e) => setPOForm({...poForm, amount: Number(e.target.value)})} />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button className="bg-indigo-600 text-white font-bold" onPress={async () => {
                  try { 
                    await addPurchaseOrder(poForm); 
                    showToast("PO dibuat!"); 
                    onClose(); 
                    refreshData(); 
                  } catch (e: any) { 
                    showToast(e.message || "Gagal membuat PO", "error"); 
                  }
                }}>Buat PO</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
