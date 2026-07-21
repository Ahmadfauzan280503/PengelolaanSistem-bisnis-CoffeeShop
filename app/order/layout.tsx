import "@/styles/globals.css";

export const metadata = {
  title: "KOTACOFFEE.ID - Menu Digital",
  description: "Menu Digital & Order System KOTACOFFEE.ID",
};

export default function OrderLayout({
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
