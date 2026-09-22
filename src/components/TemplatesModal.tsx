import React from 'react';
import {
  FileText,
  Kanban,
  Table,
  Users,
  CheckSquare,
  Sparkles,
  X,
  Plus,
} from 'lucide-react';
import { Page, Block } from '../types';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (newPage: Page) => void;
}

interface TemplateOption {
  id: string;
  title: string;
  icon: string;
  category: string;
  description: string;
  previewBlocks: Block[];
  type: Page['type'];
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'tpl-1on1',
    title: '👥 1-on-1 Catchup & Career Sync',
    icon: '👥',
    category: 'Management',
    type: 'document',
    description: 'Structured agenda for regular manager-report check-ins, feedback, and growth priorities.',
    previewBlocks: [
      {
        id: 't-1',
        type: 'callout',
        content: 'Attendees: Manager & Direct Report | Cadence: Bi-weekly | Safe space for open discussion.',
        calloutIcon: '🤝',
        calloutColor: 'blue',
      },
      {
        id: 't-2',
        type: 'h2',
        content: 'Check-in & Wins',
      },
      {
        id: 't-3',
        type: 'bullet',
        content: 'What went exceptionally well over the past 2 weeks?',
      },
      {
        id: 't-4',
        type: 'bullet',
        content: 'Energy levels (1-10) and current work-life balance',
      },
      {
        id: 't-5',
        type: 'h2',
        content: 'Roadblocks & Priorities',
      },
      {
        id: 't-6',
        type: 'todo',
        content: 'Resolve dependency on backend API schema',
        checked: false,
      },
      {
        id: 't-7',
        type: 'todo',
        content: 'Align on Q4 promotion portfolio goals',
        checked: false,
      },
    ],
  },
  {
    id: 'tpl-prd',
    title: '📄 Product Requirements Document (PRD)',
    icon: '📄',
    category: 'Product & Tech',
    type: 'document',
    description: 'Comprehensive product specification outlining problem statement, metrics, and user stories.',
    previewBlocks: [
      {
        id: 'prd-1',
        type: 'callout',
        content: 'Status: Draft | Target Launch: Q4 2026 | Lead PM: Alex Morgan',
        calloutIcon: '🚀',
        calloutColor: 'purple',
      },
      {
        id: 'prd-2',
        type: 'h2',
        content: 'Problem Statement & Target Audience',
      },
      {
        id: 'prd-3',
        type: 'p',
        content: 'Our users currently experience fragmented knowledge across multiple chat channels. We need a unified company portal.',
      },
      {
        id: 'prd-4',
        type: 'h2',
        content: 'Success Metrics (KPIs)',
      },
      {
        id: 'prd-5',
        type: 'bullet',
        content: 'Daily Active Users (DAU) > 85% of office staff',
      },
      {
        id: 'prd-6',
        type: 'bullet',
        content: 'Average search retrieval time < 3 seconds',
      },
      {
        id: 'prd-7',
        type: 'h2',
        content: 'User Stories & Acceptance Criteria',
      },
      {
        id: 'prd-8',
        type: 'todo',
        content: 'As an employee, I can search the handbook with Cmd+K',
        checked: true,
      },
      {
        id: 'prd-9',
        type: 'todo',
        content: 'As a team lead, I can reorder sprint tasks on a board',
        checked: true,
      },
    ],
  },
  {
    id: 'tpl-retro',
    title: '🔄 Sprint Retrospective & Learnings',
    icon: '🔄',
    category: 'Agile',
    type: 'document',
    description: 'Post-sprint review: What went well, what could be improved, and committed action items.',
    previewBlocks: [
      {
        id: 'ret-1',
        type: 'callout',
        content: 'Sprint 14 Retrospective. Focus on psychological safety and candid constructive feedback.',
        calloutIcon: '💡',
        calloutColor: 'yellow',
      },
      {
        id: 'ret-2',
        type: 'h2',
        content: '🟢 What Went Well',
      },
      {
        id: 'ret-3',
        type: 'bullet',
        content: 'Cross-functional design and engineering pairing reduced review cycles by 40%.',
      },
      {
        id: 'ret-4',
        type: 'h2',
        content: '🟡 What Could Be Improved',
      },
      {
        id: 'ret-5',
        type: 'bullet',
        content: 'Unplanned interruptions during deep work hours on Wednesday.',
      },
      {
        id: 'ret-6',
        type: 'h2',
        content: '🚀 Action Items',
      },
      {
        id: 'ret-7',
        type: 'todo',
        content: 'Establish "No-Meeting Wednesdays" starting next week',
        checked: false,
      },
    ],
  },
  {
    id: 'tpl-directory',
    title: '👥 Office Directory & Team Roles',
    icon: '👥',
    category: 'People & Ops',
    type: 'document',
    description: 'Roster of team members, departments, responsibilities, and preferred contact hours.',
    previewBlocks: [
      {
        id: 'dir-1',
        type: 'callout',
        content: 'Need help finding someone? Check the roster below or ping #ask-operations.',
        calloutIcon: '🔍',
        calloutColor: 'green',
      },
      {
        id: 'dir-2',
        type: 'h2',
        content: 'Core Departments',
      },
      {
        id: 'dir-3',
        type: 'toggle',
        content: 'Product & Design Team',
        isOpen: true,
        toggleContent: 'Lead: Alex Morgan | Design: Maya Patel | Meeting: Tuesdays at 2 PM',
      },
      {
        id: 'dir-4',
        type: 'toggle',
        content: 'Engineering & Infrastructure Team',
        isOpen: true,
        toggleContent: 'Lead: Sarah Chen | On-call rotation: PagerDuty schedule in #eng-alerts',
      },
      {
        id: 'dir-5',
        type: 'toggle',
        content: 'Operations & People Team',
        isOpen: true,
        toggleContent: 'Lead: David Kim | Office inquiries, supplies, passes, and expense approval',
      },
    ],
  },
];

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
}) => {
  const [selectedTpl, setSelectedTpl] = React.useState<TemplateOption>(TEMPLATES[0]);

  if (!isOpen) return null;

  const handleUseTemplate = () => {
    const newPage: Page = {
      id: 'page-' + Math.random().toString(36).substring(2, 9),
      title: selectedTpl.title,
      icon: selectedTpl.icon,
      type: selectedTpl.type,
      blocks: selectedTpl.previewBlocks.map((b) => ({
        ...b,
        id: 'b-' + Math.random().toString(36).substring(2, 9),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      coverUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80',
    };

    onApplyTemplate(newPage);
    onClose();
  };

  return (
    <div
      id="templates-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="templates-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-stone-900">
              Notion Office Templates
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-600 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Left template list, right preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: List */}
          <div className="md:col-span-5 border-r border-stone-100 p-3 overflow-y-auto space-y-1 bg-stone-50/50">
            {TEMPLATES.map((tpl) => {
              const isSelected = selectedTpl.id === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTpl(tpl)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-white border border-stone-300 shadow-xs ring-1 ring-stone-200'
                      : 'hover:bg-stone-100/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{tpl.icon}</span>
                    <span className="text-xs font-semibold text-stone-900 truncate">
                      {tpl.title.replace(/^[^\s]+\s/, '')}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column: Preview */}
          <div className="md:col-span-7 p-6 overflow-y-auto flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-900 mb-2">
                <span className="text-xl">{selectedTpl.icon}</span>
                <span className="text-base">{selectedTpl.title}</span>
              </div>
              <p className="text-xs text-stone-600 mb-6">
                {selectedTpl.description}
              </p>

              <div className="space-y-3 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                <div className="text-[10px] font-semibold text-stone-600 uppercase tracking-wider mb-2">
                  Sample Content Preview
                </div>
                {selectedTpl.previewBlocks.slice(0, 4).map((b, i) => (
                  <div key={i} className="text-stone-700">
                    {b.type === 'callout' && (
                      <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-blue-900 text-[11px]">
                        {b.calloutIcon} {b.content}
                      </div>
                    )}
                    {b.type === 'h2' && <div className="font-bold text-sm text-stone-900 mt-2">{b.content}</div>}
                    {b.type === 'bullet' && <div className="pl-3 border-l-2 border-stone-300"> • {b.content}</div>}
                    {b.type === 'todo' && <div className="flex items-center gap-1.5"><CheckSquare className="w-3 h-3 text-stone-600" /> {b.content}</div>}
                    {b.type === 'p' && <div>{b.content}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-stone-100 flex items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-800"
              >
                Cancel
              </button>
              <button
                type="button"
                id="apply-template-btn"
                onClick={handleUseTemplate}
                className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Use This Template</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
