import React, { useRef, useEffect, useState } from 'react';
import { CURATED_COVERS } from '../data/initialData';
import { Image as ImageIcon, Link2, Trash2 } from 'lucide-react';

interface CoverPickerProps {
  onSelect: (url: string | undefined) => void;
  onClose: () => void;
  currentCover?: string;
}

export const CoverPicker: React.FC<CoverPickerProps> = ({
  onSelect,
  onClose,
  currentCover,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [customUrl, setCustomUrl] = useState('');

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
      id="cover-picker-popover"
      className="absolute top-12 right-6 z-50 w-80 bg-white border border-stone-200 rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
          <ImageIcon className="w-3.5 h-3.5 text-stone-600" />
          <span>Change Cover Banner</span>
        </div>
        {currentCover && (
          <button
            type="button"
            onClick={() => {
              onSelect(undefined);
              onClose();
            }}
            className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-medium"
          >
            <Trash2 className="w-3 h-3" />
            Remove
          </button>
        )}
      </div>

      <div className="text-[11px] font-medium text-stone-600 mb-1.5 uppercase tracking-wider">
        Gallery Presets
      </div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {CURATED_COVERS.map((url, index) => (
          <button
            key={url}
            id={`cover-preset-${index}`}
            type="button"
            onClick={() => {
              onSelect(url);
              onClose();
            }}
            className={`h-12 rounded-lg overflow-hidden border transition-all ${
              currentCover === url ? 'ring-2 ring-stone-900 border-transparent' : 'border-stone-200 hover:opacity-85'
            }`}
          >
            <img
              src={url}
              alt="Cover preset"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="pt-2.5 border-t border-stone-100">
        <div className="text-[11px] font-medium text-stone-600 mb-1.5 flex items-center gap-1">
          <Link2 className="w-3 h-3" />
          <span>Image Link</span>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            id="custom-cover-input"
            type="url"
            placeholder="Paste image URL..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 text-xs px-2.5 py-1.5 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
          <button
            type="button"
            disabled={!customUrl.trim()}
            onClick={() => {
              if (customUrl.trim()) {
                onSelect(customUrl.trim());
                onClose();
              }
            }}
            className="text-xs font-medium px-2.5 py-1.5 bg-stone-900 text-white rounded-md disabled:opacity-40 hover:bg-stone-800 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
