import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/db";
import { sectionEntries } from "@/db/schema";
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
    if (body.date !== undefined) updateData.date = body.date;
    if (body.completed !== undefined) updateData.completed = body.completed;
    const updated = await db.update(sectionEntries).set(updateData).where(eq(sectionEntries.id, parseInt(id))).returning();
    if (updated.length === 0) return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating entry:", error);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasDB) return NextResponse.json({ error: "offline" }, { status: 503 }); try {
    const { id } = await params;
    await db.delete(sectionEntries).where(eq(sectionEntries.id, parseInt(id)));
    return NextResponse.json({ message: "حذف شد" });
  } catch (error) {
    console.error("Error deleting entry:", error);
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}
