import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/db";
import { tasks } from "@/db/schema";
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
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.completed !== undefined) updateData.completed = body.completed;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate;
    if (body.audioUrl !== undefined) updateData.audioUrl = body.audioUrl;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.note !== undefined) updateData.note = body.note;
    if (body.forwardedTo !== undefined) updateData.forwardedTo = body.forwardedTo;
    if (body.forwardedNote !== undefined) updateData.forwardedNote = body.forwardedNote;
    if (body.forwardedAt !== undefined) updateData.forwardedAt = body.forwardedAt;

    const updated = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "وظیفه یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "خطا در ویرایش وظیفه" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasDB) return NextResponse.json({ error: "offline" }, { status: 503 }); try {
    const { id } = await params;
    const deleted = await db
      .delete(tasks)
      .where(eq(tasks.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "وظیفه یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({ message: "وظیفه حذف شد" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "خطا در حذف وظیفه" }, { status: 500 });
  }
}
