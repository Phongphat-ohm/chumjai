"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/server/permissions/guard";
import { StationType, UserRole } from "@/generated/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Default Seed Stations
const DEFAULT_STATIONS = [
  { code: "DOC_1", name: "ห้องตรวจแพทย์ 1", stationNumber: 1, type: StationType.DOCTOR },
  { code: "DOC_2", name: "ห้องตรวจแพทย์ 2", stationNumber: 2, type: StationType.DOCTOR },
  { code: "DOC_3", name: "ห้องตรวจแพทย์ 3", stationNumber: 3, type: StationType.DOCTOR },
  { code: "TRIAGE_1", name: "ช่องซักประวัติ 1", stationNumber: 1, type: StationType.TRIAGE },
  { code: "TRIAGE_2", name: "ช่องซักประวัติ 2", stationNumber: 2, type: StationType.TRIAGE },
  { code: "PHARM_1", name: "ช่องจ่ายยา 1", stationNumber: 1, type: StationType.PHARMACY },
  { code: "PHARM_2", name: "ช่องจ่ายยา 2", stationNumber: 2, type: StationType.PHARMACY },
  { code: "CASHIER_1", name: "ช่องการเงิน 1", stationNumber: 1, type: StationType.CASHIER },
  { code: "LAB_1", name: "ห้องปฏิบัติการแล็บ 1", stationNumber: 1, type: StationType.LAB },
];

/**
 * 1. Get All Service Stations (with Auto-Seeding)
 */
export async function getServiceStationsAction(
  type?: StationType
): Promise<ActionResult<any[]>> {
  try {
    await requireAuth();

    // Check count and seed if empty
    const count = await prisma.serviceStation.count();
    if (count === 0) {
      for (const st of DEFAULT_STATIONS) {
        await prisma.serviceStation.create({ data: st });
      }
    }

    const where: any = { isActive: true };
    if (type) {
      where.type = type;
    }

    const stations = await prisma.serviceStation.findMany({
      where,
      orderBy: [{ type: "asc" }, { stationNumber: "asc" }],
      include: {
        activeUser: {
          select: {
            id: true,
            fullName: true,
            role: true,
            username: true,
          },
        },
      },
    });

    return { success: true, data: stations };
  } catch (error: any) {
    console.error("Error in getServiceStationsAction:", error);
    return { success: false, error: error.message || "ไม่สามารถดึงข้อมูลช่องบริการได้" };
  }
}

/**
 * 2. Staff Occupies / Checks-in to a Station (Self-Service)
 */
export async function occupyStationAction(
  stationId: string,
  occupiedUntil?: string
): Promise<ActionResult<any>> {
  try {
    const session = await requireAuth();

    const station = await prisma.serviceStation.findUnique({
      where: { id: stationId },
      include: { activeUser: true },
    });

    if (!station) {
      return { success: false, error: "ไม่พบช่องบริการที่ระบุ" };
    }

    // Availability Check: Must be empty or already occupied by this user
    if (station.activeUserId && station.activeUserId !== session.userId) {
      return {
        success: false,
        error: `ช่องบริการนี้ไม่ว่าง — ${station.activeUser?.fullName || "มีผู้ปฏิบัติงานอื่น"} กำลังใช้งานอยู่`,
      };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Vacate any other station this user is currently in (1 staff = 1 station max)
      await tx.serviceStation.updateMany({
        where: {
          activeUserId: session.userId,
          id: { not: stationId },
          isLocked: false,
        },
        data: {
          activeUserId: null,
          occupiedUntil: null,
        },
      });

      // 2. Occupy this station
      await tx.serviceStation.update({
        where: { id: stationId },
        data: {
          activeUserId: session.userId,
          occupiedUntil: occupiedUntil ? new Date(occupiedUntil) : null,
        },
      });
    });

    revalidatePath("/doctor");
    revalidatePath("/triage");
    revalidatePath("/pharmacy");
    revalidatePath("/queue");
    revalidatePath("/queue/display");
    revalidatePath("/settings/stations");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถเข้าประจำการในช่องนี้ได้" };
  }
}

/**
 * 3. Staff Vacates / Checks-out of a Station (Self-Service)
 */
export async function vacateStationAction(
  stationId: string
): Promise<ActionResult<any>> {
  try {
    const session = await requireAuth();

    const station = await prisma.serviceStation.findUnique({
      where: { id: stationId },
    });

    if (!station) {
      return { success: false, error: "ไม่พบช่องบริการ" };
    }

    // Admin Lock Check
    if (station.isLocked && session.role !== UserRole.ADMIN) {
      return {
        success: false,
        error: "ช่องบริการนี้ถูกล็อกโดยผู้ดูแลระบบ ไม่อนุญาตให้ออกจากห้องเอง กรุณาติดต่อแอดมิน",
      };
    }

    await prisma.serviceStation.update({
      where: { id: stationId },
      data: {
        activeUserId: null,
        occupiedUntil: null,
        isLocked: false,
      },
    });

    revalidatePath("/doctor");
    revalidatePath("/triage");
    revalidatePath("/pharmacy");
    revalidatePath("/queue");
    revalidatePath("/queue/display");
    revalidatePath("/settings/stations");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถออกจากห้องบริการได้" };
  }
}

/**
 * 4. Admin Sets Station Lock Status
 */
export async function adminSetStationLockAction(
  stationId: string,
  isLocked: boolean
): Promise<ActionResult<any>> {
  try {
    await requireRole([UserRole.ADMIN]);

    await prisma.serviceStation.update({
      where: { id: stationId },
      data: { isLocked },
    });

    revalidatePath("/doctor");
    revalidatePath("/triage");
    revalidatePath("/pharmacy");
    revalidatePath("/queue");
    revalidatePath("/queue/display");
    revalidatePath("/settings/stations");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถตั้งค่าล็อกห้องได้" };
  }
}

/**
 * 5. Admin Direct Assignment / Force Vacate
 */
export async function adminAssignStationAction(
  stationId: string,
  userId: string | null,
  occupiedUntil?: string,
  isLocked: boolean = false
): Promise<ActionResult<any>> {
  try {
    await requireRole([UserRole.ADMIN]);

    if (userId) {
      // Clear any other stations this user was in
      await prisma.serviceStation.updateMany({
        where: {
          activeUserId: userId,
          id: { not: stationId },
        },
        data: {
          activeUserId: null,
          occupiedUntil: null,
          isLocked: false,
        },
      });
    }

    await prisma.serviceStation.update({
      where: { id: stationId },
      data: {
        activeUserId: userId,
        occupiedUntil: occupiedUntil ? new Date(occupiedUntil) : null,
        isLocked,
      },
    });

    revalidatePath("/doctor");
    revalidatePath("/triage");
    revalidatePath("/pharmacy");
    revalidatePath("/queue");
    revalidatePath("/queue/display");
    revalidatePath("/settings/stations");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถมอบหมายห้องบริการได้" };
  }
}

/**
 * 6. Create Station Shift Schedule (with Strict No-Overlap Rule)
 */
export async function createStationScheduleAction(data: {
  serviceStationId: string;
  userId: string;
  startTime: string;
  endTime: string;
  isLocked?: boolean;
  notes?: string;
}): Promise<ActionResult<any>> {
  try {
    const session = await requireRole([UserRole.ADMIN]);

    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    if (start >= end) {
      return { success: false, error: "เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด" };
    }

    // 1. Strict Room Overlap Check: No two staff in the same station at the same time
    const roomConflict = await prisma.stationSchedule.findFirst({
      where: {
        serviceStationId: data.serviceStationId,
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
      include: {
        user: true,
        serviceStation: true,
      },
    });

    if (roomConflict) {
      return {
        success: false,
        error: `เวลาซ้อนทับ: ${roomConflict.serviceStation.name} มีตารางเวรของ ${roomConflict.user.fullName} อยู่แล้ว (${new Date(roomConflict.startTime).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} - ${new Date(roomConflict.endTime).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })})`,
      };
    }

    // 2. Strict User Overlap Check: No single staff in multiple stations at the same time
    const userConflict = await prisma.stationSchedule.findFirst({
      where: {
        userId: data.userId,
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
      include: {
        serviceStation: true,
      },
    });

    if (userConflict) {
      return {
        success: false,
        error: `เวลาซ้อนทับ: บุคลากรท่านนี้มีเวรประจำอยู่ที่ ${userConflict.serviceStation.name} ในช่วงเวลาดังกล่าวแล้ว`,
      };
    }

    // 3. Create Schedule Record
    const schedule = await prisma.stationSchedule.create({
      data: {
        serviceStationId: data.serviceStationId,
        userId: data.userId,
        startTime: start,
        endTime: end,
        isLocked: data.isLocked || false,
        notes: data.notes || null,
        createdById: session.userId,
      },
    });

    revalidatePath("/settings/stations");
    return { success: true, data: schedule };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถสร้างตารางเวรได้" };
  }
}

/**
 * 7. Get Station Schedules
 */
export async function getStationSchedulesAction(
  serviceStationId?: string,
  date?: string
): Promise<ActionResult<any[]>> {
  try {
    await requireAuth();

    const where: any = {};
    if (serviceStationId) {
      where.serviceStationId = serviceStationId;
    }

    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      where.startTime = { gte: dayStart, lte: dayEnd };
    }

    const schedules = await prisma.stationSchedule.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
        serviceStation: true,
      },
    });

    return { success: true, data: schedules };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงตารางเวรได้" };
  }
}

/**
 * 8. Delete Station Schedule
 */
export async function deleteStationScheduleAction(
  scheduleId: string
): Promise<ActionResult<any>> {
  try {
    await requireRole([UserRole.ADMIN]);

    await prisma.stationSchedule.delete({
      where: { id: scheduleId },
    });

    revalidatePath("/settings/stations");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถลบตารางเวรได้" };
  }
}

/**
 * 9. Automated Shift Sync Engine (Auto Check-out & Auto Check-in)
 */
export async function syncStationAutoShiftsAction(): Promise<ActionResult<any>> {
  try {
    const now = new Date();

    // A. Auto Check-out stations whose time has expired
    const expiredStations = await prisma.serviceStation.findMany({
      where: {
        activeUserId: { not: null },
        occupiedUntil: { lte: now },
      },
    });

    for (const st of expiredStations) {
      await prisma.serviceStation.update({
        where: { id: st.id },
        data: {
          activeUserId: null,
          occupiedUntil: null,
          isLocked: false,
        },
      });
    }

    // B. Auto Check-in scheduled staff for current active shift
    const activeSchedules = await prisma.stationSchedule.findMany({
      where: {
        startTime: { lte: now },
        endTime: { gt: now },
      },
    });

    for (const sc of activeSchedules) {
      const currentStation = await prisma.serviceStation.findUnique({
        where: { id: sc.serviceStationId },
      });

      if (currentStation && currentStation.activeUserId !== sc.userId) {
        await prisma.serviceStation.update({
          where: { id: sc.serviceStationId },
          data: {
            activeUserId: sc.userId,
            occupiedUntil: sc.endTime,
            isLocked: sc.isLocked,
          },
        });
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Auto-shift sync error" };
  }
}

/**
 * 10. Create New Service Station
 */
export async function createServiceStationAction(data: {
  code: string;
  name: string;
  stationNumber: number;
  type: StationType;
}): Promise<ActionResult<any>> {
  try {
    await requireRole([UserRole.ADMIN]);

    const existing = await prisma.serviceStation.findUnique({
      where: { code: data.code.trim().toUpperCase() },
    });
    if (existing) {
      return { success: false, error: `รหัสช่องบริการ ${data.code} มีอยู่ในระบบแล้ว` };
    }

    const station = await prisma.serviceStation.create({
      data: {
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        stationNumber: data.stationNumber,
        type: data.type,
      },
    });

    revalidatePath("/settings/stations");
    revalidatePath("/settings/schedules");
    return { success: true, data: station };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถสร้างช่องบริการได้" };
  }
}

/**
 * 11. Update Service Station
 */
export async function updateServiceStationAction(
  id: string,
  data: {
    code?: string;
    name?: string;
    stationNumber?: number;
    type?: StationType;
    isActive?: boolean;
  }
): Promise<ActionResult<any>> {
  try {
    await requireRole([UserRole.ADMIN]);

    const station = await prisma.serviceStation.update({
      where: { id },
      data,
    });

    revalidatePath("/settings/stations");
    revalidatePath("/settings/schedules");
    return { success: true, data: station };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถแก้ไขช่องบริการได้" };
  }
}

/**
 * 12. Delete Service Station
 */
export async function deleteServiceStationAction(
  id: string
): Promise<ActionResult<any>> {
  try {
    await requireRole([UserRole.ADMIN]);

    await prisma.serviceStation.delete({
      where: { id },
    });

    revalidatePath("/settings/stations");
    revalidatePath("/settings/schedules");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถลบช่องบริการได้" };
  }
}
