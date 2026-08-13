import { z } from "zod";

export const createNotificationSchema = z.object({
  userId: z.string().optional(),
  title: z.string().min(1, "กรุณาระบุหัวข้อการแจ้งเตือน"),
  message: z.string().min(1, "กรุณาระบุข้อความการแจ้งเตือน"),
});

export const markNotificationReadSchema = z.object({
  notificationId: z.string().min(1, "กรุณาระบุรหัสการแจ้งเตือน"),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type MarkNotificationReadInput = z.infer<typeof markNotificationReadSchema>;
