export type PrimaryLedgerGroup = {
  name: string;
  nature: "assets" | "liabilities" | "income" | "expenses";
  parentName: string | null;
  affectsGrossProfit: boolean;
  sortOrder: number;
};

export const PRIMARY_LEDGER_GROUPS: PrimaryLedgerGroup[] = [
  // Root groups
  {
    name: "Capital Account",
    nature: "liabilities",
    parentName: null,
    affectsGrossProfit: false,
    sortOrder: 1,
  },
  {
    name: "Current Assets",
    nature: "assets",
    parentName: null,
    affectsGrossProfit: false,
    sortOrder: 2,
  },
  {
    name: "Current Liabilities",
    nature: "liabilities",
    parentName: null,
    affectsGrossProfit: false,
    sortOrder: 3,
  },
  {
    name: "Direct Expenses",
    nature: "expenses",
    parentName: null,
    affectsGrossProfit: true,
    sortOrder: 4,
  },
  {
    name: "Direct Incomes",
    nature: "income",
    parentName: null,
    affectsGrossProfit: true,
    sortOrder: 5,
  },
  {
    name: "Fixed Assets",
    nature: "assets",
    parentName: null,
    affectsGrossProfit: false,
    sortOrder: 6,
  },
  {
    name: "Indirect Expenses",
    nature: "expenses",
    parentName: null,
    affectsGrossProfit: false,
    sortOrder: 7,
  },
  {
    name: "Indirect Incomes",
    nature: "income",
    parentName: null,
    affectsGrossProfit: false,
    sortOrder: 8,
  },
  {
    name: "Investments",
    nature: "assets",
    parentName: null,
    affectsGrossProfit: false,
    sortOrder: 9,
  },
  {
    name: "Loans (Liability)",
    nature: "liabilities",
    parentName: null,
    affectsGrossProfit: false,
    sortOrder: 10,
  },
  {
    name: "Loans & Advances (Asset)",
    nature: "assets",
    parentName: null,
    affectsGrossProfit: false,
    sortOrder: 11,
  },
  {
    name: "Miscellaneous Expenses (Asset)",
    nature: "assets",
    parentName: null,
    affectsGrossProfit: false,
    sortOrder: 12,
  },
  {
    name: "Suspense Account",
    nature: "liabilities",
    parentName: null,
    affectsGrossProfit: false,
    sortOrder: 13,
  },
  {
    name: "Branch / Divisions",
    nature: "liabilities",
    parentName: null,
    affectsGrossProfit: false,
    sortOrder: 14,
  },

  // Child groups
  {
    name: "Reserves & Surplus",
    nature: "liabilities",
    parentName: "Capital Account",
    affectsGrossProfit: false,
    sortOrder: 15,
  },
  {
    name: "Sundry Creditors",
    nature: "liabilities",
    parentName: "Current Liabilities",
    affectsGrossProfit: false,
    sortOrder: 16,
  },
  {
    name: "Duties & Taxes",
    nature: "liabilities",
    parentName: "Current Liabilities",
    affectsGrossProfit: false,
    sortOrder: 17,
  },
  {
    name: "Provisions",
    nature: "liabilities",
    parentName: "Current Liabilities",
    affectsGrossProfit: false,
    sortOrder: 18,
  },
  {
    name: "Bank Accounts",
    nature: "assets",
    parentName: "Current Assets",
    affectsGrossProfit: false,
    sortOrder: 19,
  },
  {
    name: "Cash-in-Hand",
    nature: "assets",
    parentName: "Current Assets",
    affectsGrossProfit: false,
    sortOrder: 20,
  },
  {
    name: "Deposits (Asset)",
    nature: "assets",
    parentName: "Current Assets",
    affectsGrossProfit: false,
    sortOrder: 21,
  },
  {
    name: "Stock-in-Hand",
    nature: "assets",
    parentName: "Current Assets",
    affectsGrossProfit: false,
    sortOrder: 22,
  },
  {
    name: "Sundry Debtors",
    nature: "assets",
    parentName: "Current Assets",
    affectsGrossProfit: false,
    sortOrder: 23,
  },
  {
    name: "Bank OD Accounts",
    nature: "liabilities",
    parentName: "Loans (Liability)",
    affectsGrossProfit: false,
    sortOrder: 24,
  },
  {
    name: "Secured Loans",
    nature: "liabilities",
    parentName: "Loans (Liability)",
    affectsGrossProfit: false,
    sortOrder: 25,
  },
  {
    name: "Unsecured Loans",
    nature: "liabilities",
    parentName: "Loans (Liability)",
    affectsGrossProfit: false,
    sortOrder: 26,
  },
  {
    name: "Purchase Accounts",
    nature: "expenses",
    parentName: "Direct Expenses",
    affectsGrossProfit: true,
    sortOrder: 27,
  },
  {
    name: "Sales Accounts",
    nature: "income",
    parentName: "Direct Incomes",
    affectsGrossProfit: true,
    sortOrder: 28,
  },
];
