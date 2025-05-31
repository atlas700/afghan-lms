import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { CategoryTable } from "./schema";

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  try {
    await db
      .insert(CategoryTable)
      .values([
        { name: "Computer Science" },
        { name: "Music" },
        { name: "Fitness" },
        { name: "Photography" },
        { name: "Accounting" },
        { name: "Engineering" },
        { name: "Filming" },
      ]);

    console.log("Success");
  } catch (error) {
    console.log("Error seeding the database categories", error);
  }
}

await main();
