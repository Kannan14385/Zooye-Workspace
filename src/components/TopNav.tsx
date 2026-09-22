import React, { useState } from 'react';
import {
  Menu,
  Star,
  Download,
  Share2,
  Check,
  Shield,
} from 'lucide-react';
import { Page, WorkspaceUser } from '../types';
import { UserRoleBadge } from './UserRoleBadge';
import { LogIn, Database, Inbox, Bot, Sparkles } from 'lucide-react';

interface TopNavProps {
  page: Page;
  isSidebarOpen: boolean;
  currentUser: WorkspaceUser;
  teamMembers: WorkspaceUser[];
  onToggleSidebar: () => void;
  onToggleFavorite: () => void;
  onOpenUserManagement: () => void;
  onSwitchUser: (user: WorkspaceUser) => void;
  onNavigateToHierarchy?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToInbox?: () => void;
  onOpenAssistant?: () => void;
  unreadNotificationsCount?: number;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  page,
  isSidebarOpen,
  currentUser,
  teamMembers,
  onToggleSidebar,
  onToggleFavorite,
  onOpenUserManagement,
  onSwitchUser,
  onNavigateToHierarchy,
  onNavigateToDashboard,
  onNavigateToHome,
  onNavigateToInbox,
  onOpenAssistant,
  unreadNotificationsCount = 0,
  onOpenLoginModal,
  onLogout,
}) => {
  const [copied, setCopied] = useState(false);

  const adminMember = teamMembers.find((m) => m.role === 'admin');
  const hrMember = teamMembers.find((m) => m.role === 'hr');
  const employeeMember = teamMembers.find((m) => m.role === 'employee');

  const handleExportMarkdown = () => {
    let md = `# ${page.title}\n\n`;
    if (page.type === 'document' || page.type === 'guide') {
      page.blocks.forEach((b) => {
        if (b.type === 'h1') md += `# ${b.content}\n\n`;
        else if (b.type === 'h2') md += `## ${b.content}\n\n`;
        else if (b.type === 'h3') md += `### ${b.content}\n\n`;
        else if (b.type === 'bullet') md += `- ${b.content}\n`;
        else if (b.type === 'numbered') md += `1. ${b.content}\n`;
        else if (b.type === 'todo') md += `- [${b.checked ? 'x' : ' '}] ${b.content}\n`;
        else if (b.type === 'quote') md += `> ${b.content}\n\n`;
        else if (b.type === 'code') md += `\`\`\`${b.codeLanguage || ''}\n${b.content}\n\`\`\`\n\n`;
        else if (b.type === 'callout') md += `> **${b.calloutIcon || '💡'}** ${b.content}\n\n`;
        else if (b.type === 'divider') md += `---\n\n`;
        else md += `${b.content}\n\n`;
      });
    } else if (page.type === 'kanban') {
      md += `## Sprint Kanban Board\n\n`;
      page.kanbanTasks?.forEach((t) => {
        md += `- [${t.status}] **${t.title}** (Priority: ${t.priority}, Assignee: ${t.assignee.name})\n`;
      });
    } else if (page.type === 'table') {
      md += `## Objectives & OKRs\n\n`;
      page.databaseRows?.forEach((r) => {
        md += `- **${r.title}** | Category: ${r.category} | Progress: ${r.progress}% | Owner: ${r.owner}\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 h-12 border-b border-stone-200 bg-white/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between transition-all">
      {/* Left: Sidebar Toggle + Breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          id="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-stone-600 truncate">
          <span className="font-medium text-stone-600 hover:text-stone-800">
            Acme Office Hub
          </span>
          <span>/</span>
          <div className="flex items-center gap-1 font-medium text-stone-900 truncate">
            <span>{page.icon}</span>
            <span className="truncate max-w-[140px] sm:max-w-xs">{page.title}</span>
          </div>
        </div>
      </div>

      {/* Right: User Role & Actions */}
      <div className="flex items-center gap-1.5 text-stone-600">
        {/* Instant Role Switcher (CEO / HR / Employee) */}
        <div className="hidden sm:flex items-center bg-stone-100/90 p-0.5 rounded-lg border border-stone-200/90 text-[11px]">
          <span className="px-1.5 text-stone-500 font-semibold text-[10px] uppercase tracking-wider">
            Role:
          </span>

          {adminMember && (
            <button
              type="button"
              onClick={() => onSwitchUser(adminMember)}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                currentUser.role === 'admin'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
              }`}
              title="Admin (CEO): Exclusive authority to add more Admins"
            >
              👑 CEO
            </button>
          )}

          {hrMember && (
            <button
              type="button"
              onClick={() => onSwitchUser(hrMember)}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                currentUser.role === 'hr'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
              }`}
              title="HR Manager: The one who manages all (Cannot add Admins)"
            >
              👥 HR
            </button>
          )}

          {employeeMember && (
            <button
              type="button"
              onClick={() => onSwitchUser(employeeMember)}
              className={`px-2 py-0.5 rounded-md font-semibold transition-all ${
                currentUser.role === 'employee'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
              }`}
              title="Employee: The one who updates the status"
            >
              💼 Employee
            </button>
          )}
        </div>

        {/* Workspace Home Shortcut */}
        {onNavigateToHome && (
          <button
            type="button"
            onClick={onNavigateToHome}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              page.id === 'page-home' || page.type === 'home'
                ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs font-bold'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
            }`}
            title="Open Workspace Home Page"
          >
            <span>🏠</span>
            <span className="hidden md:inline">Home</span>
          </button>
        )}

        {/* Individual Personal Dashboard Shortcut */}
        {onNavigateToDashboard && (
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              page.id === 'page-my-dashboard'
                ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs font-bold'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
            }`}
            title="Open Your Individual User Dashboard"
          >
            <span>📊</span>
            <span className="hidden md:inline">My Dashboard</span>
          </button>
        )}

        {/* Inbox Section Button */}
        {onNavigateToInbox && (
          <button
            type="button"
            onClick={onNavigateToInbox}
            className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              page.id === 'page-inbox'
                ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs font-bold'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200'
            }`}
            title="Open Inbox & Alerts"
          >
            <Inbox className="w-3.5 h-3.5 text-stone-700" />
            <span className="hidden sm:inline">Inbox</span>
            {(unreadNotificationsCount || 0) > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white font-bold text-[10px] rounded-full shadow-2xs">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        )}

        {/* AI Copilot Button */}
        {onOpenAssistant && (
          <button
            type="button"
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-stone-950 rounded-lg text-xs font-bold transition-all shadow-xs"
            title="Ask Thozha AI about deadlines & tasks"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Thozha AI</span>
          </button>
        )}

        {/* Real-time Storage Persisted Badge */}
        <div
          title="All assigned tasks, status updates, and comments are stored in persistent storage"
          className="hidden lg:flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-medium"
        >
          <Database className="w-3 h-3 text-emerald-600" />
          <span>Stored</span>
        </div>

        {/* Role Hierarchy Quick Access Button */}
        <button
          type="button"
          onClick={onOpenUserManagement}
          className="flex items-center gap-1.5 px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs transition-colors"
          title="View Hierarchy of Users & Restrictions"
        >
          <Shield className="w-3.5 h-3.5 text-stone-600" />
          <UserRoleBadge role={currentUser.role} size="sm" />
        </button>

        {/* User Account / Universal Login Modal Trigger */}
        {onOpenLoginModal && (
          <button
            type="button"
            onClick={onOpenLoginModal}
            className="flex items-center gap-1 px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
            title="Open Universal Login Page & Switch User"
          >
            <LogIn className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Universal Login</span>
          </button>
        )}

        {/* Favorite Star */}
        <button
          type="button"
          id="favorite-page-btn"
          onClick={onToggleFavorite}
          className={`p-1.5 rounded-lg transition-colors ${
            page.isFavorite
              ? 'text-amber-500 hover:bg-amber-50'
              : 'hover:text-stone-900 hover:bg-stone-100'
          }`}
          title={page.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`w-4 h-4 ${page.isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Export Markdown */}
        <button
          type="button"
          id="export-markdown-btn"
          onClick={handleExportMarkdown}
          className="px-2.5 py-1 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs text-stone-700 font-medium"
          title="Export as Markdown (.md)"
        >
          <Download className="w-3.5 h-3.5 text-stone-500" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Share / Copy link */}
        <button
          type="button"
          id="share-link-btn"
          onClick={handleShareLink}
          className="px-2.5 py-1 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs text-stone-700 font-medium"
          title="Copy Link to Clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-medium hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Share</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
