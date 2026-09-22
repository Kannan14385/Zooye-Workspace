import React from 'react';
import { Crown, Users, Briefcase } from 'lucide-react';
import { UserRole } from '../types';

interface UserRoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({
  role,
  size = 'md',
  showLabel = true,
}) => {
  if (role === 'admin') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200/80 ${
          size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'
        }`}
        title="Admin (CEO): Top authority, can add and appoint more Admins"
      >
        <Crown className={size === 'sm' ? 'w-2.5 h-2.5 text-purple-700' : 'w-3 h-3 text-purple-700'} />
        {showLabel && <span>CEO / Admin</span>}
      </span>
    );
  }

  if (role === 'hr') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200/80 ${
          size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'
        }`}
        title="HR Manager: Manages all employees, assigns tasks, oversees workspace"
      >
        <Users className={size === 'sm' ? 'w-2.5 h-2.5 text-blue-700' : 'w-3 h-3 text-blue-700'} />
        {showLabel && <span>HR Manager</span>}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/80 ${
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'
      }`}
      title="Employee: Updates task status, registers work responses, completes deliverables"
    >
      <Briefcase className={size === 'sm' ? 'w-2.5 h-2.5 text-emerald-700' : 'w-3 h-3 text-emerald-700'} />
      {showLabel && <span>Employee</span>}
    </span>
  );
};
