import { DashboardProvider } from "@/components/dashboard/dashboard-context";
import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <DashboardLayoutClient>
        {children}
      </DashboardLayoutClient>
    </DashboardProvider>
  );
}
