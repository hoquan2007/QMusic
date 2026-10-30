import { cn } from "@/lib/utils";

export function QMusicLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-9 w-9", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="qmusic-gradient" x1="6" y1="4" x2="43" y2="45" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA" />
          <stop offset="0.55" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="15" fill="url(#qmusic-gradient)" />
      <circle cx="24" cy="23" r="11.5" stroke="white" strokeOpacity="0.92" strokeWidth="3" />
      <path d="M30 29L37.5 36.5" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <path d="M19.5 18.2V28.3L28 23.25L19.5 18.2Z" fill="white" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <QMusicLogo />
      <span className="font-display text-[1.35rem] font-bold tracking-[-0.04em]">
        Q<span className="text-primary">Music</span>
      </span>
    </span>
  );
}
