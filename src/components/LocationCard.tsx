"use client";

import Link from "next/link";
import { Location } from "@/lib/supabase";

type Props = {
  location: Location;
  itemCount: number;
};

export default function LocationCard({ location, itemCount }: Props) {
  return (
    <Link href={`/locations/${location.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
        <h2 className="font-semibold text-gray-900 text-lg leading-tight">
          {location.name}
        </h2>
        {location.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {location.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-1 text-sm text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <span>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>
      </div>
    </Link>
  );
}
