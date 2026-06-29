import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/db";
import { lifeSections } from "@/db/schema";

export const dynamic = "force-dynamic";

const defaultSections = [
  { value: "health", label: "سلامت", icon: "❤️" },
  { value: "nutrition", label: "تغذیه", icon: "🥗" },
  { value: "exercise", label: "ورزش", icon: "🏋️" },
  { value: "learning", label: "یادگیری", icon: "🎓" },
  { value: "reading", label: "مطالعه", icon: "📚" },
];

export async function GET() {
  if (!hasDB) return NextResponse.json([]); try {
    let all = await db.select().from(lifeSections).orderBy(lifeSections.id);
    if (all.length === 0) {
      await db.insert(lifeSections).values(defaultSections);
      all = await db.select().from(lifeSections).orderBy(lifeSections.id);
    }
    return NextResponse.json(all);
  } catch (error) {
    console.error("Error fetching sections:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  if (!hasDB) return NextResponse.json({ error: "offline" }, { status: 503 }); try {
    const body = await request.json();
    const { value, label, icon } = body;
    if (!value || !label) {
      return NextResponse.json({ error: "نام بخش الزامی است" }, { status: 400 });
    }
    const newSection = await db.insert(lifeSections).values({ value, label, icon: icon || "📁" }).returning();
    return NextResponse.json(newSection[0], { status: 201 });
  } catch (error) {
    console.error("Error creating section:", error);
    return NextResponse.json({ error: "خطا در ایجاد بخش" }, { status: 500 });
  }
}
