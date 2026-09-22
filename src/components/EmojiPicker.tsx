import React, { useRef, useEffect } from 'react';
import { POPULAR_EMOJIS } from '../data/initialData';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  currentEmoji: string;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onSelect,
  onClose,
  currentEmoji,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [customInput, setCustomInput] = React.useState('');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      id="emoji-picker-popover"
      className="absolute top-12 left-0 z-50 w-64 bg-white border border-stone-200 rounded-xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-stone-600">Select Icon</span>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-stone-600 hover:text-stone-700"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-6 gap-1.5 mb-3">
        {POPULAR_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            id={`emoji-btn-${emoji}`}
            type="button"
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className={`w-8 h-8 flex items-center justify-center text-lg rounded-md hover:bg-stone-100 transition-colors ${
              currentEmoji === emoji ? 'bg-stone-200 ring-1 ring-stone-400' : ''
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5">
        <input
          id="custom-emoji-input"
          type="text"
          placeholder="Paste any emoji..."
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          maxLength={4}
          className="flex-1 text-xs px-2 py-1.5 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400"
        />
        <button
          type="button"
          disabled={!customInput.trim()}
          onClick={() => {
            if (customInput.trim()) {
              onSelect(customInput.trim());
              onClose();
            }
          }}
          className="text-xs font-medium px-2.5 py-1.5 bg-stone-900 text-white rounded-md disabled:opacity-40 hover:bg-stone-800 transition-colors"
        >
          Set
        </button>
      </div>
    </div>
  );
};
