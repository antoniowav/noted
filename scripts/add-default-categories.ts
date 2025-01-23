import { db } from "@/lib/db";

const DEFAULT_CATEGORIES = ["personal", "work", "ideas", "tasks"];

async function main() {
  try {
    const users = await db.collection("users").find({}).toArray();

    for (const user of users) {
      await db
        .collection("users")
        .updateOne(
          { _id: user._id },
          { $set: { categories: DEFAULT_CATEGORIES } }
        );
    }

    console.log("Default categories added successfully");
  } catch (error) {
    console.error("Error adding default categories:", error);
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
