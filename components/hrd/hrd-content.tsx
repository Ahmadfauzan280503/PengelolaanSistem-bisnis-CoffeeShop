"use client";
import React, { useState, useEffect } from "react";
import { Avatar, Button, Input, Divider, Chip, Progress, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Select, SelectItem, Textarea, Switch } from "@nextui-org/react";
import { getEmployees, addEmployee, updateEmployee, deleteEmployee, getOutlets, getRoles, getShifts, addShift, deleteShift, updateShiftAttendance, getLeaveRequests, addLeaveRequest, updateLeaveStatus, getProducts, addProduct, updateProduct, deleteProduct } from "@/app/actions/hrd";
import { getFinanceOverview } from "@/app/actions/finance";
import {
  Search, Users, Package, Settings, Shield, Bell, Calendar, ChevronDown,
  MoreHorizontal, ArrowUpRight, ArrowDownRight, Coffee, BarChart2,
  UserPlus, Clock, FileText, TrendingUp, Building2, Star, AlertTriangle,
  DollarSign, Percent, CalendarDays, UserCheck, UserX, Briefcase,
  ClipboardList, Award, MapPin, Plus, Edit, Trash2, Eye, Download,
  ChevronRight, CircleDot, Timer, BadgeCheck, XCircle, Info, Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ========== SIDEBAR MENU ==========
const SIDEBAR_MENU = [
  { key: "overview", label: "Overview", icon: BarChart2, group: "MENU" },
  { key: "employees", label: "Karyawan", icon: Users, group: "MENU" },
  { key: "accounts", label: "Manajemen Akun", icon: UserPlus, group: "MENU" },
  { key: "shifts", label: "Penjadwalan Shift", icon: Clock, group: "MENU" },
  { key: "leave", label: "Cuti & Izin", icon: CalendarDays, group: "MENU" },
  { key: "products", label: "Produk", icon: Package, group: "MENU" },
  { key: "sales-monitor", label: "Penjualan", icon: TrendingUp, group: "MENU" },
  { key: "outlets", label: "Outlet", icon: Building2, group: "MENU" },
  { key: "reports", label: "Laporan", icon: FileText, group: "MENU" },
  { key: "settings", label: "Settings", icon: Settings, group: "GENERAL" },
  { key: "security", label: "Security", icon: Shield, group: "GENERAL" },
];

// ========== MOCK DATA ==========
const MOCK_EMPLOYEES = [
  { id: 1, name: "Ahmad Rizky", role: "Barista", outlet: "Cabang 1 - Pusat", status: "Active", phone: "0812-xxxx-1234", joinDate: "2024-01-15", photo: "https://i.pravatar.cc/150?u=emp1" },
  { id: 2, name: "Siti Nurhaliza", role: "Kasir", outlet: "Cabang 1 - Pusat", status: "Active", phone: "0813-xxxx-5678", joinDate: "2024-02-20", photo: "https://i.pravatar.cc/150?u=emp2" },
  { id: 3, name: "Budi Santoso", role: "Supervisor", outlet: "Cabang 2 - Selatan", status: "Active", phone: "0857-xxxx-9012", joinDate: "2023-06-10", photo: "https://i.pravatar.cc/150?u=emp3" },
  { id: 4, name: "Dewi Lestari", role: "Kasir", outlet: "Cabang 2 - Selatan", status: "Active", phone: "0878-xxxx-3456", joinDate: "2024-03-01", photo: "https://i.pravatar.cc/150?u=emp4" },
  { id: 5, name: "Eko Prasetyo", role: "Barista", outlet: "Cabang 3 - Utara", status: "Cuti", phone: "0856-xxxx-7890", joinDate: "2023-11-25", photo: "https://i.pravatar.cc/150?u=emp5" },
  { id: 6, name: "Fitri Handayani", role: "Leader", outlet: "Cabang 1 - Pusat", status: "Active", phone: "0821-xxxx-2345", joinDate: "2023-03-15", photo: "https://i.pravatar.cc/150?u=emp6" },
];

const MOCK_SHIFTS = [
  { id: 1, employee: "Ahmad Rizky", outlet: "Cabang 1", shift: "Pagi", time: "07:00 - 15:00", status: "Hadir" },
  { id: 2, employee: "Siti Nurhaliza", outlet: "Cabang 1", shift: "Siang", time: "15:00 - 23:00", status: "Hadir" },
  { id: 3, employee: "Budi Santoso", outlet: "Cabang 2", shift: "Pagi", time: "07:00 - 15:00", status: "Hadir" },
  { id: 4, employee: "Dewi Lestari", outlet: "Cabang 2", shift: "Malam", time: "23:00 - 07:00", status: "Terlambat" },
  { id: 5, employee: "Eko Prasetyo", outlet: "Cabang 3", shift: "Pagi", time: "07:00 - 15:00", status: "Cuti" },
];

const LEAVE_REQUESTS = [
  { id: 1, employee: "Eko Prasetyo", type: "Cuti Tahunan", from: "2024-07-15", to: "2024-07-18", days: 3, status: "Approved", saldo: 9 },
  { id: 2, employee: "Fitri Handayani", type: "Izin Sakit", from: "2024-07-20", to: "2024-07-20", days: 1, status: "Pending", saldo: 12 },
  { id: 3, employee: "Ahmad Rizky", type: "Cuti Tahunan", from: "2024-08-01", to: "2024-08-03", days: 3, status: "Pending", saldo: 10 },
];

const PRODUCTS = [
  { id: 1, name: "Coffee Aren Latte", category: "Coffee", price: 22000, stock: 150, bestseller: true, discount: false, discountAmt: 0, status: "Tersedia" },
  { id: 2, name: "Ice Cappuccino", category: "Coffee", price: 18000, stock: 200, bestseller: true, discount: true, discountAmt: 3000, status: "Tersedia" },
  { id: 3, name: "Matcha Latte", category: "Non-Coffee", price: 25000, stock: 0, bestseller: false, discount: false, discountAmt: 0, status: "Habis" },
  { id: 4, name: "Croissant", category: "Food", price: 15000, stock: 30, bestseller: false, discount: true, discountAmt: 2000, status: "Tersedia" },
  { id: 5, name: "Es Teh Manis", category: "Non-Coffee", price: 8000, stock: 300, bestseller: true, discount: false, discountAmt: 0, status: "Tersedia" },
  { id: 6, name: "Cold Brew", category: "Coffee", price: 28000, stock: 5, bestseller: false, discount: true, discountAmt: 5000, status: "Hampir Habis" },
  { id: 7, name: "Roti Bakar", category: "Food", price: 12000, stock: 0, bestseller: false, discount: false, discountAmt: 0, status: "Habis" },
];

const OUTLETS = [
  { id: 1, name: "Cabang 1 - Pusat", revenue: 45000000, orders: 1250, rating: 4.8, status: "Best", employees: 8 },
  { id: 2, name: "Cabang 2 - Selatan", revenue: 32000000, orders: 980, rating: 4.5, status: "Good", employees: 6 },
  { id: 3, name: "Cabang 3 - Utara", revenue: 18000000, orders: 520, rating: 3.9, status: "Worst", employees: 5 },
];

export const HrdContent = () => {
  const [activeMenu, setActiveMenu] = useState("overview");
  const [salesPeriod, setSalesPeriod] = useState("daily");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [employees, setEmployees] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  
  const { isOpen: isEmpOpen, onOpen: onEmpOpen, onOpenChange: onEmpChange } = useDisclosure();
  const [empForm, setEmpForm] = useState<any>({ name: "", role_id: "", outlet_id: "", phone: "", join_date: "", status: "Active" });
  const [editEmpId, setEditEmpId] = useState<string | null>(null);

  const [shifts, setShifts] = useState<any[]>([]);
  const { isOpen: isShiftOpen, onOpen: onShiftOpen, onOpenChange: onShiftChange } = useDisclosure();
  const [shiftForm, setShiftForm] = useState<any>({ employee_id: "", outlet_id: "", shift_type: "Pagi", shift_date: "", start_time: "", end_time: "", attendance_status: "Pending" });

  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const { isOpen: isLeaveOpen, onOpen: onLeaveOpen, onOpenChange: onLeaveChange } = useDisclosure();
  const [leaveForm, setLeaveForm] = useState<any>({ employee_id: "", leave_type: "Cuti Tahunan", start_date: "", end_date: "", total_days: 1, reason: "" });

  const [products, setProducts] = useState<any[]>([]);
  const [financeOverview, setFinanceOverview] = useState<any>(null);
  const { isOpen: isProdOpen, onOpen: onProdOpen, onOpenChange: onProdChange } = useDisclosure();
  const [prodForm, setProdForm] = useState<any>({ name: "", category: "Coffee", price: 0, stock: 0, is_bestseller: false, is_discount: false, discount_amount: 0, status: "Tersedia", image_url: "", description: "" });
  const [editProdId, setEditProdId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{show: boolean, message: string, type: "success" | "error"}>({ show: false, message: "", type: "success" });
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // Cyber Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  const fetchData = async () => {
    try {
      setEmployees(await getEmployees());
      setShifts(await getShifts());
      setLeaveRequests(await getLeaveRequests());
      setProducts(await getProducts());
      setOutlets(await getOutlets());
      setRoles(await getRoles());
      setFinanceOverview(await getFinanceOverview());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveShift = async () => {
    try {
      await addShift(shiftForm);
      fetchData();
      showToast("Shift berhasil disimpan!");
      onShiftChange();
    } catch (error) {
      console.error(error);
      showToast("Error saving shift", "error");
    }
  };

  const handleSaveEmployee = async () => {
    try {
      if (editEmpId) {
        await updateEmployee(editEmpId, empForm);
      } else {
        await addEmployee(empForm);
      }
      fetchData();
      showToast("Karyawan berhasil disimpan!");
      onEmpChange();
      setEmpForm({ name: "", role_id: "", outlet_id: "", phone: "", join_date: "", status: "Active" });
      setEditEmpId(null);
    } catch (error) {
      console.error(error);
      showToast("Error saving employee", "error");
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Peringatan Sistem",
      message: "Apakah Anda yakin ingin menghapus data karyawan ini? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.",
      onConfirm: async () => {
        try {
          await deleteEmployee(id);
          fetchData();
          showToast("Karyawan berhasil dihapus!");
        } catch (error) {
          showToast("Gagal menghapus karyawan", "error");
        }
      }
    });
  };

  const handleEditEmployee = (emp: any) => {
    setEmpForm({
      name: emp.name,
      role_id: emp.roles?.id?.toString() || "",
      outlet_id: emp.outlets?.id?.toString() || "",
      phone: emp.phone || "",
      join_date: emp.join_date || "",
      status: emp.status || "Active"
    });
    setEditEmpId(emp.id);
    onEmpOpen();
  };

  const handleSaveLeave = async () => {
    try {
      await addLeaveRequest(leaveForm);
      fetchData();
      showToast("Cuti/Izin berhasil diajukan!");
      onLeaveChange();
      setLeaveForm({ employee_id: "", leave_type: "Cuti Tahunan", start_date: "", end_date: "", total_days: 1, reason: "" });
    } catch (error) {
      console.error(error);
      showToast("Error submitting leave request", "error");
    }
  };

  const handleLeaveAction = async (id: string, status: string) => {
    try {
      await updateLeaveStatus(id, status);
      fetchData();
      showToast(`Status cuti/izin diubah menjadi ${status}`);
    } catch (error) {
      console.error(error);
      showToast("Error updating leave status", "error");
    }
  };

  const handleSaveProduct = async () => {
    try {
      if (editProdId) {
        await updateProduct(editProdId, prodForm);
      } else {
        await addProduct(prodForm);
      }
      fetchData();
      showToast("Produk berhasil disimpan!");
      onProdChange();
      setProdForm({ name: "", category: "Coffee", price: 0, stock: 0, is_bestseller: false, is_discount: false, discount_amount: 0, status: "Tersedia", image_url: "", description: "" });
      setEditProdId(null);
    } catch (error) {
      console.error(error);
      showToast("Error saving product", "error");
    }
  };

  const handleEditProduct = (p: any) => {
    setProdForm({
      name: p.name, category: p.category, price: p.price,
      stock: p.stock, is_bestseller: p.is_bestseller, is_discount: p.is_discount,
      discount_amount: p.discount_amount, status: p.status, image_url: p.image_url || "",
      description: p.description || ""
    });
    setEditProdId(p.id);
    onProdOpen();
  };

  const handleDeleteProduct = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Peringatan Sistem",
      message: "Apakah Anda yakin ingin menghapus data produk ini? Data yang terhapus tidak dapat dikembalikan.",
      onConfirm: async () => {
        try {
          await deleteProduct(id);
          fetchData();
          showToast("Produk berhasil dihapus!");
        } catch (error) {
          showToast("Gagal menghapus produk", "error");
        }
      }
    });
  };

  const formatRp = (num: number) => `Rp ${num.toLocaleString("id-ID")}`;

  // ========== OVERVIEW SECTION ==========
  const renderOverview = () => (
    <div className="flex flex-col gap-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Karyawan", value: String(employees.length || 0), sub: `${outlets.length || 0} Cabang`, icon: Users, color: "bg-emerald-500", trend: "Real-time" },
          { label: "Total Outlet Aktif", value: String(outlets.length || 0), sub: "Beroperasi", icon: Building2, color: "bg-blue-500", trend: "Real-time" },
          { label: "Total Produk", value: String(products.length || 0), sub: "Menu aktif", icon: Package, color: "bg-amber-500", trend: "Real-time" },
          { label: "Jadwal Shift", value: String(shifts.length || 0), sub: "Hari ini", icon: Clock, color: "bg-purple-500", trend: "Real-time" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-semibold text-gray-400">{stat.trend}</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
            <p className="text-xs font-medium text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Pengajuan Cuti", value: `${leaveRequests.filter((l: any) => l.status === 'Pending').length} pending`, icon: CalendarDays, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Produk Habis", value: `${products.filter((p: any) => p.stock === 0).length} produk`, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Bestseller", value: `${products.filter((p: any) => p.is_bestseller).length} produk`, icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Karyawan Cuti", value: `${employees.filter((e: any) => e.status === 'Cuti').length} orang`, icon: UserX, color: "text-red-600", bg: "bg-red-50" },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-2xl p-5 border border-gray-100`}>
            <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Penjualan</h3>
            <div className="flex gap-2">
              {["Harian", "Bulanan", "Tahunan"].map(p => (
                <button key={p} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${salesPeriod === p.toLowerCase().replace("an","") ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  onClick={() => setSalesPeriod(p.toLowerCase().replace("an",""))}>{p}</button>
              ))}
            </div>
          </div>
          <div className="flex items-end justify-between h-40 px-2">
            {[65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 92].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full max-w-[20px] bg-emerald-100 rounded-t-sm relative" style={{ height: `${h}%` }}>
                  <div className="absolute inset-0 bg-emerald-500 rounded-t-sm opacity-80"></div>
                </div>
                <span className="text-[9px] text-gray-400 font-medium">
                  {salesPeriod === "harian" ? `${i + 1}` : salesPeriod === "bulan" ? ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][i] : `${2019 + i}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Outlet Comparison */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">Outlet Terdaftar</h3>
          {outlets.length > 0 ? (
            <div className="space-y-4">
              {outlets.map((outlet: any) => (
                <div key={outlet.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{outlet.name}</p>
                    <p className="text-xs text-gray-400">{outlet.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Belum ada outlet terdaftar</p>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Laba Bulanan */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2">Ringkasan Data</h3>
          <div className="space-y-3 mt-4">
            <div className="flex justify-between"><span className="text-sm text-gray-500">Total Karyawan</span><span className="text-sm font-bold">{employees.length}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Total Produk</span><span className="text-sm font-bold">{products.length}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-500">Total Outlet</span><span className="text-sm font-bold">{outlets.length}</span></div>
          </div>
        </div>

        {/* Cash Flow */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-2">Status Shift Hari Ini</h3>
          <div className="flex justify-between mt-4">
            <div>
              <p className="text-[10px] text-gray-400 font-semibold">Hadir</p>
              <p className="text-lg font-bold text-emerald-600">{shifts.filter((s: any) => s.attendance_status === 'Hadir').length}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold">Terlambat</p>
              <p className="text-lg font-bold text-orange-500">{shifts.filter((s: any) => s.attendance_status === 'Terlambat').length}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold">Pending</p>
              <p className="text-lg font-bold text-gray-500">{shifts.filter((s: any) => s.attendance_status === 'Pending').length}</p>
            </div>
          </div>
        </div>

        {/* Pengeluaran Operasional */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Pengeluaran Operasional</h3>
          <div className="space-y-2">
            {[
              { label: "Bahan Baku", value: 35000000, pct: 53 },
              { label: "Gaji Karyawan", value: 22000000, pct: 33 },
              { label: "Operasional", value: 9500000, pct: 14 },
            ].map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium">{exp.label}</span>
                  <span className="text-gray-900 font-bold">{exp.pct}%</span>
                </div>
                <Progress aria-label={exp.label} value={exp.pct} size="sm" color={i === 0 ? "warning" : i === 1 ? "primary" : "secondary"} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ========== EMPLOYEES SECTION ==========
  const renderEmployees = () => (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Database Karyawan</h2>
          <Button className="bg-emerald-500 text-white rounded-xl h-10 px-5 font-semibold" startContent={<Plus className="w-4 h-4" />} onPress={() => { setEmpForm({ name: "", role_id: "", outlet_id: "", phone: "", join_date: "", status: "Active" }); setEditEmpId(null); onEmpOpen(); }}>Tambah Karyawan</Button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[800px] whitespace-nowrap">
            <thead className="bg-gray-50">
              <tr>
                {["Karyawan", "Jabatan", "Outlet", "No. Telp", "Tanggal Masuk", "Status", "Aksi"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp: any) => (
                <tr key={emp.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={emp.photo_url || `https://i.pravatar.cc/150?u=${emp.id}`} size="sm" />
                      <span className="text-sm font-semibold text-gray-800">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><Chip size="sm" variant="flat" color={emp.roles?.name === "Supervisor" ? "secondary" : emp.roles?.name === "Leader" ? "primary" : "default"}>{emp.roles?.name}</Chip></td>
                  <td className="px-5 py-3 text-sm text-gray-600">{emp.outlets?.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{emp.phone}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{emp.join_date}</td>
                  <td className="px-5 py-3"><Chip size="sm" color={emp.status === "Active" ? "success" : "warning"}>{emp.status}</Chip></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      <Button isIconOnly size="sm" variant="light" aria-label="Edit karyawan" onPress={() => handleEditEmployee(emp)}><Edit className="w-4 h-4 text-gray-400" /></Button>
                      <Button isIconOnly size="sm" variant="light" aria-label="Hapus karyawan" onPress={() => handleDeleteEmployee(emp.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg shadow-gray-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 opacity-50 translate-x-1/2 -translate-y-1/2"></div>
            <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-2">
              <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
              Struktur Organisasi & Jabatan
            </h3>
            <div className="flex flex-col items-center relative z-10 w-full">
              {/* Owner */}
              <div className="flex flex-col items-center z-10">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded-2xl px-8 py-3.5 font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center gap-2 border border-white/20">
                  <Award className="w-5 h-5 text-emerald-100" />
                  OWNER
                </div>
                <div className="w-px h-8 bg-gradient-to-b from-emerald-400 to-gray-300"></div>
              </div>
              
              {/* Middle Layer Container */}
              <div className="relative flex justify-center w-full z-10">
                {/* Horizontal connecting line */}
                <div className="absolute top-0 w-2/3 h-px bg-gray-300 -z-10"></div>
                
                <div className="flex justify-between w-full max-w-2xl px-4">
                  {/* HRD */}
                  <div className="flex flex-col items-center relative">
                    <div className="w-px h-6 bg-gray-300 absolute -top-6"></div>
                    <div className="bg-white border-2 border-blue-500 text-blue-600 rounded-xl px-6 py-2.5 font-bold text-sm shadow-lg shadow-blue-500/20 flex items-center gap-2 hover:-translate-y-1 transition-transform cursor-pointer">
                      <Users className="w-4 h-4" />
                      HRD
                    </div>
                  </div>
                  
                  {/* Finance */}
                  <div className="flex flex-col items-center relative">
                    <div className="w-px h-6 bg-gray-300 absolute -top-6"></div>
                    <div className="bg-white border-2 border-indigo-500 text-indigo-600 rounded-xl px-6 py-2.5 font-bold text-sm shadow-lg shadow-indigo-500/20 flex items-center gap-2 hover:-translate-y-1 transition-transform cursor-pointer">
                      <DollarSign className="w-4 h-4" />
                      Finance
                    </div>
                  </div>
                  
                  {/* Supervisor */}
                  <div className="flex flex-col items-center relative">
                    <div className="w-px h-6 bg-gray-300 absolute -top-6"></div>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-xl px-6 py-2.5 font-bold text-sm shadow-xl shadow-blue-500/30 flex items-center gap-2 hover:-translate-y-1 transition-transform cursor-pointer">
                      <Briefcase className="w-4 h-4 text-blue-100" />
                      Supervisor
                    </div>
                    
                    <div className="w-px h-8 bg-gradient-to-b from-blue-400 to-gray-300"></div>
                    
                    {/* Leader */}
                    <div className="bg-purple-100 border border-purple-200 text-purple-700 rounded-xl px-6 py-2 font-bold text-xs shadow-sm flex items-center gap-1.5 relative z-10 cursor-pointer">
                      <Star className="w-3.5 h-3.5" />
                      Leader
                    </div>
                    
                    <div className="w-px h-8 bg-gray-300 relative">
                       {/* Horizontal connecting line for bottom layer */}
                       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140px] h-px bg-gray-300"></div>
                    </div>
                    
                    {/* Barista & Kasir */}
                    <div className="flex justify-between w-[160px] relative z-10 pt-2">
                       <div className="flex flex-col items-center cursor-pointer">
                         <div className="w-px h-4 bg-gray-300 absolute top-0"></div>
                         <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-4 py-2 font-semibold text-xs shadow-sm hover:bg-gray-100 transition-colors flex items-center gap-1.5">
                           <Coffee className="w-3.5 h-3.5 text-gray-500" />
                           Barista
                         </div>
                       </div>
                       
                       <div className="flex flex-col items-center cursor-pointer">
                         <div className="w-px h-4 bg-gray-300 absolute top-0"></div>
                         <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-4 py-2 font-semibold text-xs shadow-sm hover:bg-gray-100 transition-colors flex items-center gap-1.5">
                           <Package className="w-3.5 h-3.5 text-gray-500" />
                           Kasir
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Riwayat Mutasi & Promosi</h3>
            <div className="space-y-3">
              {[
                { emp: "Fitri Handayani", from: "Barista", to: "Leader", date: "2024-06-01", type: "Promosi" },
                { emp: "Budi Santoso", from: "Cabang 1", to: "Cabang 2 (Supervisor)", date: "2024-04-15", type: "Mutasi" },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <Award className={`w-5 h-5 ${m.type === "Promosi" ? "text-yellow-500" : "text-blue-500"}`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{m.emp}</p>
                    <p className="text-xs text-gray-500">{m.from} → {m.to}</p>
                  </div>
                  <Chip size="sm" color={m.type === "Promosi" ? "warning" : "primary"}>{m.type}</Chip>
                  <span className="text-xs text-gray-400">{m.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </>
  );

  // ========== ACCOUNTS SECTION ==========
  const renderAccounts = () => (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Kelola Akun Sistem</h2>
        <Button 
          className="bg-emerald-500 text-white rounded-xl h-10 px-5 font-semibold" 
          startContent={<UserPlus className="w-4 h-4" />}
          onPress={() => {
            setEmpForm({ name: "", role_id: "", outlet_id: "", phone: "", join_date: "", status: "Active" }); 
            setEditEmpId(null); 
            onEmpOpen(); 
          }}
        >
          Buat Akun Baru
        </Button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[800px] whitespace-nowrap">
          <thead className="bg-gray-50">
            <tr>
              {["Nama", "Role", "Email / PIN", "Outlet", "Status", "Terakhir Login", "Aksi"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.filter(e => ["Kasir", "Finance", "Supervisor"].includes(e.roles?.name)).map(emp => (
              <tr key={emp.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={emp.photo_url || `https://i.pravatar.cc/150?u=${emp.id}`} size="sm" />
                    <span className="text-sm font-semibold text-gray-800">{emp.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-800 font-semibold">{emp.roles?.name}</td>
                <td className="px-5 py-3">
                  <p className="text-sm text-gray-600">{emp.name.toLowerCase().replace(" ", ".")}@kotacoffee.com</p>
                  <p className="text-xs text-gray-400">PIN: ****</p>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600">{emp.outlets?.name}</td>
                <td className="px-5 py-3"><Chip size="sm" color="success">Aktif</Chip></td>
                <td className="px-5 py-3 text-sm text-gray-500">Hari ini, 09:15</td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    <Button size="sm" variant="flat" color="primary" onPress={() => showToast(`PIN Kasir ${emp.name} berhasil di-reset.`)}>Reset PIN</Button>
                    <Button size="sm" variant="flat" color="danger" onPress={() => handleDeleteEmployee(emp.id)}>Nonaktifkan</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ========== SHIFTS SECTION ==========
  const renderShifts = () => (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Penjadwalan Shift</h2>
        <div className="flex gap-2">
          <Button variant="bordered" className="rounded-xl border-emerald-200 text-emerald-600 font-semibold hover:bg-emerald-50">Pengajuan Tukar Shift</Button>
          <Button className="bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30" startContent={<Plus className="w-4 h-4" />} onPress={onShiftOpen}>Atur Shift</Button>
        </div>
      </div>

      {/* Shift Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {["Karyawan", "Outlet", "Shift", "Jam", "Status Kehadiran"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shifts.map(s => (
              <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 text-sm font-semibold text-gray-800">{s.employees?.name}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{s.outlets?.name}</td>
                <td className="px-5 py-3">
                  <Chip size="sm" variant="shadow" classNames={{ base: s.shift_type === "Pagi" ? "bg-cyan-500 shadow-cyan-500/30 text-white" : s.shift_type === "Siang" ? "bg-amber-500 shadow-amber-500/30 text-white" : "bg-indigo-500 shadow-indigo-500/30 text-white" }}>
                    {s.shift_type}
                  </Chip>
                </td>
                <td className="px-5 py-3 text-sm text-gray-600 font-medium">{s.start_time} - {s.end_time}</td>
                <td className="px-5 py-3">
                  <Chip size="sm" variant="flat" color={
                    s.attendance_status === "Hadir" ? "success" : 
                    s.attendance_status === "Terlambat" ? "warning" : 
                    s.attendance_status === "Cuti" ? "default" : "danger"
                  }>
                    {s.attendance_status}
                  </Chip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rekap Keterlambatan & Alpa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Rekap Keterlambatan (Bulan Ini)</h3>
          <div className="space-y-3">
            {[
              { name: "Dewi Lestari", count: 3, total: "45 menit" },
              { name: "Ahmad Rizky", count: 1, total: "10 menit" },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Timer className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-semibold text-gray-800">{r.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-600">{r.count}x terlambat</p>
                  <p className="text-[10px] text-gray-400">Total: {r.total}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Rekap Alpa (Bulan Ini)</h3>
          <div className="flex items-center justify-center h-32 text-gray-400">
            <div className="text-center">
              <BadgeCheck className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
              <p className="text-sm font-semibold">Tidak ada alpa bulan ini</p>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isShiftOpen} onOpenChange={onShiftChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Atur Penjadwalan Shift</ModalHeader>
              <ModalBody>
                <Select label="Karyawan" selectedKeys={shiftForm.employee_id ? [shiftForm.employee_id] : []} onChange={(e) => setShiftForm({...shiftForm, employee_id: e.target.value})}>
                  {employees.map(e => (
                    <SelectItem key={String(e.id)} value={String(e.id)}>{e.name}</SelectItem>
                  ))}
                </Select>
                <Select label="Outlet" selectedKeys={shiftForm.outlet_id ? [shiftForm.outlet_id] : []} onChange={(e) => setShiftForm({...shiftForm, outlet_id: e.target.value})}>
                  {outlets.map(o => (
                    <SelectItem key={String(o.id)} value={String(o.id)}>{o.name}</SelectItem>
                  ))}
                </Select>
                <Select label="Tipe Shift" selectedKeys={[shiftForm.shift_type]} onChange={(e) => setShiftForm({...shiftForm, shift_type: e.target.value})}>
                  <SelectItem key="Pagi" value="Pagi">Pagi (07:00 - 15:00)</SelectItem>
                  <SelectItem key="Siang" value="Siang">Siang (15:00 - 23:00)</SelectItem>
                  <SelectItem key="Malam" value="Malam">Malam (23:00 - 07:00)</SelectItem>
                </Select>
                <Input type="date" label="Tanggal Shift" value={shiftForm.shift_date} onChange={(e) => setShiftForm({...shiftForm, shift_date: e.target.value})} />
                <div className="flex gap-4">
                  <Input type="time" label="Jam Mulai" value={shiftForm.start_time} onChange={(e) => setShiftForm({...shiftForm, start_time: e.target.value})} />
                  <Input type="time" label="Jam Selesai" value={shiftForm.end_time} onChange={(e) => setShiftForm({...shiftForm, end_time: e.target.value})} />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>Batal</Button>
                <Button color="primary" onPress={handleSaveShift}>Simpan Shift</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );

  // ========== LEAVE MANAGEMENT SECTION ==========
  const renderLeave = () => (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Cuti & Izin</h2>
        <Button className="bg-emerald-500 text-white rounded-xl h-10 px-5 font-semibold" startContent={<Plus className="w-4 h-4" />} onPress={onLeaveOpen}>Ajukan Cuti/Izin</Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {["Karyawan", "Jenis", "Tanggal", "Durasi", "Alasan", "Status", "Aksi"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((lr: any) => (
              <tr key={lr.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                <td className="px-5 py-3 text-sm font-semibold text-gray-800">{lr.employees?.name}</td>
                <td className="px-5 py-3"><Chip size="sm" variant="flat" color={lr.leave_type.includes("Sakit") ? "danger" : "primary"}>{lr.leave_type}</Chip></td>
                <td className="px-5 py-3 text-sm text-gray-600">{lr.start_date} s/d {lr.end_date}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{lr.total_days} hari</td>
                <td className="px-5 py-3 text-sm text-gray-800">{lr.reason || "-"}</td>
                <td className="px-5 py-3"><Chip size="sm" color={lr.status === "Approved" ? "success" : lr.status === "Rejected" ? "danger" : "warning"}>{lr.status}</Chip></td>
                <td className="px-5 py-3">
                  {lr.status === "Pending" && (
                    <div className="flex gap-1">
                      <Button size="sm" color="success" variant="flat" onPress={() => handleLeaveAction(lr.id, "Approved")}>Approve</Button>
                      <Button size="sm" color="danger" variant="flat" onPress={() => handleLeaveAction(lr.id, "Rejected")}>Reject</Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isLeaveOpen} onOpenChange={onLeaveChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Ajukan Cuti/Izin</ModalHeader>
              <ModalBody>
                <Select label="Karyawan" placeholder="Pilih Karyawan" selectedKeys={leaveForm.employee_id ? [leaveForm.employee_id] : []} onChange={(e) => setLeaveForm({...leaveForm, employee_id: e.target.value})}>
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                  ))}
                </Select>
                <Select label="Jenis Cuti/Izin" selectedKeys={[leaveForm.leave_type]} onChange={(e) => setLeaveForm({...leaveForm, leave_type: e.target.value})}>
                  <SelectItem key="Cuti Tahunan" value="Cuti Tahunan">Cuti Tahunan</SelectItem>
                  <SelectItem key="Izin Sakit" value="Izin Sakit">Izin Sakit</SelectItem>
                  <SelectItem key="Izin Keperluan Pribadi" value="Izin Keperluan Pribadi">Izin Keperluan Pribadi</SelectItem>
                </Select>
                <div className="flex gap-2">
                  <Input type="date" label="Dari Tanggal" placeholder=" " value={leaveForm.start_date} onChange={(e) => setLeaveForm({...leaveForm, start_date: e.target.value})} />
                  <Input type="date" label="Sampai Tanggal" placeholder=" " value={leaveForm.end_date} onChange={(e) => setLeaveForm({...leaveForm, end_date: e.target.value})} />
                </div>
                <Input type="number" label="Total Hari" value={String(leaveForm.total_days)} onChange={(e) => setLeaveForm({...leaveForm, total_days: parseInt(e.target.value)})} />
                <Textarea label="Alasan" placeholder="Masukkan alasan..." value={leaveForm.reason} onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})} />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>Batal</Button>
                <Button color="primary" onPress={handleSaveLeave}>Ajukan</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );

  // ========== PRODUCTS SECTION ==========
  const renderProducts = () => (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Manajemen Produk</h2>
        <Button className="bg-emerald-500 text-white rounded-xl h-10 px-5 font-semibold" startContent={<Plus className="w-4 h-4" />} onPress={() => { setEditProdId(null); setProdForm({ name: "", category: "Coffee", price: 0, stock: 0, is_bestseller: false, is_discount: false, discount_amount: 0, status: "Tersedia", image_url: "", description: "" }); onProdOpen(); }}>Tambah Produk Baru</Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-100">
          <Star className="w-5 h-5 text-yellow-500 mb-2" />
          <p className="text-xs text-gray-500 font-medium">Bestseller</p>
          <p className="text-lg font-bold text-gray-900">{products.filter((p: any) => p.is_bestseller).length} produk</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
          <XCircle className="w-5 h-5 text-red-500 mb-2" />
          <p className="text-xs text-gray-500 font-medium">Stok Habis</p>
          <p className="text-lg font-bold text-gray-900">{products.filter((p: any) => p.stock === 0).length} produk</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <DollarSign className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-xs text-gray-500 font-medium">Produk Diskon</p>
          <p className="text-lg font-bold text-gray-900">{products.filter((p: any) => p.is_discount).length} produk</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
          <Package className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-xs text-gray-500 font-medium">Total Produk</p>
          <p className="text-lg font-bold text-gray-900">{products.length} produk</p>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="w-full min-w-[700px]">
          <thead className="bg-gray-50">
            <tr>
              {["Produk", "Kategori", "Harga", "Stok", "Bestseller", "Diskon", "Status", "Aksi"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-3 sm:px-5 py-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                <td className="px-5 py-3 text-sm font-semibold text-gray-800">{p.name}</td>
                <td className="px-5 py-3"><Chip size="sm" variant="flat">{p.category}</Chip></td>
                <td className="px-5 py-3 text-sm font-bold text-gray-800">{formatRp(p.price)}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{p.stock}</td>
                <td className="px-5 py-3">{p.is_bestseller ? <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> : <span className="text-gray-300">-</span>}</td>
                <td className="px-5 py-3">{p.is_discount ? <Chip size="sm" color="danger">-{formatRp(p.discount_amount)}</Chip> : <span className="text-gray-300">-</span>}</td>
                <td className="px-5 py-3"><Chip size="sm" color={p.status === "Tersedia" ? "success" : p.status === "Hampir Habis" ? "warning" : "danger"}>{p.status}</Chip></td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    <Button isIconOnly size="sm" variant="light" aria-label="Edit produk" onPress={() => handleEditProduct(p)}><Edit className="w-4 h-4 text-gray-400" /></Button>
                    <Button isIconOnly size="sm" variant="light" aria-label="Hapus produk" onPress={() => handleDeleteProduct(p.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      <Modal isOpen={isProdOpen} onOpenChange={onProdChange} size="lg" scrollBehavior="inside">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{editProdId ? "Edit Produk" : "Tambah Produk"}</ModalHeader>
              <ModalBody>
                <Input label="Nama Produk" placeholder="e.g. Robusta Mamasa" value={prodForm.name} onChange={(e) => setProdForm({...prodForm, name: e.target.value})} />
                <Textarea label="Deskripsi Produk" placeholder="Tulis deskripsi singkat tentang produk ini..." minRows={2} maxRows={4} value={prodForm.description} onChange={(e) => setProdForm({...prodForm, description: e.target.value})} />
                <Select label="Kategori" selectedKeys={[prodForm.category]} onChange={(e) => setProdForm({...prodForm, category: e.target.value})}>
                  <SelectItem key="Coffee" value="Coffee">Coffee</SelectItem>
                  <SelectItem key="Non-Coffee" value="Non-Coffee">Non-Coffee</SelectItem>
                  <SelectItem key="Snack" value="Snack">Snack</SelectItem>
                  <SelectItem key="Meal" value="Meal">Meal</SelectItem>
                </Select>
                <Input type="number" label="Harga" value={String(prodForm.price)} onChange={(e) => setProdForm({...prodForm, price: parseInt(e.target.value)})} />
                <Input type="number" label="Stok Tersedia" value={String(prodForm.stock)} onChange={(e) => setProdForm({...prodForm, stock: parseInt(e.target.value)})} />
                <div className="flex gap-4 my-2">
                  <Switch isSelected={prodForm.is_bestseller} onValueChange={(v) => setProdForm({...prodForm, is_bestseller: v})}>Bestseller</Switch>
                  <Switch isSelected={prodForm.is_discount} onValueChange={(v) => setProdForm({...prodForm, is_discount: v})}>Diskon</Switch>
                </div>
                {prodForm.is_discount && (
                  <Input type="number" label="Potongan Harga (Rp)" value={String(prodForm.discount_amount)} onChange={(e) => setProdForm({...prodForm, discount_amount: parseInt(e.target.value)})} />
                )}
                <Select label="Status" selectedKeys={[prodForm.status]} onChange={(e) => setProdForm({...prodForm, status: e.target.value})}>
                  <SelectItem key="Tersedia" value="Tersedia">Tersedia</SelectItem>
                  <SelectItem key="Hampir Habis" value="Hampir Habis">Hampir Habis</SelectItem>
                  <SelectItem key="Habis" value="Habis">Habis</SelectItem>
                </Select>
                <div className="flex flex-col gap-2 my-2">
                  <p className="text-sm font-semibold text-gray-700">Upload Gambar Produk</p>
                  {/* Image Preview */}
                  {prodForm.image_url && prodForm.image_url.startsWith('http') && (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-emerald-500 mb-2">
                      <img src={prodForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setProdForm({...prodForm, image_url: ""})}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-emerald-500 text-white text-[10px] text-center py-1 font-semibold">
                        ✓ Gambar berhasil diupload
                      </div>
                    </div>
                  )}
                  <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors relative overflow-hidden group ${uploadingImage ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}>
                    {uploadingImage ? (
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                        <p className="text-xs font-semibold text-emerald-600">Mengupload gambar...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="bg-emerald-100 p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
                           <svg className="w-5 h-5 text-emerald-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                             <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                           </svg>
                        </div>
                        <p className="mb-1 text-xs text-gray-500"><span className="font-semibold text-emerald-600">Klik untuk upload</span> atau drag & drop</p>
                        <p className="text-[10px] text-gray-400">JPG, PNG, WEBP atau GIF (MAX. 5MB)</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" disabled={uploadingImage} onChange={async (e) => {
                      if(e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setUploadingImage(true);
                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          const res = await fetch('/api/upload-product-image', {
                            method: 'POST',
                            body: formData,
                          });
                          const result = await res.json();
                          if (result.success && result.url) {
                            setProdForm((prev: any) => ({...prev, image_url: result.url}));
                            showToast('Gambar berhasil diupload!');
                          } else {
                            showToast(result.error || 'Gagal upload gambar', 'error');
                          }
                        } catch (err) {
                          console.error('Upload error:', err);
                          showToast('Gagal upload gambar. Periksa koneksi.', 'error');
                        } finally {
                          setUploadingImage(false);
                          e.target.value = '';
                        }
                      }
                    }} />
                  </label>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>Batal</Button>
                <Button color="primary" onPress={handleSaveProduct} isDisabled={uploadingImage}>Simpan Produk</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );

  // ========== SALES MONITORING SECTION ==========
  const renderSalesMonitor = () => {
    const f = financeOverview || { incomeToday: 0, incomeMonth: 0, incomeYear: 0 };
    return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-900">Monitoring Penjualan</h2>

      <Tabs aria-label="Sales Period" color="primary" variant="solid" classNames={{ tabList: "bg-gray-100 rounded-xl", tab: "rounded-lg" }}>
        <Tab key="daily" title="Harian">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {[
              { label: "Penjualan Hari Ini", value: formatRp(f.incomeToday), trend: "+0%", up: true },
              { label: "Total Order", value: "Realtime Data", trend: "+0%", up: true },
              { label: "Rata-rata Transaksi", value: "Realtime Data", trend: "-0%", up: false },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500 font-medium mb-2">{s.label}</p>
                <h3 className="text-2xl font-black text-gray-900">{s.value}</h3>
                <div className={`flex items-center gap-1 mt-2 ${s.up ? "text-emerald-500" : "text-red-500"}`}>
                  {s.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span className="text-xs font-bold">{s.trend}</span>
                  <span className="text-xs text-gray-400 ml-1">dari kemarin</span>
                </div>
              </div>
            ))}
          </div>
        </Tab>
        <Tab key="monthly" title="Bulanan">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {[
              { label: "Penjualan Bulan Ini", value: formatRp(f.incomeMonth), trend: "+0%", up: true },
              { label: "Total Order", value: "Realtime Data", trend: "+0%", up: true },
              { label: "Rata-rata/Hari", value: "Realtime Data", trend: "+0%", up: true },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500 font-medium mb-2">{s.label}</p>
                <h3 className="text-2xl font-black text-gray-900">{s.value}</h3>
                <div className={`flex items-center gap-1 mt-2 ${s.up ? "text-emerald-500" : "text-red-500"}`}>
                  {s.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span className="text-xs font-bold">{s.trend}</span>
                  <span className="text-xs text-gray-400 ml-1">dari bulan lalu</span>
                </div>
              </div>
            ))}
          </div>
        </Tab>
        <Tab key="yearly" title="Tahunan">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {[
              { label: "Penjualan Tahun Ini", value: formatRp(f.incomeYear), trend: "+0%", up: true },
              { label: "Total Order", value: "18,500 order", trend: "+18%", up: true },
              { label: "Rata-rata/Bulan", value: formatRp(97142857), trend: "+12%", up: true },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500 font-medium mb-2">{s.label}</p>
                <h3 className="text-2xl font-black text-gray-900">{s.value}</h3>
                <div className="flex items-center gap-1 mt-2 text-emerald-500">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{s.trend}</span>
                  <span className="text-xs text-gray-400 ml-1">dari tahun lalu</span>
                </div>
              </div>
            ))}
          </div>
        </Tab>
      </Tabs>

      {/* Verifikasi Laporan Finance */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900">Verifikasi Laporan Finance</h3>
          <Chip color="success" variant="flat" startContent={<BadgeCheck className="w-3 h-3" />}>Data Terverifikasi</Chip>
        </div>
        <p className="text-sm text-gray-500 mb-4">Pastikan data penjualan dari Staff Finance tidak ada kesalahan atau manipulasi data.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { outlet: "Cabang 1", system: formatRp(45000000), reported: formatRp(45000000), match: true },
            { outlet: "Cabang 2", system: formatRp(32000000), reported: formatRp(32000000), match: true },
            { outlet: "Cabang 3", system: formatRp(18000000), reported: formatRp(18000000), match: true },
          ].map((v, i) => (
            <div key={i} className={`p-4 rounded-xl border ${v.match ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"}`}>
              <p className="text-sm font-bold text-gray-800 mb-2">{v.outlet}</p>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Data Sistem:</span>
                <span className="font-bold">{v.system}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Laporan Finance:</span>
                <span className="font-bold">{v.reported}</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {v.match ? <BadgeCheck className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                <span className={`text-xs font-bold ${v.match ? "text-emerald-600" : "text-red-600"}`}>{v.match ? "Data Cocok" : "Ada Selisih!"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  };

  // ========== OUTLET MANAGEMENT ==========
  const renderOutlets = () => (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-900">Manajemen Outlet</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {OUTLETS.map(outlet => (
          <div key={outlet.id} className={`bg-white rounded-2xl p-6 border shadow-sm ${outlet.status === "Best" ? "border-emerald-300 ring-2 ring-emerald-100" : outlet.status === "Worst" ? "border-red-200" : "border-gray-100"}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${outlet.status === "Best" ? "bg-emerald-500" : outlet.status === "Worst" ? "bg-red-500" : "bg-blue-500"}`}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{outlet.name}</h3>
                  <Chip size="sm" color={outlet.status === "Best" ? "success" : outlet.status === "Worst" ? "danger" : "primary"} variant="flat">
                    {outlet.status === "Best" ? "⭐ Terbaik" : outlet.status === "Worst" ? "⚠️ Perlu Perhatian" : "Baik"}
                  </Chip>
                </div>
              </div>
            </div>
            <Divider className="my-3" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Pendapatan:</span><span className="font-bold text-gray-900">{formatRp(outlet.revenue)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Total Order:</span><span className="font-bold text-gray-900">{outlet.orders}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Rating:</span><span className="font-bold text-gray-900">⭐ {outlet.rating}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Karyawan:</span><span className="font-bold text-gray-900">{outlet.employees} orang</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ========== REPORTS PLACEHOLDER ==========
  const renderReports = () => (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-900">Laporan & Export</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Export Excel", icon: Download, desc: "Download semua data karyawan" },
          { label: "Export PDF", icon: FileText, desc: "Laporan shift bulanan" },
          { label: "Cetak Laporan", icon: ClipboardList, desc: "Print rekap kehadiran" },
        ].map((r, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <r.icon className="w-8 h-8 text-emerald-500 mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">{r.label}</h3>
            <p className="text-xs text-gray-500">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20">
        <Settings className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="font-bold text-gray-700 text-lg">Konfigurasi Sistem HRD</h3>
        <p className="text-gray-500 text-sm mt-2 mb-6">Atur jam kerja default, format laporan, dan notifikasi.</p>
        <Button className="bg-emerald-500 text-white rounded-xl font-bold">Ubah Pengaturan</Button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-900">Security & Access</h2>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20">
        <Shield className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="font-bold text-gray-700 text-lg">Keamanan Akses Dashboard</h3>
        <p className="text-gray-500 text-sm mt-2 mb-6">Kelola otentikasi dua faktor (2FA) dan log aktivitas sesi login.</p>
        <Button className="bg-emerald-500 text-white rounded-xl font-bold">Audit Log Keamanan</Button>
      </div>
    </div>
  );

  // ========== CONTENT ROUTER ==========
  const renderContent = () => {
    switch (activeMenu) {
      case "overview": return renderOverview();
      case "employees": return renderEmployees();
      case "accounts": return renderAccounts();
      case "shifts": return renderShifts();
      case "leave": return renderLeave();
      case "products": return renderProducts();
      case "sales-monitor": return renderSalesMonitor();
      case "outlets": return renderOutlets();
      case "reports": return renderReports();
      case "settings": return renderSettings();
      case "security": return renderSecurity();
      default: return renderOverview();
    }
  };

  return (
    <div className="flex h-screen bg-[#F4F5F7] font-sans">
      {/* ========== MOBILE SIDEBAR OVERLAY ========== */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden mobile-sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* ========== SIDEBAR ========== */}
      <div className={`w-[250px] bg-[#1E1F25] text-white flex flex-col shrink-0 p-5 pt-7 fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 md:transform-none ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="flex items-center justify-between mb-8 pl-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight">KotaCoffee</h1>
              <p className="text-[10px] text-gray-400">HRD Dashboard</p>
            </div>
          </div>
          <button className="md:hidden p-1.5 rounded-lg hover:bg-white/10" onClick={() => setMobileSidebarOpen(false)}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {SIDEBAR_MENU.filter(m => m.group === "MENU").map((item, i) => (
            <React.Fragment key={item.key}>
              {i === 0 && <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold px-3 mb-2">MENU</p>}
              <button onClick={() => { setActiveMenu(item.key); setMobileSidebarOpen(false); }}
                className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors w-full text-left ${
                  activeMenu === item.key ? "bg-emerald-500 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}>
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            </React.Fragment>
          ))}

          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold px-3 mt-6 mb-2">GENERAL</p>
          {SIDEBAR_MENU.filter(m => m.group === "GENERAL").map(item => (
            <button key={item.key} onClick={() => { setActiveMenu(item.key); setMobileSidebarOpen(false); }}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors w-full text-left ${
                activeMenu === item.key ? "bg-emerald-500 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}>
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/10">
          <Avatar src="https://i.pravatar.cc/150?u=hrd-admin" size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Admin HRD</p>
            <p className="text-[10px] text-gray-400 truncate">admin@kotacoffee.com</p>
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-14 md:h-16 bg-white border-b border-gray-100 px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors" onClick={() => setMobileSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="font-bold text-gray-800 text-sm md:text-base">{SIDEBAR_MENU.find(m => m.key === activeMenu)?.label || "Overview"}</h2>
            <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Input aria-label="Cari" placeholder="Cari..." startContent={<Search className="w-4 h-4 text-gray-400" />}
              className="w-40 md:w-64 hidden sm:block" classNames={{ inputWrapper: "bg-gray-50 border border-gray-200 h-9 md:h-10 rounded-xl shadow-none", input: "text-sm" }} />
            <Button isIconOnly variant="flat" aria-label="Notifikasi" className="bg-gray-50 border border-gray-200 rounded-xl h-9 w-9 md:h-10 md:w-10 relative">
              <Bell className="w-4 h-4 text-gray-500" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </div>
      </div>

      {/* Employee Modal */}
      <Modal isOpen={isEmpOpen} onOpenChange={onEmpChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{editEmpId ? "Edit Karyawan" : "Tambah Karyawan"}</ModalHeader>
              <ModalBody>
                <Input label="Nama Lengkap" placeholder="Masukkan nama" value={empForm.name} onChange={(e) => setEmpForm({...empForm, name: e.target.value})} />
                <Select label="Jabatan" placeholder="Pilih jabatan" selectedKeys={empForm.role_id ? [String(empForm.role_id)] : []} onChange={(e) => setEmpForm({...empForm, role_id: e.target.value})}>
                  {roles && roles.length > 0 ? roles.map((r: any) => (
                    <SelectItem key={String(r.id)} value={String(r.id)}>{r.name}</SelectItem>
                  )) : (
                    <SelectItem key="" value="" isDisabled>Belum ada data jabatan</SelectItem>
                  )}
                </Select>
                <Select label="Outlet" placeholder="Pilih outlet" selectedKeys={empForm.outlet_id ? [String(empForm.outlet_id)] : []} onChange={(e) => setEmpForm({...empForm, outlet_id: e.target.value})}>
                  {outlets && outlets.length > 0 ? outlets.map((o: any) => (
                    <SelectItem key={String(o.id)} value={String(o.id)}>{o.name}</SelectItem>
                  )) : (
                    <SelectItem key="" value="" isDisabled>Belum ada data outlet</SelectItem>
                  )}
                </Select>
                <Input label="Nomor Telepon" placeholder="08..." value={empForm.phone} onChange={(e) => setEmpForm({...empForm, phone: e.target.value})} />
                <Input type="date" label="Tanggal Masuk" placeholder=" " value={empForm.join_date} onChange={(e) => setEmpForm({...empForm, join_date: e.target.value})} />
                <Select label="Status" selectedKeys={[empForm.status]} onChange={(e) => setEmpForm({...empForm, status: e.target.value})}>
                  <SelectItem key="Active" value="Active">Active</SelectItem>
                  <SelectItem key="Cuti" value="Cuti">Cuti</SelectItem>
                  <SelectItem key="Resign" value="Resign">Resign</SelectItem>
                </Select>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>Batal</Button>
                <Button color="primary" onPress={handleSaveEmployee}>Simpan</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Cyber Confirm Modal */}
      <Modal isOpen={confirmModal.isOpen} onOpenChange={(open) => setConfirmModal({...confirmModal, isOpen: open})} backdrop="blur" classNames={{
        base: "bg-[#0b1221] border border-cyan-500/30 shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]",
        header: "border-b border-cyan-900/50",
        footer: "border-t border-cyan-900/50"
      }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-3 text-cyan-400 font-black uppercase tracking-widest text-sm">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                {confirmModal.title}
              </ModalHeader>
              <ModalBody className="py-6">
                <p className="text-cyan-100/70 text-sm leading-relaxed">
                  {confirmModal.message}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" className="text-cyan-600 hover:text-cyan-400 font-semibold" onPress={onClose}>
                  BATALKAN
                </Button>
                <Button className="bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] font-bold tracking-wider rounded-lg" onPress={() => { confirmModal.onConfirm(); onClose(); }}>
                  PROSES HAPUS
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
              toast.type === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {toast.type === "success" ? (
              <BadgeCheck className="w-6 h-6 text-emerald-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            <p className="font-semibold">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HrdContent;
