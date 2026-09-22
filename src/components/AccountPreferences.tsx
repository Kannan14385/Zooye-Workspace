import React, { useState } from 'react';
import { Camera, LockKeyhole, Save, UserRound } from 'lucide-react';
import { WorkspaceUser } from '../types';

interface AccountPreferencesProps {
  currentUser: WorkspaceUser;
  onSave: (update: Partial<WorkspaceUser>) => void;
  onRequestCredentials: () => void;
}

export const AccountPreferences: React.FC<AccountPreferencesProps> = ({ currentUser, onSave, onRequestCredentials }) => {
  const [name, setName] = useState(currentUser.name);
  const [title, setTitle] = useState(currentUser.title);
  const [dateOfBirth, setDateOfBirth] = useState(currentUser.dateOfBirth || '');
  const [bloodGroup, setBloodGroup] = useState(currentUser.bloodGroup || '');
  const [aadhaarNumber, setAadhaarNumber] = useState(currentUser.aadhaarNumber || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [address, setAddress] = useState(currentUser.address || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [saved, setSaved] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave({ name: name.trim(), title: title.trim(), dateOfBirth, bloodGroup, aadhaarNumber: aadhaarNumber.trim(), phone: phone.trim(), address: address.trim(), avatar });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const initials = currentUser.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <section className="mx-auto max-w-3xl py-8">
      <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Account preferences</p><h2 className="mt-2 text-2xl font-bold text-stone-900">Your personal profile</h2><p className="mt-1 text-sm text-stone-500">Edit your personal information and upload your own profile photo. Email and password changes require admin approval.</p></div>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-center"><div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-100 text-xl font-bold text-blue-700">{avatar ? <img src={avatar} alt="Your profile" className="h-full w-full object-cover" /> : initials || <UserRound className="h-8 w-8" />}</div><div><p className="text-sm font-semibold text-stone-900">Profile photo</p><p className="mt-1 text-xs text-stone-500">Upload your own JPG, PNG, or WEBP image.</p><label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold text-white hover:bg-stone-700"><Camera className="h-3.5 w-3.5" /> Choose image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageUpload} className="sr-only" /></label></div></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Full name"><input value={name} onChange={(event) => setName(event.target.value)} className="form-input" required /></Field><Field label="Position"><input value={title} onChange={(event) => setTitle(event.target.value)} className="form-input" required /></Field><Field label="Date of birth"><input type="date" value={dateOfBirth} onChange={(event) => setDateOfBirth(event.target.value)} className="form-input" /></Field><Field label="Blood group"><select value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value)} className="form-input"><option value="">Not specified</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((group) => <option key={group}>{group}</option>)}</select></Field><Field label="Aadhaar number"><input value={aadhaarNumber} onChange={(event) => setAadhaarNumber(event.target.value)} className="form-input" maxLength={12} /></Field><Field label="Phone number"><input value={phone} onChange={(event) => setPhone(event.target.value)} className="form-input" /></Field></div>
        <Field label="Address"><textarea value={address} onChange={(event) => setAddress(event.target.value)} className="form-input min-h-24 resize-y" /></Field>
        <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-stone-200 bg-stone-50 p-4"><div className="flex items-center gap-2 text-xs font-semibold text-stone-800"><LockKeyhole className="h-4 w-4 text-amber-600" /> Email</div><p className="mt-2 break-all text-sm text-stone-600">{currentUser.email}</p><p className="mt-1 text-[11px] text-stone-500">Only the admin can change this.</p></div><div className="rounded-xl border border-stone-200 bg-stone-50 p-4"><div className="flex items-center gap-2 text-xs font-semibold text-stone-800"><LockKeyhole className="h-4 w-4 text-amber-600" /> Password</div><p className="mt-2 text-sm text-stone-600">Managed by admin approval</p><button type="button" onClick={onRequestCredentials} className="mt-1 text-[11px] font-semibold text-blue-700 hover:underline">Request a change</button></div></div>
        <div className="flex items-center justify-end gap-3"><span className="text-xs font-semibold text-emerald-700">{saved ? 'Profile saved' : ''}</span><button type="submit" className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"><Save className="h-4 w-4" /> Save preferences</button></div>
      </form>
    </section>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => <label className="block space-y-1.5"><span className="text-xs font-semibold text-stone-700">{label}</span>{children}</label>;
