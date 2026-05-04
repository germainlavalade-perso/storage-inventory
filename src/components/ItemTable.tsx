"use client";

import { useState } from "react";
import { supabase, Item } from "@/lib/supabase";

type Props = {
  items: Item[];
  locationId: string;
  onUpdate: () => void;
};

const EMPTY_NEW = { name: "", quantity: 1, category: "", notes: "" };

export default function ItemTable({ items, locationId, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Item>>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState(EMPTY_NEW);
  const [saving, setSaving] = useState(false);

  function startEdit(item: Item) {
    setEditingId(item.id);
    setEditValues({ name: item.name, quantity: item.quantity, category: item.category ?? "", notes: item.notes ?? "" });
  }

  async function saveEdit(id: string) {
    await supabase.from("items").update({
      name: editValues.name,
      quantity: editValues.quantity,
      category: editValues.category || null,
      notes: editValues.notes || null,
    }).eq("id", id);
    setEditingId(null);
    onUpdate();
  }

  async function deleteItem(id: string) {
    setDeleting(id);
    await supabase.from("items").delete().eq("id", id);
    setDeleting(null);
    onUpdate();
  }

  async function saveNewItem() {
    if (!newItem.name.trim()) return;
    setSaving(true);
    await supabase.from("items").insert({
      location_id: locationId,
      name: newItem.name.trim(),
      quantity: newItem.quantity,
      category: newItem.category.trim() || null,
      notes: newItem.notes.trim() || null,
    });
    setNewItem(EMPTY_NEW);
    setAdding(false);
    setSaving(false);
    onUpdate();
  }

  function cancelAdd() {
    setNewItem(EMPTY_NEW);
    setAdding(false);
  }

  const tableContent = (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3 font-medium">Item</th>
            <th className="px-4 py-3 font-medium w-16 text-center">Qty</th>
            <th className="px-4 py-3 font-medium hidden sm:table-cell">Category</th>
            <th className="px-4 py-3 font-medium hidden md:table-cell">Notes</th>
            <th className="px-4 py-3 w-20" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => (
            <tr key={item.id} className="bg-white hover:bg-gray-50 transition-colors">
              {editingId === item.id ? (
                <>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={editValues.name ?? ""}
                      onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))}
                      className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                      autoFocus
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min={1}
                      value={editValues.quantity ?? 1}
                      onChange={(e) => setEditValues((v) => ({ ...v, quantity: parseInt(e.target.value) || 1 }))}
                      className="w-14 border border-blue-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </td>
                  <td className="px-4 py-2 hidden sm:table-cell">
                    <input
                      type="text"
                      value={editValues.category ?? ""}
                      onChange={(e) => setEditValues((v) => ({ ...v, category: e.target.value }))}
                      placeholder="Category"
                      className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </td>
                  <td className="px-4 py-2 hidden md:table-cell">
                    <input
                      type="text"
                      value={editValues.notes ?? ""}
                      onChange={(e) => setEditValues((v) => ({ ...v, notes: e.target.value }))}
                      placeholder="Notes"
                      className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => saveEdit(item.id)} className="text-green-600 hover:text-green-700" title="Save">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600" title="Cancel">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {item.category ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                        {item.category}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {item.notes || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => startEdit(item)} className="text-gray-400 hover:text-blue-500" title="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => deleteItem(item.id)} disabled={deleting === item.id} className="text-gray-400 hover:text-red-500 disabled:opacity-50" title="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}

          {/* New item row */}
          {adding && (
            <tr className="bg-blue-50">
              <td className="px-4 py-2">
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem((v) => ({ ...v, name: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") saveNewItem(); if (e.key === "Escape") cancelAdd(); }}
                  placeholder="Item name"
                  autoFocus
                  className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                />
              </td>
              <td className="px-4 py-2">
                <input
                  type="number"
                  min={1}
                  value={newItem.quantity}
                  onChange={(e) => setNewItem((v) => ({ ...v, quantity: parseInt(e.target.value) || 1 }))}
                  className="w-14 border border-blue-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                />
              </td>
              <td className="px-4 py-2 hidden sm:table-cell">
                <input
                  type="text"
                  value={newItem.category}
                  onChange={(e) => setNewItem((v) => ({ ...v, category: e.target.value }))}
                  placeholder="Category"
                  className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                />
              </td>
              <td className="px-4 py-2 hidden md:table-cell">
                <input
                  type="text"
                  value={newItem.notes}
                  onChange={(e) => setNewItem((v) => ({ ...v, notes: e.target.value }))}
                  placeholder="Notes"
                  className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                />
              </td>
              <td className="px-4 py-2">
                <div className="flex gap-2 justify-end">
                  <button onClick={saveNewItem} disabled={saving || !newItem.name.trim()} className="text-green-600 hover:text-green-700 disabled:opacity-40" title="Save">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button onClick={cancelAdd} className="text-gray-400 hover:text-gray-600" title="Cancel">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      {items.length === 0 && !adding ? (
        <p className="text-sm text-gray-400 text-center py-8">
          No items yet. Add a photo to detect items automatically, or add one manually.
        </p>
      ) : (
        tableContent
      )}
      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add item manually
        </button>
      )}
    </div>
  );
}
