"use client";
import React, { useState } from "react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react";
import { FileText, Download } from "lucide-react";

interface FinanceReportsProps {
  overview: any;
  formatRp: (num: number) => string;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export const FinanceReports = ({ overview, formatRp, showToast }: FinanceReportsProps) => {
  const { isOpen: isRepOpen, onOpen: onRepOpen, onClose: onRepClose } = useDisclosure();
  const [selectedReport, setSelectedReport] = useState<string>("");

  const reportsList = [
    "Laba Rugi (P&L)", "Neraca (Balance Sheet)", "Arus Kas (Cash Flow)", "Buku Besar (General Ledger)",
    "Jurnal Umum", "Trial Balance", "Laporan Pajak", "Laporan Cabang"
  ];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-900">Sistem Laporan Keuangan</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {reportsList.map((rep, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group flex flex-col justify-between h-full">
            <div>
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-500 transition-colors">
                <FileText className="w-6 h-6 text-indigo-500 group-hover:text-white" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2 leading-tight">{rep}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 mb-4">Lihat atau unduh laporan detail untuk {rep.toLowerCase()} bulan ini.</p>
            </div>
            
            <div className="flex gap-2 mt-auto">
              <Button 
                size="sm" 
                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex-1 font-semibold" 
                onPress={() => { setSelectedReport(rep); onRepOpen(); }}
              >
                Lihat
              </Button>
              <Button 
                size="sm" 
                isIconOnly
                aria-label="Export Excel"
                className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100" 
                onPress={() => { showToast(`Mengekspor ${rep} ke Excel...`); }}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isRepOpen} onClose={onRepClose} size="3xl" classNames={{ base: "rounded-3xl", backdrop: "z-50" }} scrollBehavior="inside" placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-bold">Laporan: {selectedReport}</h2>
                <p className="text-sm font-normal text-gray-500">Periode: Bulan Ini</p>
              </ModalHeader>
              <ModalBody className="py-6">
                <div className="flex flex-col gap-6">
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
                    <FileText className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-indigo-900">
                      Menampilkan data agregasi realtime untuk <strong>{selectedReport}</strong>. Data ini digenerate berdasarkan transaksi aktif pada bulan berjalan.
                    </p>
                  </div>
                  
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm">Deskripsi</th>
                            <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm">Nominal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-6 text-sm font-medium text-gray-800">Total Pemasukan (Revenue)</td>
                            <td className="py-4 px-6 text-sm font-bold text-right text-emerald-600">{formatRp(overview?.incomeMonth || 0)}</td>
                          </tr>
                          <tr className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-6 text-sm font-medium text-gray-800">Total Pengeluaran (Expenses)</td>
                            <td className="py-4 px-6 text-sm font-bold text-right text-red-600">-{formatRp(overview?.expenseMonth || 0)}</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="py-5 px-6 text-base font-black text-gray-900 uppercase tracking-wide">Total Net / Laba Bersih</td>
                            <td className="py-5 px-6 text-lg font-black text-right text-indigo-700">
                              {formatRp((overview?.incomeMonth || 0) - (overview?.expenseMonth || 0))}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-gray-100 pt-4">
                <Button variant="light" onPress={onClose} className="font-semibold">Tutup</Button>
                <Button className="bg-indigo-600 text-white font-bold shadow-md shadow-indigo-200" onPress={() => { showToast(`Mengekspor ${selectedReport} ke Excel...`); onClose(); }}>
                  Unduh Excel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
