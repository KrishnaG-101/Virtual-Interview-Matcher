import { useQuery } from "@tanstack/react-query";
import { MOCK_CANDIDATES } from "@/lib/mockData";
import { Candidate } from "@/types";

export function useCandidate(id: string | null) {
  return useQuery<Candidate | null>({
    queryKey: ["candidate", id],
    queryFn: async () => {
      if (!id) return null;
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_CANDIDATES.find((c) => c.id === id) || null;
    },
    enabled: !!id,
  });
}
