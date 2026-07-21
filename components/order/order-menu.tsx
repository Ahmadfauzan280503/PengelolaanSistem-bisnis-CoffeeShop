"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Plus, Minus, FileText, ChevronRight, X, AlertCircle, Utensils, Bike, FileSignature, Coffee, ArrowLeft } from "lucide-react";
import { Button } from "@nextui-org/react";
import { QRPaymentModal } from "./qr-payment-modal";

const DEFAULT_PRODUCTS = [
  { id: 1, name: "Cold Brew", category: "DRINK", price: 24000, image: "/produk/coffee/Cold Brew.jpeg", description: "Kopi dingin yang diseduh perlahan selama 12 jam" },
  { id: 2, name: "Hot Americano", category: "ESPRESSO BASED.", price: 40000, image: "/produk/coffee/Hot Americano.jpeg", description: "Espresso dengan air panas yang sempurna" },
  { id: 3, name: "Ice Americano", category: "ESPRESSO BASED.", price: 15000, image: "/produk/coffee/Ice Americano.jpeg", description: "Espresso dingin yang menyegarkan" },
  { id: 4, name: "Ice Coffee Aren Latte", category: "ESPRESSO BASED.", price: 52000, image: "/produk/coffee/Ice Coffee Aren Latte.jpeg", description: "Latte dengan gula aren asli Nusantara" },
  { id: 5, name: "Ice Coffee Milk", category: "ESPRESSO BASED.", price: 132000, image: "/produk/coffee/Ice Coffee Milk.jpeg", description: "Perpaduan kopi dan susu premium" },
  { id: 6, name: "Roti Bakar Tiramisu", category: "FOOD", price: 24000, image: "/produk/food/Roti bakar Tiramisu.jpg", description: "Roti bakar dengan topping tiramisu lezat" },
  { id: 7, name: "Chocolate Caramel", category: "CHOCOLATE", price: 32000, image: "/produk/non coffee/Chocolate Caramel.jpg", description: "Coklat dengan saus karamel manis" },
  { id: 8, name: "Ice Chocolate", category: "CHOCOLATE", price: 44000, image: "/produk/non coffee/Ice Chocolate.jpeg", description: "Coklat dingin premium yang creamy" },
];

const CATEGORIES = ["Semua", "People love this!", "Best Choice", "PAKET SIGNATURE.", "DRINK", "CHOCOLATE", "ESPRESSO BASED.", "FOOD"];

const formatBranchName = (slug: string) => {
  if (!slug) return "KOTACOFFEE.ID - Sultan Alauddin";
  return "KOTACOFFEE.ID - " + slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  notes: string;
}

export const OrderMenu = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();

  const urlMode = searchParams.get("mode") || "";
  const urlTable = searchParams.get("tableNumber");
  const urlBranchCode = params?.branch as string || "sultan-alauddin";
  
  const initialBranch = urlBranchCode;

  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [disabledProducts, setDisabledProducts] = useState<number[]>([]);
  
  const [branchCode] = useState(initialBranch);
  const [tableNumber, setTableNumber] = useState(urlTable || "");
  const [mode, setMode] = useState(urlMode);
  
  const [showSplash, setShowSplash] = useState(!urlMode || !urlTable);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showQRIS, setShowQRIS] = useState(false);
  
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const syncMenu = () => {
      const stored = localStorage.getItem("products");
      if (stored) setProducts(JSON.parse(stored));
      else {
        setProducts(DEFAULT_PRODUCTS);
        localStorage.setItem("products", JSON.stringify(DEFAULT_PRODUCTS));
      }
      const disabled = JSON.parse(localStorage.getItem("disabled_products") || "[]");
      setDisabledProducts(disabled);
    };

    syncMenu();
    const interval = setInterval(syncMenu, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectMode = (selectedMode: string) => {
    setMode(selectedMode);
    if (selectedMode === "dinein") {
      setShowTableModal(true);
    } else {
      setTableNumber("");
      handleStartOrdering(selectedMode, "");
    }
  };

  const handleStartOrdering = (selectedMode: string, selectedTable: string) => {
    setShowTableModal(false);
    setShowSplash(false);
    
    const targetBranch = urlBranchCode || initialBranch;
    
    let url = `/order/${targetBranch}?mode=${selectedMode}`;
    if (selectedTable) url += `&tableNumber=${encodeURIComponent(selectedTable)}`;
    router.push(url);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      let matchCategory = activeCategory === "Semua";
      if (activeCategory === "People love this!") {
        matchCategory = product.id <= 3;
      } else if (activeCategory === "Best Choice") {
        matchCategory = product.id >= 6;
      } else if (activeCategory === "PAKET SIGNATURE.") {
        matchCategory = product.category === "Coffee" || product.category === "ESPRESSO BASED." || product.category === "DRINK";
      } else if (!matchCategory) {
        matchCategory = product.category?.toUpperCase() === activeCategory.toUpperCase();
      }

      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery, products]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const tax = Math.round(cartTotal * 0.1);
  const serviceCharge = Math.round(cartTotal * 0.05);
  const grandTotal = cartTotal + tax + serviceCharge;

  const formatCurrency = (v: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(v);
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, image: product.image, notes: "" }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const updateNotes = (id: number, newNotes: string) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, notes: newNotes } : i));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowCart(false);
    setShowCheckout(true);
  };

  const handlePayQRIS = () => {
    if (!customerName.trim()) {
      alert("Nama pelanggan wajib diisi!");
      return;
    }
    setShowCheckout(false);
    setShowQRIS(true);
  };

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    try {
      const currentBranch = formatBranchName(branchCode);
      const orderData = {
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        table_number: tableNumber || "-",
        order_mode: mode,
        cabang: urlBranchCode,
        items: cart.map(i => ({ 
          name: i.name, 
          quantity: i.quantity, 
          price: i.price, 
          subtotal: i.price * i.quantity,
          notes: i.notes
        })),
        subtotal: cartTotal,
        tax,
        service_charge: serviceCharge,
        total_price: grandTotal,
        payment_method: "QRIS",
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });
      const result = await res.json();
      
      if (result.success) {
        setCart([]);
        const urlParams = new URLSearchParams({
          orderId: result.order_id || "ORD-" + Date.now(),
          name: customerName,
          table: tableNumber || "-",
          branch: currentBranch,
          total: grandTotal.toString(),
          items: JSON.stringify(cart),
          subtotal: cartTotal.toString(),
          tax: tax.toString(),
          service: serviceCharge.toString(),
        });
        router.push(`/order/${branchCode}/summary?${urlParams.toString()}`);
      } else {
        alert("Pembayaran gagal: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan. Silakan coba lagi.");
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-28 font-sans antialiased relative selection:bg-[#f05a28] selection:text-white">
      
      {/* ======================= SPLASH / FRONT PAGE ======================= */}
      <AnimatePresence>
        {showSplash && !showTableModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white overflow-y-auto flex flex-col"
          >
            <div className="flex justify-center items-center py-6 border-b border-gray-100/50 backdrop-blur-md">
               <h1 className="text-xl font-black text-gray-900 tracking-tighter">
                 KOTA<span className="text-[#f05a28]">COFFEE</span>
               </h1>
            </div>

            <div className="flex-1 flex flex-col items-center px-6 pt-12 pb-8 max-w-md mx-auto w-full">
              <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-10 leading-snug">
                Pilih cara nikmati pesananmu
              </h2>

              <div className="flex justify-between items-center w-full px-4 mb-14">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-orange-50/80 rounded-2xl flex items-center justify-center border border-orange-100 shadow-sm shadow-orange-100">
                    <FileSignature className="text-[#f05a28]" size={24} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Pesan</span>
                </div>
                <div className="w-12 h-[2px] bg-gradient-to-r from-orange-100 to-orange-200 rounded-full"></div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-orange-50/80 rounded-2xl flex items-center justify-center border border-orange-100 shadow-sm shadow-orange-100">
                    <ShoppingBag className="text-[#f05a28]" size={24} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Bayar</span>
                </div>
                <div className="w-12 h-[2px] bg-gradient-to-r from-orange-200 to-orange-100 rounded-full"></div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 bg-orange-50/80 rounded-2xl flex items-center justify-center border border-orange-100 shadow-sm shadow-orange-100">
                    <Coffee className="text-[#f05a28]" size={24} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Nikmati</span>
                </div>
              </div>

              <div className="w-full space-y-4 mt-auto">
                <button onClick={() => handleSelectMode("dinein")} className="w-full group bg-gradient-to-r from-[#f05a28] to-[#ff7a4f] text-white rounded-[20px] py-4 px-6 flex items-center justify-between font-bold text-[16px] shadow-xl shadow-orange-500/25 active:scale-[0.98] transition-all hover:shadow-orange-500/40">
                  <div className="flex items-center gap-3">
                    <Utensils size={22} className="group-hover:scale-110 transition-transform" />
                    <span>Dine In (Makan di Tempat)</span>
                  </div>
                  <ChevronRight size={20} className="opacity-80" />
                </button>
                <button onClick={() => handleSelectMode("takeaway")} className="w-full group bg-white border-2 border-gray-100 text-gray-800 rounded-[20px] py-4 px-6 flex items-center justify-between font-bold text-[16px] active:scale-[0.98] transition-all hover:border-gray-200 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={22} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <span>Take Away (Bawa Pulang)</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>
                <button onClick={() => handleSelectMode("delivery")} className="w-full group bg-white border-2 border-gray-100 text-gray-800 rounded-[20px] py-4 px-6 flex items-center justify-between font-bold text-[16px] active:scale-[0.98] transition-all hover:border-gray-200 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <Bike size={22} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <span>Delivery (Pesan Antar)</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================= TABLE NUMBER MODAL ======================= */}
      <AnimatePresence>
        {showTableModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={() => { setShowTableModal(false); setShowSplash(true); }}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} onClick={e => e.stopPropagation()} className="w-full max-w-md bg-white rounded-t-[32px] pt-3 pb-8 px-8 shadow-2xl">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8"></div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Nomor Meja</h3>
              <p className="text-sm text-gray-500 mb-8 font-medium">Masukkan nomor meja tempat Anda duduk saat ini.</p>
              <div className="mb-8 relative">
                <input type="text" value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="Contoh: 12" className="w-full border-b-2 border-gray-200 bg-transparent py-3 text-3xl font-black text-center text-gray-900 focus:border-[#f05a28] focus:outline-none transition-colors placeholder:text-gray-300" />
              </div>
              <button onClick={() => handleStartOrdering("dinein", tableNumber)} disabled={!tableNumber.trim()} className={`w-full py-4 rounded-[18px] font-black text-[16px] transition-all ${tableNumber.trim() ? "bg-[#f05a28] text-white shadow-xl shadow-orange-500/30 active:scale-[0.98] hover:shadow-orange-500/40" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                Mulai Pesan
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================= MAIN MENU ======================= */}
      {!showSplash && (
        <>
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
            <div className="max-w-xl mx-auto flex items-center justify-between px-5 py-3.5">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lokasi Outlet</span>
                <h1 className="text-[14px] font-black text-gray-900 flex items-center gap-1.5 mt-0.5">
                  {formatBranchName(branchCode)}
                  <ChevronRight size={14} className="text-[#f05a28]" />
                </h1>
              </div>
              <button onClick={() => setShowSearch(true)} className="w-10 h-10 flex items-center justify-center text-gray-700 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors shadow-sm border border-gray-100">
                <Search size={18} />
              </button>
            </div>
          </header>

          <main className="max-w-xl mx-auto min-h-screen">
            {/* Banner Mode */}
            <div className="px-5 py-3 flex items-center justify-between bg-white border-b border-gray-100/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100/50">
                  <Utensils size={16} className="text-[#f05a28]" />
                </div>
                <div>
                  <p className="text-[13px] font-black text-gray-900 leading-tight">
                    {mode === "dinein" ? "Makan di tempat" : mode === "takeaway" ? "Bawa Pulang" : "Pesan Antar"}
                  </p>
                  {mode === "dinein" && (
                    <p className="text-[11px] text-gray-500 font-bold mt-0.5">Meja: <span className="text-[#f05a28]">{decodeURIComponent(tableNumber)}</span></p>
                  )}
                </div>
              </div>
              <button onClick={() => setShowSplash(true)} className="text-[11px] font-black text-[#f05a28] bg-orange-50 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors">
                Ubah
              </button>
            </div>

            {/* Categories */}
            <div className="sticky top-[66px] z-30 bg-[#F8F9FA]/90 backdrop-blur-md pt-3 pb-3">
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide px-5 select-none pb-2">
                {CATEGORIES.map(cat => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-5 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all duration-300 ${
                        isActive 
                          ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-105" 
                          : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 shadow-sm"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Products */}
            <div className="px-5 py-4">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <AlertCircle size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-bold text-sm">Oops, menu tidak ditemukan</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:gap-5">
                  {filteredProducts.map(product => {
                    const inCart = cart.find(i => i.id === product.id);
                    const isSoldOut = disabledProducts.includes(product.id);
                    
                    return (
                      <div key={product.id} className={`bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col relative group transition-transform duration-300 hover:-translate-y-1 ${isSoldOut ? "opacity-70 grayscale-[0.8]" : ""}`}>
                        <div className="aspect-[4/3] relative w-full overflow-hidden bg-gray-50">
                          <img src={product.image} alt={product.name} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110`} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          {isSoldOut && (
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                              <span className="bg-gray-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest shadow-lg">HABIS</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4 flex flex-col flex-1 bg-white relative z-20 -mt-2 rounded-t-[20px]">
                          <h3 className="text-[14px] font-black text-gray-900 leading-tight mb-1">{product.name}</h3>
                          
                          <div className="mt-auto pt-3 flex items-center justify-between">
                            <span className="text-[14px] font-black text-[#f05a28]">{formatCurrency(product.price)}</span>
                            
                            {!isSoldOut && (
                              inCart ? (
                                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-1 py-1">
                                  <button onClick={() => updateQuantity(product.id, -1)} className="w-6 h-6 flex items-center justify-center text-gray-700 font-bold hover:bg-white hover:shadow-sm rounded-full transition-all">-</button>
                                  <span className="text-[13px] font-black w-3 text-center">{inCart.quantity}</span>
                                  <button onClick={() => updateQuantity(product.id, 1)} className="w-6 h-6 flex items-center justify-center bg-[#f05a28] text-white rounded-full font-bold shadow-sm shadow-orange-500/30 active:scale-95 transition-all">+</button>
                                </div>
                              ) : (
                                <button onClick={() => addToCart(product)} className="w-8 h-8 flex items-center justify-center bg-gray-50 border border-gray-200 text-gray-700 rounded-full hover:bg-[#f05a28] hover:border-[#f05a28] hover:text-white transition-all hover:shadow-md hover:shadow-orange-500/20 active:scale-95">
                                  <Plus size={16} strokeWidth={3} />
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {/* ======================= SEARCH OVERLAY ======================= */}
      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 z-[80] bg-white flex flex-col">
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 shadow-sm">
              <button onClick={() => { setShowSearch(false); setSearchQuery(""); }} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input autoFocus type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Cari kopi, makanan..." className="w-full bg-gray-100 text-[14px] font-semibold rounded-full py-3 pl-11 pr-10 focus:outline-none focus:ring-2 focus:ring-[#f05a28]/30 focus:bg-white border border-transparent focus:border-[#f05a28]/30 transition-all placeholder:text-gray-400" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 p-1 hover:text-gray-600">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-gray-50 p-5">
              <div className="space-y-4 max-w-xl mx-auto">
                {searchQuery && filteredProducts.length === 0 && (
                   <p className="text-center text-sm font-bold text-gray-400 mt-12">Oops, &quot;{searchQuery}&quot; tidak ditemukan.</p>
                )}
                {searchQuery && filteredProducts.map(product => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={`search-${product.id}`} className="bg-white p-3 rounded-[20px] flex gap-4 shadow-sm border border-gray-100 items-center">
                    <img src={product.image} alt={product.name} className="w-20 h-20 rounded-2xl object-cover bg-gray-100 border border-gray-50" />
                    <div className="flex-1">
                      <h4 className="text-[14px] font-black text-gray-900 leading-tight">{product.name}</h4>
                      <p className="text-[14px] font-black text-[#f05a28] mt-1">{formatCurrency(product.price)}</p>
                    </div>
                    <button onClick={() => { addToCart(product); setShowSearch(false); }} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-[12px] font-black shadow-lg shadow-gray-900/20 active:scale-95 transition-transform">
                      Tambah
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================= FLOATING CART BUTTON ======================= */}
      {cartCount > 0 && !showCart && !showCheckout && !showQRIS && !showSplash && !showSearch && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 z-50 p-5 max-w-xl mx-auto bg-gradient-to-t from-white via-white/95 to-transparent pt-12 pb-6">
          <button onClick={() => setShowCart(true)} className="w-full bg-gray-900 text-white h-[60px] px-6 rounded-[20px] font-bold text-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center justify-between active:scale-[0.98] transition-all hover:bg-gray-800 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">
                <ShoppingBag size={16} />
              </div>
              <span className="font-black">{cartCount} Item</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg">{formatCurrency(cartTotal)}</span>
            </div>
          </button>
        </motion.div>
      )}

      {/* ======================= CART DRAWER ======================= */}
      <AnimatePresence>
        {showCart && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={() => setShowCart(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} onClick={e => e.stopPropagation()} className="bg-white w-full max-w-xl rounded-t-[32px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
              <div className="p-6 pb-4 flex items-center justify-between bg-white border-b border-gray-100 shrink-0">
                <h2 className="text-gray-900 font-black text-xl tracking-tight">Pesanan Anda</h2>
                <button onClick={() => setShowCart(false)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 font-bold hover:bg-gray-200 transition-colors">✕</button>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-[#F8F9FA] p-5 space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="bg-white border border-gray-100 rounded-[24px] p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-xl w-8 h-8 flex items-center justify-center text-[13px] font-black text-gray-800 shrink-0">
                        {item.quantity}x
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-gray-900 font-black text-[15px] leading-tight mb-1">{item.name}</p>
                        <p className="text-[#f05a28] font-black text-[14px]">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-1.5 py-1.5 shrink-0">
                        <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center text-gray-700 font-bold hover:bg-white rounded-full transition-colors">-</button>
                        <span className="text-[13px] font-black w-3 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-[#f05a28] text-white rounded-full font-bold shadow-sm shadow-orange-500/30 active:scale-95 transition-transform">+</button>
                      </div>
                    </div>
                    
                    <div className="mt-4 relative pl-10 pr-2">
                      <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" value={item.notes} onChange={(e) => updateNotes(item.id, e.target.value)} placeholder="Tulis catatan (opsional)..." className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-2 pr-3 text-[13px] text-gray-800 focus:border-[#f05a28]/50 focus:bg-white focus:outline-none transition-all font-semibold placeholder:text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] shrink-0">
                <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-[20px] border border-gray-100">
                  <div className="flex justify-between text-[13px] text-gray-500 font-bold">
                    <span>Subtotal</span>
                    <span className="text-gray-700">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] text-gray-500 font-bold">
                    <span>Pajak (PB1 10%)</span>
                    <span className="text-gray-700">{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] text-gray-500 font-bold">
                    <span>Service (5%)</span>
                    <span className="text-gray-700">{formatCurrency(serviceCharge)}</span>
                  </div>
                  <div className="flex justify-between text-[16px] font-black text-gray-900 pt-3 border-t border-gray-200 mt-3">
                    <span>Total Keseluruhan</span>
                    <span className="text-[#f05a28]">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
                
                <Button onPress={handleCheckout} className="w-full bg-[#f05a28] text-white h-[60px] rounded-[20px] font-black text-[16px] shadow-xl shadow-orange-500/30 active:scale-[0.98] transition-transform">
                  Checkout Pesanan
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================= CHECKOUT ======================= */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-[#F8F9FA] flex flex-col max-w-xl mx-auto">
            <div className="p-5 flex items-center gap-4 border-b border-gray-100 bg-white sticky top-0 z-10">
               <button onClick={() => { setShowCheckout(false); setShowCart(true); }} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                 <ArrowLeft size={20} className="text-gray-700" />
               </button>
               <h2 className="text-gray-900 font-black text-lg">Detail Pembayaran</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm space-y-5">
                <h3 className="text-[15px] font-black text-gray-900">Informasi Pemesan</h3>
                <div>
                  <label className="text-[12px] font-bold text-gray-500 block mb-2 uppercase tracking-wide">Nama Lengkap *</label>
                  <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Ketik nama Anda" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[14px] font-black text-gray-900 focus:border-[#f05a28] focus:bg-white focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-500 block mb-2 uppercase tracking-wide">Email (Opsional)</label>
                  <input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} type="email" placeholder="email@contoh.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-[14px] font-black text-gray-900 focus:border-[#f05a28] focus:bg-white focus:outline-none transition-all" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
                 <h3 className="text-[15px] font-black text-gray-900 mb-4">Pilih Pembayaran</h3>
                 <div className="border-2 border-[#f05a28] bg-orange-50/50 rounded-[16px] p-4 flex items-center gap-4 cursor-pointer relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-[#f05a28]/5 rounded-bl-full"></div>
                   <div className="w-12 h-12 bg-[#f05a28] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20 relative z-10">
                      <span className="text-white font-black text-[11px] tracking-widest">QRIS</span>
                   </div>
                   <div className="relative z-10">
                     <p className="font-black text-[15px] text-gray-900">QRIS Instant</p>
                     <p className="text-[12px] text-gray-500 font-semibold mt-0.5">OVO, Dana, Gopay, ShopeePay</p>
                   </div>
                   <div className="ml-auto relative z-10">
                     <div className="w-5 h-5 rounded-full bg-[#f05a28] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                     </div>
                   </div>
                 </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-gray-100 sticky bottom-0 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
              <div className="flex justify-between items-end mb-5 px-2">
                 <span className="text-[13px] font-bold text-gray-500 uppercase tracking-wide">Total Tagihan</span>
                 <span className="text-2xl font-black text-[#f05a28] leading-none">{formatCurrency(grandTotal)}</span>
              </div>
              <Button onPress={handlePayQRIS} className="w-full bg-[#f05a28] text-white h-[60px] rounded-[20px] font-black text-[16px] shadow-xl shadow-orange-500/30 active:scale-[0.98] transition-transform">
                Bayar Sekarang
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <QRPaymentModal isOpen={showQRIS} onOpenChange={() => { setShowQRIS(false); setShowCheckout(true); }} amount={grandTotal} onPaymentSuccess={handleSimulatePayment} />
    </div>
  );
};
