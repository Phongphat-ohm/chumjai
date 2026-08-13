import { UserRole } from "@/generated/client";
import { getSession, UserSessionPayload } from "@/lib/auth";
import { checkUserHasPermission } from "@/server/services/permission";

export class AuthorizationError extends Error {
  constructor(message: string = "ไม่มีสิทธิ์เข้าถึงทรัพยากรนี้") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Ensures user is authenticated and returns session
 */
export async function requireAuth(): Promise<UserSessionPayload> {
  const session = await getSession();
  if (!session || !session.userId) {
    throw new AuthorizationError("กรุณาเข้าสู่ระบบก่อนใช้งาน");
  }
  return session;
}

/**
 * Ensures user possesses one of the allowed roles
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<UserSessionPayload> {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.role)) {
    throw new AuthorizationError(
      `ไม่มีสิทธิ์เข้าถึง (ต้องมีบทบาท: ${allowedRoles.join(", ")})`
    );
  }

  return session;
}

/**
 * Ensures user possesses a specific permission code
 */
export async function requirePermission(
  permissionCode: string
): Promise<UserSessionPayload> {
  const session = await requireAuth();

  const hasPermission = await checkUserHasPermission(
    session.userId,
    session.role,
    permissionCode
  );

  if (!hasPermission) {
    throw new AuthorizationError(
      `ไม่มีสิทธิ์การใช้งานที่จำเป็น (${permissionCode})`
    );
  }

  return session;
}

/**
 * Verifies resource ownership (Section 20 of PROMPT.md)
 * Patient A cannot access Patient B's records
 */
export async function verifyResourceOwnership(
  resourceOwnerUserId: string
): Promise<UserSessionPayload> {
  const session = await requireAuth();

  // ADMIN, DOCTOR, NURSE, PHARMACIST, RECEPTIONIST can access patient data according to permission
  if (session.role !== "PATIENT") {
    return session;
  }

  // Patients can strictly only access their own data
  if (session.userId !== resourceOwnerUserId) {
    throw new AuthorizationError(
      "ท่านไม่สามารถเข้าถึงข้อมูลของผู้ป่วยรายอื่นได้"
    );
  }

  return session;
}
