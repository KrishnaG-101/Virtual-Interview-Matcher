import { useQuery } from "@tanstack/react-query";
import { MOCK_CANDIDATES } from "@/lib/mockData";
import { Candidate } from "@/types";

export function useCandidates() {
  return useQuery<Candidate[]>({
    queryKey: ["candidates"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      return MOCK_CANDIDATES;
    },
  });
}
