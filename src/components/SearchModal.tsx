import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Kanban, Table, ArrowRight, X } from 'lucide-react';
import { Page } from '../types';

interface SearchModalProps {
  pages: Page[];
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (pageId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  pages,
  isOpen,
  onClose,
  onSelectPage,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search through page titles and block contents
  const results = pages.filter((page) => {
    const titleMatch = page.title.toLowerCase().includes(query.toLowerCase());
    const blockMatch = page.blocks.some((b) =>
      b.content.toLowerCase().includes(query.toLowerCase())
    );
    const kanbanMatch = page.kanbanTasks?.some((t) =>
      t.title.toLowerCase().includes(query.toLowerCase())
    );
    const dbMatch = page.databaseRows?.some((r) =>
      r.title.toLowerCase().includes(query.toLowerCase())
    );
    return titleMatch || blockMatch || kanbanMatch || dbMatch;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % (results.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelectPage(results[selectedIndex].id);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onSelectPage, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="search-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
    >
      <div
        id="search-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      >
        <div className="flex items-center px-4 py-3 border-b border-stone-100 gap-3">
          <Search className="w-4 h-4 text-stone-600 shrink-0" />
          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            placeholder="Search office pages, sprint tasks, or wikis..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full text-sm bg-transparent focus:outline-none placeholder:text-stone-400"
          />
          <kbd className="hidden sm:inline-block text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200 font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-600">
              No pages or items found matching "{query}".
            </div>
          ) : (
            results.map((p, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={p.id}
                  id={`search-result-${p.id}`}
                  type="button"
                  onClick={() => {
                    onSelectPage(p.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    isSelected ? 'bg-stone-100 text-stone-900' : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base shrink-0">{p.icon}</span>
                    <span className="text-xs font-medium truncate">{p.title}</span>
                    <span className="text-[10px] text-stone-600 px-1.5 py-0.5 rounded bg-stone-50 border border-stone-200 uppercase font-mono">
                      {p.type}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-600 shrink-0 opacity-0 group-hover:opacity-100" />
                </button>
              );
            })
          )}
        </div>

        <div className="p-2.5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600">
          <span>Navigation: ↑ ↓ arrows to select, Enter to open</span>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  );
};
