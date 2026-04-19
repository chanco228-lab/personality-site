'use client';

import { useState, useEffect } from 'react';
import { getSessionId } from '@/lib/logger';

type SectionKey = 'insights' | 'about' | 'loss' | 'relationships';

interface Props {
  typeId: string;
  section: SectionKey;
  resultId?: string | null;
}

function storageKey(typeId: string, section: string) {
  return `sr_${typeId}_${section}`;
}

const BASE_BTN: React.CSSProperties = {
  display: 'inline-flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  borderRadius: '999px',
  background: 'transparent',
  border: '2px solid currentColor',
  color: 'inherit',
  fontFamily: '"Zen Kaku Gothic Antique", sans-serif',
  fontWeight: 700,
  fontSize: '13px',
  lineHeight: 1,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  transition: 'transform 0.15s ease, background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease, opacity 0.2s ease',
  userSelect: 'none',
};

const SELECTED_UP: React.CSSProperties = {
  background: '#9BDC5A',
  border: '2px solid #0E0E0E',
  color: '#0E0E0E',
  transform: 'rotate(-3deg) scale(1.05)',
  boxShadow: '3px 3px 0 #0E0E0E',
};

const SELECTED_DOWN: React.CSSProperties = {
  background: '#FFB8D6',
  border: '2px solid #0E0E0E',
  color: '#0E0E0E',
  transform: 'rotate(2deg) scale(1.05)',
  boxShadow: '3px 3px 0 #0E0E0E',
};

const FADED: React.CSSProperties = {
  opacity: 0.35,
  pointerEvents: 'none',
  transform: 'scale(0.95)',
};

const SVG_PROPS = {
  width: 14,
  height: 14,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.5,
  'aria-hidden': true as const,
  style: { flexShrink: 0 },
};

export default function SectionRating({ typeId, section, resultId }: Props) {
  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [containerFaded, setContainerFaded] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey(typeId, section));
    if (saved === 'up' || saved === 'down') {
      setRating(saved);
      setSubmitted(true);
      setContainerFaded(true);
    }
  }, [typeId, section]);

  useEffect(() => {
    if (rating === null || containerFaded) return;
    const t = setTimeout(() => setContainerFaded(true), 5000);
    return () => clearTimeout(t);
  }, [rating, containerFaded]);

  const handleClick = async (value: 'up' | 'down') => {
    if (submitted) return;
    setRating(value);
    setContainerFaded(false);
    localStorage.setItem(storageKey(typeId, section), value);
    setSubmitted(true);
    try {
      await fetch('/api/section-rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          typeId,
          section,
          rating: value,
          sessionId: getSessionId(),
          resultId: resultId ?? null,
        }),
      });
    } catch (e) {
      console.error('Rating save failed', e);
    }
  };

  const HOVERED: React.CSSProperties = {
    transform: 'translate(-1px, -1px)',
    boxShadow: '2px 2px 0 currentColor',
  };

  const upStyle: React.CSSProperties = {
    ...BASE_BTN,
    ...(rating === 'up' ? SELECTED_UP : {}),
    ...(rating === 'down' ? FADED : {}),
    ...(rating !== null ? { pointerEvents: 'none', cursor: 'default' } : {}),
    ...(hoveredBtn === 'up' && rating === null ? HOVERED : {}),
  };
  const downStyle: React.CSSProperties = {
    ...BASE_BTN,
    ...(rating === 'down' ? SELECTED_DOWN : {}),
    ...(rating === 'up' ? FADED : {}),
    ...(rating !== null ? { pointerEvents: 'none', cursor: 'default' } : {}),
    ...(hoveredBtn === 'down' && rating === null ? HOVERED : {}),
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0,
        transition: 'opacity 0.5s',
        opacity: containerFaded ? 0.35 : 1,
      }}
      role="group"
      aria-label="このセクションの評価"
    >
      <span
        style={{
          fontFamily: '"Space Mono", monospace',
          fontSize: '11px',
          fontWeight: 700,
          color: 'currentColor',
          opacity: 0.6,
          letterSpacing: '0.05em',
          marginRight: '4px',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        当たってる?
      </span>

      <button
        onClick={() => handleClick('up')}
        onMouseEnter={() => setHoveredBtn('up')}
        onMouseLeave={() => setHoveredBtn(null)}
        aria-label="当たってる"
        aria-pressed={rating === 'up'}
        style={upStyle}
      >
        <svg {...SVG_PROPS}>
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        当たってる
      </button>

      <button
        onClick={() => handleClick('down')}
        onMouseEnter={() => setHoveredBtn('down')}
        onMouseLeave={() => setHoveredBtn(null)}
        aria-label="ちがう"
        aria-pressed={rating === 'down'}
        style={downStyle}
      >
        <svg {...SVG_PROPS}>
          <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
        </svg>
        ちがう
      </button>
    </div>
  );
}
