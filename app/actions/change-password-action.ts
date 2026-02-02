"use server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod"; //

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

type State = {
  error?: string;
  success?: boolean;
};

export async function changePassword(
  _prevState: State,
  formData: FormData,
): Promise<State> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Sesi tidak valid. Silakan login kembali." };
    }

    // ✅ Proper validation
    const validatedFields = changePasswordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!validatedFields.success) {
      return { error: validatedFields.error.errors[0].message };
    }

    const { currentPassword, newPassword } = validatedFields.data;

    // ✅ Single DB query dengan select spesifik
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true },
    });

    if (!user) {
      return { error: "User tidak ditemukan" };
    }

    // ✅ Constant-time comparison
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return { error: "Password lama salah" };
    }

    // ✅ Hash dengan salt rounds yang adequate
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return { error: "Terjadi kesalahan. Silakan coba lagi." };
  }
}
