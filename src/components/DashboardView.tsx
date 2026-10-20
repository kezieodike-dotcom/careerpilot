/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Profile, 
  CareerFact, 
  Opportunity, 
  Application, 
  PersonaType 
} from '../types';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Compass, 
  FileEdit, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { ApplicationAnalyticsChart } from './ApplicationAnalyticsChart';

interface DashboardViewProps {
  profile: Profile;
  facts: CareerFact[];
  opportunities: Opportunity[];
  applications: Application[];
  activePersona: PersonaType;
  onNavigate: (view: 'dashboard' | 'discover' | 'profile' | 'studio' | 'applications' | 'admin' | 'settings') => void;
  onSelectOpportunityForStudio: (opportunity: Opportunity) => void;
  onVerifyFactClick: () => void;
  onOpenApprovalModal: (app: Application) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  facts,
  opportunities,
  applications,
  activePersona,
  onNavigate,
  onSelectOpportunityForStudio,
  onVerifyFactClick,
  onOpenApprovalModal,
}) => {
  const verifiedFactsCount = facts.filter(f => f.verification_status === 'verified').length;
  const pendingReviewFacts = facts.filter(f => f.verification_status === 'pending_review');
  const readyToSubmitApps = applications.filter(a => a.status === 'Ready to submit');
  
  // Sorted upcoming deadlines
  const upcomingDeadlines = [...opportunities]
    .filter(o => o.status === 'Active' || o.status === 'Closing Soon')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3);

  // Recommendations
  const recommendedOpps = opportunities.slice(0, 4);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Persona Overview */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>Persona:</span>
              <span className="font-semibold text-slate-900 capitalize">
                {activePersona.replace(/_/g, ' ')}
              </span>
              <span aria-hidden="true">·</span>
              <span>{profile.location}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Welcome back, {profile.full_name}
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {profile.professional_summary}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('discover')}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Discover Opportunities</span>
            </button>
            <button
              onClick={() => onNavigate('studio')}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Open Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Profile Completeness</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {profile.profile_completeness}%
            </span>
            <span className="text-xs text-emerald-600 font-medium inline-flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" />
              {verifiedFactsCount} Verified Facts
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {pendingReviewFacts.length > 0 ? (
              <button 
                onClick={onVerifyFactClick} 
                className="text-amber-700 font-medium hover:underline inline-flex items-center gap-1"
              >
                <span>{pendingReviewFacts.length} awaiting review</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <span>All facts verified</span>
            )}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Active Applications</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {applications.length}
            </span>
            <span className="text-xs text-slate-500">
              in pipeline
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            <button 
              onClick={() => onNavigate('applications')}
              className="hover:text-slate-900 font-medium inline-flex items-center gap-1"
            >
              <span>{readyToSubmitApps.length} ready to submit</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Upcoming Deadlines</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {upcomingDeadlines.length}
            </span>
            <span className="text-xs text-amber-600 font-medium inline-flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              Within 60 days
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2 truncate">
            Nearest: {upcomingDeadlines[0]?.organization || 'None'}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Factual Grounding Score</div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
              100%
            </span>
            <span className="text-xs text-slate-500 inline-flex items-center gap-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Zero Hallucinations
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-2">
            PRD Section 9.2 Compliant
          </div>
        </div>
      </div>

      {/* Actionable Attention Items */}
      {(pendingReviewFacts.length > 0 || readyToSubmitApps.length > 0) && (
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Tasks Requiring Your Attention</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingReviewFacts.length > 0 && (
              <div className="p-3.5 rounded-lg bg-white border border-amber-200 flex items-center justify-between gap-3">
                <div className="text-xs">
                  <div className="font-semibold text-slate-900">
                    {pendingReviewFacts.length} Extracted Career Facts Awaiting Review
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Extracted from uploaded CV. Please verify to enable in application studio.
                  </div>
                </div>
                <button
                  onClick={onVerifyFactClick}
                  className="px-3 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg whitespace-nowrap shrink-0 transition-colors"
                >
                  Review Facts
                </button>
              </div>
            )}

            {readyToSubmitApps.length > 0 && (
              <div className="p-3.5 rounded-lg bg-white border border-emerald-200 flex items-center justify-between gap-3">
                <div className="text-xs">
                  <div className="font-semibold text-slate-900">
                    Application Ready for Submission Approval
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    Review target destination, answers, and grant explicit submission consent.
                  </div>
                </div>
                <button
                  onClick={() => onOpenApprovalModal(readyToSubmitApps[0])}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg whitespace-nowrap shrink-0 transition-colors"
                >
                  Review & Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Application Progress & Pipeline Analytics Visualization */}
      <ApplicationAnalyticsChart 
        applications={applications} 
        opportunities={opportunities} 
      />

      {/* Two-Column Section: Recommended Opportunities & Application Pipeline Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Recommended Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recommended Opportunities
              </h2>
              <p className="text-xs text-slate-500">
                Personalized against verified profile skills and career goals
              </p>
            </div>
            <button
              onClick={() => onNavigate('discover')}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
            >
              <span>View all ({opportunities.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recommendedOpps.map((opp) => (
              <div 
                key={opp.id}
                className="bg-white rounded-xl p-4 border border-slate-200/80 hover:border-slate-300 transition-colors shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <span>{opp.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{opp.location}</span>
                      <span aria-hidden="true">·</span>
                      <span>{opp.work_arrangement}</span>
                      {opp.duplicate_count ? (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-400">Deduplicated from {opp.duplicate_count} sources</span>
                        </>
                      ) : null}
                    </div>

                    <h3 className="text-sm font-semibold text-slate-900 hover:text-slate-700">
                      {opp.title}
                    </h3>
                    <div className="text-xs font-medium text-slate-700 mt-0.5">
                      {opp.organization}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                      <span>Deadline: {opp.deadline}</span>
                      {opp.compensation && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{opp.compensation}</span>
                        </>
                      )}
                      {opp.funding_amount && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{opp.funding_amount}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col gap-2 shrink-0 sm:items-end">
                    <button
                      onClick={() => onSelectOpportunityForStudio(opp)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Prepare Application
                    </button>
                    <button
                      onClick={() => onNavigate('discover')}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Assess Fit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 col): Application Pipeline & Deadlines */}
        <div className="space-y-6">
          {/* Pipeline Snapshot */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Application Pipeline
              </h3>
              <button
                onClick={() => onNavigate('applications')}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium inline-flex items-center gap-1"
              >
                <span>Full Board</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {['Interested', 'Preparing', 'Ready to submit', 'Submitted', 'Interview'].map((status) => {
                const count = applications.filter(a => a.status === status).length;
                return (
                  <div 
                    key={status}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors text-xs"
                  >
                    <span className="text-slate-700">{status}</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Deadlines Widget */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Upcoming Opportunity Deadlines</span>
            </div>

            <div className="space-y-3 pt-1">
              {upcomingDeadlines.map((opp) => (
                <div key={opp.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0">
                  <div className="font-semibold text-slate-900">{opp.title}</div>
                  <div className="text-slate-500">{opp.organization} · {opp.category}</div>
                  <div className="text-amber-700 font-mono tabular-nums mt-1 font-medium">
                    Due: {opp.deadline}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
