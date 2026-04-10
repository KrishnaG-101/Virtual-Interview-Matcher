import { useQuery } from "@tanstack/react-query";
import { MOCK_AUDIT_LOGS } from "@/lib/mockData";
import { AuditLogEntry } from "@/types";

export function useAssignmentHistory() {
  return useQuery<AuditLogEntry[]>({
    queryKey: ["history"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 900));
      return MOCK_AUDIT_LOGS;
    },
  });
}
