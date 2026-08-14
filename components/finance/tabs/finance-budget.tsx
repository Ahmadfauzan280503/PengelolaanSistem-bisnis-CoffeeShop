"use client";
import React from "react";
import { Button, Progress } from "@nextui-org/react";

interface FinanceBudgetProps {
  budgets: any[];
  formatRp: (num: number) => string;
}

export const FinanceBudget = ({ budgets, formatRp }: FinanceBudgetProps) => {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-900">Sistem Budgeting</h2>
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h3 className="font-bold text-gray-900">Budget Cabang (Bulan Ini)</h3>
          <Button size="sm" variant="flat" color="primary" className="w-full sm:w-auto font-semibold">Set Budget Tahunan</Button>
        </div>
        <div className="space-y-6">
          {budgets.map((b: any) => {
            const pct = b.total_budget > 0 ? (Number(b.used_budget) / Number(b.total_budget)) * 100 : 0;
            const over = pct > 100;
            return (
              <div key={b.id} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-3 gap-2">
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{(b.outlets as any)?.name || "Cabang"}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Terpakai: <span className="font-semibold text-gray-700">{formatRp(Number(b.used_budget))}</span> / {formatRp(Number(b.total_budget))}
                    </p>
                  </div>
                  <span className={`text-xl sm:text-2xl font-black ${over ? "text-red-500" : pct > 80 ? "text-amber-500" : "text-emerald-500"}`}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={pct > 100 ? 100 : pct} 
                  color={over ? "danger" : pct > 80 ? "warning" : "success"} 
                  className="h-3 shadow-inner" 
                  radius="full"
                />
                {over && <p className="text-xs text-red-500 mt-2 font-bold bg-red-50 inline-block px-2 py-1 rounded-md">*Budget telah terlampaui!</p>}
              </div>
            );
          })}
          {budgets.length === 0 && <p className="text-gray-400 text-center py-10">Belum ada data budget</p>}
        </div>
      </div>
    </div>
  );
};
