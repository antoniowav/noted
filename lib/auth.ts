import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const DEFAULT_CATEGORIES = ["personal", "work", "ideas", "tasks"];

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Add default categories if user doesn't have any
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
        select: { categories: true },
      });

      if (!dbUser?.categories?.length) {
        await prisma.user.update({
          where: { email: user.email! },
          data: { categories: DEFAULT_CATEGORIES },
        });
      }

      return true;
    },
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  pages: {
    signIn: "/login",
  },
};
