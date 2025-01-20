import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NoteList } from "@/components/notes/note-list";
import { NoteForm } from "@/components/notes/note-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserMenu } from "@/components/user-menu";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 md:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">noted.</h1>
          <p className="text-muted-foreground">
            Create, edit and manage your notes in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <UserMenu />
          <Link href="/settings">
            <Button variant="outline" size="sm">
              Settings
            </Button>
          </Link>
          <form action="/api/auth/signout" method="POST">
            <Button variant="destructive" size="sm">
              Sign Out
            </Button>
          </form>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[350px_1fr]">
        <div className="h-fit lg:sticky lg:top-10">
          <NoteForm />
        </div>
        <NoteList />
      </div>
    </div>
  );
}
