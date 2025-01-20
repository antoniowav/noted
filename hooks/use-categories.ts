import { useQuery, useQueryClient } from "@tanstack/react-query";

async function getCategories() {
  const response = await fetch("/api/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  const data = await response.json();
  return data.data;
}

export function useCategories() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60, // Consider data fresh for 1 minute
    gcTime: 1000 * 60 * 5, // Keep data in cache for 5 minutes
  });

  return {
    ...query,
    queryClient,
    mutate: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  };
}
