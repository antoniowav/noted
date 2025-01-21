import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/types";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

async function getCategories() {
  const res = await fetch("/api/categories");
  const json = (await res.json()) as ApiResponse<string[]>;
  const customCategories = json.data || [];

  // Combine default and custom categories, removing duplicates
  return [...new Set([...DEFAULT_CATEGORIES, ...customCategories])];
}

export function useCategories() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });

  return {
    ...query,
    queryClient,
    mutate: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  };
}
