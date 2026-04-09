import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Users, Mail, Shield, UserPlus } from "lucide-react";
import { getCompanyWithDetails } from "@/queries/company";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const roleColors: Record<string, string> = {
  owner: "bg-purple-50 text-purple-700 border-purple-200",
  admin: "bg-blue-50 text-blue-700 border-blue-200",
  member: "bg-surface-50 text-surface-700 border-surface-200",
};

const roleLabels: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

export default async function UsersPage() {
  const cookieStore = await cookies();
  const companyId = cookieStore.get("activeCompanyId")?.value;

  if (!companyId) {
    redirect("/company");
  }

  const company = await getCompanyWithDetails(companyId);
  if (!company) {
    redirect("/company");
  }

  const members = company.members ?? [];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Team Members"
        description="Manage who has access to this company"
        actions={
          <Button disabled>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        }
      />

      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members"
          description="Invite team members to collaborate on this company."
          action={
            <Button disabled>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-surface-50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[120px]">Role</TableHead>
                  <TableHead className="w-[130px]">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-semibold">
                          {(member.user?.name ?? "?")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-surface-900">
                          {member.user?.name ?? "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-surface-600">
                      {member.user?.email ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={roleColors[member.role ?? "member"]}
                      >
                        <Shield className="mr-1 h-3 w-3" />
                        {roleLabels[member.role ?? "member"] ?? member.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-surface-500">
                      {member.createdAt
                        ? formatDate(new Date(member.createdAt))
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
