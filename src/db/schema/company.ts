import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  boolean,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { userRoleEnum } from "./enums";

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  address: text("address"),
  state: text("state"),
  gstin: varchar("gstin", { length: 15 }),
  pan: varchar("pan", { length: 10 }),
  phone: varchar("phone", { length: 15 }),
  email: varchar("email", { length: 100 }),
  currencySymbol: varchar("currency_symbol", { length: 5 }).default("INR"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const financialYears = pgTable("financial_years", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isCurrent: boolean("is_current").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const companyMembers = pgTable(
  "company_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    role: userRoleEnum("role").default("member"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("company_members_company_user_idx").on(
      table.companyId,
      table.userId
    ),
  ]
);

// Relations

export const companiesRelations = relations(companies, ({ many }) => ({
  financialYears: many(financialYears),
  members: many(companyMembers),
}));

export const financialYearsRelations = relations(
  financialYears,
  ({ one }) => ({
    company: one(companies, {
      fields: [financialYears.companyId],
      references: [companies.id],
    }),
  })
);

export const companyMembersRelations = relations(
  companyMembers,
  ({ one }) => ({
    company: one(companies, {
      fields: [companyMembers.companyId],
      references: [companies.id],
    }),
    user: one(user, {
      fields: [companyMembers.userId],
      references: [user.id],
    }),
  })
);
