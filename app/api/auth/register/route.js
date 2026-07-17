import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { authLimiter } from "@/lib/rate-limit";

export async function POST(request) {
  try {
    const rateLimitResponse = authLimiter.check(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { email, password, fullName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const role = email === "rayanyaqoob83@gmail.com" ? "Admin" : "Customer";

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: fullName || null,
        role,
        plan: "FREE",
      },
    });

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
