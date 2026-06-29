import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasDB) return NextResponse.json({ error: "offline" }, { status: 503 }); try {
    const { id } = await params;
    const body = await request.json();
    const { value, label, icon } = body;

    const updated = await db
      .update(categories)
      .set({ value, label, icon })
      .where(eq(categories.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "دسته‌بندی یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "خطا در ویرایش دسته‌بندی" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasDB) return NextResponse.json({ error: "offline" }, { status: 503 }); try {
    const { id } = await params;
    const deleted = await db
      .delete(categories)
      .where(eq(categories.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "دسته‌بندی یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({ message: "دسته‌بندی حذف شد" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "خطا در حذف دسته‌بندی" }, { status: 500 });
  }
}
