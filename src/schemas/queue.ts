import { z } from "zod";
import { QueueStatus } from "@/generated/client";

export const callQueueSchema = z.object({
  queueId: z.string().min(1, "กรุณาระบุรหัสคิว"),
});

export const updateQueueStatusSchema = z.object({
  queueId: z.string().min(1, "กรุณาระบุรหัสคิว"),
  status: z.nativeEnum(QueueStatus, { required_error: "กรุณาระบุสถานะคิว" }),
});

export const transferQueueSchema = z.object({
  visitId: z.string().min(1, "กรุณาระบุรหัส Visit"),
  targetQueueTypeCode: z.string().min(1, "กรุณาระบุประเภทคิวปลายทาง"),
});

export type CallQueueInput = z.infer<typeof callQueueSchema>;
export type UpdateQueueStatusInput = z.infer<typeof updateQueueStatusSchema>;
export type TransferQueueInput = z.infer<typeof transferQueueSchema>;
