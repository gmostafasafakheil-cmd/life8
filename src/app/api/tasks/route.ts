import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/db";
import { tasks } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDB) return NextResponse.json([]); try {
    const allTasks = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
    return NextResponse.json(allTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  if (!hasDB) return NextResponse.json({ error: "offline" }, { status: 503 }); try {
    const body = await request.json();
    const {
      title,
      description,
      priority,
      category,
      dueDate,
      audioUrl,
      imageUrl,
      note,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "عنوان وظیفه الزامی است" }, { status: 400 });
    }

    const newTask = await db
      .insert(tasks)
      .values({
        title,
        description: description || "",
        priority: priority || "medium",
        category: category || "",
        completed: false,
        dueDate: dueDate || "",
        audioUrl: audioUrl || "",
        imageUrl: imageUrl || "",
        note: note || "",
        forwardedTo: "",
        forwardedNote: "",
        forwardedAt: "",
      })
      .returning();

    return NextResponse.json(newTask[0], { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "خطا در ایجاد وظیفه" }, { status: 500 });
  }
}
