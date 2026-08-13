import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/permissions";

/**
 * Get all combined permission codes for a given user
 */
export async function getUserPermissions(
  userId: string,
  role: UserRole
): Promise<Set<string>> {
  const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
  const permissionsSet = new Set<string>(defaultPermissions);

  try {
    // Fetch custom assigned permissions from DB
    const customUserPermissions = await prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    });

    for (const up of customUserPermissions) {
      if (up.permission?.code) {
        permissionsSet.add(up.permission.code);
      }
    }
  } catch (error) {
    console.error("Error fetching user custom permissions:", error);
  }

  return permissionsSet;
}

/**
 * Check if a user possesses a specific permission code
 */
export async function checkUserHasPermission(
  userId: string,
  role: UserRole,
  permissionCode: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, role);
  return permissions.has(permissionCode);
}
