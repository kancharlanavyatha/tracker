import React from "react";
import type { FullTarotCard } from "../../data/tarotDeck";

interface EtherealTarotCardProps {
  card: FullTarotCard;
  isFlipped?: boolean;
  onFlip?: () => void;
  onInspect?: () => void;
  size?: "sm" | "md" | "lg";
  slotLabel?: string;
  showAdvice?: boolean;
  className?: string;
}

// Delicate classical olive/laurel branch flourish matching the stitch tarot designs
const OliveBranchCorner: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 60 60"
    className={`w-7 h-7 text-[#8C734B] pointer-events-none opacity-85 select-none ${className}`}
    fill="currentColor"
  >
    {/* Stem curving into the corner */}
    <path
      d="M 6,6 Q 24,12 42,34"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* Leaf pairs */}
    <path d="M 8,8 Q 14,3 18,8 Q 13,13 8,8 Z" />
    <path d="M 15,11 Q 23,8 26,14 Q 19,17 15,11 Z" />
    <path d="M 23,17 Q 31,15 34,22 Q 26,24 23,17 Z" />
    <path d="M 12,15 Q 8,22 15,25 Q 18,18 12,15 Z" />
    <path d="M 20,23 Q 17,31 24,33 Q 27,25 20,23 Z" />
    <path d="M 32,26 Q 40,27 43,34 Q 35,35 32,26 Z" />
  </svg>
);

export const EtherealTarotCard: React.FC<EtherealTarotCardProps> = ({
  card,
  isFlipped = true,
  onFlip,
  onInspect,
  size = "md",
  slotLabel,
  showAdvice = true,
  className = "",
}) => {
  const isSm = size === "sm";
  const isLg = size === "lg";

  return (
    <div
      className={`relative group transition-all duration-300 ${className}`}
      style={{ perspective: "1200px" }}
    >
      {/* Slot label header if provided */}
      {slotLabel && (
        <div className="flex items-center justify-between pb-2 px-1">
          <span className="font-serif text-xs text-[#8C734B] font-semibold tracking-wider uppercase">
            {slotLabel}
          </span>
          {onFlip && (
            <button
              type="button"
              onClick={onFlip}
              className="text-xs text-[#8C734B] hover:text-[#5B4628] transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>{isFlipped ? "Flip to hide" : "Tap to flip"}</span>
              <span className="material-symbols-outlined text-sm">sync</span>
            </button>
          )}
        </div>
      )}

      {/* 3D Flip Container */}
      <div
        onClick={onFlip}
        className={`w-full relative transition-transform duration-700 rounded-3xl cursor-pointer ${
          isSm ? "min-h-[300px]" : isLg ? "min-h-[580px]" : "min-h-[520px]"
        }`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)",
        }}
      >
        {/* =================================================================== */}
        {/* CARD FRONT FACE: Exact Stitch Tarot Card & Inspired Art             */}
        {/* =================================================================== */}
        <div
          className="w-full h-full rounded-3xl bg-[#FAF7F2] p-3.5 sm:p-4 flex flex-col justify-between border-[1.5px] border-[#E2D7C5] shadow-[0_12px_36px_rgba(200,185,165,0.35)] relative overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* If the card has a direct high-res stitch PNG (like The High Priestess, Empress, Moon, Alchemist, Star) */}
          {card.fullCardUrl ? (
            <div className="flex flex-col flex-1 justify-between">
              {/* Full Art Card Graphic */}
              <div className="w-full rounded-2xl overflow-hidden relative shadow-sm border border-[#E0D5C3] bg-white group/art flex-shrink-0">
                <img
                  src={card.fullCardUrl}
                  alt={card.name}
                  className={`w-full object-cover object-top transition-transform duration-700 group-hover/art:scale-102 ${
                    isSm ? "h-64" : isLg ? "h-[420px]" : "h-96 sm:h-[390px]"
                  }`}
                  loading="lazy"
                />
              </div>

              {/* Bottom Quick Advice Chips */}
              {showAdvice && (
                <div className="pt-2.5 mt-2 border-t border-[#E8DFC8] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#6B5E50] px-1">
                    <span className="font-semibold text-[#8C734B]">Phase: {card.phase}</span>
                    <span className="italic truncate max-w-[60%]">"{card.theme}"</span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/80 border border-[#E8DFC8] text-xs text-[#5A4630] space-y-1 shadow-sm">
                    <div className="flex items-start gap-1">
                      <span className="font-semibold text-[#8C734B] min-w-max">Move:</span>
                      <span className="truncate">{card.bodyAdvice}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="font-semibold text-[#8C734B] min-w-max">Nourish:</span>
                      <span className="truncate">{card.foodAdvice}</span>
                    </div>
                  </div>

                  {onInspect && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspect();
                      }}
                      className="w-full py-1.5 rounded-full bg-white hover:bg-[#F2ECE1] text-[#4A423A] font-serif text-xs text-center transition-colors font-medium flex items-center justify-center gap-1 cursor-pointer border border-[#E0D5C3] shadow-sm"
                    >
                      <span className="material-symbols-outlined text-xs text-[#8C734B]">visibility</span>
                      <span>Read Card Wisdom</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Inspired Dynamic Card Design for the other 17 cards */
            <div className="w-full h-full flex flex-col justify-between relative p-2">
              {/* Four Olive/Laurel Branch Corner Flourishes */}
              <OliveBranchCorner className="absolute top-0.5 left-0.5" />
              <OliveBranchCorner className="absolute top-0.5 right-0.5 transform -scale-x-100" />
              <OliveBranchCorner className="absolute bottom-0.5 left-0.5 transform -scale-y-100" />
              <OliveBranchCorner className="absolute bottom-0.5 right-0.5 transform rotate-180" />

              {/* Inner Double Inset Border */}
              <div className="absolute inset-1.5 rounded-2xl border border-[#D8CCB8] pointer-events-none" />

              <div className="relative z-10 space-y-2 pt-1">
                {/* Header: Roman Numeral with flanking decorative rules */}
                <div className="flex items-center justify-center gap-3 pt-1">
                  <span className="h-[1px] w-8 sm:w-12 bg-[#C8B89E]" />
                  <span className="font-serif tracking-widest text-[#5A4630] font-bold text-sm sm:text-base uppercase">
                    {card.numeral}
                  </span>
                  <span className="h-[1px] w-8 sm:w-12 bg-[#C8B89E]" />
                </div>

                {/* Central Classical Nymph Oil Painting */}
                <div className="w-full rounded-2xl border border-[#C8B89E]/60 overflow-hidden relative shadow-sm group/art mx-auto">
                  <img
                    src={card.artUrl}
                    alt={card.name}
                    className={`w-full object-cover object-top transition-transform duration-700 group-hover/art:scale-105 ${
                      isSm ? "h-36" : isLg ? "h-64" : "h-52 sm:h-56"
                    }`}
                    style={{
                      filter: "brightness(1.05) contrast(0.96) saturate(0.85)",
                    }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-white">
                    <span className="font-serif italic text-[10px] tracking-wide text-white/95 drop-shadow-sm truncate max-w-[65%]">
                      {card.artArtist.split(",")[0]}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-md text-[9px] font-semibold uppercase tracking-wider text-white border border-white/30">
                      {card.theme}
                    </span>
                  </div>
                </div>

                {/* Card Title & Poetic Affirmation Inscription */}
                <div className="text-center pt-1 px-2">
                  <h3 className="font-serif tracking-[0.2em] uppercase text-[#2C241B] font-bold text-sm sm:text-base">
                    {card.name}
                  </h3>
                  <p className="font-serif italic text-xs text-[#5A4630] leading-relaxed mt-1 line-clamp-2 px-1">
                    "{card.quote || card.affirmation}"
                  </p>
                </div>
              </div>

              {/* Bottom Somatic Advice */}
              {showAdvice && (
                <div className="relative z-10 pt-2 border-t border-[#E8DFC8] space-y-1.5 mt-2">
                  <div className="flex items-center justify-between text-[11px] text-[#6B5E50] px-1">
                    <span className="font-semibold text-[#8C734B]">Phase: {card.phase}</span>
                    <span className="italic truncate max-w-[60%]">{card.subtitle}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/80 border border-[#E8DFC8] text-xs text-[#5A4630] space-y-1 shadow-sm">
                    <div className="flex items-start gap-1">
                      <span className="font-semibold text-[#8C734B] min-w-max">Move:</span>
                      <span className="truncate">{card.bodyAdvice}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="font-semibold text-[#8C734B] min-w-max">Nourish:</span>
                      <span className="truncate">{card.foodAdvice}</span>
                    </div>
                  </div>

                  {onInspect && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspect();
                      }}
                      className="w-full py-1.5 rounded-full bg-white hover:bg-[#F2ECE1] text-[#4A423A] font-serif text-xs text-center transition-colors font-medium flex items-center justify-center gap-1 cursor-pointer border border-[#E0D5C3] shadow-sm"
                    >
                      <span className="material-symbols-outlined text-xs text-[#8C734B]">visibility</span>
                      <span>Read Card Wisdom</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* CARD BACK FACE: Archival Cream & Celestial Gold Mandala            */}
        {/* =================================================================== */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl bg-[#FAF7F2] p-5 flex flex-col justify-between items-center text-center border-[1.5px] border-[#E2D7C5] shadow-[0_12px_36px_rgba(200,185,165,0.35)] relative overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Four Olive/Laurel Branch Corner Flourishes */}
          <OliveBranchCorner className="absolute top-2 left-2" />
          <OliveBranchCorner className="absolute top-2 right-2 transform -scale-x-100" />
          <OliveBranchCorner className="absolute bottom-2 left-2 transform -scale-y-100" />
          <OliveBranchCorner className="absolute bottom-2 right-2 transform rotate-180" />

          {/* Inset Border */}
          <div className="absolute inset-3 rounded-2xl border border-[#D8CCB8] pointer-events-none" />

          {/* Top Brand & Header */}
          <div className="flex items-center justify-between w-full text-xs text-[#8C734B] font-serif font-bold tracking-[0.25em] uppercase px-4 pt-1 z-10">
            <span>SELENE</span>
            <span>TAROT</span>
          </div>

          {/* Center Celestial Mandala */}
          <div className="w-full flex-1 my-2 rounded-2xl border border-[#E2D7C5] p-3 bg-white/70 flex flex-col items-center justify-center z-10 shadow-inner">
            <div className="w-20 h-20 rounded-full border border-[#8C734B]/40 flex items-center justify-center bg-white shadow-sm p-2 mb-2">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full text-[#8C734B] animate-spin"
                style={{ animationDuration: "35s" }}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <circle cx="50" cy="50" r="44" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="36" />
                <circle cx="50" cy="50" r="28" strokeDasharray="2 2" />
                <polygon
                  points="50,15 54,42 77,27 60,48 85,50 60,52 77,73 54,58 50,85 46,58 23,73 40,52 15,50 40,48 23,27 46,42"
                  fill="#FDF9F0"
                  stroke="#C5A059"
                  strokeWidth="0.8"
                />
                <circle cx="50" cy="50" r="7" fill="#8C734B" />
              </svg>
            </div>

            <h4 className="font-serif font-bold text-base text-[#2C241B] tracking-[0.25em] uppercase">
              SELENE
            </h4>
            <p className="font-serif italic text-xs text-[#8C734B] mt-0.5">
              Inner Tide Sanctuary
            </p>
            <p className="font-serif text-[11px] text-[#6B5E50] max-w-[190px] leading-relaxed pt-2">
              Tap to reveal today's reflection and movement tip
            </p>
          </div>

          {/* Bottom Flip Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-serif text-[#8C734B] font-medium z-10 pb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C734B] animate-ping" />
            <span>Ready to Unveil</span>
          </div>
        </div>
      </div>
    </div>
  );
};
