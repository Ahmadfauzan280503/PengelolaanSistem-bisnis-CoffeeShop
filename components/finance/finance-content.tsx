"use client";
import React, { useState, useEffect } from "react";
import { Avatar, Button, Input, Chip, Progress, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Textarea } from "@nextui-org/react";
import {
  Search, Bell, Settings, FileText, Calendar, Plus, Filter, MoreVertical,
  DollarSign, Clock, ShieldCheck, ArrowUpRight, ArrowDownRight, ChevronLeft,
  Coffee, ChevronDown, Download, Printer, Send, TrendingUp, TrendingDown,
  Building2, Receipt, Wallet, Banknote, Briefcase, FileSignature, BarChart3, PieChart,
  CheckCircle2, X, Edit, Trash2, CreditCard, Menu
} from "lucide-react";
import {
  getFinanceOverview, getTransactions, addTransaction, deleteTransaction,
  getInvoices, addInvoice, updateInvoiceStatus, deleteInvoice,
  getPurchaseOrders, addPurchaseOrder, updatePOStatus, deletePurchaseOrder,
  getBudgets, addBudget, updateBudget,
  getKasAccounts, addKasMutation,
  getOutletSales, resetFinanceData,
  syncCashierToFinance, payEmployees
} from "@/app/actions/finance";

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

  // Modal states
  const { isOpen: isTxOpen, onOpen: onTxOpen, onClose: onTxClose } = useDisclosure();
  const [txForm, setTxForm] = useState<any>({ type: "income", category: "", amount: 0, description: "", status: "Lunas", transaction_date: new Date().toISOString().split("T")[0] });

  const { isOpen: isInvOpen, onOpen: onInvOpen, onClose: onInvClose } = useDisclosure();
  const [invForm, setInvForm] = useState<any>({ client_name: "", client_email: "", amount: 0, status: "Draft", due_date: "", notes: "" });

  const { isOpen: isPOOpen, onOpen: onPOOpen, onClose: onPOClose } = useDisclosure();
  const [poForm, setPOForm] = useState<any>({ supplier: "", item_description: "", amount: 0 });

  const { isOpen: isMutOpen, onOpen: onMutOpen, onClose: onMutClose } = useDisclosure();
  const [mutForm, setMutForm] = useState<any>({ kas_account_id: "", type: "credit", amount: 0, description: "" });

  const { isOpen: isRepOpen, onOpen: onRepOpen, onClose: onRepClose } = useDisclosure();
  const [selectedReport, setSelectedReport] = useState<string>("");

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
    } catch (e) { console.error("Error:", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(activeTab); }, [activeTab]);

  // ========== OVERVIEW ==========
  const renderOverview = () => (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Pendapatan Hari Ini", value: overview.incomeToday, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pendapatan Bulan Ini", value: overview.incomeMonth, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pendapatan Tahun Ini", value: overview.incomeYear, icon: BarChart3, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Laba Bersih (Bulan)", value: overview.labaBersih, icon: PieChart, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Pengeluaran Hari Ini", value: overview.expenseToday, icon: TrendingDown, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Cash Flow (Bulan)", value: overview.cashFlow, icon: Banknote, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Piutang", value: overview.piutang, icon: FileSignature, color: "text-cyan-600", bg: "bg-cyan-50" },
          { label: "Hutang", value: overview.hutang, icon: Receipt, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-xl ${stat.bg}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
              <h3 className="text-xl font-black text-gray-900">{formatRp(stat.value)}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Outlet Sales */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-6">Analisis Penjualan per Cabang (Hari Ini)</h3>
        {outletSales.length === 0 ? (
          <p className="text-gray-400 text-center py-10">Belum ada penjualan hari ini</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {outletSales.map((outlet: any, idx: number) => (
              <div key={idx} className="border border-gray-100 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-500" />
                    <h4 className="font-bold text-gray-800">{outlet.outlet}</h4>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{formatRp(outlet.totalRevenue)}</span>
                </div>
                <p className="text-sm text-gray-500">{outlet.orderCount} pesanan</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kas & Hutang */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Sistem Kas</h3>
            <Button size="sm" className="bg-indigo-500 text-white rounded-lg" onPress={() => { setMutForm({ kas_account_id: kasAccounts[0]?.id || "", type: "credit", amount: 0, description: "" }); onMutOpen(); }}>Mutasi</Button>
          </div>
          <div className="space-y-3">
            {(kasAccounts || []).map((k: any) => (
              <div key={k.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-indigo-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{k.name}</p>
                    <p className="text-[10px] text-gray-500">Update: {k.last_mutation_date || "-"}</p>
                  </div>
                </div>
                <span className="font-bold text-gray-900">{formatRp(Number(k.balance))}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Piutang & Hutang</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-xl">
              <div className="flex items-center gap-2"><FileSignature className="w-5 h-5 text-cyan-600" /><span className="text-sm font-semibold text-gray-700">Total Piutang</span></div>
              <span className="font-bold text-cyan-600">{formatRp(overview.piutang)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
              <div className="flex items-center gap-2"><Receipt className="w-5 h-5 text-red-600" /><span className="text-sm font-semibold text-gray-700">Total Hutang</span></div>
              <span className="font-bold text-red-600">{formatRp(overview.hutang)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ========== TRANSACTIONS ==========
  const renderTransactions = () => {
    const incomes = transactions.filter((t: any) => t.type === "income");
    const expenses = transactions.filter((t: any) => t.type === "expense");
    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-end">
          <Button className="bg-indigo-600 text-white rounded-xl font-semibold" startContent={<Plus className="w-4 h-4" />} onPress={() => { setTxForm({ type: "income", category: "", amount: 0, description: "", status: "Lunas", transaction_date: new Date().toISOString().split("T")[0] }); onTxOpen(); }}>
            Catat Transaksi
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-emerald-50/30">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-emerald-800">Sistem Pemasukan</h3>
                <Chip size="sm" color="success" variant="flat">{incomes.length} record</Chip>
              </div>
              <Button size="sm" className="bg-emerald-600 text-white font-semibold" onPress={async () => {
                const res = await syncCashierToFinance();
                showToast(res.message);
                loadData("transactions");
              }}>
                Sync Kasir
              </Button>
            </div>
            <div className="table-responsive">
            <table className="w-full min-w-[400px]">
              <thead className="bg-gray-50"><tr>{["Sumber", "Tanggal", "Nominal"].map(h => <th key={h} className="text-left text-xs font-semibold text-gray-500 px-3 sm:px-5 py-3 whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {incomes.map((p: any) => (
                  <tr key={p.id} className="border-t border-gray-50">
                    <td className="px-3 sm:px-5 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">{p.category}</td>
                    <td className="px-3 sm:px-5 py-3 text-sm text-gray-600 whitespace-nowrap">{p.transaction_date}</td>
                    <td className="px-3 sm:px-5 py-3 text-sm font-bold text-emerald-600 whitespace-nowrap">+{formatRp(Number(p.amount))}</td>
                  </tr>
                ))}
                {incomes.length === 0 && <tr><td colSpan={3} className="text-center py-8 text-gray-400">Belum ada pemasukan</td></tr>}
              </tbody>
            </table>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-red-50/30">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-red-800">Sistem Pengeluaran</h3>
                <Chip size="sm" color="danger" variant="flat">{expenses.length} record</Chip>
              </div>
              <Button size="sm" className="bg-red-600 text-white font-semibold" onPress={async () => {
                if(confirm("Lakukan pembayaran gaji untuk semua karyawan aktif bulan ini?")) {
                  const res = await payEmployees();
                  showToast(res.message);
                  loadData("transactions");
                }
              }}>
                Bayar Gaji
              </Button>
            </div>
            <div className="table-responsive">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50"><tr>{["Kategori", "Tanggal", "Nominal", "Status"].map(h => <th key={h} className="text-left text-xs font-semibold text-gray-500 px-3 sm:px-5 py-3 whitespace-nowrap">{h}</th>)}</tr></thead>
              <tbody>
                {expenses.map((p: any) => (
                  <tr key={p.id} className="border-t border-gray-50">
                    <td className="px-3 sm:px-5 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">{p.category}</td>
                    <td className="px-3 sm:px-5 py-3 text-sm text-gray-600 whitespace-nowrap">{p.transaction_date}</td>
                    <td className="px-3 sm:px-5 py-3 text-sm font-bold text-red-600 whitespace-nowrap">-{formatRp(Number(p.amount))}</td>
                    <td className="px-3 sm:px-5 py-3"><Chip size="sm" color={p.status === "Lunas" ? "success" : "warning"} variant="flat">{p.status}</Chip></td>
                  </tr>
                ))}
                {expenses.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-400">Belum ada pengeluaran</td></tr>}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== INVOICES & PO ==========
  const renderInvoices = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl font-bold text-gray-900">Invoices & Purchase Orders</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="flat" className="rounded-xl font-semibold bg-white border border-gray-200 shadow-sm flex-1 sm:flex-initial text-xs sm:text-sm" onPress={() => { setPOForm({ supplier: "", item_description: "", amount: 0 }); onPOOpen(); }}>Buat PO Baru</Button>
          <Button className="bg-indigo-600 text-white rounded-xl font-semibold shadow-md shadow-indigo-200 flex-1 sm:flex-initial text-xs sm:text-sm" startContent={<Plus className="w-4 h-4" />} onPress={() => { setInvForm({ client_name: "", client_email: "", amount: 0, status: "Draft", due_date: "", notes: "" }); onInvOpen(); }}>Generate Invoice</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100"><h3 className="font-bold text-gray-900">Daftar Invoice</h3></div>
          <div className="table-responsive">
          <table className="w-full min-w-[550px]">
            <thead className="bg-gray-50"><tr>{["ID", "Klien", "Nominal", "Status", "Aksi"].map(h => <th key={h} className="text-left text-xs font-semibold text-gray-500 px-3 sm:px-5 py-3 whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-sm font-semibold text-indigo-600">{inv.invoice_number}</td>
                  <td className="px-5 py-3 text-sm text-gray-800">{inv.client_name}</td>
                  <td className="px-5 py-3 text-sm font-bold text-gray-900">{formatRp(Number(inv.amount))}</td>
                  <td className="px-5 py-3"><Chip size="sm" color={inv.status === "Paid" ? "success" : inv.status === "Draft" ? "default" : "danger"} variant="flat">{inv.status}</Chip></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {inv.status !== "Paid" && <Button size="sm" color="success" variant="flat" className="text-xs" onPress={async () => { await updateInvoiceStatus(inv.id, "Paid"); loadData("invoices"); showToast("Invoice marked as Paid!"); }}>Paid</Button>}
                      <Button isIconOnly aria-label="Hapus invoice" size="sm" variant="light" onPress={async () => { await deleteInvoice(inv.id); loadData("invoices"); showToast("Invoice dihapus"); }}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Belum ada invoice</td></tr>}
            </tbody>
          </table>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100"><h3 className="font-bold text-gray-900">Purchase Orders (PO)</h3></div>
          <div className="table-responsive">
          <table className="w-full min-w-[650px]">
            <thead className="bg-gray-50"><tr>{["ID PO", "Supplier", "Barang", "Total", "Status", "Aksi"].map(h => <th key={h} className="text-left text-xs font-semibold text-gray-500 px-3 sm:px-5 py-3 whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody>
              {purchaseOrders.map((po: any) => (
                <tr key={po.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-sm font-semibold text-indigo-600">{po.po_number}</td>
                  <td className="px-5 py-3 text-sm text-gray-800">{po.supplier}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{po.item_description}</td>
                  <td className="px-5 py-3 text-sm font-bold text-gray-900">{formatRp(Number(po.amount))}</td>
                  <td className="px-5 py-3 flex gap-2">
                    {po.status === "Pending" ? (
                      <Button size="sm" color="success" variant="flat" onPress={async () => { await updatePOStatus(po.id, "Approved"); loadData("invoices"); showToast("PO Approved!"); }}>Approve</Button>
                    ) : (
                      <Chip size="sm" color={po.status === "Approved" ? "success" : "default"} variant="flat">{po.status}</Chip>
                    )}
                    <Button isIconOnly aria-label="Hapus PO" size="sm" variant="light" onPress={async () => { await deletePurchaseOrder(po.id); loadData("invoices"); showToast("PO dihapus permanen"); }}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                  </td>
                </tr>
              ))}
              {purchaseOrders.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">Belum ada PO</td></tr>}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );

  // ========== BUDGETING ==========
  const renderBudgeting = () => (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-900">Sistem Budgeting</h2>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-900">Budget Cabang (Bulan Ini)</h3>
          <Button size="sm" variant="flat" color="primary">Set Budget Tahunan</Button>
        </div>
        <div className="space-y-6">
          {budgets.map((b: any) => {
            const pct = b.total_budget > 0 ? (Number(b.used_budget) / Number(b.total_budget)) * 100 : 0;
            const over = pct > 100;
            return (
              <div key={b.id}>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{(b.outlets as any)?.name || "Cabang"}</p>
                    <p className="text-xs text-gray-500">Terpakai: {formatRp(Number(b.used_budget))} / {formatRp(Number(b.total_budget))}</p>
                  </div>
                  <span className={`text-sm font-bold ${over ? "text-red-500" : "text-emerald-500"}`}>{pct.toFixed(0)}%</span>
                </div>
                <Progress value={pct > 100 ? 100 : pct} color={over ? "danger" : pct > 80 ? "warning" : "success"} className="h-2" />
                {over && <p className="text-[10px] text-red-500 mt-1 font-semibold">*Budget terlampaui!</p>}
              </div>
            );
          })}
          {budgets.length === 0 && <p className="text-gray-400 text-center py-10">Belum ada data budget</p>}
        </div>
      </div>
    </div>
  );

  // ========== REPORTS ==========
  const renderReports = () => (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-900">Sistem Laporan Keuangan</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          "Laba Rugi (P&L)", "Neraca (Balance Sheet)", "Arus Kas (Cash Flow)", "Buku Besar (General Ledger)",
          "Jurnal Umum", "Trial Balance", "Laporan Pajak", "Laporan Cabang"
        ].map((rep, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-500 transition-colors">
              <FileText className="w-5 h-5 text-indigo-500 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-gray-800">{rep}</h3>
            <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" className="bg-indigo-100 text-indigo-700 flex-1" onPress={() => { setSelectedReport(rep); onRepOpen(); }}>View</Button>
              <Button size="sm" className="bg-green-100 text-green-700 flex-1" onPress={() => { showToast(`Mengekspor ${rep} ke Excel...`); }}>Excel</Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isRepOpen} onClose={onRepClose} size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Laporan: {selectedReport}</ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <p className="text-sm text-indigo-800">Menampilkan data agregasi realtime untuk <strong>{selectedReport}</strong> bulan ini.</p>
                  </div>
                  {/* Generic Table to show aggregated data */}
                  <table className="w-full mt-4">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm">Deskripsi</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-600 text-sm">Nominal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">Total Pemasukan</td>
                        <td className="py-3 px-4 text-sm font-bold text-right text-emerald-600">{formatRp(overview.incomeMonth)}</td>
                      </tr>
                      <tr className="border-b border-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">Total Pengeluaran</td>
                        <td className="py-3 px-4 text-sm font-bold text-right text-red-600">-{formatRp(overview.expenseMonth)}</td>
                      </tr>
                      <tr className="border-t-2 border-gray-200 bg-gray-50/50">
                        <td className="py-3 px-4 text-sm font-black text-gray-900">Total Net / Laba</td>
                        <td className="py-3 px-4 text-sm font-black text-right text-indigo-700">{formatRp(overview.incomeMonth - overview.expenseMonth)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>Tutup</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );

  const renderContent = () => {
    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>;
    switch (activeTab) {
      case "overview": return renderOverview();
      case "transactions": return renderTransactions();
      case "invoices": return renderInvoices();
      case "budget": return renderBudgeting();
      case "reports": return renderReports();
      default: return renderOverview();
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
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
              <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                <Button color="danger" variant="flat" className="font-semibold shadow-sm text-xs sm:text-sm flex-1 sm:flex-initial" startContent={<Trash2 className="w-4 h-4" />} onPress={async () => { if(confirm('Yakin ingin mereset semua data dummy keuangan?')) { await resetFinanceData(); loadData('overview'); showToast('Data berhasil di-reset!'); } }}>Reset Data</Button>
                <Button variant="flat" className="bg-white border border-gray-200 shadow-sm font-semibold text-xs sm:text-sm flex-1 sm:flex-initial" startContent={<Filter className="w-4 h-4" />}>Filter</Button>
                <Button className="bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-200 text-xs sm:text-sm w-full sm:w-auto" startContent={<Plus className="w-4 h-4" />} onPress={() => { setTxForm({ type: "income", category: "", amount: 0, description: "", status: "Lunas", transaction_date: new Date().toISOString().split("T")[0] }); onTxOpen(); }}>Buat Jurnal Baru</Button>
              </div>
            )}
          </div>
          <div className="pb-20">{renderContent()}</div>
        </div>
      </div>

      {/* ========== MODALS ========== */}
      {/* Transaction Modal */}
      <Modal isOpen={isTxOpen} onClose={onTxClose} size="lg" classNames={{ base: "rounded-3xl" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Catat Transaksi Baru</ModalHeader>
              <ModalBody className="space-y-4">
                <div className="flex gap-2">
                  {["income", "expense"].map(t => (
                    <Button key={t} className={`flex-1 font-semibold ${txForm.type === t ? (t === "income" ? "bg-emerald-500 text-white" : "bg-red-500 text-white") : "bg-gray-100 text-gray-600"}`} onPress={() => setTxForm({...txForm, type: t})}>
                      {t === "income" ? "Pemasukan" : "Pengeluaran"}
                    </Button>
                  ))}
                </div>
                <Input label="Kategori" value={txForm.category} onChange={(e) => setTxForm({...txForm, category: e.target.value})} placeholder="QRIS, Cash, GoFood, Bahan Baku, Gaji..." />
                <Input label="Nominal" type="number" value={String(txForm.amount)} onChange={(e) => setTxForm({...txForm, amount: Number(e.target.value)})} />
                <Input label="Deskripsi" value={txForm.description} onChange={(e) => setTxForm({...txForm, description: e.target.value})} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Tanggal" type="date" value={txForm.transaction_date} onChange={(e) => setTxForm({...txForm, transaction_date: e.target.value})} />
                  <Input label="Status" value={txForm.status} onChange={(e) => setTxForm({...txForm, status: e.target.value})} placeholder="Lunas / Pending" />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button className="bg-indigo-600 text-white font-bold" onPress={async () => {
                  try { await addTransaction(txForm); showToast("Transaksi disimpan!"); onClose(); loadData(activeTab); }
                  catch (e: any) { showToast(e.message, "error"); }
                }}>Simpan</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Invoice Modal */}
      <Modal isOpen={isInvOpen} onClose={onInvClose} size="lg" classNames={{ base: "rounded-3xl" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Generate Invoice Baru</ModalHeader>
              <ModalBody className="space-y-4">
                <Input label="Nama Klien" value={invForm.client_name} onChange={(e) => setInvForm({...invForm, client_name: e.target.value})} />
                <Input label="Email Klien" value={invForm.client_email} onChange={(e) => setInvForm({...invForm, client_email: e.target.value})} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Nominal" type="number" value={String(invForm.amount)} onChange={(e) => setInvForm({...invForm, amount: Number(e.target.value)})} />
                  <Input label="Jatuh Tempo" type="date" value={invForm.due_date} onChange={(e) => setInvForm({...invForm, due_date: e.target.value})} />
                </div>
                <Textarea label="Catatan" value={invForm.notes} onChange={(e) => setInvForm({...invForm, notes: e.target.value})} />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button className="bg-indigo-600 text-white font-bold" onPress={async () => {
                  try { await addInvoice(invForm); showToast("Invoice dibuat!"); onClose(); loadData("invoices"); }
                  catch (e: any) { showToast(e.message, "error"); }
                }}>Generate</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* PO Modal */}
      <Modal isOpen={isPOOpen} onClose={onPOClose} size="md" classNames={{ base: "rounded-3xl" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Buat Purchase Order Baru</ModalHeader>
              <ModalBody className="space-y-4">
                <Input label="Supplier" value={poForm.supplier} onChange={(e) => setPOForm({...poForm, supplier: e.target.value})} />
                <Input label="Deskripsi Barang" value={poForm.item_description} onChange={(e) => setPOForm({...poForm, item_description: e.target.value})} />
                <Input label="Total Harga" type="number" value={String(poForm.amount)} onChange={(e) => setPOForm({...poForm, amount: Number(e.target.value)})} />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button className="bg-indigo-600 text-white font-bold" onPress={async () => {
                  try { await addPurchaseOrder(poForm); showToast("PO dibuat!"); onClose(); loadData("invoices"); }
                  catch (e: any) { showToast(e.message, "error"); }
                }}>Buat PO</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Kas Mutation Modal */}
      <Modal isOpen={isMutOpen} onClose={onMutClose} size="md" classNames={{ base: "rounded-3xl" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Mutasi Kas</ModalHeader>
              <ModalBody className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Pilih Akun Kas</p>
                  <div className="flex flex-wrap gap-2">
                    {(kasAccounts || []).map((k: any) => (
                      <div key={k.id} onClick={() => setMutForm({...mutForm, kas_account_id: k.id})}>
                        <Chip className={`cursor-pointer ${mutForm.kas_account_id === k.id ? "bg-indigo-500 text-white" : "bg-gray-100"}`}>{k.name}</Chip>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  {["credit", "debit"].map(t => (
                    <Button key={t} className={`flex-1 font-semibold ${mutForm.type === t ? (t === "credit" ? "bg-emerald-500 text-white" : "bg-red-500 text-white") : "bg-gray-100 text-gray-600"}`} onPress={() => setMutForm({...mutForm, type: t})}>
                      {t === "credit" ? "Masuk (Credit)" : "Keluar (Debit)"}
                    </Button>
                  ))}
                </div>
                <Input label="Jumlah" type="number" value={String(mutForm.amount)} onChange={(e) => setMutForm({...mutForm, amount: Number(e.target.value)})} />
                <Input label="Keterangan" value={mutForm.description} onChange={(e) => setMutForm({...mutForm, description: e.target.value})} />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button className="bg-indigo-600 text-white font-bold" onPress={async () => {
                  try { await addKasMutation(mutForm); showToast("Mutasi berhasil!"); onClose(); loadData("overview"); }
                  catch (e: any) { showToast(e.message, "error"); }
                }}>Proses Mutasi</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm flex items-center gap-2 ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};
