import { cookies } from "next/headers";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CompanyProvider } from "@/components/providers/company-provider";
import { KeyboardShortcutsWrapper } from "@/components/layout/keyboard-shortcuts-wrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const activeCompanyId = cookieStore.get("activeCompanyId")?.value ?? null;

  return (
    <CompanyProvider initialCompanyId={activeCompanyId}>
      <KeyboardShortcutsWrapper>
        <div className="flex h-screen overflow-hidden bg-surface-50">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
            </main>
          </div>
        </div>
      </KeyboardShortcutsWrapper>
    </CompanyProvider>
  );
}
