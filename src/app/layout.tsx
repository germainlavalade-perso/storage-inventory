import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import SignOutButton from "@/components/SignOutButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Storage Inventory",
  description: "Track items in your storage locations",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        {user && (
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
              <Link href="/" className="text-lg font-semibold text-gray-900">
                Storage Inventory
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/search"
                  className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </Link>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-400 hidden sm:block">{user.email}</span>
                <SignOutButton />
              </div>
            </div>
          </header>
        )}
        <main className={user ? "max-w-4xl mx-auto px-4 py-6" : ""}>
          {children}
        </main>
      </body>
    </html>
  );
}
