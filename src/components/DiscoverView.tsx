/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Opportunity, 
  OpportunityCategory, 
  Profile, 
  CareerFact, 
  FitAssessment 
} from '../types';
import { assessFit, importOpportunityFromUrl } from '../utils/api';
import { 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ArrowRight,
  Layers,
  HelpCircle,
  FileEdit
} from 'lucide-react';

interface DiscoverViewProps {
  opportunities: Opportunity[];
  savedOppIds: Set<string>;
  profile: Profile;
  verifiedFacts: CareerFact[];
  onToggleSave: (oppId: string) => void;
  onSelectForStudio: (opportunity: Opportunity) => void;
  onOpportunityImported: (opportunity: Opportunity) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  opportunities,
  savedOppIds,
  profile,
  verifiedFacts,
  onToggleSave,
  onSelectForStudio,
  onOpportunityImported,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkArrangement, setSelectedWorkArrangement] = useState<string>('All');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  
  // Fit analysis states
  const [activeFitAssessment, setActiveFitAssessment] = useState<FitAssessment | null>(null);
  const [isAssessingFit, setIsAssessingFit] = useState(false);

  // Import modal states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const categories: (OpportunityCategory | 'All')[] = [
    'All',
    'Job',
    'Internship',
    'Fellowship',
    'Scholarship',
    'Grant',
    'Graduate Programme'
  ];

  // Filtering
  const filteredOpps = opportunities.filter((opp) => {
    if (selectedCategory !== 'All' && opp.category !== selectedCategory) return false;
    if (selectedWorkArrangement !== 'All' && opp.work_arrangement !== selectedWorkArrangement) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = opp.title.toLowerCase().includes(q);
      const matchOrg = opp.organization.toLowerCase().includes(q);
      const matchDesc = opp.description.toLowerCase().includes(q);
      const matchSkills = opp.required_skills.some(s => s.toLowerCase().includes(q));
      if (!matchTitle && !matchOrg && !matchDesc && !matchSkills) return false;
    }
    return true;
  });

  const handleOpenDetail = async (opp: Opportunity) => {
    setSelectedOpportunity(opp);
    setActiveFitAssessment(null);
  };

  const handleRunFitAnalysis = async (opp: Opportunity) => {
    setIsAssessingFit(true);
    try {
      const res = await assessFit(profile, verifiedFacts, opp);
      if (res.success) {
        setActiveFitAssessment(res.fitAssessment);
      }
    } catch (e) {
      console.error('Fit analysis failed', e);
    } finally {
      setIsAssessingFit(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl.trim() && !importText.trim()) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const res = await importOpportunityFromUrl(importUrl.trim(), importText.trim());
      if (res.success && res.opportunity) {
        onOpportunityImported(res.opportunity);
        setIsImportModalOpen(false);
        setImportUrl('');
        setImportText('');
        handleOpenDetail(res.opportunity);
      }
    } catch (err: any) {
      setImportError(err.message || 'Failed to extract opportunity details from provided input');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Discover Opportunities
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            Normalized across public APIs, licensed feeds, academic boards, and direct ATS syndicates
          </p>
        </div>

        <button
          onClick={() => setIsImportModalOpen(true)}
          className="px-4 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 self-start md:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Import by URL</span>
        </button>
      </div>

      {/* Category Tabs (Interactive Segmented Control) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const count = cat === 'All' 
            ? opportunities.length 
            : opportunities.filter(o => o.category === cat).length;
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[11px] font-mono tabular-nums ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, organization, required skill (e.g. TypeScript, Bioinformatics)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
            <Filter className="w-3.5 h-3.5" />
            <span>Arrangement:</span>
          </div>
          <select
            value={selectedWorkArrangement}
            onChange={(e) => setSelectedWorkArrangement(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
          >
            <option value="All">All Arrangements</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOpps.map((opp) => {
          const isSaved = savedOppIds.has(opp.id);
          return (
            <div
              key={opp.id}
              className="bg-white rounded-xl p-5 border border-slate-200/80 hover:border-slate-300 transition-colors shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Clean Unboxed Metadata */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span>{opp.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{opp.work_arrangement}</span>
                  <span aria-hidden="true">·</span>
                  <span>{opp.location}</span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 
                    onClick={() => handleOpenDetail(opp)}
                    className="text-base font-semibold text-slate-900 hover:text-slate-700 cursor-pointer line-clamp-2"
                  >
                    {opp.title}
                  </h3>
                  <button
                    onClick={() => onToggleSave(opp.id)}
                    className="p-1 text-slate-400 hover:text-slate-900 transition-colors shrink-0"
                    title={isSaved ? 'Remove from Saved' : 'Save Opportunity'}
                  >
                    {isSaved ? (
                      <BookmarkCheck className="w-4 h-4 text-emerald-600 fill-emerald-50" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="text-xs font-medium text-slate-800 mt-1">
                  {opp.organization}
                </div>

                <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                  {opp.description}
                </p>

                {/* Skills Preview */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {opp.required_skills.slice(0, 4).map((s) => (
                    <span 
                      key={s} 
                      className="text-[11px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded"
                    >
                      {s}
                    </span>
                  ))}
                  {opp.required_skills.length > 4 && (
                    <span className="text-[11px] text-slate-400 self-center">
                      +{opp.required_skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-500 font-mono tabular-nums">
                  Due {opp.deadline}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDetail(opp)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    Assess
                  </button>
                  <button
                    onClick={() => onSelectForStudio(opp)}
                    className="px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredOpps.length === 0 && (
          <div className="col-span-full bg-white rounded-xl p-10 border border-slate-200 text-center space-y-3">
            <Layers className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-semibold text-slate-900">No opportunities match criteria</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or arrangement filters, or import an opportunity directly using a URL.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSelectedWorkArrangement('All'); setSearchQuery(''); }}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Opportunity Detail Drawer / Modal */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Drawer Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span>{selectedOpportunity.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedOpportunity.location}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedOpportunity.work_arrangement}</span>
                  <span aria-hidden="true">·</span>
                  <span>Source: {selectedOpportunity.source_name}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedOpportunity.title}
                </h2>
                <div className="text-xs font-medium text-slate-700 mt-0.5">
                  {selectedOpportunity.organization}
                </div>
              </div>
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Grounded Fit Evaluation Widget */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-slate-700" />
                    <span>AI Fit Assessment & Skill-Gap Analysis</span>
                  </div>
                  {!activeFitAssessment && (
                    <button
                      onClick={() => handleRunFitAnalysis(selectedOpportunity)}
                      disabled={isAssessingFit}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {isAssessingFit ? (
                        <span>Evaluating Grounded Fit...</span>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Run Grounded Fit Analysis</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {activeFitAssessment ? (
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                        {activeFitAssessment.fit_score}/100
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {activeFitAssessment.fit_level}
                        </span>
                        <p className="text-slate-600 text-xs mt-1">
                          {activeFitAssessment.fit_explanation}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <div className="font-medium text-emerald-800 mb-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Directly Evidenced in Profile</span>
                        </div>
                        <ul className="list-disc list-inside text-slate-600 space-y-1">
                          {activeFitAssessment.matched_requirements.map((m, idx) => (
                            <li key={idx}>{m}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-slate-200">
                        <div className="font-medium text-amber-800 mb-1 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Missing Evidence / Omitted</span>
                        </div>
                        <ul className="list-disc list-inside text-slate-600 space-y-1">
                          {activeFitAssessment.missing_evidence.map((m, idx) => (
                            <li key={idx}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {activeFitAssessment.suggested_actions.length > 0 && (
                      <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                        <span className="font-medium text-slate-900">Recommended Preparation Actions:</span>
                        <ul className="list-disc list-inside text-slate-600 mt-1 space-y-0.5">
                          {activeFitAssessment.suggested_actions.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Click "Run Grounded Fit Analysis" to evaluate {selectedOpportunity.organization}'s requirements against your verified profile facts without hallucination.
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Opportunity Overview
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedOpportunity.description}
                </p>
              </div>

              {/* Required Qualifications & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Required Qualifications
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {selectedOpportunity.required_qualifications.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-slate-400 mt-0.5">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Key Required Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedOpportunity.required_skills.map((s) => (
                      <span 
                        key={s} 
                        className="text-xs font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {selectedOpportunity.eligibility_criteria.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                        Eligibility Criteria
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {selectedOpportunity.eligibility_criteria.map((c, i) => (
                          <li key={i}>• {c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Destination URL Attribution */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Application Destination: {selectedOpportunity.application_destination}</span>
                <a
                  href={selectedOpportunity.original_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-slate-900 hover:underline inline-flex items-center gap-1"
                >
                  <span>View Original Listing</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleSave(selectedOpportunity.id)}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 inline-flex items-center gap-1.5"
                >
                  {savedOppIds.has(selectedOpportunity.id) ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save for Later</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    const opp = selectedOpportunity;
                    setSelectedOpportunity(null);
                    onSelectForStudio(opp);
                  }}
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Prepare Application in Studio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Opportunity Import Modal (FR-011) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-slate-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Import Opportunity by URL or Description
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                FR-011 Compliant · Provide a public job posting URL (Greenhouse, Lever, LinkedIn, university or fellowship portal) or paste the opportunity text. Our normalization engine will extract structured requirements.
              </p>

              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                  {importError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Opportunity URL (Optional if text is provided)
                </label>
                <input
                  type="url"
                  placeholder="https://boards.greenhouse.io/company/jobs/123456"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Raw Opportunity Description or Requirements
                </label>
                <textarea
                  rows={5}
                  placeholder="Paste the job description, role overview, required qualifications, and eligibility text here..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting || (!importUrl.trim() && !importText.trim())}
                  className={`px-4 py-2 text-xs font-medium rounded-lg text-white transition-colors ${
                    isImporting || (!importUrl.trim() && !importText.trim())
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-slate-900 hover:bg-slate-800 shadow-xs'
                  }`}
                >
                  {isImporting ? 'Normalizing with AI...' : 'Normalize & Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
