"use client";
import React from "react";
import { HouseIcon } from "@/components/icons/breadcrumb/house-icon";
import Link from "next/link";

export const DataAnalyst = () => {
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
          <span>Data Hasil Analyst</span>
        </li>
      </ul>

      <h3 className="text-2xl font-bold">Data Hasil Analyst</h3>
      
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm mt-4">
        <p className="text-neutral-500">Halaman Data Hasil Analyst sedang dalam pengembangan.</p>
      </div>
    </div>
  );
};
