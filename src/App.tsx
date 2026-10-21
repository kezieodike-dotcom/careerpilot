/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clipboard,
  Download,
  FileText,
  Link2,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import { extractCVFacts, generateMaterials, importOpportunityFromUrl } from './utils/api';
import { CareerFact, Opportunity } from './types';

type WorkflowStatus = 'idle' | 'reading' | 'analyzing' | 'optimizing' | 'complete' | 'error';

const draftKey = 'career-pilot-workflow-draft';

function getDraft() {
  try {
    const saved = localStorage.getItem(draftKey);
    return saved ? JSON.parse(saved) : { jobUrl: '', jobText: '', cvText: '', cvFilename: '' };
  } catch {
    return { jobUrl: '', jobText: '', cvText: '', cvFilename: '' };
  }
}

function stepNumber(status: WorkflowStatus) {
  if (status === 'reading') return 1;
  if (status === 'analyzing') return 2;
  if (status === 'optimizing' || status === 'complete') return 3;
  return 0;
}

function StepRail({ status }: { status: WorkflowStatus }) {
  const activeStep = stepNumber(status);
  const steps = [
    ['01', 'Job link', 'Tell us which role you want.'],
    ['02', 'Your CV', 'Use the CV you already have.'],
    ['03', 'Optimized CV', 'Review, edit, and download.'],
  ];

  return (
    <div className="grid gap-2 border-y border-slate-200 py-4 sm:grid-cols-3 sm:gap-0">
      {steps.map(([number, title, description], index) => {
        const done = status === 'complete' || activeStep > index + 1;
        const active = activeStep === index + 1 || (status === 'idle' && index === 0);
        return (
          <div key={number} className="flex items-center gap-3 sm:px-4 first:sm:pl-0 last:sm:pr-0">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${done ? 'bg-emerald-100 text-emerald-800' : active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
              {done ? <Check className="h-4 w-4" /> : number}
            </span>
            <div className="min-w-0">
              <p className={`text-xs font-bold ${active || done ? 'text-slate-900' : 'text-slate-400'}`}>{title}</p>
              <p className="truncate text-[11px] text-slate-400">{description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return <span className="flex items-center justify-between gap-3 text-xs font-bold text-slate-700"><span>{children}</span>{hint && <span className="font-normal text-slate-400">{hint}</span>}</span>;
}

export default function App() {
  const draft = useMemo(getDraft, []);
  const [jobUrl, setJobUrl] = useState(draft.jobUrl);
  const [jobText, setJobText] = useState(draft.jobText);
  const [cvText, setCvText] = useState(draft.cvText);
  const [cvFilename, setCvFilename] = useState(draft.cvFilename);
  const [status, setStatus] = useState<WorkflowStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [optimizedCV, setOptimizedCV] = useState('');
  const [groundingNotes, setGroundingNotes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [fileError, setFileError] = useState('');

  const busy = status === 'reading' || status === 'analyzing' || status === 'optimizing';
  const canOptimize = jobUrl.trim().length > 0 && cvText.trim().length > 0 && !busy;

  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ jobUrl, jobText, cvText, cvFilename }));
    } catch {
      // Draft persistence is helpful, but never blocks the workflow.
    }
  }, [jobUrl, jobText, cvText, cvFilename]);

  const handleCVFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileError('');
    if (file.size > 5 * 1024 * 1024) {
      setFileError('That file is larger than 5 MB. Paste the text or choose a smaller file.');
      event.target.value = '';
      return;
    }
    if (!/\.(txt|md|rtf)$/i.test(file.name)) {
      setFileError('For the most reliable extraction, upload a text-based CV (.txt, .md, or .rtf).');
      event.target.value = '';
      return;
    }
    setCvFilename(file.name);
    const reader = new FileReader();
    reader.onload = () => setCvText(String(reader.result || ''));
    reader.onerror = () => setFileError('We could not read that file. Paste your CV text instead.');
    reader.readAsText(file);
  };

  const handleOptimize = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canOptimize) return;
    setError(''); setFileError(''); setOptimizedCV(''); setGroundingNotes([]);
    try {
      setStatus('reading'); setStatusMessage('Reading the role requirements');
      const imported = await importOpportunityFromUrl(jobUrl.trim(), jobText.trim() || undefined);
      setOpportunity(imported.opportunity);

      setStatus('analyzing'); setStatusMessage('Finding the strongest evidence in your CV');
      const extracted = await extractCVFacts(cvText.trim(), cvFilename || 'career-profile.txt');
      const now = new Date().toISOString();
      const facts: CareerFact[] = extracted.facts.map((fact: any, index: number) => ({
        id: `provided-cv-fact-${index}`, user_id: 'current-user', fact_type: fact.fact_type || 'experience',
        title: fact.title || 'Career experience', subtitle: fact.subtitle, date_range: fact.date_range,
        description: fact.description || '', highlights: fact.highlights || [], skills: fact.skills || [],
        verification_status: 'verified', verified_at: now, confidence_score: fact.confidence_score,
        created_at: now, updated_at: now,
      }));

      setStatus('optimizing'); setStatusMessage('Reordering and sharpening your CV for this role');
      const cvLines = cvText.trim().split(/\r?\n/).map((line: string) => line.trim()).filter(Boolean);
      const candidateName = cvLines[0] || 'Candidate';
      const candidateEmail = cvText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
      const generated = await generateMaterials('cv', {
        id: 'profile-current-user', user_id: 'current-user', full_name: candidateName, email: candidateEmail,
        location: 'Not specified', professional_summary: cvText.trim().slice(0, 500),
        career_goals: 'Secure the target opportunity.', preferred_roles: [], preferred_locations: [],
        preferred_work_arrangements: [], preferred_opportunity_types: ['Job'],
        eligibility_status: { work_authorization: [], highest_degree: 'Not specified', years_of_experience: 0, citizenship: 'Not specified', willing_to_relocate: false },
        profile_completeness: 100, created_at: now, updated_at: now,
      }, facts, imported.opportunity, 'Preserve the candidate’s name and contact details. Improve relevance, ordering, wording, and ATS keyword alignment without adding unsupported claims.');

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
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = 'career-pilot-optimized-cv.md'; link.click(); URL.revokeObjectURL(url);
  };

  const reset = () => {
    setStatus('idle'); setStatusMessage(''); setError(''); setOpportunity(null); setOptimizedCV(''); setGroundingNotes([]); setCopied(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f8] text-slate-900">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6"><a href="/" className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label="Career Pilot home"><img src="/career-pilot-logo.svg" alt="Career Pilot" className="h-10 w-auto" /></a><div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 sm:flex"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Built around your real experience</div></div></header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end"><section><p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">Job-to-CV optimizer</p><h1 className="max-w-xl text-3xl font-bold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-5xl">Make the right experience impossible to miss.</h1><p className="mt-5 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">Paste a job link, add the CV you already use, and get a role-specific version that stays faithful to your experience.</p><div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500"><span className="inline-flex items-center gap-2"><LockKeyhole className="h-3.5 w-3.5 text-emerald-700" /> No invented claims</span><span className="inline-flex items-center gap-2"><Clipboard className="h-3.5 w-3.5 text-emerald-700" /> Editable output</span></div></section><StepRail status={status} /></div>

        <form onSubmit={handleOptimize} className="mt-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-6">
            <section className="border-t-2 border-slate-900 pt-4"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Step 01</p><h2 className="mt-2 text-xl font-bold tracking-tight">Target a role</h2></div><Link2 className="h-5 w-5 text-slate-400" /></div><div className="mt-5 space-y-2"><FieldLabel hint="Required">Job posting link</FieldLabel><input required type="url" value={jobUrl} onChange={(event) => setJobUrl(event.target.value)} placeholder="https://company.com/careers/role" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><p className="text-[11px] leading-5 text-slate-400">Use the public posting URL. If the page is protected, paste its requirements below.</p></div><div className="mt-5 space-y-2"><FieldLabel hint="Optional">Job requirements</FieldLabel><textarea value={jobText} onChange={(event) => setJobText(event.target.value)} rows={4} placeholder="Paste the responsibilities and requirements here when needed…" className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm leading-6 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /></div></section>

            <section className="border-t-2 border-slate-900 pt-4"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Step 02</p><h2 className="mt-2 text-xl font-bold tracking-tight">Bring your CV</h2></div><FileText className="h-5 w-5 text-slate-400" /></div><label className="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-4 transition hover:border-emerald-500 hover:bg-emerald-50/30"><span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Upload className="h-4 w-4" /></span><span><span className="block text-xs font-bold text-slate-700">{cvFilename || 'Upload a text-based CV'}</span><span className="mt-1 block text-[11px] text-slate-400">.txt, .md, or .rtf · up to 5 MB</span></span></span><span className="text-xs font-bold text-emerald-700">Choose file<input type="file" accept=".txt,.md,.rtf,text/plain,text/markdown,text/rtf" onChange={handleCVFile} className="sr-only" /></span></label><div className="my-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400"><span className="h-px flex-1 bg-slate-200" /> or paste <span className="h-px flex-1 bg-slate-200" /></div><textarea required value={cvText} onChange={(event) => { setCvText(event.target.value); setCvFilename(''); setFileError(''); }} rows={10} placeholder="Paste the full text of your current CV here…" className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm leading-6 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" aria-label="Current CV text" />{fileError && <p className="mt-2 flex items-start gap-2 text-xs font-semibold text-rose-700"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{fileError}</p>}</section>
          </div>

          <section className="flex min-h-[560px] flex-col rounded-[2rem] bg-slate-950 p-5 text-white shadow-[0_24px_60px_-35px_rgba(15,23,42,0.7)] sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-300">Step 03</p><h2 className="mt-2 text-2xl font-bold tracking-tight">Your optimized CV</h2><p className="mt-2 max-w-md text-xs leading-6 text-slate-400">Career Pilot will tune emphasis and wording for the role, then leave the final call with you.</p></div><Sparkles className="h-5 w-5 text-emerald-300" /></div>
            {status === 'idle' && <div className="flex flex-1 flex-col items-center justify-center py-14 text-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]"><ArrowRight className="h-7 w-7 text-emerald-300" /></div><p className="mt-5 text-sm font-bold">Ready when you are</p><p className="mt-2 max-w-xs text-xs leading-6 text-slate-400">Add the link and your CV. Your tailored document will appear in this space.</p></div>}
            {busy && <div className="flex flex-1 flex-col justify-center py-14"><div className="space-y-4"><div className="h-2 w-2/3 animate-pulse rounded-full bg-emerald-300/30" /><div className="h-2 w-full animate-pulse rounded-full bg-white/10" /><div className="h-2 w-5/6 animate-pulse rounded-full bg-white/10" /></div><p className="mt-8 text-sm font-bold">{statusMessage}</p><p className="mt-2 text-xs text-slate-400">We only use information from the job and CV you provide.</p></div>}
            {status === 'error' && <div className="flex flex-1 flex-col items-center justify-center py-14 text-center"><AlertCircle className="h-10 w-10 text-rose-300" /><p className="mt-5 text-sm font-bold">We could not finish that yet</p><p className="mt-2 max-w-sm text-xs leading-6 text-slate-400">{error}</p></div>}
            {status === 'complete' && <div className="mt-7 flex flex-1 flex-col"><div className="border-b border-white/10 pb-4"><div className="flex items-center gap-2 text-xs font-bold text-emerald-200"><CheckCircle2 className="h-4 w-4" /> Ready to review</div><p className="mt-3 text-base font-bold text-white">{opportunity?.title || 'Target role'}</p><p className="mt-1 text-xs text-slate-400">{opportunity?.organization || 'Organization not specified'} · Grounded in your provided CV</p></div><textarea value={optimizedCV} onChange={(event) => setOptimizedCV(event.target.value)} className="mt-5 min-h-[330px] flex-1 resize-y rounded-xl border border-white/10 bg-white/[0.06] p-4 font-mono text-xs leading-6 text-slate-200 outline-none focus:border-emerald-400/60" aria-label="Optimized CV" />{groundingNotes.length > 0 && <p className="mt-3 text-[11px] leading-5 text-amber-200/80">Review note: {groundingNotes.join(' ')}</p>}</div>}
            <div className="mt-7 flex flex-wrap gap-3"><button type="submit" disabled={!canOptimize} aria-busy={busy} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-3 text-xs font-bold text-emerald-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"><Sparkles className="h-4 w-4" />{busy ? 'Working…' : status === 'complete' ? 'Optimize again' : 'Optimize my CV'}</button>{status === 'complete' && <><button type="button" onClick={handleCopy} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"><Clipboard className="h-4 w-4" />{copied ? 'Copied' : 'Copy'}</button><button type="button" onClick={handleDownload} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"><Download className="h-4 w-4" />Download</button></>}{(status === 'complete' || status === 'error') && <button type="button" onClick={reset} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/10"><RotateCcw className="h-4 w-4" />Start over</button>}</div>
          </section>
        </form>
      </main>
    </div>
  );
}
