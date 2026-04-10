import { useMutation, useQueryClient } from "@tanstack/react-query";

interface OverrideParams {
  matchId: string;
  expertId: string;
  reason: string;
}

export function useOverrideMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ matchId, expertId, reason }: OverrideParams) => {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
  });
}
