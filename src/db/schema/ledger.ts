import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  boolean,
  integer,
  numeric,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { companies } from "./company";
import { groupNatureEnum, entryTypeEnum } from "./enums";

export const ledgerGroups = pgTable(
  "ledger_groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    name: text("name").notNull(),
    parentId: uuid("parent_id"),
    nature: groupNatureEnum("nature").notNull(),
    isPrimary: boolean("is_primary").default(false),
    affectsGrossProfit: boolean("affects_gross_profit").default(false),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("ledger_groups_company_name_idx").on(
      table.companyId,
      table.name
    ),
  ]
);

export const ledgers = pgTable(
  "ledgers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    groupId: uuid("group_id")
      .notNull()
      .references(() => ledgerGroups.id),
    name: text("name").notNull(),
    openingBalance: numeric("opening_balance", {
      precision: 15,
      scale: 2,
    }).default("0"),
    openingBalanceType: entryTypeEnum("opening_balance_type").default("debit"),
    address: text("address"),
    gstin: varchar("gstin", { length: 15 }),
    pan: varchar("pan", { length: 10 }),
    phone: varchar("phone", { length: 15 }),
    email: varchar("email", { length: 100 }),
    state: text("state"),
    pincode: varchar("pincode", { length: 10 }),
    creditPeriodDays: integer("credit_period_days"),
    creditLimit: numeric("credit_limit", { precision: 15, scale: 2 }),
    bankName: text("bank_name"),
    accountNumber: varchar("account_number", { length: 30 }),
    ifscCode: varchar("ifsc_code", { length: 15 }),
    branchName: text("branch_name"),
    taxType: varchar("tax_type", { length: 30 }),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 }),
    isBillwise: boolean("is_billwise").default(false),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("ledgers_company_name_idx").on(table.companyId, table.name),
  ]
);

// Relations

export const ledgerGroupsRelations = relations(
  ledgerGroups,
  ({ one, many }) => ({
    company: one(companies, {
      fields: [ledgerGroups.companyId],
      references: [companies.id],
    }),
    parent: one(ledgerGroups, {
      fields: [ledgerGroups.parentId],
      references: [ledgerGroups.id],
      relationName: "parentChild",
    }),
    children: many(ledgerGroups, { relationName: "parentChild" }),
    ledgers: many(ledgers),
  })
);

export const ledgersRelations = relations(ledgers, ({ one }) => ({
  company: one(companies, {
    fields: [ledgers.companyId],
    references: [companies.id],
  }),
  group: one(ledgerGroups, {
    fields: [ledgers.groupId],
    references: [ledgerGroups.id],
  }),
}));
