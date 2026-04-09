import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Building2,
  Calendar,
  Palette,
  AlertTriangle,
} from "lucide-react";
import { getCompanyWithDetails } from "@/queries/company";
import { formatDate, getFinancialYearLabel } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const companyId = cookieStore.get("activeCompanyId")?.value;

  if (!companyId) {
    redirect("/company");
  }

  const company = await getCompanyWithDetails(companyId);
  if (!company) {
    redirect("/company");
  }

  const currentFY = company.currentFinancialYear;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Settings"
        description="Manage company settings and preferences"
      />

      <div className="space-y-6 max-w-3xl">
        {/* Company Info */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
              <Building2 className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <CardTitle className="text-base">Company Information</CardTitle>
              <p className="text-xs text-surface-500 mt-0.5">
                Basic details about your company
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoField label="Company Name" value={company.name} />
              <InfoField label="Address" value={company.address ?? "-"} />
              <InfoField label="State" value={company.state ?? "-"} />
              <InfoField label="GSTIN" value={company.gstin ?? "-"} mono />
              <InfoField label="PAN" value={company.pan ?? "-"} mono />
              <InfoField label="Phone" value={company.phone ?? "-"} />
              <InfoField label="Email" value={company.email ?? "-"} />
              <InfoField
                label="Currency"
                value={company.currencySymbol ?? "INR"}
              />
            </dl>
            <div className="mt-4 pt-4 border-t border-surface-100">
              <Button variant="outline" size="sm" disabled>
                Edit Company Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Financial Year */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-50">
              <Calendar className="h-5 w-5 text-success-600" />
            </div>
            <div>
              <CardTitle className="text-base">Financial Year</CardTitle>
              <p className="text-xs text-surface-500 mt-0.5">
                Current and past financial years
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {currentFY ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-success-200 bg-success-50/50 p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-surface-900">
                        FY{" "}
                        {getFinancialYearLabel(
                          currentFY.startDate,
                          currentFY.endDate
                        )}
                      </span>
                      <Badge className="bg-success-100 text-success-700 border-success-200">
                        Current
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-surface-500">
                      {formatDate(currentFY.startDate)} -{" "}
                      {formatDate(currentFY.endDate)}
                    </p>
                  </div>
                </div>

                {company.financialYears
                  .filter((fy) => !fy.isCurrent)
                  .map((fy) => (
                    <div
                      key={fy.id}
                      className="flex items-center gap-3 rounded-lg border border-surface-200 p-4"
                    >
                      <div className="flex-1">
                        <span className="text-sm font-medium text-surface-700">
                          FY{" "}
                          {getFinancialYearLabel(fy.startDate, fy.endDate)}
                        </span>
                        <p className="mt-0.5 text-xs text-surface-400">
                          {formatDate(fy.startDate)} - {formatDate(fy.endDate)}
                        </p>
                      </div>
                    </div>
                  ))}

                <Button variant="outline" size="sm" disabled className="mt-2">
                  Create New Financial Year
                </Button>
              </div>
            ) : (
              <p className="text-sm text-surface-500">
                No financial year configured.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <Palette className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-base">Appearance</CardTitle>
              <p className="text-xs text-surface-500 mt-0.5">
                Customize the look and feel
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-900">
                  Dark Mode
                </p>
                <p className="text-xs text-surface-500">
                  Switch between light and dark themes
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-danger-200">
          <CardHeader className="flex flex-row items-center gap-3 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-50">
              <AlertTriangle className="h-5 w-5 text-danger-600" />
            </div>
            <div>
              <CardTitle className="text-base text-danger-700">
                Danger Zone
              </CardTitle>
              <p className="text-xs text-surface-500 mt-0.5">
                Irreversible and destructive actions
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-surface-900">
                  Leave Company
                </p>
                <p className="text-xs text-surface-500">
                  Remove yourself from this company. You will lose access to all
                  data.
                </p>
              </div>
              <Button variant="outline" size="sm" disabled className="border-danger-200 text-danger-600 hover:bg-danger-50">
                Leave
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-surface-500 uppercase tracking-wide">
        {label}
      </dt>
      <dd
        className={`mt-1 text-sm text-surface-900 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
