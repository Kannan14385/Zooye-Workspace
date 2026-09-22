import React, { useState, useRef } from 'react';
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
  Check,
  Code as CodeIcon,
  Smile,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Type,
  Heading,
  CheckSquare,
  List,
  Lightbulb,
  Minus,
} from 'lucide-react';
import { Block, BlockType } from '../types';
import { SlashMenu } from './SlashMenu';

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  pageTitle: string;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  blocks,
  onChange,
  pageTitle,
}) => {
  const [activeMenuBlockId, setActiveMenuBlockId] = useState<string | null>(null);
  const [slashMenuState, setSlashMenuState] = useState<{
    blockId: string;
    searchTerm: string;
    position: { top: number; left: number };
  } | null>(null);

  const blockRefs = useRef<{ [key: string]: HTMLTextAreaElement | HTMLInputElement | null }>({});

  const updateBlock = (id: string, updates: Partial<Block>) => {
    const next = blocks.map((b) => (b.id === id ? { ...b, ...updates } : b));
    onChange(next);
  };

  const addBlockBelow = (currentId?: string, type: BlockType = 'p') => {
    const newBlock: Block = {
      id: 'b-' + Math.random().toString(36).substring(2, 9),
      type,
      content: '',
      checked: false,
      calloutIcon: type === 'callout' ? '💡' : undefined,
      calloutColor: type === 'callout' ? 'blue' : undefined,
      isOpen: type === 'toggle' ? true : undefined,
      toggleContent: type === 'toggle' ? '' : undefined,
      codeLanguage: type === 'code' ? 'javascript' : undefined,
      tableData: type === 'table' ? {
        headers: ['Item / Name', 'Category', 'Status'],
        rows: [
          ['Project Charter', 'Planning', 'Done'],
          ['Budget Sheet', 'Finance', 'Pending'],
        ],
      } : undefined,
    };

    if (!currentId) {
      onChange([...blocks, newBlock]);
      return;
    }

    const index = blocks.findIndex((b) => b.id === currentId);
    if (index === -1) {
      onChange([...blocks, newBlock]);
    } else {
      const next = [...blocks];
      next.splice(index + 1, 0, newBlock);
      onChange(next);
    }

    setTimeout(() => {
      blockRefs.current[newBlock.id]?.focus();
    }, 50);
  };

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      onChange([{ id: 'b-' + Date.now(), type: 'p', content: '' }]);
      return;
    }
    const idx = blocks.findIndex((b) => b.id === id);
    const next = blocks.filter((b) => b.id !== id);
    onChange(next);
    const focusTarget = next[Math.max(0, idx - 1)];
    if (focusTarget) {
      setTimeout(() => {
        blockRefs.current[focusTarget.id]?.focus();
      }, 50);
    }
  };

  const duplicateBlock = (id: string) => {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;
    const duplicated: Block = {
      ...block,
      id: 'b-' + Math.random().toString(36).substring(2, 9),
    };
    const idx = blocks.findIndex((b) => b.id === id);
    const next = [...blocks];
    next.splice(idx + 1, 0, duplicated);
    onChange(next);
    setActiveMenuBlockId(null);
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === blocks.length - 1) return;

    const next = [...blocks];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    onChange(next);
    setActiveMenuBlockId(null);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>,
    block: Block
  ) => {
    // Markdown shortcut detection on Space or Enter
    if (e.key === ' ' && block.type === 'p') {
      const text = block.content;
      if (text === '#') {
        e.preventDefault();
        updateBlock(block.id, { type: 'h1', content: '' });
        return;
      }
      if (text === '##') {
        e.preventDefault();
        updateBlock(block.id, { type: 'h2', content: '' });
        return;
      }
      if (text === '###') {
        e.preventDefault();
        updateBlock(block.id, { type: 'h3', content: '' });
        return;
      }
      if (text === '[]' || text === '[ ]') {
        e.preventDefault();
        updateBlock(block.id, { type: 'todo', content: '', checked: false });
        return;
      }
      if (text === '-' || text === '*') {
        e.preventDefault();
        updateBlock(block.id, { type: 'bullet', content: '' });
        return;
      }
      if (text === '1.') {
        e.preventDefault();
        updateBlock(block.id, { type: 'numbered', content: '' });
        return;
      }
      if (text === '>') {
        e.preventDefault();
        updateBlock(block.id, { type: 'quote', content: '' });
        return;
      }
    }

    // Enter key handling
    if (e.key === 'Enter' && !e.shiftKey) {
      if (block.type === 'code') {
        // Allow standard newlines in code
        return;
      }
      e.preventDefault();
      // If pressing enter on empty list block, transform to paragraph
      if (
        (block.type === 'bullet' || block.type === 'numbered' || block.type === 'todo') &&
        block.content.trim() === ''
      ) {
        updateBlock(block.id, { type: 'p' });
        return;
      }
      // If list item, continue list item
      const nextType: BlockType =
        block.type === 'bullet' || block.type === 'numbered' || block.type === 'todo'
          ? block.type
          : 'p';
      addBlockBelow(block.id, nextType);
      return;
    }

    // Backspace on empty block
    if (e.key === 'Backspace' && block.content === '') {
      if (block.type !== 'p') {
        e.preventDefault();
        updateBlock(block.id, { type: 'p' });
      } else if (blocks.length > 1) {
        e.preventDefault();
        deleteBlock(block.id);
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    block: Block
  ) => {
    const val = e.target.value;
    updateBlock(block.id, { content: val });

    // Check for slash command
    if (val.includes('/')) {
      const lastSlashIdx = val.lastIndexOf('/');
      const searchTerm = val.substring(lastSlashIdx);
      const rect = e.target.getBoundingClientRect();
      setSlashMenuState({
        blockId: block.id,
        searchTerm,
        position: {
          top: rect.top + window.scrollY,
          left: rect.left,
        },
      });
    } else if (slashMenuState?.blockId === block.id) {
      setSlashMenuState(null);
    }
  };

  const handleSlashSelect = (newType: BlockType) => {
    if (!slashMenuState) return;
    const block = blocks.find((b) => b.id === slashMenuState.blockId);
    if (!block) return;

    // Remove the slash query from content
    const lastSlashIdx = block.content.lastIndexOf('/');
    const cleanContent =
      lastSlashIdx !== -1 ? block.content.substring(0, lastSlashIdx).trim() : block.content;

    updateBlock(block.id, {
      type: newType,
      content: cleanContent,
      calloutIcon: newType === 'callout' ? '💡' : undefined,
      calloutColor: newType === 'callout' ? 'blue' : undefined,
      isOpen: newType === 'toggle' ? true : undefined,
      toggleContent: newType === 'toggle' ? '' : undefined,
      codeLanguage: newType === 'code' ? 'javascript' : undefined,
      tableData: newType === 'table' ? {
        headers: ['Column 1', 'Column 2', 'Column 3'],
        rows: [['Data 1', 'Data 2', 'Data 3']],
      } : undefined,
    });
    setSlashMenuState(null);
    setTimeout(() => {
      blockRefs.current[block.id]?.focus();
    }, 50);
  };

  // Compute numbered list numbering dynamically
  let numberedIndex = 0;

  return (
    <div className="relative w-full max-w-3xl mx-auto pb-32">
      {/* Quick-Add Toolbar - Makes adding blocks effortless */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border border-stone-200/90 rounded-xl p-1 mb-6 shadow-2xs flex flex-wrap items-center gap-1 text-xs">
        <span className="text-[11px] font-semibold text-stone-600 uppercase px-2">Add Block:</span>
        <button
          type="button"
          onClick={() => addBlockBelow(undefined, 'p')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-stone-100 text-stone-700 font-medium transition-colors"
        >
          <Type className="w-3.5 h-3.5 text-stone-600" />
          <span>Text</span>
        </button>
        <button
          type="button"
          onClick={() => addBlockBelow(undefined, 'h2')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-stone-100 text-stone-700 font-medium transition-colors"
        >
          <Heading className="w-3.5 h-3.5 text-stone-600" />
          <span>Heading</span>
        </button>
        <button
          type="button"
          onClick={() => addBlockBelow(undefined, 'todo')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-blue-50 text-blue-800 font-medium transition-colors"
        >
          <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
          <span>To-Do</span>
        </button>
        <button
          type="button"
          onClick={() => addBlockBelow(undefined, 'bullet')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-stone-100 text-stone-700 font-medium transition-colors"
        >
          <List className="w-3.5 h-3.5 text-stone-600" />
          <span>Bullet</span>
        </button>
        <button
          type="button"
          onClick={() => addBlockBelow(undefined, 'callout')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-amber-50 text-amber-900 font-medium transition-colors"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          <span>Callout Note</span>
        </button>
        <button
          type="button"
          onClick={() => addBlockBelow(undefined, 'divider')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-stone-100 text-stone-700 font-medium transition-colors"
        >
          <Minus className="w-3.5 h-3.5 text-stone-600" />
          <span>Divider</span>
        </button>
      </div>

      <div className="space-y-1">
        {blocks.map((block) => {
          if (block.type === 'numbered') {
            numberedIndex += 1;
          } else {
            numberedIndex = 0;
          }

          const isMenuActive = activeMenuBlockId === block.id;

          return (
            <div
              key={block.id}
              id={`block-wrapper-${block.id}`}
              className="group relative flex items-start -ml-12 pl-12 py-0.5 rounded-md transition-colors"
            >
              {/* Left Hover Handle (6-dot drag icon & + add block) */}
              <div className="absolute left-0 top-1 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity select-none text-stone-600">
                <button
                  type="button"
                  title="Add block below"
                  onClick={() => addBlockBelow(block.id)}
                  className="p-1 hover:bg-stone-200 rounded hover:text-stone-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <div className="relative">
                  <button
                    type="button"
                    title="Drag to reorder or click for options"
                    onClick={() => setActiveMenuBlockId(isMenuActive ? null : block.id)}
                    className="p-1 hover:bg-stone-200 rounded hover:text-stone-800 transition-colors cursor-grab"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Block Options Popover */}
                  {isMenuActive && (
                    <div
                      id={`block-menu-${block.id}`}
                      className="absolute left-0 top-7 z-40 w-48 bg-white border border-stone-200 rounded-lg shadow-xl p-1.5 text-xs text-stone-700 animate-in fade-in duration-100"
                    >
                      <div className="px-2 py-1 text-[10px] font-semibold text-stone-600 uppercase">
                        Actions
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteBlock(block.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Block
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateBlock(block.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-stone-100"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Duplicate
                      </button>
                      <div className="my-1 border-t border-stone-100" />
                      <div className="px-2 py-1 text-[10px] font-semibold text-stone-600 uppercase">
                        Reorder
                      </div>
                      <button
                        type="button"
                        onClick={() => moveBlock(block.id, 'up')}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-stone-100"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                        Move Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveBlock(block.id, 'down')}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-stone-100"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                        Move Down
                      </button>
                      <div className="my-1 border-t border-stone-100" />
                      <div className="px-2 py-1 text-[10px] font-semibold text-stone-600 uppercase">
                        Turn Into
                      </div>
                      <div className="grid grid-cols-2 gap-1 px-1">
                        {(['p', 'h1', 'h2', 'h3', 'todo', 'bullet', 'callout', 'quote'] as BlockType[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              updateBlock(block.id, { type: t });
                              setActiveMenuBlockId(null);
                            }}
                            className={`px-1.5 py-1 text-[11px] rounded text-left truncate capitalize hover:bg-stone-100 ${
                              block.type === t ? 'bg-stone-100 font-semibold' : ''
                            }`}
                          >
                            {t === 'p' ? 'Text' : t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Block Content Rendering based on Type */}
              <div className="w-full">
                {/* Paragraph */}
                {block.type === 'p' && (
                  <textarea
                    ref={(el) => {
                      blockRefs.current[block.id] = el;
                    }}
                    value={block.content}
                    placeholder="Type '/' for commands, or start writing..."
                    onChange={(e) => handleInputChange(e, block)}
                    onKeyDown={(e) => handleKeyDown(e, block)}
                    rows={1}
                    className="w-full resize-none bg-transparent text-stone-800 text-base leading-relaxed placeholder:text-stone-300 focus:outline-none overflow-hidden"
                    style={{ height: 'auto' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = target.scrollHeight + 'px';
                    }}
                  />
                )}

                {/* Heading 1 */}
                {block.type === 'h1' && (
                  <input
                    ref={(el) => {
                      blockRefs.current[block.id] = el;
                    }}
                    type="text"
                    value={block.content}
                    placeholder="Heading 1"
                    onChange={(e) => handleInputChange(e, block)}
                    onKeyDown={(e) => handleKeyDown(e, block)}
                    className="w-full bg-transparent text-stone-900 font-bold text-3xl tracking-tight mt-4 mb-2 placeholder:text-stone-300 focus:outline-none"
                  />
                )}

                {/* Heading 2 */}
                {block.type === 'h2' && (
                  <input
                    ref={(el) => {
                      blockRefs.current[block.id] = el;
                    }}
                    type="text"
                    value={block.content}
                    placeholder="Heading 2"
                    onChange={(e) => handleInputChange(e, block)}
                    onKeyDown={(e) => handleKeyDown(e, block)}
                    className="w-full bg-transparent text-stone-900 font-semibold text-2xl tracking-tight mt-3 mb-1.5 placeholder:text-stone-300 focus:outline-none"
                  />
                )}

                {/* Heading 3 */}
                {block.type === 'h3' && (
                  <input
                    ref={(el) => {
                      blockRefs.current[block.id] = el;
                    }}
                    type="text"
                    value={block.content}
                    placeholder="Heading 3"
                    onChange={(e) => handleInputChange(e, block)}
                    onKeyDown={(e) => handleKeyDown(e, block)}
                    className="w-full bg-transparent text-stone-900 font-medium text-xl tracking-tight mt-2 mb-1 placeholder:text-stone-300 focus:outline-none"
                  />
                )}

                {/* To-Do Checklist */}
                {block.type === 'todo' && (
                  <div className="flex items-start gap-2.5 py-0.5">
                    <button
                      type="button"
                      id={`todo-check-${block.id}`}
                      onClick={() => updateBlock(block.id, { checked: !block.checked })}
                      className={`mt-1 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        block.checked
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-stone-400 bg-white hover:border-stone-600'
                      }`}
                    >
                      {block.checked && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                    <input
                      ref={(el) => {
                        blockRefs.current[block.id] = el;
                      }}
                      type="text"
                      value={block.content}
                      placeholder="To-do..."
                      onChange={(e) => handleInputChange(e, block)}
                      onKeyDown={(e) => handleKeyDown(e, block)}
                      className={`w-full bg-transparent text-stone-800 text-base placeholder:text-stone-300 focus:outline-none ${
                        block.checked ? 'line-through text-stone-600' : ''
                      }`}
                    />
                  </div>
                )}

                {/* Bullet List */}
                {block.type === 'bullet' && (
                  <div className="flex items-start gap-2.5 py-0.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-stone-700 shrink-0" />
                    <input
                      ref={(el) => {
                        blockRefs.current[block.id] = el;
                      }}
                      type="text"
                      value={block.content}
                      placeholder="List item..."
                      onChange={(e) => handleInputChange(e, block)}
                      onKeyDown={(e) => handleKeyDown(e, block)}
                      className="w-full bg-transparent text-stone-800 text-base placeholder:text-stone-300 focus:outline-none"
                    />
                  </div>
                )}

                {/* Numbered List */}
                {block.type === 'numbered' && (
                  <div className="flex items-start gap-2 py-0.5">
                    <span className="text-sm font-medium text-stone-600 min-w-[1.25rem] select-none pt-0.5">
                      {numberedIndex}.
                    </span>
                    <input
                      ref={(el) => {
                        blockRefs.current[block.id] = el;
                      }}
                      type="text"
                      value={block.content}
                      placeholder="Numbered item..."
                      onChange={(e) => handleInputChange(e, block)}
                      onKeyDown={(e) => handleKeyDown(e, block)}
                      className="w-full bg-transparent text-stone-800 text-base placeholder:text-stone-300 focus:outline-none"
                    />
                  </div>
                )}

                {/* Toggle List */}
                {block.type === 'toggle' && (
                  <div className="py-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateBlock(block.id, { isOpen: !block.isOpen })}
                        className="p-0.5 text-stone-600 hover:text-stone-800 rounded"
                      >
                        {block.isOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        ref={(el) => {
                          blockRefs.current[block.id] = el;
                        }}
                        type="text"
                        value={block.content}
                        placeholder="Toggle header..."
                        onChange={(e) => handleInputChange(e, block)}
                        onKeyDown={(e) => handleKeyDown(e, block)}
                        className="w-full font-medium text-stone-900 bg-transparent text-base placeholder:text-stone-300 focus:outline-none"
                      />
                    </div>
                    {block.isOpen && (
                      <div className="ml-6 pl-2 border-l-2 border-stone-200 mt-1">
                        <textarea
                          rows={2}
                          value={block.toggleContent || ''}
                          placeholder="Empty toggle. Write or drop content inside..."
                          onChange={(e) => updateBlock(block.id, { toggleContent: e.target.value })}
                          className="w-full resize-none bg-transparent text-stone-700 text-sm placeholder:text-stone-400 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Callout */}
                {block.type === 'callout' && (
                  <div
                    className={`flex items-start gap-3 p-3.5 my-2 rounded-xl border transition-colors ${
                      block.calloutColor === 'yellow'
                        ? 'bg-amber-50/80 border-amber-200/80 text-amber-950'
                        : block.calloutColor === 'green'
                        ? 'bg-emerald-50/80 border-emerald-200/80 text-emerald-950'
                        : block.calloutColor === 'purple'
                        ? 'bg-purple-50/80 border-purple-200/80 text-purple-950'
                        : block.calloutColor === 'red'
                        ? 'bg-rose-50/80 border-rose-200/80 text-rose-950'
                        : 'bg-sky-50/80 border-sky-200/80 text-sky-950'
                    }`}
                  >
                    <button
                      type="button"
                      title="Change callout icon"
                      onClick={() => {
                        const icons = ['💡', '✨', '👋', '⚠️', '🎯', '📌', '🚀', '🔥'];
                        const current = block.calloutIcon || '💡';
                        const nextIcon = icons[(icons.indexOf(current) + 1) % icons.length];
                        updateBlock(block.id, { calloutIcon: nextIcon });
                      }}
                      className="text-xl select-none hover:scale-110 transition-transform shrink-0"
                    >
                      {block.calloutIcon || '💡'}
                    </button>
                    <div className="flex-1">
                      <textarea
                        ref={(el) => {
                          blockRefs.current[block.id] = el;
                        }}
                        rows={2}
                        value={block.content}
                        placeholder="Callout text..."
                        onChange={(e) => handleInputChange(e, block)}
                        onKeyDown={(e) => handleKeyDown(e, block)}
                        className="w-full resize-none bg-transparent text-sm leading-relaxed placeholder:text-stone-400 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Quote */}
                {block.type === 'quote' && (
                  <div className="border-l-3 border-stone-800 pl-3.5 py-1 my-1">
                    <textarea
                      ref={(el) => {
                        blockRefs.current[block.id] = el;
                      }}
                      rows={2}
                      value={block.content}
                      placeholder="Empty quote..."
                      onChange={(e) => handleInputChange(e, block)}
                      onKeyDown={(e) => handleKeyDown(e, block)}
                      className="w-full resize-none bg-transparent text-stone-700 italic text-base placeholder:text-stone-300 focus:outline-none"
                    />
                  </div>
                )}

                {/* Code Block */}
                {block.type === 'code' && (
                  <div className="my-2 rounded-lg bg-stone-900 text-stone-100 p-3 text-xs font-mono">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800 text-[11px] text-stone-400">
                      <div className="flex items-center gap-1.5">
                        <CodeIcon className="w-3.5 h-3.5 text-stone-400" />
                        <span>{block.codeLanguage || 'javascript'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(block.content)}
                        className="hover:text-stone-200 transition-colors flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                    <textarea
                      ref={(el) => {
                        blockRefs.current[block.id] = el;
                      }}
                      rows={4}
                      value={block.content}
                      placeholder="// Paste or write code snippet..."
                      onChange={(e) => handleInputChange(e, block)}
                      className="w-full bg-transparent text-stone-100 font-mono text-xs focus:outline-none resize-y"
                    />
                  </div>
                )}

                {/* Divider */}
                {block.type === 'divider' && (
                  <div className="py-3">
                    <hr className="border-stone-200" />
                  </div>
                )}

                {/* Mini Table */}
                {block.type === 'table' && block.tableData && (
                  <div className="my-3 overflow-x-auto border border-stone-200 rounded-lg">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-medium">
                        <tr>
                          {block.tableData.headers.map((h, hIdx) => (
                            <th key={hIdx} className="p-2 border-r border-stone-200 last:border-r-0">
                              <input
                                type="text"
                                value={h}
                                onChange={(e) => {
                                  const newHeaders = [...block.tableData!.headers];
                                  newHeaders[hIdx] = e.target.value;
                                  updateBlock(block.id, {
                                    tableData: { ...block.tableData!, headers: newHeaders },
                                  });
                                }}
                                className="w-full bg-transparent font-medium focus:outline-none"
                              />
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {block.tableData.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-stone-50/50">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-2 border-r border-stone-200 last:border-r-0">
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) => {
                                    const newRows = [...block.tableData!.rows];
                                    newRows[rIdx][cIdx] = e.target.value;
                                    updateBlock(block.id, {
                                      tableData: { ...block.tableData!, rows: newRows },
                                    });
                                  }}
                                  className="w-full bg-transparent focus:outline-none text-stone-700"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="p-1.5 bg-stone-50/50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <button
                        type="button"
                        onClick={() => {
                          const newRows = [
                            ...block.tableData!.rows,
                            new Array(block.tableData!.headers.length).fill(''),
                          ];
                          updateBlock(block.id, {
                            tableData: { ...block.tableData!, rows: newRows },
                          });
                        }}
                        className="hover:text-stone-800 flex items-center gap-1 font-medium"
                      >
                        <Plus className="w-3 h-3" /> Add Row
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const newHeaders = [...block.tableData!.headers, `Col ${block.tableData!.headers.length + 1}`];
                          const newRows = block.tableData!.rows.map((r) => [...r, '']);
                          updateBlock(block.id, {
                            tableData: { headers: newHeaders, rows: newRows },
                          });
                        }}
                        className="hover:text-stone-800 flex items-center gap-1 font-medium"
                      >
                        <Plus className="w-3 h-3" /> Add Column
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Slash Menu */}
      {slashMenuState && (
        <SlashMenu
          searchTerm={slashMenuState.searchTerm}
          position={slashMenuState.position}
          onSelect={handleSlashSelect}
          onClose={() => setSlashMenuState(null)}
        />
      )}

      {/* Click bottom area to add block */}
      <div
        id="add-block-bottom-trigger"
        onClick={() => addBlockBelow()}
        className="mt-6 py-8 px-4 border-2 border-dashed border-stone-200 rounded-xl text-center text-stone-600 hover:text-stone-600 hover:border-stone-300 transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5"
      >
        <Plus className="w-4 h-4" />
        <span>Click to add a block or press '/' anywhere above</span>
      </div>
    </div>
  );
};
