import React, { useState } from 'react';
import {
  X,
  Crown,
  Users,
  Briefcase,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  Check,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { WorkspaceUser, UserRole } from '../types';
import { UserRoleBadge } from './UserRoleBadge';

interface UserManagementModalProps {
  currentUser: WorkspaceUser;
  teamMembers: WorkspaceUser[];
  onClose: () => void;
  onAddUser: (user: WorkspaceUser) => void;
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onSwitchUser: (user: WorkspaceUser) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  currentUser,
  teamMembers,
  onClose,
  onAddUser,
  onUpdateUserRole,
  onSwitchUser,
}) => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'directory' | 'add'>('hierarchy');

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [title, setTitle] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const isAdmin = currentUser.role === 'admin';
  const isHR = currentUser.role === 'hr';
  const canManageUsers = isAdmin || isHR;

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!name.trim() || !email.trim()) {
      setFormError('Please provide both name and email address.');
      return;
    }

    // Restriction check: HR cannot add admin!
    if (selectedRole === 'admin' && !isAdmin) {
      setFormError('Restriction Enforced: Only the CEO/Admin can add or appoint new Admins.');
      return;
    }

    const newUser: WorkspaceUser = {
      id: 'user-' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80`,
      role: selectedRole,
      title: title.trim() || (selectedRole === 'admin' ? 'Co-Admin' : selectedRole === 'hr' ? 'HR Specialist' : 'Staff Specialist'),
      department: department.trim() || 'Operations',
    };

    onAddUser(newUser);
    setSuccessMessage(`Successfully added ${newUser.name} with role: ${newUser.role.toUpperCase()}`);
    setName('');
    setEmail('');
    setTitle('');
    setSelectedRole('employee');
    setTimeout(() => {
      setActiveTab('directory');
      setSuccessMessage('');
    }, 1200);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    // Only Admin can promote someone to Admin
    if (newRole === 'admin' && !isAdmin) {
      alert('Action Denied: Only the CEO/Admin can grant Admin privileges.');
      return;
    }
    onUpdateUserRole(userId, newRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white border border-stone-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span>Organization Roles & Hierarchy</span>
              <UserRoleBadge role={currentUser.role} size="sm" />
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Access permissions, role restrictions, and team administration
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-stone-200 flex items-center gap-4 bg-stone-50/40 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('hierarchy')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeTab === 'hierarchy'
                ? 'border-stone-900 text-stone-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Hierarchy & Restrictions
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'directory'
                ? 'border-stone-900 text-stone-950'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Team Members ({teamMembers.length})</span>
          </button>

          {canManageUsers && (
            <button
              type="button"
              onClick={() => setActiveTab('add')}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'add'
                  ? 'border-stone-900 text-stone-950'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member {isAdmin && '(Can Add Admins)'}</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: HIERARCHY & RESTRICTIONS */}
          {activeTab === 'hierarchy' && (
            <div className="space-y-4">
              <div className="p-3 bg-stone-100/70 border border-stone-200 rounded-xl text-xs text-stone-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-stone-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-stone-900">Configured Role Hierarchy:</div>
                  The workspace enforces 3 distinct tiers of authority based on organizational roles.
                </div>
              </div>

              {/* Tier 1: CEO / Admin */}
              <div className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-purple-200 text-purple-900 font-bold">
                      <Crown className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-sm font-bold text-purple-950 flex items-center gap-1.5">
                        <span>Tier 1: CEO / Admin</span>
                        <span className="text-[10px] bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded-full font-bold">
                          Highest Authority
                        </span>
                      </div>
                      <div className="text-[11px] text-purple-800">
                        Sole power to add and appoint other Admins
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-purple-200/80">
                  <div className="bg-white/90 p-2.5 rounded-lg border border-purple-100">
                    <div className="font-semibold text-emerald-800 flex items-center gap-1 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Capabilities:</span>
                    </div>
                    <ul className="list-disc list-inside text-stone-600 text-[11px] space-y-0.5">
                      <li><strong>Ability to add more Admins</strong></li>
                      <li>Full workspace control & page deletion</li>
                      <li>Assign & oversee all work and budgets</li>
                      <li>Reset workspace to initial states</li>
                    </ul>
                  </div>

                  <div className="bg-white/90 p-2.5 rounded-lg border border-purple-100">
                    <div className="font-semibold text-stone-700 flex items-center gap-1 mb-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Restrictions:</span>
                    </div>
                    <p className="text-stone-600 text-[11px]">
                      None. Highest administrative authority across the entire organization.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tier 2: HR Manager */}
              <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-200 text-blue-900 font-bold">
                      <Users className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-sm font-bold text-blue-950 flex items-center gap-1.5">
                        <span>Tier 2: HR Manager</span>
                        <span className="text-[10px] bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded-full font-bold">
                          The One Who Manages All
                        </span>
                      </div>
                      <div className="text-[11px] text-blue-800">
                        Operations, team management, assignments & policies
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-blue-200/80">
                  <div className="bg-white/90 p-2.5 rounded-lg border border-blue-100">
                    <div className="font-semibold text-emerald-800 flex items-center gap-1 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Capabilities:</span>
                    </div>
                    <ul className="list-disc list-inside text-stone-600 text-[11px] space-y-0.5">
                      <li><strong>Manages all employees</strong></li>
                      <li>Assigns work and tasks to any team member</li>
                      <li>Creates team pages, wikis, and handbook docs</li>
                      <li>Adds new staff members and employees</li>
                    </ul>
                  </div>

                  <div className="bg-white/90 p-2.5 rounded-lg border border-blue-100">
                    <div className="font-semibold text-rose-700 flex items-center gap-1 mb-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Restrictions:</span>
                    </div>
                    <p className="text-stone-600 text-[11px]">
                      <strong>CANNOT add or appoint Admins.</strong> Only the CEO / Admin can grant Admin rights.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tier 3: Employee */}
              <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-200 text-emerald-900 font-bold">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                        <span>Tier 3: Employee</span>
                        <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                          The One Who Updates Status
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-800">
                        Task execution, status registration, and progress notes
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-emerald-200/80">
                  <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-100">
                    <div className="font-semibold text-emerald-800 flex items-center gap-1 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Capabilities:</span>
                    </div>
                    <ul className="list-disc list-inside text-stone-600 text-[11px] space-y-0.5">
                      <li><strong>Registers work status</strong> (Backlog → Done)</li>
                      <li>Submits progress responses & deliverables</li>
                      <li>Checks off checklist items & todos</li>
                      <li>Edits assigned documentation</li>
                    </ul>
                  </div>

                  <div className="bg-white/90 p-2.5 rounded-lg border border-emerald-100">
                    <div className="font-semibold text-rose-700 flex items-center gap-1 mb-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Restrictions:</span>
                    </div>
                    <ul className="list-disc list-inside text-stone-600 text-[11px] space-y-0.5">
                      <li>Cannot delete workspace pages</li>
                      <li>Cannot access user management or promote users</li>
                      <li>Cannot reset workspace configuration</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEAM DIRECTORY & SWITCH PERSONA */}
          {activeTab === 'directory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-600">
                  Current Active Persona:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-stone-900">{currentUser.name}</span>
                  <UserRoleBadge role={currentUser.role} size="sm" />
                </div>
              </div>

              <div className="space-y-2">
                {teamMembers.map((member) => {
                  const isCurrent = member.id === currentUser.id;
                  return (
                    <div
                      key={member.id}
                      className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-stone-100/90 border-stone-400/80 shadow-2xs'
                          : 'bg-white border-stone-200/80 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-stone-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-xs">
                              {member.name}
                            </span>
                            <UserRoleBadge role={member.role} size="sm" />
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-stone-900 text-white rounded">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {member.title} • {member.department}
                          </div>
                          <div className="text-[10px] text-stone-400">
                            {member.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {/* Switch Active User button for quick testing */}
                        {!isCurrent && (
                          <button
                            type="button"
                            onClick={() => onSwitchUser(member)}
                            className="px-2.5 py-1 text-xs font-medium text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                            title={`Switch view to test as ${member.name}`}
                          >
                            <span>Test as {member.role.toUpperCase()}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {/* Promote / Change role control (Admin only) */}
                        {isAdmin && member.id !== currentUser.id && (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                            className="text-xs bg-white border border-stone-200 rounded-lg px-2 py-1 font-medium text-stone-800"
                          >
                            <option value="admin">Promote to Admin (CEO)</option>
                            <option value="hr">Set as HR Manager</option>
                            <option value="employee">Set as Employee</option>
                          </select>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ADD NEW MEMBER */}
          {activeTab === 'add' && canManageUsers && (
            <form onSubmit={handleAddMember} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jordan@acmeoffice.internal"
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Frontend Engineer / HR Coordinator"
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product Design">Product Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                    <option value="Executive Leadership">Executive Leadership</option>
                  </select>
                </div>
              </div>

              {/* Role Selection & Hierarchy Enforcement */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-2">
                  Assign User Role & Permissions *
                </label>

                <div className="space-y-2">
                  {/* Option 1: Admin */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedRole === 'admin'
                        ? 'border-purple-500 bg-purple-50/60 ring-1 ring-purple-500'
                        : 'border-stone-200 hover:bg-stone-50'
                    } ${!isAdmin ? 'opacity-60 cursor-not-allowed bg-stone-50' : ''}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      disabled={!isAdmin}
                      checked={selectedRole === 'admin'}
                      onChange={() => setSelectedRole('admin')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">Admin (CEO)</span>
                        <UserRoleBadge role="admin" size="sm" />
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Full workspace privileges. Can add & promote other Admins.
                      </p>
                      {!isAdmin && (
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                          <Lock className="w-3 h-3" />
                          <span>Restriction: Only the CEO/Admin has authority to add more Admins.</span>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* Option 2: HR */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedRole === 'hr'
                        ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="hr"
                      checked={selectedRole === 'hr'}
                      onChange={() => setSelectedRole('hr')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">HR Manager</span>
                        <UserRoleBadge role="hr" size="sm" />
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Manages all employees, assigns work, and oversees company documents.
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Employee */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedRole === 'employee'
                        ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="employee"
                      checked={selectedRole === 'employee'}
                      onChange={() => setSelectedRole('employee')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">Employee</span>
                        <UserRoleBadge role="employee" size="sm" />
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Executes assignments, updates work status, and submits progress responses.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Team Member</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>Current authority: <strong className="text-stone-800 uppercase">{currentUser.role}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
