"use client";

import { useNotes } from "@/hooks/use-notes";
import { NoteCard } from "./note-card";
import { NoteCardSkeleton } from "./note-card-skeleton";
import { useSession } from "next-auth/react";

export function NotesList() {
  const { data: session, status: sessionStatus } = useSession();
  const {
    data: notesData,
    isLoading: isNotesLoading,
    mutate: mutateNotes,
  } = useNotes();

  // Show skeletons while session or notes are loading
  if (sessionStatus === "loading" || isNotesLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <NoteCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Show no notes message if authenticated but no notes
  if (session && (!notesData?.data || notesData.data.length === 0)) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>No notes yet. Create your first note!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notesData?.data?.map((note) => (
        <NoteCard key={note._id} note={note} onUpdate={mutateNotes} />
      ))}
    </div>
  );
}
