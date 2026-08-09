import { useState, useRef } from 'react';
import { REACTION_EMOJI, ReactionType } from '../types';

interface Props {
  onReact: (type: ReactionType) => void;
  activeType: ReactionType | null;
}

const REACTIONS = Object.keys(REACTION_EMOJI) as ReactionType[];

export default function ReactionPicker({ onReact, activeType }: Props) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setOpen(false);
    }, 300);
  };

  return (
    <div
      className="relative flex-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {open && (
        <div className="absolute bottom-full left-0 mb-2 flex gap-1.5 rounded-full border border-gray-200/80 bg-white/90 backdrop-blur px-2.5 py-1.5 shadow-xl dark:border-gray-800/85 dark:bg-[#111827]/90 animate-fade-in transition-all z-50">
          {REACTIONS.map((type) => (
            <button
              key={type}
              onClick={() => {
                onReact(type);
                setOpen(false);
              }}
              title={type}
              className="rounded-full p-1 text-2xl transition-transform hover:scale-125 active:scale-95 duration-150"
            >
              {REACTION_EMOJI[type]}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => onReact(activeType ?? 'like')}
        className={`w-full flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
          activeType
            ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/20'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <span className="text-base">{activeType ? REACTION_EMOJI[activeType] : REACTION_EMOJI.like}</span>
        <span>{activeType ? activeType[0].toUpperCase() + activeType.slice(1) : 'Like'}</span>
      </button>
    </div>
  );
}
