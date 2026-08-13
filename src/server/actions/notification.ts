"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/server/permissions/guard";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ----------------------------------------------------
// Action 1: Get Notifications & Unread Count
// ----------------------------------------------------
export async function getNotificationsAction(): Promise<
  ActionResult<{ notifications: any[]; unreadCount: number }>
> {
  try {
    const session = await requireAuth();

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ userId: session.userId }, { userId: null }],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงรายการแจ้งเตือนได้" };
  }
}

// ----------------------------------------------------
// Action 2: Mark Notification as Read
// ----------------------------------------------------
export async function markAsReadAction(notificationId: string): Promise<ActionResult<any>> {
  try {
    await requireAuth();

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    revalidatePath("/notifications");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถอัปเดตสถานะอ่านแล้วได้" };
  }
}

// ----------------------------------------------------
// Action 3: Mark All Notifications as Read
// ----------------------------------------------------
export async function markAllAsReadAction(): Promise<ActionResult<any>> {
  try {
    const session = await requireAuth();

    await prisma.notification.updateMany({
      where: {
        OR: [{ userId: session.userId }, { userId: null }],
        isRead: false,
      },
      data: { isRead: true },
    });

    revalidatePath("/notifications");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถทำเครื่องหมายอ่านแล้วทั้งหมดได้" };
  }
}

// ----------------------------------------------------
// Action 4: Auto-Generate Low Stock, Expiry & Appointment Alerts
// ----------------------------------------------------
export async function generateSystemAlertsAction(): Promise<ActionResult<{ createdCount: number }>> {
  try {
    await requireAuth();
    let createdCount = 0;

    // 1. Check Low Stock Drugs (Total Stock <= 10)
    const lowStockDrugs = await prisma.drug.findMany({
      where: {
        totalStock: { lte: 10 },
      },
    });

    for (const drug of lowStockDrugs) {
      const drugName = drug.tradeName || drug.genericName;
      const existing = await prisma.notification.findFirst({
        where: {
          title: `แจ้งเตือนยาสต็อกต่ำ: ${drugName}`,
          isRead: false,
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            title: `แจ้งเตือนยาสต็อกต่ำ: ${drugName}`,
            message: `ยา ${drugName} คงเหลือเพียง ${drug.totalStock} ${drug.unit} โปรดสั่งซื้อเติมคลัง`,
          },
        });
        createdCount++;
      }
    }

    // 2. Check Upcoming Appointments Today & Tomorrow
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date();
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: startOfToday,
          lte: endOfTomorrow,
        },
        status: "SCHEDULED",
      },
      include: { patient: true },
    });

    for (const appt of upcomingAppointments) {
      const title = `แจ้งเตือนนัดหมายผู้ป่วย: ${appt.patient.firstName} ${appt.patient.lastName}`;
      const existing = await prisma.notification.findFirst({
        where: { title, isRead: false },
      });

      if (!existing) {
        const apptDateStr = new Date(appt.appointmentDate).toLocaleString("th-TH");
        await prisma.notification.create({
          data: {
            title,
            message: `ผู้ป่วย ${appt.patient.firstName} ${appt.patient.lastName} (HN: ${appt.patient.hn}) มีนัดหมายวันที่ ${apptDateStr}`,
          },
        });
        createdCount++;
      }
    }

    revalidatePath("/notifications");
    return { success: true, data: { createdCount } };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถประมวลผลแจ้งเตือนระบบได้" };
  }
}
