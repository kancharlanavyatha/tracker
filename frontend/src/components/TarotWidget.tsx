import React, { useState } from 'react';

interface TarotCard {
  id: string;
  name: string;
  numeral: string;
  archetype: string;
  phaseResonance: string;
  quote: string;
  insight: string;
  affirmation: string;
  bodyWisdom: string;
  color: string;
}

const DECK: TarotCard[] = [
  {
    id: 'empress',
    name: 'The Empress',
    numeral: 'III',
    archetype: 'The Radiant Creator',
    phaseResonance: 'Follicular & Ovulation',
    quote: 'Abundance flows freely when you bloom in your own time.',
    insight: 'Your creative energy and magnetic presence are expanding. Like spring bursting into flower, your body is cultivating vitality and fresh possibilities.',
    affirmation: 'I embrace my vibrant energy and nurture the creations closest to my heart.',
    bodyWisdom: 'High estrogen stimulates creativity and social connection. Ideal time for brainstorming and joyful movement.',
    color: '#10b981',
  },
  {
    id: 'high-priestess',
    name: 'The High Priestess',
    numeral: 'II',
    archetype: 'The Intuitive Oracle',
    phaseResonance: 'Menstrual Phase',
    quote: 'In quiet stillness, the answers you seek whisper clearly.',
    insight: 'The veil between conscious doing and quiet knowing is thin today. Take time to pause, listen to your instincts, and replenish your inner reservoir.',
    affirmation: "I honor my body's desire for rest and trust my deep internal intuition.",
    bodyWisdom: 'Progesterone and estrogen are at baseline. Restful sleep, hydration, and slow stretching revitalize your nervous system.',
    color: '#8b5cf6',
  },
  {
    id: 'sun',
    name: 'The Sun',
    numeral: 'XIX',
    archetype: 'The Joyful Luminary',
    phaseResonance: 'Ovulation Peak',
    quote: 'Step into the warmth of your own light and shine unapologetically.',
    insight: 'Vitality, optimism, and warmth illuminate your path. Celebrate how far you have come and allow others to witness your strength and brilliance.',
    affirmation: 'I radiate warmth, confidence, and vibrant health in every cell of my body.',
    bodyWisdom: 'Peak testosterone and estrogen give you maximum physical endurance, mental sharpness, and charisma.',
    color: '#f59e0b',
  },
  {
    id: 'strength',
    name: 'Strength',
    numeral: 'VIII',
    archetype: 'The Compassionate Warrior',
    phaseResonance: 'Luteal Phase',
    quote: 'True strength is gentle, patient, and grounded in self-kindness.',
    insight: 'Taming intense emotions requires compassion, not force. When impatience or sensitivity rises, wrap yourself in patience and grounded breath.',
    affirmation: 'I meet any emotional waves with tenderness, grace, and steady resilience.',
    bodyWisdom: 'Progesterone increases metabolic rate and core temperature. Prioritize slow resistance work, magnesium, and restorative warmth.',
    color: '#ec4899',
  },
  {
    id: 'star',
    name: 'The Star',
    numeral: 'XVII',
    archetype: 'The Cosmic Healer',
    phaseResonance: 'Recovery & Balance',
    quote: 'Hope and restoration pour like clear water into your spirit.',
    insight: 'Healing is not linear; it is a gentle unfolding. Trust that you are renewing your equilibrium with every mindful breath and balanced meal.',
    affirmation: 'I am safe in my body, renewed each day, and guided toward peace.',
    bodyWisdom: 'Deep sleep, whole foods, and mindful screen breaks lower cortisol and protect adrenal health.',
    color: '#06b6d4',
  },
  {
    id: 'temperance',
    name: 'Temperance',
    numeral: 'XIV',
    archetype: 'The Sacred Alchemist',
    phaseResonance: 'Luteal Transition',
    quote: 'Harmony is found when every rhythm has its honoured place.',
    insight: 'Balancing activity with recovery creates lasting stamina. You do not need to push constantly; rhythmic pacing is your true superpower.',
    affirmation: 'I blend effort with ease, honoring every transition of my natural cycle.',
    bodyWisdom: 'Complex carbohydrates, herbal teas, and warm baths harmonize neurotransmitters during hormone shifts.',
    color: '#6366f1',
  },
  {
    id: 'wheel-of-fortune',
    name: 'Wheel of Fortune',
    numeral: 'X',
    archetype: 'The Rhythmic Tide',
    phaseResonance: 'Cycle Shift & Transitions',
    quote: 'The wheel turns, tides recede and rise, and every season is blessed.',
    insight: 'Life and hormones move in sacred cycles. Welcoming change rather than resisting it allows you to ride each wave with ease and poise.',
    affirmation: 'I flow gracefully with the shifting seasons of my body and life.',
    bodyWisdom: 'Tracking your cycle patterns removes mystery, replacing anxiety with empowered self-attunement.',
    color: '#14b8a6',
  },
  {
    id: 'magician',
    name: 'The Magician',
    numeral: 'I',
    archetype: 'The Conscious Alchemist',
    phaseResonance: 'Follicular Momentum',
    quote: 'You possess all the tools needed to manifest your intentions.',
    insight: 'Focus your intent. Clear direction paired with rising mental energy creates magic in your workouts, projects, and personal rituals.',
    affirmation: 'I have the focus, resources, and clarity to create positive change.',
    bodyWisdom: 'Rising estrogen enhances neuroplasticity and learning capacity. A wonderful time to start fresh habits.',
    color: '#e11d48',
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TarotWidget: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [shuffleCount, setShuffleCount] = useState<number>(0);
  const [fannedCards, setFannedCards] = useState<number[]>([0, 1, 2, 3, 4]);

  if (!isOpen) return null;

  const handleShuffle = () => {
    setIsShuffling(true);
    setSelectedCard(null);
    setTimeout(() => {
      // Re-order fan randomly
      const shuffledIndices = [...Array(DECK.length).keys()].sort(() => Math.random() - 0.5).slice(0, 5);
      setFannedCards(shuffledIndices);
      setIsShuffling(false);
      setShuffleCount((c) => c + 1);
    }, 600);
  };

  const handlePickCard = (deckIndex: number) => {
    setIsShuffling(false);
    setSelectedCard(DECK[deckIndex]);
  };

  const handleResetToDeck = () => {
    setSelectedCard(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 20, 18, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #152220 0%, #0a1412 100%)',
          border: '1px solid rgba(244, 114, 182, 0.25)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '520px',
          color: '#f8fafc',
          padding: '1.75rem',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#fbcfe8', letterSpacing: '0.3px' }}>
              Cycle Archetype Reading
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              {selectedCard
                ? 'Your intuitive reflection for today'
                : 'Shuffle the deck and tap a card to reveal your reading'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#cbd5e1',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Phase 1: Card Selection Fan (When no card is picked) */}
        {!selectedCard ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            {/* Interactive Fanned Deck */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '230px',
                position: 'relative',
                margin: '1.5rem 0',
              }}
            >
              {fannedCards.map((deckIdx, slotIdx) => {
                const rotationDegrees = (slotIdx - 2) * 10;
                const translateY = Math.abs(slotIdx - 2) * 6;
                const isHovered = false;

                return (
                  <div
                    key={`${shuffleCount}-${slotIdx}`}
                    onClick={() => handlePickCard(deckIdx)}
                    style={{
                      width: '100px',
                      height: '160px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                      border: '2px solid rgba(244, 114, 182, 0.35)',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                      cursor: 'pointer',
                      position: 'absolute',
                      transform: isShuffling
                        ? `translateX(${(slotIdx - 2) * 8}px) translateY(0px) rotate(0deg) scale(0.95)`
                        : `translateX(${(slotIdx - 2) * 48}px) translateY(${translateY}px) rotate(${rotationDegrees}deg)`,
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px',
                      userSelect: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform += ' translateY(-16px) scale(1.05)';
                      e.currentTarget.style.borderColor = '#f472b6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = isShuffling
                        ? `translateX(${(slotIdx - 2) * 8}px) translateY(0px) rotate(0deg) scale(0.95)`
                        : `translateX(${(slotIdx - 2) * 48}px) translateY(${translateY}px) rotate(${rotationDegrees}deg)`;
                      e.currentTarget.style.borderColor = 'rgba(244, 114, 182, 0.35)';
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '10px',
                        border: '1px dashed rgba(244, 114, 182, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(244, 114, 182, 0.5)',
                        fontSize: '1.4rem',
                      }}
                    >
                      ✦
                    </div>
                  </div>
                );
              })}
            </div>

            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1.25rem' }}>
              {isShuffling ? 'Shuffling deck with cycle intention...' : 'Tap any card above to draw your daily archetype'}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="secondary"
                onClick={handleShuffle}
                disabled={isShuffling}
                style={{
                  padding: '9px 20px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  borderColor: 'rgba(244, 114, 182, 0.3)',
                  color: '#fbcfe8',
                }}
              >
                {isShuffling ? 'Shuffling…' : 'Shuffle Deck'}
              </button>
            </div>
          </div>
        ) : (
          /* Phase 2: Revealed Selected Card */
          <div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: `2px solid ${selectedCard.color}45`,
                borderRadius: '18px',
                padding: '1.4rem',
                textAlign: 'center',
                boxShadow: `0 15px 35px -5px ${selectedCard.color}25`,
                animation: 'fadeIn 0.4s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.8, fontSize: '0.8rem', fontWeight: 600 }}>
                <span>{selectedCard.numeral}</span>
                <span style={{ textTransform: 'uppercase', fontSize: '0.72rem', color: selectedCard.color, fontWeight: 700 }}>
                  {selectedCard.phaseResonance}
                </span>
                <span>{selectedCard.numeral}</span>
              </div>

              <h4 style={{ margin: '0.75rem 0 0.2rem', fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                {selectedCard.name}
              </h4>

              <div style={{ fontSize: '0.85rem', color: selectedCard.color, fontWeight: 600, marginBottom: '0.75rem' }}>
                ✦ {selectedCard.archetype} ✦
              </div>

              <p style={{ fontStyle: 'italic', fontSize: '0.86rem', color: '#f1f5f9', margin: '0.5rem 0 1rem', lineHeight: '1.4' }}>
                &ldquo;{selectedCard.quote}&rdquo;
              </p>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '0.85rem',
                  fontSize: '0.84rem',
                  color: '#cbd5e1',
                  lineHeight: '1.5',
                  textAlign: 'left',
                  borderLeft: `3px solid ${selectedCard.color}`,
                  marginBottom: '0.85rem',
                }}
              >
                <strong style={{ color: '#fff' }}>Insight: </strong>
                {selectedCard.insight}
              </div>

              <div
                style={{
                  background: 'rgba(244, 114, 182, 0.12)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  fontSize: '0.82rem',
                  color: '#fbcfe8',
                  textAlign: 'center',
                  fontWeight: 600,
                }}
              >
                Affirmation: &ldquo;{selectedCard.affirmation}&rdquo;
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="secondary"
                onClick={handleResetToDeck}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  borderColor: 'rgba(244, 114, 182, 0.3)',
                  color: '#fbcfe8',
                }}
              >
                Shuffle & Draw Again
              </button>
              <button
                type="button"
                className="primary"
                onClick={onClose}
                style={{
                  padding: '9px 24px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
