import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Crown,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  Kanban,
  FileText,
  Shield,
  Layers,
  TrendingUp,
  LogOut,
  Calendar,
  Compass,
  Inbox,
  Bot,
  Mail,
} from 'lucide-react';
import { WorkspaceUser, KanbanTask, Page, TaskActivityLog } from '../types';
import { UserRoleBadge } from './UserRoleBadge';

interface HomePageProps {
  currentUser: WorkspaceUser;
  teamMembers: WorkspaceUser[];
  pages: Page[];
  activityLogs: TaskActivityLog[];
  onNavigateToDashboard: () => void;
  onNavigateToPage: (pageId: string) => void;
  onOpenUniversalLogin: () => void;
  onNavigateToInbox?: () => void;
  onOpenAssistant?: () => void;
  unreadNotificationsCount?: number;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentUser,
  teamMembers,
  pages,
  activityLogs,
  onNavigateToDashboard,
  onNavigateToPage,
  onOpenUniversalLogin,
  onNavigateToInbox,
  onOpenAssistant,
  unreadNotificationsCount = 0,
}) => {
  // Pull all tasks from kanban board
  const allTasks: KanbanTask[] = React.useMemo(() => {
    const list: KanbanTask[] = [];
    pages.forEach((p) => {
      if (p.kanbanTasks) list.push(...p.kanbanTasks);
    });
    return list;
  }, [pages]);

  // Tasks assigned to current user
  const myTasks = React.useMemo(() => {
    const email = currentUser.email.toLowerCase().trim();
    const name = currentUser.name.toLowerCase().trim();
    return allTasks.filter(
      (t) =>
        t.assignee?.email?.toLowerCase().trim() === email ||
        t.assignee?.name?.toLowerCase().trim() === name ||
        t.assignee?.id === currentUser.id
    );
  }, [allTasks, currentUser]);

  const activeMyTasks = myTasks.filter((t) => t.status !== 'Done');
  const completedMyTasks = myTasks.filter((t) => t.status === 'Done');

  const isAdmin = currentUser.role === 'admin';
  const isHR = currentUser.role === 'hr';
  const isEmployee = currentUser.role === 'employee';

  return (
    <div className="w-full max-w-5xl mx-auto py-4 pb-24 space-y-7 animate-in fade-in duration-200">
      {/* Top Welcome Hero */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                Workspace Home Page
              </span>
              <span className="text-xs text-stone-400">
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Welcome back, {currentUser.name}!</span>
              <span className="text-xl sm:text-2xl">👋</span>
            </h1>

            <div className="flex items-center gap-2.5 flex-wrap pt-1">
              <UserRoleBadge role={currentUser.role} size="md" />
              <span className="text-xs text-stone-300">
                {currentUser.title} • {currentUser.department}
              </span>
              <span className="text-xs text-stone-400 font-mono">({currentUser.email})</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenUniversalLogin}
              className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 border border-stone-700"
            >
              <LogOut className="w-3.5 h-3.5 text-stone-400" />
              <span>Universal Login / Switch User</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PROMINENT HERO CARD: REDIRECT TO DASHBOARD               */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-300/80 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500 text-stone-950 font-bold shadow-2xs">
                📊
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                Your Personal {isAdmin ? 'CEO' : isHR ? 'HR' : 'Employee'} Dashboard
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                Ready
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {isAdmin &&
                'Access the Executive Suite to monitor overall company velocity, inspect live employee deliverables, and use your exclusive authority to appoint additional Admins.'}
              {isHR &&
                'Access the Staff Management Center to view all employee task distributions, reassign initiatives, and maintain human resource oversight.'}
              {isEmployee &&
                `You currently have ${activeMyTasks.length} active assigned tasks. Go directly to your personal dashboard to register 1-click status updates and submit progress work logs.`}
            </p>

            <div className="flex items-center gap-4 text-xs text-stone-600 pt-1 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {isAdmin
                    ? `${allTasks.length} Workspace Tasks Tracked`
                    : isHR
                    ? `${teamMembers.length} Managed Employees`
                    : `${myTasks.length} Total Assigned Tasks (${completedMyTasks.length} Done)`}
                </span>
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Real-time Data Persistence Enabled</span>
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="w-full sm:w-auto px-5 py-3 bg-stone-950 hover:bg-stone-800 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow group"
            >
              <span>Redirect to My Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-stone-400" />
          <span>Workspace Quick Destinations</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Personal Dashboard */}
          <div
            onClick={onNavigateToDashboard}
            className="p-4 rounded-xl border border-stone-200 bg-white hover:border-amber-400 hover:shadow-2xs transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">📊</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h4 className="text-xs font-bold text-stone-900">Personal Dashboard</h4>
            <p className="text-[11px] text-stone-500 line-clamp-2">
              Role-specific tools: Recharts workload analytics, task status registration, and executive controls.
            </p>
          </div>

          {/* Card 2: Sprint Kanban Board */}
          <div
            onClick={() => onNavigateToPage('page-kanban-sprint')}
            className="p-4 rounded-xl border border-stone-200 bg-white hover:border-blue-400 hover:shadow-2xs transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">📋</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h4 className="text-xs font-bold text-stone-900">Sprint Kanban Board</h4>
            <p className="text-[11px] text-stone-500 line-clamp-2">
              Backlog, To Do, In Progress, In Review, and Done workflows with interactive task cards.
            </p>
          </div>

          {/* Card 3: Role Hierarchy */}
          <div
            onClick={() => onNavigateToPage('page-hierarchy')}
            className="p-4 rounded-xl border border-stone-200 bg-white hover:border-purple-400 hover:shadow-2xs transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">👑</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h4 className="text-xs font-bold text-stone-900">Role Hierarchy</h4>
            <p className="text-[11px] text-stone-500 line-clamp-2">
              Explore CEO (Adds Admins), HR (Manages All), and Employee (Updates Status) matrix.
            </p>
          </div>

          {/* Card 4: Office Hub Wiki */}
          <div
            onClick={() => onNavigateToPage('page-office-hub')}
            className="p-4 rounded-xl border border-stone-200 bg-white hover:border-emerald-400 hover:shadow-2xs transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">🏢</span>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h4 className="text-xs font-bold text-stone-900">Acme Office Hub</h4>
            <p className="text-[11px] text-stone-500 line-clamp-2">
              Company guidelines, Wi-Fi credentials, employee directory, and documentation.
            </p>
          </div>

          {/* Card 5: Inbox & Real-Time Alerts */}
          <div
            onClick={() => {
              if (onNavigateToInbox) onNavigateToInbox();
              else onNavigateToPage('page-inbox');
            }}
            className="p-4 rounded-xl border border-amber-300 bg-amber-50/50 hover:bg-amber-100/60 hover:shadow-2xs transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">📥</span>
                {unreadNotificationsCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white font-bold text-[10px] rounded-full">
                    {unreadNotificationsCount}
                  </span>
                )}
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h4 className="text-xs font-bold text-stone-900">Inbox & Email Alerts</h4>
            <p className="text-[11px] text-stone-600 line-clamp-2">
              Superior task assignments, deadline intimations & real-time email outbox.
            </p>
          </div>

          {/* Card 6: Notion Gemini AI Assistant */}
          {onOpenAssistant && (
            <div
              onClick={onOpenAssistant}
              className="p-4 rounded-xl border border-stone-800 bg-stone-900 text-white hover:bg-stone-800 hover:shadow-2xs transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl">🤖</span>
                  <span className="text-[10px] font-mono uppercase bg-amber-400 text-stone-950 font-bold px-1.5 py-0.5 rounded">
                    Thozha
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-xs font-bold text-white">Thozha AI Copilot</h4>
              <p className="text-[11px] text-stone-300 line-clamp-2">
                Ask Thozha about upcoming deadlines, review assigned work, and draft workspace documents.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Role-Specific Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Current Status Overview */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-stone-700" />
              <span>
                {isEmployee
                  ? 'My Assigned Tasks Snapshot'
                  : isHR
                  ? 'Staff Management Snapshot'
                  : 'Executive Overview'}
              </span>
            </h3>
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="text-xs font-semibold text-stone-700 hover:text-stone-900 underline flex items-center gap-1"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {isEmployee ? (
            myTasks.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">
                No tasks assigned to your account right now. Check the sprint board!
              </p>
            ) : (
              <div className="space-y-2.5">
                {myTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-stone-900 truncate">{task.title}</p>
                      <p className="text-[11px] text-stone-500">
                        Priority: {task.priority} • Due {task.dueDate || 'Soon'}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-800 shrink-0">
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            )
          ) : isHR ? (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                  <span className="text-lg font-bold text-stone-900 block">
                    {teamMembers.length}
                  </span>
                  <span className="text-[11px] text-stone-500">Total Staff</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                  <span className="text-lg font-bold text-blue-900 block">
                    {allTasks.length}
                  </span>
                  <span className="text-[11px] text-stone-500">Company Tasks</span>
                </div>
              </div>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                As HR Manager ("The one who manages all"), you have direct authority to inspect workload distributions and reassign tasks across departments.
              </p>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                  <span className="text-lg font-bold text-purple-900 block">
                    {teamMembers.filter((m) => m.role === 'admin').length}
                  </span>
                  <span className="text-[11px] text-stone-500">Executive Admins</span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-center">
                  <span className="text-lg font-bold text-emerald-900 block">
                    {Math.round(
                      (allTasks.filter((t) => t.status === 'Done').length / (allTasks.length || 1)) *
                        100
                    )}
                    %
                  </span>
                  <span className="text-[11px] text-stone-500">Sprint Completion</span>
                </div>
              </div>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                As CEO, you have exclusive authorization to onboard new executive Admins and oversee company-wide delivery.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Live Work Activity Stream */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>Workspace Activity Feed</span>
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Audit</span>
            </span>
          </div>

          <div className="space-y-3">
            {activityLogs.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">
                No recent activity logged yet. Status changes and comments will appear here.
              </p>
            ) : (
              activityLogs.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900">{log.updatedBy.name}</span>
                    <span className="text-[10px] text-stone-400">{log.timestamp}</span>
                  </div>
                  <p className="text-stone-700">
                    Updated <span className="font-semibold text-stone-900">"{log.taskTitle}"</span> to{' '}
                    <span className="font-bold text-stone-900">{log.newStatus}</span>
                  </p>
                  {log.note && (
                    <p className="text-[11px] text-stone-600 italic bg-white p-1.5 rounded border border-stone-200/60">
                      "{log.note}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
