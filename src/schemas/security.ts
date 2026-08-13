import { z } from "zod";

export const securityAuditSchema = z.object({
  action: z.enum(["FULL_SCAN", "CHECK_LOGINS", "CHECK_RBAC"]).default("FULL_SCAN"),
});

export type SecurityAuditInput = z.infer<typeof securityAuditSchema>;
