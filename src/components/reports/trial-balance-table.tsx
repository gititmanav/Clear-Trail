"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, CheckCircle2, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface TrialBalanceLedger {
  id: string;
  name: string;
  openingDr: number;
  openingCr: number;
  debits: number;
  credits: number;
  closingDr: number;
  closingCr: number;
}

interface TrialBalanceGroup {
  group: {
    id: string;
    name: string;
    nature: string;
  };
  ledgers: TrialBalanceLedger[];
  subtotalDr: number;
  subtotalCr: number;
}

interface TrialBalanceData {
  groups: TrialBalanceGroup[];
  totalDr: number;
  totalCr: number;
}

export function TrialBalanceTable({ data }: { data: TrialBalanceData }) {
  const isBalanced =
    Math.abs(data.totalDr - data.totalCr) < 0.01;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isBalanced ? (
            <div className="flex items-center gap-2 rounded-full bg-success-50 px-3 py-1.5 text-xs font-medium text-success-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Trial Balance is balanced
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-full bg-danger-50 px-3 py-1.5 text-xs font-medium text-danger-700">
              <XCircle className="h-3.5 w-3.5" />
              Difference: {formatCurrency(Math.abs(data.totalDr - data.totalCr))}
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" disabled>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-50">
                <TableHead className="w-[45%]">Particulars</TableHead>
                <TableHead className="w-[27.5%] text-right">
                  Debit ({"\u20B9"})
                </TableHead>
                <TableHead className="w-[27.5%] text-right">
                  Credit ({"\u20B9"})
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.groups.map((group) => (
                <GroupRows key={group.group.id} group={group} />
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-surface-900 text-white hover:bg-surface-900">
                <TableCell className="font-bold text-white">
                  Grand Total
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums font-bold text-white">
                  {formatCurrency(data.totalDr)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums font-bold text-white">
                  {formatCurrency(data.totalCr)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function GroupRows({ group }: { group: TrialBalanceGroup }) {
  return (
    <>
      {/* Group header */}
      <TableRow className="bg-surface-100 hover:bg-surface-100">
        <TableCell
          colSpan={3}
          className="font-semibold text-surface-700 text-sm"
        >
          {group.group.name}
        </TableCell>
      </TableRow>

      {/* Ledger rows */}
      {group.ledgers.map((ledger, idx) => (
        <TableRow
          key={ledger.id}
          className={idx % 2 === 0 ? "bg-white" : "bg-surface-50/50"}
        >
          <TableCell className="pl-8">
            <Link
              href={`/reports/ledger/${ledger.id}`}
              className="text-sm text-brand-600 hover:text-brand-700 hover:underline transition-colors"
            >
              {ledger.name}
            </Link>
          </TableCell>
          <TableCell className="text-right font-mono tabular-nums text-sm">
            {ledger.closingDr > 0
              ? formatCurrency(ledger.closingDr)
              : ""}
          </TableCell>
          <TableCell className="text-right font-mono tabular-nums text-sm">
            {ledger.closingCr > 0
              ? formatCurrency(ledger.closingCr)
              : ""}
          </TableCell>
        </TableRow>
      ))}

      {/* Group subtotal */}
      <TableRow className="border-t-2 border-surface-200 hover:bg-surface-50">
        <TableCell className="pl-8 text-sm font-medium text-surface-600 italic">
          Subtotal - {group.group.name}
        </TableCell>
        <TableCell className="text-right font-mono tabular-nums text-sm font-medium">
          {group.subtotalDr > 0 ? formatCurrency(group.subtotalDr) : ""}
        </TableCell>
        <TableCell className="text-right font-mono tabular-nums text-sm font-medium">
          {group.subtotalCr > 0 ? formatCurrency(group.subtotalCr) : ""}
        </TableCell>
      </TableRow>
    </>
  );
}
