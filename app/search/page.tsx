import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { SearchExperience } from "@/features/search/search-experience";
import { Skeleton } from "@/components/ui/skeleton";
import { audioProviders } from "@/lib/providers";
import { youtubeProvider } from "@/lib/providers/youtube";

export const metadata: Metadata = {
  title: "Tìm kiếm",
  description: "Tìm bài hát, nghệ sĩ và playlist trên QMusic.",
};

export default async function SearchPage() {
  await connection();
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl space-y-5">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      }
    >
      <SearchExperience
        providerNames={audioProviders().map((provider) => provider.name)}
        youtubeEnabled={youtubeProvider.enabled}
      />
    </Suspense>
  );
}
