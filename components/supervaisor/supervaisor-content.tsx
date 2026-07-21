"use client";
import React, { useState, useEffect } from "react";
import { Avatar, Input, Button, Chip, Progress, Checkbox, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Textarea, Select, SelectItem } from "@nextui-org/react";
import {
  Search, Grid, Bell, Calendar, Users, Settings, ArrowUpRight,
  ChevronRight, CheckCircle2, Clock, Package, PackageMinus, PackagePlus,
  RefreshCw, ClipboardCheck, Wrench, AlertTriangle, MessageSquareWarning,
  ThumbsUp, Target, BarChart, BookOpen, Droplets, Scale, Calculator, ListTodo, ThumbsDown,
  Plus, Edit, Trash2, X, Check, Menu
} from "lucide-react";
import {
  getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem,
  getChecklists, toggleChecklistItem, addChecklistItem,
  getRecipes, addRecipe, updateRecipe, deleteRecipe,
  getBatchProductions, addBatchProduction, updateBatchStatus,
  getMaintenanceReports, addMaintenanceReport, updateMaintenanceStatus,
  getComplaints, addComplaint, updateComplaintStatus,
  getApprovalRequests, addApprovalRequest, updateApprovalStatus,
  getDashboardStats,
} from "@/app/actions/supervisor";

export const SupervaisorContent = () => {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const formatRp = (num: number) => `Rp ${num.toLocaleString("id-ID")}`;

  // ========== STATE ==========
  const [inventory, setInventory] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [productions, setProductions] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalSales: 0, totalOrders: 0, pendingApprovals: 0, lowStockCount: 0 });
  const [loading, setLoading] = useState(false);

  // Modal states
  const { isOpen: isInvOpen, onOpen: onInvOpen, onClose: onInvClose } = useDisclosure();
  const [invForm, setInvForm] = useState<any>({ name: "", category: "Beans", stock: 0, min_stock: 0, unit: "pcs", supplier: "" });
  const [editInvId, setEditInvId] = useState<string | null>(null);

  const { isOpen: isRecipeOpen, onOpen: onRecipeOpen, onClose: onRecipeClose } = useDisclosure();
  const [recipeForm, setRecipeForm] = useState<any>({ name: "", category: "Coffee", cogs: 0, price: 0, ingredients: [] });
  const [editRecipeId, setEditRecipeId] = useState<string | null>(null);

  const { isOpen: isProdOpen, onOpen: onProdOpen, onClose: onProdClose } = useDisclosure();
  const [prodForm, setProdForm] = useState<any>({ product_name: "", batch_qty: 0, unit: "liter", notes: "" });

  const { isOpen: isMaintOpen, onOpen: onMaintOpen, onClose: onMaintClose } = useDisclosure();
  const [maintForm, setMaintForm] = useState<any>({ equipment_name: "", issue_description: "", priority: "Medium" });

  const { isOpen: isCompOpen, onOpen: onCompOpen, onClose: onCompClose } = useDisclosure();
  const [compForm, setCompForm] = useState<any>({ source: "Customer", description: "", rating: 0 });

  // Toast
  const [toast, setToast] = useState<{show: boolean, msg: string, type: string}>({ show: false, msg: "", type: "success" });
  const showToast = (msg: string, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3000);
  };

  // ========== FETCH DATA ==========
  const loadData = async (menu: string) => {
    try {
      setLoading(true);
      switch (menu) {
        case "dashboard":
          const [statsData, approvalsData] = await Promise.all([getDashboardStats(), getApprovalRequests()]);
          setStats(statsData);
          setApprovals(approvalsData.filter((a: any) => a.status === "Pending"));
          break;
        case "inventory": setInventory(await getInventory()); break;
        case "checklist": setChecklists(await getChecklists()); break;
        case "recipes": setRecipes(await getRecipes()); break;
        case "produksi": setProductions(await getBatchProductions()); break;
        case "maintenance": setMaintenance(await getMaintenanceReports()); break;
        case "complaint": setComplaints(await getComplaints()); break;
        case "reports":
          const [salesStats, allApprovals] = await Promise.all([getDashboardStats(), getApprovalRequests()]);
          setStats(salesStats);
          setApprovals(allApprovals);
          break;
      }
    } catch (e) {
      console.error("Error loading data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(activeMenu); }, [activeMenu]);

  // ========== DASHBOARD ==========
  const renderDashboard = () => (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#22252A]">Daily KPI</h2>
          <span className="text-sm font-semibold text-gray-400 hover:text-gray-600 cursor-pointer">View All</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)] transition-all">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center"><ArrowUpRight className="w-6 h-6 text-red-500" /></div>
              <div><h3 className="font-bold text-gray-900 text-sm leading-tight">Total<br/>Penjualan</h3></div>
            </div>
            <div className="flex justify-between items-end">
              <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Today</p></div>
              <div className="text-right"><h4 className="font-black text-gray-900">{formatRp(stats.totalSales)}</h4></div>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)] transition-all">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center"><Package className="w-6 h-6 text-emerald-500" /></div>
              <div><h3 className="font-bold text-gray-900 text-sm leading-tight">Total<br/>Order</h3></div>
            </div>
            <div className="flex justify-between items-end">
              <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Today</p></div>
              <div className="text-right"><h4 className="font-black text-gray-900">{stats.totalOrders}</h4></div>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)] transition-all">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-orange-500" /></div>
              <div><h3 className="font-bold text-gray-900 text-sm leading-tight">Low<br/>Stock</h3></div>
            </div>
            <div className="flex justify-between items-end">
              <div><p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Items</p></div>
              <div className="text-right"><h4 className={`font-black ${stats.lowStockCount > 0 ? "text-red-500" : "text-gray-900"}`}>{stats.lowStockCount}</h4></div>
            </div>
          </div>
          <div className="bg-[#22252A] rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full border-2 border-[#D3E066] flex items-center justify-center"><div className="w-2 h-2 bg-[#D3E066] rounded-full"></div></div>
                <span className="text-white font-bold text-sm">KotaCoffee</span>
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Pending<br/>Approvals</h3>
              <p className="text-3xl font-black text-[#D3E066]">{stats.pendingApprovals}</p>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 group-hover:scale-110 transition-transform duration-500">
              <Clock className="w-32 h-32 text-[#D3E066]" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col h-[380px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#22252A] text-lg">Perlu Persetujuan</h3>
            <Chip size="sm" color="warning" variant="flat">{approvals.length} Pending</Chip>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {approvals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <CheckCircle2 className="w-12 h-12 mb-2 opacity-30" />
                <p className="text-sm">Semua sudah diproses</p>
              </div>
            ) : approvals.map((a: any) => (
              <div key={a.id} className="flex gap-4 p-4 bg-gray-50/80 rounded-2xl border border-gray-100 hover:bg-white hover:border-gray-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-[#22252A]">{a.type}</h4>
                  </div>
                  <p className="text-sm font-semibold text-gray-500 line-clamp-1">{a.description}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wide">{a.requested_by}</p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" color="success" variant="flat" className="text-xs h-7" onPress={async () => { await updateApprovalStatus(a.id, "Approved"); loadData("dashboard"); showToast("Approved!"); }}>
                      <Check className="w-3 h-3 mr-1" /> Approve
                    </Button>
                    <Button size="sm" color="danger" variant="flat" className="text-xs h-7" onPress={async () => { await updateApprovalStatus(a.id, "Rejected"); loadData("dashboard"); showToast("Rejected", "error"); }}>
                      <X className="w-3 h-3 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] h-[380px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#22252A] text-lg">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {[
              { label: "Stock Opname", icon: Package, action: () => setActiveMenu("inventory") },
              { label: "Daily Checklist", icon: ClipboardCheck, action: () => setActiveMenu("checklist") },
              { label: "Catat Produksi", icon: Droplets, action: () => setActiveMenu("produksi") },
              { label: "Lapor Kerusakan", icon: Wrench, action: () => setActiveMenu("maintenance") },
              { label: "Input Keluhan", icon: MessageSquareWarning, action: () => setActiveMenu("complaint") },
              { label: "Buat Laporan", icon: BarChart, action: () => setActiveMenu("reports") },
            ].map((item, i) => (
              <div key={i} onClick={item.action} className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:border-[#D3E066] hover:shadow-md cursor-pointer transition-all group">
                <item.icon className="w-6 h-6 text-gray-400 group-hover:text-[#22252A] mb-2 transition-colors" />
                <p className="text-xs font-bold text-gray-500 group-hover:text-[#22252A] text-center">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ========== INVENTORY ==========
  const renderInventory = () => (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Inventory & Stock Management</h2>
        <div className="flex gap-2">
          <Button variant="flat" className="rounded-xl font-semibold border border-gray-200" onPress={() => loadData("inventory")} startContent={<RefreshCw className="w-4 h-4" />}>Refresh</Button>
          <Button className="bg-[#22252A] text-[#D3E066] rounded-xl font-semibold" startContent={<PackagePlus className="w-4 h-4" />} onPress={() => { setEditInvId(null); setInvForm({ name: "", category: "Beans", stock: 0, min_stock: 0, unit: "pcs", supplier: "" }); onInvOpen(); }}>
            Barang Masuk
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {["Item", "Kategori", "Sisa Stok", "Batas Minimum", "Supplier", "Status", "Aksi"].map(h => <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {inventory.map((inv: any) => {
              const isLow = Number(inv.stock) <= Number(inv.min_stock);
              return (
                <tr key={inv.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-sm font-semibold text-gray-800">{inv.name}</td>
                  <td className="px-5 py-3"><Chip size="sm" variant="flat">{inv.category}</Chip></td>
                  <td className={`px-5 py-3 text-sm font-bold ${isLow ? "text-red-500" : "text-gray-800"}`}>{inv.stock} {inv.unit}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{inv.min_stock} {inv.unit}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{inv.supplier || "-"}</td>
                  <td className="px-5 py-3">{isLow ? <Chip size="sm" color="danger" variant="flat">Reorder!</Chip> : <Chip size="sm" color="success" variant="flat">Aman</Chip>}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="light" className="text-blue-500 font-semibold text-xs" onPress={() => { setEditInvId(inv.id); setInvForm({ name: inv.name, category: inv.category, stock: inv.stock, min_stock: inv.min_stock, unit: inv.unit, supplier: inv.supplier || "" }); onInvOpen(); }}>
                        <Edit className="w-3 h-3 mr-1" />Edit
                      </Button>
                      <Button size="sm" variant="light" className="text-red-500 font-semibold text-xs" onPress={async () => { await deleteInventoryItem(inv.id); loadData("inventory"); showToast("Item dihapus"); }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {inventory.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Belum ada data inventaris</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ========== DAILY CHECKLIST ==========
  const renderDailyChecklist = () => (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Daily Checklist Digital</h2>
        <Chip color="primary" variant="flat">Shift: Pagi</Chip>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Opening & Cleaning
          </h3>
          <div className="space-y-3">
            {checklists.filter((c: any) => c.type === "Opening" || c.type === "Cleaning").map((c: any) => (
              <div key={c.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100">
                <Checkbox isSelected={c.is_completed} color="success" className="mt-0.5" onChange={async (e) => { await toggleChecklistItem(c.id, !c.is_completed); loadData("checklist"); }} />
                <div>
                  <p className={`text-sm font-semibold ${c.is_completed ? "text-gray-400 line-through" : "text-gray-800"}`}>{c.task}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{c.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span> Closing & Equipment
          </h3>
          <div className="space-y-3">
            {checklists.filter((c: any) => c.type === "Closing").map((c: any) => (
              <div key={c.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100">
                <Checkbox isSelected={c.is_completed} color="success" className="mt-0.5" onChange={async () => { await toggleChecklistItem(c.id, !c.is_completed); loadData("checklist"); }} />
                <div>
                  <p className={`text-sm font-semibold ${c.is_completed ? "text-gray-400 line-through" : "text-gray-800"}`}>{c.task}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{c.type}</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-6 bg-[#22252A] text-white font-semibold" onPress={() => showToast("Checklist hari ini sudah di-submit!")}>Submit Checklist Hari Ini</Button>
        </div>
      </div>
    </div>
  );

  // ========== RECIPES ==========
  const renderRecipes = () => (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Recipe & Costing Management</h2>
        <Button className="bg-[#22252A] text-[#D3E066] rounded-xl font-semibold" onPress={() => { setEditRecipeId(null); setRecipeForm({ name: "", category: "Coffee", cogs: 0, price: 0, ingredients: [] }); onRecipeOpen(); }}>Buat Resep (BoM) Baru</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes.map((r: any) => {
          const margin = r.price > 0 ? Math.round(((r.price - r.cogs) / r.price) * 100) : 0;
          return (
            <div key={r.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900">{r.product_name}</h3>
                <div className="flex items-center gap-2">
                  <Chip size="sm" className="bg-[#D3E066] text-[#22252A] font-bold">Margin: {margin}%</Chip>
                  <Button isIconOnly size="sm" variant="light" onPress={() => { setEditRecipeId(r.id); setRecipeForm({ name: r.product_name || r.name, category: r.category, cogs: r.cogs, price: r.price, ingredients: r.recipe_ingredients || [] }); onRecipeOpen(); }}><Edit className="w-4 h-4 text-gray-400" /></Button>
                  <Button isIconOnly size="sm" variant="light" onPress={async () => { await deleteRecipe(r.id); loadData("recipes"); showToast("Resep dihapus"); }}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                </div>
              </div>
              <div className="flex gap-6 mb-6"> 
                <div><p className="text-xs text-gray-500">Total Biaya (COGS)</p><p className="text-lg font-black text-gray-900">{formatRp(r.cogs)}</p></div>
                <div><p className="text-xs text-gray-500">Harga Jual</p><p className="text-lg font-black text-emerald-600">{formatRp(r.price)}</p></div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Takaran Bahan Baku (BoM)</p>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700">
                  {r.recipe_ingredients && r.recipe_ingredients.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-1">
                      {r.recipe_ingredients.map((ing: any, i: number) => (
                        <li key={i}>{ing.quantity}{ing.unit} {ing.item_name}</li>
                      ))}
                    </ul>
                  ) : "Belum diisi"}
                </div>
              </div>
            </div>
          );
        })}
        {recipes.length === 0 && (
          <div className="col-span-2 bg-white rounded-3xl p-6 border flex flex-col items-center justify-center py-20">
            <Calculator className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500">Belum ada resep. Klik tombol Buat Resep untuk menambahkan.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ========== PRODUKSI ==========
  const renderProduksi = () => (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Produksi Batch</h2>
        <Button className="bg-[#22252A] text-[#D3E066] rounded-xl font-bold" onPress={() => { setProdForm({ product_name: "", batch_qty: 0, unit: "liter", notes: "" }); onProdOpen(); }}>Catat Produksi Baru</Button>
      </div>
      {productions.length === 0 ? (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center justify-center py-20">
          <Droplets className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="font-bold text-gray-700 text-lg">Belum Ada Produksi Hari Ini</h3>
          <p className="text-gray-500 text-sm mt-2 mb-6">Mulai catat produksi cold brew atau syrup Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {productions.map((p: any) => (
            <div key={p.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-gray-800">{p.product_name}</h4>
                  <p className="text-sm text-gray-500">{p.batch_qty} {p.unit}</p>
                </div>
                <Chip size="sm" color={p.status === "Completed" ? "success" : p.status === "Failed" ? "danger" : "warning"} variant="flat">{p.status}</Chip>
              </div>
              {p.notes && <p className="text-xs text-gray-500 mb-3">{p.notes}</p>}
              {p.status === "In Progress" && (
                <div className="flex gap-2">
                  <Button size="sm" color="success" variant="flat" onPress={async () => { await updateBatchStatus(p.id, "Completed"); loadData("produksi"); showToast("Produksi selesai!"); }}>Selesai</Button>
                  <Button size="sm" color="danger" variant="flat" onPress={async () => { await updateBatchStatus(p.id, "Failed"); loadData("produksi"); }}>Gagal</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ========== MAINTENANCE ==========
  const renderMaintenance = () => (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Maintenance Peralatan</h2>
        <Button className="bg-[#22252A] text-[#D3E066] rounded-xl font-bold" onPress={() => { setMaintForm({ equipment_name: "", issue_description: "", priority: "Medium" }); onMaintOpen(); }}>Lapor Kerusakan</Button>
      </div>
      {maintenance.length === 0 ? (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col items-center justify-center py-20">
          <Wrench className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="font-bold text-gray-700 text-lg">Semua Alat Berfungsi Normal</h3>
          <p className="text-gray-500 text-sm mt-2">Ajukan keluhan jika ada alat yang rusak.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {maintenance.map((m: any) => (
            <div key={m.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.priority === "Critical" ? "bg-red-100" : m.priority === "High" ? "bg-orange-100" : "bg-blue-100"}`}>
                  <Wrench className={`w-5 h-5 ${m.priority === "Critical" ? "text-red-500" : m.priority === "High" ? "text-orange-500" : "text-blue-500"}`} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{m.equipment_name}</h4>
                  <p className="text-sm text-gray-500">{m.issue_description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Chip size="sm" color={m.status === "Resolved" ? "success" : m.status === "In Progress" ? "warning" : "danger"} variant="flat">{m.status}</Chip>
                {m.status !== "Resolved" && (
                  <Button size="sm" color="success" variant="flat" onPress={async () => { await updateMaintenanceStatus(m.id, "Resolved"); loadData("maintenance"); showToast("Masalah resolved!"); }}>Resolve</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ========== COMPLAINTS ==========
  const renderComplaint = () => (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Customer & Employee Complaint</h2>
        <Button className="bg-[#22252A] text-[#D3E066] rounded-xl font-bold" onPress={() => { setCompForm({ source: "Customer", description: "", rating: 0 }); onCompOpen(); }}>Tambah Keluhan</Button>
      </div>
      {complaints.length === 0 ? (
        <div className="bg-white rounded-3xl p-6 border flex flex-col items-center justify-center py-20">
          <ThumbsUp className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500">Belum ada keluhan. Bagus!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complaints.map((c: any) => (
            <div key={c.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <Chip size="sm" className={c.source === "Customer" ? "bg-red-50 text-red-600 font-bold" : "bg-blue-50 text-blue-600 font-bold"}>{c.source}</Chip>
                <Chip size="sm" color={c.status === "Pending" ? "danger" : c.status === "Resolved" ? "success" : "warning"} variant="flat">{c.status}</Chip>
              </div>
              <p className="text-gray-800 font-semibold mb-4">{c.description}</p>
              {c.rating > 0 && <div className="flex items-center gap-1 text-amber-500 font-bold text-sm mb-3">Rating: {c.rating} ★</div>}
              {c.status !== "Resolved" && c.status !== "Closed" && (
                <div className="flex gap-2">
                  <Button size="sm" color="warning" variant="flat" onPress={async () => { await updateComplaintStatus(c.id, "Follow Up"); loadData("complaint"); }}>Follow Up</Button>
                  <Button size="sm" color="success" variant="flat" onPress={async () => { await updateComplaintStatus(c.id, "Resolved"); loadData("complaint"); showToast("Resolved!"); }}>Resolve</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ========== REPORTS ==========
  const renderReports = () => (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-900">Laporan Outlet</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Ringkasan Hari Ini</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
              <span className="text-sm font-semibold text-gray-700">Total Penjualan</span>
              <span className="font-black text-emerald-600">{formatRp(stats.totalSales)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
              <span className="text-sm font-semibold text-gray-700">Total Order</span>
              <span className="font-black text-blue-600">{stats.totalOrders} pesanan</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
              <span className="text-sm font-semibold text-gray-700">Pending Approvals</span>
              <span className="font-black text-orange-600">{stats.pendingApprovals}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
              <span className="text-sm font-semibold text-gray-700">Low Stock Items</span>
              <span className="font-black text-red-600">{stats.lowStockCount}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Riwayat Persetujuan</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {approvals.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{a.type}: {a.description}</p>
                  <p className="text-xs text-gray-500">{a.requested_by}</p>
                </div>
                <Chip size="sm" color={a.status === "Approved" ? "success" : a.status === "Rejected" ? "danger" : "warning"} variant="flat">{a.status}</Chip>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-[#D3E066] border-t-transparent rounded-full"></div></div>;
    switch (activeMenu) {
      case "dashboard": return renderDashboard();
      case "inventory": return renderInventory();
      case "checklist": return renderDailyChecklist();
      case "recipes": return renderRecipes();
      case "produksi": return renderProduksi();
      case "maintenance": return renderMaintenance();
      case "complaint": return renderComplaint();
      case "reports": return renderReports();
      default: return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans">
      {/* MOBILE SIDEBAR OVERLAY */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden mobile-sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <div className={`w-[260px] bg-[#22252A] flex flex-col shrink-0 p-5 rounded-r-[32px] my-2 ml-2 shadow-2xl fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 md:transform-none ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex items-center justify-between mb-10 mt-2 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-full"></div></div>
            <h1 className="text-white font-bold text-xl tracking-wide">KotaCoffee</h1>
          </div>
          <button className="md:hidden p-1.5 rounded-lg hover:bg-white/10" onClick={() => setMobileSidebarOpen(false)}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {[
            { id: "dashboard", label: "Dasbor", icon: Grid },
            { id: "inventory", label: "Stok & Inventaris", icon: Package },
            { id: "checklist", label: "Daftar Periksa Harian", icon: ListTodo },
            { id: "recipes", label: "Resep & Perhitungan Biaya", icon: Calculator },
            { id: "produksi", label: "Produksi Batch", icon: Droplets },
            { id: "maintenance", label: "Pemeliharaan", icon: Wrench },
            { id: "complaint", label: "Keluhan Pelanggan", icon: MessageSquareWarning },
            { id: "reports", label: "Laporan Outlet", icon: BarChart },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveMenu(item.id); setMobileSidebarOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                activeMenu === item.id ? "bg-[#D3E066] text-[#22252A]" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto bg-[#D3E066] rounded-3xl p-6 relative overflow-hidden group cursor-pointer shadow-[0_8px_30px_rgb(211,224,102,0.3)] hidden md:block">
          <div className="relative z-10 flex flex-col">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mb-6"><ArrowUpRight className="w-4 h-4 text-[#22252A]" /></div>
            <h3 className="font-black text-[#22252A] text-lg leading-tight mb-2">Unduh<br/>Aplikasi Kami</h3>
          </div>
          <div className="absolute top-2 right-2 text-[#22252A]/20">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a4 4 0 0 1 4-4 4 4 0 0 1 4 4 4 4 0 0 1 4-4 4 4 0 0 1 4 4"/></svg>
          </div>
          <div className="absolute bottom-2 right-2 text-[#22252A]/20">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14a4 4 0 0 1 4-4 4 4 0 0 1 4 4 4 4 0 0 1 4-4 4 4 0 0 1 4 4"/></svg>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="h-16 md:h-24 px-4 md:px-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors" onClick={() => setMobileSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-[#22252A] flex items-center gap-2">Supervisor Dashboard <span className="text-lg md:text-2xl">👋</span></h1>
              <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Supervising Cabang 1 - Pusat</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Input placeholder="Search data..." startContent={<Search className="w-4 h-4 text-gray-400" />} className="w-40 md:w-64 hidden sm:block" classNames={{ inputWrapper: "bg-white border-none shadow-sm h-10 md:h-12 rounded-2xl", input: "text-sm font-medium" }} />
            <Avatar src="https://i.pravatar.cc/150?u=budi" size="md" className="ring-2 ring-white shadow-sm cursor-pointer" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 md:px-10 pb-6 md:pb-10">
          {renderContent()}
        </div>
      </div>

      {/* ========== MODALS ========== */}
      {/* Inventory Modal */}
      <Modal isOpen={isInvOpen} onClose={onInvClose} size="lg" classNames={{ base: "rounded-3xl" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{editInvId ? "Edit Item" : "Tambah Item Baru"}</ModalHeader>
              <ModalBody className="space-y-4">
                <Input label="Nama Item" value={invForm.name} onChange={(e) => setInvForm({...invForm, name: e.target.value})} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Kategori" value={invForm.category} onChange={(e) => setInvForm({...invForm, category: e.target.value})} placeholder="Beans, Milk, Syrup, Packaging" />
                  <Input label="Satuan" value={invForm.unit} onChange={(e) => setInvForm({...invForm, unit: e.target.value})} placeholder="kg, liter, pcs, btl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Stok Saat Ini" type="number" value={String(invForm.stock)} onChange={(e) => setInvForm({...invForm, stock: Number(e.target.value)})} />
                  <Input label="Batas Minimum" type="number" value={String(invForm.min_stock)} onChange={(e) => setInvForm({...invForm, min_stock: Number(e.target.value)})} />
                </div>
                <Input label="Supplier" value={invForm.supplier} onChange={(e) => setInvForm({...invForm, supplier: e.target.value})} />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button className="bg-[#22252A] text-[#D3E066] font-bold" onPress={async () => {
                  try {
                    if (editInvId) { await updateInventoryItem(editInvId, invForm); showToast("Item diperbarui!"); }
                    else { await addInventoryItem(invForm); showToast("Item ditambahkan!"); }
                    onClose(); loadData("inventory");
                  } catch (e: any) { showToast(e.message, "error"); }
                }}>Simpan</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Recipe Modal */}
      <Modal isOpen={isRecipeOpen} onClose={onRecipeClose} size="lg" classNames={{ base: "rounded-3xl" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{editRecipeId ? "Edit Resep" : "Buat Resep Baru"}</ModalHeader>
              <ModalBody className="space-y-4">
                <Input label="Nama Menu" value={recipeForm.name} onChange={(e) => setRecipeForm({...recipeForm, name: e.target.value})} />
                <Input label="Kategori" value={recipeForm.category} onChange={(e) => setRecipeForm({...recipeForm, category: e.target.value})} placeholder="Coffee, Non-Coffee, Food" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="COGS (Biaya)" type="number" value={String(recipeForm.cogs)} readOnly description="Otomatis dihitung dari bahan baku" />
                  <Input label="Harga Jual" type="number" value={String(recipeForm.price)} onChange={(e) => setRecipeForm({...recipeForm, price: Number(e.target.value)})} />
                </div>
                
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-bold text-gray-800 text-sm">Bahan Baku (BoM)</p>
                    <Button size="sm" variant="flat" color="primary" onPress={() => {
                      setRecipeForm({ ...recipeForm, ingredients: [...recipeForm.ingredients, { item_name: "", quantity: 0, unit: "gram", cost_per_unit: 0 }] });
                    }}>+ Tambah Bahan</Button>
                  </div>
                  <div className="space-y-3">
                    {recipeForm.ingredients.map((ing: any, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Select
                          size="sm"
                          label="Bahan"
                          placeholder="Pilih item..."
                          selectedKeys={ing.item_name ? [ing.item_name] : []}
                          className="w-1/2"
                          onChange={(e) => {
                            const itemName = e.target.value;
                            // Find unit from inventory to auto-fill
                            const invItem = inventory.find(inv => inv.name === itemName);
                            const updated = [...recipeForm.ingredients];
                            updated[idx] = { ...updated[idx], item_name: itemName, unit: invItem?.unit || "gram" };
                            setRecipeForm({ ...recipeForm, ingredients: updated });
                          }}
                        >
                          {inventory.map((inv: any) => (
                            <SelectItem key={inv.name} value={inv.name}>{inv.name}</SelectItem>
                          ))}
                        </Select>
                        <Input 
                          size="sm" type="number" label="Qty" className="w-1/4" 
                          value={String(ing.quantity)} 
                          onChange={(e) => {
                            const updated = [...recipeForm.ingredients];
                            updated[idx] = { ...updated[idx], quantity: Number(e.target.value) };
                            
                            // Calculate COGS
                            let totalCogs = 0;
                            updated.forEach(u => {
                               // Assuming a simple mock cost for now, or fetch from inventory if we had cost there. 
                               // Since inventory only has stock, we'll ask user to input cost_per_unit or hardcode for demo.
                               const mockCostPerUnit = 50; // Mock 50 rupiah per unit
                               u.cost_per_unit = mockCostPerUnit;
                               totalCogs += (u.quantity * u.cost_per_unit);
                            });
                            setRecipeForm({ ...recipeForm, ingredients: updated, cogs: totalCogs });
                          }} 
                        />
                        <Input size="sm" label="Unit" value={ing.unit} isReadOnly className="w-1/4" />
                        <Button isIconOnly size="sm" color="danger" variant="light" onPress={() => {
                          const updated = recipeForm.ingredients.filter((_: any, i: number) => i !== idx);
                          // Recalculate
                          let totalCogs = 0;
                          updated.forEach((u:any) => totalCogs += (u.quantity * u.cost_per_unit));
                          setRecipeForm({ ...recipeForm, ingredients: updated, cogs: totalCogs });
                        }}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    ))}
                    {recipeForm.ingredients.length === 0 && <p className="text-xs text-gray-400 italic">Belum ada bahan baku. Klik tambah bahan.</p>}
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button className="bg-[#22252A] text-[#D3E066] font-bold" onPress={async () => {
                  try {
                    if (editRecipeId) { await updateRecipe(editRecipeId, recipeForm); showToast("Resep diperbarui!"); }
                    else { await addRecipe(recipeForm); showToast("Resep ditambahkan!"); }
                    onClose(); loadData("recipes");
                  } catch (e: any) { showToast(e.message, "error"); }
                }}>Simpan</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Production Modal */}
      <Modal isOpen={isProdOpen} onClose={onProdClose} size="md" classNames={{ base: "rounded-3xl" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Catat Produksi Baru</ModalHeader>
              <ModalBody className="space-y-4">
                <Input label="Nama Produk" value={prodForm.product_name} onChange={(e) => setProdForm({...prodForm, product_name: e.target.value})} placeholder="Cold Brew, Vanilla Syrup" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Jumlah Batch" type="number" value={String(prodForm.batch_qty)} onChange={(e) => setProdForm({...prodForm, batch_qty: Number(e.target.value)})} />
                  <Input label="Satuan" value={prodForm.unit} onChange={(e) => setProdForm({...prodForm, unit: e.target.value})} placeholder="liter, btl, pcs" />
                </div>
                <Textarea label="Catatan" value={prodForm.notes} onChange={(e) => setProdForm({...prodForm, notes: e.target.value})} />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button className="bg-[#22252A] text-[#D3E066] font-bold" onPress={async () => {
                  try { await addBatchProduction(prodForm); showToast("Produksi dicatat!"); onClose(); loadData("produksi"); }
                  catch (e: any) { showToast(e.message, "error"); }
                }}>Simpan</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Maintenance Modal */}
      <Modal isOpen={isMaintOpen} onClose={onMaintClose} size="md" classNames={{ base: "rounded-3xl" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Lapor Kerusakan Alat</ModalHeader>
              <ModalBody className="space-y-4">
                <Input label="Nama Peralatan" value={maintForm.equipment_name} onChange={(e) => setMaintForm({...maintForm, equipment_name: e.target.value})} placeholder="Mesin Espresso, Grinder, Blender" />
                <Textarea label="Deskripsi Masalah" value={maintForm.issue_description} onChange={(e) => setMaintForm({...maintForm, issue_description: e.target.value})} />
                <Input label="Prioritas" value={maintForm.priority} onChange={(e) => setMaintForm({...maintForm, priority: e.target.value})} placeholder="Low, Medium, High, Critical" />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button className="bg-[#22252A] text-[#D3E066] font-bold" onPress={async () => {
                  try { await addMaintenanceReport(maintForm); showToast("Laporan dikirim!"); onClose(); loadData("maintenance"); }
                  catch (e: any) { showToast(e.message, "error"); }
                }}>Kirim Laporan</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Complaint Modal */}
      <Modal isOpen={isCompOpen} onClose={onCompClose} size="md" classNames={{ base: "rounded-3xl" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Tambah Keluhan</ModalHeader>
              <ModalBody className="space-y-4">
                <Input label="Sumber" value={compForm.source} onChange={(e) => setCompForm({...compForm, source: e.target.value})} placeholder="Customer / Karyawan" />
                <Textarea label="Deskripsi Keluhan" value={compForm.description} onChange={(e) => setCompForm({...compForm, description: e.target.value})} />
                <Input label="Rating (0-5)" type="number" value={String(compForm.rating)} onChange={(e) => setCompForm({...compForm, rating: Number(e.target.value)})} />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button className="bg-[#22252A] text-[#D3E066] font-bold" onPress={async () => {
                  try { await addComplaint(compForm); showToast("Keluhan ditambahkan!"); onClose(); loadData("complaint"); }
                  catch (e: any) { showToast(e.message, "error"); }
                }}>Simpan</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm flex items-center gap-2 transition-all ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};
