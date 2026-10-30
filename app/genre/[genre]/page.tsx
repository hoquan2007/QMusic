import type { Metadata } from "next";
import { GenreContent } from "@/features/music/genre-content";

interface PageProps {
  params: Promise<{ genre: string }>;
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { genre } = await params;
  const name = safeDecode(genre);
  return {
    title: name,
    description: `Nghe nhạc ${name} thịnh hành và mới phát hành trên QMusic.`,
  };
}

export default async function GenrePage({ params }: PageProps) {
  const { genre } = await params;
  return <GenreContent genre={safeDecode(genre)} />;
}
