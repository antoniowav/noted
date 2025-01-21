"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCategories } from "@/hooks/use-categories";
import { X } from "lucide-react";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SettingsFormProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [name, setName] = useState(user.name || "");
  const { data: existingCategories = [], queryClient } = useCategories();
  const [newCategory, setNewCategory] = useState("");
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasNameChanged = name !== user.name;

  async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        body: JSON.stringify({ name }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await updateSession();
      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }

  async function addCategory(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        body: JSON.stringify({ category: newCategory.toLowerCase() }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { data, error } = await response.json();

      if (response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        queryClient.setQueryData(["categories"], (_oldData: string[] = []) => [
          ...new Set([...DEFAULT_CATEGORIES, ...data]),
        ]);
        setNewCategory("");
        toast.success("Category added successfully");
      } else {
        setIsShaking(true);
        setNewCategory("");
        setTimeout(() => setIsShaking(false), 500);
        toast.error(error || "Failed to add category");
        inputRef.current?.focus();
      }
    } catch {
      toast.error("Failed to add category");
    }
  }

  async function deleteAccount() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user", {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.href = "/login";
      }
    } catch {
      toast.error("Failed to delete account");
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  }

  function CategoryBadge({ category }: { category: string }) {
    const isDefault = DEFAULT_CATEGORIES.includes(category);
    const { mutate } = useCategories();

    async function handleDelete() {
      try {
        const response = await fetch("/api/categories", {
          method: "DELETE",
          body: JSON.stringify({ name: category }),
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          toast.success("Category deleted");
          mutate();
        }
      } catch {
        toast.error("Failed to delete category");
      }
    }

    return (
      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
        {category}
        {!isDefault && (
          <X
            className="h-3 w-3 cursor-pointer hover:text-destructive"
            onClick={handleDelete}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={updateProfile}>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your profile information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name">Name</label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label>Email</label>
              <Input value={user.email || ""} disabled />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="submit" disabled={isLoading || !hasNameChanged}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete Account
            </Button>
          </CardFooter>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Manage note categories.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="New category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className={cn(
                  isShaking && "animate-shake",
                  "transition-transform"
                )}
              />
              <Button onClick={addCategory}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {existingCategories.map((category) => (
                <CategoryBadge key={category} category={category} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot
              be undone and will permanently delete all your notes and data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteAccount}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
