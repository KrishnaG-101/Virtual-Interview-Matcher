import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRunMatching() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (candidateId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: (_, candidateId) => {
      queryClient.invalidateQueries({ queryKey: ["matches", candidateId] });
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });
}
