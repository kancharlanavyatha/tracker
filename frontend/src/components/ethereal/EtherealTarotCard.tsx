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
          <span className="font-label-caps text-xs text-[#8C734B] font-semibold uppercase tracking-wider">
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
          isSm ? "min-h-[280px]" : isLg ? "min-h-[560px]" : "min-h-[520px]"
        }`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)",
        }}
      >
        {/* =================================================================== */}
        {/* CARD FRONT FACE: Ethereal Bloom White/Pale-Gold Aesthetic          */}
        {/* =================================================================== */}
        <div
          className="w-full h-full rounded-3xl bg-[#FFFFFF] p-4 sm:p-5 flex flex-col justify-between border-[1.5px] border-[#E8DFD0] shadow-[0_12px_36px_rgba(215,205,190,0.35)] relative overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Delicate pale-gold corner accents */}
          <span className="absolute top-2.5 left-3 text-[10px] text-[#C5A059]/60 font-serif select-none">+</span>
          <span className="absolute top-2.5 right-3 text-[10px] text-[#C5A059]/60 font-serif select-none">+</span>
          <span className="absolute bottom-2.5 left-3 text-[10px] text-[#C5A059]/60 font-serif select-none">+</span>
          <span className="absolute bottom-2.5 right-3 text-[10px] text-[#C5A059]/60 font-serif select-none">+</span>

          <div className="space-y-3">
            {/* Header: Roman Numeral & Cycle Phase */}
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2 pt-0.5 px-1">
              <span className="font-serif tracking-widest text-[#8C734B] font-bold text-xs sm:text-sm uppercase">
                Arcana {card.numeral}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E8DFD0] text-[#7A6E65] font-label-caps text-[10px] font-semibold uppercase tracking-wider">
                {card.phase}
              </span>
            </div>

            {/* Art Nouveau Arched Window Frame (Signature Ethereal Bloom Shape) */}
            <div className="w-full rounded-t-[3.5rem] rounded-b-xl border-[1.5px] border-[#D4AF37]/45 p-1 bg-gradient-to-b from-[#FDFBF7] to-[#F8F5EE] shadow-inner relative group/art">
              <div className="w-full rounded-t-[3.2rem] rounded-b-lg border border-[#C5A059]/30 overflow-hidden relative">
                {/* Image with High-Key Luminous White Bloom Filter */}
                <img
                  src={card.artUrl}
                  alt={card.name}
                  className={`w-full object-cover object-top transition-transform duration-700 group-hover/art:scale-105 ${
                    isSm ? "h-32" : isLg ? "h-56" : "h-44"
                  }`}
                  style={{
                    filter: "brightness(1.12) contrast(0.92) saturate(0.55) sepia(0.08)",
                  }}
                  loading="lazy"
                />

                {/* Soft Alabaster Luminous Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none" />

                {/* Arched Top Apex Starlight Spark */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white/70 backdrop-blur-sm border border-[#D4AF37]/40 flex items-center justify-center text-[#8C734B] shadow-sm">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                </div>

                {/* Artist & Vibe Caption */}
                <div className="absolute bottom-1.5 left-2.5 right-2.5 flex items-center justify-between text-[#2C2825]">
                  <span className="font-serif italic text-[10px] tracking-wide text-[#4A423A] bg-white/85 backdrop-blur-sm px-2 py-0.5 rounded-full border border-[#E8DFD0] truncate max-w-[65%]">
                    {card.artArtist.split(",")[0]}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[9px] font-semibold uppercase tracking-wider text-[#8C734B] border border-[#D4AF37]/30">
                    {card.theme}
                  </span>
                </div>
              </div>
            </div>

            {/* Title & Tagline in Art Nouveau Serif Lettering */}
            <div className="text-center pt-1 px-1">
              <h3 className="font-serif tracking-[0.18em] uppercase text-[#2C2825] font-bold text-base sm:text-lg">
                {card.name}
              </h3>
              <p className="font-label-caps text-[11px] text-[#8C734B] font-medium tracking-wider mt-0.5">
                {card.subtitle}
              </p>
              <p className="font-body-sm text-xs text-[#6B6158] leading-relaxed mt-1.5 line-clamp-2 italic">
                "{card.meaning}"
              </p>
            </div>
          </div>

          {/* Bottom Somatic Wisdom & Affirmation */}
          {showAdvice && (
            <div className="pt-2.5 border-t border-[#F0EAE1] space-y-2 mt-2">
              <div className="flex items-start gap-1.5 text-xs">
                <span className="text-[#8C734B] font-semibold min-w-max">Movement:</span>
                <span className="text-[#6B6158] line-clamp-1">{card.bodyAdvice}</span>
              </div>
              <div className="flex items-start gap-1.5 text-xs">
                <span className="text-[#8C734B] font-semibold min-w-max">Fuel:</span>
                <span className="text-[#6B6158] line-clamp-1">{card.foodAdvice}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#FAF7F2] text-xs text-[#8C734B] font-medium italic text-center border border-[#E8DFD0]">
                "{card.affirmation}"
              </div>

              {onInspect && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspect();
                  }}
                  className="w-full py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#4A423A] font-label-caps text-[11px] text-center transition-colors font-medium flex items-center justify-center gap-1 cursor-pointer border border-[#E8DFD0]"
                >
                  <span className="material-symbols-outlined text-xs text-[#8C734B]">visibility</span>
                  <span>Inspect Full Wisdom</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* CARD BACK FACE: Pure White / Champagne Celestial Mandala           */}
        {/* =================================================================== */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl bg-[#FFFFFF] p-5 flex flex-col justify-between items-center text-center border-[1.5px] border-[#E8DFD0] shadow-[0_12px_36px_rgba(215,205,190,0.35)]"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Top Brand & Archetype Header */}
          <div className="flex items-center justify-between w-full text-xs text-[#8C734B] font-serif font-bold tracking-[0.25em] uppercase px-1">
            <span>SELENE</span>
            <span>ARCANA</span>
          </div>

          {/* Arched Inner Frame for Card Back */}
          <div className="w-full flex-1 my-2 rounded-t-[3.5rem] rounded-b-xl border-[1.5px] border-[#D4AF37]/40 p-1 bg-gradient-to-b from-[#FDFBF7] to-[#F8F5EE] shadow-inner flex flex-col items-center justify-center">
            <div className="w-full h-full rounded-t-[3.2rem] rounded-b-lg border border-[#C5A059]/25 flex flex-col items-center justify-center p-4 space-y-3 relative overflow-hidden bg-white/80">
              {/* Soft celestial halo */}
              <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-[#FDF6E2] to-[#FAF0D0] blur-xl pointer-events-none opacity-60" />

              {/* Celestial Mandala SVG */}
              <div className="relative z-10 w-20 h-20 rounded-full border border-[#D4AF37]/40 flex items-center justify-center bg-white shadow-sm p-2">
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
                  {/* 8-pointed star */}
                  <polygon
                    points="50,15 54,42 77,27 60,48 85,50 60,52 77,73 54,58 50,85 46,58 23,73 40,52 15,50 40,48 23,27 46,42"
                    fill="#F7F1E1"
                    stroke="#C5A059"
                    strokeWidth="0.8"
                  />
                  <circle cx="50" cy="50" r="7" fill="#8C734B" />
                </svg>
              </div>

              <div className="relative z-10 text-center space-y-1">
                <h4 className="font-serif font-bold text-base text-[#2C2825] tracking-[0.2em] uppercase">
                  SELENE
                </h4>
                <p className="font-serif italic text-xs text-[#8C734B]">
                  Ethereal Bloom
                </p>
                <p className="font-body-sm text-[11px] text-[#7A6E65] max-w-[180px] leading-relaxed pt-1">
                  Tap to reveal today's reflection and movement tip
                </p>
              </div>

              {/* Moon phases line */}
              <div className="relative z-10 flex items-center gap-2 text-[#8C734B] text-xs pt-1 opacity-75">
                <span className="material-symbols-outlined text-xs">routine</span>
                <span className="material-symbols-outlined text-xs">brightness_3</span>
                <span className="material-symbols-outlined text-sm">circle</span>
                <span className="material-symbols-outlined text-xs">brightness_2</span>
                <span className="material-symbols-outlined text-xs">routine</span>
              </div>
            </div>
          </div>

          {/* Bottom Flip Call to Action */}
          <div className="flex items-center gap-1.5 text-xs font-label-caps text-[#8C734B] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8C734B] animate-ping" />
            <span>Ready to Unveil</span>
          </div>
        </div>
      </div>
    </div>
  );
};
