import React, { useState } from 'react';
import {
  Crown,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Tag,
  ArrowRight,
  MessageSquare,
  Send,
  UserCheck,
  Shield,
  Layers,
  TrendingUp,
  Sparkles,
  Check,
  Database,
  ExternalLink,
  ChevronRight,
  Filter,
  UserPlus,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import {
  WorkspaceUser,
  KanbanTask,
  Page,
  TaskComment,
  TaskActivityLog,
  UserRole,
} from '../types';
import { UserRoleBadge } from './UserRoleBadge';
import { ExecutiveAnalyticsWidget } from './ExecutiveAnalyticsWidget';

interface UserDashboardProps {
  currentUser: WorkspaceUser;
  teamMembers: WorkspaceUser[];
  pages: Page[];
  activityLogs: TaskActivityLog[];
  onUpdateTask: (taskId: string, updatedTask: Partial<KanbanTask>, workNote?: string) => void;
  onOpenTaskDetail: (task: KanbanTask) => void;
  onNavigateToPage: (pageId: string) => void;
  onOpenUserManagement: () => void;
  onLogout: () => void;
}

const STATUS_ORDER: Array<KanbanTask['status']> = [
  'Backlog',
  'To Do',
  'In Progress',
  'In Review',
  'Done',
];

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  teamMembers,
  pages,
  activityLogs,
  onUpdateTask,
  onOpenTaskDetail,
  onNavigateToPage,
  onOpenUserManagement,
  onLogout,
}) => {
  // Pull all kanban tasks from all pages (primarily sprint board)
  const allTasks: KanbanTask[] = React.useMemo(() => {
    const list: KanbanTask[] = [];
    pages.forEach((p) => {
      if (p.kanbanTasks) {
        list.push(...p.kanbanTasks);
      }
    });
    return list;
  }, [pages]);

  // Tasks assigned to this specific logged-in user
  const myAssignedTasks = React.useMemo(() => {
    const userEmail = currentUser.email.toLowerCase().trim();
    const userName = currentUser.name.toLowerCase().trim();
    return allTasks.filter((t) => {
      const assigneeEmail = t.assignee?.email?.toLowerCase().trim();
      const assigneeName = t.assignee?.name?.toLowerCase().trim();
      const assigneeId = t.assignee?.id;
      return (
        assigneeEmail === userEmail ||
        assigneeName === userName ||
        (assigneeId && assigneeId === currentUser.id)
      );
    });
  }, [allTasks, currentUser]);

  // Inline work response note state per task id
  const [workNotes, setWorkNotes] = useState<Record<string, string>>({});
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [hrEmployeeFilter, setHrEmployeeFilter] = useState<string>('all');

  // CEO Add Admin quick state
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'admin';
  const isHR = currentUser.role === 'hr';
  const isEmployee = currentUser.role === 'employee';

  // Handle employee quick status update
  const handleQuickStatusChange = (
    task: KanbanTask,
    newStatus: KanbanTask['status']
  ) => {
    if (task.status === newStatus) return;
    const note = workNotes[task.id]?.trim();
    onUpdateTask(task.id, { status: newStatus }, note);

    // clear work note after submission
    if (note) {
      setWorkNotes((prev) => ({ ...prev, [task.id]: '' }));
    }
  };

  // Handle employee submit work response note
  const handleSubmitWorkLog = (task: KanbanTask) => {
    const note = workNotes[task.id]?.trim();
    if (!note) return;

    onUpdateTask(task.id, {}, note);
    setWorkNotes((prev) => ({ ...prev, [task.id]: '' }));
  };

  // Handle HR task re-assignment
  const handleHRReassign = (task: KanbanTask, targetMemberId: string) => {
    const member = teamMembers.find((m) => m.id === targetMemberId);
    if (!member) return;

    onUpdateTask(
      task.id,
      {
        assignee: {
          id: member.id,
          name: member.name,
          email: member.email,
          avatar: member.avatar,
          role: member.role,
        },
      },
      `Reassigned task from ${task.assignee.name} to ${member.name} (HR Operation)`
    );
  };

  // Filtered assigned tasks
  const filteredMyTasks = myAssignedTasks.filter((t) => {
    if (selectedStatusFilter === 'all') return true;
    return t.status === selectedStatusFilter;
  });

  // Calculate user-specific metrics
  const completedCount = myAssignedTasks.filter((t) => t.status === 'Done').length;
  const inProgressCount = myAssignedTasks.filter((t) => t.status === 'In Progress').length;
  const inReviewCount = myAssignedTasks.filter((t) => t.status === 'In Review').length;
  const todoCount = myAssignedTasks.filter(
    (t) => t.status === 'To Do' || t.status === 'Backlog'
  ).length;

  return (
    <div className="w-full max-w-5xl mx-auto py-3 pb-24 space-y-7 animate-in fade-in duration-200">
      {/* Top Banner: Individual User Profile & Active Session */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-amber-400 shrink-0 shadow-md"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-400 text-lg font-bold text-stone-950 ring-2 ring-amber-200 sm:h-16 sm:w-16">
                {currentUser.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {currentUser.name}
                </h1>
                <UserRoleBadge role={currentUser.role} size="md" />
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                {currentUser.title} • {currentUser.department}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5 font-mono">
                {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col sm:items-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-stone-800/90 border border-stone-700 px-3 py-1.5 rounded-lg">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>All task data synced to persistent storage</span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-stone-700"
            >
              <LogOut className="w-3.5 h-3.5 text-stone-400" />
              <span>Switch User / Log Out</span>
            </button>
          </div>
        </div>

        {/* Role Mandate Highlight */}
        <div className="mt-5 pt-4 border-t border-stone-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="text-stone-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {isAdmin && (
                <>
                  <strong>👑 Admin (CEO) Mandate:</strong> Executive leadership with exclusive authority to add more Admins and oversee company velocity.
                </>
              )}
              {isHR && (
                <>
                  <strong>👥 HR Manager Mandate:</strong> The one who manages all. Oversees all employee assignments and operations.
                </>
              )}
              {isEmployee && (
                <>
                  <strong>💼 Employee Mandate:</strong> The one who updates the status. Executes assigned work, posts progress responses, and marks milestones complete.
                </>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToPage('page-hierarchy')}
            className="text-amber-400 hover:text-amber-300 font-semibold underline text-[11px] flex items-center gap-1"
          >
            <span>View Role Hierarchy & Restrictions</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 💼 SECTION 1: EMPLOYEE SPECIFIC DASHBOARD                      */}
      {/* ============================================================== */}
      {isEmployee && (
        <div className="space-y-6">
          {/* Quick Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Total Assigned
              </span>
              <span className="text-2xl font-bold text-stone-900 mt-1 block">
                {myAssignedTasks.length}
              </span>
              <span className="text-[10px] text-stone-400">Daily tasks assigned to you</span>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
                In Progress
              </span>
              <span className="text-2xl font-bold text-amber-900 mt-1 block">
                {inProgressCount}
              </span>
              <span className="text-[10px] text-stone-400">Currently executing</span>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                In Review
              </span>
              <span className="text-2xl font-bold text-blue-900 mt-1 block">
                {inReviewCount}
              </span>
              <span className="text-[10px] text-stone-400">Awaiting approval</span>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
                Completed
              </span>
              <span className="text-2xl font-bold text-emerald-900 mt-1 block">
                {completedCount}
              </span>
              <span className="text-[10px] text-stone-400">Delivered & verified</span>
            </div>
          </div>

          {/* Core Employee Work Section: My Assigned Tasks & Status Updates */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>Daily Tasks & Work Updates</span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {filteredMyTasks.length}
                  </span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                    Update daily work status and submit progress notes. Every change is stored immediately.
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                {(['all', 'In Progress', 'To Do', 'In Review', 'Done'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSelectedStatusFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      selectedStatusFilter === filter
                        ? 'bg-stone-900 text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {filter === 'all' ? 'All My Tasks' : filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Tasks List */}
            {filteredMyTasks.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-stone-200 rounded-xl">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <h3 className="text-sm font-bold text-stone-800">
                  {selectedStatusFilter === 'all'
                    ? 'No tasks assigned to you yet'
                    : `No tasks currently in "${selectedStatusFilter}"`}
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
                  Check the sprint board to view company-wide initiatives or request tasks from your HR Manager.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateToPage('page-kanban-sprint')}
                  className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold"
                >
                  Open Sprint Kanban Board
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMyTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 sm:p-5 rounded-xl border border-stone-200 hover:border-stone-300 bg-stone-50/60 hover:bg-stone-50/90 transition-all space-y-3.5"
                  >
                    {/* Top Row: Title, Priority, Due Date, and Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => onOpenTaskDetail(task)}
                            className="text-sm font-bold text-stone-900 hover:text-stone-700 cursor-pointer flex items-center gap-1"
                          >
                            <span>{task.title}</span>
                            <ExternalLink className="w-3 h-3 text-stone-400" />
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              task.priority === 'Urgent'
                                ? 'bg-rose-100 text-rose-800'
                                : task.priority === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {task.priority} Priority
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-stone-600 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] text-stone-500 flex-wrap">
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-stone-400" />
                              <span>Due {task.dueDate}</span>
                            </span>
                          )}
                          {task.tags && task.tags.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3 text-stone-400" />
                              <span>{task.tags.join(', ')}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Current Status Pill */}
                      <div className="shrink-0 flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-stone-200 text-stone-800 border border-stone-300">
                          Current: {task.status}
                        </span>
                      </div>
                    </div>

                    {/* Employee Status Registration Buttons (The One Who Updates Status) */}
                    <div className="pt-2 border-t border-stone-200/80">
                      <div className="text-[11px] font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                        <span>1-Click Status Registration (Employee Mandate):</span>
                        <span className="text-stone-400 font-normal">Click to update status</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                        {STATUS_ORDER.map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleQuickStatusChange(task, st)}
                            className={`py-1.5 px-2 text-xs rounded-lg font-semibold transition-all border text-center ${
                              task.status === st
                                ? 'bg-stone-900 text-white border-stone-900 shadow-2xs ring-1 ring-stone-900'
                                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                            }`}
                          >
                            {task.status === st ? `✓ ${st}` : st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Work Response Note / Deliverable submission */}
                    <div className="bg-white p-3 rounded-lg border border-stone-200/80 space-y-2">
                      <label className="block text-[11px] font-semibold text-stone-700">
                        Register Work Log / Deliverable Update for this Task:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={workNotes[task.id] || ''}
                          onChange={(e) =>
                            setWorkNotes((prev) => ({ ...prev, [task.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSubmitWorkLog(task);
                            }
                          }}
                          placeholder="e.g. Completed initial API integration, pushed commit #102..."
                          className="flex-1 text-xs px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleSubmitWorkLog(task)}
                          disabled={!workNotes[task.id]?.trim()}
                          className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0"
                        >
                          <Send className="w-3 h-3" />
                          <span>Submit Work Log</span>
                        </button>
                      </div>

                      {/* Display recent comments/responses for this task */}
                      {task.comments && task.comments.length > 0 && (
                        <div className="mt-2 space-y-1 pt-1">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                            Latest Work Log:
                          </span>
                          <div className="text-[11px] text-stone-600 bg-stone-50 p-2 rounded border border-stone-100 flex items-start gap-1.5">
                            <span className="font-semibold text-stone-800 shrink-0">
                              {task.comments[task.comments.length - 1].authorName}:
                            </span>
                            <span className="italic flex-1">
                              "{task.comments[task.comments.length - 1].content}"
                            </span>
                            <span className="text-[10px] text-stone-400 shrink-0">
                              {task.comments[task.comments.length - 1].timestamp}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 👥 SECTION 2: HR MANAGER DASHBOARD ("THE ONE WHO MANAGES ALL")  */}
      {/* ============================================================== */}
      {isHR && (
        <div className="space-y-6">
          {/* HR KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Total Employees
              </span>
              <span className="text-2xl font-bold text-stone-900 mt-1 block">
                {teamMembers.filter((m) => m.role === 'employee').length}
              </span>
              <span className="text-[10px] text-stone-400">Directly managed staff</span>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">
                Total Workspace Tasks
              </span>
              <span className="text-2xl font-bold text-blue-900 mt-1 block">
                {allTasks.length}
              </span>
              <span className="text-[10px] text-stone-400">Across all projects</span>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">
                In Execution
              </span>
              <span className="text-2xl font-bold text-amber-900 mt-1 block">
                {allTasks.filter((t) => t.status === 'In Progress').length}
              </span>
              <span className="text-[10px] text-stone-400">Active deliverables</span>
            </div>

            <div className="p-4 bg-white border border-stone-200 rounded-xl shadow-2xs">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
                Completed
              </span>
              <span className="text-2xl font-bold text-emerald-900 mt-1 block">
                {allTasks.filter((t) => t.status === 'Done').length}
              </span>
              <span className="text-[10px] text-stone-400">Sprint goals achieved</span>
            </div>
          </div>

          {/* Recharts Analytics Widget: Task Completion Rates & Department Workload */}
          <ExecutiveAnalyticsWidget
            tasks={allTasks}
            teamMembers={teamMembers}
            userRole="hr"
            userName={currentUser.name}
          />

          {/* Team Workload Distribution Cards */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Team Workload Distribution & Staff Oversight</span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Monitor each employee's bandwidth and reassign tasks directly.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenUserManagement}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Onboard Employee</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {teamMembers.map((member) => {
                const memberTasks = allTasks.filter(
                  (t) =>
                    t.assignee?.email?.toLowerCase() === member.email.toLowerCase() ||
                    t.assignee?.name?.toLowerCase() === member.name.toLowerCase()
                );
                const activeTasks = memberTasks.filter((t) => t.status !== 'Done');

                return (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100/70 transition-all space-y-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-stone-300"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900 truncate">
                            {member.name}
                          </span>
                          <UserRoleBadge role={member.role} size="sm" />
                        </div>
                        <span className="text-[11px] text-stone-500 truncate block">
                          {member.title}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-stone-600">Assigned Tasks:</span>
                      <span className="font-bold text-stone-900">
                        {memberTasks.length} ({activeTasks.length} active)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HR All Tasks & Reassignment Center */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Daily Task Assignment & Management</span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                    Assign and reassign daily WordPress delivery work with immediate persistence.
                </p>
              </div>

              {/* Filter by Assignee */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500 font-semibold">Filter:</span>
                <select
                  value={hrEmployeeFilter}
                  onChange={(e) => setHrEmployeeFilter(e.target.value)}
                  className="px-2.5 py-1 bg-stone-100 border border-stone-200 rounded-lg text-stone-800 font-medium focus:outline-none"
                >
                  <option value="all">All Employees</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.email}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="divide-y divide-stone-100">
              {allTasks
                .filter((task) => {
                  if (hrEmployeeFilter === 'all') return true;
                  return task.assignee?.email?.toLowerCase() === hrEmployeeFilter.toLowerCase();
                })
                .map((task) => (
                  <div
                    key={task.id}
                    className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          onClick={() => onOpenTaskDetail(task)}
                          className="text-xs font-bold text-stone-900 hover:underline cursor-pointer"
                        >
                          {task.title}
                        </span>
                        <span className="text-[10px] bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded font-medium">
                          {task.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">
                        {task.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Reassignment Dropdown (HR Power) */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-stone-500 font-medium">Assignee:</span>
                      <select
                        value={
                          teamMembers.find(
                            (m) =>
                              m.email.toLowerCase() === task.assignee?.email?.toLowerCase() ||
                              m.name.toLowerCase() === task.assignee?.name?.toLowerCase()
                          )?.id || ''
                        }
                        onChange={(e) => handleHRReassign(task, e.target.value)}
                        className="text-xs px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-semibold focus:outline-none focus:ring-1 focus:ring-stone-400"
                      >
                        {teamMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.title})
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => onOpenTaskDetail(task)}
                        className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 👑 SECTION 3: ADMIN (CEO) DASHBOARD                          */}
      {/* ============================================================== */}
      {isAdmin && (
        <div className="space-y-6">
          {/* EXCLUSIVE CEO WIDGET: ABILITY TO ADD MORE ADMINS */}
          <div className="bg-purple-950 text-white rounded-2xl p-6 sm:p-7 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-purple-800 text-purple-200 rounded-xl">
                  <Crown className="w-5 h-5 text-amber-300" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Exclusive CEO Authority: Appoint & Add More Admins
                  </h2>
                  <p className="text-xs text-purple-200 mt-0.5">
                    Only you (the CEO) hold authorization to appoint and onboard other Admins to the executive tier.
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold bg-amber-400 text-purple-950 px-2.5 py-1 rounded-full uppercase tracking-wider">
                CEO Exclusive
              </span>
            </div>

            {adminFeedback && (
              <div className="p-3 bg-purple-900/90 border border-purple-400 rounded-xl text-xs text-amber-200 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{adminFeedback}</span>
              </div>
            )}

            <div className="bg-purple-900/60 border border-purple-700/80 rounded-xl p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newAdminName.trim() || !newAdminEmail.trim()) return;

                  // Trigger add user through team management
                  onOpenUserManagement();
                }}
                className="space-y-3"
              >
                <div className="text-xs text-purple-200">
                  Open the official user management console to appoint an Admin, promote existing HR managers, or create executive credentials:
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onOpenUserManagement}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-purple-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Crown className="w-4 h-4 text-purple-950" />
                    <span>Open Executive User Management (Add Admin)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateToPage('page-hierarchy')}
                    className="text-xs text-purple-200 hover:text-white underline"
                  >
                    View Permissions Hierarchy
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Real-time Status Audit Stream */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-700" />
                  <span>Real-Time Employee Work Status Audit Trail</span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Persistent log of deliverables and status updates submitted by employees.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigateToPage('page-kanban-sprint')}
                className="text-xs text-stone-700 hover:text-stone-950 font-semibold underline flex items-center gap-1"
              >
                <span>View Full Sprint Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Live Feed of Task Updates */}
            <div className="divide-y divide-stone-100">
              {allTasks
                .filter((t) => t.comments && t.comments.length > 0)
                .slice(0, 5)
                .map((task) => {
                  const latestComment = task.comments![task.comments!.length - 1];
                  return (
                    <div key={task.id} className="py-3 flex items-start gap-3 text-xs">
                      <img
                        src={latestComment.authorAvatar}
                        alt={latestComment.authorName}
                        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-stone-900">
                            {latestComment.authorName}
                          </span>
                          <UserRoleBadge role={latestComment.authorRole} size="sm" />
                          <span className="text-stone-400">•</span>
                          <span className="text-stone-500">{latestComment.timestamp}</span>
                        </div>
                        <div className="text-stone-700 mt-0.5 font-medium">
                          Task: <span className="font-semibold text-stone-900">{task.title}</span>
                        </div>
                        <div className="text-stone-600 bg-stone-50 p-2 rounded border border-stone-200/80 mt-1 italic">
                          "{latestComment.content}"
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 shrink-0">
                        {task.status}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Global Persistence Confirmation Banner */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between text-xs text-stone-600">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Storage State:</strong> Every task update, status registration, and deliverable response is automatically saved to browser storage.
          </span>
        </div>
        <span className="text-[11px] text-stone-400 font-mono">
          Last Synced: Just now
        </span>
      </div>
    </div>
  );
};
