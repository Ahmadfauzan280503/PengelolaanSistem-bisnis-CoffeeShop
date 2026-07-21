"use client";
import React, { useState, useEffect } from "react";
import { 
  Input, 
  Button, 
} from "@nextui-org/react";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import Link from "next/link";
import { ProductCard } from "./product-card";
import { AddProduct } from "./add-product";

const defaultProducts = [
  { 
    id: 1, 
    name: "Blackberry Hibiscus", 
    category: "Drink", 
    price: 24000, 
    status: "Active",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop",
    badge: "Best Seller",
    badgeColor: "bg-orange-500",
    is_best_seller: true,
  },
  { 
    id: 2, 
    name: "Grapefruit Yerba", 
    category: "Drink", 
    price: 24000, 
    status: "Active",
    image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?q=80&w=600&auto=format&fit=crop",
    badge: "Best Seller",
    badgeColor: "bg-orange-500",
    is_best_seller: true,
  },
  { 
    id: 3, 
    name: "Tropical Papaya", 
    category: "Drink", 
    price: 24000, 
    status: "Active",
    image: "https://images.unsplash.com/photo-1546171753-97d7676e4602?q=80&w=600&auto=format&fit=crop",
    badge: "Best Seller",
    badgeColor: "bg-orange-500",
    is_best_seller: true,
  },
];

export const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load products from localStorage or use defaults
    const stored = localStorage.getItem("mana_products");
    if (stored) {
      setProducts(JSON.parse(stored));
    } else {
      setProducts(defaultProducts);
      localStorage.setItem("mana_products", JSON.stringify(defaultProducts));
    }
    setMounted(true);
  }, []);

  const handleAddProduct = (newProduct: any) => {
    const updated = [newProduct, ...products];
    setProducts(updated);
    localStorage.setItem("mana_products", JSON.stringify(updated));
  };

  const handleDeleteProduct = (id: number) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem("mana_products", JSON.stringify(updated));
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div className="my-10 px-4 lg:px-6 max-w-[95rem] mx-auto w-full flex flex-col gap-4">
      <ul className="flex">
        <li className="flex gap-2">
          <HouseIcon />
          <Link href={"/"}>
            <span>Home</span>
          </Link>
          <span> / </span>{" "}
        </li>
        <li className="flex gap-2 text-primary">
          <span>Products</span>
        </li>
      </ul>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-3xl font-black text-[#2D1B4E]">Semua Produk</h3>
        <div className="flex flex-row gap-3.5 flex-wrap w-full md:w-auto">
          <AddProduct onAddProduct={handleAddProduct} />
        </div>
      </div>

      <div className="flex justify-between flex-wrap gap-4 items-center bg-white p-4 rounded-3xl border-4 border-[#2D1B4E] shadow-[8px_8px_0px_#2D1B4E]">
        <div className="flex items-center gap-3 w-full md:max-w-md">
          <Input
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            classNames={{
              input: "w-full font-bold",
              mainWrapper: "w-full",
              inputWrapper: "bg-neutral-100 border-2 border-[#2D1B4E] rounded-xl",
            }}
            variant="flat"
            isClearable
            onClear={() => setSearchQuery("")}
          />
        </div>
        <div className="flex flex-row gap-2">
          <Button size="sm" className="rounded-xl border-2 border-[#2D1B4E] bg-[#E0F2FE] text-[#0369A1] font-black">Semua Kategori</Button>
          <Button size="sm" className="rounded-xl border-2 border-[#2D1B4E] bg-[#FEF3C7] text-[#D97706] font-black">Terlaris</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <button 
                onClick={() => handleDeleteProduct(product.id)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full border-2 border-[#2D1B4E] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-[2px_2px_0px_#2D1B4E] font-bold z-50 hover:bg-red-600"
              >
                X
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-4 border-dashed border-[#2D1B4E]">
            <p className="text-[#2D1B4E] font-black text-xl">Produk tidak ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
};
