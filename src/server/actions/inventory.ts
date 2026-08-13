"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/permissions/guard";
import { createDrugSchema, stockInSchema, adjustStockSchema } from "@/schemas/inventory";
import { InventoryTransactionType } from "@/generated/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ----------------------------------------------------
// Action 1: Get Inventory Overview (Catalog, Batches, Alerts, Movement)
// ----------------------------------------------------
export async function getInventoryOverviewAction(): Promise<ActionResult<any>> {
  try {
    await requirePermission("DRUG_VIEW");

    // 1. Fetch All Drugs
    const drugs = await prisma.drug.findMany({
      where: { isActive: true },
      orderBy: { genericName: "asc" },
      include: {
        batches: {
          orderBy: { expiredAt: "asc" },
        },
      },
    });

    // 2. Fetch Low Stock Drugs
    const lowStockDrugs = drugs.filter((d) => d.totalStock <= d.minStockLevel);

    // 3. Fetch Batches Expiring in 90 Days
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const expiringBatches = await prisma.drugBatch.findMany({
      where: {
        quantity: { gt: 0 },
        expiredAt: { lte: ninetyDaysFromNow },
      },
      orderBy: { expiredAt: "asc" },
      include: { drug: true },
    });

    // 4. Fetch Recent Inventory Transactions
    const recentTransactions = await prisma.inventoryTransaction.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        drug: true,
        createdBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    return {
      success: true,
      data: {
        drugs,
        lowStockDrugs,
        expiringBatches,
        recentTransactions,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงข้อมูลคลังยาได้" };
  }
}

// ----------------------------------------------------
// Action 2: Create New Drug Item
// ----------------------------------------------------
export async function createDrugAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("DRUG_CREATE");

    const validated = createDrugSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลยาไม่ถูกต้อง",
      };
    }

    const data = validated.data;

    // Check code unique
    const existing = await prisma.drug.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      return { success: false, error: `รหัสยา ${data.code} มีในระบบแล้ว` };
    }

    const drug = await prisma.drug.create({
      data: {
        code: data.code,
        genericName: data.genericName,
        tradeName: data.tradeName || null,
        strength: data.strength || null,
        unit: data.unit,
        description: data.description || null,
        minStockLevel: data.minStockLevel,
        totalStock: 0,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "DRUG_CREATED",
        resourceType: "DRUG",
        resourceId: drug.id,
        success: true,
      },
    });

    revalidatePath("/inventory");
    return { success: true, data: drug };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถเพิ่มรายการยาใหม่ได้" };
  }
}

// ----------------------------------------------------
// Action 3: Stock In (Receive New Drug Batch)
// ----------------------------------------------------
export async function stockInAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("STOCK_IN");

    const validated = stockInSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลการรับยาไม่ถูกต้อง",
      };
    }

    const { drugId, lotNumber, quantity, manufactureDate, expiredAt, notes } = validated.data;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create DrugBatch
      const batch = await tx.drugBatch.create({
        data: {
          drugId,
          lotNumber,
          quantity,
          receivedAt: manufactureDate ? new Date(manufactureDate) : new Date(),
          expiredAt: new Date(expiredAt),
        },
      });

      // 2. Increase Drug.totalStock
      await tx.drug.update({
        where: { id: drugId },
        data: {
          totalStock: { increment: quantity },
        },
      });

      // 3. Create InventoryTransaction (STOCK_IN)
      const invTx = await tx.inventoryTransaction.create({
        data: {
          drugId,
          type: InventoryTransactionType.STOCK_IN,
          quantity,
          notes: notes ? `รับยาเข้าคลัง (Lot: ${lotNumber}) — ${notes}` : `รับยาเข้าคลัง (Lot: ${lotNumber})`,
          createdById: session.userId,
        },
      });

      return { batch, invTx };
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "STOCK_ADDED",
        resourceType: "DRUG",
        resourceId: drugId,
        success: true,
      },
    });

    revalidatePath("/inventory");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถรับยาเข้าคลังได้" };
  }
}

// ----------------------------------------------------
// Action 4: Stock Adjustment
// ----------------------------------------------------
export async function adjustStockAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("STOCK_ADJUST");

    const validated = adjustStockSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลปรับปรุงสต็อกไม่ถูกต้อง",
      };
    }

    const { batchId, newQuantity, notes } = validated.data;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get existing batch
      const batch = await tx.drugBatch.findUnique({
        where: { id: batchId },
      });

      if (!batch) throw new Error("ไม่พบล็อตยาที่ระบุ");

      const diff = newQuantity - batch.quantity;

      // 2. Update Batch Quantity
      await tx.drugBatch.update({
        where: { id: batchId },
        data: { quantity: newQuantity },
      });

      // 3. Update Drug totalStock
      await tx.drug.update({
        where: { id: batch.drugId },
        data: {
          totalStock: { increment: diff },
        },
      });

      // 4. Create InventoryTransaction (ADJUSTMENT)
      const invTx = await tx.inventoryTransaction.create({
        data: {
          drugId: batch.drugId,
          type: InventoryTransactionType.ADJUSTMENT,
          quantity: diff,
          notes: `ปรับปรุงสต็อก Lot ${batch.lotNumber}: ${notes} (จาก ${batch.quantity} เป็น ${newQuantity})`,
          createdById: session.userId,
        },
      });

      return { batch, invTx };
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "STOCK_ADJUSTED",
        resourceType: "DRUG_BATCH",
        resourceId: batchId,
        success: true,
      },
    });

    revalidatePath("/inventory");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถปรับปรุงสต็อกได้" };
  }
}
