// ini hanya untuk login form validation sebelum masuk ke next-auth credentials
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "EMAIL_PASSWORD_REQUIRED" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 401 });
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return NextResponse.json({ error: "WRONG_PASSWORD" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
}
