"use client";
import React from "react";
import { FollowerPointerCard } from "@/components/ui/following-pointer";
import { cn } from "@/lib/utils";
import { Package, Scale, Tag } from "lucide-react";
import { EditIcon } from "../icons/table/edit-icon";

export interface BahanItem {
  id: number;
  name: string;
  image: string;
  description: string;
  stokAwal: number;
  satuan: string;
  kategori: string;
}

export const BahanCard = ({ bahan, onEdit }: { bahan: BahanItem; onEdit?: (item: BahanItem) => void }) => {
  // Category color mapping
  const getCategoryColor = (kategori: string) => {
    const colors: Record<string, { bg: string; text: string; dot: string }> = {
      "Kopi": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
      "Bubuk": { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-500" },
      "Pemanis": { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
      "Topping": { bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
      "Minuman": { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-400", dot: "bg-sky-500" },
      "Susu": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
      "Sirup": { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400", dot: "bg-orange-500" },
    };
    return colors[kategori] || { bg: "bg-neutral-100 dark:bg-neutral-800", text: "text-neutral-600 dark:text-neutral-400", dot: "bg-neutral-500" };
  };

  const categoryColor = getCategoryColor(bahan.kategori);

  return (
    <FollowerPointerCard
      title={
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
            {bahan.kategori[0]}
          </div>
          <p className="text-xs font-medium">{bahan.name}</p>
        </div>
      }
      className="w-full"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 group h-full flex flex-col">
        {/* Category Badge - Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-sm", categoryColor.bg, categoryColor.text)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", categoryColor.dot)} />
            {bahan.kategori}
          </div>
        </div>

        {/* Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <img
            src={bahan.image}
            alt={bahan.name}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          {/* Gradient overlay at bottom of image */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-grow p-5">
          {/* Name + Verified Badge */}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white line-clamp-1">
                {bahan.name}
              </h3>
              <svg className="w-4 h-4 text-sky-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault();
                onEdit?.(bahan);
              }}
              className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-amber-500 transition-colors"
            >
              <EditIcon size={16} />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4 line-clamp-2">
            {bahan.description}
          </p>

          {/* Spacer to push stats to bottom */}
          <div className="flex-grow" />

          {/* Stats Bar - Mimicking reference image */}
          <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-3 mt-1">
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{bahan.stokAwal.toLocaleString("id-ID")}</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-medium">Berat Bahan</span>
            </div>

            <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700" />

            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{bahan.satuan}</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-medium">Satuan</span>
            </div>

            <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-700" />

            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-sm font-bold text-neutral-900 dark:text-white">{bahan.kategori}</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-medium">Kategori</span>
            </div>
          </div>
        </div>
      </div>
    </FollowerPointerCard>
  );
};
