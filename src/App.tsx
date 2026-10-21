/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileText, Link2, Sparkles, Upload, Download, Copy, Check, RotateCcw, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { extractCVFacts, generateMaterials, importOpportunityFromUrl } from './utils/api';
import { CareerFact, Opportunity } from './types';

type WorkflowStatus = 'idle' | 'reading' | 'analyzing' | 'optimizing' | 'complete' | 'error';

export default function App() {
  const [jobUrl, setJobUrl] = useState('');
  const [jobText, setJobText] = useState('');
  const [cvText, setCvText] = useState('');
  const [cvFilename, setCvFilename] = useState('');
  const [status, setStatus] = useState<WorkflowStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [optimizedCV, setOptimizedCV] = useState('');
  const [groundingNotes, setGroundingNotes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const busy = status === 'reading' || status === 'analyzing' || status === 'optimizing';
  const canOptimize = jobUrl.trim().length > 0 && cvText.trim().length > 0 && !busy;

  const handleCVFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setCvFilename(file.name);
    const reader = new FileReader();
    reader.onload = () => setCvText(String(reader.result || ''));
    reader.onerror = () => setError('We could not read that file. Paste your CV text instead.');
    reader.readAsText(file);
  };

  const handleOptimize = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canOptimize) return;
    setError(''); setOptimizedCV(''); setGroundingNotes([]);
    try {
      setStatus('reading'); setStatusMessage('Reading the job requirements…');
      const imported = await importOpportunityFromUrl(jobUrl.trim(), jobText.trim() || undefined);
      setOpportunity(imported.opportunity);

      setStatus('analyzing'); setStatusMessage('Extracting experience and skills from your CV…');
      const extracted = await extractCVFacts(cvText.trim(), cvFilename || 'career-profile.txt');
      const now = new Date().toISOString();
      const facts: CareerFact[] = extracted.facts.map((fact: any, index: number) => ({
        id: `provided-cv-fact-${index}`, user_id: 'current-user', fact_type: fact.fact_type || 'experience',
        title: fact.title || 'Career experience', subtitle: fact.subtitle, date_range: fact.date_range,
        description: fact.description || '', highlights: fact.highlights || [], skills: fact.skills || [],
        verification_status: 'verified', verified_at: now, confidence_score: fact.confidence_score,
        created_at: now, updated_at: now,
      }));

      setStatus('optimizing'); setStatusMessage('Tailoring your CV to the role…');
      const cvLines = cvText.trim().split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      const candidateName = cvLines[0] || 'Candidate';
      const candidateEmail = cvText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
      const generated = await generateMaterials('cv', {
        id: 'profile-current-user', user_id: 'current-user', full_name: candidateName, email: candidateEmail, location: 'Not specified',
        professional_summary: cvText.trim().slice(0, 500), career_goals: 'Secure the target opportunity.', preferred_roles: [],
        preferred_locations: [], preferred_work_arrangements: [], preferred_opportunity_types: ['Job'],
        eligibility_status: { work_authorization: [], highest_degree: 'Not specified', years_of_experience: 0, citizenship: 'Not specified', willing_to_relocate: false },
        profile_completeness: 100, created_at: now, updated_at: now,
      }, facts, imported.opportunity, 'Preserve the candidate’s name and contact details from the provided CV. Optimize relevance, ordering, wording, and ATS keyword alignment without adding unsupported claims.');

      setOptimizedCV(generated.result.content || '');
      setGroundingNotes(generated.result.missing_facts_flagged || []);
      setStatus('complete'); setStatusMessage('Your optimized CV is ready to review.');
    } catch (err: any) {
      setStatus('error'); setStatusMessage(''); setError(err.message || 'We could not optimize the CV. Check the link and try again.');
    }
  };

  const handleCopy = async () => {
    if (!optimizedCV) return;
    await navigator.clipboard.writeText(optimizedCV); setCopied(true); window.setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    const blob = new Blob([optimizedCV], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'career-pilot-optimized-cv.md'; link.click(); URL.revokeObjectURL(url);
  };

  const reset = () => {
    setJobUrl(''); setJobText(''); setCvText(''); setCvFilename(''); setStatus('idle'); setStatusMessage(''); setError(''); setOpportunity(null); setOptimizedCV(''); setGroundingNotes([]);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f8] text-slate-900">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">CP</span><div><p className="text-sm font-bold tracking-tight">Career Pilot</p><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Job-to-CV optimizer</p></div></div><div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 sm:flex"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Grounded in your CV</div></div></header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="max-w-3xl"><p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">One focused workflow</p><h1 className="max-w-2xl text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">Give us the job link. Get a sharper CV.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">Career Pilot reads the requirements in a role, compares them with the CV you provide, and returns a tailored version without inventing experience, qualifications, or results.</p></section>

        <form onSubmit={handleOptimize} className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)] sm:p-6"><div className="mb-5 flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Link2 className="h-4 w-4" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Step 01</p><h2 className="mt-1 text-base font-bold">Add the job link</h2><p className="mt-1 text-xs leading-5 text-slate-500">Use the public posting URL you want to target.</p></div></div><label className="block text-xs font-semibold text-slate-700">Job posting URL<input required type="url" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="https://company.com/careers/role" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" /></label><label className="mt-4 block text-xs font-semibold text-slate-700">Optional job text <span className="font-normal text-slate-400">(helps when a page is protected)</span><textarea value={jobText} onChange={(e) => setJobText(e.target.value)} rows={4} placeholder="Paste the requirements here if you have them…" className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white" /></label></section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.35)] sm:p-6"><div className="mb-5 flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><FileText className="h-4 w-4" /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Step 02</p><h2 className="mt-1 text-base font-bold">Provide your CV</h2><p className="mt-1 text-xs leading-5 text-slate-500">Paste it here or upload a text-based CV file.</p></div></div><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-xs font-bold text-slate-600 transition hover:border-emerald-400 hover:bg-emerald-50/40"><Upload className="h-4 w-4" /> {cvFilename || 'Upload .txt, .md, or .rtf CV'}<input type="file" accept=".txt,.md,.rtf,text/plain,text/markdown" onChange={handleCVFile} className="sr-only" /></label><div className="my-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400"><span className="h-px flex-1 bg-slate-200" /> or paste below <span className="h-px flex-1 bg-slate-200" /></div><textarea required value={cvText} onChange={(e) => { setCvText(e.target.value); setCvFilename(''); }} rows={11} placeholder="Paste the full text of your current CV…" className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:bg-white" /></section>
          </div>

          <section className="flex min-h-[420px] flex-col rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_24px_60px_-35px_rgba(15,23,42,0.7)] sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Step 03</p><h2 className="mt-1 text-xl font-bold tracking-tight">Optimize your CV</h2><p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">The output stays grounded in the information you provide.</p></div><Sparkles className="h-5 w-5 text-emerald-300" /></div>{status === 'idle' && <div className="flex flex-1 flex-col items-center justify-center py-12 text-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5"><ArrowRight className="h-7 w-7 text-emerald-300" /></div><p className="mt-5 text-sm font-semibold">Your optimized CV will appear here</p><p className="mt-2 max-w-xs text-xs leading-5 text-slate-400">Add both inputs, then let Career Pilot align your experience with the role.</p></div>}{busy && <div className="flex flex-1 flex-col items-center justify-center py-12 text-center"><div className="h-10 w-10 animate-pulse rounded-xl bg-emerald-400/20 ring-8 ring-emerald-400/5" /><p className="mt-6 text-sm font-semibold">{statusMessage}</p><p className="mt-2 text-xs text-slate-400">This can take a moment.</p></div>}{status === 'error' && <div className="flex flex-1 flex-col items-center justify-center py-12 text-center"><AlertCircle className="h-10 w-10 text-rose-300" /><p className="mt-5 text-sm font-semibold">Something needs attention</p><p className="mt-2 max-w-sm text-xs leading-5 text-slate-400">{error}</p></div>}{status === 'complete' && <div className="mt-6 flex flex-1 flex-col"><div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4"><p className="text-sm font-bold text-emerald-200">{opportunity?.title || 'Target role'}</p><p className="mt-1 text-xs text-emerald-100/70">{opportunity?.organization || 'Organization not specified'} · Tailored from your provided CV</p></div><textarea value={optimizedCV} onChange={(e) => setOptimizedCV(e.target.value)} className="mt-4 min-h-[300px] flex-1 resize-y rounded-2xl border border-white/10 bg-white/[0.06] p-4 font-mono text-xs leading-6 text-slate-200 outline-none focus:border-emerald-400/60" aria-label="Optimized CV" />{groundingNotes.length > 0 && <p className="mt-3 text-[11px] leading-5 text-amber-200/80">Review note: {groundingNotes.join(' ')}</p>}</div>}<div className="mt-6 flex flex-wrap gap-3"><button type="submit" disabled={!canOptimize} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-xs font-bold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"><Sparkles className="h-4 w-4" /> {busy ? 'Working…' : 'Optimize CV'}</button>{status === 'complete' && <><button type="button" onClick={handleCopy} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/10 active:scale-[0.98]">{copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy'}</button><button type="button" onClick={handleDownload} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"><Download className="h-4 w-4" /> Download</button></>}{(status === 'complete' || status === 'error') && <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/10"><RotateCcw className="h-4 w-4" /> Start over</button>}</div></section>
        </form>
      </main>
    </div>
  );
}
