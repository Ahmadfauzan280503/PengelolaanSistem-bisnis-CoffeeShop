"use client";
import React from "react";
import Image from "next/image";
import { FollowerPointerCard } from "@/components/ui/following-pointer";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@nextui-org/react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  status: string;
  image: string;
  rating?: string;
  unit?: string;
  badge?: string;
  badgeColor?: string;
}

export const ProductCard = ({ product }: { product: Product }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <FollowerPointerCard
      title={
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
            {product.category[0]}
          </div>
          <p className="text-xs font-medium">{product.name}</p>
        </div>
      }
      className="w-full h-full"
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 border-4 border-[#2D1B4E] p-4 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none shadow-[8px_8px_0px_#2D1B4E] group h-full flex flex-col">
        {/* Glass reflection effect at the top */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent opacity-50 z-10 pointer-events-none rounded-t-[1.5rem] transform -skew-y-6 origin-top-left scale-110"></div>

        {/* Badge Top Left */}
        {product.badge && (
          <div 
            className={cn(
              "absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-[10px] font-black text-[#2D1B4E] bg-white border-2 border-[#2D1B4E] shadow-[2px_2px_0px_#2D1B4E] uppercase tracking-wider",
              product.badgeColor === "bg-orange-500" ? "text-orange-600" : ""
            )}
          >
            {product.badge}
          </div>
        )}

        {/* Category Pill Bottom Right */}
        <div className="absolute bottom-4 right-4 z-20 px-3 py-1 rounded-full text-[10px] font-black text-white bg-[#2D1B4E] shadow-[2px_2px_0px_rgba(255,255,255,0.2)] uppercase tracking-wider">
          {product.category}
        </div>

        {/* Image Container */}
        <div className="relative aspect-[4/5] w-full mb-4 overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border-2 border-[#2D1B4E]/10 z-0">
          <img
            src={product.image || "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&q=80"}
            onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&q=80"; }}
            alt={product.name}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col flex-grow z-10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-3 rounded-xl border-2 border-[#2D1B4E] mb-8">
          <h3 className="text-sm font-black text-[#2D1B4E] dark:text-white line-clamp-2 uppercase">
            {product.name}
          </h3>
          
          {/* Bottom Section */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-black text-[#2D1B4E] dark:text-white flex items-start">
              <span className="text-[10px] font-bold mt-1 mr-0.5">Rp</span>
              {formatCurrency(product.price).replace("Rp", "").trim()}
            </span>
          </div>
        </div>
      </div>
    </FollowerPointerCard>
  );
};
