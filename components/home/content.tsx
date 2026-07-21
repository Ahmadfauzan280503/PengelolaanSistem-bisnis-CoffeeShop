"use client";
import React from "react";
import dynamic from "next/dynamic";
import { TableWrapper } from "../table/table";
import { CardBalance1 } from "./card-balance1";
import { CardBalance2 } from "./card-balance2";
import { CardBalance3 } from "./card-balance3";
import { CardAgents } from "./card-agents";
import { CardTransactions } from "./card-transactions";
import { PromoManager } from "./promo-manager";
import { Link } from "@nextui-org/react";
import NextLink from "next/link";
import { ClockCalendar } from "./clock-calendar";

const Chart = dynamic(
  () => import("../charts/steam").then((mod) => mod.Steam),
  {
    ssr: false,
  }
);

export const Content = () => (
  <div className="h-full lg:px-6 bg-[#0a0a0f] min-h-screen text-white font-sans pb-10">
    <div className="flex justify-center gap-4 xl:gap-6 pt-3 px-4 lg:px-0 flex-wrap xl:flex-nowrap sm:pt-10 max-w-[90rem] mx-auto w-full">
      <div className="mt-6 gap-6 flex flex-col w-full">
        {/* Header Greet - Game Style */}
        <div className="mb-2">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Dahsboard Admin
          </h1>
          <p className="text-gray-500 font-medium mt-2 text-sm md:text-base max-w-2xl">
            Welcome back, Commander. Your daily store analytics and live battle stats are ready.
          </p>
        </div>

        {/* Clock & Calendar Widget */}
        <ClockCalendar />

        {/* Card Section Top */}
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-black text-gray-300 uppercase tracking-widest px-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live Revenue Stats
          </h3>
          <div className="grid md:grid-cols-2 grid-cols-1 2xl:grid-cols-3 gap-5 justify-center w-full">
            <CardBalance1 />
            <CardBalance2 />
            <CardBalance3 />
          </div>
        </div>

        {/* Chart */}
        <div className="h-full flex flex-col gap-3 mt-4">
          <h3 className="text-lg font-black text-gray-300 uppercase tracking-widest px-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            Performance Graph
          </h3>
          <div className="w-full bg-[#12121a] border border-[#1e1e2e] shadow-lg shadow-purple-500/5 rounded-2xl p-6">
            <Chart />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="mt-4 gap-3 flex flex-col xl:max-w-md w-full">
        <h3 className="text-lg font-black text-gray-300 uppercase tracking-widest px-1 mt-6 xl:mt-0 flex items-center gap-2">
          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          Nama Nama karyawan
        </h3>
        <div className="flex flex-col justify-center gap-4 flex-wrap md:flex-nowrap md:flex-col">
          <CardAgents />
          <CardTransactions />
          <PromoManager />
        </div>
      </div>
    </div>

    {/* Table Daftar Karyawan */}
    <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0 max-w-[90rem] mx-auto gap-4 mt-8">
      <div className="flex flex-wrap justify-between items-end px-1">
        <h3 className="text-lg font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          Crew Members
        </h3>
        <Link
          href="/accounts"
          as={NextLink}
          color="primary"
          className="cursor-pointer"
        >
          View All
        </Link>
      </div>
      <TableWrapper />
    </div>
  </div>
);
