import React, { useState } from 'react';
import { Image as ImageIcon, Smile, Trash2, FileText, Kanban, Table } from 'lucide-react';
import { Page, PageType } from '../types';
import { EmojiPicker } from './EmojiPicker';
import { CoverPicker } from './CoverPicker';

interface PageHeaderProps {
  page: Page;
  onUpdateTitle: (newTitle: string) => void;
  onUpdateIcon: (newIcon: string) => void;
  onUpdateCover: (newCoverUrl: string | undefined) => void;
  onUpdateType?: (newType: PageType) => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  page,
  onUpdateTitle,
  onUpdateIcon,
  onUpdateCover,
  onUpdateType,
}) => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);

  return (
    <div className="w-full relative">
      {/* Cover Image Banner */}
      {page.coverUrl ? (
        <div className="group relative w-full h-48 md:h-64 overflow-hidden bg-stone-100">
          <img
            src={page.coverUrl}
            alt="Page cover banner"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-black/40 backdrop-blur-xs p-1 rounded-lg">
            <button
              type="button"
              id="change-cover-btn"
              onClick={() => setIsCoverPickerOpen(!isCoverPickerOpen)}
              className="px-2 py-1 text-[11px] font-medium text-white hover:bg-white/20 rounded transition-colors flex items-center gap-1"
            >
              <ImageIcon className="w-3 h-3" />
              <span>Change Cover</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateCover(undefined)}
              className="p-1 text-white hover:bg-white/20 rounded transition-colors"
              title="Remove cover"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          {isCoverPickerOpen && (
            <CoverPicker
              currentCover={page.coverUrl}
              onSelect={(url) => {
                onUpdateCover(url);
                setIsCoverPickerOpen(false);
              }}
              onClose={() => setIsCoverPickerOpen(false)}
            />
          )}
        </div>
      ) : (
        /* Add Cover hover button when no cover exists */
        <div className="max-w-4xl mx-auto px-6 pt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCoverPickerOpen(true)}
            className="text-xs text-stone-600 hover:text-stone-700 flex items-center gap-1 py-1 px-2 hover:bg-stone-100 rounded-md transition-colors"
          >
            <ImageIcon className="w-3 h-3" />
            <span>Add Cover</span>
          </button>
          {isCoverPickerOpen && (
            <div className="relative">
              <CoverPicker
                currentCover={page.coverUrl}
                onSelect={(url) => {
                  onUpdateCover(url);
                  setIsCoverPickerOpen(false);
                }}
                onClose={() => setIsCoverPickerOpen(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* Main Page Title Area */}
      <div className={`max-w-4xl mx-auto px-6 md:px-12 relative ${page.coverUrl ? '-mt-12' : 'pt-6'} mb-6`}>
        {/* Page Icon Emoji */}
        <div className="relative inline-block mb-3">
          <button
            type="button"
            id="page-icon-btn"
            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            className="w-16 h-16 rounded-2xl bg-white shadow-md border border-stone-200 flex items-center justify-center text-3xl hover:scale-105 transition-transform"
            title="Click to change icon"
          >
            {page.icon || '📄'}
          </button>

          {isEmojiPickerOpen && (
            <EmojiPicker
              currentEmoji={page.icon}
              onSelect={(emoji) => {
                onUpdateIcon(emoji);
                setIsEmojiPickerOpen(false);
              }}
              onClose={() => setIsEmojiPickerOpen(false)}
            />
          )}
        </div>

        {/* Editable Title */}
        <input
          id="page-title-input"
          type="text"
          value={page.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="Untitled"
          className="w-full text-3xl md:text-4xl font-extrabold text-stone-900 bg-transparent placeholder:text-stone-300 focus:outline-none tracking-tight leading-tight"
        />

        {/* View Switcher Tabs */}
        {onUpdateType && page.type !== 'guide' && (
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-stone-200/60">
            <button
              type="button"
              onClick={() => onUpdateType('document')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                page.type === 'document'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateType('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                page.type === 'kanban'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Sprint Board</span>
            </button>

            <button
              type="button"
              onClick={() => onUpdateType('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                page.type === 'table'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Database Table</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
