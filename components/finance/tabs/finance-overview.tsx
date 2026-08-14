"use client";
import React, { useState } from "react";
import { Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input } from "@nextui-org/react";
import { TrendingUp, DollarSign, BarChart3, PieChart, TrendingDown, Banknote, FileSignature, Receipt, Building2, Wallet } from "lucide-react";
import { addKasMutation } from "@/app/actions/finance";

interface FinanceOverviewProps {
  overview: any;
  outletSales: any[];
  kasAccounts: any[];
  formatRp: (num: number) => string;
  refreshData: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

export const FinanceOverview = ({ overview, outletSales, kasAccounts, formatRp, refreshData, showToast }: FinanceOverviewProps) => {
  const { isOpen: isMutOpen, onOpen: onMutOpen, onClose: onMutClose } = useDisclosure();
  const [mutForm, setMutForm] = useState<any>({ kas_account_id: "", type: "credit", amount: 0, description: "" });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pendapatan Hari Ini", value: overview?.incomeToday || 0, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pendapatan Bulan Ini", value: overview?.incomeMonth || 0, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pendapatan Tahun Ini", value: overview?.incomeYear || 0, icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Laba Bersih (Bulan)", value: overview?.labaBersih || 0, icon: PieChart, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Pengeluaran Hari Ini", value: overview?.expenseToday || 0, icon: TrendingDown, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Cash Flow (Bulan)", value: overview?.cashFlow || 0, icon: Banknote, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Piutang", value: overview?.piutang || 0, icon: FileSignature, color: "text-cyan-600", bg: "bg-cyan-50" },
          { label: "Hutang", value: overview?.hutang || 0, icon: Receipt, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-xl ${stat.bg}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
              <h3 className="text-xl font-black text-gray-900 truncate" title={formatRp(stat.value)}>{formatRp(stat.value)}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Outlet Sales */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-hidden">
        <h3 className="font-bold text-gray-900 mb-6">Analisis Penjualan per Cabang (Hari Ini)</h3>
        {(!outletSales || outletSales.length === 0) ? (
          <p className="text-gray-400 text-center py-10">Belum ada penjualan hari ini</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outletSales.map((outlet: any, idx: number) => (
              <div key={idx} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-500 shrink-0" />
                    <h4 className="font-bold text-gray-800 line-clamp-1">{outlet.outlet}</h4>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 shrink-0">{formatRp(outlet.totalRevenue)}</span>
                </div>
                <p className="text-sm text-gray-500">{outlet.orderCount} pesanan</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kas & Hutang */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 gap-2">
            <h3 className="font-bold text-gray-900">Sistem Kas</h3>
            <Button size="sm" className="bg-indigo-500 text-white rounded-lg font-semibold shrink-0" onPress={() => { setMutForm({ kas_account_id: kasAccounts?.[0]?.id || "", type: "credit", amount: 0, description: "" }); onMutOpen(); }}>Mutasi</Button>
          </div>
          <div className="space-y-3 flex-1">
            {(!kasAccounts || kasAccounts.length === 0) ? (
               <p className="text-gray-400 text-center py-4 text-sm">Belum ada akun kas</p>
            ) : kasAccounts.map((k: any) => (
              <div key={k.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded-xl gap-2 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
                    <Wallet className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">{k.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">Update: {k.last_mutation_date || "-"}</p>
                  </div>
                </div>
                <span className="font-bold text-gray-900 self-end sm:self-auto shrink-0">{formatRp(Number(k.balance))}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-full">
          <h3 className="font-bold text-gray-900 mb-4">Piutang & Hutang</h3>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-cyan-50 rounded-xl gap-2 hover:bg-cyan-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shrink-0">
                  <FileSignature className="w-5 h-5 text-cyan-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Total Piutang</span>
              </div>
              <span className="font-bold text-cyan-600 self-end sm:self-auto text-lg">{formatRp(overview?.piutang || 0)}</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-red-50 rounded-xl gap-2 hover:bg-red-100 transition-colors">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-white rounded-lg shrink-0">
                   <Receipt className="w-5 h-5 text-red-600" />
                 </div>
                 <span className="text-sm font-semibold text-gray-700">Total Hutang</span>
              </div>
              <span className="font-bold text-red-600 self-end sm:self-auto text-lg">{formatRp(overview?.hutang || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kas Mutation Modal */}
      <Modal isOpen={isMutOpen} onClose={onMutClose} size="md" classNames={{ base: "rounded-3xl", backdrop: "z-50" }} scrollBehavior="outside" placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Mutasi Kas</ModalHeader>
              <ModalBody className="space-y-4 pb-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Pilih Akun Kas</p>
                  <div className="flex flex-wrap gap-2">
                    {(kasAccounts || []).map((k: any) => (
                      <div key={k.id} onClick={() => setMutForm({...mutForm, kas_account_id: k.id})}>
                        <Chip className={`cursor-pointer transition-colors ${mutForm.kas_account_id === k.id ? "bg-indigo-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}>{k.name}</Chip>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  {["credit", "debit"].map(t => (
                    <Button key={t} className={`flex-1 font-semibold transition-colors ${mutForm.type === t ? (t === "credit" ? "bg-emerald-500 text-white" : "bg-red-500 text-white") : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`} onPress={() => setMutForm({...mutForm, type: t})}>
                      {t === "credit" ? "Masuk (Credit)" : "Keluar (Debit)"}
                    </Button>
                  ))}
                </div>
                <Input label="Jumlah" type="number" variant="bordered" value={String(mutForm.amount)} onChange={(e) => setMutForm({...mutForm, amount: Number(e.target.value)})} />
                <Input label="Keterangan" variant="bordered" value={mutForm.description} onChange={(e) => setMutForm({...mutForm, description: e.target.value})} />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button className="bg-indigo-600 text-white font-bold" onPress={async () => {
                  try { 
                    await addKasMutation(mutForm); 
                    showToast("Mutasi berhasil!"); 
                    onClose(); 
                    refreshData(); 
                  } catch (e: any) { 
                    showToast(e.message || "Gagal melakukan mutasi", "error"); 
                  }
                }}>Proses Mutasi</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
