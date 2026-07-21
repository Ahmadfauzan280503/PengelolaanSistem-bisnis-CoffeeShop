"use client";
import { Card, CardBody, Input, Button } from "@nextui-org/react";
import React, { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Save, CheckCircle2, UploadCloud, Trash2 } from "lucide-react";

export const PromoManager = () => {
  const [promoUrls, setPromoUrls] = useState<string[]>(["", "", ""]);
  const [saved, setSaved] = useState(false);
  
  // Refs for file inputs
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  const fileInputRef3 = useRef<HTMLInputElement>(null);
  const fileRefs = [fileInputRef1, fileInputRef2, fileInputRef3];

  useEffect(() => {
    const savedUrlsStr = localStorage.getItem("mana_promo_images");
    if (savedUrlsStr) {
      try {
        const parsed = JSON.parse(savedUrlsStr);
        if (Array.isArray(parsed) && parsed.length === 3) {
          setPromoUrls(parsed);
        }
      } catch (e) {}
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem("mana_promo_images", JSON.stringify(promoUrls));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert("Gagal menyimpan: Ukuran gambar masih terlalu besar! Harap gunakan file gambar yang ukurannya lebih kecil atau gunakan URL.");
      console.error("LocalStorage Quota Exceeded", error);
    }
  };

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        // Compress as JPEG 70%
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
    });
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const compressed = await compressImage(base64String);
          const newUrls = [...promoUrls];
          newUrls[index] = compressed;
          setPromoUrls(newUrls);
        } catch (err) {
          console.error("Failed to compress image", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = (index: number) => {
    const newUrls = [...promoUrls];
    newUrls[index] = "";
    setPromoUrls(newUrls);
  };

  return (
    <Card className="bg-[#12121a] border border-[#1e1e2e] rounded-2xl shadow-lg w-full">
      <CardBody className="p-6 gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-500/10 border border-pink-500/20 rounded-xl">
            <ImageIcon className="text-pink-400" size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black text-sm tracking-wide">3 Promo Images</span>
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Set Landing Page Hero Cards</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2 p-3 border-2 border-dashed border-[#1e1e2e] rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Slot {i + 1}</span>
                {promoUrls[i] && (
                  <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => handleClear(i)} className="h-6 w-6 min-w-0">
                    <Trash2 size={12} />
                  </Button>
                )}
              </div>
              
              {promoUrls[i] && (
                <div className="w-full h-24 rounded-lg overflow-hidden relative group">
                  <img src={promoUrls[i]} alt={`Preview ${i+1}`} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="flex gap-2">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileRefs[i]} 
                  onChange={(e) => handleFileChange(i, e)} 
                />
                <Button 
                  size="sm"
                  className="bg-[#1a1a24] text-white border border-[#2D1B4E] hover:border-pink-500 flex-1 font-bold text-[10px]"
                  onPress={() => fileRefs[i].current?.click()}
                  startContent={<UploadCloud size={14} className="text-pink-400" />}
                >
                  Upload File
                </Button>
              </div>
              <Input 
                size="sm"
                placeholder="ATAU URL Gambar..."
                value={promoUrls[i]}
                onChange={(e) => {
                  const newUrls = [...promoUrls];
                  newUrls[i] = e.target.value;
                  setPromoUrls(newUrls);
                }}
                variant="faded"
                classNames={{
                  inputWrapper: "bg-[#1a1a24] border-[#2D1B4E] hover:border-pink-500/50 group-data-[focus=true]:border-pink-500 h-8 min-h-8",
                  input: "text-white text-xs"
                }}
              />
            </div>
          ))}

          <Button 
            className={`w-full font-black uppercase text-xs tracking-wider transition-all duration-300 mt-2 ${
              saved 
                ? "bg-emerald-500 text-white border-none shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                : "bg-[#E94E77] text-white hover:bg-pink-500"
            }`}
            onClick={handleSave}
            startContent={saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          >
            {saved ? "Tersimpan" : "Simpan Ke Landing Page"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

