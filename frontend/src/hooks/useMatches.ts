import { useQuery } from "@tanstack/react-query";
import { MOCK_MATCH_RESULTS } from "@/lib/mockData";
import { MatchScore } from "@/types";

export function useMatches(candidateId: string | null) {
  return useQuery<MatchScore[]>({
    queryKey: ["matches", candidateId],
    queryFn: async () => {
      if (!candidateId) return [];
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return MOCK_MATCH_RESULTS[candidateId] || [];
    },
    enabled: !!candidateId,
  });
}
