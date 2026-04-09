"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCompanySchema,
  type CreateCompanyInput,
} from "@/lib/validators/company";
import { createCompany } from "@/actions/company";
import { setActiveCompany } from "@/actions/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  FileText,
  Calendar,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDateISO } from "@/lib/utils";

function getDefaultFYStart(): string {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-04-01`;
}

function getDefaultFYEnd(): string {
  const now = new Date();
  const year = now.getMonth() >= 3 ? now.getFullYear() + 1 : now.getFullYear();
  return `${year}-03-31`;
}

export default function NewCompanyPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCompanyInput>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: "",
      address: "",
      state: "",
      gstin: "",
      pan: "",
      phone: "",
      email: "",
      financialYearStart: getDefaultFYStart(),
      financialYearEnd: getDefaultFYEnd(),
    },
  });

  async function onSubmit(data: CreateCompanyInput) {
    try {
      const result = await createCompany(data);

      if ("error" in result && result.error) {
        const errorMessages = Object.values(result.error).flat();
        toast.error(errorMessages[0] || "Validation failed");
        return;
      }

      if ("data" in result && result.data) {
        await setActiveCompany(result.data.id);
        toast.success("Company created successfully");
        router.push("/");
        router.refresh();
      }
    } catch {
      toast.error("Failed to create company. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/company">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>
        </Button>
        <div>
          <h2 className="font-display text-2xl font-bold text-surface-900">
            Create Company
          </h2>
          <p className="mt-0.5 text-sm text-surface-500">
            Set up a new company with its financial year.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Details */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-brand-500" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Company Name <span className="text-danger-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Acme Trading Co."
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-danger-500">{errors.name.message}</p>
              )}
            </div>

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
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="e.g. Maharashtra"
                  {...register("state")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+91 98765 43210"
                  {...register("phone")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="company@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-danger-500">
                  {errors.email.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-brand-500" />
              Tax Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        {/* Financial Year */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-brand-500" />
              Financial Year
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="financialYearStart">
                  Start Date <span className="text-danger-500">*</span>
                </Label>
                <Input
                  id="financialYearStart"
                  type="date"
                  {...register("financialYearStart")}
                />
                {errors.financialYearStart && (
                  <p className="text-xs text-danger-500">
                    {errors.financialYearStart.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="financialYearEnd">
                  End Date <span className="text-danger-500">*</span>
                </Label>
                <Input
                  id="financialYearEnd"
                  type="date"
                  {...register("financialYearEnd")}
                />
                {errors.financialYearEnd && (
                  <p className="text-xs text-danger-500">
                    {errors.financialYearEnd.message}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-surface-400">
              Default: April 1 to March 31 (Indian financial year). Adjust if
              your company follows a different period.
            </p>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/company">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Creating..." : "Create Company"}
          </Button>
        </div>
      </form>
    </div>
  );
}
