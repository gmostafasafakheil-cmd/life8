import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/db";
import { lifeSections } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!hasDB) return NextResponse.json({ error: "offline" }, { status: 503 }); try {
    const { id } = await params;
    await db.delete(lifeSections).where(eq(lifeSections.id, parseInt(id)));
    return NextResponse.json({ message: "بخش حذف شد" });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json({ error: "خطا در حذف بخش" }, { status: 500 });
  }
}
