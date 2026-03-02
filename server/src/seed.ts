import mongoose from "mongoose";
import { config } from "dotenv";
import { Company } from "./models/Company.js";
import { User } from "./models/User.js";
import { Transaction } from "./models/Transaction.js";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "./utils/constants.js";

config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI not set in .env");
  process.exit(1);
}

/* ── Helpers ── */

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDate(monthsBack: number): Date {
  const now = new Date();
  const past = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  const diff = now.getTime() - past.getTime();
  return new Date(past.getTime() + Math.random() * diff);
}

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/* ── Seed ── */

async function seed() {
  console.log("🌱 Seeding ClearTrail database...\n");

  await mongoose.connect(MONGO_URI!);
  console.log("   Connected to MongoDB");

  // Clear existing data
  await Promise.all([
    Company.deleteMany({}),
    User.deleteMany({}),
    Transaction.deleteMany({}),
  ]);
  console.log("   Cleared existing data");

  // Create company
  const company = await Company.create({ name: "ClearTrail Demo Co." });
  console.log(`   Created company: ${company.name}`);

  // Create users
  const usersData = [
    { name: "Manav Kaneria", email: "manav@cleartrail.io", password: "password123", role: "owner" as const },
    { name: "Alex Johnson", email: "alex@cleartrail.io", password: "password123", role: "admin" as const },
    { name: "Priya Sharma", email: "priya@cleartrail.io", password: "password123", role: "member" as const },
    { name: "James Wilson", email: "james@cleartrail.io", password: "password123", role: "member" as const },
  ];

  const users = await User.create(
    usersData.map((u) => ({ ...u, companyId: company._id }))
  );
  console.log(`   Created ${users.length} users`);

  // Create transactions
  const incomeDescriptions = [
    "Client payment - Project Alpha",
    "Monthly retainer - Acme Corp",
    "Consulting fee",
    "Product license renewal",
    "Workshop facilitation",
    "Annual subscription revenue",
    "Freelance design work",
    "Commission payment",
    "Royalty income",
    "Service contract Q1",
  ];

  const expenseDescriptions = [
    "Office rent - March",
    "AWS hosting charges",
    "Team lunch meeting",
    "Software license - Figma",
    "Travel to client site",
    "Google Workspace subscription",
    "Office supplies restock",
    "Marketing campaign - LinkedIn",
    "Insurance premium",
    "Equipment purchase - monitors",
  ];

  const transactions = [];

  // Generate 200 income transactions across 6 months
  for (let i = 0; i < 200; i++) {
    transactions.push({
      type: "income" as const,
      amount: randomBetween(500, 15000),
      category: randomItem(INCOME_CATEGORIES),
      description: randomItem(incomeDescriptions),
      date: randomDate(6),
      userId: randomItem(users)._id,
      companyId: company._id,
    });
  }

  // Generate 250 expense transactions across 6 months
  for (let i = 0; i < 250; i++) {
    transactions.push({
      type: "expense" as const,
      amount: randomBetween(50, 8000),
      category: randomItem(EXPENSE_CATEGORIES),
      description: randomItem(expenseDescriptions),
      date: randomDate(6),
      userId: randomItem(users)._id,
      companyId: company._id,
    });
  }

  await Transaction.insertMany(transactions);
  console.log(`   Created ${transactions.length} transactions (200 income, 250 expense)`);

  // Summary
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  console.log(`\n✅ Seed complete!`);
  console.log(`   Total income:   $${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
  console.log(`   Total expenses: $${totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
  console.log(`   Net balance:    $${(totalIncome - totalExpense).toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
  console.log(`\n   Login with: manav@cleartrail.io / password123\n`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
