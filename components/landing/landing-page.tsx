"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowUpRight, ShoppingBag, Heart, User, Check, Sparkles, Flame, Globe, Coffee, Menu, X } from "lucide-react";
import { Button, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Textarea } from "@nextui-org/react";
import { MessageCircle } from "lucide-react";
import { getProducts } from "@/app/actions/hrd";

// Static fallback products for the "MY PRODUK BEANS" section
const STATIC_PRODUCTS = [
  {
    id: "static-1",
    name: "Robusta Mamasa",
    price: "Rp45.000 / 250g",
    description: "Kopi Robusta khas Mamasa dengan karakter rasa kuat, bold, dan aroma khas. Cocok bagi penikmat kopi dengan cita rasa tegas dan nikmat.",
    image: "./produk/mycoffeeza/1.png",
    color: "#FCE7F3",
  },
  {
    id: "static-2",
    name: "Arabika Toraja",
    price: "Rp75.000 / 250g",
    description: "Kopi Arabika khas Toraja dengan cita rasa seimbang, aroma harum, dan sensasi lembut di setiap tegukan. Pilihan tepat untuk penikmat kopi premium.",
    image: "./produk/mycoffeeza/3.png",
    color: "#FEF3C7",
  },
  {
    id: "static-3",
    name: "Arabika Enrekang",
    price: "Rp70.000 / 250g",
    description: "Kopi Arabika pilihan dari Enrekang dengan karakter clean, manis, dan aroma floral yang khas. Menghadirkan cita rasa autentik dari dataran tinggi Enrekang.",
    image: "./produk/mycoffeeza/4.png",
    color: "#E0F2FE",
  },
  {
    id: "static-4",
    name: "Robusta Enrekang",
    price: "Rp45.000 / 250g",
    description: "Kopi Robusta pilihan dari Enrekang dengan karakter bold, aroma kuat, dan rasa yang mantap. Cocok untuk dinikmati setiap hari.",
    image: "./produk/mycoffeeza/7.png",
    color: "#ECEFfe",
  },
  {
    id: "static-5",
    name: "Blend 50:50",
    price: "Rp40.000 / 250g",
    description: "Perpaduan 50% Arabika dan 50% Robusta yang menghasilkan rasa seimbang, aroma nikmat, dan karakter bold. Pilihan pas bagi Anda yang menyukai kopi dengan cita rasa lebih kompleks.",
    image: "./produk/mycoffeeza/6.png",
    color: "#FCE7F3",
  },
];

export const LandingPage = () => {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const {isOpen: isChatOpen, onOpen: onChatOpen, onOpenChange: onChatOpenChange} = useDisclosure();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);

  const [newReview, setNewReview] = useState({ name: "", branch: "", message: "" });
  
  // Promo image state
  const [promoImages, setPromoImages] = useState<string[]>(["", "", ""]);

  // Products from database for the beans section
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  const handleAddReview = () => {
    if (!newReview.name || !newReview.branch || !newReview.message) return;
    
    const review = {
      id: Date.now(),
      name: newReview.name,
      branch: newReview.branch,
      message: newReview.message,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedReviews = [review, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem("mana_live_reviews", JSON.stringify(updatedReviews));
    setNewReview({ name: "", branch: "", message: "" });
  };

  useEffect(() => {
    // Fetch products from database
    const fetchProducts = async () => {
      try {
        const products = await getProducts();
        if (products && products.length > 0) {
          setDbProducts(products);
          setBestSellers(products.filter((p: any) => p.is_bestseller).slice(0, 3));
        }
      } catch (e) {
        console.error("Failed to fetch products from DB:", e);
      }
    };
    fetchProducts();

    // Fallback: also check localStorage
    const stored = localStorage.getItem("mana_products");
    if (stored) {
      const products = JSON.parse(stored);
      if (bestSellers.length === 0) {
        setBestSellers(products.filter((p: any) => p.is_best_seller).slice(0, 3));
      }
    }
    
    const storedReviews = localStorage.getItem("mana_live_reviews");
    if (storedReviews) {
      setReviews(JSON.parse(storedReviews));
    }
    
    const storedPromoStr = localStorage.getItem("mana_promo_images");
    if (storedPromoStr) {
      try {
        const parsed = JSON.parse(storedPromoStr);
        if (Array.isArray(parsed) && parsed.length === 3) {
          setPromoImages(parsed);
        }
      } catch (e) {}
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mana_promo_images") {
        try {
          const parsed = JSON.parse(e.newValue || "[]");
          if (Array.isArray(parsed) && parsed.length === 3) {
            setPromoImages(parsed);
          }
        } catch(e) {}
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Sync cart count from order menu if any local storage items exist
  useEffect(() => {
    const updateCartCount = () => {
      const items = JSON.parse(localStorage.getItem("cart") || "[]");
      const count = items.reduce((sum: number, i: any) => sum + i.quantity, 0);
      setCartCount(count);
    };
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  // Merge database products with static fallback for the beans section
  const displayProducts = dbProducts.length > 0
    ? STATIC_PRODUCTS.map((sp, idx) => {
        const dbMatch = dbProducts.find((dp: any) => dp.name?.toLowerCase().includes(sp.name.split(" ")[0].toLowerCase()));
        return {
          ...sp,
          image: dbMatch?.image_url || sp.image,
          description: dbMatch?.description || sp.description,
        };
      })
    : STATIC_PRODUCTS;

  return (
    <div className="min-h-screen bg-[#FCFAF6] text-[#2D1B4E] overflow-x-hidden font-sans relative">
      
      {/* ================= 1. TOP MARQUEE RUNNING TICKER ================= */}
      <div className="bg-[#2D1B4E] text-[#FCFAF6] py-2 sm:py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-widest overflow-hidden whitespace-nowrap border-b-4 border-[#2D1B4E] select-none relative z-30">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          <span>⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • </span>
          <span>⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • </span>
        </div>
      </div>

      {/* ================= 2. NAVIGATION BAR ================= */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center relative z-25">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-[#E94E77] drop-shadow-[3px_3px_0px_#2D1B4E] font-mono uppercase border-4 border-[#2D1B4E] bg-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-2xl transform -rotate-2 hover:rotate-0 transition-transform">
            Mycoffeeza
          </span>
        </div>
        
        {/* Nav Links - Desktop */}
        <div className="hidden lg:flex items-center gap-10 text-xs font-black uppercase tracking-wider text-[#2D1B4E]/90 bg-white border-4 border-[#2D1B4E] px-8 py-3 rounded-full shadow-[4px_4px_0px_#2D1B4E]">
          <a href="#flavors" className="hover:text-[#E94E77] transition-colors">Menu Bestseller</a>
          <a href="#happiness" className="hover:text-[#E94E77] transition-colors">Shop</a>
          <a href="#story" className="hover:text-[#E94E77] transition-colors">Story</a>
          <a href="#social" className="hover:text-[#E94E77] transition-colors">Blog</a>
          <a href="#footer" className="hover:text-[#E94E77] transition-colors">Community</a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onPress={onChatOpen}
            className="rounded-2xl bg-[#E94E77] text-white border-4 border-[#2D1B4E] font-black px-3 sm:px-6 py-4 sm:py-5 shadow-[4px_4px_0px_#2D1B4E] text-[10px] sm:text-xs hover:scale-105 hover:bg-[#E94E77]/90 active:scale-95 transition-transform flex items-center gap-1 sm:gap-2"
          >
            <MessageCircle size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Live Chat Penilaian</span>
            <span className="sm:hidden">Chat</span>
          </Button>
          
          {/* Mobile Hamburger */}
          <button
            className="lg:hidden bg-white border-4 border-[#2D1B4E] rounded-2xl p-2.5 shadow-[4px_4px_0px_#2D1B4E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-x-0 top-0 z-50 bg-white border-b-4 border-[#2D1B4E] shadow-2xl"
          >
            <div className="px-6 py-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-2xl font-black text-[#E94E77]">Menu</span>
                <button
                  className="bg-[#2D1B4E] text-white rounded-xl p-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { href: "#flavors", label: "Menu Bestseller" },
                  { href: "#happiness", label: "Shop" },
                  { href: "#story", label: "Story" },
                  { href: "#social", label: "Produk" },
                  { href: "#footer", label: "Community" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-black uppercase tracking-wider text-[#2D1B4E] bg-[#FCFAF6] border-2 border-[#2D1B4E] rounded-xl px-5 py-3 hover:bg-[#E94E77] hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= 3. HERO BANNER SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-24 relative z-10">
        <div className="text-center space-y-4 sm:space-y-6 max-w-4xl mx-auto">
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-[100px] font-black tracking-tight text-[#2D1B4E] leading-[0.9] font-sans drop-shadow-[4px_4px_0px_rgba(45,27,78,0.08)]">
            WELCOME TO <br />
            MYCOFFEEZA
          </h1>
          
          {/* CTA Button */}
          <div className="flex items-center justify-center gap-2 pt-2 sm:pt-4">
            <button 
              onClick={() => window.open('https://instagram.com/mycoffeeza', '_blank')}
              className="bg-[#2D1B4E] hover:bg-[#E94E77] text-white rounded-full px-6 sm:px-8 py-3 sm:py-4 font-black text-xs sm:text-sm flex items-center gap-2 sm:gap-3 shadow-[6px_6px_0px_#E94E77] border-4 border-[#2D1B4E] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              Drink it up <span className="bg-white text-[#2D1B4E] w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-black">➔</span>
            </button>
          </div>
          
          <p className="text-[#2D1B4E]/60 text-[10px] sm:text-xs font-extrabold tracking-widest uppercase pt-1 sm:pt-2 flex items-center justify-center gap-2">
            ⭐ Thirst <span className="underline decoration-[#E94E77] decoration-4 underline-offset-4">quenching</span> drink made just for you. ⭐
          </p>
        </div>

        {/* 3D Cans Showcase & Grid Cards */}
        <div className="mt-10 sm:mt-16 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 relative">
          
          {/* Left Review Card */}
          <div className="w-full lg:w-[260px] space-y-4 bg-white p-5 sm:p-6 rounded-[24px] sm:rounded-[32px] border-4 border-[#2D1B4E] shadow-[8px_8px_0px_#2D1B4E] relative z-20 transform -rotate-1 hover:rotate-0 transition-transform">
            <div className="flex gap-1 text-[#E94E77]">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} fill="currentColor" className="stroke-[#2D1B4E] stroke-2" />)}
            </div>
            <p className="text-xs font-extrabold text-[#2D1B4E] leading-relaxed">
              &ldquo;menghadirkan kopi premium asli dari dataran tinggi Pegunungan Latimojong, Enrekang, Sulawesi Selatan, dengan cita rasa khas, kualitas terbaik, dan karakter lokal yang autentik.&rdquo;
            </p>
            <div className="flex items-center gap-2 pt-2 border-t-2 border-dashed border-gray-150">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-blue-300 border-2 border-[#2D1B4E] flex items-center justify-center text-[10px] font-bold text-[#2D1B4E]">R</div>
                <div className="w-7 h-7 rounded-full bg-pink-300 border-2 border-[#2D1B4E] flex items-center justify-center text-[10px] font-bold text-[#2D1B4E]">J</div>
                <div className="w-7 h-7 rounded-full bg-yellow-300 border-2 border-[#2D1B4E] flex items-center justify-center text-[10px] font-bold text-[#2D1B4E]">M</div>
              </div>
              <span className="text-[10px] text-zinc-500 font-extrabold">1,248 Verified Reviews</span>
            </div>
          </div>

          {/* Center Mockup Cans */}
          <div className="flex-1 flex justify-center items-center gap-2 sm:gap-3 md:gap-6 py-6 sm:py-8 relative w-full min-h-[280px] sm:min-h-[350px]">
            {(() => {
              const canStyles = [
                { 
                  size: "w-24 sm:w-32 md:w-44 h-44 sm:h-56 md:h-80", 
                  rounded: "rounded-[20px] sm:rounded-[28px] md:rounded-[40px]",
                  hoverAnim: { scale: 1.02, y: -10 },
                  fallbackImg: "./produk/mycoffeeza/beeenscoffeeza 2.jpg"
                },
                { 
                  size: "w-28 sm:w-36 md:w-52 h-52 sm:h-64 md:h-96", 
                  rounded: "rounded-[24px] sm:rounded-[32px] md:rounded-[48px]",
                  hoverAnim: { scale: 1.02, y: -15 },
                  fallbackImg: "./produk/mycoffeeza/mesin.jpg"
                },
                { 
                  size: "w-24 sm:w-32 md:w-44 h-44 sm:h-56 md:h-80", 
                  rounded: "rounded-[20px] sm:rounded-[28px] md:rounded-[40px]",
                  hoverAnim: { scale: 1.02, y: -10 },
                  fallbackImg: "./produk/mycoffeeza/beenscoffeeza.jpg"
                },
              ];

              return canStyles.map((can, idx) => {
                const product = bestSellers[idx];
                const promoImg = promoImages[idx];
                
                const displayImg = promoImg || (product && product.image ? product.image : null) || can.fallbackImg;

                return (
                  <motion.div 
                    key={idx}
                    whileHover={can.hoverAnim}
                    className={`${can.size} ${can.rounded} relative overflow-hidden cursor-pointer shadow-2xl z-10 transition-shadow duration-300 bg-zinc-100 group`}
                    onClick={() => window.open('https://instagram.com/mycoffeeza', '_blank')}
                  >
                    <img 
                      src={displayImg} 
                      onError={(e) => { e.currentTarget.src = can.fallbackImg; }}
                      alt={`Banner ${idx + 1}`} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
                  </motion.div>
                );
              });
            })()}
          </div>

          {/* Right Ingredients Tags Card */}
          <div className="w-full lg:w-[260px] bg-white p-5 sm:p-6 rounded-[24px] sm:rounded-[32px] border-4 border-[#2D1B4E] shadow-[8px_8px_0px_#2D1B4E] space-y-4 relative z-20 transform rotate-1 hover:rotate-0 transition-transform">
            <span className="text-[#E94E77] text-xs font-black uppercase tracking-wider flex items-center gap-1">★ The Drink of The Nation</span>
            <p className="text-[10px] font-extrabold text-zinc-500 leading-relaxed">Racikan 100% organik bersertifikasi, bebas pengawet buatan, dan rendah kalori.</p>
            <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-dashed border-gray-150">
              <span className="bg-[#FCE7F3] text-[#EC4899] text-[9px] font-black px-2.5 py-1 rounded-full uppercase border-2 border-[#2D1B4E]">Caffeine</span>
              <span className="bg-[#FEF3C7] text-[#D97706] text-[9px] font-black px-2.5 py-1 rounded-full uppercase border-2 border-[#2D1B4E]">Citric Acid</span>
              <span className="bg-[#E0F2FE] text-[#0369A1] text-[9px] font-black px-2.5 py-1 rounded-full uppercase border-2 border-[#2D1B4E]">Lemon</span>
              <span className="bg-[#ECEFfe] text-[#4F46E5] text-[9px] font-black px-2.5 py-1 rounded-full uppercase border-2 border-[#2D1B4E]">Cane Sugar</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. FLAVOR SENSATION GALLERY SECTION ================= */}
      <section id="flavors" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-24 border-t-4 border-[#2D1B4E] bg-white rounded-[24px] sm:rounded-[48px] border-4 shadow-[12px_12px_0px_#2D1B4E] mb-12 sm:mb-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-16">
          <div>
            <span className="bg-[#E0F2FE] text-[#0369A1] text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase border-2 border-[#2D1B4E]">Varian Rasa Premium</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#2D1B4E] mt-3">Taste the flavor sensation</h2>
            <p className="text-zinc-500 text-xs mt-1.5 font-bold">Nikmati segarnya buah tropis pilihan yang diracik khusus untuk memulihkan vitalitas tubuh Anda.</p>
          </div>
          <div className="bg-[#FEF3C7] text-[#D97706] text-[10px] font-black px-4 py-2.5 rounded-xl uppercase border-2 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] shrink-0">
            ☀️ Fresh from June to August ☀️
          </div>
        </div>

        {/* 3 Colored Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {bestSellers.length > 0 ? bestSellers.map((product, index) => {
            const colors = [
              { bg: "bg-[#3B82F6]", text: "text-[#3B82F6]", gradient: "from-[#93C5FD] to-[#3B82F6]" },
              { bg: "bg-[#FBBF24]", text: "text-[#D97706]", gradient: "from-[#FDE68A] to-[#F59E0B]" },
              { bg: "bg-[#EC4899]", text: "text-[#DB2777]", gradient: "from-[#FBCFE8] to-[#EC4899]" },
            ];
            const color = colors[index % colors.length];
            return (
              <Card key={product.id} className={`bg-gradient-to-b ${color.gradient} ${color.text === "text-[#D97706]" ? "text-[#2D1B4E]" : "text-white"} border-4 border-[#2D1B4E] shadow-[8px_8px_0px_#2D1B4E] rounded-[24px] sm:rounded-[36px] overflow-hidden group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#2D1B4E] transition-all`}>
                <CardBody className="p-0 flex flex-col justify-between items-center min-h-[320px] sm:min-h-[420px] relative">
                  {/* Full-bleed product image */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden rounded-[20px] sm:rounded-[32px]">
                    <img 
                      src={product.image_url || product.image || "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&q=80"} 
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&q=80"; }} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
                    <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[50%] bg-white/15 rotate-12 pointer-events-none" />
                  </div>
                  
                  {/* Top labels */}
                  <div className="w-full flex justify-between items-start p-4 sm:p-6 relative z-10">
                    <span className="bg-white text-[#2D1B4E] text-[9px] sm:text-[10px] font-black px-2.5 sm:px-3 py-1 rounded-full border-2 border-[#2D1B4E] uppercase shadow-[2px_2px_0px_#2D1B4E]">{product.badge || "Best Seller"}</span>
                    <span className={`bg-white ${color.text} text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 rounded-full flex items-center gap-0.5 border-2 border-[#2D1B4E] shadow-[2px_2px_0px_#2D1B4E]`}><Star size={10} fill="currentColor" /> 4.9</span>
                  </div>
                  
                  {/* Bottom content */}
                  <div className="text-center w-full space-y-3 sm:space-y-4 p-4 sm:p-6 relative z-10 mt-auto">
                    <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wide text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">{product.name}</h3>
                    {product.description && (
                      <p className="text-white/80 text-[10px] sm:text-xs font-semibold line-clamp-2 drop-shadow-sm">{product.description}</p>
                    )}
                    <Button 
                      onClick={() => window.open(`https://wa.me/6281356340877?text=Halo%20Admin%20Mycoffeeza%2C%20saya%20ingin%20memesan%20produk%20${encodeURIComponent(product.name)}`, '_blank')}
                      className={`w-full rounded-xl sm:rounded-2xl bg-white text-[#2D1B4E] font-black border-4 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all py-4 sm:py-6 text-xs sm:text-sm`}
                    >
                      Beli Rp {product.price.toLocaleString("id-ID")}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          }) : (
            <div className="col-span-1 sm:col-span-2 md:col-span-3 text-center py-10 font-bold text-zinc-500">Belum ada produk unggulan. Tambahkan di dashboard admin.</div>
          )}
        </div>
      </section>

      {/* ================= 5. LIFESTYLE GRID: "DRINK YOUR WAY TO HAPPINESS" ================= */}
      <section id="happiness" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-24 border-t-4 border-[#2D1B4E]/10 bg-white/25 rounded-[24px] sm:rounded-[48px] border-4 border-[#2D1B4E] shadow-[10px_10px_0px_#2D1B4E] mb-12 sm:mb-24 overflow-hidden relative">
        <div className="absolute -left-12 -top-12 w-32 h-32 rounded-full bg-yellow-300/10 blur-xl" />
        
        <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 relative z-10">
          <div className="flex-1 space-y-4 sm:space-y-6">
            <span className="text-3xl sm:text-4xl text-[#E94E77] animate-bounce block w-fit">🌸</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#2D1B4E] leading-none">
              Drink your <br />
              way to happiness.
            </h2>
            <p className="text-[#E94E77] text-xs sm:text-sm font-black uppercase tracking-widest flex items-center gap-1.5">
              <Flame size={16} /> Get energy on every single sip
            </p>
            <p className="text-zinc-500 text-xs sm:text-sm max-w-md font-bold leading-relaxed">
              A gentle wave of energy to activate your focus without any jittering. Kami memadukan ekstrak buah asli berkualitas tinggi dan formulasi taurine organik demi produktivitas Anda seharian penuh.
            </p>
            
            <div className="pt-4 flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#2D1B4E]" />
                <span className="text-xs font-black">100% Organik</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#EC4899] border-2 border-[#2D1B4E]" />
                <span className="text-xs font-black">Rendah Gula</span>
              </div>
            </div>
          </div>
          
          {/* Collage Grid */}
          <div className="flex-1 grid grid-cols-2 gap-3 sm:gap-4 w-full">
            <div className="bg-[#FEF3C7] rounded-[20px] sm:rounded-[32px] p-4 sm:p-6 border-4 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] flex flex-col justify-between aspect-square hover:-translate-y-1 transition-transform">
              <span className="text-3xl sm:text-4xl">🍊</span>
              <div>
                <h4 className="font-black text-xs sm:text-sm text-[#2D1B4E] uppercase">Citrus Cold Press</h4>
                <p className="text-[9px] sm:text-[10px] font-bold text-zinc-500 mt-1 leading-snug">Diperas dingin dengan teknologi mutakhir demi menjaga nutrisi dan enzim buah.</p>
              </div>
            </div>
            <div className="bg-[#FCE7F3] rounded-[20px] sm:rounded-[32px] p-4 sm:p-6 border-4 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] flex flex-col justify-between aspect-square hover:-translate-y-1 transition-transform">
              <span className="text-3xl sm:text-4xl">⚡</span>
              <div>
                <h4 className="font-black text-xs sm:text-sm text-[#EC4899] uppercase">Natural Taurine</h4>
                <p className="text-[9px] sm:text-[10px] font-bold text-[#2D1B4E]/60 mt-1 leading-snug">Menambah stamina fisik secara bertahap tanpa efek kantuk susulan.</p>
              </div>
            </div>
            <div className="bg-[#E0F2FE] rounded-[20px] sm:rounded-[32px] p-4 sm:p-6 border-4 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] flex flex-col justify-between col-span-2 min-h-[120px] sm:min-h-[160px] hover:-translate-y-1 transition-transform">
              <span className="text-3xl sm:text-4xl">✨</span>
              <div className="space-y-1">
                <h4 className="font-black text-xs sm:text-sm text-[#2D1B4E] uppercase">A Special Blend of Vitamins & Amino Acids</h4>
                <p className="text-[10px] sm:text-xs font-bold text-zinc-500 leading-normal">Kombinasi Vitamin B Kompleks & L-Theanine meningkatkan ketajaman mental, koordinasi, dan memulihkan fokus otak Anda.</p>
                <a href="#story" className="text-[10px] text-zinc-400 font-extrabold uppercase mt-2.5 block underline underline-offset-2 hover:text-[#E94E77]">Our Story →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. TURNING FANTASIES INTO REALITY BANNER ================= */}
      <section id="story" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 mb-12 sm:mb-24">
        <div className="bg-[#FCE7F3] rounded-[24px] sm:rounded-[48px] border-4 border-[#2D1B4E] shadow-[12px_12px_0px_#2D1B4E] p-6 sm:p-8 md:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-4 sm:space-y-6 max-w-xl z-10">
            <span className="bg-[#2D1B4E] text-[#FCE7F3] text-[10px] font-black px-4 py-1.5 rounded-full border-2 border-white uppercase">⚡ Boost your Energy</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#2D1B4E] leading-none">Turning fantasies <br />into reality.</h2>
            <p className="text-zinc-600 text-xs sm:text-sm font-bold leading-relaxed">
              Kekuatan penuh kaleng Mana bersumber dari konsentrat bahan alami organik dan rasa buah murni pilihan. Bebas dari pemanis buatan, pemanis jagung tinggi fruktosa, dan bahan kimia berbahaya lainnya.
            </p>
            <Button 
              onClick={() => window.open('https://instagram.com/mycoffeeza', '_blank')}
              className="rounded-2xl bg-[#2D1B4E] text-white border-4 border-[#2D1B4E] font-black px-6 sm:px-8 py-5 sm:py-6 shadow-[4px_4px_0px_#E94E77] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-xs"
            >
              Drink it up ➔
            </Button>
          </div>

          {/* Floating Cans */}
          <div className="flex gap-4 relative shrink-0">
            <motion.div 
              animate={{ y: [0, -12, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
              className="w-16 sm:w-20 h-28 sm:h-36 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#FCE7F3] to-[#EC4899] border-4 border-[#2D1B4E] rotate-12 shadow-lg flex flex-col justify-between p-2 sm:p-3 relative overflow-hidden"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full border-2 border-[#2D1B4E] text-[6px] font-bold text-center flex items-center justify-center">T</div>
            </motion.div>
            
            <motion.div 
              animate={{ y: [0, 12, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.6 }} 
              className="w-16 sm:w-20 h-28 sm:h-36 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#93C5FD] to-[#3B82F6] border-4 border-[#2D1B4E] -rotate-12 shadow-lg flex flex-col justify-between p-2 sm:p-3 relative overflow-hidden"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full border-2 border-[#2D1B4E] text-[6px] font-bold text-center flex items-center justify-center">O</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= 7. FOUNDER'S TESTIMONIAL SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 mb-12 sm:mb-24 border-t-4 border-[#2D1B4E]/10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12 pt-8 sm:pt-12">
          <div className="flex-1 space-y-4 sm:space-y-6">
            <span className="text-5xl sm:text-7xl text-[#E94E77] font-serif block leading-none">&ldquo;</span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#2D1B4E] leading-snug">
              The benefits of a healthy drink are more important than ever in today&apos;s world, so we created one.
            </h3>
            
            <div className="flex items-center gap-4 pt-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pink-300 border-4 border-[#2D1B4E] flex items-center justify-center font-bold text-[#2D1B4E] text-xs sm:text-sm">RJ</div>
              <div>
                <p className="font-black text-[#2D1B4E] text-sm sm:text-base">Rylie Jason</p>
                <p className="text-zinc-400 text-[10px] sm:text-xs font-bold uppercase">Founder of Mana Mate Ltd.</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md bg-white border-4 border-[#2D1B4E] shadow-[8px_8px_0px_#2D1B4E] rounded-[24px] sm:rounded-[36px] p-6 sm:p-8 space-y-4 transform hover:scale-[1.01] transition-transform">
            <span className="bg-[#FEF3C7] text-[#D97706] text-[10px] font-black px-3.5 py-1 rounded-full uppercase border-2 border-[#2D1B4E] w-fit block">Our Commitment</span>
            <h4 className="text-lg sm:text-xl font-black">100% Organik & Rendah Kalori</h4>
            <p className="text-zinc-500 text-xs font-bold leading-relaxed">
              Setiap kaleng didedikasikan untuk peningkatan hidrasi, stamina fisik, dan performa mental Anda. Kami menyaring dan mengekstrak bahan aktif alami tanpa pewarna sintetis atau zat aditif terlarang. Menjadikan hari-hari Anda penuh vitalitas.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 8. PRODUK BEANS SECTION (REDESIGNED) ================= */}
      <section id="social" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 mb-12 sm:mb-24 border-t-4 border-[#2D1B4E]/10">
        <div className="text-center mb-8 sm:mb-16 pt-8 sm:pt-12">
          <span className="bg-[#E0F2FE] text-[#0369A1] text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase border-2 border-[#2D1B4E]">Produk Kami</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-3">MY PRODUK BEANS</h2>
          <p className="text-zinc-400 text-xs mt-1.5 font-bold max-w-lg mx-auto">Kopi pilihan dari dataran tinggi Sulawesi Selatan, diproses dengan penuh kecintaan untuk menghadirkan cita rasa terbaik.</p>
        </div>

        {/* Product Cards Grid — Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {displayProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div 
                className="rounded-[20px] sm:rounded-[24px] border-4 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] hover:shadow-[6px_6px_0px_#E94E77] hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden bg-white"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: product.color }}>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    onError={(e) => { e.currentTarget.src = "./produk/mycoffeeza/1.png"; }}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  
                  {/* Product Number Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-white/90 backdrop-blur-sm text-[#2D1B4E] text-[10px] font-mono font-black px-2.5 py-1 rounded-full border-2 border-[#2D1B4E] shadow-sm">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Heart Icon */}
                  <div className="absolute top-3 right-3 z-10">
                    <Heart size={16} className="text-[#E94E77] fill-current drop-shadow-md" />
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3 sm:p-4 space-y-2">
                  <h3 className="font-black text-[#2D1B4E] text-sm sm:text-base leading-tight">{product.name}</h3>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#E94E77] text-white text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full">
                      {product.price}
                    </span>
                  </div>
                  
                  <p className="text-zinc-500 text-[10px] sm:text-[11px] font-semibold leading-snug line-clamp-3">
                    {product.description}
                  </p>
                  
                  <button
                    onClick={() => window.open(`https://wa.me/6281356340877?text=Halo%20Admin%20Mycoffeeza%2C%20saya%20ingin%20memesan%20produk%20${encodeURIComponent(product.name)}`, '_blank')}
                    className="w-full mt-2 bg-[#2D1B4E] text-white text-[10px] sm:text-xs font-black py-2.5 rounded-xl border-2 border-[#2D1B4E] hover:bg-[#E94E77] hover:border-[#E94E77] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag size={12} />
                    Pesan Sekarang
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= 9. BOTTOM MARQUEE TICKER ================= */}
      <div className="bg-[#2D1B4E] text-[#FCFAF6] py-2 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest overflow-hidden whitespace-nowrap border-t-4 border-[#2D1B4E] select-none relative z-30">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          <span>⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • </span>
          <span>⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • </span>
        </div>
      </div>

      {/* ================= 10. LARGE PLAYFUL FOOTER ================= */}
      <footer id="footer" className="bg-[#FCFAF6] border-t-4 border-[#2D1B4E] py-12 sm:py-20 px-4 sm:px-6 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row justify-between items-start gap-8 sm:gap-12 xl:gap-8">
          
          {/* Left links columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 w-full xl:w-auto flex-shrink-0">
            <div className="space-y-4">
              <h5 className="font-black text-sm uppercase text-[#2D1B4E]/50 tracking-wider">Home</h5>
              <ul className="space-y-2 text-xs font-black text-[#2D1B4E] uppercase">
                <li><a href="#flavors" className="hover:text-[#E94E77]">Our Story</a></li>
                <li><a href="#flavors" className="hover:text-[#E94E77]">Flavors</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-black text-sm uppercase text-[#2D1B4E]/50 tracking-wider">About Us</h5>
              <ul className="space-y-2 text-xs font-black text-[#2D1B4E] uppercase">
                <li><a href="#story" className="hover:text-[#E94E77]">Review</a></li>
                <li><a href="#story" className="hover:text-[#E94E77]">Community</a></li>
                <li><a href="https://www.instagram.com/mycoffeeza?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="hover:text-[#E94E77]">Instagram</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-black text-sm uppercase text-[#2D1B4E]/50 tracking-wider">Consumption</h5>
              <p className="text-2xl sm:text-3xl font-black text-[#E94E77] drop-shadow-[2px_2px_0px_#2D1B4E]">1.6M L</p>
              <p className="text-[10px] text-zinc-400 font-extrabold uppercase">Volume Terjual Musim Ini</p>
            </div>
            <div className="space-y-4">
              <h5 className="font-black text-sm uppercase text-[#2D1B4E]/50 tracking-wider">Shop</h5>
              <ul className="space-y-2 text-xs font-black text-[#2D1B4E] uppercase">
                <li><a href="#flavors" className="hover:text-[#E94E77]">Blackberry</a></li>
                <li><a href="#flavors" className="hover:text-[#E94E77]">Grapefruit</a></li>
                <li><a href="#flavors" className="hover:text-[#E94E77]">Tropical</a></li>
              </ul>
            </div>
          </div>

          {/* Right Giant Bubble Logo Card */}
          <div className="space-y-4 text-left xl:text-right w-full xl:w-auto xl:flex-1 overflow-hidden mt-4 sm:mt-8 xl:mt-0">
            <span className="text-[12vw] sm:text-[9vw] xl:text-[85px] leading-none font-black tracking-tight text-[#E94E77] block uppercase drop-shadow-[4px_4px_0px_#2D1B4E] transform -rotate-1 select-none overflow-visible whitespace-normal break-words">
              My Coffeeza
            </span>
            <p className="text-[#2D1B4E] text-xs font-extrabold max-w-[280px] xl:ml-auto pt-2">
              We carefully crafted each can with all the benefits for the right time!
            </p>
          </div>
        </div>

        {/* Absolute Bottom Social Portals */}
        <div className="max-w-7xl mx-auto border-t-4 border-[#2D1B4E] mt-10 sm:mt-16 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 text-xs font-black text-[#2D1B4E]/70">
          <div className="flex gap-6 flex-wrap">
            {/* Removed Links */}
          </div>
          <div className="flex items-center gap-4 text-zinc-400 font-bold">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 hover:text-[#E94E77] cursor-pointer transition-colors">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <Globe size={16} className="hover:text-[#E94E77] cursor-pointer" />
            <span>© {new Date().getFullYear()} Mana. All Rights Reserved.</span>
          </div>
        </div>
      </footer>

      {/* ================= Bagian Live Chat ================= */}
      <Modal 
        isOpen={isChatOpen} 
        onOpenChange={onChatOpenChange}
        scrollBehavior="inside"
        backdrop="blur"
        classNames={{
          base: "bg-white border-4 border-[#2D1B4E] rounded-[32px] shadow-[8px_8px_0px_#2D1B4E] overflow-hidden mx-4",
          header: "border-b-4 border-[#2D1B4E] bg-[#FCE7F3]",
          body: "p-4 sm:p-6",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-[#2D1B4E]">
                <h3 className="font-black text-lg sm:text-xl flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E94E77] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E94E77]"></span>
                  </span>
                  Live Chat Penilaian
                </h3>
                <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest">Feedback Pelanggan Real-time</p>
              </ModalHeader>
              <ModalBody className={`space-y-4 max-h-[400px] overflow-y-auto p-4 sm:p-6 ${reviews.length === 0 ? "flex items-center justify-center min-h-[200px]" : ""}`}>
                {reviews.length === 0 ? (
                  <div className="text-center opacity-50 flex flex-col items-center gap-2">
                    <MessageCircle size={32} />
                    <p className="font-bold text-sm">Belum ada penilaian.<br/>Jadilah yang pertama!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={review.id} 
                    className="bg-white border-2 border-[#2D1B4E] rounded-2xl p-4 shadow-[4px_4px_0px_#2D1B4E]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-black text-[#2D1B4E] text-sm">{review.name}</p>
                        <p className="text-[10px] font-bold text-[#E94E77] uppercase">{review.branch}</p>
                      </div>
                      <span className="text-[9px] font-black text-zinc-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">{review.time}</span>
                    </div>
                    <p className="text-xs font-bold text-zinc-600 leading-relaxed">
                      &ldquo;{review.message}&rdquo;
                    </p>
                  </motion.div>
                )))}
              </ModalBody>
              <ModalFooter className="flex-col gap-3 border-t-4 border-[#2D1B4E] bg-white rounded-b-[28px] p-4 sm:p-6 relative z-10">
                <div className="flex gap-2 w-full">
                  <Input 
                    variant="bordered"
                    size="sm"
                    placeholder="Nama Anda" 
                    value={newReview.name}
                    onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                    classNames={{ 
                      inputWrapper: "border-2 border-[#2D1B4E] bg-white rounded-xl hover:bg-gray-50 group-data-[focus=true]:bg-white",
                      input: "font-bold text-[#2D1B4E]"
                    }}
                  />
                  <Input 
                    variant="bordered"
                    size="sm"
                    placeholder="Cabang (Cth: BTP)" 
                    value={newReview.branch}
                    onChange={(e) => setNewReview({...newReview, branch: e.target.value})}
                    classNames={{ 
                      inputWrapper: "border-2 border-[#2D1B4E] bg-white rounded-xl hover:bg-gray-50 group-data-[focus=true]:bg-white",
                      input: "font-bold text-[#2D1B4E]"
                    }}
                  />
                </div>
                <div className="flex gap-2 w-full items-end">
                  <Textarea 
                    variant="bordered"
                    minRows={1}
                    size="sm"
                    placeholder="Tulis ulasan Anda tentang pelayanan kami..." 
                    value={newReview.message}
                    onChange={(e) => setNewReview({...newReview, message: e.target.value})}
                    classNames={{ 
                      inputWrapper: "border-2 border-[#2D1B4E] bg-white rounded-xl hover:bg-gray-50 group-data-[focus=true]:bg-white",
                      input: "font-bold text-[#2D1B4E]"
                    }}
                  />
                  <Button 
                    onPress={handleAddReview}
                    isIconOnly
                    className="bg-[#E94E77] text-white border-2 border-[#2D1B4E] shadow-[2px_2px_0px_#2D1B4E] rounded-xl hover:translate-y-0.5 hover:shadow-none transition-all h-[42px] w-[42px] min-w-[42px]"
                  >
                    <ArrowUpRight size={18} strokeWidth={3} />
                  </Button>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ================= FLOATING WHATSAPP BUTTON ================= */}
      <a
        href="https://wa.me/6281356340877?text=Halo%20Mycoffeeza%2C%20saya%20ingin%20bertanya%20tentang%20menu%20dan%20layanan%20Anda!"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 group"
        aria-label="Chat via WhatsApp"
      >
        {/* Pulse ring animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none" />
        
        {/* Button body */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-[#25D366] rounded-full border-4 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] flex items-center justify-center hover:scale-110 hover:shadow-[6px_6px_0px_#2D1B4E] active:scale-95 active:shadow-[2px_2px_0px_#2D1B4E] transition-all duration-200 cursor-pointer">
          {/* WhatsApp SVG Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            fill="white"
            className="w-7 h-7 sm:w-8 sm:h-8"
          >
            <path d="M16.004 2.667A13.2 13.2 0 0 0 2.88 19.307L1.333 30.667l11.627-1.52A13.2 13.2 0 1 0 16.004 2.667zm0 24.266a10.93 10.93 0 0 1-5.893-1.72l-.413-.253-4.32.56.573-4.187-.267-.427A10.933 10.933 0 1 1 16.004 26.933zm6-8.16c-.333-.167-1.96-.967-2.267-1.08-.307-.107-.527-.167-.747.167s-.86 1.08-1.053 1.3-.387.253-.72.087-1.4-.517-2.667-1.647c-.987-.88-1.653-1.967-1.847-2.3s-.02-.513.147-.68c.153-.147.333-.387.5-.58s.22-.333.333-.553.053-.42-.027-.587-.747-1.8-1.02-2.467c-.267-.64-.54-.553-.747-.567h-.64a1.227 1.227 0 0 0-.887.413 3.727 3.727 0 0 0-1.16 2.773c0 1.633 1.193 3.213 1.36 3.433s2.347 3.58 5.687 5.02c.793.347 1.413.553 1.9.707a4.573 4.573 0 0 0 2.1.133c.64-.093 1.96-.8 2.24-1.573s.28-1.44.193-1.573-.307-.227-.64-.393z" />
          </svg>
        </div>

        {/* Tooltip on hover */}
        <div className="absolute bottom-16 sm:bottom-20 right-0 bg-white text-[#2D1B4E] text-xs font-black px-4 py-2 rounded-xl border-2 border-[#2D1B4E] shadow-[3px_3px_0px_#2D1B4E] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Chat via WhatsApp 💬
        </div>
      </a>

    </div>
  );
};
