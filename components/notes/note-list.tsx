"use client";

import { NoteCard } from "./note-card";
import { NoteFilters } from "./note-filters";
import type { NoteType } from "@/types";
import { useEffect, useState, useCallback } from "react";

export function NoteList() {
  const [notes, setNotes] = useState<NoteType[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<NoteType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get unique tags from notes
  const availableTags = Array.from(
    new Set(notes.flatMap((note) => note.tags).filter(Boolean))
  );

  useEffect(() => {
    fetchNotes();
    window.addEventListener("refreshNotes", fetchNotes);
    return () => window.removeEventListener("refreshNotes", fetchNotes);
  }, []);

  const filterNotes = useCallback(() => {
    let filtered = [...notes];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((note) => note.category === selectedCategory);
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((note) =>
        selectedTags.every((tag) => note.tags.includes(tag))
      );
    }

    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

    setFilteredNotes(filtered);
  }, [notes, searchQuery, selectedCategory, selectedTags]);

  useEffect(() => {
    filterNotes();
  }, [filterNotes]);

  async function fetchNotes() {
    const response = await fetch(`/api/notes`, {
      credentials: "include",
    });

    if (!response.ok) return;

    const data = await response.json();
    setNotes(data.data || []);
  }

  const handleTagSelect = (tag: string) => {
    setSelectedTags([...selectedTags, tag]);
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  return (
    <div>
      <NoteFilters
        onSearch={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        onTagSelect={handleTagSelect}
        onTagRemove={handleTagRemove}
        availableTags={availableTags}
        selectedTags={selectedTags}
      />
      <div className="space-y-6">
        {filteredNotes.map((note) => (
          <NoteCard key={note._id} note={note} onUpdate={fetchNotes} />
        ))}
        {filteredNotes.length === 0 && (
          <div className="rounded-xl border bg-card p-8 text-center">
            <p className="text-muted-foreground">No notes found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
