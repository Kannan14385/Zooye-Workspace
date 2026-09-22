import React, { useState } from 'react';
import {
  Crown,
  Users,
  Briefcase,
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  UserPlus,
  ArrowRight,
  Info,
  Check,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { WorkspaceUser, UserRole, KanbanTask } from '../types';
import { UserRoleBadge } from './UserRoleBadge';

interface OrganizationHierarchyViewProps {
  currentUser: WorkspaceUser;
  teamMembers: WorkspaceUser[];
  onSwitchUser: (user: WorkspaceUser) => void;
  onAddUser: (user: WorkspaceUser) => void;
  onOpenUserManagement: () => void;
  onNavigateToBoard: () => void;
}

export const OrganizationHierarchyView: React.FC<OrganizationHierarchyViewProps> = ({
  currentUser,
  teamMembers,
  onSwitchUser,
  onAddUser,
  onOpenUserManagement,
  onNavigateToBoard,
}) => {
  // Test adding an admin state
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminTitle, setNewAdminTitle] = useState('Executive Co-Director');
  const [testFeedback, setTestFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Employee status update test state
  const [testStatus, setTestStatus] = useState<'Backlog' | 'To Do' | 'In Progress' | 'In Review' | 'Done'>('In Progress');
  const [testStatusComment, setTestStatusComment] = useState('');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'admin';
  const isHR = currentUser.role === 'hr';
  const isEmployee = currentUser.role === 'employee';

  const handleTestAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setTestFeedback(null);

    // RESTRICTION ENFORCEMENT:
    if (!isAdmin) {
      setTestFeedback({
        type: 'error',
        message: `RESTRICTION ENFORCED: As ${currentUser.role === 'hr' ? 'HR Manager' : 'Employee'}, you cannot add or appoint Admins. Only the CEO / Admin has the exclusive authority to add more Admins!`,
      });
      return;
    }

    if (!newAdminName.trim() || !newAdminEmail.trim()) {
      setTestFeedback({
        type: 'error',
        message: 'Please provide both a name and an email address for the new Admin.',
      });
      return;
    }

    const newAdmin: WorkspaceUser = {
      id: 'user-admin-' + Date.now(),
      name: newAdminName.trim(),
      email: newAdminEmail.trim(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      role: 'admin',
      title: newAdminTitle.trim() || 'Co-Admin',
      department: 'Executive Leadership',
    };

    onAddUser(newAdmin);
    setTestFeedback({
      type: 'success',
      message: `SUCCESS (CEO Authority): Appointed ${newAdmin.name} as a new Admin! They now appear in the organization directory.`,
    });
    setNewAdminName('');
    setNewAdminEmail('');
  };

  const handleTestStatusUpdate = (status: typeof testStatus) => {
    setTestStatus(status);
    setStatusFeedback(
      `Status successfully updated to "${status}" by ${currentUser.name} (${currentUser.role.toUpperCase()})!`
    );
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 pb-20 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner: Active Persona & Hierarchy Announcement */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Role-Based Access Control & Organizational Hierarchy</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          Hierarchy of Users & Role Restrictions
        </h1>
        <p className="text-stone-300 text-sm leading-relaxed max-w-3xl mb-6">
          The workspace strictly enforces a 3-tier organizational model tailored to corporate operations:
          the <strong>CEO / Admin</strong> has exclusive authority to add more Admins; the <strong>HR Manager</strong> manages all employees and assignments; and the <strong>Employee</strong> is the one who executes work and updates the status.
        </p>

        {/* 1-Click Interactive Persona Switcher Banner */}
        <div className="bg-stone-800/90 border border-stone-700/80 rounded-xl p-4">
          <div className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Test Real-Time Role Switching (Click any role to test restrictions):</span>
            <span className="text-[11px] text-amber-300 font-normal">Active: {currentUser.name}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Persona 1: CEO / Admin */}
            {teamMembers.find((m) => m.role === 'admin') && (
              <button
                type="button"
                onClick={() => onSwitchUser(teamMembers.find((m) => m.role === 'admin')!)}
                className={`p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                  isAdmin
                    ? 'bg-purple-900/50 border-purple-400 ring-2 ring-purple-400 text-white'
                    : 'bg-stone-800/60 border-stone-700 hover:bg-stone-700/60 text-stone-300'
                }`}
              >
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                  <Crown className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>👑 Admin (CEO)</span>
                    {isAdmin && (
                      <span className="text-[10px] bg-purple-400 text-purple-950 font-extrabold px-1.5 py-0.2 rounded">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-purple-200/80 truncate">
                    Can add more Admins
                  </div>
                </div>
              </button>
            )}

            {/* Persona 2: HR Manager */}
            {teamMembers.find((m) => m.role === 'hr') && (
              <button
                type="button"
                onClick={() => onSwitchUser(teamMembers.find((m) => m.role === 'hr')!)}
                className={`p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                  isHR
                    ? 'bg-blue-900/50 border-blue-400 ring-2 ring-blue-400 text-white'
                    : 'bg-stone-800/60 border-stone-700 hover:bg-stone-700/60 text-stone-300'
                }`}
              >
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>👥 HR Manager</span>
                    {isHR && (
                      <span className="text-[10px] bg-blue-400 text-blue-950 font-extrabold px-1.5 py-0.2 rounded">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-blue-200/80 truncate">
                    The one who manages all
                  </div>
                </div>
              </button>
            )}

            {/* Persona 3: Employee */}
            {teamMembers.find((m) => m.role === 'employee') && (
              <button
                type="button"
                onClick={() => onSwitchUser(teamMembers.find((m) => m.role === 'employee')!)}
                className={`p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                  isEmployee
                    ? 'bg-emerald-900/50 border-emerald-400 ring-2 ring-emerald-400 text-white'
                    : 'bg-stone-800/60 border-stone-700 hover:bg-stone-700/60 text-stone-300'
                }`}
              >
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>💼 Employee</span>
                    {isEmployee && (
                      <span className="text-[10px] bg-emerald-400 text-emerald-950 font-extrabold px-1.5 py-0.2 rounded">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-emerald-200/80 truncate">
                    Updates the status
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3 Visual Tier Cards: The Core Mandates & Restrictions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* TIER 1: ADMIN - CEO */}
        <div
          className={`rounded-2xl border-2 p-5 bg-white flex flex-col justify-between transition-all ${
            isAdmin ? 'border-purple-500 ring-2 ring-purple-100 shadow-md' : 'border-stone-200 shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-purple-100 text-purple-800">
                <Crown className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                Tier 1: CEO / Admin
              </span>
            </div>

            <h3 className="text-lg font-bold text-stone-900">
              The Admin (CEO)
            </h3>
            <p className="text-xs font-semibold text-purple-700 mt-0.5 mb-3">
              Has the exclusive ability to add more admins
            </p>

            <div className="text-xs text-stone-600 space-y-2 mb-4">
              <div className="p-2.5 rounded-lg bg-purple-50/70 border border-purple-100 text-purple-950 font-medium">
                👑 <strong>Exclusive Authority:</strong> Only the CEO can appoint, invite, or promote other members to the Admin tier.
              </div>

              <div>
                <strong className="text-stone-900 block font-semibold mb-1">Capabilities:</strong>
                <ul className="list-disc list-inside space-y-1 text-stone-600 text-[11px]">
                  <li>Add and appoint new Admins</li>
                  <li>Full workspace authority & page deletion</li>
                  <li>Assign & reassign any employee task</li>
                  <li>Reset workspace to factory initial defaults</li>
                </ul>
              </div>

              <div>
                <strong className="text-stone-900 block font-semibold mb-1">Restrictions:</strong>
                <p className="text-stone-500 text-[11px]">
                  None. Holds top executive privileges across the organization.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100">
            <span
              className={`w-full py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 ${
                isAdmin
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-500'
              }`}
            >
              {isAdmin ? '👑 Currently Active' : 'Switch to CEO to test'}
            </span>
          </div>
        </div>

        {/* TIER 2: HR MANAGER */}
        <div
          className={`rounded-2xl border-2 p-5 bg-white flex flex-col justify-between transition-all ${
            isHR ? 'border-blue-500 ring-2 ring-blue-100 shadow-md' : 'border-stone-200 shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-blue-100 text-blue-800">
                <Users className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Tier 2: HR Manager
              </span>
            </div>

            <h3 className="text-lg font-bold text-stone-900">
              The HR Manager
            </h3>
            <p className="text-xs font-semibold text-blue-700 mt-0.5 mb-3">
              The one who manages all
            </p>

            <div className="text-xs text-stone-600 space-y-2 mb-4">
              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-blue-950 font-medium">
                👥 <strong>Operational Lead:</strong> Oversees all employees, schedules sprint deliverables, and creates official team policies.
              </div>

              <div>
                <strong className="text-stone-900 block font-semibold mb-1">Capabilities:</strong>
                <ul className="list-disc list-inside space-y-1 text-stone-600 text-[11px]">
                  <li>Manages all employees across departments</li>
                  <li>Assigns and reassigns work to any team member</li>
                  <li>Creates office wikis, handbooks, and documents</li>
                  <li>Adds new staff & employees to workspace</li>
                </ul>
              </div>

              <div>
                <strong className="text-rose-800 block font-semibold mb-1 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Strict Restriction:</span>
                </strong>
                <p className="text-rose-700 text-[11px] font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
                  <strong>CANNOT add or appoint Admins.</strong> Any attempt by HR to appoint an Admin is strictly blocked.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100">
            <span
              className={`w-full py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 ${
                isHR
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-500'
              }`}
            >
              {isHR ? '👥 Currently Active' : 'Switch to HR to test'}
            </span>
          </div>
        </div>

        {/* TIER 3: EMPLOYEE */}
        <div
          className={`rounded-2xl border-2 p-5 bg-white flex flex-col justify-between transition-all ${
            isEmployee ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-md' : 'border-stone-200 shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <Briefcase className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Tier 3: Employee
              </span>
            </div>

            <h3 className="text-lg font-bold text-stone-900">
              The Employee
            </h3>
            <p className="text-xs font-semibold text-emerald-700 mt-0.5 mb-3">
              One who updates the status
            </p>

            <div className="text-xs text-stone-600 space-y-2 mb-4">
              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-emerald-950 font-medium">
                💼 <strong>Task Execution:</strong> Registers work progress, updates statuses from Backlog to Done, and posts deliverables.
              </div>

              <div>
                <strong className="text-stone-900 block font-semibold mb-1">Capabilities:</strong>
                <ul className="list-disc list-inside space-y-1 text-stone-600 text-[11px]">
                  <li><strong>Registers and updates work status</strong> (To Do → Done)</li>
                  <li>Submits work logs, response notes & deliverable links</li>
                  <li>Checks off checklist items & task requirements</li>
                  <li>Edits assigned documentation</li>
                </ul>
              </div>

              <div>
                <strong className="text-rose-800 block font-semibold mb-1 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Strict Restrictions:</span>
                </strong>
                <ul className="list-disc list-inside space-y-0.5 text-stone-600 text-[11px]">
                  <li>Cannot reassign colleagues' work</li>
                  <li>Cannot delete workspace pages</li>
                  <li>Cannot invite or manage users</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100">
            <span
              className={`w-full py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 ${
                isEmployee
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-500'
              }`}
            >
              {isEmployee ? '💼 Currently Active' : 'Switch to Employee to test'}
            </span>
          </div>
        </div>
      </div>

      {/* LIVE INTERACTIVE TEST LAB */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span>Interactive Permission Verification Lab</span>
              <UserRoleBadge role={currentUser.role} size="sm" />
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Directly verify how role restrictions respond based on your active persona ({currentUser.name})
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenUserManagement}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Open User Management Modal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TEST TEST 1: THE ADMIN-CEO TEST (ABILITY TO ADD MORE ADMINS) */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  Restriction Test 1
                </span>
                <h3 className="text-sm font-bold text-stone-900 mt-1">
                  Add a New Admin (CEO Exclusive Authority)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Only the CEO/Admin can add or appoint more Admins. HR and Employees are strictly restricted.
                </p>
              </div>

              {isAdmin ? (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 flex items-center gap-1 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authorized (CEO)</span>
                </span>
              ) : (
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-200 flex items-center gap-1 shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Restricted ({currentUser.role.toUpperCase()})</span>
                </span>
              )}
            </div>

            {testFeedback && (
              <div
                className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                  testFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {testFeedback.type === 'success' ? (
                  <Check className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <span>{testFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleTestAddAdmin} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  New Admin Name:
                </label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="e.g. Jordan Miller"
                  disabled={!isAdmin}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 disabled:opacity-60 disabled:cursor-not-allowed focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  New Admin Email:
                </label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="jordan.admin@acmeoffice.internal"
                  disabled={!isAdmin}
                  className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 disabled:opacity-60 disabled:cursor-not-allowed focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-stone-500">
                  {isAdmin
                    ? '🟢 You are CEO: You can submit this form.'
                    : `🔴 Blocked: As ${currentUser.role.toUpperCase()}, you cannot add Admins.`}
                </span>

                <button
                  type="submit"
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                    isAdmin
                      ? 'bg-purple-700 hover:bg-purple-800 text-white shadow-2xs'
                      : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>{isAdmin ? 'Appoint New Admin' : 'Attempt Adding Admin (Blocked)'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* TEST TEST 2: THE EMPLOYEE TEST (UPDATE STATUS) */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Core Employee Mandate
                </span>
                <h3 className="text-sm font-bold text-stone-900 mt-1">
                  Update Work Status (Employee Mandate)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Employees register current progress (Backlog → Done) and post deliverables.
                </p>
              </div>

              <button
                type="button"
                onClick={onNavigateToBoard}
                className="text-[11px] text-stone-700 hover:text-stone-950 font-medium underline flex items-center gap-0.5"
              >
                <span>Go to Sprint Board</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {statusFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{statusFeedback}</span>
              </div>
            )}

            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-800">Sample Assigned Work Item:</span>
                <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-medium">
                  Sprint Task #204
                </span>
              </div>
              <p className="text-xs text-stone-700 font-medium">
                "Implement Enterprise Authentication & Token Refresh Flow"
              </p>
              <div className="text-[11px] text-stone-500">
                Assigned to: <strong>Alex Morgan (Senior Engineer)</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                1-Click Status Registration:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(['Backlog', 'To Do', 'In Progress', 'Done'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleTestStatusUpdate(st)}
                    className={`py-2 px-2 text-xs rounded-lg font-semibold transition-all border ${
                      testStatus === st
                        ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-stone-500 pt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Active stage: <strong className="text-stone-900">{testStatus}</strong>. Registered by {currentUser.name}.
              </span>
            </div>
          </div>
        </div>

        {/* FULL ROLE PERMISSION MATRIX TABLE */}
        <div className="mt-8 pt-6 border-t border-stone-200">
          <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
            <span>Organizational Permission & Restriction Matrix</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-700">
                  <th className="p-3 font-bold">Action / Privilege</th>
                  <th className="p-3 font-bold text-purple-900">👑 Admin (CEO)</th>
                  <th className="p-3 font-bold text-blue-900">👥 HR Manager</th>
                  <th className="p-3 font-bold text-emerald-900">💼 Employee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr>
                  <td className="p-3 font-semibold text-stone-900">
                    Add & Appoint New Admins
                  </td>
                  <td className="p-3 text-emerald-700 font-bold">
                    ✅ Allowed (Exclusive)
                  </td>
                  <td className="p-3 text-rose-700 font-semibold bg-rose-50/40">
                    ❌ RESTRICTED (Only CEO)
                  </td>
                  <td className="p-3 text-rose-700 font-semibold bg-rose-50/40">
                    ❌ RESTRICTED
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-stone-900">
                    Manage All Employees & Teams
                  </td>
                  <td className="p-3 text-emerald-700 font-semibold">
                    ✅ Full Authority
                  </td>
                  <td className="p-3 text-blue-700 font-bold bg-blue-50/30">
                    ✅ Primary Duty ("Manages All")
                  </td>
                  <td className="p-3 text-stone-500">
                    ❌ View Directory Only
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-stone-900">
                    Assign / Reassign Tasks to Staff
                  </td>
                  <td className="p-3 text-emerald-700 font-semibold">
                    ✅ Allowed
                  </td>
                  <td className="p-3 text-emerald-700 font-semibold">
                    ✅ Allowed
                  </td>
                  <td className="p-3 text-rose-700 font-semibold">
                    ❌ Restricted (Assigned to self)
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-stone-900">
                    Update Task Status & Progress
                  </td>
                  <td className="p-3 text-emerald-700 font-semibold">
                    ✅ Allowed
                  </td>
                  <td className="p-3 text-emerald-700 font-semibold">
                    ✅ Allowed
                  </td>
                  <td className="p-3 text-emerald-700 font-bold bg-emerald-50/30">
                    ✅ Primary Duty ("Updates Status")
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-stone-900">
                    Delete Workspace Pages
                  </td>
                  <td className="p-3 text-emerald-700 font-semibold">
                    ✅ Allowed
                  </td>
                  <td className="p-3 text-emerald-700 font-semibold">
                    ✅ Allowed
                  </td>
                  <td className="p-3 text-rose-700 font-semibold">
                    ❌ Restricted
                  </td>
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-stone-900">
                    Reset Workspace Initial Data
                  </td>
                  <td className="p-3 text-emerald-700 font-bold">
                    ✅ Allowed (CEO Only)
                  </td>
                  <td className="p-3 text-rose-700 font-semibold">
                    ❌ Restricted
                  </td>
                  <td className="p-3 text-rose-700 font-semibold">
                    ❌ Restricted
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
