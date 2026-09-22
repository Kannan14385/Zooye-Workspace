import React from 'react';
import { Bot, FolderKanban, Inbox, LayoutDashboard, Settings, Users, X } from 'lucide-react';

interface WorkspaceOffcanvasProps {
  isOpen: boolean;
  activeSection: string;
  canManage: boolean;
  onClose: () => void;
  onSelect: (section: string) => void;
}

export const WorkspaceOffcanvas: React.FC<WorkspaceOffcanvasProps> = ({
  isOpen,
  activeSection,
  canManage,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban, restricted: !canManage },
    { id: 'tasks', label: 'Daily Tasks', icon: Inbox, restricted: !canManage },
    { id: 'users', label: 'Users', icon: Users, restricted: !canManage },
    { id: 'thozha', label: 'Thozha Assistant', icon: Bot },
  ];

  return (
    <div className="fixed inset-0 z-40 bg-stone-950/30" onClick={onClose}>
      <aside className="flex h-full w-72 flex-col bg-stone-950 p-4 text-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Zooye</p>
            <p className="text-sm font-bold">Workspace sections</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-white" title="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="mt-5 space-y-1">
          {sections.map(({ id, label, icon: Icon, restricted }) => (
            <button key={id} type="button" disabled={restricted} onClick={() => { onSelect(id); onClose(); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${activeSection === id ? 'bg-amber-400 text-stone-950' : restricted ? 'cursor-not-allowed text-stone-600' : 'text-stone-300 hover:bg-stone-800 hover:text-white'}`}>
              <Icon className="h-4 w-4" /> {label}
              {restricted && <span className="ml-auto text-[10px]">Restricted</span>}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-stone-800 pt-4">
          <button type="button" onClick={() => { onSelect('settings'); onClose(); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${activeSection === 'settings' ? 'bg-stone-800 text-white' : 'text-stone-400 hover:bg-stone-800 hover:text-white'}`}><Settings className="h-4 w-4" /> Account settings</button>
        </div>
      </aside>
    </div>
  );
};
