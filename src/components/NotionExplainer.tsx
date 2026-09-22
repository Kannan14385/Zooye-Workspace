import React from 'react';
import {
  FileText,
  Kanban,
  Table,
  CheckSquare,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface NotionExplainerProps {
  onNavigateToPage: (pageId: string) => void;
}

export const NotionExplainer: React.FC<NotionExplainerProps> = ({ onNavigateToPage }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Friendly, Simple Welcome Card */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 md:p-8 mb-6 shadow-sm">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Quick Workspace Guide</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
          Welcome to Your Office Workspace
        </h1>
        <p className="text-stone-300 text-sm md:text-base leading-relaxed max-w-2xl mb-6">
          Notion combines docs, checklists, project boards, and tables in one clean place.
          Here is how to get work done with zero hassle:
        </p>

        {/* 3 Simple Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onNavigateToPage('page-office-hub')}
            className="flex flex-col items-start p-4 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1">
              <span>Office Wiki</span>
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-stone-400 mt-1 leading-normal">
              Company guidelines, Wi-Fi info, and employee onboarding.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToPage('page-kanban-sprint')}
            className="flex flex-col items-start p-4 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Kanban className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1">
              <span>Task Board</span>
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-stone-400 mt-1 leading-normal">
              Move tasks through To Do, In Progress, and Done with 1 click.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToPage('page-okrs')}
            className="flex flex-col items-start p-4 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 text-left transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <Table className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1">
              <span>Goals Table</span>
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-stone-400 mt-1 leading-normal">
              Quarterly goals with direct inline editing and progress bars.
            </p>
          </button>
        </div>
      </div>

      {/* 3 Core Rules: Simple & Practical */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
          <span>How to use this workspace (3 simple tips)</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-700">
          <div className="flex gap-2.5 items-start">
            <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              1
            </span>
            <div>
              <strong className="text-stone-900 block font-semibold mb-0.5">Click & Type</strong>
              Click on any document or checklist item and start typing. Press Enter for a new line.
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              2
            </span>
            <div>
              <strong className="text-stone-900 block font-semibold mb-0.5">Easy Formatting</strong>
              Use the simple buttons above the document to add headings, checkboxes, or callouts.
            </div>
          </div>
          <div className="flex gap-2.5 items-start">
            <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              3
            </span>
            <div>
              <strong className="text-stone-900 block font-semibold mb-0.5">Sidebar Navigation</strong>
              Use the left sidebar to switch pages, or hit "+ New Page" to make your own notes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
