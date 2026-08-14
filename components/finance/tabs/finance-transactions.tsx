"use client";
import React from "react";
import { Button, Chip } from "@nextui-org/react";
import { Plus } from "lucide-react";
import { syncCashierToFinance, payEmployees } from "@/app/actions/finance";

interface FinanceTransactionsProps {
  transactions: any[];
  formatRp: (num: number) => string;
  refreshData: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
  onTxOpen: () => void;
  setTxForm: (form: any) => void;
}

export const FinanceTransactions = ({ transactions, formatRp, refreshData, showToast, onTxOpen, setTxForm }: FinanceTransactionsProps) => {
  const incomes = transactions.filter((t: any) => t.type === "income");
  const expenses = transactions.filter((t: any) => t.type === "expense");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button 
          className="bg-indigo-600 text-white rounded-xl font-semibold shadow-md shadow-indigo-200" 
          startContent={<Plus className="w-4 h-4" />} 
          onPress={() => { 
            setTxForm({ type: "income", category: "", amount: 0, description: "", status: "Lunas", transaction_date: new Date().toISOString().split("T")[0] }); 
            onTxOpen(); 
          }}
        >
          Catat Transaksi
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Pemasukan */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-wrap justify-between items-center bg-emerald-50/50 gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-emerald-800">Sistem Pemasukan</h3>
              <Chip size="sm" color="success" variant="flat">{incomes.length} record</Chip>
            </div>
            <Button size="sm" className="bg-emerald-600 text-white font-semibold shadow-sm w-full sm:w-auto" onPress={async () => {
              try {
                const res = await syncCashierToFinance();
                showToast(res.message);
                refreshData();
              } catch (e: any) {
                showToast(e.message || "Gagal sync kasir", "error");
              }
            }}>
              Sync Kasir
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead className="bg-gray-50/50">
                <tr>
                  {["Sumber", "Tanggal", "Nominal"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incomes.map((p: any) => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">{p.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{p.transaction_date}</td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600 whitespace-nowrap">+{formatRp(Number(p.amount))}</td>
                  </tr>
                ))}
                {incomes.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-400 text-sm">Belum ada pemasukan</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-wrap justify-between items-center bg-red-50/50 gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-red-800">Sistem Pengeluaran</h3>
              <Chip size="sm" color="danger" variant="flat">{expenses.length} record</Chip>
            </div>
            <Button size="sm" className="bg-red-600 text-white font-semibold shadow-sm w-full sm:w-auto" onPress={async () => {
              if(confirm("Lakukan pembayaran gaji untuk semua karyawan aktif bulan ini?")) {
                try {
                  const res = await payEmployees();
                  showToast(res.message);
                  refreshData();
                } catch (e: any) {
                  showToast(e.message || "Gagal bayar gaji", "error");
                }
              }
            }}>
              Bayar Gaji
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50/50">
                <tr>
                  {["Kategori", "Tanggal", "Nominal", "Status"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.map((p: any) => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">{p.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{p.transaction_date}</td>
                    <td className="px-4 py-3 text-sm font-bold text-red-600 whitespace-nowrap">-{formatRp(Number(p.amount))}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Chip size="sm" color={p.status === "Lunas" ? "success" : "warning"} variant="flat">{p.status}</Chip>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400 text-sm">Belum ada pengeluaran</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
