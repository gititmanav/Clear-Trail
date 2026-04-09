export type VoucherTypeConfig = {
  label: string;
  description: string;
  shortcut: string;
  color: string;
  icon: string;
  debitGroups: string[] | null;
  creditGroups: string[] | null;
  debitExcludeGroups: string[] | null;
  creditExcludeGroups: string[] | null;
};

export const VOUCHER_TYPE_CONFIG: Record<string, VoucherTypeConfig> = {
  purchase: {
    label: "Purchase",
    description: "Record purchase of goods or services",
    shortcut: "F9",
    color: "text-orange-600",
    icon: "ShoppingCart",
    debitGroups: [
      "Purchase Accounts",
      "Direct Expenses",
      "Indirect Expenses",
      "Fixed Assets",
      "Duties & Taxes",
    ],
    creditGroups: [
      "Sundry Creditors",
      "Cash-in-Hand",
      "Bank Accounts",
      "Duties & Taxes",
    ],
    debitExcludeGroups: null,
    creditExcludeGroups: null,
  },
  sales: {
    label: "Sales",
    description: "Record sale of goods or services",
    shortcut: "F8",
    color: "text-green-600",
    icon: "IndianRupee",
    debitGroups: [
      "Sundry Debtors",
      "Cash-in-Hand",
      "Bank Accounts",
      "Duties & Taxes",
    ],
    creditGroups: [
      "Sales Accounts",
      "Direct Incomes",
      "Indirect Incomes",
      "Duties & Taxes",
    ],
    debitExcludeGroups: null,
    creditExcludeGroups: null,
  },
  payment: {
    label: "Payment",
    description: "Record payment made",
    shortcut: "F5",
    color: "text-red-600",
    icon: "ArrowUpRight",
    debitGroups: null,
    creditGroups: ["Cash-in-Hand", "Bank Accounts"],
    debitExcludeGroups: ["Cash-in-Hand", "Bank Accounts"],
    creditExcludeGroups: null,
  },
  receipt: {
    label: "Receipt",
    description: "Record payment received",
    shortcut: "F6",
    color: "text-blue-600",
    icon: "ArrowDownLeft",
    debitGroups: ["Cash-in-Hand", "Bank Accounts"],
    creditGroups: null,
    debitExcludeGroups: null,
    creditExcludeGroups: ["Cash-in-Hand", "Bank Accounts"],
  },
  contra: {
    label: "Contra",
    description: "Transfer between cash and bank accounts",
    shortcut: "F4",
    color: "text-purple-600",
    icon: "ArrowLeftRight",
    debitGroups: ["Cash-in-Hand", "Bank Accounts"],
    creditGroups: ["Cash-in-Hand", "Bank Accounts"],
    debitExcludeGroups: null,
    creditExcludeGroups: null,
  },
  journal: {
    label: "Journal",
    description: "General journal entry for adjustments",
    shortcut: "F7",
    color: "text-gray-600",
    icon: "BookOpen",
    debitGroups: null,
    creditGroups: null,
    debitExcludeGroups: null,
    creditExcludeGroups: null,
  },
  credit_note: {
    label: "Credit Note",
    description: "Record sales return or allowance",
    shortcut: "Ctrl+F8",
    color: "text-amber-600",
    icon: "ReceiptText",
    debitGroups: ["Sales Accounts", "Duties & Taxes"],
    creditGroups: ["Sundry Debtors"],
    debitExcludeGroups: null,
    creditExcludeGroups: null,
  },
  debit_note: {
    label: "Debit Note",
    description: "Record purchase return or allowance",
    shortcut: "Ctrl+F9",
    color: "text-teal-600",
    icon: "FileText",
    debitGroups: ["Sundry Creditors"],
    creditGroups: ["Purchase Accounts", "Duties & Taxes"],
    debitExcludeGroups: null,
    creditExcludeGroups: null,
  },
};
