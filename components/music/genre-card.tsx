import Link from "next/link";
import { AudioLines, Disc3, Guitar, Headphones, Music2, Radio, Sparkles, Waves } from "lucide-react";
import { formatCount } from "@/lib/format";
import type { MusicGenre } from "@/types/music";

const ICONS = [Headphones, Disc3, AudioLines, Radio, Music2, Waves, Sparkles, Guitar];

function hueFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % 360;
  return hash;
}

export function GenreCard({ genre, index = 0 }: { genre: MusicGenre; index?: number }) {
  const Icon = ICONS[index % ICONS.length] ?? Music2;
  const hue = hueFor(genre.name);
  const href = `/genre/${encodeURIComponent(genre.name)}`;

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-white/5 p-4 transition-transform duration-300 hover:-translate-y-0.5"
      style={{
        background: `linear-gradient(140deg, hsl(${hue} 55% 22%), hsl(${(hue + 55) % 360} 60% 13%))`,
      }}
    >
      <div className="relative z-10 flex min-h-24 flex-col justify-between">
        <div className="flex items-start justify-between">
          <Icon className="h-5 w-5 text-white/75" strokeWidth={1.7} />
          <span className="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-semibold text-white/65 backdrop-blur">
            {genre.count > 0 ? `${formatCount(genre.count)} bài` : "Khám phá"}
          </span>
        </div>
        <div>
          <h3 className="truncate font-display text-base font-bold capitalize tracking-tight text-white">
            {genre.name}
          </h3>
          <p className="mt-0.5 text-[11px] text-white/55">Bộ sưu tập</p>
        </div>
      </div>
      <div
        className="pointer-events-none absolute -bottom-10 -right-6 h-28 w-28 rounded-full border-[18px] border-white/10 transition-transform duration-500 group-hover:scale-110"
        aria-hidden="true"
      />
    </Link>
  );
}
