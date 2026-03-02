/**
 * Shared constants between client and server.
 *
 * NOTE: This file is duplicated in both client and server
 * as source-of-truth reference. Once we move to a proper
 * monorepo tool (turborepo), these can be a shared package.
 */

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

export const ROLES = ["owner", "admin", "member"] as const;
