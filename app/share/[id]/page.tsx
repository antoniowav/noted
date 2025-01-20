import { connectToDatabase } from "@/lib/mongodb";
import { Note } from "@/lib/models/note";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { NoteType } from "@/types";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

async function getNote(shareId: string) {
  await connectToDatabase();
  return (await Note.findOne({
    shareId,
    shared: true,
  }).lean()) as unknown as NoteType;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { id } = await props.params;
  const note = await getNote(id);

  if (!note) {
    return { title: "Note Not Found" };
  }

  return {
    title: note.title,
    description: note.content.slice(0, 160),
  };
}

export default async function SharePage(props: Props) {
  const { id } = await props.params;
  const note = await getNote(id);

  if (!note) {
    notFound();
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-10">
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">{note.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Shared{" "}
              {formatDistanceToNow(new Date(note.createdAt || Date.now()), {
                addSuffix: true,
              })}
            </p>
          </div>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {note.content}
          </p>
        </div>
        <div className="border-t pt-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              Create Your Own Notes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
