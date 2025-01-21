import { prisma } from "@/lib/prisma";

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

    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          categories: DEFAULT_CATEGORIES,
        },
      });
    }
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addDefaultCategories();
