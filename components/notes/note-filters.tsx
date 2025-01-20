"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";

interface NoteFiltersProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string | null) => void;
  onTagSelect: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  availableTags: string[];
  selectedTags: string[];
}

export function NoteFilters({
  onSearch,
  onCategoryChange,
  onTagRemove,
  selectedTags,
}: NoteFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: categoriesData = [] } = useCategories();

  return (
    <div className="space-y-4 mb-6">
      <Input
        placeholder="Search notes..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          onSearch(e.target.value);
        }}
        className="w-full"
      />
      <div className="flex gap-4">
        <Select
          onValueChange={(value) =>
            onCategoryChange(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoriesData.map((category: string) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onTagRemove(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
