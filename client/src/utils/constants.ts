/* ── Transaction Categories ── */

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Business",
  "Rental",
  "Other",
] as const;

export const EXPENSE_CATEGORIES = [
  "Rent",
  "Utilities",
  "Salaries",
  "Supplies",
  "Marketing",
  "Travel",
  "Software",
  "Equipment",
  "Insurance",
  "Other",
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

/* ── Roles ── */

export const ROLES = ["owner", "admin", "member"] as const;
export type Role = (typeof ROLES)[number];

/* ── Pagination ── */

export const DEFAULT_PAGE_SIZE = 20;

/* ── Route Paths ── */

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  INCOME: "/income",
  EXPENSES: "/expenses",
  USERS: "/users",
  SETTINGS: "/settings",
} as const;
