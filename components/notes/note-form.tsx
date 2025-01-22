"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useCategories } from "@/hooks/use-categories";
import { useNotes } from "@/hooks/use-notes";
import { toast } from "sonner";

export function NoteForm() {
  const { data: session } = useSession();
  const { data: categories = [] } = useCategories();
  const { mutate } = useNotes();
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState<string>("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        body: JSON.stringify({
          title: formData.get("title"),
          content: formData.get("content"),
          userId: session?.user?.id,
          category,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        form.reset();
        setCategory("");
        await mutate();
        toast.success("Note created successfully");
      } else {
        throw new Error("Failed to create note");
      }
    } catch (error) {
      console.error("Failed to create note:", error);
      toast.error("Failed to create note");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={onSubmit}
      className="rounded-xl border bg-gradient-to-b from-card to-card/50 p-6 shadow-lg space-y-4 hover:shadow-xl transition-all duration-300"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
          Create New Note
        </h2>
        <p className="text-sm text-muted-foreground/80">
          Add a new note to your collection.
        </p>
      </div>
      <div className="space-y-4">
        <Input
          name="title"
          placeholder="Note title"
          required
          className="text-lg font-medium focus:ring-2 focus:ring-primary"
        />
        <Textarea
          name="content"
          placeholder="Write your note here..."
          required
          rows={5}
          className="resize-y min-h-[100px] max-h-[400px] focus:ring-2 focus:ring-primary"
        />
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Select category</option>
          {categories.map((category: string) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="pt-2">
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-primary/80"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Note"}
        </Button>
      </div>
    </motion.form>
  );
}
