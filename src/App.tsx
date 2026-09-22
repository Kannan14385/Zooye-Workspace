import React, { useEffect, useMemo, useState } from 'react';
import { Bot, Inbox, LogOut, LayoutDashboard, Menu, Moon, Sun } from 'lucide-react';
import { AdminOperationsPanel, CredentialRequest } from './components/AdminOperationsPanel';
import { AccountPreferences } from './components/AccountPreferences';
import { GeminiAssistantModal } from './components/GeminiAssistantModal';
import { InboxView } from './components/InboxView';
import { RealtimeEmailToast } from './components/RealtimeEmailToast';
import { UniversalLoginPage } from './components/UniversalLoginPage';
import { UserDashboard } from './components/UserDashboard';
import { WorkspaceOffcanvas } from './components/WorkspaceOffcanvas';
import { INITIAL_PAGES, TEAM_MEMBERS } from './data/initialData';
import {
  EmailDispatchLog,
  InboxNotification,
  KanbanTask,
  Page,
  TaskActivityLog,
  WorkspaceUser,
} from './types';
import {
  dispatchWorkAssignmentEmail,
  dispatchTaskStatusUpdate,
  getStoredEmailLogs,
  getStoredNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  deleteNotification,
} from './utils/notificationService';

const STORAGE_KEYS = {
  teamMembers: 'zooye_team_members',
  currentUser: 'zooye_current_user',
  pages: 'zooye_pages',
  credentialRequests: 'zooye_credential_requests',
  theme: 'zooye_theme',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [teamMembers, setTeamMembers] = useState<WorkspaceUser[]>(() =>
    readStorage<WorkspaceUser[]>(STORAGE_KEYS.teamMembers, TEAM_MEMBERS)
  );

  const [currentUser, setCurrentUser] = useState<WorkspaceUser | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => readStorage<'light' | 'dark'>(STORAGE_KEYS.theme, 'light'));

  const [pages, setPages] = useState<Page[]>(() =>
    readStorage<Page[]>(STORAGE_KEYS.pages, INITIAL_PAGES)
  );

  const [activityLogs, setActivityLogs] = useState<TaskActivityLog[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'inbox'>('dashboard');
  const [notifications, setNotifications] = useState<InboxNotification[]>(() => getStoredNotifications());
  const [emailLogs, setEmailLogs] = useState<EmailDispatchLog[]>(() => getStoredEmailLogs());
  const [isAssistantOpen, setAssistantOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isOperationsOpen, setOperationsOpen] = useState(false);
  const [credentialRequests, setCredentialRequests] = useState<CredentialRequest[]>(() =>
    readStorage<CredentialRequest[]>(STORAGE_KEYS.credentialRequests, [])
  );

  const allTasks = useMemo(
    () => pages.flatMap((page) => page.kanbanTasks || []),
    [pages]
  );

  const unreadNotificationsCount = useMemo(
    () => notifications.filter(
      (notification) =>
        !notification.isRead &&
        (notification.recipientId === currentUser?.id || notification.recipientEmail === currentUser?.email)
    ).length,
    [currentUser, notifications]
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.teamMembers, JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(currentUser));
      return;
    }

    localStorage.removeItem(STORAGE_KEYS.currentUser);
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.pages, JSON.stringify(pages));
  }, [pages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.credentialRequests, JSON.stringify(credentialRequests));
  }, [credentialRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    const refreshNotifications = () => {
      setNotifications(getStoredNotifications());
      setEmailLogs(getStoredEmailLogs());
    };

    window.addEventListener('workspace:notifications_updated', refreshNotifications);
    window.addEventListener('workspace:email_logs_updated', refreshNotifications);
    return () => {
      window.removeEventListener('workspace:notifications_updated', refreshNotifications);
      window.removeEventListener('workspace:email_logs_updated', refreshNotifications);
    };
  }, []);

  const handleLoginSuccess = (user: WorkspaceUser) => {
    setCurrentUser(user);
  };

  const handleRegisterUser = (newUser: WorkspaceUser) => {
    setCredentialRequests((previous) => [...previous, {
      id: `request-${Date.now()}`,
      userId: newUser.id,
      userName: newUser.name,
      userEmail: newUser.email,
      createdAt: new Date().toISOString(),
      status: 'pending',
      requestType: 'onboarding',
      requestedUser: newUser,
    }]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('dashboard');
  };

  const handleSaveAccountPreferences = (update: Partial<WorkspaceUser>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...update };
    setCurrentUser(updatedUser);
    setTeamMembers((previous) => previous.map((member) => member.id === currentUser.id ? { ...member, ...update } : member));
  };

  const handleCreateProject = (title: string, details?: { description?: string; clientName?: string; websiteUrl?: string; targetDate?: string }) => {
    if (currentUser?.role === 'employee') return;
    const newProject: Page = {
      id: `page-${Date.now()}`,
      title: `📁 ${title}`,
      icon: '📁',
      type: 'kanban',
      blocks: [],
      kanbanTasks: [],
      projectDescription: details?.description,
      clientName: details?.clientName,
      websiteUrl: details?.websiteUrl,
      targetDate: details?.targetDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPages((previous) => [newProject, ...previous]);
  };

  const handleUpdateProject = (pageId: string, title: string) => {
    if (currentUser?.role === 'employee') return;
    setPages((previous) => previous.map((page) => page.id === pageId ? { ...page, title, updatedAt: new Date().toISOString() } : page));
  };

  const handleDeleteProject = (pageId: string) => {
    if (currentUser?.role === 'employee') return;
    setPages((previous) => previous.filter((page) => page.id !== pageId));
  };

  const handleCreateTask = (pageId: string, task: KanbanTask) => {
    if (currentUser?.role === 'employee') return;
    setPages((previous) => previous.map((page) => page.id === pageId ? { ...page, kanbanTasks: [...(page.kanbanTasks || []), task], updatedAt: new Date().toISOString() } : page));
  };

  const handleDeleteTask = (taskId: string) => {
    if (currentUser?.role === 'employee') return;
    setPages((previous) => previous.map((page) => page.kanbanTasks ? { ...page, kanbanTasks: page.kanbanTasks.filter((task) => task.id !== taskId) } : page));
  };

  const handleCreateUser = (user: WorkspaceUser) => {
    if (!currentUser || currentUser.role === 'employee' || (user.role === 'admin' && currentUser.role !== 'admin')) return;
    setTeamMembers((previous) => [...previous, user]);
  };

  const handleUpdateUser = (userId: string, update: Partial<WorkspaceUser>) => {
    if (currentUser?.role !== 'admin') return;
    setTeamMembers((previous) => previous.map((member) => member.id === userId ? { ...member, ...update } : member));
  };

  const handleDeleteUser = (userId: string) => {
    if (currentUser?.role !== 'admin' || userId === currentUser.id) return;
    setTeamMembers((previous) => previous.filter((member) => member.id !== userId));
  };

  const handleResolveCredentialRequest = (requestId: string, approve: boolean) => {
    if (currentUser?.role !== 'admin') return;
    const request = credentialRequests.find((item) => item.id === requestId);
    if (!request) return;
    if (approve) {
      if (request.requestType === 'onboarding' && request.requestedUser) {
        setTeamMembers((previous) => [...previous, request.requestedUser as WorkspaceUser]);
      } else {
        setTeamMembers((previous) => previous.map((member) => member.id === request.userId ? { ...member, ...(request.requestedEmail ? { email: request.requestedEmail } : {}), ...(request.requestedPassword ? { password: request.requestedPassword } : {}) } : member));
      }
    }
    setCredentialRequests((previous) => previous.map((item) => item.id === requestId ? { ...item, status: approve ? 'approved' : 'rejected' } : item));
  };

  const handleCredentialRequest = (requestedEmail?: string, requestedPassword?: string) => {
    if (!currentUser || currentUser.role === 'admin') return 'Admin credentials are managed directly by the admin.';
    setCredentialRequests((previous) => [...previous, { id: `request-${Date.now()}`, userId: currentUser.id, userName: currentUser.name, userEmail: currentUser.email, requestedEmail, requestedPassword, createdAt: new Date().toISOString(), status: 'pending' }]);
    return 'Your credential change request was sent to the admin for approval.';
  };

  const findTaskFromLanguage = (prompt: string) => {
    const normalizedPrompt = prompt.toLowerCase().replace(/[^a-z0-9 ]/g, ' ');
    return allTasks
      .map((task) => {
        const words = task.title.toLowerCase().split(/\s+/).filter((word) => word.length > 3);
        const score = words.filter((word) => normalizedPrompt.includes(word)).length;
        return { task, score };
      })
      .sort((left, right) => right.score - left.score)[0]?.score
      ? allTasks
        .map((task) => ({ task, score: task.title.toLowerCase().split(/\s+/).filter((word) => word.length > 3 && normalizedPrompt.includes(word)).length }))
        .sort((left, right) => right.score - left.score)[0].task
      : undefined;
  };

  const findUserFromLanguage = (prompt: string) => {
    const normalizedPrompt = prompt.toLowerCase();
    return teamMembers.find((member) => normalizedPrompt.includes(member.name.toLowerCase())) ||
      teamMembers.find((member) => normalizedPrompt.includes(member.email.toLowerCase()));
  };

  const handleAssistantCommand = (prompt: string): string | null => {
    const lower = prompt.toLowerCase();
    const canManage = currentUser?.role === 'admin' || currentUser?.role === 'hr';
    if (!currentUser) return null;
    if (lower.includes('request') && (lower.includes('email') || lower.includes('password') || lower.includes('credential'))) return handleCredentialRequest();
    if ((lower.includes('mark') || lower.includes('set') || lower.includes('finish') || lower.includes('complete')) && (lower.includes('complete') || lower.includes('done') || lower.includes('finished'))) {
      const task = findTaskFromLanguage(prompt);
      if (!task) return 'Tell me the task title so I can mark the correct task complete.';
      handleUpdateTask(task.id, { status: 'Done' }, 'Marked complete by Thozha from the assistant command.');
      return `I marked "${task.title}" as complete.`;
    }
    if ((lower.includes('update') || lower.includes('change') || lower.includes('move') || lower.includes('set')) && (lower.includes('status') || lower.includes('progress') || lower.includes('state'))) {
      const task = findTaskFromLanguage(prompt);
      const status = lower.includes('backlog') ? 'backlog' : lower.includes('to do') || lower.includes('todo') || lower.includes('pending') ? 'to do' : lower.includes('in progress') || lower.includes('working') ? 'in progress' : lower.includes('in review') || lower.includes('review') ? 'in review' : lower.includes('done') || lower.includes('complete') || lower.includes('finished') ? 'done' : undefined;
      if (!task || !status) return 'Tell me the task title and status, for example: update Website QA to In Progress.';
      const normalized = status === 'backlog' ? 'Backlog' : status === 'to do' ? 'To Do' : status === 'in progress' ? 'In Progress' : status === 'in review' ? 'In Review' : 'Done';
      handleUpdateTask(task.id, { status: normalized }, 'Status updated by Thozha from the assistant command.');
      return `I updated "${task.title}" to ${normalized}.`;
    }
    if ((lower.includes('create') || lower.includes('new') || lower.includes('start') || lower.includes('add')) && (lower.includes('project') || lower.includes('website'))) {
      if (!canManage) return 'Your role cannot create projects. Ask HR or the admin.';
      const title = prompt.replace(/^(please\s+)?(create|add|start|make)\s+(a\s+)?(new\s+)?(project|website)\s*/i, '').replace(/^(called|named)\s+/i, '').trim();
      if (!title) return 'Tell me the project name, for example: create project Client Website Redesign.';
      handleCreateProject(title);
      return `I created the project "${title}".`;
    }
    if ((lower.includes('delete') || lower.includes('remove') || lower.includes('cancel')) && (lower.includes('task') || lower.includes('work'))) {
      if (!canManage) return 'Your role cannot delete tasks. Ask HR or the admin.';
      const task = findTaskFromLanguage(prompt);
      if (!task) return 'Tell me the exact task title to delete.';
      handleDeleteTask(task.id);
      return `I deleted the task "${task.title}".`;
    }
    if ((lower.includes('assign') || lower.includes('allocate') || lower.includes('give') || lower.includes('delegate')) && (lower.includes('task') || lower.includes('work'))) {
      if (!canManage) return 'Your role cannot assign tasks. Ask HR or the admin.';
      const assignee = findUserFromLanguage(prompt);
      const task = findTaskFromLanguage(prompt);
      if (!task || !assignee) return 'I could not match that task or employee. Use their exact names from the workspace.';
      handleUpdateTask(task.id, { assignee: { id: assignee.id, name: assignee.name, email: assignee.email, avatar: assignee.avatar, role: assignee.role } });
      void dispatchWorkAssignmentEmail(currentUser, assignee, task);
      return `I assigned "${task.title}" to ${assignee.name} and sent the assignment notification.`;
    }
    return null;
  };

  const handleUpdateTask = (
    taskId: string,
    updatedTask: Partial<KanbanTask>,
    workNote?: string
  ) => {
    const task = pages
      .flatMap((page) => page.kanbanTasks || [])
      .find((candidate) => candidate.id === taskId);
    const taskTitle = task?.title || '';

    setPages((prevPages) =>
      prevPages.map((page) => {
        if (!page.kanbanTasks) return page;

        const taskIndex = page.kanbanTasks.findIndex((task) => task.id === taskId);
        if (taskIndex === -1) return page;

        const nextTask = { ...page.kanbanTasks[taskIndex], ...updatedTask };

        return {
          ...page,
          updatedAt: new Date().toISOString(),
          kanbanTasks: page.kanbanTasks.map((task, index) =>
            index === taskIndex ? nextTask : task
          ),
        };
      })
    );

    if (workNote && currentUser && taskTitle) {
      setActivityLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          taskId,
          taskTitle,
          updatedBy: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
            avatar: currentUser.avatar,
          },
          newStatus: updatedTask.status ?? 'Updated',
          note: workNote,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 25));
    }

    if (currentUser?.role === 'employee' && (updatedTask.status || workNote)) {
      void dispatchTaskStatusUpdate(currentUser, teamMembers, {
        id: taskId,
        title: taskTitle,
        status: updatedTask.status || 'Updated',
        note: workNote,
      });
    }
  };

  if (!currentUser) {
    return (
      <UniversalLoginPage
        teamMembers={teamMembers}
        pendingRegistrationEmails={credentialRequests.filter((request) => request.requestType === 'onboarding' && request.status === 'pending').map((request) => request.userEmail.toLowerCase())}
        theme={theme}
        onToggleTheme={() => setTheme((previous) => previous === 'dark' ? 'light' : 'dark')}
        onLoginSuccess={handleLoginSuccess}
        onRegisterUser={handleRegisterUser}
      />
    );
  }

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead(currentUser.id, currentUser.email);
    setNotifications(getStoredNotifications());
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    setNotifications(getStoredNotifications());
  };

  const handleDeleteNotification = (id: string) => {
    deleteNotification(id);
    setNotifications(getStoredNotifications());
  };

  const handleOpenAssistant = () => setAssistantOpen(true);

  return (
    <div className={`theme-${theme} min-h-screen bg-[#f5f5f3] text-stone-900`}>
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMenuOpen(true)} className="rounded-lg bg-stone-100 p-2 text-stone-700 hover:bg-stone-200" title="Open workspace menu"><Menu className="h-4 w-4" /></button>
            <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-700">Zooye Info Technologies</p>
            <h1 className="text-base font-bold text-stone-900 sm:text-lg">WordPress Delivery Workspace</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setActiveView('dashboard')} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${activeView === 'dashboard' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}>
              <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
            </button>
            <button type="button" onClick={() => setActiveView('inbox')} className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${activeView === 'inbox' ? 'bg-amber-400 text-stone-950' : 'bg-stone-100 text-stone-700'}`}>
              <Inbox className="h-3.5 w-3.5" /> Inbox
              {unreadNotificationsCount > 0 && <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] text-white">{unreadNotificationsCount}</span>}
            </button>
            <button type="button" onClick={handleOpenAssistant} className="flex items-center gap-1.5 rounded-lg bg-amber-400 px-3 py-2 text-xs font-bold text-stone-950">
              <Bot className="h-3.5 w-3.5" /> Thozha
            </button>
            <button type="button" onClick={() => setTheme((previous) => previous === 'dark' ? 'light' : 'dark')} className="rounded-lg bg-stone-100 p-2 text-stone-700 hover:bg-stone-200" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {(currentUser.role === 'admin' || currentUser.role === 'hr') && <button type="button" onClick={() => { setOperationsOpen(true); setActiveSection('projects'); }} className="hidden rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold text-white sm:block">Manage</button>}
            <button type="button" onClick={handleLogout} title="Log out" className="rounded-lg bg-stone-100 p-2 text-stone-700 hover:bg-stone-200">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 sm:px-6">
        {activeSection === 'settings' ? (
          <AccountPreferences currentUser={currentUser} onSave={handleSaveAccountPreferences} onRequestCredentials={() => alert(handleCredentialRequest())} />
        ) : activeView === 'inbox' ? (
          <InboxView
            currentUser={currentUser}
            notifications={notifications}
            emailLogs={emailLogs}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDeleteNotification={handleDeleteNotification}
            onOpenAssistant={handleOpenAssistant}
          />
        ) : (
          <UserDashboard
            currentUser={currentUser}
            teamMembers={teamMembers}
            pages={pages}
            activityLogs={activityLogs}
            onUpdateTask={handleUpdateTask}
            onOpenTaskDetail={() => undefined}
            onNavigateToPage={() => undefined}
            onOpenUserManagement={() => undefined}
            onLogout={handleLogout}
          />
        )}
      </main>

      <WorkspaceOffcanvas
        isOpen={isMenuOpen}
        activeSection={activeSection}
        canManage={currentUser.role === 'admin' || currentUser.role === 'hr'}
        onClose={() => setMenuOpen(false)}
        onSelect={(section) => {
          setActiveSection(section);
          if (section === 'inbox') setActiveView('inbox');
          else if (section === 'dashboard') setActiveView('dashboard');
          else if (section === 'thozha') handleOpenAssistant();
          else if (section === 'projects' || section === 'tasks' || section === 'users') setOperationsOpen(true);
        }}
      />

      {isOperationsOpen && (
        <AdminOperationsPanel
          currentUser={currentUser}
          pages={pages}
          teamMembers={teamMembers}
          credentialRequests={credentialRequests}
          onClose={() => setOperationsOpen(false)}
          onCreateProject={handleCreateProject}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onCreateUser={handleCreateUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          onResolveCredentialRequest={handleResolveCredentialRequest}
        />
      )}

      <GeminiAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setAssistantOpen(false)}
        currentUser={currentUser}
        tasks={allTasks}
        notifications={notifications}
        currentPageTitle={activeView === 'inbox' ? 'Inbox & Real-Time Alerts' : 'Role Dashboard'}
        onCommand={handleAssistantCommand}
      />
      <RealtimeEmailToast />
    </div>
  );
}
