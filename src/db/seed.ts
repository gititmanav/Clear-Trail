import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Please set it in your .env file.");
    process.exit(1);
  }

  console.log("Connecting to database...");
  const sql = postgres(databaseUrl);
  const db = drizzle(sql, { schema });

  try {
    // Verify connection by running a simple query
    await sql`SELECT 1`;
    console.log("Database connection successful.");

    // Tables should already exist via drizzle-kit push/migrate.
    // This seed script is a placeholder for seeding initial data if needed.
    console.log(
      "Tables are managed via drizzle-kit. Run `npm run db:push` to create/update tables."
    );

    console.log("Seed completed successfully.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seed();
