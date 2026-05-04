import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton for client components
export const supabase = getSupabaseBrowserClient();

export type Location = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  user_id: string;
};

export type Photo = {
  id: string;
  location_id: string;
  storage_path: string;
  created_at: string;
};

export type Item = {
  id: string;
  location_id: string;
  photo_id: string | null;
  name: string;
  quantity: number;
  category: string | null;
  notes: string | null;
  created_at: string;
};

export function getPhotoUrl(storagePath: string): string {
  const { data } = supabase.storage.from("Photos").getPublicUrl(storagePath);
  return data.publicUrl;
}
