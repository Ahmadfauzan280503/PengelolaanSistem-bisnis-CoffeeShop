import "@/styles/globals.css";

export const metadata = {
  title: "KOTACOFFEE.ID - Kasir POS",
  description: "Dashboard Kasir Point of Sales KOTACOFFEE.ID",
};

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="light" style={{ colorScheme: "light" }}>
      {children}
    </div>
  );
}
