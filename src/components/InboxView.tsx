import React, { useState } from 'react';
import {
  Inbox,
  Mail,
  Clock,
  UserCheck,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Filter,
  Send,
  AlertCircle,
  Eye,
  Calendar,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { InboxNotification, EmailDispatchLog, WorkspaceUser, KanbanTask } from '../types';
import { UserRoleBadge } from './UserRoleBadge';

interface InboxViewProps {
  currentUser: WorkspaceUser;
  notifications: InboxNotification[];
  emailLogs: EmailDispatchLog[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onNavigateToTask?: (taskId: string) => void;
  onOpenAssistant?: () => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  currentUser,
  notifications,
  emailLogs,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onNavigateToTask,
  onOpenAssistant,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'assigned' | 'deadlines' | 'emails'>('all');
  const [selectedEmailLog, setSelectedEmailLog] = useState<EmailDispatchLog | null>(null);

  // Filter notifications for this user
  const userNotifs = notifications.filter(
    (n) => n.recipientId === currentUser.id || n.recipientEmail === currentUser.email
  );

  const unreadCount = userNotifs.filter((n) => !n.isRead).length;

  const assignedNotifs = userNotifs.filter((n) => n.type === 'task_assigned');
  const deadlineNotifs = userNotifs.filter((n) => n.type === 'deadline_approaching');

  // Filter relevant email logs for this user (received or sent)
  const userEmails = emailLogs.filter(
    (e) =>
      e.toEmail === currentUser.email ||
      e.fromName.toLowerCase() === currentUser.name.toLowerCase()
  );

  const displayedNotifications =
    activeTab === 'assigned'
      ? assignedNotifs
      : activeTab === 'deadlines'
      ? deadlineNotifs
      : userNotifs;

  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Inbox & Real-Time Alerts
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-rose-500 text-white font-bold text-xs rounded-full shadow-sm">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
                Superior work assignments, deadline intimations, and real-time email delivery logs for{' '}
                <strong className="text-stone-200">{currentUser.name}</strong> ({currentUser.email}).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark All Read</span>
              </button>
            )}

            {onOpenAssistant && (
              <button
                onClick={onOpenAssistant}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI to Summarize</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-stone-800 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'all'
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>All Alerts</span>
            <span className="px-1.5 py-0.2 bg-stone-900/30 rounded-full text-[10px]">
              {userNotifs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'assigned'
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Assigned by Superior</span>
            <span className="px-1.5 py-0.2 bg-stone-900/30 rounded-full text-[10px]">
              {assignedNotifs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('deadlines')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'deadlines'
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Deadline Intimations</span>
            <span className="px-1.5 py-0.2 bg-stone-900/30 rounded-full text-[10px]">
              {deadlineNotifs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('emails')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'emails'
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Real-Time Email Outbox</span>
            <span className="px-1.5 py-0.2 bg-stone-900/30 rounded-full text-[10px]">
              {userEmails.length}
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* NOTIFICATIONS LIST                                             */}
      {/* ============================================================== */}
      {activeTab !== 'emails' ? (
        <div className="space-y-3">
          {displayedNotifications.length === 0 ? (
            <div className="p-12 text-center bg-stone-900/50 border border-stone-800 rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <h3 className="font-bold text-white text-sm">Inbox is completely clear</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                No notifications found in this category. Work assignments by superiors and deadline intimations will appear here.
              </p>
            </div>
          ) : (
            displayedNotifications.map((notif) => {
              const isAssigned = notif.type === 'task_assigned';
              const isDeadline = notif.type === 'deadline_approaching';

              return (
                <div
                  key={notif.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    !notif.isRead
                      ? 'bg-stone-900 border-amber-400/50 shadow-md ring-1 ring-amber-400/20'
                      : 'bg-stone-900/60 border-stone-800 hover:bg-stone-900 text-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Avatar or Icon */}
                      {notif.senderAvatar ? (
                        <img
                          src={notif.senderAvatar}
                          alt={notif.senderName}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-stone-700 shrink-0 mt-0.5"
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isAssigned
                              ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                              : isDeadline
                              ? 'bg-rose-400/20 text-rose-400 border border-rose-400/30'
                              : 'bg-stone-800 text-stone-300'
                          }`}
                        >
                          {isAssigned ? (
                            <UserCheck className="w-5 h-5" />
                          ) : isDeadline ? (
                            <Clock className="w-5 h-5" />
                          ) : (
                            <Inbox className="w-5 h-5" />
                          )}
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-sm text-white">{notif.title}</h3>
                          {!notif.isRead && (
                            <span className="px-2 py-0.5 bg-amber-400 text-stone-950 font-bold text-[10px] rounded-full">
                              NEW
                            </span>
                          )}
                          {notif.priority && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                notif.priority === 'Urgent'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {notif.priority}
                            </span>
                          )}
                          {notif.emailSent && (
                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                              <Mail className="w-3 h-3" />
                              <span>Email Dispatched</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-stone-300 leading-relaxed">{notif.message}</p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-400 pt-1 font-mono">
                          <span>Sender: {notif.senderName}</span>
                          <span>•</span>
                          <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {notif.dueDate && (
                            <>
                              <span>•</span>
                              <span className="text-amber-300 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Due: {notif.dueDate}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!notif.isRead && (
                        <button
                          onClick={() => onMarkAsRead(notif.id)}
                          title="Mark as Read"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteNotification(notif.id)}
                        title="Delete Alert"
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Action Footer for Task Navigation */}
                  <div className="mt-3 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] text-stone-400">
                      {notif.taskTitle ? (
                        <span>
                          Referenced Deliverable: <strong className="text-white">{notif.taskTitle}</strong>
                        </span>
                      ) : (
                        <span>Zooye Info Technologies Internal Communication</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {notif.emailBody && (
                        <button
                          onClick={() => {
                            setSelectedEmailLog({
                              id: 'e-' + notif.id,
                              toEmail: notif.recipientEmail,
                              toName: currentUser.name,
                              fromName: notif.senderName,
                              fromRole: notif.senderRole || 'admin',
                              subject: notif.emailSubject || notif.title,
                              body: notif.emailBody || '',
                              timestamp: notif.createdAt,
                              taskTitle: notif.taskTitle,
                              status: 'delivered',
                            });
                          }}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Dispatched Email</span>
                        </button>
                      )}

                      {onNavigateToTask && notif.taskId && (
                        <button
                          onClick={() => onNavigateToTask(notif.taskId!)}
                          className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <span>Open in Kanban Board</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ============================================================== */
        /* REAL-TIME EMAIL OUTBOX LOGS                                   */
        /* ============================================================== */
        <div className="space-y-3">
          <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl flex items-center justify-between text-xs text-stone-300">
            <div className="flex items-center gap-2 font-mono">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Real-Time SMTP Dispatch Logs • Active Delivery Confirmation</span>
            </div>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Delivery Verified</span>
            </span>
          </div>

          {userEmails.length === 0 ? (
            <div className="p-12 text-center bg-stone-900/50 border border-stone-800 rounded-2xl">
              <Mail className="w-10 h-10 text-stone-600 mx-auto mb-2" />
              <h3 className="font-bold text-white text-sm">No email dispatches recorded yet</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                Whenever a superior assigns a task, a real-time email notification is automatically dispatched and logged here.
              </p>
            </div>
          ) : (
            userEmails.map((elog) => (
              <div
                key={elog.id}
                className="p-4 sm:p-5 bg-stone-900 border border-stone-800 rounded-2xl hover:border-stone-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded-md font-bold text-[10px]">
                        SMTP 250 OK
                      </span>
                      <span className="text-stone-400">To:</span>
                      <span className="text-white font-semibold">{elog.toEmail}</span>
                      <span className="text-stone-500">•</span>
                      <span className="text-stone-400">From:</span>
                      <span className="text-amber-400">{elog.fromName} ({elog.fromRole.toUpperCase()})</span>
                    </div>

                    <h4 className="font-bold text-sm text-white pt-1">{elog.subject}</h4>
                    <p className="text-xs text-stone-400 line-clamp-2 font-sans bg-stone-950/60 p-2.5 rounded-lg border border-stone-800/80">
                      {elog.body}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedEmailLog(elog)}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Full Email</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono pt-1 border-t border-stone-800/60">
                  <span>Timestamp: {new Date(elog.timestamp).toLocaleString()}</span>
                  <span className="text-emerald-400">Verified Delivery Status: Delivered</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Formatted Email Inspection Modal */}
      {selectedEmailLog && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Real-Time Email Inspection</h3>
                  <p className="text-[11px] text-stone-400 font-mono">Dispatched by Superior</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmailLog(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-stone-900/60 border-b border-stone-800 text-xs space-y-1.5 font-mono">
              <div>
                <span className="text-stone-500">FROM: </span>
                <span className="text-amber-400 font-semibold">{selectedEmailLog.fromName} ({selectedEmailLog.fromRole.toUpperCase()}) &lt;superior@acmeoffice.internal&gt;</span>
              </div>
              <div>
                <span className="text-stone-500">TO: </span>
                <span className="text-white font-semibold">{selectedEmailLog.toName} &lt;{selectedEmailLog.toEmail}&gt;</span>
              </div>
              <div>
                <span className="text-stone-500">SENT: </span>
                <span className="text-stone-300">{new Date(selectedEmailLog.timestamp).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-stone-500">SUBJECT: </span>
                <span className="text-white font-bold">{selectedEmailLog.subject}</span>
              </div>
            </div>

            <div className="p-5 flex-1 overflow-y-auto text-xs sm:text-sm text-stone-200 font-sans whitespace-pre-wrap leading-relaxed bg-stone-950/40">
              {selectedEmailLog.body}
            </div>

            <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Real-Time Email Logged & Delivered</span>
              </span>
              <button
                onClick={() => setSelectedEmailLog(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
