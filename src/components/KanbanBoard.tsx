import React, { useState } from 'react';
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Search,
  MessageSquare,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { KanbanTask, WorkspaceUser } from '../types';
import { TaskDetailModal } from './TaskDetailModal';
import { UserRoleBadge } from './UserRoleBadge';
import { dispatchWorkAssignmentEmail } from '../utils/notificationService';

interface KanbanBoardProps {
  tasks: KanbanTask[];
  currentUser: WorkspaceUser;
  teamMembers: WorkspaceUser[];
  onChange: (tasks: KanbanTask[]) => void;
  onOpenUserManagement?: () => void;
}

const COLUMNS: Array<KanbanTask['status']> = [
  'Backlog',
  'To Do',
  'In Progress',
  'In Review',
  'Done',
];

const PRIORITY_COLORS: Record<KanbanTask['priority'], string> = {
  Low: 'bg-stone-100 text-stone-700 border-stone-200',
  Medium: 'bg-blue-50 text-blue-700 border-blue-200',
  High: 'bg-amber-50 text-amber-700 border-amber-200',
  Urgent: 'bg-rose-50 text-rose-700 border-rose-200',
};

const COLUMN_COLORS: Record<KanbanTask['status'], { badge: string; border: string }> = {
  Backlog: { badge: 'bg-stone-200 text-stone-800', border: 'border-stone-200' },
  'To Do': { badge: 'bg-sky-100 text-sky-800', border: 'border-sky-200' },
  'In Progress': { badge: 'bg-amber-100 text-amber-800', border: 'border-amber-200' },
  'In Review': { badge: 'bg-purple-100 text-purple-800', border: 'border-purple-200' },
  Done: { badge: 'bg-emerald-100 text-emerald-800', border: 'border-emerald-200' },
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  currentUser,
  teamMembers,
  onChange,
  onOpenUserManagement,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addingInColumn, setAddingInColumn] = useState<KanbanTask['status'] | null>(null);
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlinePriority, setInlinePriority] = useState<KanbanTask['priority']>('Medium');
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<KanbanTask | null>(null);

  const moveTask = (taskId: string, targetStatus: KanbanTask['status']) => {
    onChange(
      tasks.map((t) => {
        if (t.id !== taskId) return t;
        const autoComment = {
          id: 'c-' + Date.now(),
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar,
          authorRole: currentUser.role,
          content: `Moved task to ${targetStatus}`,
          timestamp: 'Just now',
          statusChange: targetStatus,
        };
        return {
          ...t,
          status: targetStatus,
          comments: [...(t.comments || []), autoComment],
        };
      })
    );
  };

  const deleteTask = (taskId: string) => {
    onChange(tasks.filter((t) => t.id !== taskId));
  };

  const handleUpdateSingleTask = (updatedTask: KanbanTask) => {
    onChange(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    setSelectedTaskForDetail(updatedTask);
  };

  const handleInlineAdd = (columnStatus: KanbanTask['status']) => {
    if (!inlineTitle.trim()) return;

    // Default assignee based on current user role or team member
    const defaultAssignee =
      currentUser.role === 'employee'
        ? currentUser
        : teamMembers.find((m) => m.role === 'employee') || currentUser;

    const newTask: KanbanTask = {
      id: 't-' + Math.random().toString(36).substring(2, 9),
      title: inlineTitle.trim(),
      status: columnStatus,
      priority: inlinePriority,
      assignee: {
        id: defaultAssignee.id,
        name: defaultAssignee.name,
        avatar: defaultAssignee.avatar,
        email: defaultAssignee.email,
        role: defaultAssignee.role,
      },
      dueDate: 'This sprint',
      tags: ['Sprint'],
      comments: [
        {
          id: 'c-' + Date.now(),
          authorId: currentUser.id,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar,
          authorRole: currentUser.role,
          content: `Task created and placed in ${columnStatus}`,
          timestamp: 'Just now',
        },
      ],
    };

    onChange([...tasks, newTask]);
    setInlineTitle('');
    setAddingInColumn(null);

    // If assigned by superior to another member, dispatch real-time email immediately
    if (currentUser.role === 'admin' || currentUser.role === 'hr') {
      dispatchWorkAssignmentEmail(currentUser, defaultAssignee, {
        id: newTask.id,
        title: newTask.title,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        status: newTask.status,
      });
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (!searchQuery.trim()) return true;
    return (
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignee.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="w-full pb-20">
      {/* Role Authority & Action Banner */}
      <div className="mb-4 p-3.5 bg-stone-100/90 border border-stone-200/90 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            referrerPolicy="no-referrer"
            className="w-6 h-6 rounded-full object-cover ring-1 ring-stone-300"
          />
          <div>
            <div className="font-semibold text-stone-900 flex items-center gap-1.5">
              <span>Signed in as {currentUser.name}</span>
              <UserRoleBadge role={currentUser.role} size="sm" />
            </div>
            <div className="text-[11px] text-stone-600">
              {currentUser.role === 'admin' && (
                <span>👑 <strong>CEO / Admin</strong>: Full assignment control + exclusive authority to add & appoint new Admins.</span>
              )}
              {currentUser.role === 'hr' && (
                <span>👥 <strong>HR Manager</strong>: The one who manages all. You can assign work to any employee and oversee operations.</span>
              )}
              {currentUser.role === 'employee' && (
                <span>💼 <strong>Employee</strong>: The one who updates status. Click any task to respond and register work status!</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role === 'admin' && onOpenUserManagement && (
            <button
              type="button"
              onClick={onOpenUserManagement}
              className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors shadow-2xs"
              title="CEO Authority: Add more Admins"
            >
              👑 + Add New Admin
            </button>
          )}

          <div className="text-[11px] text-stone-500 font-medium flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
            <span>💡 Click any card to open response thread & update status</span>
          </div>
        </div>
      </div>

      {/* Top Filter & Count Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="relative w-full max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-600" />
          <input
            type="text"
            placeholder="Filter tasks or employee name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
        </div>

        <div className="text-xs text-stone-600 flex items-center gap-3">
          <span>{tasks.length} tasks</span>
          <span>•</span>
          <span className="text-emerald-700 font-semibold">
            {tasks.filter((t) => t.status === 'Done').length} Completed
          </span>
          <span>•</span>
          <span className="text-amber-700 font-medium">
            {tasks.filter((t) => t.status === 'In Progress').length} Active
          </span>
        </div>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((colStatus) => {
          const colTasks = filteredTasks.filter((t) => t.status === colStatus);
          const colConfig = COLUMN_COLORS[colStatus] || COLUMN_COLORS['Backlog'];

          return (
            <div
              key={colStatus}
              className="bg-stone-50/80 border border-stone-200/90 rounded-xl p-3 flex flex-col min-h-[360px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colConfig.badge}`}>
                    {colStatus}
                  </span>
                  <span className="text-xs text-stone-600 font-medium">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  type="button"
                  title="Add task in this column"
                  onClick={() => {
                    setAddingInColumn(colStatus);
                    setInlineTitle('');
                  }}
                  className="p-1 text-stone-600 hover:text-stone-800 hover:bg-stone-200/70 rounded transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="space-y-2 flex-1">
                {colTasks.map((task) => {
                  const currentColIdx = COLUMNS.indexOf(task.status);
                  const canMoveLeft = currentColIdx > 0;
                  const canMoveRight = currentColIdx < COLUMNS.length - 1;
                  const commentCount = (task.comments || []).length;

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskForDetail(task)}
                      className="group bg-white border border-stone-200 hover:border-stone-400 rounded-xl p-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer select-none"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                            PRIORITY_COLORS[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>

                        <div className="flex items-center gap-1">
                          {commentCount > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                              <MessageSquare className="w-2.5 h-2.5 text-stone-600" />
                              <span>{commentCount}</span>
                            </span>
                          )}

                          {currentUser.role !== 'employee' && (
                            <button
                              type="button"
                              title="Delete task (Admin/HR)"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(task.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-600 p-0.5 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-stone-900 leading-snug group-hover:text-stone-950">
                        {task.title}
                      </p>

                      {task.description && (
                        <p className="text-[11px] text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Card Footer: Assignee & Move Buttons */}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-100 text-[11px]">
                        <div
                          className="flex items-center gap-1.5 truncate pr-1"
                          title={`Assigned to: ${task.assignee.name}`}
                        >
                          <img
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                            referrerPolicy="no-referrer"
                            className="w-4 h-4 rounded-full object-cover shrink-0"
                          />
                          <span className="text-[10px] font-medium text-stone-700 truncate max-w-[85px]">
                            {task.assignee.name}
                          </span>
                        </div>

                        {/* Quick 1-click Status Selector & Move buttons */}
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={task.status}
                            onChange={(e) => moveTask(task.id, e.target.value as KanbanTask['status'])}
                            title="Register work status (Employee Mandate)"
                            className="text-[10px] bg-stone-100 hover:bg-stone-200/80 border border-stone-200 rounded px-1.5 py-0.5 text-stone-800 font-semibold focus:outline-none focus:ring-1 focus:ring-stone-400"
                          >
                            {COLUMNS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>

                          {canMoveLeft && (
                            <button
                              type="button"
                              onClick={() => moveTask(task.id, COLUMNS[currentColIdx - 1])}
                              title={`Move left to ${COLUMNS[currentColIdx - 1]}`}
                              className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {canMoveRight && (
                            <button
                              type="button"
                              onClick={() => moveTask(task.id, COLUMNS[currentColIdx + 1])}
                              title={`Move right to ${COLUMNS[currentColIdx + 1]}`}
                              className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty State */}
                {colTasks.length === 0 && addingInColumn !== colStatus && (
                  <div className="h-20 flex items-center justify-center text-[11px] text-stone-600 border border-dashed border-stone-200/80 rounded-lg">
                    No tasks
                  </div>
                )}
              </div>

              {/* Inline Task Adder */}
              <div className="mt-3 pt-2">
                {addingInColumn === colStatus ? (
                  <div className="bg-white border border-stone-300 rounded-xl p-2.5 shadow-xs">
                    <textarea
                      autoFocus
                      rows={2}
                      value={inlineTitle}
                      onChange={(e) => setInlineTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleInlineAdd(colStatus);
                        } else if (e.key === 'Escape') {
                          setAddingInColumn(null);
                        }
                      }}
                      placeholder="What needs to be done? (Enter to add)"
                      className="w-full text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none resize-none"
                    />
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-100">
                      <select
                        value={inlinePriority}
                        onChange={(e) => setInlinePriority(e.target.value as KanbanTask['priority'])}
                        className="text-[10px] bg-stone-50 border border-stone-200 rounded px-1.5 py-0.5 text-stone-700 font-medium"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setAddingInColumn(null)}
                          className="text-xs text-stone-500 hover:text-stone-700 px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInlineAdd(colStatus)}
                          className="text-xs bg-stone-900 text-white px-2.5 py-1 rounded font-medium hover:bg-stone-800"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAddingInColumn(colStatus);
                      setInlineTitle('');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors border border-dashed border-stone-300 hover:border-stone-400 font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add a task</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail & Response Modal */}
      {selectedTaskForDetail && (
        <TaskDetailModal
          task={selectedTaskForDetail}
          currentUser={currentUser}
          teamMembers={teamMembers}
          onClose={() => setSelectedTaskForDetail(null)}
          onUpdateTask={handleUpdateSingleTask}
        />
      )}
    </div>
  );
};
