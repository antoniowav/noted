"use client";

import type { NoteType } from "@/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { DeleteNoteDialog } from "./delete-note-dialog";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/hooks/use-categories";
import { LinkIcon, PencilIcon, TrashIcon } from "lucide-react";

interface NoteCardProps {
  note: NoteType;
  onUpdate: () => void;
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function NoteCard({ note, onUpdate }: NoteCardProps) {
  const { data: categories = [] } = useCategories();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string>("");

  async function handleDelete() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes/${note._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Note deleted successfully");
        onUpdate();
      } else {
        throw new Error("Failed to delete note");
      }
    } catch {
      toast.error("Failed to delete note", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(`/api/notes/${note._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: formData.get("title"),
          content: formData.get("content"),
          category: editingCategory,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to update note:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleShare() {
    try {
      if (note.shareId) {
        // If already shared, just copy the link
        const shareUrl = `${window.location.origin}/share/${note.shareId}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard", {
          description:
            "Share this link with others to let them view your note.",
        });
        return;
      }

      // If not shared, create share link
      const response = await fetch(`/api/notes/${note._id}/share`, {
        method: "POST",
        credentials: "include",
      });

      const { data } = await response.json();

      if (response.ok && data?.shareId) {
        const shareUrl = `${window.location.origin}/share/${data.shareId}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard", {
          description:
            "Share this link with others to let them view your note.",
        });
        onUpdate(); // Update the note to get the new shareId
      }
    } catch {
      toast.error("Failed to share note", {
        description: "Please try again later.",
      });
    }
  }

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-card p-6 shadow-lg space-y-6 hover:shadow-xl transition-shadow"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Input
              name="title"
              defaultValue={note.title}
              placeholder="Note title"
              required
              className="text-lg font-medium focus:ring-2 focus:ring-primary"
            />
            <Textarea
              name="content"
              defaultValue={note.content}
              placeholder="Write your note here..."
              required
              rows={5}
              className="resize-y min-h-[100px] max-h-[400px] focus:ring-2 focus:ring-primary"
            />
            <select
              name="category"
              value={editingCategory}
              onChange={(e) => setEditingCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select category</option>
              {categories.map((cat: string) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
              className="hover:bg-muted"
            >
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border bg-gradient-to-b from-card to-card/50 p-6 shadow-lg space-y-6 hover:shadow-xl transition-all duration-300"
      >
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">{note.title}</h2>
            {note.category && (
              <Badge variant="outline" className="mt-2">
                {capitalizeFirstLetter(note.category)}
              </Badge>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Created{" "}
              {formatDistanceToNow(new Date(note.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {note.content}
          </p>
        </div>
        <div className="flex gap-2 pt-4 border-t border-muted/20">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="group relative overflow-hidden hover:bg-primary/10 hover:text-primary transition-all duration-200 w-[90px] hover:w-[120px]"
          >
            <span className="absolute inset-0 w-full h-full flex items-center justify-center transition-all duration-200 group-hover:-translate-x-2">
              {note.shareId ? "Copy Link" : "Share"}
            </span>
            <LinkIcon className="absolute right-3 h-4 w-4 transition-all duration-200 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
            className="group relative overflow-hidden hover:bg-primary/10 hover:text-primary transition-all duration-200 w-[60px] hover:w-[90px]"
          >
            <span className="absolute inset-0 w-full h-full flex items-center justify-center transition-all duration-200 group-hover:-translate-x-2">
              Edit
            </span>
            <PencilIcon className="absolute right-3 h-4 w-4 transition-all duration-200 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isLoading}
            className="group relative overflow-hidden hover:bg-destructive/10 hover:text-destructive ml-auto transition-all duration-200 w-[70px] hover:w-[100px]"
          >
            <span className="absolute inset-0 w-full h-full flex items-center justify-center transition-all duration-200 group-hover:-translate-x-2">
              Delete
            </span>
            <TrashIcon className="absolute right-3 h-4 w-4 transition-all duration-200 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0" />
          </Button>
        </div>
      </motion.div>

      <DeleteNoteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isLoading={isLoading}
      />
    </>
  );
}
