import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      avatarUrl: true,
    },
  });

  return NextResponse.json({
    authenticated: true,
    user: dbUser || {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
}

export async function PATCH(request) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email } = await request.json();

    const existing = email
      ? await prisma.user.findFirst({ where: { email, NOT: { id: authUser.id } } })
      : null;

    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        name: name || null,
        email: email || authUser.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
