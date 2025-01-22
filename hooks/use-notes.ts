import useSWR from "swr";
import type { NoteType } from "@/types";

async function fetchNotes() {
  const res = await fetch("/api/notes");
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

export function useNotes() {
  const { data, error, isLoading, mutate } = useSWR<{ data: NoteType[] }>(
    "/api/notes",
    fetchNotes
  );
  return { data, error, isLoading, mutate };
}
