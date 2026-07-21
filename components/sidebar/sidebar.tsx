import React from "react";
import { Sidebar } from "./sidebar.styles";
import { Avatar, Tooltip } from "@nextui-org/react";
import { CompaniesDropdown } from "./companies-dropdown";
import { HomeIcon } from "../icons/sidebar/home-icon";
import { PaymentsIcon } from "../icons/sidebar/payments-icon";
import { BalanceIcon } from "../icons/sidebar/balance-icon";
import { AccountsIcon } from "../icons/sidebar/accounts-icon";
import { CustomersIcon } from "../icons/sidebar/customers-icon";
import { ProductsIcon } from "../icons/sidebar/products-icon";
import { ReportsIcon } from "../icons/sidebar/reports-icon";
import { DevIcon } from "../icons/sidebar/dev-icon";
import { ViewIcon } from "../icons/sidebar/view-icon";
import { SettingsIcon } from "../icons/sidebar/settings-icon";
import { CollapseItems } from "./collapse-items";
import { SidebarItem } from "./sidebar-item";
import { SidebarMenu } from "./sidebar-menu";
import { FilterIcon } from "../icons/sidebar/filter-icon";
import { useSidebarContext } from "../layout/layout-context";
import { ChangeLogIcon } from "../icons/sidebar/changelog-icon";
import { usePathname } from "next/navigation";

export const SidebarWrapper = () => {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebarContext();

  return (
    <aside className="h-screen z-[20] sticky top-0">
      {collapsed ? (
        <div className={Sidebar.Overlay()} onClick={setCollapsed} />
      ) : null}
      <div
        className={Sidebar({
          collapsed: collapsed,
        })}
      >
        <div className={Sidebar.Header()}>
          <CompaniesDropdown />
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className={Sidebar.Body()}>
            {/* ====== HRD Dashboard ====== */}
            <SidebarMenu title="HRD Dashboard">
              <SidebarItem
                title="Dashboard HRD"
                icon={<HomeIcon />}
                isActive={pathname === "/hrd"}
                href="/hrd"
              />
              <SidebarItem
                isActive={pathname === "/akun-kasir"}
                title="Akun Kasir"
                icon={<AccountsIcon />}
                href="/akun-kasir"
              />
              <SidebarItem
                isActive={pathname === "/karyawan"}
                title="Karyawan"
                icon={<CustomersIcon />}
                href="/karyawan"
              />
              <SidebarItem
                isActive={pathname === "/products"}
                title="Kelola Produk"
                icon={<ProductsIcon />}
                href="/products"
              />
            </SidebarMenu>

            {/* ====== Staff Finance ====== */}
            <SidebarMenu title="Staff Finance">
              <SidebarItem
                isActive={pathname === "/finance"}
                title="Dashboard Finance"
                icon={<BalanceIcon />}
                href="/finance"
              />
              <SidebarItem
                isActive={pathname === "/Penjualan"}
                title="Laporan Penjualan"
                icon={<AccountsIcon />}
                href="/Penjualan"
              />
              <CollapseItems
                icon={<PaymentsIcon />}
                title="Laporan Pembayaran"
                items={[
                  { name: "Ringkasan", href: "/payments" },
                  { name: "Gojek", href: "/payments/gojek" },
                  { name: "Grab", href: "/payments/grab" },
                  { name: "ShopeeFood", href: "/payments/shopefood" },
                  { name: "Cash", href: "/payments/cash" },
                  { name: "QRIS", href: "/payments/qris" },
                ]}
              />
              <SidebarItem
                isActive={pathname === "/data-analyst"}
                title="Data Analyst"
                icon={<ReportsIcon />}
                href="/data-analyst"
              />
            </SidebarMenu>

            {/* ====== Staff Supervaisor ====== */}
            <SidebarMenu title="Staff Supervaisor">
              <SidebarItem
                isActive={pathname === "/supervaisor"}
                title="Dashboard SPV"
                icon={<ViewIcon />}
                href="/supervaisor"
              />
              <SidebarItem
                isActive={pathname === "/data-bahan"}
                title="Data Bahan"
                icon={<ProductsIcon />}
                href="/data-bahan"
              />
              <SidebarItem
                isActive={pathname === "/sisa-stok-bahan"}
                title="Sisa Stok Bahan"
                icon={<BalanceIcon />}
                href="/sisa-stok-bahan"
              />
              <SidebarItem
                isActive={pathname === "/Bahan-masuk"}
                title="Bahan Masuk"
                icon={<ViewIcon />}
                href="/Bahan-masuk"
              />
              <SidebarItem
                isActive={pathname === "/reportbarang"}
                title="Bahan Rusak"
                icon={<ReportsIcon />}
                href="/reportbarang"
              />
            </SidebarMenu>

            {/* ====== Settings ====== */}
            <SidebarMenu title="General">
              <SidebarItem
                isActive={pathname === "/changelog"}
                title="Changelog"
                icon={<ChangeLogIcon />}
              />
            </SidebarMenu>
          </div>
          <div className={Sidebar.Footer()}>
            <Tooltip content={"Settings"} color="primary">
              <div className="max-w-fit">
                <SettingsIcon />
              </div>
            </Tooltip>
            <Tooltip content={"Adjustments"} color="primary">
              <div className="max-w-fit">
                <FilterIcon />
              </div>
            </Tooltip>
            <Tooltip content={"Profile"} color="primary">
              <Avatar
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                size="sm"
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </aside>
  );
};
