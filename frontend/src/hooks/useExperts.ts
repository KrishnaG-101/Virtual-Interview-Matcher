import { useQuery } from "@tanstack/react-query";
import { MOCK_EXPERTS } from "@/lib/mockData";
import { Expert } from "@/types";

export function useExperts() {
  return useQuery<Expert[]>({
    queryKey: ["experts"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return MOCK_EXPERTS;
    },
  });
}
