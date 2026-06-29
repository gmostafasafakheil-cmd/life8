import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/db";
import { memories } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDB) return NextResponse.json([]); try {
    const all = await db.select().from(memories).orderBy(desc(memories.createdAt));
    return NextResponse.json(all);
  } catch (error) {
    console.error("Error fetching memories:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  if (!hasDB) return NextResponse.json({ error: "offline" }, { status: 503 }); try {
    const body = await request.json();
    const { title, content, mood, date, imageUrl, audioUrl } = body;

    if (!title) {
      return NextResponse.json({ error: "عنوان خاطره الزامی است" }, { status: 400 });
    }

    const newMemory = await db
      .insert(memories)
      .values({
        title,
        content: content || "",
        mood: mood || "",
        date: date || "",
        imageUrl: imageUrl || "",
        audioUrl: audioUrl || "",
      })
      .returning();

    return NextResponse.json(newMemory[0], { status: 201 });
  } catch (error) {
    console.error("Error creating memory:", error);
    return NextResponse.json({ error: "خطا در ایجاد خاطره" }, { status: 500 });
  }
}
