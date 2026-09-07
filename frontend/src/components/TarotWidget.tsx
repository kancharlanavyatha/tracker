import React, { useState } from 'react';

interface TarotCard {
  id: string;
  name: string;
  numeral: string;
  archetype: string;
  icon: string;
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
    icon: '🌸',
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
    icon: '🌙',
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
    icon: '☀️',
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
    icon: '🦁',
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
    icon: '✨',
    phaseResonance: 'All Phases / Recovery',
    quote: 'Hope and restoration pour like clear water into your spirit.',
    insight: 'Healing is not linear; it is a gentle unfolding. Trust that you are renewing your equilibrium with every mindful breath and balanced meal.',
    affirmation: 'I am safe in my body, renewed each day, and guided toward peace.',
    bodyWisdom: 'Deep REM sleep, anti-inflammatory whole foods, and mindful screen breaks lower cortisol and protect adrenal health.',
    color: '#06b6d4',
  },
  {
    id: 'temperance',
    name: 'Temperance',
    numeral: 'XIV',
    archetype: 'The Sacred Alchemist',
    icon: '🏺',
    phaseResonance: 'Luteal & Menstrual Transition',
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
    icon: '🌊',
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
    icon: '🪄',
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
  const [cardIndex, setCardIndex] = useState<number>(() => Math.floor(Math.random() * DECK.length));
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [isFlipped, setIsFlipped] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentCard = DECK[cardIndex];

  const handleDrawNew = () => {
    setIsShuffling(true);
    setIsFlipped(false);
    setTimeout(() => {
      let nextIdx = Math.floor(Math.random() * DECK.length);
      while (nextIdx === cardIndex && DECK.length > 1) {
        nextIdx = Math.floor(Math.random() * DECK.length);
      }
      setCardIndex(nextIdx);
      setIsShuffling(false);
      setIsFlipped(true);
    }, 600);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
          border: '1px solid rgba(244, 114, 182, 0.35)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 35px rgba(236, 72, 153, 0.2)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '460px',
          color: '#f8fafc',
          padding: '1.75rem',
          position: 'relative',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🔮</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#fbcfe8', letterSpacing: '0.4px' }}>
                Daily Cycle Archetype Reading
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1' }}>
                Intuitive wisdom attuned to your body's rhythm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#f1f5f9',
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

        {/* Tarot Card Display */}
        <div
          style={{
            perspective: '1000px',
            minHeight: '270px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0.5rem 0',
          }}
        >
          <div
            style={{
              width: '100%',
              background: 'linear-gradient(165deg, rgba(30, 27, 75, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: `2px solid ${currentCard.color}45`,
              borderRadius: '20px',
              padding: '1.4rem',
              textAlign: 'center',
              boxShadow: `0 15px 35px -5px ${currentCard.color}30`,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isShuffling ? 'scale(0.92) rotateY(180deg)' : isFlipped ? 'scale(1) rotateY(0)' : 'scale(0.95)',
              opacity: isShuffling ? 0.4 : 1,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.8, fontSize: '0.8rem', fontWeight: 600 }}>
              <span>{currentCard.numeral}</span>
              <span style={{ textTransform: 'uppercase', fontSize: '0.72rem', color: currentCard.color, fontWeight: 700 }}>
                {currentCard.phaseResonance}
              </span>
              <span>{currentCard.numeral}</span>
            </div>

            <div style={{ fontSize: '3.2rem', margin: '0.6rem 0', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.35))' }}>
              {currentCard.icon}
            </div>

            <h4 style={{ margin: '0.2rem 0', fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
              {currentCard.name}
            </h4>

            <div style={{ fontSize: '0.84rem', color: currentCard.color, fontWeight: 600, marginBottom: '0.7rem' }}>
              ✦ {currentCard.archetype} ✦
            </div>

            <p style={{ fontStyle: 'italic', fontSize: '0.85rem', color: '#f1f5f9', margin: '0.4rem 0 0.9rem', lineHeight: '1.4' }}>
              &ldquo;{currentCard.quote}&rdquo;
            </p>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                padding: '0.75rem',
                fontSize: '0.82rem',
                color: '#cbd5e1',
                lineHeight: '1.45',
                textAlign: 'left',
                borderLeft: `3px solid ${currentCard.color}`,
                marginBottom: '0.75rem',
              }}
            >
              <strong style={{ color: '#fff' }}>Insight: </strong>
              {currentCard.insight}
            </div>

            <div
              style={{
                background: 'rgba(244, 114, 182, 0.12)',
                borderRadius: '12px',
                padding: '0.65rem',
                fontSize: '0.82rem',
                color: '#fbcfe8',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              ✨ Affirmation: &ldquo;{currentCard.affirmation}&rdquo;
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button
            onClick={handleDrawNew}
            disabled={isShuffling}
            style={{
              flex: 1,
              padding: '0.8rem',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: isShuffling ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)',
            }}
          >
            <span>🔀</span> {isShuffling ? 'Shuffling Deck...' : 'Shuffle & Draw Again'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '0.8rem 1.25rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
