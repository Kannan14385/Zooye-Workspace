import React, { useEffect, useRef } from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  List,
  ListOrdered,
  ChevronRightSquare,
  AlertCircle,
  Quote,
  Code,
  Minus,
  Table as TableIcon,
} from 'lucide-react';
import { BlockType } from '../types';

interface SlashMenuProps {
  searchTerm: string;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

interface MenuItem {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MENU_ITEMS: MenuItem[] = [
  {
    type: 'p',
    label: 'Text',
    description: 'Just start writing with plain text.',
    icon: Type,
  },
  {
    type: 'h1',
    label: 'Heading 1',
    description: 'Big section heading.',
    icon: Heading1,
  },
  {
    type: 'h2',
    label: 'Heading 2',
    description: 'Medium section heading.',
    icon: Heading2,
  },
  {
    type: 'h3',
    label: 'Heading 3',
    description: 'Small section heading.',
    icon: Heading3,
  },
  {
    type: 'todo',
    label: 'To-do list',
    description: 'Track tasks with a checkbox.',
    icon: CheckSquare,
  },
  {
    type: 'bullet',
    label: 'Bulleted list',
    description: 'Create a simple bulleted list.',
    icon: List,
  },
  {
    type: 'numbered',
    label: 'Numbered list',
    description: 'Create a list with numbering.',
    icon: ListOrdered,
  },
  {
    type: 'toggle',
    label: 'Toggle list',
    description: 'Toggles can show and hide content.',
    icon: ChevronRightSquare,
  },
  {
    type: 'callout',
    label: 'Callout',
    description: 'Stand out with an emoji and colored box.',
    icon: AlertCircle,
  },
  {
    type: 'quote',
    label: 'Quote',
    description: 'Capture a quote or note.',
    icon: Quote,
  },
  {
    type: 'code',
    label: 'Code block',
    description: 'Capture a code snippet.',
    icon: Code,
  },
  {
    type: 'divider',
    label: 'Divider',
    description: 'Visually divide blocks with a line.',
    icon: Minus,
  },
  {
    type: 'table',
    label: 'Table',
    description: 'Insert an editable tabular grid.',
    icon: TableIcon,
  },
];

export const SlashMenu: React.FC<SlashMenuProps> = ({
  searchTerm,
  onSelect,
  onClose,
  position,
}) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const cleanSearch = searchTerm.replace('/', '').trim().toLowerCase();
  const filtered = MENU_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(cleanSearch) ||
      item.description.toLowerCase().includes(cleanSearch)
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex].type);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtered, selectedIndex, onSelect, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (filtered.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      id="slash-command-menu"
      style={{
        top: `${position.top + 28}px`,
        left: `${Math.min(position.left, window.innerWidth - 320)}px`,
      }}
      className="absolute z-50 w-72 max-h-80 overflow-y-auto bg-white border border-stone-200 rounded-lg shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="px-2 py-1 text-[11px] font-semibold tracking-wide text-stone-600 uppercase border-b border-stone-100 mb-1">
        Basic Blocks
      </div>
      <div className="space-y-0.5">
        {filtered.map((item, idx) => {
          const Icon = item.icon;
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={item.type}
              id={`slash-item-${item.type}`}
              type="button"
              onClick={() => onSelect(item.type)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-colors ${
                isSelected ? 'bg-stone-100 text-stone-900' : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <div
                className={`w-7 h-7 rounded flex items-center justify-center border text-stone-600 ${
                  isSelected ? 'bg-white border-stone-300 shadow-xs' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{item.label}</div>
                <div className="text-[11px] text-stone-600 truncate">{item.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
