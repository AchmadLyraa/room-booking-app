import { auth } from "@/auth";
import type { Role } from "@/prisma/generated/client";

export async function getAuthUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role as Role)) {
    throw new Error("Forbidden");
  }
  return user;
}
