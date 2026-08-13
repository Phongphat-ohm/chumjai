import { z } from "zod";

export const reportFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z.enum(["7DAYS", "30DAYS", "MONTH", "ALL"]).default("30DAYS"),
});

export type ReportFilterInput = z.infer<typeof reportFilterSchema>;
