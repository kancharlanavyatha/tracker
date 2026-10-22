import React, { useState } from "react";
import { FULL_TAROT_DECK, type FullTarotCard } from "../../data/tarotDeck";

interface InteractiveTarotDeckProps {
  currentPhaseName: string;
  onCardSelected?: (card: FullTarotCard) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const InteractiveTarotDeck: React.FC<InteractiveTarotDeckProps> = ({
  currentPhaseName,
  onCardSelected,
  showToast,
}) => {
  // Modes: 3-Card Reading, Interactive Fan (all 22), Full Deck Grid (all 22)
  const [mode, setMode] = useState<"three_spread" | "fan_pick" | "all_cards">("three_spread");

  // Shuffling animation state
  const [isShuffling, setIsShuffling] = useState(false);

  // Filter for all_cards mode
  const [phaseFilter, setPhaseFilter] = useState<string>("all");

  // 3-Card spread cards (Energy/Mind, Fuel, Sleep/Rest)
  const [spreadCards, setSpreadCards] = useState<FullTarotCard[]>([
    FULL_TAROT_DECK[2], // II High Priestess
    FULL_TAROT_DECK[3], // III Empress
    FULL_TAROT_DECK[18], // XVIII The Moon
  ]);

  // Which cards in the 3-card spread are flipped face-up
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: false, // 3rd card starts face-down so user can click to flip!
  });

  // Selected card for modal inspection
  const [inspectCard, setInspectCard] = useState<FullTarotCard | null>(null);

  // Selected card in fan mode
  const [selectedFanCard, setSelectedFanCard] = useState<FullTarotCard | null>(FULL_TAROT_DECK[19]); // The Sun default

  // Hovered card index in fan mode
  const [hoveredFanIdx, setHoveredFanIdx] = useState<number | null>(null);

  const handleShuffle = () => {
    setIsShuffling(true);
    setFlippedCards({ 0: false, 1: false, 2: false });
    setSelectedFanCard(null);

    setTimeout(() => {
      // Pick 3 unique random cards from the full 22-card deck
      const shuffled = [...FULL_TAROT_DECK].sort(() => Math.random() - 0.5);
      setSpreadCards([shuffled[0], shuffled[1], shuffled[2]]);
      setSelectedFanCard(shuffled[3]);

      setIsShuffling(false);

      // Auto-reveal cards 1 and 2, leaving card 3 face down to flip
      setTimeout(() => {
        setFlippedCards({ 0: true, 1: true, 2: false });
        showToast("✨ Shuffled all 22 cards! Tap Card 3 to reveal tonight's recovery advice.", "success");
      }, 350);
    }, 650);
  };

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleFanSelect = (card: FullTarotCard) => {
    setSelectedFanCard(card);
    if (onCardSelected) onCardSelected(card);
    showToast(`✨ Drawn: ${card.name} (${card.subtitle})!`, "success");
  };

  // Filtered cards for the 22-card grid
  const filteredGridCards = FULL_TAROT_DECK.filter((card) => {
    if (phaseFilter === "all") return true;
    return card.phase.toLowerCase() === phaseFilter.toLowerCase() || card.phase === "All Phases";
  });

  return (
    <section className="bg-surface-container-lowest/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(148,69,91,0.06)] border border-surface-container-high/60 relative overflow-hidden space-y-8">
      {/* Soft ambient background glows */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -top-20 w-80 h-80 bg-secondary-container/30 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 gap-4 relative z-10 border-b border-surface-container/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-primary-fixed text-primary font-label-caps text-xs font-semibold uppercase tracking-wider">
              Full 22-Card Major Arcana
            </span>
            <span className="font-label-caps text-on-surface-variant text-xs">
              Today's Vibe & Energy
            </span>
          </div>
          <h2 className="font-headline-lg text-2xl sm:text-3xl text-on-surface tracking-tight font-bold">
            Daily Tarot & Mindset Draw ✨
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="bg-surface-container-low p-1 rounded-full flex items-center border border-surface-container-high/60">
            <button
              type="button"
              onClick={() => setMode("three_spread")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                mode === "three_spread"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              3-Card Reading
            </button>
            <button
              type="button"
              onClick={() => setMode("fan_pick")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                mode === "fan_pick"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Interactive Fan (22)
            </button>
            <button
              type="button"
              onClick={() => setMode("all_cards")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                mode === "all_cards"
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              All 22 Cards Grid
            </button>
          </div>

          {/* Shuffle button with spin */}
          <button
            type="button"
            onClick={handleShuffle}
            disabled={isShuffling}
            className={`flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-label-lg text-sm font-semibold shadow-md hover:shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer ${
              isShuffling ? "opacity-75" : ""
            }`}
          >
            <span
              className={`material-symbols-outlined text-base ${
                isShuffling ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"
              }`}
            >
              auto_awesome
            </span>
            <span>{isShuffling ? "Shuffling..." : "Shuffle Deck ✨"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: Three-Card Spread (Energy & Mind, Fuel & Food, Rest & Recovery) */}
      {/* ========================================================================= */}
      {mode === "three_spread" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span>Tap any card to flip between its celestial back and full wisdom face</span>
            <span className="hidden sm:inline">3-Card Cycle Spread: Mind · Fuel · Rest</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 items-stretch">
            {spreadCards.map((card, idx) => {
              const isFlipped = flippedCards[idx] ?? false;
              const slotLabel =
                idx === 0
                  ? "Card 1 // Energy & Mind"
                  : idx === 1
                  ? "Card 2 // Fuel & Nutrition"
                  : "Card 3 // Rest & Recovery";

              return (
                <div
                  key={card.id + idx}
                  className={`relative group transition-all duration-300 ${
                    isShuffling ? "animate-pulse scale-95 opacity-60" : "hover:-translate-y-1.5"
                  }`}
                  style={{ perspective: "1200px" }}
                >
                  {/* Slot label header */}
                  <div className="flex items-center justify-between pb-2 px-1">
                    <span className="font-label-caps text-xs text-primary font-semibold uppercase tracking-wider">
                      {slotLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleFlip(idx)}
                      className="text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>{isFlipped ? "Flip to hide" : "Tap to flip"}</span>
                      <span className="material-symbols-outlined text-sm">sync</span>
                    </button>
                  </div>

                  {/* 3D Flip Container */}
                  <div
                    onClick={() => toggleFlip(idx)}
                    className="w-full relative transition-transform duration-700 rounded-3xl shadow-[0_12px_36px_rgba(0,0,0,0.06)] group-hover:shadow-[0_20px_45px_rgba(148,69,91,0.14)] cursor-pointer"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)",
                      minHeight: "520px",
                    }}
                  >
                    {/* CARD FRONT FACE (Full Details) */}
                    <div
                      className="w-full h-full rounded-3xl bg-surface-container-lowest p-6 flex flex-col justify-between border-2 border-primary-container/50 relative overflow-hidden"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                      }}
                    >
                      {/* Corner Accents */}
                      <span className="absolute top-2.5 left-3 text-xs text-primary/40 font-serif">✧</span>
                      <span className="absolute top-2.5 right-3 text-xs text-primary/40 font-serif">✧</span>
                      <span className="absolute bottom-2.5 left-3 text-xs text-primary/40 font-serif">✧</span>
                      <span className="absolute bottom-2.5 right-3 text-xs text-primary/40 font-serif">✧</span>

                      <div className="space-y-3">
                        {/* Header: Numeral & Phase */}
                        <div className="flex items-center justify-between border-b border-surface-container pb-2 pt-1">
                          <span className="font-serif font-bold text-lg text-primary">
                            Arcana {card.numeral}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed/50 text-primary font-label-caps text-xs font-semibold">
                            {card.phase}
                          </span>
                        </div>

                        {/* Card Emblem Illustration */}
                        <div className="w-full h-32 rounded-2xl bg-gradient-to-tr from-primary-fixed/40 via-surface-container to-secondary-container/30 flex flex-col items-center justify-center p-3 text-center border border-primary-container/30 relative">
                          <div className="w-13 h-13 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-primary mb-1">
                            <span className="material-symbols-outlined text-3xl">
                              {card.cardIcon || "spa"}
                            </span>
                          </div>
                          <span className="font-label-caps text-[11px] text-secondary font-semibold uppercase tracking-wider">
                            {card.theme}
                          </span>
                        </div>

                        {/* Title & Tagline */}
                        <div>
                          <h3 className="font-headline-sm text-xl text-on-surface font-bold">
                            {card.name}
                          </h3>
                          <p className="font-label-caps text-xs text-primary font-medium mt-0.5">
                            {card.subtitle}
                          </p>
                          <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed mt-2">
                            "{card.meaning}"
                          </p>
                        </div>
                      </div>

                      {/* Bottom Practical Wisdom */}
                      <div className="pt-3 border-t border-surface-container space-y-2 mt-2">
                        <div className="flex items-start gap-1.5 text-xs text-on-surface">
                          <span className="text-secondary font-semibold min-w-max">Movement:</span>
                          <span className="text-on-surface-variant">{card.bodyAdvice}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-xs text-on-surface">
                          <span className="text-primary font-semibold min-w-max">Fuel & Food:</span>
                          <span className="text-on-surface-variant">{card.foodAdvice}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface-container-low text-xs text-primary font-medium italic text-center border border-primary-container/30">
                          "{card.affirmation}"
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectCard(card);
                          }}
                          className="w-full py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-caps text-[11px] text-center transition-colors font-medium flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-xs">visibility</span>
                          <span>Inspect Full Wisdom</span>
                        </button>
                      </div>
                    </div>

                    {/* CARD BACK FACE (Celestial Gold Foil Look) */}
                    <div
                      className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-surface-container via-surface-container-high to-primary-fixed/40 p-6 flex flex-col justify-between items-center text-center border-2 border-primary/30"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <div className="flex items-center justify-between w-full text-xs text-primary font-serif">
                        <span>✦ AURA</span>
                        <span>NYMPH ✦</span>
                      </div>

                      {/* Celestial Pattern */}
                      <div className="w-full flex-1 my-3 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-md flex flex-col items-center justify-center p-5 border border-primary/20 space-y-3">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-primary-container text-on-primary flex items-center justify-center shadow-lg animate-pulse">
                          <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                        </div>
                        <h4 className="font-serif font-bold text-lg text-primary tracking-wide">
                          Tap to Reveal
                        </h4>
                        <p className="font-body-sm text-xs text-on-surface-variant max-w-[200px] leading-relaxed">
                          Unveil today's body & energy reading ✨
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-label-caps text-secondary font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                        <span>Ready to Unveil</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: Interactive Fanned Deck (All 22 Major Arcana Cards in a Fan)      */}
      {/* ========================================================================= */}
      {mode === "fan_pick" && (
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface">
              Interactive 22-Card Fanned Deck
            </h3>
            <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto">
              Hover over cards to see them lift and tilt. Click any card to draw and inspect its guidance!
            </p>
          </div>

          {/* Fanned Cards Scrollable Stage */}
          <div className="relative h-80 flex items-center justify-center overflow-x-auto overflow-y-visible py-8 px-4 no-scrollbar">
            <div className="flex items-center justify-center -space-x-8 sm:-space-x-7 px-8 min-w-max py-4">
              {FULL_TAROT_DECK.map((card, idx) => {
                const total = FULL_TAROT_DECK.length;
                const mid = (total - 1) / 2;
                const offset = idx - mid;
                const rotateDeg = offset * 2.8;
                const translatePx = Math.abs(offset) * 2.5;
                const isHovered = hoveredFanIdx === idx;
                const isSelected = selectedFanCard?.id === card.id;

                return (
                  <div
                    key={card.id}
                    onMouseEnter={() => setHoveredFanIdx(idx)}
                    onMouseLeave={() => setHoveredFanIdx(null)}
                    onClick={() => handleFanSelect(card)}
                    className={`w-32 sm:w-36 h-56 sm:h-60 rounded-2xl p-3 shadow-lg border-2 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-300 flex-shrink-0 relative ${
                      isSelected
                        ? "border-primary ring-4 ring-primary/30 z-30 -translate-y-8 scale-110 bg-surface-container-lowest"
                        : isHovered
                        ? "border-primary-container z-20 -translate-y-6 scale-110 bg-surface-container-lowest shadow-2xl"
                        : "border-primary/30 bg-gradient-to-br from-surface-container via-surface-container-high to-primary-fixed/40 hover:z-20"
                    }`}
                    style={{
                      transform: isSelected || isHovered
                        ? `translateY(-28px) scale(1.12)`
                        : `rotate(${rotateDeg}deg) translateY(${translatePx}px)`,
                    }}
                  >
                    {/* Top numeral */}
                    <span className="font-serif text-[11px] text-primary font-bold">
                      {card.numeral}
                    </span>

                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm border border-primary/20">
                      <span className="material-symbols-outlined text-2xl">
                        {card.cardIcon || "spa"}
                      </span>
                    </div>

                    {/* Card Title */}
                    <div>
                      <h4 className="font-headline-sm text-xs font-bold text-on-surface truncate max-w-[110px]">
                        {card.name}
                      </h4>
                      <span className="font-label-caps text-[9px] text-secondary font-semibold uppercase block truncate max-w-[110px]">
                        {card.theme}
                      </span>
                    </div>

                    <span className="font-label-caps text-[9px] text-primary font-medium">
                      {isSelected ? "✦ Active Draw" : "Tap to Draw"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Stage Card Feature when a card is selected */}
          {selectedFanCard && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary-fixed/30 via-surface-container to-secondary-container/30 border border-primary-container flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
              <div className="flex items-center gap-5">
                {/* Visual miniature card */}
                <div className="w-20 h-28 rounded-2xl bg-surface-container-lowest p-2 shadow-lg flex flex-col justify-between items-center text-center border-2 border-primary/40 flex-shrink-0">
                  <span className="font-serif text-xs text-primary font-bold">
                    {selectedFanCard.numeral}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-primary-fixed/30 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-xl">
                      {selectedFanCard.cardIcon || "spa"}
                    </span>
                  </div>
                  <span className="font-label-caps text-[9px] text-secondary font-semibold">
                    {selectedFanCard.phase}
                  </span>
                </div>

                {/* Card text */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-headline-sm text-xl font-bold text-on-surface">
                      {selectedFanCard.name}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-label-caps text-xs">
                      {selectedFanCard.subtitle}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-caps text-xs text-on-surface-variant">
                      Phase: {selectedFanCard.phase}
                    </span>
                  </div>
                  <p className="font-body-sm text-sm text-on-surface-variant max-w-xl leading-relaxed">
                    "{selectedFanCard.meaning}"
                  </p>
                  <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
                    <span className="text-secondary font-semibold">
                      Movement: {selectedFanCard.bodyAdvice}
                    </span>
                    <span className="text-primary font-semibold">
                      Fuel: {selectedFanCard.foodAdvice}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInspectCard(selectedFanCard)}
                  className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-lg text-sm font-semibold hover:bg-on-primary-container transition-all cursor-pointer whitespace-nowrap shadow-md flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">fullscreen</span>
                  <span>Inspect Card</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: All 22 Cards Grid Gallery (Full Visibility & Easy Browsing)       */}
      {/* ========================================================================= */}
      {mode === "all_cards" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface">
                Complete 22-Card Major Arcana Gallery
              </h3>
              <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
                Browse every archetype from The Fool (0) to The World (XXI). Tap any card to view its complete guidance!
              </p>
            </div>

            {/* Phase Filters */}
            <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-full border border-surface-container-high/60 flex-wrap">
              {["all", "Menstrual", "Follicular", "Ovulatory", "Luteal"].map((phaseKey) => (
                <button
                  key={phaseKey}
                  type="button"
                  onClick={() => setPhaseFilter(phaseKey)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    phaseFilter === phaseKey
                      ? "bg-surface-container-lowest text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {phaseKey === "all" ? "All (22)" : phaseKey}
                </button>
              ))}
            </div>
          </div>

          {/* Responsive Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredGridCards.map((card) => (
              <div
                key={card.id}
                onClick={() => setInspectCard(card)}
                className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high hover:border-primary shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all cursor-pointer flex flex-col justify-between items-center text-center group"
              >
                <div className="flex items-center justify-between w-full pb-2 text-[11px] font-serif font-bold text-primary">
                  <span>{card.numeral}</span>
                  <span className="font-label-caps text-[9px] text-on-surface-variant px-1.5 py-0.5 rounded bg-surface-container">
                    {card.phase}
                  </span>
                </div>

                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary-fixed/40 via-surface-container to-secondary-container/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform my-2">
                  <span className="material-symbols-outlined text-2xl">
                    {card.cardIcon || "spa"}
                  </span>
                </div>

                <div className="w-full">
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface truncate">
                    {card.name}
                  </h4>
                  <p className="font-label-caps text-[10px] text-secondary font-medium truncate mt-0.5">
                    {card.subtitle}
                  </p>
                </div>

                <div className="w-full mt-3 pt-2 border-t border-surface-container flex items-center justify-center gap-1 text-[11px] text-primary font-medium opacity-80 group-hover:opacity-100">
                  <span>Read Card</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL CARD INSPECTION MODAL (Complete Visibility, No Overflow/Truncation)   */}
      {/* ========================================================================= */}
      {inspectCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-primary-container relative max-h-[90vh] overflow-y-auto space-y-5">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setInspectCard(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Card Header */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-primary-fixed text-primary font-serif font-bold text-sm">
                Arcana {inspectCard.numeral}
              </span>
              <span className="px-3 py-1 rounded-full bg-secondary-container/50 text-secondary font-label-caps text-xs font-semibold">
                {inspectCard.phase}
              </span>
            </div>

            {/* Big Emblem & Name */}
            <div className="flex items-center gap-4 pt-1">
              <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-primary-fixed via-surface-container to-secondary-container/40 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                <span className="material-symbols-outlined text-4xl">
                  {inspectCard.cardIcon || "spa"}
                </span>
              </div>
              <div>
                <h3 className="font-headline-lg text-2xl font-bold text-on-surface">
                  {inspectCard.name}
                </h3>
                <p className="font-label-caps text-sm text-primary font-medium mt-0.5">
                  {inspectCard.subtitle}
                </p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-surface-container font-label-caps text-[11px] text-secondary font-semibold">
                  Theme: {inspectCard.theme}
                </span>
              </div>
            </div>

            {/* Meaning Paragraph */}
            <div className="p-4 rounded-2xl bg-surface-container-low/70 border border-surface-container-high/60 space-y-1.5">
              <span className="font-label-caps text-xs text-primary font-semibold uppercase">
                Daily Archetype & Wisdom
              </span>
              <p className="font-body-md text-sm text-on-surface leading-relaxed">
                "{inspectCard.meaning}"
              </p>
            </div>

            {/* Movement & Food Guidance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-secondary-container/20 border border-secondary/20 space-y-1">
                <div className="flex items-center gap-1.5 text-secondary font-label-caps text-xs font-semibold uppercase">
                  <span className="material-symbols-outlined text-sm">fitness_center</span>
                  <span>Movement Advice</span>
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  {inspectCard.bodyAdvice}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-primary-fixed/20 border border-primary/20 space-y-1">
                <div className="flex items-center gap-1.5 text-primary font-label-caps text-xs font-semibold uppercase">
                  <span className="material-symbols-outlined text-sm">restaurant</span>
                  <span>Fuel & Food</span>
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  {inspectCard.foodAdvice}
                </p>
              </div>
            </div>

            {/* Daily Affirmation */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-fixed/30 to-secondary-container/30 text-center border border-primary/20 space-y-1">
              <span className="font-label-caps text-[11px] text-primary uppercase font-bold tracking-wider">
                Daily Affirmation
              </span>
              <p className="font-headline-sm text-sm text-primary font-semibold italic">
                "{inspectCard.affirmation}"
              </p>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => {
                showToast(`✨ Chose ${inspectCard.name} for today's mindset focus!`, "success");
                setInspectCard(null);
              }}
              className="w-full py-3 rounded-full bg-primary text-on-primary font-label-lg text-sm font-semibold hover:bg-on-primary-container transition-all cursor-pointer shadow-md"
            >
              Set as Today's Focus Card ✨
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
