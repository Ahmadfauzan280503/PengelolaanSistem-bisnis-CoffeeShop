"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowUpRight, ShoppingBag, Heart, User, Check, Sparkles, Flame, Globe, Coffee } from "lucide-react";
import { Button, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Input, Textarea } from "@nextui-org/react";
import { MessageCircle } from "lucide-react";

export const LandingPage = () => {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const {isOpen: isChatOpen, onOpen: onChatOpen, onOpenChange: onChatOpenChange} = useDisclosure();
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);

  const [newReview, setNewReview] = useState({ name: "", branch: "", message: "" });
  
  // Promo image state
  const [promoImages, setPromoImages] = useState<string[]>(["", "", ""]);

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
    const stored = localStorage.getItem("mana_products");
    if (stored) {
      const products = JSON.parse(stored);
      setBestSellers(products.filter((p: any) => p.is_best_seller).slice(0, 3));
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

  return (
    <div className="min-h-screen bg-[#FCFAF6] text-[#2D1B4E] overflow-x-hidden font-sans relative">
      
      {/* ================= 1. TOP MARQUEE RUNNING TICKER ================= */}
      <div className="bg-[#2D1B4E] text-[#FCFAF6] py-2.5 text-xs font-black uppercase tracking-widest overflow-hidden whitespace-nowrap border-b-4 border-[#2D1B4E] select-none relative z-30">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          <span>⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • </span>
          <span>⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • </span>
        </div>
      </div>

      {/* ================= 2. NAVIGATION BAR ================= */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-25">
        {/* Playful Pink Bubble Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <span className="text-4xl font-black tracking-tighter text-[#E94E77] drop-shadow-[3px_3px_0px_#2D1B4E] font-mono uppercase border-4 border-[#2D1B4E] bg-white px-4 py-1.5 rounded-2xl transform -rotate-2 hover:rotate-0 transition-transform">
            Mycoffeeza
          </span>
        </div>
        
        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-10 text-xs font-black uppercase tracking-wider text-[#2D1B4E]/90 bg-white border-4 border-[#2D1B4E] px-8 py-3 rounded-full shadow-[4px_4px_0px_#2D1B4E]">
          <a href="#flavors" className="hover:text-[#E94E77] transition-colors">Menu Bestseller</a>
          <a href="#happiness" className="hover:text-[#E94E77] transition-colors">Shop</a>
          <a href="#story" className="hover:text-[#E94E77] transition-colors">Story</a>
          <a href="#social" className="hover:text-[#E94E77] transition-colors">Blog</a>
          <a href="#footer" className="hover:text-[#E94E77] transition-colors">Community</a>
        </div>

        {/* Action Buttons - Replaced with Live Chat Feedback */}
        <div className="flex items-center gap-3">
          <Button
            onPress={onChatOpen}
            className="rounded-2xl bg-[#E94E77] text-white border-4 border-[#2D1B4E] font-black px-6 py-5 shadow-[4px_4px_0px_#2D1B4E] text-xs hover:scale-105 hover:bg-[#E94E77]/90 active:scale-95 transition-transform flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Live Chat Penilaian
          </Button>
        </div>
      </nav>

      {/* ================= 3. HERO BANNER SECTION ================= */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Main Playful Neo-Brutalist Title */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[100px] font-black tracking-tight text-[#2D1B4E] leading-[0.9] font-sans drop-shadow-[4px_4px_0px_rgba(45,27,78,0.08)]">
            WELCOME TO <br />
            MYCOFFEEZA
          </h1>
          
          {/* Circular Button 'Drink it up' */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <button 
              onClick={() => router.push("/order/sultan-alauddin?mode=dinein&tableNumber=Meja%2064")}
              className="bg-[#2D1B4E] hover:bg-[#E94E77] text-white rounded-full px-8 py-4 font-black text-sm flex items-center gap-3 shadow-[6px_6px_0px_#E94E77] border-4 border-[#2D1B4E] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              Drink it up <span className="bg-white text-[#2D1B4E] w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">➔</span>
            </button>
          </div>
          
          <p className="text-[#2D1B4E]/60 text-xs font-extrabold tracking-widest uppercase pt-2 flex items-center justify-center gap-2">
            ⭐ Thirst <span className="underline decoration-[#E94E77] decoration-4 underline-offset-4">quenching</span> drink made just for you. ⭐
          </p>
        </div>

        {/* 3D Cans Showcase & Grid Cards */}
        <div className="mt-16 flex flex-col lg:flex-row items-center justify-between gap-8 relative">
          
          {/* Left Review Card */}
          <div className="w-full lg:w-[260px] space-y-4 bg-white p-6 rounded-[32px] border-4 border-[#2D1B4E] shadow-[8px_8px_0px_#2D1B4E] relative z-20 transform -rotate-1 hover:rotate-0 transition-transform">
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

          {/* Center Mockup Cans Vector-styled — Shows product images from admin dashboard */}
          <div className="flex-1 flex justify-center items-center gap-3 sm:gap-6 py-8 relative w-full min-h-[350px]">
            {(() => {
              const canStyles = [
                { 
                  size: "w-32 sm:w-44 h-56 sm:h-80", 
                  rounded: "rounded-[28px] sm:rounded-[40px]",
                  hoverAnim: { scale: 1.02, y: -10 },
                  fallbackImg: "./produk/mycoffeeza/beeenscoffeeza 2.jpg"
                },
                { 
                  size: "w-36 sm:w-52 h-64 sm:h-96", 
                  rounded: "rounded-[32px] sm:rounded-[48px]",
                  hoverAnim: { scale: 1.02, y: -15 },
                  fallbackImg: "./produk/mycoffeeza/mesin.jpg"
                },
                { 
                  size: "w-32 sm:w-44 h-56 sm:h-80", 
                  rounded: "rounded-[28px] sm:rounded-[40px]",
                  hoverAnim: { scale: 1.02, y: -10 },
                  fallbackImg: "./produk/mycoffeeza/beenscoffeeza.jpg"
                },
              ];

              return canStyles.map((can, idx) => {
                const product = bestSellers[idx];
                const promoImg = promoImages[idx];
                
                // Determine image: Promo > Product > Fallback
                const displayImg = promoImg || (product && product.image ? product.image : null) || can.fallbackImg;

                return (
                  <motion.div 
                    key={idx}
                    whileHover={can.hoverAnim}
                    className={`${can.size} ${can.rounded} relative overflow-hidden cursor-pointer shadow-2xl z-10 transition-shadow duration-300 bg-zinc-100 group`}
                    onClick={() => router.push("/order/sultan-alauddin?mode=dinein&tableNumber=Meja%2064")}
                  >
                    <img 
                      src={displayImg} 
                      onError={(e) => { e.currentTarget.src = can.fallbackImg; }}
                      alt={`Banner ${idx + 1}`} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    
                    {/* Optional overlay for subtle depth */}
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
                  </motion.div>
                );
              });
            })()}
          </div>

          {/* Right Ingredients Tags Card */}
          <div className="w-full lg:w-[260px] bg-white p-6 rounded-[32px] border-4 border-[#2D1B4E] shadow-[8px_8px_0px_#2D1B4E] space-y-4 relative z-20 transform rotate-1 hover:rotate-0 transition-transform">
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
      <section id="flavors" className="max-w-7xl mx-auto px-6 py-24 border-t-4 border-[#2D1B4E] bg-white rounded-[48px] border-4 shadow-[12px_12px_0px_#2D1B4E] mb-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-16">
          <div>
            <span className="bg-[#E0F2FE] text-[#0369A1] text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase border-2 border-[#2D1B4E]">Varian Rasa Premium</span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-[#2D1B4E] mt-3">Taste the flavor sensation</h2>
            <p className="text-zinc-500 text-xs mt-1.5 font-bold">Nikmati segarnya buah tropis pilihan yang diracik khusus untuk memulihkan vitalitas tubuh Anda.</p>
          </div>
          <div className="bg-[#FEF3C7] text-[#D97706] text-[10px] font-black px-4 py-2.5 rounded-xl uppercase border-2 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] shrink-0">
            ☀️ Fresh from June to August ☀️
          </div>
        </div>

        {/* 3 Colored Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {bestSellers.length > 0 ? bestSellers.map((product, index) => {
            const colors = [
              { bg: "bg-[#3B82F6]", text: "text-[#3B82F6]", gradient: "from-[#93C5FD] to-[#3B82F6]" },
              { bg: "bg-[#FBBF24]", text: "text-[#D97706]", gradient: "from-[#FDE68A] to-[#F59E0B]" },
              { bg: "bg-[#EC4899]", text: "text-[#DB2777]", gradient: "from-[#FBCFE8] to-[#EC4899]" },
            ];
            const color = colors[index % colors.length];
            return (
              <Card key={product.id} className={`bg-gradient-to-b ${color.gradient} ${color.text === "text-[#D97706]" ? "text-[#2D1B4E]" : "text-white"} border-4 border-[#2D1B4E] shadow-[8px_8px_0px_#2D1B4E] rounded-[36px] overflow-hidden group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_#2D1B4E] transition-all`}>
                <CardBody className="p-0 flex flex-col justify-between items-center min-h-[420px] relative">
                  {/* Full-bleed product image */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden rounded-[32px]">
                    <img 
                      src={product.image || "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&q=80"} 
                      onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&q=80"; }} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
                    {/* Glass shine effect */}
                    <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[50%] bg-white/15 rotate-12 pointer-events-none" />
                  </div>
                  
                  {/* Top labels */}
                  <div className="w-full flex justify-between items-start p-6 relative z-10">
                    <span className="bg-white text-[#2D1B4E] text-[10px] font-black px-3 py-1 rounded-full border-2 border-[#2D1B4E] uppercase shadow-[2px_2px_0px_#2D1B4E]">{product.badge || "Best Seller"}</span>
                    <span className={`bg-white ${color.text} text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-0.5 border-2 border-[#2D1B4E] shadow-[2px_2px_0px_#2D1B4E]`}><Star size={10} fill="currentColor" /> 4.9</span>
                  </div>
                  
                  {/* Bottom content */}
                  <div className="text-center w-full space-y-4 p-6 relative z-10 mt-auto">
                    <h3 className="text-2xl font-black uppercase tracking-wide text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">{product.name}</h3>
                    <Button 
                      onClick={() => router.push("/order/sultan-alauddin?mode=dinein&tableNumber=Meja%2064")}
                      className={`w-full rounded-2xl bg-white text-[#2D1B4E] font-black border-4 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all py-6`}
                    >
                      Beli Rp {product.price.toLocaleString("id-ID")}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          }) : (
            <div className="col-span-3 text-center py-10 font-bold text-zinc-500">Belum ada produk unggulan. Tambahkan di dashboard admin.</div>
          )}
        </div>
      </section>

      {/* ================= 5. LIFESTYLE GRID: "DRINK YOUR WAY TO HAPPINESS" ================= */}
      <section id="happiness" className="max-w-7xl mx-auto px-6 py-24 border-t-4 border-[#2D1B4E]/10 bg-white/25 rounded-[48px] border-4 border-[#2D1B4E] shadow-[10px_10px_0px_#2D1B4E] mb-24 overflow-hidden relative">
        <div className="absolute -left-12 -top-12 w-32 h-32 rounded-full bg-yellow-300/10 blur-xl" />
        
        <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 space-y-6">
            <span className="text-4xl text-[#E94E77] animate-bounce block w-fit">🌸</span>
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-[#2D1B4E] leading-none">
              Drink your <br />
              way to happiness.
            </h2>
            <p className="text-[#E94E77] text-sm font-black uppercase tracking-widest flex items-center gap-1.5">
              <Flame size={16} /> Get energy on every single sip
            </p>
            <p className="text-zinc-500 text-sm max-w-md font-bold leading-relaxed">
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
          
          {/* Collage Images representation in beautiful grid layout using modern colored containers */}
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div className="bg-[#FEF3C7] rounded-[32px] p-6 border-4 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] flex flex-col justify-between aspect-square hover:-translate-y-1 transition-transform">
              <span className="text-4xl">🍊</span>
              <div>
                <h4 className="font-black text-sm text-[#2D1B4E] uppercase">Citrus Cold Press</h4>
                <p className="text-[10px] font-bold text-zinc-500 mt-1 leading-snug">Diperas dingin dengan teknologi mutakhir demi menjaga nutrisi dan enzim buah.</p>
              </div>
            </div>
            <div className="bg-[#FCE7F3] rounded-[32px] p-6 border-4 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] flex flex-col justify-between aspect-square hover:-translate-y-1 transition-transform">
              <span className="text-4xl">⚡</span>
              <div>
                <h4 className="font-black text-sm text-[#EC4899] uppercase">Natural Taurine</h4>
                <p className="text-[10px] font-bold text-[#2D1B4E]/60 mt-1 leading-snug">Menambah stamina fisik secara bertahap tanpa efek kantuk susulan.</p>
              </div>
            </div>
            <div className="bg-[#E0F2FE] rounded-[32px] p-6 border-4 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] flex flex-col justify-between col-span-2 min-h-[160px] hover:-translate-y-1 transition-transform">
              <span className="text-4xl">✨</span>
              <div className="space-y-1">
                <h4 className="font-black text-sm text-[#2D1B4E] uppercase">A Special Blend of Vitamins & Amino Acids</h4>
                <p className="text-xs font-bold text-zinc-500 leading-normal">Kombinasi Vitamin B Kompleks & L-Theanine meningkatkan ketajaman mental, koordinasi, dan memulihkan fokus otak Anda.</p>
                <a href="#story" className="text-[10px] text-zinc-400 font-extrabold uppercase mt-2.5 block underline underline-offset-2 hover:text-[#E94E77]">Our Story →</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. TURNING FANTASIES INTO REALITY BANNER ================= */}
      <section id="story" className="max-w-7xl mx-auto px-6 py-12 mb-24">
        <div className="bg-[#FCE7F3] rounded-[48px] border-4 border-[#2D1B4E] shadow-[12px_12px_0px_#2D1B4E] p-8 sm:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-6 max-w-xl z-10">
            <span className="bg-[#2D1B4E] text-[#FCE7F3] text-[10px] font-black px-4 py-1.5 rounded-full border-2 border-white uppercase">⚡ Boost your Energy</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#2D1B4E] leading-none">Turning fantasies <br />into reality.</h2>
            <p className="text-zinc-600 text-sm font-bold leading-relaxed">
              Kekuatan penuh kaleng Mana bersumber dari konsentrat bahan alami organik dan rasa buah murni pilihan. Bebas dari pemanis buatan, pemanis jagung tinggi fruktosa, dan bahan kimia berbahaya lainnya.
            </p>
            <Button 
              onClick={() => router.push("/order/sultan-alauddin?mode=dinein&tableNumber=Meja%2064")}
              className="rounded-2xl bg-[#2D1B4E] text-white border-4 border-[#2D1B4E] font-black px-8 py-6 shadow-[4px_4px_0px_#E94E77] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-xs"
            >
              Drink it up ➔
            </Button>
          </div>

          {/* Floating Cans Illustration */}
          <div className="flex gap-4 relative shrink-0">
            <motion.div 
              animate={{ y: [0, -12, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
              className="w-20 h-36 rounded-3xl bg-gradient-to-b from-[#FCE7F3] to-[#EC4899] border-4 border-[#2D1B4E] rotate-12 shadow-lg flex flex-col justify-between p-3 relative overflow-hidden"
            >
              <div className="w-5 h-5 bg-white rounded-full border-2 border-[#2D1B4E] text-[6px] font-bold text-center flex items-center justify-center">T</div>
            </motion.div>
            
            <motion.div 
              animate={{ y: [0, 12, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.6 }} 
              className="w-20 h-36 rounded-3xl bg-gradient-to-b from-[#93C5FD] to-[#3B82F6] border-4 border-[#2D1B4E] -rotate-12 shadow-lg flex flex-col justify-between p-3 relative overflow-hidden"
            >
              <div className="w-5 h-5 bg-white rounded-full border-2 border-[#2D1B4E] text-[6px] font-bold text-center flex items-center justify-center">O</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= 7. FOUNDER'S TESTIMONIAL SECTION ================= */}
      <section className="max-w-7xl mx-auto px-6 py-12 mb-24 border-t-4 border-[#2D1B4E]/10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 pt-12">
          <div className="flex-1 space-y-6">
            <span className="text-7xl text-[#E94E77] font-serif block leading-none">“</span>
            <h3 className="text-3xl sm:text-4xl font-black text-[#2D1B4E] leading-snug">
              The benefits of a healthy drink are more important than ever in today&apos;s world, so we created one.
            </h3>
            
            <div className="flex items-center gap-4 pt-4">
              <div className="w-12 h-12 rounded-full bg-pink-300 border-4 border-[#2D1B4E] flex items-center justify-center font-bold text-[#2D1B4E] text-sm">RJ</div>
              <div>
                <p className="font-black text-[#2D1B4E] text-base">Rylie Jason</p>
                <p className="text-zinc-400 text-xs font-bold uppercase">Founder of Mana Mate Ltd.</p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-md bg-white border-4 border-[#2D1B4E] shadow-[8px_8px_0px_#2D1B4E] rounded-[36px] p-8 space-y-4 transform hover:scale-[1.01] transition-transform">
            <span className="bg-[#FEF3C7] text-[#D97706] text-[10px] font-black px-3.5 py-1 rounded-full uppercase border-2 border-[#2D1B4E] w-fit block">Our Commitment</span>
            <h4 className="text-xl font-black">100% Organik & Rendah Kalori</h4>
            <p className="text-zinc-500 text-xs font-bold leading-relaxed">
              Setiap kaleng didedikasikan untuk peningkatan hidrasi, stamina fisik, dan performa mental Anda. Kami menyaring dan mengekstrak bahan aktif alami tanpa pewarna sintetis atau zat aditif terlarang. Menjadikan hari-hari Anda penuh vitalitas.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 8. INSTAGRAM GRID: @MANAMATE ================= */}
      <section id="social" className="max-w-7xl mx-auto px-6 py-12 mb-24 border-t-4 border-[#2D1B4E]/10">
        <div className="text-center mb-16 pt-12">
          <span className="bg-[#E0F2FE] text-[#0369A1] text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase border-2 border-[#2D1B4E]">On Social</span>
          <h2 className="text-4xl font-black mt-3">MY Produk Beans</h2>
          <p className="text-zinc-400 text-xs mt-1.5 font-bold">Kirim foto Anda dengan kaleng Mana dan gunakan tagar #ManaMate untuk mendapatkan hadiah bulanan.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-[#FCE7F3] rounded-[24px] aspect-square border-4 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group">
            <img src="./produk/mycoffeeza/1.png" alt="Instagram 1" className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            <div className="relative z-10 p-4 flex flex-col justify-between h-full">
              <span className="text-white drop-shadow-md text-xs font-mono font-black">#01</span>
              <Heart size={18} className="text-[#E94E77] fill-current drop-shadow-md" />
            </div>
          </div>
          <div className="bg-[#FEF3C7] rounded-[24px] aspect-square border-4 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group">
            <img src="./produk/mycoffeeza/3.png" alt="Instagram 2" className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            <div className="relative z-10 p-4 flex flex-col justify-between h-full">
              <span className="text-white drop-shadow-md text-xs font-mono font-black">#02</span>
            </div>
          </div>
          <div className="bg-[#E0F2FE] rounded-[24px] aspect-square border-4 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group">
            <img src="./produk/mycoffeeza/4.png" alt="Instagram 3" className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            <div className="relative z-10 p-4 flex flex-col justify-between h-full">
              <span className="text-white drop-shadow-md text-xs font-mono font-black">#03</span>
              <Heart size={18} className="text-white fill-current drop-shadow-md" />
            </div>
          </div>
          <div className="bg-[#ECEFfe] rounded-[24px] aspect-square border-4 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group">
            <img src="./produk/mycoffeeza/7.png" alt="Instagram 4" className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            <div className="relative z-10 p-4 flex flex-col justify-between h-full">
              <span className="text-white drop-shadow-md text-xs font-mono font-black">#04</span>
            </div>
          </div>
          <div className="bg-[#FCE7F3] rounded-[24px] aspect-square border-4 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group">
            <img src="./produk/mycoffeeza/6.png" alt="Instagram 5" className="absolute inset-0 w-full h-full object-cover z-0 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/10 z-0"></div>
            <div className="relative z-10 p-4 flex flex-col justify-between h-full">
              <span className="text-white drop-shadow-md text-xs font-mono font-black">#05</span>
              <Heart size={18} className="text-[#E94E77] fill-current drop-shadow-md" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= 9. BOTTOM MARQUEE TICKER ================= */}
      <div className="bg-[#2D1B4E] text-[#FCFAF6] py-3 text-xs font-black uppercase tracking-widest overflow-hidden whitespace-nowrap border-t-4 border-[#2D1B4E] select-none relative z-30">
        <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
          <span>⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • </span>
          <span>⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • ⚡ 10% Off on FIRST Purchase • Subscribe & Save 15% • </span>
        </div>
      </div>

      {/* ================= 10. LARGE PLAYFUL FOOTER ================= */}
      <footer id="footer" className="bg-[#FCFAF6] border-t-4 border-[#2D1B4E] py-20 px-6 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row justify-between items-start gap-12 xl:gap-8">
          
          {/* Left links columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 w-full xl:w-auto flex-shrink-0">
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
              <p className="text-3xl font-black text-[#E94E77] drop-shadow-[2px_2px_0px_#2D1B4E]">1.6M L</p>
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
          <div className="space-y-4 text-left xl:text-right w-full xl:w-auto xl:flex-1 overflow-hidden mt-8 xl:mt-0">
            <span className="text-[9vw] xl:text-[85px] leading-none font-black tracking-tight text-[#E94E77] block uppercase drop-shadow-[4px_4px_0px_#2D1B4E] transform -rotate-1 select-none overflow-visible whitespace-normal break-words">
              My Coffeeza
            </span>
            <p className="text-[#2D1B4E] text-xs font-extrabold max-w-[280px] xl:ml-auto pt-2">
              We carefully crafted each can with all the benefits for the right time!
            </p>
          </div>
        </div>

        {/* Absolute Bottom Social Portals */}
        <div className="max-w-7xl mx-auto border-t-4 border-[#2D1B4E] mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs font-black text-[#2D1B4E]/70">
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
          base: "bg-white border-4 border-[#2D1B4E] rounded-[32px] shadow-[8px_8px_0px_#2D1B4E] overflow-hidden",
          header: "border-b-4 border-[#2D1B4E] bg-[#FCE7F3]",
          body: "p-6",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-[#2D1B4E]">
                <h3 className="font-black text-xl flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E94E77] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E94E77]"></span>
                  </span>
                  Live Chat Penilaian
                </h3>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Feedback Pelanggan Real-time</p>
              </ModalHeader>
              <ModalBody className={`space-y-4 max-h-[400px] overflow-y-auto p-6 ${reviews.length === 0 ? "flex items-center justify-center min-h-[200px]" : ""}`}>
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
              <ModalFooter className="flex-col gap-3 border-t-4 border-[#2D1B4E] bg-white rounded-b-[28px] p-6 relative z-10">
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
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Chat via WhatsApp"
      >
        {/* Pulse ring animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none" />
        
        {/* Button body */}
        <div className="relative w-16 h-16 bg-[#25D366] rounded-full border-4 border-[#2D1B4E] shadow-[4px_4px_0px_#2D1B4E] flex items-center justify-center hover:scale-110 hover:shadow-[6px_6px_0px_#2D1B4E] active:scale-95 active:shadow-[2px_2px_0px_#2D1B4E] transition-all duration-200 cursor-pointer">
          {/* WhatsApp SVG Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            fill="white"
            className="w-8 h-8"
          >
            <path d="M16.004 2.667A13.2 13.2 0 0 0 2.88 19.307L1.333 30.667l11.627-1.52A13.2 13.2 0 1 0 16.004 2.667zm0 24.266a10.93 10.93 0 0 1-5.893-1.72l-.413-.253-4.32.56.573-4.187-.267-.427A10.933 10.933 0 1 1 16.004 26.933zm6-8.16c-.333-.167-1.96-.967-2.267-1.08-.307-.107-.527-.167-.747.167s-.86 1.08-1.053 1.3-.387.253-.72.087-1.4-.517-2.667-1.647c-.987-.88-1.653-1.967-1.847-2.3s-.02-.513.147-.68c.153-.147.333-.387.5-.58s.22-.333.333-.553.053-.42-.027-.587-.747-1.8-1.02-2.467c-.267-.64-.54-.553-.747-.567h-.64a1.227 1.227 0 0 0-.887.413 3.727 3.727 0 0 0-1.16 2.773c0 1.633 1.193 3.213 1.36 3.433s2.347 3.58 5.687 5.02c.793.347 1.413.553 1.9.707a4.573 4.573 0 0 0 2.1.133c.64-.093 1.96-.8 2.24-1.573s.28-1.44.193-1.573-.307-.227-.64-.393z" />
          </svg>
        </div>

        {/* Tooltip on hover */}
        <div className="absolute bottom-20 right-0 bg-white text-[#2D1B4E] text-xs font-black px-4 py-2 rounded-xl border-2 border-[#2D1B4E] shadow-[3px_3px_0px_#2D1B4E] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Chat via WhatsApp 💬
        </div>
      </a>

    </div>
  );
};
