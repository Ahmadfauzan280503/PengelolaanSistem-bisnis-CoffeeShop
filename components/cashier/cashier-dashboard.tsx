"use client";
import React, { useState, useEffect } from "react";
import { Chip, Button, Input, Divider, Avatar, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Checkbox } from "@nextui-org/react";
import { Search, ShoppingBag, Bell, Coffee, Utensils, CupSoda, Home, History, Settings, FileText, Plus, Minus, Trash2, Save, LogOut, Clock, CheckCircle2, XCircle, ChevronRight, CreditCard, Banknote, QrCode, ArrowLeft, Menu, X } from "lucide-react";
import { getProducts } from "@/app/actions/hrd";
import { getCashierSession, getOrderHistory, processPayment, holdOrder, getHeldOrders, resumeHeldOrder, deleteHeldOrder } from "@/app/actions/cashier-actions";
import { useParams } from "next/navigation";

// ========== CATEGORIES ==========
const CATEGORIES = [
  { id: "Coffee", name: "Coffee", icon: Coffee },
  { id: "Non-Coffee", name: "Non Coffee", icon: CupSoda },
  { id: "Snack", name: "Snack", icon: Utensils },
  { id: "Meal", name: "Meal", icon: Utensils },
];

// ========== MAIN CASHIER COMPONENT ==========
export const CashierDashboard = () => {
  const params = useParams();
  const branchSlug = (params?.branch as string) || "cabang-1";
  
  const [activeCategory, setActiveCategory] = useState("Coffee");
  const [activePage, setActivePage] = useState("dashboard");
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [cashierInfo, setCashierInfo] = useState<any>({ cashierName: "Kasir", branchName: "Cabang", shiftType: "Pagi" });
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [heldOrders, setHeldOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Payment modal
  const { isOpen: isPayOpen, onOpen: onPayOpen, onClose: onPayClose } = useDisclosure();
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Custom order modal
  const { isOpen: isCustomOpen, onOpen: onCustomOpen, onClose: onCustomClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modifiers, setModifiers] = useState({ sugar: "Normal", ice: "Normal", milk: "Regular", extraShot: false });

  // Table/Customer info
  const [tableNumber, setTableNumber] = useState("Meja 12");
  const [customerType, setCustomerType] = useState("Umum");
  const { isOpen: isTableOpen, onOpen: onTableOpen, onClose: onTableClose } = useDisclosure();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, sessionData] = await Promise.all([
          getProducts(),
          getCashierSession(branchSlug),
        ]);
        setProducts(productsData || []);
        setCashierInfo(sessionData);
      } catch (e) {
        console.error("Error loading data:", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [branchSlug]);

  // Load order history when switching to history page
  useEffect(() => {
    if (activePage === "history") {
      getOrderHistory(branchSlug).then(setOrderHistory).catch(console.error);
    }
    if (activePage === "bills") {
      getHeldOrders(branchSlug).then(setHeldOrders).catch(console.error);
    }
  }, [activePage, branchSlug]);

  const addToCart = (item: any) => {
    setSelectedItem(item);
    if (item.category === "Coffee" || item.category === "Non-Coffee") {
      setModifiers({ sugar: "Normal", ice: "Normal", milk: "Regular", extraShot: false });
      onCustomOpen();
    } else {
      const cartItem = { ...item, cartId: Date.now(), qty: 1, modifiers: null };
      setCart([...cart, cartItem]);
    }
  };

  const confirmCustomOrder = () => {
    let extraPrice = 0;
    if (modifiers.milk === "Oat Milk") extraPrice += 8000;
    if (modifiers.milk === "Almond Milk") extraPrice += 10000;
    if (modifiers.extraShot) extraPrice += 5000;

    const cartItem = {
      ...selectedItem,
      cartId: Date.now(),
      qty: 1,
      price: selectedItem.price + extraPrice,
      basePrice: selectedItem.price,
      modifiers: { ...modifiers },
    };
    setCart([...cart, cartItem]);
    onCustomClose();
  };

  const updateQty = (cartId: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.cartId === cartId) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeItem = (cartId: number) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

  const getImageSrc = (item: any) => {
    if (!item.image_url) return null;
    let imgDir = "coffee";
    if (item.category === "Non-Coffee") imgDir = "non coffee";
    if (item.category === "Snack" || item.category === "Meal") imgDir = "food";
    return `/produk/${imgDir}/${item.image_url}`;
  };

  const handlePayment = async () => {
    try {
      setPaymentProcessing(true);
      const branchMap: Record<string, string> = {
        "cabang-1": "Cabang 1 - Pusat",
        "cabang-2": "Cabang 2 - Selatan",
        "cabang-3": "Cabang 3 - Utara",
      };
      
      await processPayment({
        customer_name: customerType,
        table_number: tableNumber,
        order_mode: "dinein",
        cabang: branchMap[branchSlug] || branchSlug,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.qty,
          price: item.price,
          subtotal: item.price * item.qty,
        })),
        subtotal,
        tax,
        total_price: total,
        payment_method: paymentMethod,
        cashier_name: cashierInfo.cashierName,
      });
      
      setPaymentSuccess(true);
      setTimeout(() => {
        setCart([]);
        setPaymentSuccess(false);
        onPayClose();
      }, 2000);
    } catch (e) {
      console.error("Payment error:", e);
      alert("Gagal memproses pembayaran");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleHoldOrder = async () => {
    if (cart.length === 0) return;
    try {
      const branchMap: Record<string, string> = {
        "cabang-1": "Cabang 1 - Pusat",
        "cabang-2": "Cabang 2 - Selatan", 
        "cabang-3": "Cabang 3 - Utara",
      };
      await holdOrder({
        customer_name: customerType,
        table_number: tableNumber,
        cabang: branchMap[branchSlug] || branchSlug,
        items: cart.map(item => ({
          name: item.name,
          quantity: item.qty,
          price: item.price,
          subtotal: item.price * item.qty,
        })),
        subtotal,
        tax,
        total_price: total,
      });
      setCart([]);
      alert("Pesanan berhasil di-hold!");
    } catch (e) {
      console.error("Hold error:", e);
    }
  };

  const handleResumeOrder = async (orderId: string) => {
    try {
      const order = await resumeHeldOrder(orderId);
      if (order && order.items) {
        const items = (order.items as any[]).map((item: any, idx: number) => ({
          ...item,
          cartId: Date.now() + idx,
          qty: item.quantity || 1,
          modifiers: null,
        }));
        setCart(items);
        setActivePage("dashboard");
        await deleteHeldOrder(orderId);
      }
    } catch (e) {
      console.error("Resume error:", e);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchCategory = p.category === activeCategory;
    const matchSearch = searchQuery === "" || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" });

  // ========== RENDER PAGES ==========
  const renderHistory = () => (
    <div className="p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Riwayat Pesanan</h2>
      {orderHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <History className="w-16 h-16 mb-4 opacity-30" />
          <p className="font-semibold">Belum ada riwayat pesanan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orderHistory.map((order: any) => (
            <div key={order.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${order.payment_status === "PAID" ? "bg-emerald-100" : order.order_status === "HOLD" ? "bg-amber-100" : "bg-red-100"}`}>
                  {order.payment_status === "PAID" ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Clock className="w-5 h-5 text-amber-600" />}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{order.order_number}</p>
                  <p className="text-xs text-gray-500">{order.customer_name} · {order.table_number}</p>
                  <p className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleString("id-ID")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-[#6c5ce7] text-sm">Rp {Number(order.total_price).toLocaleString("id-ID")}</p>
                <Chip size="sm" color={order.payment_status === "PAID" ? "success" : "warning"} variant="flat" className="mt-1">
                  {order.payment_status}
                </Chip>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSplitBill = () => (
    <div className="p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Pesanan Ditahan (Hold)</h2>
      <p className="text-sm text-gray-500 mb-6">Klik pesanan untuk melanjutkan</p>
      {heldOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FileText className="w-16 h-16 mb-4 opacity-30" />
          <p className="font-semibold">Tidak ada pesanan yang ditahan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {heldOrders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => handleResumeOrder(order.id)}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-gray-800">{order.order_number}</p>
                  <p className="text-xs text-gray-500">{order.table_number} · {order.customer_name}</p>
                </div>
                <Chip size="sm" color="warning" variant="flat">HOLD</Chip>
              </div>
              <div className="space-y-1 mb-3">
                {(order.items as any[] || []).slice(0, 3).map((item: any, i: number) => (
                  <p key={i} className="text-xs text-gray-600">{item.quantity}x {item.name}</p>
                ))}
                {(order.items as any[] || []).length > 3 && <p className="text-xs text-gray-400">+{(order.items as any[]).length - 3} item lagi</p>}
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <p className="font-black text-[#6c5ce7]">Rp {Number(order.total_price).toLocaleString("id-ID")}</p>
                <Button size="sm" className="bg-[#6c5ce7] text-white font-semibold" startContent={<ArrowLeft className="w-3 h-3" />}>
                  Lanjutkan
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Pengaturan Kasir</h2>
      <div className="space-y-4 max-w-md">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#6c5ce7]" />
            Informasi Kasir
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Nama Kasir</span>
              <span className="text-sm font-bold text-gray-800">{cashierInfo.cashierName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Cabang</span>
              <span className="text-sm font-bold text-gray-800">{cashierInfo.branchName}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Shift</span>
              <span className="text-sm font-bold text-gray-800">{cashierInfo.shiftType}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">Tanggal</span>
              <span className="text-sm font-bold text-gray-800">{dateStr}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">Printer & Perangkat</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Printer Struk</span>
              <Chip size="sm" color="success" variant="flat">Terhubung</Chip>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">Cash Drawer</span>
              <Chip size="sm" color="success" variant="flat">Terhubung</Chip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8f9fc] text-slate-800 font-sans overflow-hidden">
      
      {/* ========== MOBILE SIDEBAR OVERLAY ========== */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden mobile-sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* ========== SIDEBAR ========== */}
      <div className={`w-[100px] lg:w-[240px] bg-[#6c5ce7] text-white flex flex-col items-center lg:items-start py-6 px-4 shrink-0 shadow-xl z-50 transition-all fixed lg:static inset-y-0 left-0 transform lg:transform-none duration-300 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between w-full gap-3 mb-10 lg:px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tight hidden lg:block">KOTACOFFEE</h1>
          </div>
          <button className="lg:hidden p-1.5 rounded-lg hover:bg-white/20" onClick={() => setMobileSidebarOpen(false)}>
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <nav className="flex flex-col gap-3 w-full">
          {[
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "orders", label: "Order Menu", icon: ShoppingBag },
            { id: "history", label: "Riwayat", icon: History },
            { id: "bills", label: "Split Bill", icon: FileText },
            { id: "settings", label: "Setting", icon: Settings },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => { setActivePage(item.id); setMobileSidebarOpen(false); }}
              className={`flex items-center gap-3 p-3 lg:px-4 rounded-xl cursor-pointer transition-colors ${
                activePage === item.id ? "bg-white text-[#6c5ce7] font-bold shadow-md" : "text-white/80 hover:bg-white/10"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:block text-sm">{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="mt-auto w-full">
          <div className="bg-[#5a4bcf] rounded-2xl p-4 flex flex-col items-center lg:items-start text-center lg:text-left gap-3 mb-4">
            <Avatar 
              src={cashierInfo.cashierPhoto || "https://i.pravatar.cc/150?u=a042581f4e29026704d"} 
              className="w-12 h-12" 
            />
            <div className="hidden lg:block">
              <p className="text-sm font-bold">{cashierInfo.cashierName}</p>
              <p className="text-xs text-white/70">Shift {cashierInfo.shiftType} · {cashierInfo.branchName?.split(" - ")[0]}</p>
            </div>
          </div>
          <Button className="w-full bg-red-500/20 text-white border border-red-500/30 hover:bg-red-500" startContent={<LogOut className="w-4 h-4" />}>
            <span className="hidden lg:block">Closing Shift</span>
          </Button>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="h-[64px] md:h-[80px] bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors" onClick={() => setMobileSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-base md:text-xl font-bold text-gray-800">Hey, {cashierInfo.cashierName} 👋</h2>
              <p className="text-xs md:text-sm text-gray-500 hidden sm:block">{cashierInfo.branchName} · {dateStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Input
              placeholder="Cari menu..."
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              className="w-40 md:w-64 hidden sm:block"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              classNames={{
                inputWrapper: "bg-gray-100 border-transparent h-9 md:h-10",
              }}
            />
            <Button isIconOnly variant="flat" className="bg-gray-100 rounded-full h-9 w-9 md:h-10 md:w-10">
              <Bell className="w-4 md:w-5 h-4 md:h-5 text-gray-600" />
            </Button>
            {/* Mobile cart toggle */}
            <Button 
              isIconOnly 
              variant="flat" 
              className="xl:hidden bg-[#6c5ce7] text-white rounded-full h-9 w-9 md:h-10 md:w-10 relative"
              onPress={() => setMobileCartOpen(!mobileCartOpen)}
            >
              <ShoppingBag className="w-4 md:w-5 h-4 md:h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">{cart.length}</span>
              )}
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-[#f8f9fc]">
          {(activePage === "dashboard" || activePage === "orders") ? (
            <div className="p-4 md:p-8">
              {/* Promo Banner */}
              <div className="w-full bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl md:rounded-3xl p-5 md:p-8 flex items-center justify-between mb-6 md:mb-8 shadow-xl">
                <div>
                  <h2 className="text-lg md:text-2xl font-black text-white mb-2">Buy 1 Get 1 Free</h2>
                  <p className="text-gray-300 text-xs md:text-sm mb-4">Promo spesial pelanggan Member Kotacoffee.</p>
                  <Button className="bg-[#6c5ce7] text-white font-semibold">Terapkan Promo</Button>
                </div>
                <div className="hidden md:block">
                  <div className="w-32 h-32 bg-amber-600/20 rounded-full blur-2xl absolute right-20"></div>
                  <Coffee className="w-24 h-24 text-amber-500 relative z-10 opacity-80" />
                </div>
              </div>

              {/* Categories */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Kategori</h3>
                <span className="text-sm text-[#6c5ce7] font-semibold cursor-pointer">View all</span>
              </div>
              <div className="flex gap-3 md:gap-4 mb-6 md:mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl cursor-pointer transition-all shrink-0 ${
                      activeCategory === cat.id
                        ? "bg-[#6c5ce7] text-white shadow-lg shadow-indigo-500/30"
                        : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${activeCategory === cat.id ? "bg-white/20" : "bg-gray-100"}`}>
                      <cat.icon className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-sm">{cat.name}</span>
                  </div>
                ))}
              </div>

              {/* Menu Grid - FIX: No more nested buttons */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Menu Populer</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6 pb-20">
                {filteredProducts.map((item) => {
                  const imgSrc = getImageSrc(item);
                  return (
                    <div
                      key={item.id}
                      onClick={() => addToCart(item)}
                      className="bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all rounded-3xl overflow-hidden cursor-pointer group"
                    >
                      <div className={`h-40 ${imgSrc ? 'bg-gray-100' : 'bg-amber-800'} w-full flex items-center justify-center relative`}>
                        {imgSrc ? (
                          <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Coffee className="w-16 h-16 text-white/50" />
                        )}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                          <span className="text-yellow-500 text-xs font-black">★</span>
                          <span className="text-xs font-bold text-gray-800">{item.is_bestseller ? "4.9" : "4.5"}</span>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-800 text-base">{item.name}</h4>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <p className="font-black text-[#6c5ce7] text-lg">Rp {item.price.toLocaleString("id-ID")}</p>
                          <div className="w-9 h-9 bg-[#6c5ce7] text-white rounded-xl shadow-md group-hover:scale-110 transition-transform flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activePage === "history" ? (
            renderHistory()
          ) : activePage === "bills" ? (
            renderSplitBill()
          ) : activePage === "settings" ? (
            renderSettings()
          ) : null}
        </div>
      </div>

      {/* ========== MOBILE CART OVERLAY ========== */}
      {mobileCartOpen && (
        <div className="fixed inset-0 z-40 xl:hidden mobile-sidebar-overlay" onClick={() => setMobileCartOpen(false)} />
      )}

      {/* ========== RIGHT SIDEBAR (CART) ========== */}
      <div className={`w-[320px] md:w-[380px] bg-white border-l border-gray-100 flex flex-col h-full shrink-0 shadow-2xl z-50 fixed xl:static inset-y-0 right-0 transform xl:transform-none transition-transform duration-300 ${
        mobileCartOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'
      }`}>
        
        {/* Cart Header */}
        <div className="p-6 pb-4 flex flex-col gap-4 border-b border-gray-100 bg-[#fbfbfe]">
          <h2 className="text-xl font-bold text-gray-800">Pesanan Saat Ini</h2>
          <div className="flex items-center justify-between p-3 bg-[#6c5ce7]/10 rounded-2xl border border-[#6c5ce7]/20">
            <div>
              <p className="text-xs text-gray-500 font-medium">Meja / Customer</p>
              <p className="text-sm font-bold text-[#6c5ce7]">{tableNumber} - {customerType}</p>
            </div>
            <Button size="sm" variant="flat" className="bg-white text-[#6c5ce7] font-semibold" onPress={onTableOpen}>Ubah</Button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingBag className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm font-medium">Belum ada pesanan</p>
            </div>
          ) : (
            cart.map((item) => {
              const imgSrc = getImageSrc(item);
              return (
                <div key={item.cartId} className="flex gap-3 items-start bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                  <div className={`w-16 h-16 ${imgSrc ? 'bg-gray-100' : 'bg-amber-800'} rounded-xl shrink-0 overflow-hidden`}>
                    {imgSrc && <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm truncate">{item.name}</h4>
                    <p className="text-xs font-bold text-[#6c5ce7] mt-0.5">Rp {item.price.toLocaleString("id-ID")}</p>
                    
                    {item.modifiers && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.modifiers.sugar !== "Normal" && <Chip size="sm" className="h-4 text-[9px] px-1 bg-gray-200">Sugar: {item.modifiers.sugar}</Chip>}
                        {item.modifiers.ice !== "Normal" && <Chip size="sm" className="h-4 text-[9px] px-1 bg-gray-200">Ice: {item.modifiers.ice}</Chip>}
                        {item.modifiers.milk !== "Regular" && <Chip size="sm" className="h-4 text-[9px] px-1 bg-amber-100 text-amber-700">{item.modifiers.milk}</Chip>}
                        {item.modifiers.extraShot && <Chip size="sm" className="h-4 text-[9px] px-1 bg-rose-100 text-rose-700">+Shot</Chip>}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-0.5">
                        <div className="w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded-md" onClick={() => updateQty(item.cartId, -1)}>
                          <Minus className="w-3 h-3 text-gray-600" />
                        </div>
                        <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                        <div className="w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded-md" onClick={() => updateQty(item.cartId, 1)}>
                          <Plus className="w-3 h-3 text-gray-600" />
                        </div>
                      </div>
                      <div className="w-6 h-6 flex items-center justify-center cursor-pointer text-red-400 hover:bg-red-50 rounded-md" onClick={() => removeItem(item.cartId)}>
                        <Trash2 className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 flex gap-2">
          <Button className="flex-1 bg-amber-100 text-amber-700 font-semibold border border-amber-200" startContent={<Save className="w-4 h-4" />} onPress={handleHoldOrder} isDisabled={cart.length === 0}>
            Hold
          </Button>
          <Button className="flex-1 bg-blue-100 text-blue-700 font-semibold border border-blue-200" startContent={<FileText className="w-4 h-4" />} onPress={() => setActivePage("bills")}>
            Split
          </Button>
        </div>

        {/* Checkout Summary */}
        <div className="p-6 bg-white border-t border-gray-100 mt-4 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="text-gray-800 font-bold">Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 font-medium">Pajak (PB1 11%)</span>
              <span className="text-gray-800 font-bold">Rp {tax.toLocaleString("id-ID")}</span>
            </div>
            <Divider className="my-1" />
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-gray-800">Total Dibayar</span>
              <span className="text-2xl font-black text-[#6c5ce7]">Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <Button 
            className="w-full h-14 bg-[#6c5ce7] text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-500/30"
            isDisabled={cart.length === 0}
            onPress={onPayOpen}
          >
            Bayar Pesanan
          </Button>
        </div>
      </div>

      {/* ========== CUSTOM ORDER MODAL ========== */}
      <Modal isOpen={isCustomOpen} onClose={onCustomClose} size="lg" classNames={{ base: "rounded-3xl" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 pb-2">
                <h2 className="text-xl font-black text-gray-800">{selectedItem?.name}</h2>
                <p className="text-sm text-gray-500 font-normal">Pilih custom pesanan pelanggan</p>
              </ModalHeader>
              <ModalBody className="py-4 space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-2">Tingkat Kemanisan (Sugar)</h4>
                  <div className="flex gap-2">
                    {["Normal", "Less", "Half", "No Sugar"].map((lvl) => (
                      <Chip
                        key={lvl}
                        variant="flat"
                        className={`cursor-pointer transition-colors ${modifiers.sugar === lvl ? "bg-[#6c5ce7] text-white" : "bg-gray-100 text-gray-600"}`}
                        onClick={() => setModifiers({...modifiers, sugar: lvl})}
                      >
                        {lvl}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-2">Jumlah Es (Ice)</h4>
                  <div className="flex gap-2">
                    {["Normal", "Less", "No Ice"].map((lvl) => (
                      <Chip
                        key={lvl}
                        variant="flat"
                        className={`cursor-pointer transition-colors ${modifiers.ice === lvl ? "bg-[#6c5ce7] text-white" : "bg-gray-100 text-gray-600"}`}
                        onClick={() => setModifiers({...modifiers, ice: lvl})}
                      >
                        {lvl}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-2">Pilihan Susu</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Regular", price: 0 },
                      { label: "Oat Milk", price: 8000 },
                      { label: "Almond Milk", price: 10000 },
                    ].map((milk) => (
                      <div
                        key={milk.label}
                        className={`border rounded-xl p-3 cursor-pointer transition-all flex-1 text-center ${
                          modifiers.milk === milk.label ? "border-[#6c5ce7] bg-[#6c5ce7]/5" : "border-gray-200"
                        }`}
                        onClick={() => setModifiers({...modifiers, milk: milk.label})}
                      >
                        <p className={`text-sm font-bold ${modifiers.milk === milk.label ? "text-[#6c5ce7]" : "text-gray-700"}`}>{milk.label}</p>
                        <p className="text-xs text-gray-500">{milk.price > 0 ? `+ Rp ${milk.price.toLocaleString('id-ID')}` : 'Gratis'}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div
                    className={`border rounded-xl p-4 cursor-pointer transition-all flex items-center justify-between ${
                      modifiers.extraShot ? "border-[#6c5ce7] bg-[#6c5ce7]/5" : "border-gray-200"
                    }`}
                    onClick={() => setModifiers({...modifiers, extraShot: !modifiers.extraShot})}
                  >
                    <div>
                      <p className={`text-sm font-bold ${modifiers.extraShot ? "text-[#6c5ce7]" : "text-gray-700"}`}>Tambah Extra Shot Espresso</p>
                      <p className="text-xs text-gray-500">+ Rp 5.000</p>
                    </div>
                    <Checkbox isSelected={modifiers.extraShot} color="secondary" />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-gray-100">
                <Button variant="light" onPress={onClose} className="font-semibold text-gray-600">
                  Batal
                </Button>
                <Button className="bg-[#6c5ce7] text-white font-bold" onPress={confirmCustomOrder}>
                  Tambahkan ke Keranjang
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ========== PAYMENT MODAL ========== */}
      <Modal isOpen={isPayOpen} onClose={onPayClose} size="md" classNames={{ base: "rounded-3xl" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 pb-2">
                <h2 className="text-xl font-black text-gray-800">Pembayaran</h2>
                <p className="text-sm text-gray-500 font-normal">Total: Rp {total.toLocaleString("id-ID")}</p>
              </ModalHeader>
              <ModalBody className="py-4">
                {paymentSuccess ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-black text-emerald-600">Pembayaran Berhasil!</h3>
                    <p className="text-sm text-gray-500 mt-2">Pesanan sedang diproses...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-800">Pilih Metode Pembayaran</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "Cash", label: "Cash", icon: Banknote },
                        { id: "QRIS", label: "QRIS", icon: QrCode },
                        { id: "Card", label: "Kartu", icon: CreditCard },
                      ].map((method) => (
                        <div
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`border rounded-2xl p-4 cursor-pointer transition-all text-center ${
                            paymentMethod === method.id ? "border-[#6c5ce7] bg-[#6c5ce7]/5" : "border-gray-200"
                          }`}
                        >
                          <method.icon className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === method.id ? "text-[#6c5ce7]" : "text-gray-400"}`} />
                          <p className={`text-sm font-bold ${paymentMethod === method.id ? "text-[#6c5ce7]" : "text-gray-600"}`}>{method.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-bold text-gray-800">Rp {subtotal.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Pajak (PB1 11%)</span>
                        <span className="font-bold text-gray-800">Rp {tax.toLocaleString("id-ID")}</span>
                      </div>
                      <Divider />
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-800">Total</span>
                        <span className="text-xl font-black text-[#6c5ce7]">Rp {total.toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              {!paymentSuccess && (
                <ModalFooter className="border-t border-gray-100">
                  <Button variant="light" onPress={onClose} className="font-semibold text-gray-600">
                    Batal
                  </Button>
                  <Button 
                    className="bg-[#6c5ce7] text-white font-bold flex-1"
                    onPress={handlePayment}
                    isLoading={paymentProcessing}
                  >
                    Bayar Sekarang
                  </Button>
                </ModalFooter>
              )}
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ========== TABLE/CUSTOMER MODAL ========== */}
      <Modal isOpen={isTableOpen} onClose={onTableClose} size="sm" classNames={{ base: "rounded-3xl" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Ubah Meja / Customer</ModalHeader>
              <ModalBody className="space-y-4">
                <Input label="Nomor Meja" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="Meja 1" />
                <Input label="Tipe Customer" value={customerType} onChange={(e) => setCustomerType(e.target.value)} placeholder="Umum / Member" />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Batal</Button>
                <Button className="bg-[#6c5ce7] text-white font-bold" onPress={onClose}>Simpan</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

    </div>
  );
};
