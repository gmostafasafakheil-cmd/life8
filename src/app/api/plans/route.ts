import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/db";
import { plans } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDB) return NextResponse.json([]); try {
    const all = await db.select().from(plans).orderBy(asc(plans.startTime));
    return NextResponse.json(all);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  if (!hasDB) return NextResponse.json({ error: "offline" }, { status: 503 }); try {
    const body = await request.json();
    const { title, description, dayOfWeek, startTime, endTime, category, color } = body;

    if (!title) {
      return NextResponse.json({ error: "عنوان برنامه‌ریزی الزامی است" }, { status: 400 });
    }

    const newPlan = await db
      .insert(plans)
      .values({
        title,
        description: description || "",
        dayOfWeek: dayOfWeek || "everyday",
        startTime: startTime || "08:00",
        endTime: endTime || "09:00",
        category: category || "",
        color: color || "indigo",
        completed: false,
      })
      .returning();

    return NextResponse.json(newPlan[0], { status: 201 });
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json({ error: "خطا در ایجاد برنامه‌ریزی" }, { status: 500 });
  }
}
