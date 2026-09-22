import React, { useState } from 'react';
import { ArrowLeft, FolderKanban, ListTodo, Plus, Save, Trash2, Users, X } from 'lucide-react';
import { KanbanTask, Page, UserRole, WorkspaceUser } from '../types';

export interface CredentialRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestedEmail?: string;
  requestedPassword?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  requestType?: 'credential' | 'onboarding';
  requestedUser?: WorkspaceUser;
}

interface AdminOperationsPanelProps {
  currentUser: WorkspaceUser;
  pages: Page[];
  teamMembers: WorkspaceUser[];
  credentialRequests: CredentialRequest[];
  onClose: () => void;
  onCreateProject: (title: string, details?: { description?: string; clientName?: string; websiteUrl?: string; targetDate?: string }) => void;
  onUpdateProject: (pageId: string, title: string) => void;
  onDeleteProject: (pageId: string) => void;
  onCreateTask: (pageId: string, task: KanbanTask) => void;
  onUpdateTask: (taskId: string, update: Partial<KanbanTask>) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateUser: (user: WorkspaceUser) => void;
  onUpdateUser: (userId: string, update: Partial<WorkspaceUser>) => void;
  onDeleteUser: (userId: string) => void;
  onResolveCredentialRequest: (requestId: string, approve: boolean) => void;
}

type Tab = 'projects' | 'tasks' | 'users' | 'requests';
type FormMode = 'project' | 'task' | 'user' | null;

const ProfessionalProjectForm: React.FC<{ onBack: () => void; onSubmit: (title: string, details: { description: string; clientName: string; websiteUrl: string; targetDate: string }) => void }> = ({ onBack, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clientName, setClientName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [targetDate, setTargetDate] = useState('');
  return <FormPage title="Create a WordPress project" description="Capture the client, website, delivery goal, and deadline before adding daily tasks." onBack={onBack}><form onSubmit={(event) => { event.preventDefault(); if (title.trim()) onSubmit(title.trim(), { description, clientName, websiteUrl, targetDate }); }} className="space-y-4"><Field label="Project name"><input autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Zooye business website redesign" className="form-input" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Client name"><input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Client or company" className="form-input" /></Field><Field label="Website URL"><input type="url" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://client-site.com" className="form-input" /></Field></div><Field label="Project description"><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Goal, scope, key deliverables" className="form-input min-h-24 resize-y" /></Field><Field label="Target delivery date"><input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} className="form-input" /></Field><SubmitButton label="Create project" /></form></FormPage>;
};

const ProfessionalTaskForm: React.FC<{ onBack: () => void; projects: Page[]; employees: WorkspaceUser[]; onSubmit: (pageId: string, task: KanbanTask) => void }> = ({ onBack, projects, employees, onSubmit }) => {
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<KanbanTask['priority']>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState(employees[0]?.id || '');
  const [tags, setTags] = useState('WordPress');
  return <FormPage title="Create a daily delivery task" description="Define the work, priority, deadline, tags, and owner for this task." onBack={onBack}><form onSubmit={(event) => { event.preventDefault(); const assignee = employees.find((member) => member.id === assigneeId); if (!projectId || !title.trim() || !assignee) return; onSubmit(projectId, { id: `task-${Date.now()}`, title: title.trim(), description: description.trim() || 'Daily WordPress delivery task', status: 'To Do', priority, dueDate: dueDate || undefined, assignee: { id: assignee.id, name: assignee.name, email: assignee.email, avatar: assignee.avatar, role: assignee.role }, tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean) }); }} className="space-y-4"><Field label="Project"><select autoFocus required value={projectId} onChange={(event) => setProjectId(event.target.value)} className="form-input"><option value="">Choose a project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></Field><Field label="Task title"><input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Build homepage contact form" className="form-input" /></Field><Field label="Task brief"><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Acceptance criteria and delivery notes" className="form-input min-h-24 resize-y" /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Priority"><select value={priority} onChange={(event) => setPriority(event.target.value as KanbanTask['priority'])} className="form-input"><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></Field><Field label="Due date"><input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="form-input" /></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Assign to"><select required value={assigneeId} onChange={(event) => setAssigneeId(event.target.value)} className="form-input">{employees.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></Field><Field label="Tags"><input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="SEO, Content, QA" className="form-input" /></Field></div><SubmitButton label="Create daily task" /></form></FormPage>;
};

const ProfessionalUserForm: React.FC<{ onBack: () => void; isAdmin: boolean; onSubmit: (user: WorkspaceUser) => void }> = ({ onBack, isAdmin, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [title, setTitle] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState('');
  const imageUpload = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setAvatar(typeof reader.result === 'string' ? reader.result : ''); reader.readAsDataURL(file); };
  return <FormPage title="Create a complete user account" description="Use the same profile information collected during registration. The user will receive a personal role-based dashboard." onBack={onBack}><form onSubmit={(event) => { event.preventDefault(); if (!name.trim() || !email.trim() || !password.trim() || !title.trim()) return; onSubmit({ id: `user-${Date.now()}`, name: name.trim(), email: email.trim().toLowerCase(), password, avatar, role, title: title.trim(), department: 'WordPress Delivery', dateOfBirth, bloodGroup, aadhaarNumber, phone, address }); }} className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><Field label="Full name"><input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Jordan Miller" className="form-input" /></Field><Field label="Company email"><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="jordan@zooye.in" className="form-input" /></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Create password"><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="form-input" /></Field><Field label="Access role"><select value={role} onChange={(event) => setRole(event.target.value as UserRole)} className="form-input"><option value="employee">Employee</option><option value="hr">HR Manager</option>{isAdmin && <option value="admin">Admin</option>}</select></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Position"><input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="WordPress Developer" className="form-input" /></Field><Field label="Date of birth"><input type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} className="form-input" /></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Blood group"><select value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value)} className="form-input"><option value="">Not specified</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((group) => <option key={group}>{group}</option>)}</select></Field><Field label="Aadhaar number"><input value={aadhaarNumber} onChange={(event) => setAadhaarNumber(event.target.value)} maxLength={12} className="form-input" /></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Phone number"><input value={phone} onChange={(event) => setPhone(event.target.value)} className="form-input" /></Field><Field label="Profile image"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={imageUpload} className="form-input" /></Field></div><Field label="Address"><textarea value={address} onChange={(event) => setAddress(event.target.value)} className="form-input min-h-20 resize-y" /></Field><SubmitButton label="Create user & dashboard" /></form></FormPage>;
};

export const AdminOperationsPanel: React.FC<AdminOperationsPanelProps> = ({
  currentUser, pages, teamMembers, credentialRequests, onClose, onCreateProject,
  onUpdateProject, onDeleteProject, onCreateTask, onUpdateTask, onDeleteTask,
  onCreateUser, onUpdateUser, onDeleteUser, onResolveCredentialRequest,
}) => {
  const canManage = currentUser.role === 'admin' || currentUser.role === 'hr';
  const isAdmin = currentUser.role === 'admin';
  const [tab, setTab] = useState<Tab>('projects');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectClient, setProjectClient] = useState('');
  const [projectWebsite, setProjectWebsite] = useState('');
  const [projectTargetDate, setProjectTargetDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<KanbanTask['priority']>('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskTags, setTaskTags] = useState('WordPress');
  const [taskAssignee, setTaskAssignee] = useState(teamMembers.find((member) => member.role === 'employee')?.id || '');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('employee');
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingProjectTitle, setEditingProjectTitle] = useState('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const projects = pages.filter((page) => page.type === 'kanban');
  const tasks = pages.flatMap((page) => (page.kanbanTasks || []).map((task) => ({ task, page })));
  const back = () => setFormMode(null);

  const submitProject = (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectTitle.trim()) return;
    onCreateProject(projectTitle.trim(), { description: projectDescription.trim(), clientName: projectClient.trim(), websiteUrl: projectWebsite.trim(), targetDate: projectTargetDate }); setProjectTitle(''); setProjectDescription(''); setProjectClient(''); setProjectWebsite(''); setProjectTargetDate(''); back();
  };
  const submitTask = (event: React.FormEvent) => {
    event.preventDefault();
    const assignee = teamMembers.find((member) => member.id === taskAssignee);
    if (!selectedProject || !taskTitle.trim() || !assignee) return;
    onCreateTask(selectedProject, { id: `task-${Date.now()}`, title: taskTitle.trim(), description: taskDescription.trim() || 'Daily WordPress delivery task', status: 'To Do', priority: taskPriority, dueDate: taskDueDate || undefined, assignee: { id: assignee.id, name: assignee.name, email: assignee.email, avatar: assignee.avatar, role: assignee.role }, tags: taskTags.split(',').map((tag) => tag.trim()).filter(Boolean) });
    setTaskTitle(''); setTaskDescription(''); setTaskPriority('Medium'); setTaskDueDate(''); setTaskTags('WordPress'); setSelectedProject(''); back();
  };
  const submitUser = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || (newUserRole === 'admin' && !isAdmin)) return;
    onCreateUser({ id: `user-${Date.now()}`, name: newUserName.trim(), email: newUserEmail.trim().toLowerCase(), password: 'welcome123', avatar: '', role: newUserRole, title: newUserRole === 'hr' ? 'HR Manager' : newUserRole === 'admin' ? 'Administrator' : 'WordPress Developer', department: newUserRole === 'hr' ? 'Human Resources' : 'WordPress Delivery' });
    setNewUserName(''); setNewUserEmail(''); back();
  };

  const form = formMode === 'project' ? <ProfessionalProjectForm onBack={back} onSubmit={(title, details) => { onCreateProject(title, details); back(); }} /> : formMode === 'task' ? <ProfessionalTaskForm onBack={back} projects={projects} employees={teamMembers.filter((member) => member.role === 'employee')} onSubmit={(pageId, task) => { onCreateTask(pageId, task); back(); }} /> : formMode === 'user' ? <ProfessionalUserForm onBack={back} isAdmin={isAdmin} onSubmit={(user) => { onCreateUser(user); back(); }} /> : formMode === 'project' ? <FormPage title="Create a project" description="Add a WordPress website project that can contain daily delivery tasks." onBack={back}><form onSubmit={submitProject} className="space-y-4"><Field label="Project name"><input autoFocus required value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} placeholder="e.g. Zooye business website redesign" className="form-input" /></Field><SubmitButton label="Create project" /></form></FormPage>
    : formMode === 'task' ? <FormPage title="Create a daily task" description="Add work to a project and assign it to a WordPress delivery employee." onBack={back}><form onSubmit={submitTask} className="space-y-4"><Field label="Project"><select autoFocus required value={selectedProject} onChange={(event) => setSelectedProject(event.target.value)} className="form-input"><option value="">Choose a project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></Field><Field label="Task title"><input required value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="e.g. Build homepage contact form" className="form-input" /></Field><Field label="Assign to"><select required value={taskAssignee} onChange={(event) => setTaskAssignee(event.target.value)} className="form-input">{teamMembers.filter((member) => member.role === 'employee').map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></Field><SubmitButton label="Create daily task" /></form></FormPage>
    : <FormPage title="Create team account" description="Set up a professional Zooye Info Technologies account and assign the correct access level." onBack={back}><form onSubmit={submitUser} className="space-y-5"><div className="rounded-xl border border-blue-100 bg-blue-50 p-4"><p className="text-sm font-semibold text-blue-950">Account identity</p><p className="mt-1 text-xs text-blue-700">Use the employee's company email. This account will receive a personal role-based dashboard after sign-in.</p></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Full name"><input autoFocus required value={newUserName} onChange={(event) => setNewUserName(event.target.value)} placeholder="e.g. Jordan Miller" className="form-input" /></Field><Field label="Company email"><input required type="email" value={newUserEmail} onChange={(event) => setNewUserEmail(event.target.value)} placeholder="jordan@zooye.in" className="form-input" /></Field></div><Field label="Access role"><select value={newUserRole} onChange={(event) => setNewUserRole(event.target.value as UserRole)} className="form-input"><option value="employee">Employee · assigned daily work</option><option value="hr">HR Manager · manages delivery operations</option>{isAdmin && <option value="admin">Admin · full workspace control</option>}</select></Field><div className="rounded-xl border border-stone-200 bg-stone-50 p-4"><p className="text-xs font-semibold text-stone-800">Initial access</p><p className="mt-1 text-xs text-stone-500">A temporary password will be generated for the new account. The user should change it after first sign-in.</p></div><SubmitButton label="Create account & dashboard" /></form></FormPage>;

  return <div className="fixed inset-0 z-50 bg-stone-950/45 p-3 backdrop-blur-sm sm:p-6"><section className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"><header className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-5 py-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">Zooye operations</p><h2 className="text-xl font-bold text-stone-900">Projects, Tasks & People</h2></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-stone-500 hover:bg-stone-200" title="Close management panel"><X className="h-5 w-5" /></button></header>{formMode ? form : <><nav className="flex gap-2 overflow-x-auto border-b border-stone-200 px-5 py-3 text-xs font-semibold">{([['projects', FolderKanban, 'Projects'], ['tasks', ListTodo, 'Tasks'], ['users', Users, 'Users'], ['requests', Save, 'Credential requests']] as const).map(([key, Icon, label]) => <button key={key} type="button" onClick={() => setTab(key)} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 ${tab === key ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</nav><div className="flex-1 overflow-y-auto p-5">{tab === 'projects' && <ListSection title="Projects" addLabel="Add project" onAdd={() => setFormMode('project')}><div className="space-y-3">{projects.length === 0 && <EmptyState text="No projects yet. Add a WordPress project to begin." />}{projects.map((project) => <ListRow key={project.id} title={project.title} detail={`${project.kanbanTasks?.length || 0} daily tasks`} editing={editingProject === project.id} editValue={editingProjectTitle} onEditChange={setEditingProjectTitle} onEdit={() => { setEditingProject(project.id); setEditingProjectTitle(project.title); }} onSave={() => { onUpdateProject(project.id, editingProjectTitle); setEditingProject(null); }} onDelete={() => onDeleteProject(project.id)} />)}</div></ListSection>}{tab === 'tasks' && <ListSection title="Daily tasks" addLabel="Add task" onAdd={() => setFormMode('task')}><div className="space-y-3">{tasks.length === 0 && <EmptyState text="No tasks yet. Add a daily task to a project." />}{tasks.map(({ task, page }) => <ListRow key={task.id} title={task.title} detail={`${page.title} · ${task.assignee.name} · ${task.status}`} editing={editingTask === task.id} editValue={editingTaskTitle} onEditChange={setEditingTaskTitle} onEdit={() => { setEditingTask(task.id); setEditingTaskTitle(task.title); }} onSave={() => { onUpdateTask(task.id, { title: editingTaskTitle }); setEditingTask(null); }} onDelete={() => onDeleteTask(task.id)} />)}</div></ListSection>}{tab === 'users' && <ListSection title="Users" addLabel="Add user" onAdd={() => setFormMode('user')}><div className="space-y-3">{teamMembers.map((member) => <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 p-3"><div className="flex min-w-0 items-center gap-3"><img src={member.avatar} alt="" className="h-9 w-9 rounded-full object-cover" /><div><p className="text-sm font-semibold text-stone-900">{member.name}</p><p className="text-xs text-stone-500">{member.email} · {member.role}</p></div></div>{isAdmin && member.id !== currentUser.id && <div className="flex items-center gap-2"><select value={member.role} onChange={(event) => onUpdateUser(member.id, { role: event.target.value as UserRole })} className="rounded-lg border border-stone-200 px-2 py-1 text-xs"><option value="employee">Employee</option><option value="hr">HR</option><option value="admin">Admin</option></select><button type="button" onClick={() => onUpdateUser(member.id, { password: 'welcome123' })} className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">Reset password</button><button type="button" onClick={() => onDeleteUser(member.id)} className="rounded-lg bg-rose-50 p-2 text-rose-700" title="Delete user"><Trash2 className="h-3.5 w-3.5" /></button></div>}</div>)}</div></ListSection>}{tab === 'requests' && <div className="space-y-3">{credentialRequests.length === 0 && <EmptyState text="No pending credential or onboarding requests." />}{credentialRequests.map((request) => <div key={request.id} className="flex flex-col gap-3 rounded-xl border border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-stone-900">{request.requestType === 'onboarding' ? `${request.userName} requested a new account` : `${request.userName} requested a credential change`}</p><p className="text-xs text-stone-500">{request.requestedUser ? `${request.requestedUser.email} · ${request.requestedUser.title}` : request.requestedEmail || 'Password change requested'} · {new Date(request.createdAt).toLocaleString()}</p></div>{isAdmin && request.status === 'pending' && <div className="flex gap-2"><button type="button" onClick={() => onResolveCredentialRequest(request.id, true)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Approve</button><button type="button" onClick={() => onResolveCredentialRequest(request.id, false)} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">Reject</button></div>}</div>)}</div>}</div></>}</section></div>;
};

const FormPage: React.FC<{ title: string; description: string; onBack: () => void; children: React.ReactNode }> = ({ title, description, onBack, children }) => <div className="flex-1 overflow-y-auto p-5 sm:p-8"><button type="button" onClick={onBack} className="mb-6 flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-900"><ArrowLeft className="h-4 w-4" /> Back to list</button><div className="mx-auto max-w-xl"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">Zooye operations</p><h3 className="mt-2 text-2xl font-bold text-stone-900">{title}</h3><p className="mt-2 text-sm text-stone-500">{description}</p><div className="mt-8">{children}</div></div></div>;
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => <label className="block space-y-1.5"><span className="text-xs font-semibold text-stone-700">{label}</span>{children}</label>;
const SubmitButton: React.FC<{ label: string }> = ({ label }) => <button type="submit" className="flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-700"><Save className="h-4 w-4" />{label}</button>;
const EmptyState: React.FC<{ text: string }> = ({ text }) => <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-sm text-stone-500">{text}</div>;
const ListSection: React.FC<{ title: string; addLabel: string; onAdd: () => void; children: React.ReactNode }> = ({ title, addLabel, onAdd, children }) => <section><div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold text-stone-900">{title}</h3><button type="button" onClick={onAdd} className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold text-white hover:bg-stone-700"><Plus className="h-3.5 w-3.5" />{addLabel}</button></div>{children}</section>;
const ListRow: React.FC<{ title: string; detail: string; editing: boolean; editValue: string; onEditChange: (value: string) => void; onEdit: () => void; onSave: () => void; onDelete: () => void }> = ({ title, detail, editing, editValue, onEditChange, onEdit, onSave, onDelete }) => <div className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 p-4"><div className="min-w-0 flex-1">{editing ? <input autoFocus value={editValue} onChange={(event) => onEditChange(event.target.value)} className="w-full rounded border border-stone-300 px-2 py-1 text-sm" /> : <p className="truncate text-sm font-bold text-stone-900">{title}</p>}<p className="truncate text-xs text-stone-500">{detail}</p></div><div className="flex gap-1">{editing ? <button type="button" onClick={onSave} className="rounded-lg bg-emerald-600 p-2 text-white" title="Save"><Save className="h-3.5 w-3.5" /></button> : <button type="button" onClick={onEdit} className="rounded-lg bg-stone-100 px-2 py-1 text-xs">Edit</button>}<button type="button" onClick={onDelete} className="rounded-lg bg-rose-50 p-2 text-rose-700" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button></div></div>;
