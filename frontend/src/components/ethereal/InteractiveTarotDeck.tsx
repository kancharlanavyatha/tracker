import React, { useState } from "react";
import { FULL_TAROT_DECK, type FullTarotCard } from "../../data/tarotDeck";
import { EtherealTarotCard } from "./EtherealTarotCard";

interface InteractiveTarotDeckProps {
  currentPhaseName: string;
  onCardSelected?: (card: FullTarotCard) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  onClose?: () => void;
}

export const InteractiveTarotDeck: React.FC<InteractiveTarotDeckProps> = ({
  currentPhaseName,
  onCardSelected,
  showToast,
  onClose,
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
  const [selectedFanCard, setSelectedFanCard] = useState<FullTarotCard | null>(FULL_TAROT_DECK[3]); // The Empress default

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
        showToast("Shuffled all 22 cards! Tap Card 3 to reveal tonight's recovery advice.", "success");
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
    showToast(`Drawn: ${card.name} (${card.subtitle})!`, "success");
  };

  // Filtered cards for the 22-card grid
  const filteredGridCards = FULL_TAROT_DECK.filter((card) => {
    if (phaseFilter === "all") return true;
    return card.phase.toLowerCase() === phaseFilter.toLowerCase() || card.phase === "All Phases";
  });

  return (
    <section className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 lg:p-10 shadow-[0_20px_60px_rgba(215,205,190,0.35)] border border-[#E8DFD0] relative overflow-hidden space-y-8">
      {/* Soft ambient champagne glows */}
      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#FAF3E0]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -top-20 w-80 h-80 bg-[#F5EFE6]/50 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 gap-4 relative z-10 border-b border-[#F0EAE1]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DFD0] text-[#8C734B] font-label-caps text-xs font-semibold uppercase tracking-wider">
              SELENE Daily Tarot & Reflection
            </span>
            <span className="font-label-caps text-[#7A6E65] text-xs">
              Gentle Daily Wisdom for Body and Mind
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2825] tracking-tight font-bold">
            Daily Tarot & Mindset Sanctuary
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#E8DFD0] text-[#4A423A] font-label-caps text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm text-[#8C734B]">arrow_back</span>
              <span>Back to Dashboard</span>
            </button>
          )}

          {/* Mode Switcher */}
          <div className="bg-[#FAF7F2] p-1 rounded-full flex items-center border border-[#E8DFD0]">
            <button
              type="button"
              onClick={() => setMode("three_spread")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                mode === "three_spread"
                  ? "bg-white text-[#8C734B] shadow-sm border border-[#E8DFD0]"
                  : "text-[#7A6E65] hover:text-[#2C2825]"
              }`}
            >
              3-Card Reading
            </button>
            <button
              type="button"
              onClick={() => setMode("fan_pick")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                mode === "fan_pick"
                  ? "bg-white text-[#8C734B] shadow-sm border border-[#E8DFD0]"
                  : "text-[#7A6E65] hover:text-[#2C2825]"
              }`}
            >
              Interactive Fan (22)
            </button>
            <button
              type="button"
              onClick={() => setMode("all_cards")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                mode === "all_cards"
                  ? "bg-white text-[#8C734B] shadow-sm border border-[#E8DFD0]"
                  : "text-[#7A6E65] hover:text-[#2C2825]"
              }`}
            >
              All 22 Cards Grid
            </button>
          </div>

          {/* Shuffle button */}
          <button
            type="button"
            onClick={handleShuffle}
            disabled={isShuffling}
            className={`flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#9A7B38] to-[#8C734B] text-white font-label-lg text-sm font-semibold shadow-md hover:shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer ${
              isShuffling ? "opacity-75" : ""
            }`}
          >
            <span
              className={`material-symbols-outlined text-base ${
                isShuffling ? "animate-spin" : ""
              }`}
            >
              auto_awesome
            </span>
            <span>{isShuffling ? "Shuffling..." : "Shuffle Deck"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: Three-Card Spread (Energy & Mind, Food & Nutrition Tip, Rest & Recovery) */}
      {/* ========================================================================= */}
      {mode === "three_spread" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#7A6E65]">
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
                <EtherealTarotCard
                  key={card.id + idx}
                  card={card}
                  isFlipped={isFlipped}
                  onFlip={() => toggleFlip(idx)}
                  onInspect={() => setInspectCard(card)}
                  slotLabel={slotLabel}
                  showAdvice={true}
                  size="md"
                  className={isShuffling ? "animate-pulse scale-95 opacity-60" : "hover:-translate-y-1.5"}
                />
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
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2C2825]">
              Interactive 22-Card Fanned Deck
            </h3>
            <p className="font-body-sm text-xs sm:text-sm text-[#7A6E65] max-w-lg mx-auto">
              Hover over cards to see them lift in an Art Nouveau fan. Click any card to draw and inspect its guidance.
            </p>
          </div>

          {/* Fanned Cards Scrollable Stage */}
          <div className="relative h-84 flex items-center justify-center overflow-x-auto overflow-y-visible py-8 px-4 no-scrollbar">
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
                    className={`w-32 sm:w-36 h-56 sm:h-60 rounded-t-[2.5rem] rounded-b-xl p-3 border-[1.5px] flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-300 flex-shrink-0 relative ${
                      isSelected
                        ? "border-[#9A7B38] ring-4 ring-[#9A7B38]/25 z-30 -translate-y-8 scale-110 bg-white shadow-2xl"
                        : isHovered
                        ? "border-[#D4AF37] z-20 -translate-y-6 scale-110 bg-white shadow-xl"
                        : "border-[#E8DFD0] bg-gradient-to-b from-white to-[#FAF7F2] shadow-md hover:z-20"
                    }`}
                    style={{
                      transform: isSelected || isHovered
                        ? `translateY(-28px) scale(1.12)`
                        : `rotate(${rotateDeg}deg) translateY(${translatePx}px)`,
                    }}
                  >
                    {/* Top Roman Numeral */}
                    <span className="font-serif text-[11px] text-[#8C734B] font-bold tracking-widest">
                      {card.numeral}
                    </span>

                    {/* Celestial Arch Centerpiece */}
                    <div className="w-12 h-14 rounded-t-full rounded-b-md border border-[#D4AF37]/40 bg-[#FAF7F2] flex items-center justify-center text-[#8C734B] shadow-sm">
                      <span className="material-symbols-outlined text-2xl">
                        {card.cardIcon || "spa"}
                      </span>
                    </div>

                    {/* Card Title */}
                    <div>
                      <h4 className="font-serif text-xs font-bold text-[#2C2825] truncate max-w-[110px] tracking-wide">
                        {card.name}
                      </h4>
                      <span className="font-label-caps text-[9px] text-[#8C734B] font-semibold uppercase block truncate max-w-[110px] mt-0.5">
                        {card.theme}
                      </span>
                    </div>

                    <span className="font-label-caps text-[9px] text-[#8C734B] font-medium">
                      {isSelected ? "Active Draw" : "Tap to Draw"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Card Showcase Preview */}
          {selectedFanCard && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8DFD0] flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_12px_36px_rgba(215,205,190,0.3)]">
              <div className="flex items-center gap-5">
                {/* Mini Arched Card Preview */}
                <div className="w-24 h-36 rounded-t-[2.5rem] rounded-b-xl bg-white p-1.5 shadow-md flex flex-col justify-between items-center text-center border-[1.5px] border-[#D4AF37]/50 flex-shrink-0">
                  <span className="font-serif text-[11px] text-[#8C734B] font-bold">
                    {selectedFanCard.numeral}
                  </span>
                  <div className="w-full h-16 rounded-t-[2.2rem] rounded-b-sm overflow-hidden border border-[#E8DFD0]">
                    <img
                      src={selectedFanCard.artUrl}
                      alt={selectedFanCard.name}
                      className="w-full h-full object-cover object-top"
                      style={{
                        filter: "brightness(1.12) contrast(0.92) saturate(0.55) sepia(0.08)",
                      }}
                    />
                  </div>
                  <span className="font-serif text-[10px] text-[#2C2825] font-bold truncate max-w-[80px]">
                    {selectedFanCard.name}
                  </span>
                </div>

                {/* Card Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-serif text-xl font-bold text-[#2C2825]">
                      {selectedFanCard.name}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E8DFD0] text-[#8C734B] font-label-caps text-xs">
                      {selectedFanCard.subtitle}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E8DFD0] font-label-caps text-xs text-[#7A6E65]">
                      Phase: {selectedFanCard.phase}
                    </span>
                  </div>
                  <p className="font-body-sm text-sm text-[#6B6158] max-w-xl leading-relaxed italic">
                    "{selectedFanCard.meaning}"
                  </p>
                  <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
                    <span className="text-[#8C734B] font-semibold">
                      Movement: {selectedFanCard.bodyAdvice}
                    </span>
                    <span className="text-[#6B6158]">
                      Fuel: {selectedFanCard.foodAdvice}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInspectCard(selectedFanCard)}
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#9A7B38] to-[#8C734B] text-white font-label-lg text-sm font-semibold hover:shadow-lg transition-all cursor-pointer whitespace-nowrap shadow-md flex items-center gap-2"
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
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2C2825]">
                Explore All 22 Tarot Cards
              </h3>
              <p className="font-body-sm text-xs sm:text-sm text-[#7A6E65]">
                Browse all 22 cards from The Fool to The World. Tap any card for guidance.
              </p>
            </div>

            {/* Phase Filters */}
            <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-full border border-[#E8DFD0] flex-wrap">
              {["all", "Menstrual", "Follicular", "Ovulatory", "Luteal"].map((phaseKey) => (
                <button
                  key={phaseKey}
                  type="button"
                  onClick={() => setPhaseFilter(phaseKey)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    phaseFilter === phaseKey
                      ? "bg-white text-[#8C734B] shadow-sm border border-[#E8DFD0]"
                      : "text-[#7A6E65] hover:text-[#2C2825]"
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
                className="bg-white rounded-2xl p-3 border-[1.5px] border-[#E8DFD0] hover:border-[#D4AF37] shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all cursor-pointer flex flex-col justify-between items-center text-center group"
              >
                {/* Header: Roman Numeral & Phase */}
                <div className="flex items-center justify-between w-full pb-1.5 text-[11px] font-serif font-bold text-[#8C734B]">
                  <span>{card.numeral}</span>
                  <span className="font-label-caps text-[9px] text-[#7A6E65] px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#E8DFD0]">
                    {card.phase}
                  </span>
                </div>

                {/* Art Nouveau Arched Window */}
                <div className="w-full rounded-t-[2.2rem] rounded-b-lg border border-[#D4AF37]/45 p-0.5 bg-[#FAF7F2] shadow-inner mb-2">
                  <div className="w-full h-28 rounded-t-[2rem] rounded-b-md overflow-hidden relative">
                    <img
                      src={card.artUrl}
                      alt={card.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      style={{
                        filter: "brightness(1.12) contrast(0.92) saturate(0.55) sepia(0.08)",
                      }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-1 left-2 text-[9px] text-[#4A423A] font-serif italic truncate max-w-[90%]">
                      {card.artArtist.split(',')[0]}
                    </span>
                  </div>
                </div>

                <div className="w-full">
                  <h4 className="font-serif text-xs font-bold text-[#2C2825] truncate tracking-wide">
                    {card.name}
                  </h4>
                  <p className="font-label-caps text-[10px] text-[#8C734B] font-medium truncate mt-0.5">
                    {card.subtitle}
                  </p>
                </div>

                <div className="w-full mt-2.5 pt-1.5 border-t border-[#F0EAE1] flex items-center justify-center gap-1 text-[11px] text-[#8C734B] font-medium opacity-80 group-hover:opacity-100">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-[1.5px] border-[#E8DFD0] relative max-h-[90vh] overflow-y-auto space-y-5">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setInspectCard(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#E8DFD0] flex items-center justify-center text-[#4A423A] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>

            {/* Modal Card Header */}
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DFD0] text-[#8C734B] font-serif font-bold text-sm">
                Arcana {inspectCard.numeral}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E8DFD0] text-[#7A6E65] font-label-caps text-xs font-semibold">
                {inspectCard.phase} Phase
              </span>
            </div>

            {/* Large Art Nouveau Arched Window Frame */}
            <div className="w-full rounded-t-[3.5rem] rounded-b-xl border-[1.5px] border-[#D4AF37]/50 p-1 bg-gradient-to-b from-[#FDFBF7] to-[#F8F5EE] shadow-inner">
              <div className="w-full h-64 rounded-t-[3.2rem] rounded-b-lg border border-[#C5A059]/30 overflow-hidden relative">
                <img
                  src={inspectCard.artUrl}
                  alt={inspectCard.name}
                  className="w-full h-full object-cover object-top"
                  style={{
                    filter: "brightness(1.12) contrast(0.92) saturate(0.55) sepia(0.08)",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent pointer-events-none" />

                {/* Starlight spark at apex */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm border border-[#D4AF37]/40 flex items-center justify-center text-[#8C734B] shadow-sm">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[#2C2825]">
                  <span className="font-serif italic text-xs tracking-wide text-[#4A423A] bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-[#E8DFD0]">
                    {inspectCard.artArtist}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-[#8C734B] border border-[#D4AF37]/30">
                    {inspectCard.theme}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-2xl font-bold text-[#2C2825] tracking-wide">
                {inspectCard.name}
              </h3>
              <p className="font-label-caps text-sm text-[#8C734B] font-medium mt-0.5">
                {inspectCard.subtitle}
              </p>
            </div>

            {/* Meaning Paragraph */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD0] space-y-1.5">
              <span className="font-label-caps text-xs text-[#8C734B] font-semibold uppercase">
                Today's Meaning & Message
              </span>
              <p className="font-serif italic text-sm text-[#4A423A] leading-relaxed">
                "{inspectCard.meaning}"
              </p>
            </div>

            {/* Movement & Food Guidance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-[#E8DFD0] space-y-1 shadow-sm">
                <div className="flex items-center gap-1.5 text-[#8C734B] font-label-caps text-xs font-semibold uppercase">
                  <span className="material-symbols-outlined text-sm">fitness_center</span>
                  <span>Movement Tip</span>
                </div>
                <p className="font-body-sm text-xs text-[#6B6158] leading-relaxed">
                  {inspectCard.bodyAdvice}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E8DFD0] space-y-1 shadow-sm">
                <div className="flex items-center gap-1.5 text-[#8C734B] font-label-caps text-xs font-semibold uppercase">
                  <span className="material-symbols-outlined text-sm">restaurant</span>
                  <span>Food & Nutrition Tip</span>
                </div>
                <p className="font-body-sm text-xs text-[#6B6158] leading-relaxed">
                  {inspectCard.foodAdvice}
                </p>
              </div>
            </div>

            {/* Daily Affirmation */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] text-center border border-[#E8DFD0] space-y-1">
              <span className="font-label-caps text-[11px] text-[#8C734B] uppercase font-bold tracking-wider">
                Daily Affirmation
              </span>
              <p className="font-serif text-sm text-[#2C2825] font-semibold italic">
                "{inspectCard.affirmation}"
              </p>
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => {
                showToast(`Chose ${inspectCard.name} for today's mindset focus!`, "success");
                if (onCardSelected) onCardSelected(inspectCard);
                setInspectCard(null);
              }}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#9A7B38] to-[#8C734B] text-white font-label-lg text-sm font-semibold hover:shadow-lg transition-all cursor-pointer shadow-md"
            >
              Choose This Card for Today
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
