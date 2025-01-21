import { prisma } from "@/lib/prisma";

const DEFAULT_CATEGORIES = ["personal", "work", "ideas", "tasks"];

async function main() {
  try {
    const users = await prisma.user.findMany();

    for (const user of users) {
      const notes = await prisma.note.findMany({
        where: { userId: user.id },
        select: { category: true },
      });

      if (!notes.some((note) => note.category)) {
        await prisma.note.updateMany({
          where: { userId: user.id },
          data: { category: DEFAULT_CATEGORIES[0] },
        });
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
