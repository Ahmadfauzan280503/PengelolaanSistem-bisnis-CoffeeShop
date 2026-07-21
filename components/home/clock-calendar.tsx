"use client";
import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";

export const ClockCalendar = () => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  // Format ke waktu WITA (Waktu Indonesia Tengah) -> UTC+8
  const formatWITA = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Makassar",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(time);

  const formatDate = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Makassar",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(time);

  return (
    <div className="w-full bg-[#12121a] border border-[#1e1e2e] rounded-2xl px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
          <Clock size={22} className="text-purple-400" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Jam Realtime (WITA)</p>
          <h2 className="text-3xl font-black text-white tracking-tight tabular-nums">{formatWITA}</h2>
        </div>
      </div>
      
      <div className="hidden md:block w-px h-10 bg-[#1e1e2e]" />

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center">
          <Calendar size={22} className="text-cyan-400" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tanggal Hari Ini</p>
          <h2 className="text-lg font-bold text-white">{formatDate}</h2>
        </div>
      </div>
    </div>
  );
};
