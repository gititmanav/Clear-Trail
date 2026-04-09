"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Building2,
  CreditCard,
  FileText,
  ReceiptText,
} from "lucide-react";
import Link from "next/link";
import { useCompany } from "@/components/providers/company-provider";
import {
  createLedgerSchema,
  type CreateLedgerInput,
} from "@/lib/validators/ledger";
import { createLedger } from "@/actions/ledger";
import { getGroupsForCompany } from "@/actions/ledger-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

interface GroupOption {
  id: string;
  name: string;
  nature: string;
  parentId: string | null;
}

// Group names that need extra fields
const PARTY_GROUPS = ["Sundry Debtors", "Sundry Creditors"];
const BANK_GROUPS = ["Bank Accounts", "Bank OD Accounts"];
const TAX_GROUPS = ["Duties & Taxes"];

export default function NewLedgerPage() {
  const router = useRouter();
  const { activeCompanyId } = useCompany();
  const [groups, setGroups] = React.useState<GroupOption[]>([]);
  const [selectedGroupName, setSelectedGroupName] = React.useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateLedgerInput>({
    resolver: zodResolver(createLedgerSchema),
    defaultValues: {
      name: "",
      groupId: "",
      openingBalance: 0,
      openingBalanceType: "debit",
      isBillwise: false,
    },
  });

  const groupId = watch("groupId");
  const openingBalanceType = watch("openingBalanceType");

  // Load groups
  React.useEffect(() => {
    if (!activeCompanyId) return;
    getGroupsForCompany(activeCompanyId).then((result) => {
      setGroups(
        result.map((g) => ({
          id: g.id,
          name: g.name,
          nature: g.nature,
          parentId: g.parentId,
        }))
      );
    });
  }, [activeCompanyId]);

  // Track selected group name for conditional fields
  React.useEffect(() => {
    const group = groups.find((g) => g.id === groupId);
    setSelectedGroupName(group?.name ?? "");
  }, [groupId, groups]);

  const showPartyFields = PARTY_GROUPS.some(
    (g) =>
      selectedGroupName === g ||
      groups.find((gr) => gr.id === groupId)?.parentId ===
        groups.find((gr) => gr.name === g)?.id
  );
  const showBankFields = BANK_GROUPS.some(
    (g) =>
      selectedGroupName === g ||
      groups.find((gr) => gr.id === groupId)?.parentId ===
        groups.find((gr) => gr.name === g)?.id
  );
  const showTaxFields = TAX_GROUPS.some(
    (g) =>
      selectedGroupName === g ||
      groups.find((gr) => gr.id === groupId)?.parentId ===
        groups.find((gr) => gr.name === g)?.id
  );

  async function onSubmit(data: CreateLedgerInput) {
    if (!activeCompanyId) {
      toast.error("No active company");
      return;
    }

    try {
      const result = await createLedger(activeCompanyId, data);

      if ("error" in result && result.error) {
        const firstError = Object.values(result.error).flat()[0];
        toast.error(String(firstError) || "Validation failed");
        return;
      }

      toast.success("Ledger created successfully");
      router.push("/ledgers");
      router.refresh();
    } catch {
      toast.error("Failed to create ledger");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/ledgers">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h2 className="font-display text-2xl font-bold text-surface-900">
            Create Ledger
          </h2>
          <p className="mt-0.5 text-sm text-surface-500">
            Add a new ledger account to your books.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-brand-500" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupId">
                Group <span className="text-danger-500">*</span>
              </Label>
              <Select
                value={groupId}
                onValueChange={(v) => setValue("groupId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.groupId && (
                <p className="text-xs text-danger-500">
                  {errors.groupId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Ledger Name <span className="text-danger-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. State Bank of India"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-danger-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openingBalance">Opening Balance</Label>
                <Input
                  id="openingBalance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="font-mono"
                  {...register("openingBalance", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Balance Type</Label>
                <Select
                  value={openingBalanceType ?? "debit"}
                  onValueChange={(v) =>
                    setValue(
                      "openingBalanceType",
                      v as "debit" | "credit"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debit">Debit (Dr)</SelectItem>
                    <SelectItem value="credit">Credit (Cr)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Party Details (Sundry Debtors / Creditors) */}
        {showPartyFields && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-brand-500" />
                Party Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  {...register("address")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    placeholder="22AAAAA0000A1Z5"
                    className="font-mono"
                    {...register("gstin")}
                  />
                  {errors.gstin && (
                    <p className="text-xs text-danger-500">
                      {errors.gstin.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN</Label>
                  <Input
                    id="pan"
                    placeholder="AAAAA0000A"
                    className="font-mono"
                    {...register("pan")}
                  />
                  {errors.pan && (
                    <p className="text-xs text-danger-500">
                      {errors.pan.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    {...register("phone")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="party@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-xs text-danger-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="e.g. Maharashtra"
                    {...register("state")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    placeholder="400001"
                    {...register("pincode")}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creditPeriodDays">Credit Period (Days)</Label>
                  <Input
                    id="creditPeriodDays"
                    type="number"
                    placeholder="30"
                    {...register("creditPeriodDays", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Credit Limit</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="font-mono"
                    {...register("creditLimit", { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isBillwise"
                  onCheckedChange={(checked) =>
                    setValue("isBillwise", checked === true)
                  }
                />
                <Label htmlFor="isBillwise" className="text-sm">
                  Enable Bill-wise Accounting
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bank Details */}
        {showBankFields && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-brand-500" />
                Bank Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="e.g. State Bank of India"
                  {...register("bankName")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="1234567890"
                    className="font-mono"
                    {...register("accountNumber")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    placeholder="SBIN0000001"
                    className="font-mono"
                    {...register("ifscCode")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchName">Branch Name</Label>
                <Input
                  id="branchName"
                  placeholder="e.g. Fort Branch, Mumbai"
                  {...register("branchName")}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tax Details */}
        {showTaxFields && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <ReceiptText className="h-4 w-4 text-brand-500" />
                Tax Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxType">Tax Type</Label>
                  <Select
                    onValueChange={(v) => setValue("taxType", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CGST">CGST</SelectItem>
                      <SelectItem value="SGST">SGST</SelectItem>
                      <SelectItem value="IGST">IGST</SelectItem>
                      <SelectItem value="CESS">CESS</SelectItem>
                      <SelectItem value="TDS">TDS</SelectItem>
                      <SelectItem value="TCS">TCS</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="18.00"
                    className="font-mono"
                    {...register("taxRate", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/ledgers">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Creating..." : "Create Ledger"}
          </Button>
        </div>
      </form>
    </div>
  );
}
