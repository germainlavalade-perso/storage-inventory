import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import LocationCard from "@/components/LocationCard";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = getSupabaseServerClient();

  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .order("created_at", { ascending: false });

  const locationIds = (locations ?? []).map((l) => l.id);

  let itemCounts: Record<string, number> = {};
  if (locationIds.length > 0) {
    const { data: counts } = await supabase
      .from("items")
      .select("location_id")
      .in("location_id", locationIds);

    itemCounts = (counts ?? []).reduce<Record<string, number>>((acc, row) => {
      acc[row.location_id] = (acc[row.location_id] ?? 0) + 1;
      return acc;
    }, {});
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Storage Locations</h1>
          <p className="text-sm text-gray-500 mt-1">
            {locations?.length ?? 0} location{(locations?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/locations/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Location
        </Link>
      </div>

      {!locations || locations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-500 font-medium">No storage locations yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first location to start tracking items.</p>
          <Link
            href="/locations/new"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Create Location
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              itemCount={itemCounts[location.id] ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
