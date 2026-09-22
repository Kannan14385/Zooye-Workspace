import { InboxNotification, EmailDispatchLog, WorkspaceUser, KanbanTask } from '../types';

const NOTIFICATIONS_STORAGE_KEY = 'notion_inbox_notifications_v2';
const EMAIL_LOGS_STORAGE_KEY = 'notion_email_logs_v2';

function getEmailApiUrl(): string {
  const configuredApiUrl = import.meta.env.VITE_API_URL as string | undefined;
  return `${(configuredApiUrl || '').replace(/\/$/, '')}/api/email/notify`;
}

export const INITIAL_NOTIFICATIONS: InboxNotification[] = [
  {
    id: 'notif-1',
    recipientId: 'u-3', // Alex Morgan
    recipientEmail: 'alex.emp@acmeoffice.internal',
    senderId: 'u-1',
    senderName: 'Elena Vance',
    senderRole: 'admin',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    type: 'task_assigned',
    title: 'Work Assigned by Superior: OAuth2 & SSO Gateway',
    message: 'CEO Elena Vance assigned you to lead the OAuth2 & SSO Gateway integration. Please review security specs.',
    taskId: 't-1',
    taskTitle: 'Implement OAuth2 & SSO Gateway',
    dueDate: '2026-10-15',
    priority: 'Urgent',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    emailSent: true,
    emailSubject: '[Work Assigned] Implement OAuth2 & SSO Gateway (Priority: URGENT)',
    emailBody: `Dear Alex Morgan,\n\nCEO Elena Vance has assigned you to lead "Implement OAuth2 & SSO Gateway".\nPriority: URGENT\nDue Date: Oct 15, 2026\n\nPlease ensure SAML 2.0 compliance and test against production staging.\n\nElena Vance\nChief Executive Officer\nZooye Info Technologies Workspace`,
  },
  {
    id: 'notif-2',
    recipientId: 'u-3', // Alex Morgan
    recipientEmail: 'alex.emp@acmeoffice.internal',
    senderId: 'u-2',
    senderName: 'David Kim',
    senderRole: 'hr',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    type: 'deadline_approaching',
    title: 'Upcoming Deadline Warning: Q3 API Hardening',
    message: 'Task milestone deadline is in 48 hours. Please update task status to In Review before the end of this sprint.',
    taskId: 't-4',
    taskTitle: 'Database Connection Pool Tuning',
    dueDate: 'In 2 days',
    priority: 'High',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    emailSent: true,
    emailSubject: '[Deadline Intimation] Q3 API Hardening & DB Pool Tuning',
    emailBody: `Hi Alex,\n\nThis is a friendly reminder that the target window for Database Connection Pool Tuning closes in 48 hours.\n\nDavid Kim\nHead of People & HR`,
  },
  {
    id: 'notif-3',
    recipientId: 'u-4', // Sarah Chen
    recipientEmail: 'sarah.emp@acmeoffice.internal',
    senderId: 'u-1',
    senderName: 'Elena Vance',
    senderRole: 'admin',
    senderAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    type: 'task_assigned',
    title: 'Work Assigned by Superior: Brand Design System Revamp',
    message: 'CEO Elena Vance assigned you to finalize the Dark Mode Design Tokens and export to Figma.',
    taskId: 't-2',
    taskTitle: 'Design System & Dark Mode Tokens',
    dueDate: '2026-10-18',
    priority: 'High',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    emailSent: true,
    emailSubject: '[Work Assigned] Design System & Dark Mode Tokens',
    emailBody: `Dear Sarah Chen,\n\nPlease lead the visual alignment for our Dark Mode Design Tokens.\n\nElena Vance\nCEO`,
  },
  {
    id: 'notif-4',
    recipientId: 'u-1', // Elena Vance
    recipientEmail: 'elena.ceo@acmeoffice.internal',
    senderId: 'u-2',
    senderName: 'David Kim',
    senderRole: 'hr',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    type: 'status_update',
    title: 'Sprint Review Submitted: Team Velocity Report',
    message: 'David Kim compiled the team performance review and submitted it for executive approval.',
    dueDate: 'Today',
    priority: 'Normal',
    isRead: true,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    emailSent: true,
    emailSubject: '[Report Ready] Executive Team Velocity Q3',
    emailBody: `Elena,\n\nAll employee task logs and reviews are assembled in the Notion Executive Dashboard.\n\nDavid`,
  },
];

export const INITIAL_EMAIL_LOGS: EmailDispatchLog[] = [
  {
    id: 'elog-1',
    toEmail: 'alex.emp@acmeoffice.internal',
    toName: 'Alex Morgan',
    fromName: 'Elena Vance',
    fromRole: 'admin',
    subject: '[Work Assigned] Implement OAuth2 & SSO Gateway (Priority: URGENT)',
    body: `Dear Alex Morgan,\n\nCEO Elena Vance has assigned you to lead "Implement OAuth2 & SSO Gateway".\nPriority: URGENT\nDue Date: Oct 15, 2026\n\nPlease ensure SAML 2.0 compliance and test against production staging.\n\nElena Vance\nChief Executive Officer\nZooye Info Technologies Workspace`,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    taskId: 't-1',
    taskTitle: 'Implement OAuth2 & SSO Gateway',
    priority: 'Urgent',
    dueDate: '2026-10-15',
    status: 'delivered',
  },
  {
    id: 'elog-2',
    toEmail: 'sarah.emp@acmeoffice.internal',
    toName: 'Sarah Chen',
    fromName: 'Elena Vance',
    fromRole: 'admin',
    subject: '[Work Assigned] Design System & Dark Mode Tokens',
    body: `Dear Sarah Chen,\n\nPlease lead the visual alignment for our Dark Mode Design Tokens.\n\nElena Vance\nCEO`,
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    taskId: 't-2',
    taskTitle: 'Design System & Dark Mode Tokens',
    priority: 'High',
    dueDate: '2026-10-18',
    status: 'delivered',
  },
];

export function getStoredNotifications(): InboxNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export const loadNotifications = getStoredNotifications;

export function saveStoredNotifications(notifs: InboxNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
    window.dispatchEvent(new CustomEvent('workspace:notifications_updated', { detail: notifs }));
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}

export function markNotificationAsRead(id: string): void {
  const list = getStoredNotifications();
  const updated = list.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  saveStoredNotifications(updated);
}

export function markAllNotificationsAsRead(recipientId?: string, recipientEmail?: string): void {
  const list = getStoredNotifications();
  const updated = list.map((n) => {
    if (!recipientId && !recipientEmail) return { ...n, isRead: true };
    if (n.recipientId === recipientId || n.recipientEmail === recipientEmail) {
      return { ...n, isRead: true };
    }
    return n;
  });
  saveStoredNotifications(updated);
}

export function deleteNotification(id: string): void {
  const list = getStoredNotifications();
  const updated = list.filter((n) => n.id !== id);
  saveStoredNotifications(updated);
}

export function getStoredEmailLogs(): EmailDispatchLog[] {
  try {
    const raw = localStorage.getItem(EMAIL_LOGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EMAIL_LOGS_STORAGE_KEY, JSON.stringify(INITIAL_EMAIL_LOGS));
      return INITIAL_EMAIL_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_EMAIL_LOGS;
  }
}

export const loadEmailLogs = getStoredEmailLogs;

export function saveStoredEmailLogs(logs: EmailDispatchLog[]): void {
  try {
    localStorage.setItem(EMAIL_LOGS_STORAGE_KEY, JSON.stringify(logs));
    window.dispatchEvent(new CustomEvent('workspace:email_logs_updated', { detail: logs }));
  } catch (err) {
    console.error('Failed to save email logs:', err);
  }
}

/**
 * Dispatches real-time email and inbox notification when work is assigned by a superior
 */
export async function dispatchWorkAssignmentEmail(
  superior: WorkspaceUser,
  assignee: WorkspaceUser,
  task: {
    id: string;
    title: string;
    priority?: string;
    dueDate?: string;
    description?: string;
    status?: string;
  }
): Promise<{ notification: InboxNotification; emailLog: EmailDispatchLog }> {
  const superiorRoleLabel =
    superior.role === 'admin'
      ? 'Chief Executive Officer (CEO)'
      : superior.role === 'hr'
      ? 'Head of People & HR'
      : 'Superior';

  const subject = `[Work Assigned] ${superior.name} assigned you: "${task.title}" (${task.priority || 'Normal'} Priority)`;

  const emailBody = `Dear ${assignee.name},

Your superior ${superior.name} (${superiorRoleLabel}) has assigned you a new work deliverable in the Zooye Info Technologies workspace.

📋 Task Deliverable: "${task.title}"
⭐ Priority: ${(task.priority || 'Normal').toUpperCase()}
⏰ Target Due Date: ${task.dueDate || 'Current Sprint Cadence'}
📊 Current State: ${task.status || 'To Do'}
👤 Assigned By: ${superior.name} <${superior.email}>

${task.description ? `Requirements / Notes:\n"${task.description}"\n\n` : ''}Please check your Sprint Kanban board or open your personalized My Dashboard to review specifications and update progress.

Zooye Info Technologies WordPress Delivery Workspace
Access Link: /workspace/task/${task.id}`;

  // 1. Send to server backend
  let emailDelivered = false;
  try {
    const response = await fetch(getEmailApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toEmail: assignee.email,
        toName: assignee.name,
        fromName: superior.name,
        fromRole: superior.role,
        taskTitle: task.title,
        priority: task.priority || 'Normal',
        dueDate: task.dueDate || 'Upcoming',
        subject,
        body: emailBody,
      }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || `Email API returned HTTP ${response.status}`);
    }
    emailDelivered = true;
  } catch (e) {
    console.warn('Server email dispatch failed:', e);
  }

  // 2. Create notification record
  const notification: InboxNotification = {
    id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    recipientId: assignee.id,
    recipientEmail: assignee.email,
    senderId: superior.id,
    senderName: superior.name,
    senderRole: superior.role,
    senderAvatar: superior.avatar,
    type: 'task_assigned',
    title: `Work Assigned by Superior: ${task.title}`,
    message: `${superior.name} (${superiorRoleLabel}) assigned you "${task.title}". Priority: ${task.priority || 'Normal'}. Target: ${task.dueDate || 'Current Sprint'}.`,
    taskId: task.id,
    taskTitle: task.title,
    dueDate: task.dueDate,
    priority: task.priority,
    isRead: false,
    createdAt: new Date().toISOString(),
    emailSent: emailDelivered,
    emailSubject: subject,
    emailBody,
  };

  // 3. Create email log record
  const emailLog: EmailDispatchLog = {
    id: 'elog-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    toEmail: assignee.email,
    toName: assignee.name,
    fromName: superior.name,
    fromRole: superior.role,
    subject,
    body: emailBody,
    timestamp: new Date().toISOString(),
    taskId: task.id,
    taskTitle: task.title,
    priority: task.priority || 'Normal',
    dueDate: task.dueDate,
    status: emailDelivered ? 'delivered' : 'simulated_live',
  };

  // 4. Update localStorage
  const currentNotifs = getStoredNotifications();
  saveStoredNotifications([notification, ...currentNotifs]);

  const currentLogs = getStoredEmailLogs();
  saveStoredEmailLogs([emailLog, ...currentLogs]);

  // 5. Fire global real-time event for toasts
  window.dispatchEvent(
    new CustomEvent('workspace:email_dispatched', {
      detail: {
        recipient: assignee,
        sender: superior,
        task,
        emailLog,
        notification,
      },
    })
  );

  return { notification, emailLog };
}

export async function dispatchTaskStatusUpdate(
  employee: WorkspaceUser,
  recipients: WorkspaceUser[],
  task: {
    id: string;
    title: string;
    status: string;
    note?: string;
  }
): Promise<void> {
  const supervisors = recipients.filter((recipient) => recipient.role === 'admin');
  const message = `${employee.name} updated "${task.title}" to ${task.status}.${task.note ? ` Note: ${task.note}` : ''}`;

  await Promise.all(supervisors.map(async (recipient) => {
    const notification: InboxNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      recipientId: recipient.id,
      recipientEmail: recipient.email,
      senderId: employee.id,
      senderName: employee.name,
      senderRole: employee.role,
      senderAvatar: employee.avatar,
      type: 'status_update',
      title: `Work update from ${employee.name}`,
      message,
      taskId: task.id,
      taskTitle: task.title,
      priority: 'Normal',
      isRead: false,
      createdAt: new Date().toISOString(),
      emailSent: false,
      emailSubject: `[Work Update] ${employee.name} updated ${task.title}`,
      emailBody: `Hello ${recipient.name},\n\n${message}\n\nZooye Info Technologies Workspace`,
    };

    let emailDelivered = false;
    try {
      const response = await fetch(getEmailApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: recipient.email,
          toName: recipient.name,
          fromName: employee.name,
          fromRole: employee.role,
          taskTitle: task.title,
          subject: `[Work Update] ${employee.name} updated ${task.title}`,
          body: `Hello ${recipient.name},\n\n${message}\n\nZooye Info Technologies Workspace`,
        }),
      });
      emailDelivered = response.ok;
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        console.warn('Server status email dispatch failed:', result.error || response.statusText);
      }
    } catch (error) {
      console.warn('Server status email dispatch failed:', error);
    }

    notification.emailSent = emailDelivered;

    const emailLog: EmailDispatchLog = {
      id: `elog-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      toEmail: recipient.email,
      toName: recipient.name,
      fromName: employee.name,
      fromRole: employee.role,
      subject: notification.emailSubject || notification.title,
      body: notification.emailBody || message,
      timestamp: notification.createdAt,
      taskId: task.id,
      taskTitle: task.title,
      status: emailDelivered ? 'delivered' : 'simulated_live',
    };

    saveStoredNotifications([notification, ...getStoredNotifications()]);
    saveStoredEmailLogs([emailLog, ...getStoredEmailLogs()]);
    window.dispatchEvent(
      new CustomEvent('workspace:email_dispatched', {
        detail: {
          recipient,
          sender: employee,
          task,
          emailLog,
          notification,
        },
      })
    );
  }));
}
