import { NextRequest, NextResponse } from "next/server";
import { detectItemsFromImageUrl } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    const items = await detectItemsFromImageUrl(imageUrl);
    return NextResponse.json({ items });
  } catch (error) {
    console.error("detect-items error:", error);
    return NextResponse.json(
      { error: "Failed to detect items" },
      { status: 500 }
    );
  }
}
