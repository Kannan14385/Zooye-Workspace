import React, { useState } from 'react';
import {
  X,
  Calendar,
  Tag,
  MessageSquare,
  Send,
  UserCheck,
  CheckCircle2,
  Clock,
  Shield,
  ArrowRight,
  Mail,
  Sparkles,
} from 'lucide-react';
import { KanbanTask, WorkspaceUser, UserRole, TaskComment } from '../types';
import { UserRoleBadge } from './UserRoleBadge';
import { dispatchWorkAssignmentEmail } from '../utils/notificationService';

interface TaskDetailModalProps {
  task: KanbanTask;
  currentUser: WorkspaceUser;
  teamMembers: WorkspaceUser[];
  onClose: () => void;
  onUpdateTask: (updatedTask: KanbanTask) => void;
}

const STATUS_OPTIONS: Array<KanbanTask['status']> = [
  'Backlog',
  'To Do',
  'In Progress',
  'In Review',
  'Done',
];

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  currentUser,
  teamMembers,
  onClose,
  onUpdateTask,
}) => {
  const [newComment, setNewComment] = useState('');
  const [selectedStatusChange, setSelectedStatusChange] = useState<KanbanTask['status']>(task.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canReassign = currentUser.role === 'admin' || currentUser.role === 'hr';

  const handleStatusSelect = (newStatus: KanbanTask['status']) => {
    if (newStatus === task.status) return;

    // Create automatic status change entry in comments
    const statusEntry: TaskComment = {
      id: 'c-' + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      content: `Registered status update: ${task.status} → ${newStatus}`,
      timestamp: 'Just now',
      statusChange: newStatus,
    };

    onUpdateTask({
      ...task,
      status: newStatus,
      comments: [...(task.comments || []), statusEntry],
    });
    setSelectedStatusChange(newStatus);
  };

  const handlePostResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    const isStatusChanged = selectedStatusChange !== task.status;

    const commentEntry: TaskComment = {
      id: 'c-' + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      content: newComment.trim(),
      timestamp: 'Just now',
      statusChange: isStatusChanged ? selectedStatusChange : undefined,
    };

    onUpdateTask({
      ...task,
      status: selectedStatusChange,
      comments: [...(task.comments || []), commentEntry],
    });

    setNewComment('');
    setIsSubmitting(false);
  };

  const [emailStatusMsg, setEmailStatusMsg] = useState<string | null>(null);

  const handleAssigneeChange = (userId: string) => {
    const member = teamMembers.find((m) => m.id === userId);
    if (!member) return;

    const reassignmentComment: TaskComment = {
      id: 'c-' + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      content: `Reassigned work to ${member.name} (${member.title}) and dispatched real-time email notification.`,
      timestamp: 'Just now',
    };

    onUpdateTask({
      ...task,
      assignee: {
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        email: member.email,
        role: member.role,
      },
      comments: [...(task.comments || []), reassignmentComment],
    });

    // Real-time email notification when assigned by superior
    if (currentUser.role === 'admin' || currentUser.role === 'hr') {
      dispatchWorkAssignmentEmail(currentUser, member, {
        id: task.id,
        title: task.title,
        priority: task.priority,
        dueDate: task.dueDate,
        status: task.status,
        description: task.description,
      });
      setEmailStatusMsg(`Dispatched real-time email to ${member.email}`);
      setTimeout(() => setEmailStatusMsg(null), 4000);
    }
  };

  const handleManualEmailNotification = () => {
    const member = teamMembers.find((m) => m.id === task.assignee.id) || {
      id: task.assignee.id || 'u-emp',
      name: task.assignee.name,
      email: task.assignee.email,
      role: 'employee' as const,
      avatar: task.assignee.avatar,
      title: 'Assignee',
      department: 'General',
    };

    dispatchWorkAssignmentEmail(currentUser, member, {
      id: task.id,
      title: task.title,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status,
      description: task.description,
    });

    setEmailStatusMsg(`Dispatched real-time email notice to ${task.assignee.email}`);
    setTimeout(() => setEmailStatusMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white border border-stone-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Task Work Detail
            </span>
            <span className="text-stone-300">•</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                task.status === 'Done'
                  ? 'bg-emerald-100 text-emerald-800'
                  : task.status === 'In Progress'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-stone-200 text-stone-800'
              }`}
            >
              {task.status}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Title & Description */}
          <div>
            <h2 className="text-xl font-bold text-stone-900 leading-snug">
              {task.title}
            </h2>
            {task.description && (
              <p className="text-sm text-stone-600 mt-2 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200/60">
                {task.description}
              </p>
            )}
          </div>

          {/* Quick Properties Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50/90 border border-stone-200/80 text-xs">
            {/* Assignee Box */}
            <div>
              <div className="text-stone-500 font-medium mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-stone-600" />
                <span>Assigned Employee</span>
              </div>
              {canReassign ? (
                <div className="space-y-1">
                  <select
                    value={task.assignee.id || ''}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 font-medium focus:ring-1 focus:ring-stone-400"
                  >
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} — {member.title} ({member.role.toUpperCase()})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-blue-600">
                    As {currentUser.role.toUpperCase()}, you can assign this task to any team member.
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleManualEmailNotification}
                      className="text-[11px] text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2.5 py-1 rounded-md transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-700" />
                      <span>Dispatch Real-Time Email Notice</span>
                    </button>
                    {emailStatusMsg && (
                      <span className="text-[10px] text-emerald-700 font-bold">
                        ✓ {emailStatusMsg}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-1.5 bg-white border border-stone-200 rounded-lg">
                  <img
                    src={task.assignee.avatar}
                    alt={task.assignee.name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-stone-900 leading-tight">
                      {task.assignee.name}
                    </div>
                    <div className="text-[10px] text-stone-500 leading-tight">
                      {task.assignee.email}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Due Date & Priority */}
            <div>
              <div className="text-stone-500 font-medium mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-600" />
                <span>Delivery Timeline & Priority</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-white border border-stone-200 rounded-lg">
                <div className="flex-1">
                  <div className="text-[10px] text-stone-500">Deadline</div>
                  <div className="font-semibold text-stone-800">{task.dueDate || 'Flexible'}</div>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  {task.priority} Priority
                </span>
              </div>
            </div>
          </div>

          {/* REGISTER WORK STATUS SECTION (Employee Core Mandate) */}
          <div className="p-4 rounded-xl border-2 border-stone-200 bg-stone-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Register Work Status
                </span>
              </div>
              <span className="text-[11px] text-stone-500">
                1-Click Status Update
              </span>
            </div>
            <p className="text-xs text-stone-600 mb-3">
              The employee assigned to this task can register its current stage at any time:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {STATUS_OPTIONS.map((status) => {
                const isCurrent = task.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusSelect(status)}
                    className={`py-2 px-2 text-xs rounded-lg font-medium transition-all text-center border ${
                      isCurrent
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                    }`}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* EMPLOYEE RESPONSE & WORK LOG THREAD */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-stone-700" />
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Work Responses & Updates Thread ({(task.comments || []).length})
              </h3>
            </div>

            {/* Comments List */}
            <div className="space-y-3 mb-4">
              {(!task.comments || task.comments.length === 0) && (
                <div className="p-4 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                  No responses recorded yet. The employee can submit the first update below.
                </div>
              )}

              {(task.comments || []).map((comment) => (
                <div
                  key={comment.id}
                  className="p-3.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                        referrerPolicy="no-referrer"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-stone-800">
                        {comment.authorName}
                      </span>
                      <UserRoleBadge role={comment.authorRole} size="sm" />
                    </div>
                    <span className="text-[10px] text-stone-400">
                      {comment.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 leading-relaxed pl-7">
                    {comment.content}
                  </p>

                  {comment.statusChange && (
                    <div className="ml-7 pt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                      <ArrowRight className="w-3 h-3" />
                      <span>Updated status to: {comment.statusChange}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Response Submission Form */}
            <form
              onSubmit={handlePostResponse}
              className="p-3 bg-stone-100/70 border border-stone-200 rounded-xl space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span>Respond as {currentUser.name}</span>
                  <UserRoleBadge role={currentUser.role} size="sm" />
                </span>
                <span className="text-[11px] text-stone-500">
                  Employee response box
                </span>
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                placeholder="Write your work status update, blockers, or deliverables link..."
                className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <span>Register status as:</span>
                  <select
                    value={selectedStatusChange}
                    onChange={(e) => setSelectedStatusChange(e.target.value as KanbanTask['status'])}
                    className="text-xs bg-white border border-stone-200 rounded-md px-2 py-1 text-stone-800 font-medium"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
                >
                  <Send className="w-3 h-3" />
                  <span>Post Response & Update Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
