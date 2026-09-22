export type BlockType =
  | 'p'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'todo'
  | 'bullet'
  | 'numbered'
  | 'toggle'
  | 'callout'
  | 'quote'
  | 'code'
  | 'divider'
  | 'table';

export interface TableCell {
  id: string;
  value: string;
}

export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean; // for todo
  calloutIcon?: string; // for callout
  calloutColor?: 'blue' | 'yellow' | 'green' | 'red' | 'purple' | 'gray';
  codeLanguage?: string; // for code
  isOpen?: boolean; // for toggle
  toggleContent?: string;
  tableData?: TableData;
}

export type PageType = 'document' | 'kanban' | 'table' | 'guide' | 'hierarchy' | 'dashboard' | 'home' | 'inbox';

export type UserRole = 'admin' | 'hr' | 'employee';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    deadlineAlerts?: string[];
    assignedTasks?: string[];
    suggestedActions?: { label: string; action: string; targetId?: string }[];
  };
}

export type NotificationType = 'task_assigned' | 'deadline_approaching' | 'status_update' | 'system';

export interface InboxNotification {
  id: string;
  recipientId: string;
  recipientEmail: string;
  senderId?: string;
  senderName: string;
  senderRole?: UserRole;
  senderAvatar?: string;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: string;
  taskTitle?: string;
  dueDate?: string;
  priority?: string;
  isRead: boolean;
  createdAt: string;
  emailSent?: boolean;
  emailSubject?: string;
  emailBody?: string;
}

export interface EmailDispatchLog {
  id: string;
  toEmail: string;
  toName: string;
  fromName: string;
  fromRole: UserRole;
  subject: string;
  body: string;
  timestamp: string;
  taskId?: string;
  taskTitle?: string;
  priority?: string;
  dueDate?: string;
  status: 'delivered' | 'simulated_live';
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: UserRole;
  content: string;
  timestamp: string;
  statusChange?: 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Done';
}

export interface TaskActivityLog {
  id: string;
  taskId: string;
  taskTitle: string;
  updatedBy: {
    id: string;
    name: string;
    role: UserRole;
    avatar: string;
  };
  previousStatus?: string;
  newStatus: string;
  note?: string;
  timestamp: string;
}

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: 'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignee: {
    id?: string;
    name: string;
    avatar: string;
    email: string;
    role?: string;
  };
  dueDate?: string;
  tags: string[];
  comments?: TaskComment[];
}

export interface DatabaseRow {
  id: string;
  title: string;
  category: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  owner: string;
  priority: 'Low' | 'Medium' | 'High';
  targetDate: string;
  progress: number; // 0 - 100
}

export interface Page {
  id: string;
  title: string;
  icon: string;
  coverUrl?: string;
  parentId?: string | null;
  type: PageType;
  blocks: Block[];
  kanbanTasks?: KanbanTask[];
  databaseRows?: DatabaseRow[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
  projectDescription?: string;
  clientName?: string;
  websiteUrl?: string;
  targetDate?: string;
}

export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  title: string;
  department: string;
  password?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  aadhaarNumber?: string;
  phone?: string;
  address?: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  loginTime: string;
}
