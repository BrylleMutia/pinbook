import type { ReactNode } from "react";
import { PlusIcon } from "./ui";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-stone-100">
      <div className="relative mx-auto min-h-dvh max-w-md overflow-hidden bg-stone-50 shadow-xl md:my-8 md:min-h-[calc(100dvh-4rem)] md:rounded-3xl">
        {children}
      </div>
    </div>
  );
}

export function Fab({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-4 z-30 md:right-[calc(50vw-12.25rem)]">
      <button
        onClick={onClick}
        aria-label={label}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-400 text-white shadow-lg shadow-rose-300/60 transition active:scale-90"
      >
        <PlusIcon className="h-6 w-6" />
      </button>
    </div>
  );
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3 px-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl bg-stone-200/70" />
      ))}
    </div>
  );
}
