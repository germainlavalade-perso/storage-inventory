"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase, getPhotoUrl, type Location, type Photo, type Item } from "@/lib/supabase";
import PhotoUploader from "@/components/PhotoUploader";
import ItemReviewModal from "@/components/ItemReviewModal";
import ItemTable from "@/components/ItemTable";
import type { DetectedItem } from "@/lib/claude";

type PendingReview = {
  photoId: string;
  items: DetectedItem[];
};

export default function LocationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [location, setLocation] = useState<Location | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [pendingReview, setPendingReview] = useState<PendingReview | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [locRes, photosRes, itemsRes] = await Promise.all([
      supabase.from("locations").select("*").eq("id", id).single(),
      supabase.from("photos").select("*").eq("location_id", id).order("created_at", { ascending: false }),
      supabase.from("items").select("*").eq("location_id", id).order("created_at", { ascending: false }),
    ]);
    if (locRes.data) setLocation(locRes.data);
    if (photosRes.data) setPhotos(photosRes.data);
    if (itemsRes.data) setItems(itemsRes.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleItemsDetected(photoId: string, detected: DetectedItem[]) {
    setPendingReview({ photoId, items: detected });
  }

  async function handleConfirmItems(photoId: string, confirmed: DetectedItem[]) {
    const rows = confirmed.map((item) => ({
      location_id: id,
      photo_id: photoId,
      name: item.name,
      quantity: item.quantity,
      category: item.category || null,
    }));
    await supabase.from("items").insert(rows);
    setPendingReview(null);
    loadData();
  }

  async function deletePhoto(photoId: string, storagePath: string) {
    await Promise.all([
      supabase.storage.from("Photos").remove([storagePath]),
      supabase.from("photos").delete().eq("id", photoId),
    ]);
    loadData();
  }

  async function deleteLocation() {
    if (!confirm(`Delete "${location?.name}" and all its items?`)) return;
    setDeleting(true);
    if (photos.length > 0) {
      await supabase.storage.from("Photos").remove(photos.map((p) => p.storage_path));
    }
    await supabase.from("locations").delete().eq("id", id);
    router.push("/");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Location not found.</p>
        <Link href="/" className="text-blue-600 text-sm mt-2 inline-block">Go home</Link>
      </div>
    );
  }

  return (
    <div>
      {pendingReview && (
        <ItemReviewModal
          photoId={pendingReview.photoId}
          detectedItems={pendingReview.items}
          onConfirm={handleConfirmItems}
          onCancel={() => { setPendingReview(null); loadData(); }}
        />
      )}

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{location.name}</h1>
            {location.description && (
              <p className="text-sm text-gray-500 mt-1">{location.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={deleteLocation}
          disabled={deleting}
          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
          title="Delete location"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Photos */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700">
            Photos <span className="text-gray-400 font-normal text-sm">({photos.length})</span>
          </h2>
          <PhotoUploader locationId={id} onItemsDetected={handleItemsDetected} />
        </div>

        {photos.length === 0 ? (
          <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <p className="text-sm text-gray-400">No photos yet. Tap "Add Photo" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group rounded-xl overflow-hidden bg-gray-100 aspect-square">
                <Image
                  src={getPhotoUrl(photo.storage_path)}
                  alt="Storage photo"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                <button
                  onClick={() => deletePhoto(photo.id, photo.storage_path)}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete photo"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Items */}
      <section>
        <h2 className="font-semibold text-gray-700 mb-3">
          Items <span className="text-gray-400 font-normal text-sm">({items.length})</span>
        </h2>
        <ItemTable items={items} locationId={id} onUpdate={loadData} />
      </section>
    </div>
  );
}
