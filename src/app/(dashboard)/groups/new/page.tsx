"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2, FolderTree } from "lucide-react";
import Link from "next/link";
import { useCompany } from "@/components/providers/company-provider";
import { createSubGroup, getGroupsForCompany } from "@/actions/ledger-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GroupOption {
  id: string;
  name: string;
  nature: string;
  isPrimary: boolean | null;
}

export default function NewGroupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeCompanyId } = useCompany();
  const [groups, setGroups] = React.useState<GroupOption[]>([]);
  const [parentId, setParentId] = React.useState(
    searchParams.get("parentId") ?? ""
  );
  const [name, setName] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!activeCompanyId) return;
    getGroupsForCompany(activeCompanyId).then((result) => {
      setGroups(
        result.map((g) => ({
          id: g.id,
          name: g.name,
          nature: g.nature,
          isPrimary: g.isPrimary,
        }))
      );
    });
  }, [activeCompanyId]);

  const selectedParent = groups.find((g) => g.id === parentId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!activeCompanyId) {
      toast.error("No active company");
      return;
    }
    if (!parentId) {
      toast.error("Please select a parent group");
      return;
    }
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createSubGroup({
        companyId: activeCompanyId,
        parentId,
        name: name.trim(),
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Sub-group created successfully");
      router.push("/groups");
      router.refresh();
    } catch {
      toast.error("Failed to create sub-group");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/groups">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h2 className="font-display text-2xl font-bold text-surface-900">
            Create Sub-group
          </h2>
          <p className="mt-0.5 text-sm text-surface-500">
            Add a new sub-group under an existing group.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderTree className="h-4 w-4 text-brand-500" />
              Sub-group Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>
                Parent Group <span className="text-danger-500">*</span>
              </Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedParent && (
              <div className="rounded-md bg-surface-50 px-3 py-2 text-sm">
                <span className="text-surface-500">Inherited nature: </span>
                <Badge variant="outline" className="capitalize ml-1">
                  {selectedParent.nature}
                </Badge>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="groupName">
                Group Name <span className="text-danger-500">*</span>
              </Label>
              <Input
                id="groupName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Office Expenses"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/groups">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting || !parentId || !name.trim()}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Creating..." : "Create Sub-group"}
          </Button>
        </div>
      </form>
    </div>
  );
}
