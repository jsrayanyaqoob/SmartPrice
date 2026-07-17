import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json({ notifications: [] });
  }
}

export async function PATCH(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { notificationId } = await request.json();

    if (notificationId) {
      // Mark specific notification as read
      await prisma.notification.updateMany({
        where: { id: notificationId, userId: user.id },
        data: { read: true },
      });
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notifications update error:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}

// Create a notification (used internally)
export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, title, message, link, imageUrl, alertId } = await request.json();
    if (!type || !title || !message) {
      return NextResponse.json({ error: "type, title, and message are required" }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        type,
        title,
        message,
        link,
        imageUrl,
        alertId,
      },
    });

    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (error) {
    console.error("Notification creation error:", error);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
