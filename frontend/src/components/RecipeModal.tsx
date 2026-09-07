import React from 'react';
import type { Recipe } from '../data/cuisineRecipes';

interface RecipeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ recipe, onClose }) => {
  if (!recipe) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 25, 20, 0.75)',
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
          background: 'var(--panel, #0f2e22)',
          border: '1px solid var(--border, rgba(255, 255, 255, 0.12))',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          color: 'var(--text, #f1f5f9)',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem 1rem',
            borderBottom: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.74rem',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {recipe.cuisine} · {recipe.dietary}
              </span>
              <span
                style={{
                  fontSize: '0.74rem',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--muted, #94a3b8)',
                }}
              >
                Prep: {recipe.prep_time_mins}m · Cook: {recipe.cook_time_mins}m
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text, #ffffff)' }}>
              {recipe.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'var(--text, #e2e8f0)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Phase Benefit Banner */}
          <div
            style={{
              background: 'rgba(244, 114, 182, 0.12)',
              border: '1px solid rgba(244, 114, 182, 0.25)',
              borderRadius: '14px',
              padding: '10px 14px',
              fontSize: '0.84rem',
              color: '#fbcfe8',
              lineHeight: 1.45,
            }}
          >
            <strong>Hormonal Phase Benefit: </strong>
            {recipe.phase_benefit}
          </div>

          {/* Macro & Micronutrient Grid */}
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Nutritional Breakdown per Serving
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                marginTop: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '10px',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid var(--border, rgba(255, 255, 255, 0.06))',
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted, #94a3b8)', display: 'block' }}>CALORIES</span>
                <strong style={{ fontSize: '1rem', color: '#ffffff' }}>{recipe.calories}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted, #94a3b8)', display: 'block' }}>PROTEIN</span>
                <strong style={{ fontSize: '1rem', color: '#3dd6c7' }}>{recipe.protein_g}g</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted, #94a3b8)', display: 'block' }}>CARBS</span>
                <strong style={{ fontSize: '1rem', color: '#f59e0b' }}>{recipe.carbs_g}g</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted, #94a3b8)', display: 'block' }}>FATS</span>
                <strong style={{ fontSize: '1rem', color: '#ec4899' }}>{recipe.fats_g}g</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted, #94a3b8)', display: 'block' }}>FIBRE</span>
                <strong style={{ fontSize: '0.92rem', color: '#a78bfa' }}>{recipe.fiber_g}g</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted, #94a3b8)', display: 'block' }}>IRON</span>
                <strong style={{ fontSize: '0.92rem', color: '#10b981' }}>{recipe.iron_mg}mg</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted, #94a3b8)', display: 'block' }}>MAGNESIUM</span>
                <strong style={{ fontSize: '0.92rem', color: '#60a5fa' }}>{recipe.magnesium_mg}mg</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted, #94a3b8)', display: 'block' }}>DIET</span>
                <strong style={{ fontSize: '0.85rem', color: '#cbd5e1', textTransform: 'capitalize' }}>{recipe.dietary}</strong>
              </div>
            </div>
          </div>

          {/* Ingredients List */}
          <div>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text, #ffffff)' }}>
              Ingredients & Quantities
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text, #e2e8f0)', fontSize: '0.86rem', lineHeight: 1.6 }}>
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
          </div>

          {/* Cooking Instructions */}
          <div>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text, #ffffff)' }}>
              Preparation Instructions
            </h4>
            <ol style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text, #e2e8f0)', fontSize: '0.86rem', lineHeight: 1.6 }}>
              {recipe.instructions.map((step, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            borderTop: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            className="primary"
            onClick={onClose}
            style={{ padding: '8px 24px', borderRadius: '10px', fontSize: '0.88rem' }}
          >
            Close Recipe
          </button>
        </div>
      </div>
    </div>
  );
};
