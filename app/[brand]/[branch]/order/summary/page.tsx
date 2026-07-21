"use client";
import React, { Suspense } from "react";
import { OrderSummaryView } from "@/components/order/order-summary-view";
import { Spinner } from "@nextui-org/react";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
          <Spinner size="lg" label="Memuat Struk Belanja..." color="warning" />
        </div>
      }
    >
      <OrderSummaryView />
    </Suspense>
  );
}
