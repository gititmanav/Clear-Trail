import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getGroupsForCompany } from "@/actions/ledger-group";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { GroupTreeClient } from "./group-tree-client";

export default async function GroupsPage() {
  const cookieStore = await cookies();
  const companyId = cookieStore.get("activeCompanyId")?.value;

  if (!companyId) {
    redirect("/company");
  }

  const groups = await getGroupsForCompany(companyId);

  return (
    <div>
      <PageHeader
        title="Ledger Groups"
        description="View and manage the chart of accounts structure"
        actions={
          <Button asChild>
            <Link href="/groups/new">
              <Plus className="mr-2 h-4 w-4" />
              New Sub-group
            </Link>
          </Button>
        }
      />
      <GroupTreeClient groups={groups} />
    </div>
  );
}
