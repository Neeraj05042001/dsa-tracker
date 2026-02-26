import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-shell">
      {/* Sidebar — fixed left */}
      <Sidebar revisionDueCount={0} />

      {/* Main content area */}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}