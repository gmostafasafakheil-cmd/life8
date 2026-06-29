import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/db";
import { plans } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasDB) return NextResponse.json({ error: "offline" }, { status: 503 }); try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.dayOfWeek !== undefined) updateData.dayOfWeek = body.dayOfWeek;
    if (body.startTime !== undefined) updateData.startTime = body.startTime;
    if (body.endTime !== undefined) updateData.endTime = body.endTime;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.completed !== undefined) updateData.completed = body.completed;

    const updated = await db
      .update(plans)
      .set(updateData)
      .where(eq(plans.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "برنامه‌ریزی یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json({ error: "خطا در ویرایش برنامه‌ریزی" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasDB) return NextResponse.json({ error: "offline" }, { status: 503 }); try {
    const { id } = await params;
    const deleted = await db
      .delete(plans)
      .where(eq(plans.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "برنامه‌ریزی یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({ message: "برنامه‌ریزی حذف شد" });
  } catch (error) {
    console.error("Error deleting plan:", error);
    return NextResponse.json({ error: "خطا در حذف برنامه‌ریزی" }, { status: 500 });
  }
}
