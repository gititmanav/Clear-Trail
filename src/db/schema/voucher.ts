import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  numeric,
  date,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { companies, financialYears } from "./company";
import { ledgers } from "./ledger";
import { user } from "./auth";
import { voucherTypeEnum, entryTypeEnum, billTypeEnum } from "./enums";

export const vouchers = pgTable("vouchers", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  financialYearId: uuid("financial_year_id")
    .notNull()
    .references(() => financialYears.id),
  voucherType: voucherTypeEnum("voucher_type").notNull(),
  voucherNumber: text("voucher_number").notNull(),
  date: date("date").notNull(),
  referenceNumber: text("reference_number"),
  narration: text("narration"),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).default(
    "0"
  ),
  createdBy: text("created_by").references(() => user.id),
  isCancelled: boolean("is_cancelled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const voucherEntries = pgTable(
  "voucher_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    voucherId: uuid("voucher_id")
      .notNull()
      .references(() => vouchers.id, { onDelete: "cascade" }),
    ledgerId: uuid("ledger_id")
      .notNull()
      .references(() => ledgers.id),
    entryType: entryTypeEnum("entry_type").notNull(),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [index("voucher_entries_ledger_idx").on(table.ledgerId)]
);

export const billAllocations = pgTable("bill_allocations", {
  id: uuid("id").primaryKey().defaultRandom(),
  voucherEntryId: uuid("voucher_entry_id")
    .notNull()
    .references(() => voucherEntries.id, { onDelete: "cascade" }),
  billType: billTypeEnum("bill_type").notNull(),
  billName: text("bill_name"),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const voucherSequences = pgTable(
  "voucher_sequences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    financialYearId: uuid("financial_year_id")
      .notNull()
      .references(() => financialYears.id),
    voucherType: voucherTypeEnum("voucher_type").notNull(),
    prefix: text("prefix").default(""),
    lastNumber: integer("last_number").default(0),
  },
  (table) => [
    uniqueIndex("voucher_sequences_unique_idx").on(
      table.companyId,
      table.financialYearId,
      table.voucherType
    ),
  ]
);

// Relations

export const vouchersRelations = relations(vouchers, ({ one, many }) => ({
  company: one(companies, {
    fields: [vouchers.companyId],
    references: [companies.id],
  }),
  financialYear: one(financialYears, {
    fields: [vouchers.financialYearId],
    references: [financialYears.id],
  }),
  creator: one(user, {
    fields: [vouchers.createdBy],
    references: [user.id],
  }),
  entries: many(voucherEntries),
}));

export const voucherEntriesRelations = relations(
  voucherEntries,
  ({ one, many }) => ({
    voucher: one(vouchers, {
      fields: [voucherEntries.voucherId],
      references: [vouchers.id],
    }),
    ledger: one(ledgers, {
      fields: [voucherEntries.ledgerId],
      references: [ledgers.id],
    }),
    billAllocations: many(billAllocations),
  })
);

export const billAllocationsRelations = relations(
  billAllocations,
  ({ one }) => ({
    voucherEntry: one(voucherEntries, {
      fields: [billAllocations.voucherEntryId],
      references: [voucherEntries.id],
    }),
  })
);

export const voucherSequencesRelations = relations(
  voucherSequences,
  ({ one }) => ({
    company: one(companies, {
      fields: [voucherSequences.companyId],
      references: [companies.id],
    }),
    financialYear: one(financialYears, {
      fields: [voucherSequences.financialYearId],
      references: [financialYears.id],
    }),
  })
);
