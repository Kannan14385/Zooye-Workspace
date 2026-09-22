import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Sun,
  Moon,
} from 'lucide-react';
import { WorkspaceUser, UserRole } from '../types';

interface UniversalLoginPageProps {
  teamMembers: WorkspaceUser[];
  pendingRegistrationEmails?: string[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLoginSuccess: (user: WorkspaceUser) => void;
  onRegisterUser: (newUser: WorkspaceUser) => void;
}

interface RoleOption {
  role: UserRole;
  title: string;
  badgeLabel: string;
  icon: string;
  defaultEmail: string;
  defaultUsername: string;
  demoPassword: string;
  description: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'admin',
    title: 'CEO / Admin',
    badgeLabel: 'Executive & Admin',
    icon: '👑',
    defaultEmail: 'elena.ceo@acmeoffice.internal',
    defaultUsername: 'elena.ceo',
    demoPassword: 'ceo123',
    description: 'Chief Executive Officer with full workspace oversight and authority',
  },
  {
    role: 'hr',
    title: 'HR Manager',
    badgeLabel: 'Head of People',
    icon: '👥',
    defaultEmail: 'david.hr@acmeoffice.internal',
    defaultUsername: 'david.hr',
    demoPassword: 'hr123',
    description: 'Head of People & HR managing team status, assignments and personnel',
  },
  {
    role: 'employee',
    title: 'Employee',
    badgeLabel: 'Team Member',
    icon: '💼',
    defaultEmail: 'alex.emp@acmeoffice.internal',
    defaultUsername: 'alex.emp',
    demoPassword: 'emp123',
    description: 'Individual contributor updating assigned tasks, deliverables and progress',
  },
];

export const UniversalLoginPage: React.FC<UniversalLoginPageProps> = ({
  teamMembers,
  pendingRegistrationEmails = [],
  theme,
  onToggleTheme,
  onLoginSuccess,
  onRegisterUser,
}) => {
  // Mode: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // User Role Radio Button selection (defaults to 'admin')
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  // Username and password inputs
  const [usernameInput, setUsernameInput] = useState<string>('elena.ceo@acmeoffice.internal');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New user registration fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regBloodGroup, setRegBloodGroup] = useState('');
  const [regAadhaar, setRegAadhaar] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [regRole, setRegRole] = useState<UserRole>('employee');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  const currentRoleConfig = ROLE_OPTIONS.find((r) => r.role === selectedRole) || ROLE_OPTIONS[0];

  // Handle User Role Radio selection
  const handleSelectRoleRadio = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg(null);
    const roleOpt = ROLE_OPTIONS.find((r) => r.role === role);
    if (roleOpt) {
      setUsernameInput(roleOpt.defaultEmail);
      setPasswordInput(''); // Prompt for password entry
    }
  };

  // Quick autofill helper for rapid testing
  const handleAutofillCredentials = () => {
    setUsernameInput(currentRoleConfig.defaultEmail);
    setPasswordInput(currentRoleConfig.demoPassword);
    setErrorMsg(null);
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const enteredUsername = usernameInput.trim().toLowerCase();
    const enteredPassword = passwordInput.trim();

    if (!enteredUsername) {
      setErrorMsg('Please enter your username or email address.');
      return;
    }

    if (!enteredPassword) {
      setErrorMsg('Please enter your password to open your home page.');
      return;
    }

    // Find users with the selected role
    const usersWithRole = teamMembers.filter((u) => u.role === selectedRole);

    // Try finding exact match by email, username prefix, or name
    let matchedUser = usersWithRole.find(
      (u) =>
        u.email.toLowerCase() === enteredUsername ||
        u.name.toLowerCase() === enteredUsername ||
        u.email.toLowerCase().split('@')[0] === enteredUsername
    );

    // If user entered a username that belongs to a different role, provide friendly guidance
    if (!matchedUser) {
      const userUnderOtherRole = teamMembers.find(
        (u) =>
          u.email.toLowerCase() === enteredUsername ||
          u.name.toLowerCase() === enteredUsername ||
          u.email.toLowerCase().split('@')[0] === enteredUsername
      );

      if (userUnderOtherRole) {
        const correctRoleOpt = ROLE_OPTIONS.find((r) => r.role === userUnderOtherRole.role);
        setErrorMsg(
          `User "${userUnderOtherRole.name}" is registered as "${correctRoleOpt?.title || userUnderOtherRole.role}". Please select the "${correctRoleOpt?.title}" radio button.`
        );
        return;
      }

      // If user typed custom username, match any user in that role
      if (usersWithRole.length > 0) {
        matchedUser = usersWithRole[0];
      }
    }

    if (!matchedUser) {
      setErrorMsg(`No active workspace account found for role "${currentRoleConfig.title}".`);
      return;
    }

    // Verify password
    const expectedPassword = matchedUser.password || currentRoleConfig.demoPassword;
    if (enteredPassword !== expectedPassword) {
      setErrorMsg('Incorrect email or password. Please check your credentials and try again.');
      return;
    }

    // Success! Redirect to Home Page
    onLoginSuccess(matchedUser);
  };

  // Submit Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regTitle.trim() || !regDob || !regBloodGroup || !regAadhaar.trim()) {
      setRegError('Name, email, password, position, date of birth, blood group, and Aadhaar number are required.');
      return;
    }

    if (!emailVerified || otp !== generatedOtp) {
      setRegError('Verify your email with the OTP before submitting the onboarding request.');
      return;
    }

    // Enforce role hierarchy restriction: Admins cannot self-register
    if (regRole === 'admin') {
      setRegError('RESTRICTION ENFORCED: Admins cannot be self-registered. Only the CEO can appoint more Admins!');
      return;
    }

    if (teamMembers.some((m) => m.email.toLowerCase() === regEmail.toLowerCase().trim())) {
      setRegError('An account with this email address already exists. Please select its role and sign in.');
      return;
    }

    const newUser: WorkspaceUser = {
      id: 'user-' + Date.now(),
      name: regName.trim(),
      email: regEmail.toLowerCase().trim(),
      avatar: '',
      role: regRole,
      title: regTitle.trim() || (regRole === 'hr' ? 'HR Specialist' : 'Software Engineer'),
      department: 'WordPress Delivery',
      password: regPassword.trim(),
      dateOfBirth: regDob,
      bloodGroup: regBloodGroup,
      aadhaarNumber: regAadhaar.trim(),
      phone: regPhone.trim(),
      address: regAddress.trim(),
    };

    onRegisterUser(newUser);
    setRegSuccess('Your application was submitted. The admin must approve it before your account can sign in.');
  };

  const handleSendOtp = () => {
    const normalizedEmail = regEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setRegError('Enter a valid email address before requesting an OTP.');
      return;
    }
    if (teamMembers.some((member) => member.email.toLowerCase() === normalizedEmail) || pendingRegistrationEmails.includes(normalizedEmail)) {
      setRegError('This email already belongs to an active account. Each employee must use one unique email.');
      return;
    }
    const nextOtp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(nextOtp);
    setOtpSent(true);
    setEmailVerified(false);
    setRegError(`OTP sent to ${normalizedEmail}. Demo OTP: ${nextOtp}`);
  };

  const handleVerifyOtp = () => {
    if (!otpSent || otp.trim() !== generatedOtp) {
      setRegError('The OTP is incorrect or expired. Request a new OTP and try again.');
      return;
    }
    setEmailVerified(true);
    setRegError(null);
  };

  return (
    <div className={`theme-${theme} min-h-screen w-full bg-stone-950 text-stone-100 flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans selection:bg-amber-400 selection:text-stone-900`}>
      {/* Top Header Branding */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-2 border-b border-stone-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-xl shadow-md">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                Zooye Info Technologies
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-stone-800 text-amber-400 px-2 py-0.5 rounded-full border border-stone-700">
                Employee Operations Portal
              </span>
            </div>
            <p className="text-xs text-stone-400">Secure Workforce Login & Identity Gateway</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={onToggleTheme} className="rounded-lg border border-stone-700 p-2 text-stone-300 hover:bg-stone-800" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className="hidden items-center gap-2 text-xs text-stone-400 sm:flex">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Role Hierarchy & RBAC Enforced</span>
          </div>
        </div>
      </header>

      {/* Main Login Screen Container */}
      <main className="max-w-2xl w-full mx-auto my-auto py-8">
        <div className="bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Banner */}
          <div className="p-6 sm:p-7 bg-gradient-to-b from-stone-800/90 to-stone-900 border-b border-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>Universal Workspace Login</span>
                  <Sparkles className="w-5 h-5 text-amber-400" />
                </h1>
                <p className="text-xs sm:text-sm text-stone-400 mt-1">
                  Select your user role radio button, enter credentials, and open your Home Page.
                </p>
              </div>

              {/* Mode Tabs */}
              <div className="flex p-1 bg-stone-950 rounded-xl border border-stone-800 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg(null);
                    setRegSuccess(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'login'
                      ? 'bg-amber-400 text-stone-950 shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Role Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setRegError(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'register'
                      ? 'bg-amber-400 text-stone-950 shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Onboard User</span>
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* TAB 1: USER ROLE RADIO SELECTION & CREDENTIALS FORM            */}
          {/* ============================================================== */}
          {activeTab === 'login' ? (
            <div className="p-6 sm:p-7 space-y-6">
              {errorMsg && (
                <div className="p-3.5 bg-rose-950/70 border border-rose-600/80 rounded-xl text-xs text-rose-200 flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Step 1: User Role Radio Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Select User Role (Radio Selection)</span>
                  </label>
                  <span className="text-[11px] text-stone-400">
                    Choose role to target
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ROLE_OPTIONS.map((opt) => {
                    const isSelected = selectedRole === opt.role;

                    return (
                      <label
                        key={opt.role}
                        onClick={() => handleSelectRoleRadio(opt.role)}
                        className={`relative flex flex-col justify-between p-4 rounded-2xl border cursor-pointer transition-all select-none ${
                          isSelected
                            ? 'bg-stone-800 border-amber-400 ring-2 ring-amber-400/40 shadow-md'
                            : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 hover:bg-stone-800/50 text-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-2xl">{opt.icon}</span>
                          <input
                            type="radio"
                            name="userRoleSelection"
                            value={opt.role}
                            checked={isSelected}
                            onChange={() => handleSelectRoleRadio(opt.role)}
                            className="w-4 h-4 text-amber-400 bg-stone-900 border-stone-600 focus:ring-amber-400"
                          />
                        </div>

                        <div>
                          <div className="font-bold text-sm text-white">
                            {opt.title}
                          </div>
                          <div className="text-[10px] text-amber-300/80 font-medium mt-0.5">
                            {opt.badgeLabel}
                          </div>
                          <p className="text-[11px] text-stone-400 mt-1 leading-snug line-clamp-2">
                            {opt.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Username & Password Entry Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4 pt-3 border-t border-stone-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Enter Username & Password</span>
                  </label>

                  {/* Autofill helper button */}
                  <button
                    type="button"
                    onClick={handleAutofillCredentials}
                    className="text-[11px] text-amber-300 hover:text-amber-200 underline font-semibold flex items-center gap-1"
                  >
                    <span>Autofill {currentRoleConfig.title} credentials</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Username Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-300">
                      Username / Email Address:
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder={`e.g. ${currentRoleConfig.defaultEmail}`}
                        className="w-full pl-10 pr-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-stone-300">
                        Password:
                      </label>
                      <span className="text-[11px] text-stone-400">
                        Use your account password
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Enter password..."
                        className="w-full pl-10 pr-10 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                        title={showPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-stone-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Opens <strong className="text-white">Home Page</strong> with direct dashboard redirect.
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] shrink-0"
                  >
                    <span>Log In to Home Page</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ============================================================== */
            /* TAB 2: USER REGISTRATION / ONBOARDING                         */
            /* ============================================================== */
            <div className="p-6 sm:p-7 space-y-5">
              {regError && (
                <div className="p-3.5 bg-rose-950/70 border border-rose-600/80 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}
              {regSuccess && (
                <div className="flex items-start gap-2.5 rounded-xl border border-emerald-600/80 bg-emerald-950/70 p-3.5 text-xs text-emerald-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-300">
                      Full Name:
                    </label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Rachel Adams"
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-300">
                      Company Email:
                    </label>
                    <div className="flex gap-2">
                      <input type="email" value={regEmail} onChange={(e) => { setRegEmail(e.target.value); setEmailVerified(false); }} placeholder="rachel@zooye.in" className="min-w-0 flex-1 rounded-xl border border-stone-700 bg-stone-950 px-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 sm:text-sm" required />
                      <button type="button" onClick={handleSendOtp} className="shrink-0 rounded-xl bg-stone-700 px-3 py-2 text-[11px] font-bold text-white hover:bg-stone-600">Send OTP</button>
                    </div>
                    {emailVerified && <p className="text-[11px] font-semibold text-emerald-400">Email verified and available.</p>}
                  </div>
                </div>

                {otpSent && !emailVerified && <div className="rounded-xl border border-amber-500/40 bg-amber-400/10 p-3"><label className="mb-1 block text-xs font-semibold text-amber-200">Enter email OTP</label><div className="flex gap-2"><input value={otp} onChange={(event) => setOtp(event.target.value)} inputMode="numeric" maxLength={6} placeholder="6-digit OTP" className="min-w-0 flex-1 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white" /><button type="button" onClick={handleVerifyOtp} className="rounded-lg bg-amber-400 px-3 py-2 text-xs font-bold text-stone-950">Verify</button></div></div>}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-300">
                      Role Selection (Radio):
                    </label>
                    <div className="flex gap-4 p-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer text-stone-300">
                        <input
                          type="radio"
                          name="regRole"
                          value="employee"
                          checked={regRole === 'employee'}
                          onChange={() => setRegRole('employee')}
                          className="text-amber-400"
                        />
                        <span>Employee</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-stone-300">
                        <input
                          type="radio"
                          name="regRole"
                          value="hr"
                          checked={regRole === 'hr'}
                          onChange={() => setRegRole('hr')}
                          className="text-amber-400"
                        />
                        <span>HR Manager</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-300">
                      Password:
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Create password..."
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-stone-300">
                      Position:
                    </label>
                    <input
                      type="text"
                      value={regTitle}
                      onChange={(e) => setRegTitle(e.target.value)}
                      placeholder="e.g. WordPress Developer"
                      className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div><label className="mb-1 block text-xs font-semibold text-stone-300">Date of birth</label><input type="date" value={regDob} onChange={(event) => setRegDob(event.target.value)} className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2.5 text-xs text-white" required /></div>
                  <div><label className="mb-1 block text-xs font-semibold text-stone-300">Blood group</label><select value={regBloodGroup} onChange={(event) => setRegBloodGroup(event.target.value)} className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2.5 text-xs text-white" required><option value="">Select</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((group) => <option key={group}>{group}</option>)}</select></div>
                  <div><label className="mb-1 block text-xs font-semibold text-stone-300">Aadhaar number</label><input value={regAadhaar} onChange={(event) => setRegAadhaar(event.target.value)} inputMode="numeric" maxLength={12} placeholder="12 digits" className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2.5 text-xs text-white" required /></div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><label className="mb-1 block text-xs font-semibold text-stone-300">Phone number</label><input value={regPhone} onChange={(event) => setRegPhone(event.target.value)} placeholder="Optional" className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2.5 text-xs text-white" /></div><div><label className="mb-1 block text-xs font-semibold text-stone-300">Address</label><input value={regAddress} onChange={(event) => setRegAddress(event.target.value)} placeholder="Optional address" className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2.5 text-xs text-white" /></div></div>

                {/* CEO Protection Warning Banner */}
                <div className="p-3 bg-purple-950/60 border border-purple-800/80 rounded-xl text-xs text-purple-200 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Role Policy:</strong> Only the CEO can appoint and onboard additional Admins.
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="px-4 py-2 text-stone-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Submit for Admin Approval</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-4xl w-full mx-auto text-center text-xs text-stone-500 py-2 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Zooye Info Technologies • WordPress Delivery Workspace</span>
        <span>Default credentials: CEO (`ceo123`), HR (`hr123`), Employee (`emp123`)</span>
      </footer>
    </div>
  );
};
