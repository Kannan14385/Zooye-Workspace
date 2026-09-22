import React, { useState } from 'react';
import {
  Crown,
  Users,
  Briefcase,
  Lock,
  Mail,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Building2,
  Sparkles,
} from 'lucide-react';
import { WorkspaceUser, UserRole } from '../types';
import { UserRoleBadge } from './UserRoleBadge';

interface LoginModalProps {
  isOpen: boolean;
  teamMembers: WorkspaceUser[];
  currentUser?: WorkspaceUser;
  onLogin: (user: WorkspaceUser) => void;
  onRegister: (newUser: WorkspaceUser) => void;
  onClose?: () => void;
  isDismissible?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  teamMembers,
  currentUser,
  onLogin,
  onRegister,
  onClose,
  isDismissible = false,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [regDept, setRegDept] = useState('Engineering');
  const [regRole, setRegRole] = useState<UserRole>('employee');

  if (!isOpen) return null;

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = teamMembers.find(
      (m) => m.email.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (!user) {
      setError('No user account found matching this email address.');
      return;
    }

    // Check password if configured on user
    if (user.password && password && user.password !== password.trim()) {
      setError('Incorrect password. For testing, passwords are "ceo123", "hr123", or "emp123".');
      return;
    }

    onLogin(user);
  };

  const handleQuickLogin = (user: WorkspaceUser) => {
    setError(null);
    onLogin(user);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    // Check if email already exists
    if (teamMembers.some((m) => m.email.toLowerCase() === regEmail.toLowerCase().trim())) {
      setError('An account with this email address already exists. Please sign in instead.');
      return;
    }

    // Role safety: Only employee or HR allowed through public registration
    if (regRole === 'admin') {
      setError('RESTRICTION ENFORCED: Admins cannot be self-registered. Only the CEO can appoint more Admins!');
      return;
    }

    const newUser: WorkspaceUser = {
      id: 'user-' + Date.now(),
      name: regName.trim(),
      email: regEmail.toLowerCase().trim(),
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=120&auto=format&fit=crop&q=80`,
      role: regRole,
      title: regTitle.trim() || (regRole === 'hr' ? 'HR Specialist' : 'Software Engineer'),
      department: regDept,
      password: regPassword.trim(),
    };

    onRegister(newUser);
    setSuccessMsg(`Account created for ${newUser.name}! Signing you in...`);
    setTimeout(() => {
      onLogin(newUser);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-stone-900 text-stone-100 p-6 sm:p-7 relative">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Building2 className="w-4 h-4" />
            <span>Acme Corporation Workspace Portal</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {mode === 'login' ? 'Individual User Sign In' : 'Register New Workspace Account'}
          </h2>
          <p className="text-stone-300 text-xs leading-relaxed mt-1">
            Access your personalized workspace dashboard with role-based permissions and persistent data storage.
          </p>

          {isDismissible && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="flex border-b border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'border-stone-900 text-stone-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Your Account</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'border-stone-900 text-stone-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>

        {/* Current Active Session indicator if present */}
        {currentUser && (
          <div className="bg-stone-100/70 px-6 py-2.5 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-stone-300"
              />
              <span className="text-stone-500">Currently active:</span>
              <strong className="text-stone-900">{currentUser.name}</strong>
              <UserRoleBadge role={currentUser.role} size="sm" />
            </div>
            <span className="text-[11px] text-stone-400 hidden sm:inline">
              Sign in below to switch accounts
            </span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            <div className="space-y-6">
              {/* Quick Persona 1-Click Login Cards */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Quick Select User (1-Click Login):
                  </span>
                  <span className="text-[11px] text-stone-400">Individual credentials pre-loaded</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {teamMembers.slice(0, 4).map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleQuickLogin(member)}
                      className="p-3 rounded-xl border border-stone-200 hover:border-stone-400 bg-stone-50/70 hover:bg-stone-100 text-left transition-all group flex items-start gap-3"
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white shrink-0 mt-0.5"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-stone-900 group-hover:text-black truncate">
                            {member.name}
                          </span>
                          <UserRoleBadge role={member.role} size="sm" />
                        </div>
                        <div className="text-[11px] text-stone-500 truncate mt-0.5">
                          {member.title}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono truncate mt-0.5">
                          🔑 pass: {member.password || 'emp123'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Standard Email & Password Form */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-stone-400 font-medium">Or enter credentials</span>
                </div>
              </div>

              <form onSubmit={handleStandardLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Corporate Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. alex.emp@acmeoffice.internal"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password (e.g. emp123, hr123, ceo123)"
                      className="w-full pl-9 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In & Open Individual Dashboard</span>
                </button>
              </form>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Jordan Lee"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Company Email</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="jordan.emp@acmeoffice.internal"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={regTitle}
                    onChange={(e) => setRegTitle(e.target.value)}
                    placeholder="Senior Frontend Developer"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Department</label>
                  <select
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product Design">Product Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Account Password</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Set account password"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Assign Initial Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('employee')}
                    className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${
                      regRole === 'employee'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-stone-200 bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-0.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Employee</span>
                    </div>
                    <p className="text-[10px] text-stone-500 font-normal">
                      Updates status & executes work
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('hr')}
                    className={`p-2.5 rounded-lg border text-left text-xs font-semibold transition-all ${
                      regRole === 'hr'
                        ? 'border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-500'
                        : 'border-stone-200 bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-0.5">
                      <Users className="w-3.5 h-3.5 text-blue-700" />
                      <span>HR Manager</span>
                    </div>
                    <p className="text-[10px] text-stone-500 font-normal">
                      Manages all employees & assignments
                    </p>
                  </button>
                </div>

                <div className="mt-2 p-2 bg-purple-50/70 border border-purple-200 rounded-lg text-[11px] text-purple-900 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <span>
                    <strong>Admin Role Restriction:</strong> Only the CEO can appoint Admins after login.
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account & Log In</span>
              </button>
            </form>
          )}

          {/* Hierarchy Rule Legend */}
          <div className="pt-4 border-t border-stone-100 text-[11px] text-stone-500 space-y-1">
            <div className="font-semibold text-stone-700">Workspace Role Matrix:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <span className="p-1.5 rounded bg-purple-50 text-purple-800 font-medium">
                👑 <strong>Admin (CEO):</strong> Can add more Admins
              </span>
              <span className="p-1.5 rounded bg-blue-50 text-blue-800 font-medium">
                👥 <strong>HR Manager:</strong> Manages all employees
              </span>
              <span className="p-1.5 rounded bg-emerald-50 text-emerald-800 font-medium">
                💼 <strong>Employee:</strong> Updates status
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
