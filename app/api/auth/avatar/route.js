import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    let avatarUrl = body.avatarUrl || "";

    // If a base64 image is provided, we'd normally upload it to a CDN
    // For now, we store the URL directly (works with image hosting services)
    if (!avatarUrl && body.imageData) {
      // In production with UploadThing/Cloudinary, upload here
      // For now, return a message guiding setup
      return NextResponse.json({
        success: false,
        message: "Direct image upload requires UploadThing or Cloudinary setup. For now, please provide a URL.",
      }, { status: 400 });
    }

    if (!avatarUrl) {
      return NextResponse.json({ error: "avatarUrl is required" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl },
    });

    return NextResponse.json({
      success: true,
      avatarUrl,
      message: "Avatar updated successfully.",
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: "Failed to update avatar" }, { status: 500 });
  }
}
