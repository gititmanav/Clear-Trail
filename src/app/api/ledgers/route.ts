import { NextRequest, NextResponse } from "next/server";
import { getLedgersForVoucher, getLedgersForCompany } from "@/queries/ledger";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const voucherType = searchParams.get("voucherType");

  if (!companyId) {
    return NextResponse.json({ error: "companyId required" }, { status: 400 });
  }

  try {
    if (voucherType) {
      const [debitLedgers, creditLedgers] = await Promise.all([
        getLedgersForVoucher(companyId, voucherType, "debit"),
        getLedgersForVoucher(companyId, voucherType, "credit"),
      ]);

      return NextResponse.json({
        debit: debitLedgers.map((l) => ({
          id: l.id,
          name: l.name,
          groupName: l.group?.name ?? "Unknown",
        })),
        credit: creditLedgers.map((l) => ({
          id: l.id,
          name: l.name,
          groupName: l.group?.name ?? "Unknown",
        })),
      });
    }

    const ledgers = await getLedgersForCompany(companyId);
    return NextResponse.json(
      ledgers.map((l) => ({
        id: l.id,
        name: l.name,
        groupName: l.group?.name ?? "Unknown",
      }))
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch ledgers" },
      { status: 500 }
    );
  }
}
