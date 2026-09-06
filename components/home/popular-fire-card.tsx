"use client";

import React, { useState } from "react";
import { Flame } from "lucide-react";
import { FireFlameEffect } from "@/components/ui/fire-flame-effect";

interface PopularFireCardProps {
  name: string;
  publisher?: string;
  image: string;
  slug: string;
  onClick: () => void;
}

export function PopularFireCard({
  name,
  publisher = "GAME",
  image,
  slug,
  onClick,
}: PopularFireCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group p-1 isolate"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. Subtle Floating Fiery Embers (Behind the card, lightweight & non-intrusive) */}
      <FireFlameEffect isHovered={isHovered} />

      {/* 2. Interactive Card Button with Original dark-stripes-teal-pop Motif */}
      <button
        onClick={onClick}
        className="w-full flex flex-col sm:flex-row min-h-24 sm:min-h-28 items-center gap-3 sm:gap-5 dark-stripes-teal-pop border border-sky/50 hover:border-diamond p-3 sm:p-4 text-center sm:text-left rounded-[16px] sm:rounded-[20px] shadow-xl relative z-10 transition-all duration-300 group-hover:-translate-y-1 popular-flame-card overflow-hidden shimmer-hover"
      >

        {/* Hot Flame Badge on Corner */}
        <div className="absolute -top-0.5 -right-0.5 z-20 flex items-center gap-1 bg-gradient-to-l from-amber-500 via-sky/90 to-transparent pl-3 pr-2.5 py-0.5 rounded-bl-xl popular-flame-badge border-l border-b border-amber-400/50 shadow-md">
          <Flame className="h-3.5 w-3.5 text-amber-300 fill-amber-400 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-wider text-white drop-shadow">
            HOT
          </span>
        </div>

        {/* Poster Thumbnail */}
        <div className="relative h-14 w-14 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-sky/40 group-hover:border-diamond transition-all shadow-md group-hover:scale-105 duration-300 z-10 bg-black/40">
          <img
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
            src={image}
            alt={name}
          />
        </div>

        {/* Game Title & Publisher - Clean & 100% Readable */}
        <span className="w-full z-10 text-left">
          <strong className="block text-xs sm:text-base font-black text-white group-hover:text-diamond transition-colors uppercase tracking-tight leading-tight">
            {name}
          </strong>
          <span className="mt-1 block text-[9px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider truncate">
            {publisher}
          </span>
        </span>
      </button>
    </div>
  );
}
