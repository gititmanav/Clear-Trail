"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCompaniesForUser, setActiveCompany } from "@/actions/company";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Plus,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { getFinancialYearLabel } from "@/lib/utils";

interface CompanyWithRole {
  id: string;
  name: string;
  address: string | null;
  state: string | null;
  gstin: string | null;
  role: string | null;
  financialYears: Array<{
    id: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean | null;
  }>;
}

export default function CompanyPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCompaniesForUser();
        setCompanies(data as CompanyWithRole[]);
      } catch {
        toast.error("Failed to load companies");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function handleSelect(companyId: string) {
    try {
      setSelectingId(companyId);
      await setActiveCompany(companyId);
      toast.success("Company selected");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to select company");
    } finally {
      setSelectingId(null);
    }
  }

  const roleColors: Record<string, string> = {
    owner: "bg-brand-50 text-brand-700 border-brand-200",
    admin: "bg-warning-50 text-warning-700 border-warning-200",
    member: "bg-surface-100 text-surface-600 border-surface-200",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-surface-900">
            Companies
          </h2>
          <p className="mt-1 text-sm text-surface-500">
            Select a company to work with, or create a new one.
          </p>
        </div>
        <Button asChild>
          <Link href="/company/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Company
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-100">
              <Building2 className="h-7 w-7 text-surface-400" />
            </div>
            <p className="font-display text-sm font-semibold text-surface-700">
              No companies yet
            </p>
            <p className="mt-1 max-w-sm text-center text-xs text-surface-400">
              Create your first company to start managing your accounts.
            </p>
            <Button size="sm" className="mt-4 gap-1.5" asChild>
              <Link href="/company/new">
                <Plus className="h-4 w-4" />
                Create Company
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company, i) => {
            const currentFY = company.financialYears.find(
              (fy) => fy.isCurrent
            );
            return (
              <Card
                key={company.id}
                className="group cursor-pointer transition-all hover:shadow-md hover:border-brand-200 animate-slide-up"
                style={{
                  animationDelay: `${i * 60}ms`,
                  animationFillMode: "backwards",
                }}
                onClick={() => handleSelect(company.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                        <Building2 className="h-5 w-5 text-brand-500" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-semibold text-surface-900">
                          {company.name}
                        </h3>
                        {company.state && (
                          <p className="text-xs text-surface-400">
                            {company.state}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        roleColors[company.role ?? "member"] ?? roleColors.member
                      }
                    >
                      {company.role}
                    </Badge>
                  </div>

                  {currentFY && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-surface-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        FY{" "}
                        {getFinancialYearLabel(
                          currentFY.startDate,
                          currentFY.endDate
                        )}
                      </span>
                    </div>
                  )}

                  {company.gstin && (
                    <p className="mt-2 text-xs text-surface-400 font-mono">
                      GSTIN: {company.gstin}
                    </p>
                  )}

                  <div className="mt-4 flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-brand-500 group-hover:text-brand-600"
                      disabled={selectingId === company.id}
                    >
                      {selectingId === company.id ? (
                        "Selecting..."
                      ) : (
                        <>
                          Select
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
