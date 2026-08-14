"use client";
import React, { useState, useEffect } from "react";
import { Avatar, Button, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from "@nextui-org/react";
import { Bell, Settings, FileText, DollarSign, ChevronLeft, Filter, Plus, Trash2, CheckCircle2, X, Menu } from "lucide-react";
import {
  getFinanceOverview, getTransactions, addTransaction,
  getInvoices, getPurchaseOrders,
  getBudgets,
  getKasAccounts,
  getOutletSales, resetFinanceData
} from "@/app/actions/finance";

import { FinanceOverview } from "./tabs/finance-overview";
import { FinanceTransactions } from "./tabs/finance-transactions";
import { FinanceInvoices } from "./tabs/finance-invoices";
import { FinanceBudget } from "./tabs/finance-budget";
import { FinanceReports } from "./tabs/finance-reports";

export const FinanceContent = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const formatRp = (num: number) => `Rp ${num.toLocaleString("id-ID")}`;

  // ========== STATE ==========
  const [overview, setOverview] = useState<any>({ incomeToday: 0, expenseToday: 0, incomeMonth: 0, expenseMonth: 0, incomeYear: 0, labaBersih: 0, cashFlow: 0, piutang: 0, hutang: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [kasAccounts, setKasAccounts] = useState<any[]>([]);
  const [outletSales, setOutletSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Global Transaction Modal (used in Overview & Transactions)
  const { isOpen: isTxOpen, onOpen: onTxOpen, onClose: onTxClose } = useDisclosure();
  const [txForm, setTxForm] = useState<any>({ type: "income", category: "", amount: 0, description: "", status: "Lunas", transaction_date: new Date().toISOString().split("T")[0] });

  // Toast
  const [toast, setToast] = useState<{show: boolean, msg: string, type: string}>({ show: false, msg: "", type: "success" });
  const showToast = (msg: string, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3000);
  };

  // ========== FETCH DATA ==========
  const loadData = async (tab: string) => {
    try {
      setLoading(true);
      switch (tab) {
        case "overview":
          const [ov, sales, kas] = await Promise.all([getFinanceOverview(), getOutletSales(), getKasAccounts()]);
          setOverview(ov); setOutletSales(sales); setKasAccounts(kas);
          break;
        case "transactions":
          setTransactions(await getTransactions());
          break;
        case "invoices":
          const [invs, pos] = await Promise.all([getInvoices(), getPurchaseOrders()]);
          setInvoices(invs); setPurchaseOrders(pos);
          break;
        case "budget":
          setBudgets(await getBudgets());
          break;
        case "reports":
          const [ovr, kasR] = await Promise.all([getFinanceOverview(), getKasAccounts()]);
          setOverview(ovr); setKasAccounts(kasR);
          break;
      }
    } catch (e) { console.error("Error fetching finance data:", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(activeTab); }, [activeTab]);

  const renderContent = () => {
    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>;
    
    const sharedProps = { formatRp, refreshData: () => loadData(activeTab), showToast };

    switch (activeTab) {
      case "overview": 
        return <FinanceOverview {...sharedProps} overview={overview} outletSales={outletSales} kasAccounts={kasAccounts} />;
      case "transactions": 
        return <FinanceTransactions {...sharedProps} transactions={transactions} onTxOpen={onTxOpen} setTxForm={setTxForm} />;
      case "invoices": 
        return <FinanceInvoices {...sharedProps} invoices={invoices} purchaseOrders={purchaseOrders} />;
      case "budget": 
        return <FinanceBudget {...sharedProps} budgets={budgets} />;
      case "reports": 
        return <FinanceReports {...sharedProps} overview={overview} />;
      default: 
        return <FinanceOverview {...sharedProps} overview={overview} outletSales={outletSales} kasAccounts={kasAccounts} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FE] font-sans">
      {/* Top Navbar */}
      <div className="h-auto min-h-[64px] md:h-20 bg-white px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row items-stretch md:items-center justify-between shrink-0 shadow-sm z-10 relative gap-3 md:gap-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-white font-black text-lg md:text-xl">K</span>
            </div>
            <div>
              <h1 className="font-black text-gray-900 text-base md:text-lg leading-tight tracking-tight">KOTACOFFEE</h1>
              <p className="text-[10px] text-gray-500 font-medium">Finance & Accounting</p>
            </div>
          </div>
          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
          </button>
        </div>
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex bg-gray-900 rounded-full p-1 md:p-1.5 shadow-xl w-max md:w-auto">
            {[
              { id: "overview", label: "Dashboard" },
              { id: "transactions", label: "Pemasukan & Pengeluaran" },
              { id: "invoices", label: "Invoice & PO" },
              { id: "budget", label: "Budgeting" },
              { id: "reports", label: "Laporan" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }}
                className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50" : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Button isIconOnly aria-label="Laporan" variant="light" className="text-gray-400 hover:text-gray-600"><FileText className="w-5 h-5" /></Button>
          <Button isIconOnly aria-label="Keuangan" variant="light" className="text-gray-400 hover:text-gray-600"><DollarSign className="w-5 h-5" /></Button>
          <Button isIconOnly aria-label="Notifikasi" variant="light" className="text-gray-400 hover:text-gray-600 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </Button>
          <Button isIconOnly aria-label="Pengaturan" variant="light" className="text-gray-400 hover:text-gray-600"><Settings className="w-5 h-5" /></Button>
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          <Avatar src="https://i.pravatar.cc/150?u=finance" size="sm" className="ring-2 ring-indigo-100" />
        </div>
        {/* Mobile icon row */}
        {mobileMenuOpen && (
          <div className="flex md:hidden items-center justify-center gap-3 py-2 border-t border-gray-100">
            <Button isIconOnly aria-label="Laporan" variant="light" size="sm" className="text-gray-400"><FileText className="w-4 h-4" /></Button>
            <Button isIconOnly aria-label="Keuangan" variant="light" size="sm" className="text-gray-400"><DollarSign className="w-4 h-4" /></Button>
            <Button isIconOnly aria-label="Notifikasi" variant="light" size="sm" className="text-gray-400 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </Button>
            <Button isIconOnly aria-label="Pengaturan" variant="light" size="sm" className="text-gray-400"><Settings className="w-4 h-4" /></Button>
            <div className="w-px h-5 bg-gray-200"></div>
            <Avatar src="https://i.pravatar.cc/150?u=finance" size="sm" className="ring-2 ring-indigo-100" />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50/50 to-transparent -z-10 pointer-events-none"></div>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 md:mb-8 gap-4">
            <div>
              <Button size="sm" variant="flat" className="mb-3 md:mb-4 bg-white shadow-sm border border-gray-100" startContent={<ChevronLeft className="w-4 h-4"/>}>Kembali</Button>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                {activeTab === "overview" && "Finance Dashboard"}
                {activeTab === "transactions" && "Arus Kas & Transaksi"}
                {activeTab === "invoices" && "Kelola Tagihan"}
                {activeTab === "budget" && "Perencanaan Keuangan"}
                {activeTab === "reports" && "Laporan Resmi"}
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1">Kelola dan lacak seluruh keuangan KotaCoffee di satu tempat.</p>
            </div>
            {activeTab === "overview" && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full xl:w-auto">
                <Button color="danger" variant="flat" className="font-semibold shadow-sm text-xs sm:text-sm flex-1 sm:flex-initial" startContent={<Trash2 className="w-4 h-4" />} onPress={async () => { if(confirm('Yakin ingin mereset semua data dummy keuangan?')) { await resetFinanceData(); loadData('overview'); showToast('Data berhasil di-reset!'); } }}>Reset Data</Button>
                <Button variant="flat" className="bg-white border border-gray-200 shadow-sm font-semibold text-xs sm:text-sm flex-1 sm:flex-initial" startContent={<Filter className="w-4 h-4" />}>Filter</Button>
                <Button className="bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-200 text-xs sm:text-sm w-full sm:flex-initial" startContent={<Plus className="w-4 h-4" />} onPress={() => { setTxForm({ type: "income", category: "", amount: 0, description: "", status: "Lunas", transaction_date: new Date().toISOString().split("T")[0] }); onTxOpen(); }}>Buat Jurnal Baru</Button>
              </div>
            )}
          </div>
          
          <div className="pb-20">{renderContent()}</div>
        </div>
      </div>

      {/* ========== GLOBAL MODALS ========== */}
      
      {/* Transaction Modal */}
      <Modal isOpen={isTxOpen} onClose={onTxClose} size="lg" classNames={{ base: "rounded-3xl", backdrop: "z-50" }} scrollBehavior="outside" placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Catat Transaksi Baru</ModalHeader>
              <ModalBody className="space-y-4 pb-4">
                <div className="flex gap-2">
                  {["income", "expense"].map(t => (
                    <Button key={t} className={`flex-1 font-semibold transition-colors ${txForm.type === t ? (t === "income" ? "bg-emerald-500 text-white" : "bg-red-500 text-white") : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`} onPress={() => setTxForm({...txForm, type: t})}>
                      {t === "income" ? "Pemasukan" : "Pengeluaran"}
                    </Button>
                  ))}
                </div>
                <Input label="Kategori" variant="bordered" value={txForm.category} onChange={(e) => setTxForm({...txForm, category: e.target.value})} placeholder="QRIS, Cash, GoFood, Bahan Baku, Gaji..." />
                <Input label="Nominal" type="number" variant="bordered" value={String(txForm.amount)} onChange={(e) => setTxForm({...txForm, amount: Number(e.target.value)})} />
                <Input label="Deskripsi" variant="bordered" value={txForm.description} onChange={(e) => setTxForm({...txForm, description: e.target.value})} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Tanggal" type="date" variant="bordered" value={txForm.transaction_date} onChange={(e) => setTxForm({...txForm, transaction_date: e.target.value})} />
                  <Input label="Status" variant="bordered" value={txForm.status} onChange={(e) => setTxForm({...txForm, status: e.target.value})} placeholder="Lunas / Pending" />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button className="bg-indigo-600 text-white font-bold" onPress={async () => {
                  try { 
                    await addTransaction(txForm); 
                    showToast("Transaksi disimpan!"); 
                    onClose(); 
                    loadData(activeTab); 
                  } catch (e: any) { 
                    showToast(e.message || "Gagal menyimpan transaksi", "error"); 
                  }
                }}>Simpan</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Global Toast */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-[100] px-6 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm flex items-center gap-2 transition-all duration-300 transform translate-y-0 opacity-100 ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};
