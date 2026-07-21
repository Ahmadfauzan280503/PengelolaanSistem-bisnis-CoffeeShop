"use client";
import React, { Suspense } from "react";
import { OrderMenu } from "@/components/order/order-menu";
import { Spinner } from "@nextui-org/react";

export default function Page() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
          <Spinner size="lg" label="Memuat Menu Digital..." color="warning" />
        </div>
      }
    >
      <OrderMenu />
    </Suspense>
  );
}
