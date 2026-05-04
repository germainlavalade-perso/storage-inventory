"use client";

import { useState } from "react";
import type { DetectedItem } from "@/lib/claude";

type EditableItem = DetectedItem & { selected: boolean; tempId: string };

type Props = {
  photoId: string;
  detectedItems: DetectedItem[];
  onConfirm: (photoId: string, items: DetectedItem[]) => Promise<void>;
  onCancel: () => void;
};

export default function ItemReviewModal({
  photoId,
  detectedItems,
  onConfirm,
  onCancel,
}: Props) {
  const [items, setItems] = useState<EditableItem[]>(
    detectedItems.map((item, i) => ({
      ...item,
      selected: true,
      tempId: `${i}`,
    }))
  );
  const [saving, setSaving] = useState(false);

  function updateItem(tempId: string, field: keyof DetectedItem, value: string | number) {
    setItems((prev) =>
      prev.map((item) =>
        item.tempId === tempId ? { ...item, [field]: value } : item
      )
    );
  }

  function toggleItem(tempId: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.tempId === tempId ? { ...item, selected: !item.selected } : item
      )
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        name: "",
        quantity: 1,
        category: "Miscellaneous",
        selected: true,
        tempId: String(Date.now()),
      },
    ]);
  }

  function removeItem(tempId: string) {
    setItems((prev) => prev.filter((item) => item.tempId !== tempId));
  }

  async function handleConfirm() {
    const selected = items
      .filter((i) => i.selected && i.name.trim())
      .map(({ name, quantity, category }) => ({ name, quantity, category }));
    if (selected.length === 0) return;
    setSaving(true);
    await onConfirm(photoId, selected);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Review Detected Items</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Uncheck, edit, or add items before saving
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-3 space-y-2">
          {items.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">
              No items detected. Add them manually.
            </p>
          )}
          {items.map((item) => (
            <div
              key={item.tempId}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                item.selected ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-gray-50 opacity-60"
              }`}
            >
              <input
                type="checkbox"
                checked={item.selected}
                onChange={() => toggleItem(item.tempId)}
                className="mt-1 h-4 w-4 rounded text-blue-600 cursor-pointer"
              />
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.tempId, "name", e.target.value)}
                  placeholder="Item name"
                  className="col-span-2 text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 shrink-0">Qty</span>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(item.tempId, "quantity", parseInt(e.target.value) || 1)}
                    className="w-full text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                  />
                </div>
                <input
                  type="text"
                  value={item.category ?? ""}
                  onChange={(e) => updateItem(item.tempId, "category", e.target.value)}
                  placeholder="Category"
                  className="text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                />
              </div>
              <button
                onClick={() => removeItem(item.tempId)}
                className="text-gray-300 hover:text-red-400 mt-1 shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={addItem}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add item
          </button>
          <div className="flex-1" />
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving || items.filter((i) => i.selected && i.name.trim()).length === 0}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Saving…" : `Save ${items.filter((i) => i.selected && i.name.trim()).length} items`}
          </button>
        </div>
      </div>
    </div>
  );
}
