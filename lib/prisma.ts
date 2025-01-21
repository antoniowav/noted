import { PrismaClient as Client } from ".prisma/client";

export const prisma = new Client();
export type PrismaClient = Client;
