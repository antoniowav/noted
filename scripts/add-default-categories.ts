import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = ["personal", "work", "ideas", "tasks"];

async function addDefaultCategories() {
  try {
    const users = await prisma.user.findMany({
      where: {
        categories: {
          isEmpty: true,
        },
      },
    });

    console.log(`Found ${users.length} users without categories`);

    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          categories: DEFAULT_CATEGORIES,
        },
      });
      console.log(`Updated categories for user ${user.email}`);
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addDefaultCategories();
