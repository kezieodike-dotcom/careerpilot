/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, UserRound, ArrowRight } from 'lucide-react';
import { Profile } from '../types';

interface CreateProfileModalProps {
  profile: Profile;
  onCreate: (profile: Profile) => void;
  onClose: () => void;
  welcome?: boolean;
}

export const CreateProfileModal: React.FC<CreateProfileModalProps> = ({ profile, onCreate, onClose, welcome = false }) => {
  const [name, setName] = useState(profile.full_name === 'Chikezie Onyiaodike' ? '' : profile.full_name);
  const [email, setEmail] = useState(profile.email === 'elena.rostova@example.com' ? '' : profile.email);
  const [location, setLocation] = useState('');
  const [goals, setGoals] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Add your full name to create your profile.');
      return;
    }

    onCreate({
      ...profile,
      id: profile.id || `profile-${Date.now()}`,
      full_name: name.trim(),
      email: email.trim() || profile.email,
      location: location.trim() || profile.location,
      career_goals: goals.trim() || profile.career_goals,
      profile_completeness: Math.max(20, profile.full_name === 'Chikezie Onyiaodike' ? 20 : profile.profile_completeness),
      updated_at: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-0 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="create-profile-title">
      <div className={`w-full max-w-xl overflow-hidden border border-white/70 bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.45)] ${welcome ? 'rounded-[2rem]' : 'rounded-t-[2rem] sm:rounded-[2rem]'}`}>
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 sm:px-8">
          <div className="flex gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><UserRound className="h-5 w-5" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">{welcome ? 'Welcome to Career Pilot' : 'New workspace'}</p><h2 id="create-profile-title" className="mt-1 text-xl font-bold tracking-tight text-slate-950">{welcome ? 'Let’s build your profile' : 'Create your career profile'}</h2><p className="mt-1 text-xs text-slate-500">{welcome ? 'Your workspace starts with your details. No other profiles are shown.' : 'Start with the details you want the agent to use.'}</p></div></div>
          {!welcome && <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Close profile creation"><X className="h-4 w-4" /></button>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-xs font-semibold text-slate-700">Full name <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Chikezie Onyiaodike" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white" /></label>
            <label className="space-y-2 text-xs font-semibold text-slate-700">Email <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white" /></label>
          </div>
          <label className="block space-y-2 text-xs font-semibold text-slate-700">Location <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lagos, Nigeria or Remote" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white" /></label>
          <label className="block space-y-2 text-xs font-semibold text-slate-700">What are you working toward? <textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows={3} placeholder="e.g. Find a product design role or a funded fellowship." className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white" /></label>
          {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700" role="alert">{error}</p>}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">{!welcome && <button type="button" onClick={onClose} className="rounded-xl px-4 py-3 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">Cancel</button>}<button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white transition hover:bg-emerald-700 active:scale-[0.98]">{welcome ? 'Enter Career Pilot' : 'Create profile'} <ArrowRight className="h-4 w-4" /></button></div>
        </form>
      </div>
    </div>
  );
};
