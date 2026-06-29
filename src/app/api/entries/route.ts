import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/db";
import { sectionEntries } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!hasDB) return NextResponse.json([]); try {
    const section = request.nextUrl.searchParams.get("section") || "";
    let query = db.select().from(sectionEntries).orderBy(desc(sectionEntries.createdAt));
    const all = section
      ? await db.select().from(sectionEntries).where(eq(sectionEntries.sectionValue, section)).orderBy(desc(sectionEntries.createdAt))
      : await query;
    return NextResponse.json(all);
  } catch (error) {
    console.error("Error fetching entries:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  if (!hasDB) return NextResponse.json({ error: "offline" }, { status: 503 }); try {
    const body = await request.json();
    const { sectionValue, title, content, date } = body;
    if (!title || !sectionValue) {
      return NextResponse.json({ error: "عنوان و بخش الزامی است" }, { status: 400 });
    }
    const newEntry = await db.insert(sectionEntries).values({
      sectionValue,
      title,
      content: content || "",
      date: date || "",
      completed: false,
    }).returning();
    return NextResponse.json(newEntry[0], { status: 201 });
  } catch (error) {
    console.error("Error creating entry:", error);
    return NextResponse.json({ error: "خطا در ایجاد مورد" }, { status: 500 });
  }
}
