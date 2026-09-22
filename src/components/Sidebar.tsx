import React, { useState } from 'react';
import {
  Search,
  Plus,
  Star,
  FileText,
  Kanban,
  Table,
  Trash2,
  Copy,
  RotateCcw,
  Sparkles,
  Shield,
  ChevronDown,
  Lock,
  Inbox,
  Bot,
  Mail,
} from 'lucide-react';
import { Page, PageType, WorkspaceUser } from '../types';
import { UserRoleBadge } from './UserRoleBadge';

interface SidebarProps {
  pages: Page[];
  currentPageId: string;
  isOpen: boolean;
  currentUser: WorkspaceUser;
  teamMembers: WorkspaceUser[];
  onSelectPage: (pageId: string) => void;
  onAddPage: (type: PageType) => void;
  onDeletePage: (pageId: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onOpenSearch: () => void;
  onOpenTemplates: () => void;
  onResetDefaults: () => void;
  onSwitchUser: (user: WorkspaceUser) => void;
  onOpenUserManagement: () => void;
  onOpenLoginModal?: () => void;
  unreadNotificationsCount?: number;
  onOpenAssistant?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pages,
  currentPageId,
  isOpen,
  currentUser,
  teamMembers,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onOpenSearch,
  onOpenTemplates,
  onResetDefaults,
  onSwitchUser,
  onOpenUserManagement,
  onOpenLoginModal,
  unreadNotificationsCount = 0,
  onOpenAssistant,
}) => {
  const [filterText, setFilterText] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);

  if (!isOpen) return null;

  const canDeletePages = currentUser.role === 'admin' || currentUser.role === 'hr';
  const canResetWorkspace = currentUser.role === 'admin';

  const filteredPages = pages.filter((p) =>
    p.title.toLowerCase().includes(filterText.toLowerCase())
  );

  const favoritePages = filteredPages.filter((p) => p.isFavorite);
  const otherPages = filteredPages.filter((p) => !p.isFavorite);

  const handleAttemptDelete = (pageId: string) => {
    if (!canDeletePages) {
      alert('Action Restricted: Employees cannot delete workspace pages. Please request an HR Manager or CEO/Admin.');
      return;
    }
    onDeletePage(pageId);
  };

  const handleAttemptReset = () => {
    if (!canResetWorkspace) {
      alert('Action Restricted: Only the CEO / Admin has permission to reset workspace defaults.');
      return;
    }
    onResetDefaults();
  };

  return (
    <aside
      id="notion-sidebar"
      className="w-64 h-screen bg-[#F7F7F5] border-r border-stone-200 flex flex-col justify-between shrink-0 select-none z-40 transition-all text-stone-800"
    >
      {/* Top Header & Search */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Workspace Brand */}
        <div className="p-3.5 border-b border-stone-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              🏢
            </div>
            <div>
              <div className="text-xs font-semibold text-stone-900 leading-none mb-0.5">
                Acme Workspace
              </div>
              <div className="text-[10px] text-stone-600 leading-none">
                Office Hub
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenTemplates}
            title="Sample Templates"
            className="p-1 text-stone-600 hover:text-amber-700 hover:bg-stone-200/60 rounded transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Filter Search Box */}
        <div className="p-2.5 pb-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-600" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Quick search pages..."
              className="w-full text-xs pl-8 pr-2 py-1.5 bg-stone-200/50 hover:bg-stone-200/80 focus:bg-white border border-transparent focus:border-stone-300 rounded-lg text-stone-800 placeholder:text-stone-600 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Prominent + New Page Button */}
        <div className="px-2.5 py-1.5 relative">
          <button
            type="button"
            id="sidebar-new-page-btn"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Page</span>
          </button>

          {/* Simple Dropdown for New Page Type */}
          {showAddMenu && (
            <div
              className="absolute left-2.5 right-2.5 top-11 z-50 bg-white border border-stone-200 rounded-xl shadow-lg p-1 text-xs text-stone-700 animate-in fade-in zoom-in-95 duration-100"
            >
              <button
                type="button"
                onClick={() => {
                  onAddPage('document');
                  setShowAddMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-stone-100 text-left transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <div>
                  <div className="font-medium text-stone-900">Document Note</div>
                  <div className="text-[10px] text-stone-600">Freeform text, lists & checklists</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onAddPage('kanban');
                  setShowAddMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-stone-100 text-left transition-colors"
              >
                <Kanban className="w-3.5 h-3.5 text-amber-600" />
                <div>
                  <div className="font-medium text-stone-900">Task Board</div>
                  <div className="text-[10px] text-stone-600">Sprint Kanban columns</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onAddPage('table');
                  setShowAddMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-stone-100 text-left transition-colors"
              >
                <Table className="w-3.5 h-3.5 text-emerald-600" />
                <div>
                  <div className="font-medium text-stone-900">Data Table</div>
                  <div className="text-[10px] text-stone-600">Structured goals & spreadsheet</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Page List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-3">
          {/* Quick link to Individual Personal Dashboard */}
          <button
            type="button"
            onClick={() => onSelectPage('page-my-dashboard')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentPageId === 'page-my-dashboard'
                ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs font-bold'
                : 'bg-stone-200/50 hover:bg-stone-200/90 text-stone-800 border border-stone-200/80'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-sm">📊</span>
              <span className="truncate">My Personal Dashboard</span>
            </div>
            <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold shrink-0">
              {currentUser.role === 'admin'
                ? 'CEO'
                : currentUser.role === 'hr'
                ? 'HR'
                : 'Tasks'}
            </span>
          </button>

          {/* Quick link to Organization Hierarchy */}
          <button
            type="button"
            onClick={() => onSelectPage('page-hierarchy')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentPageId === 'page-hierarchy'
                ? 'bg-purple-100 text-purple-950 border border-purple-300 shadow-2xs'
                : 'bg-stone-200/50 hover:bg-stone-200/90 text-stone-800 border border-stone-200/80'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-sm">👑</span>
              <span className="truncate">Roles & Hierarchy</span>
            </div>
            <span className="text-[10px] bg-purple-200 text-purple-900 px-1.5 py-0.5 rounded font-bold shrink-0">
              Restrictions
            </span>
          </button>

          {/* Quick link to Inbox */}
          <button
            type="button"
            onClick={() => onSelectPage('page-inbox')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentPageId === 'page-inbox'
                ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs font-bold'
                : 'bg-stone-200/50 hover:bg-stone-200/90 text-stone-800 border border-stone-200/80'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="text-sm">📥</span>
              <span className="truncate">Inbox & Alerts</span>
            </div>
            {unreadNotificationsCount > 0 ? (
              <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold shrink-0 animate-pulse">
                {unreadNotificationsCount} new
              </span>
            ) : (
              <span className="text-[10px] text-stone-500 font-mono">0</span>
            )}
          </button>

          {/* Quick trigger for Thozha AI Copilot */}
          {onOpenAssistant && (
            <button
              type="button"
              onClick={onOpenAssistant}
              title="Open Thozha (AI Workspace Companion)"
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-stone-950 shadow-2xs"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm">🤖</span>
                <span className="truncate">Thozha AI</span>
              </div>
              <span className="text-[10px] bg-stone-950/20 text-stone-950 px-1.5 py-0.5 rounded font-mono font-bold">
                AI
              </span>
            </button>
          )}

          {/* Favorites */}
          {favoritePages.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[10px] font-semibold text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Favorites</span>
              </div>
              <div className="space-y-0.5">
                {favoritePages.map((page) => (
                  <PageSidebarItem
                    key={'fav-' + page.id}
                    page={page}
                    isActive={currentPageId === page.id}
                    canDelete={canDeletePages}
                    onSelect={() => onSelectPage(page.id)}
                    onDelete={() => handleAttemptDelete(page.id)}
                    onDuplicate={() => onDuplicatePage(page.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Pages */}
          <div>
            <div className="px-2 py-1 text-[10px] font-semibold text-stone-600 uppercase tracking-wider">
              <span>Pages ({filteredPages.length})</span>
            </div>
            <div className="space-y-0.5">
              {(favoritePages.length > 0 ? otherPages : filteredPages).map((page) => (
                <PageSidebarItem
                  key={page.id}
                  page={page}
                  isActive={currentPageId === page.id}
                  canDelete={canDeletePages}
                  onSelect={() => onSelectPage(page.id)}
                  onDelete={() => handleAttemptDelete(page.id)}
                  onDuplicate={() => onDuplicatePage(page.id)}
                />
              ))}

              {filteredPages.length === 0 && (
                <div className="px-2 py-3 text-xs text-stone-600 text-center">
                  No matching pages
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Role Management Quick Button */}
      <div className="px-2.5 py-1.5 border-t border-stone-200/60 bg-[#F4F4F1]">
        <button
          type="button"
          onClick={onOpenUserManagement}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-stone-200/70 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-stone-700" />
            <span>Roles & Hierarchy</span>
          </span>
          <UserRoleBadge role={currentUser.role} size="sm" showLabel={false} />
        </button>
      </div>

      {/* Footer: User Persona Switcher & Reset */}
      <div className="p-3 border-t border-stone-200/70 bg-[#F7F7F5] relative">
        <div className="flex items-center justify-between">
          {/* Active User profile & Switcher Trigger */}
          <button
            type="button"
            onClick={() => setShowUserSwitcher(!showUserSwitcher)}
            className="flex items-center gap-2 hover:bg-stone-200/60 p-1 rounded-lg text-left transition-colors flex-1 mr-1"
            title="Click to switch persona (CEO, HR, Employee)"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-stone-300 shrink-0"
            />
            <div className="leading-tight truncate flex-1">
              <div className="text-xs font-bold text-stone-900 truncate">
                {currentUser.name}
              </div>
              <div className="mt-0.5">
                <UserRoleBadge role={currentUser.role} size="sm" />
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          </button>

          {/* Reset Workspace Button (CEO/Admin only) */}
          <button
            type="button"
            onClick={handleAttemptReset}
            title={canResetWorkspace ? "Reset workspace to default" : "Reset disabled: Requires CEO/Admin role"}
            className={`p-1.5 rounded-md transition-colors ${
              canResetWorkspace
                ? 'text-stone-600 hover:text-stone-800 hover:bg-stone-200/60'
                : 'text-stone-300 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick User Switcher Popover */}
        {showUserSwitcher && (
          <div className="absolute left-2 right-2 bottom-16 z-50 bg-white border border-stone-200 rounded-xl shadow-xl p-2 text-xs text-stone-800 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Switch Persona to Test Restrictions:
            </div>

            <div className="space-y-1">
              {teamMembers.map((member) => {
                const isSelected = member.id === currentUser.id;
                return (
                  <button
                    key={'switch-' + member.id}
                    type="button"
                    onClick={() => {
                      onSwitchUser(member);
                      setShowUserSwitcher(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                      isSelected ? 'bg-stone-100 font-semibold' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-xs text-stone-900">{member.name}</div>
                        <div className="text-[10px] text-stone-500">{member.title}</div>
                      </div>
                    </div>
                    <UserRoleBadge role={member.role} size="sm" />
                  </button>
                );
              })}

              {onOpenLoginModal && (
                <div className="pt-2 border-t border-stone-200 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserSwitcher(false);
                      onOpenLoginModal();
                    }}
                    className="w-full py-1.5 px-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>Universal Login Portal</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

interface PageSidebarItemProps {
  page: Page;
  isActive: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const PageSidebarItem: React.FC<PageSidebarItemProps> = ({
  page,
  isActive,
  canDelete,
  onSelect,
  onDelete,
  onDuplicate,
}) => {
  return (
    <div className="group relative flex items-center rounded-lg transition-colors">
      <button
        type="button"
        onClick={onSelect}
        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left truncate pr-12 ${
          isActive
            ? 'bg-stone-200/90 font-semibold text-stone-950 shadow-2xs'
            : 'text-stone-700 hover:bg-stone-200/50'
        }`}
      >
        <span className="shrink-0 text-sm">{page.icon}</span>
        <span className="truncate flex-1">{page.title}</span>
      </button>

      {/* Fast 1-click actions on hover */}
      <div className="absolute right-1.5 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          title="Duplicate page"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 hover:bg-stone-300/70 rounded text-stone-600 hover:text-stone-800 transition-colors"
        >
          <Copy className="w-3 h-3" />
        </button>

        {canDelete ? (
          <button
            type="button"
            title="Delete page"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-red-100 rounded text-stone-600 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        ) : (
          <span
            title="Page deletion restricted to HR and CEO/Admin"
            className="p-1 text-stone-300 cursor-not-allowed"
          >
            <Lock className="w-3 h-3" />
          </span>
        )}
      </div>
    </div>
  );
};
