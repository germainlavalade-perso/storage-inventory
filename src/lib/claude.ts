import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export type DetectedItem = {
  name: string;
  quantity: number;
  category: string;
};

export async function detectItemsFromImageUrl(
  imageUrl: string
): Promise<DetectedItem[]> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "url",
              url: imageUrl,
            },
          },
          {
            type: "text",
            text: `Look at this storage location photo and list all distinct items you can see.
Return ONLY a valid JSON array with no extra text, in this format:
[
  {"name": "item name", "quantity": 1, "category": "category name"},
  ...
]

Guidelines:
- Use simple, clear item names (e.g., "Cardboard box", "Power drill", "Soccer ball")
- Estimate quantity if multiple identical items are visible
- Use broad categories like: Tools, Sports, Electronics, Clothing, Books, Kitchen, Seasonal, Miscellaneous
- If you cannot identify an item clearly, use a generic name like "Unidentified box"
- Return an empty array [] if no items are visible`,
          },
        ],
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    const items = JSON.parse(jsonMatch[0]) as DetectedItem[];
    return items.map((item) => ({
      name: String(item.name || "Unknown item"),
      quantity: Number(item.quantity) || 1,
      category: String(item.category || "Miscellaneous"),
    }));
  } catch {
    return [];
  }
}
