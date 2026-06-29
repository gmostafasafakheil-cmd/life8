import { NextRequest, NextResponse } from "next/server";
import { db, hasDB } from "@/db";
import { categories } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDB) return NextResponse.json([]); try {
    const allCategories = await db.select().from(categories).orderBy(categories.id);
    return NextResponse.json(allCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  if (!hasDB) return NextResponse.json({ error: "offline" }, { status: 503 }); try {
    const body = await request.json();
    const { value, label, icon } = body;

    if (!value || !label) {
      return NextResponse.json({ error: "نام و مقدار دسته‌بندی الزامی است" }, { status: 400 });
    }

    const newCategory = await db
      .insert(categories)
      .values({ value, label, icon: icon || "📁" })
      .returning();

    return NextResponse.json(newCategory[0], { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "خطا در ایجاد دسته‌بندی" }, { status: 500 });
  }
}
