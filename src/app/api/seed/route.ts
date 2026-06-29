import { NextResponse } from "next/server";
import { db, hasDB } from "@/db";
import { categories } from "@/db/schema";

export const dynamic = "force-dynamic";

const defaultCategories = [
  { value: "work", label: "کاری", icon: "💼" },
  { value: "personal", label: "شخصی", icon: "👤" },
  { value: "study", label: "مطالعه", icon: "📚" },
  { value: "health", label: "سلامت", icon: "🏥" },
  { value: "shopping", label: "خرید", icon: "🛒" },
  { value: "finance", label: "مالی", icon: "💰" },
];

export async function POST() {
  if (!hasDB) return NextResponse.json({ error: "offline" }, { status: 503 }); try {
    const existing = await db.select().from(categories);
    if (existing.length === 0) {
      await db.insert(categories).values(defaultCategories);
    }
    return NextResponse.json({ message: "Seed completed" });
  } catch (error) {
    console.error("Error seeding:", error);
    return NextResponse.json({ message: "Seed skipped" }, { status: 200 });
  }
}
