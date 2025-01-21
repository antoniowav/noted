import { useQuery } from "@tanstack/react-query";
import type { NoteType } from "@/types";

async function getNotes() {
  const res = await fetch("/api/notes");
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

export function useNotes() {
  return useQuery<{ data: NoteType[] }>({
    queryKey: ["notes"],
    queryFn: getNotes,
  });
}
