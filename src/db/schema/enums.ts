import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "owner",
  "admin",
  "member",
]);

export const voucherTypeEnum = pgEnum("voucher_type", [
  "purchase",
  "sales",
  "payment",
  "receipt",
  "journal",
  "contra",
  "credit_note",
  "debit_note",
]);

export const entryTypeEnum = pgEnum("entry_type", ["debit", "credit"]);

export const billTypeEnum = pgEnum("bill_type", [
  "new_ref",
  "against_ref",
  "advance",
]);

export const groupNatureEnum = pgEnum("group_nature", [
  "assets",
  "liabilities",
  "income",
  "expenses",
]);
