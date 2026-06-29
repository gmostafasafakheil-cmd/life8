import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/db";
import { memories } from "@/db/schema";
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
    if (body.content !== undefined) updateData.content = body.content;
    if (body.mood !== undefined) updateData.mood = body.mood;
    if (body.date !== undefined) updateData.date = body.date;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
    if (body.audioUrl !== undefined) updateData.audioUrl = body.audioUrl;

    const updated = await db
      .update(memories)
      .set(updateData)
      .where(eq(memories.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "خاطره یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating memory:", error);
    return NextResponse.json({ error: "خطا در ویرایش خاطره" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasDB) return NextResponse.json({ error: "offline" }, { status: 503 }); try {
    const { id } = await params;
    const deleted = await db
      .delete(memories)
      .where(eq(memories.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "خاطره یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({ message: "خاطره حذف شد" });
  } catch (error) {
    console.error("Error deleting memory:", error);
    return NextResponse.json({ error: "خطا در حذف خاطره" }, { status: 500 });
  }
}
