/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Profile, CareerFact, Opportunity, Application } from '../types';
import { Download, RotateCcw, Shield, Bell, Key, UserCheck } from 'lucide-react';

interface SettingsViewProps {
  profile: Profile;
  facts: CareerFact[];
  opportunities: Opportunity[];
  applications: Application[];
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  facts,
  opportunities,
  applications,
  onResetData,
}) => {
  const handleExportAllData = () => {
    const exportPayload = {
      exported_at: new Date().toISOString(),
      platform: 'AI Career Agent',
      version: '1.0',
      profile,
      career_facts: facts,
      saved_opportunities: opportunities,
      applications: applications,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `career_agent_export_${profile.full_name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
          Account Settings & Data Rights
        </h1>
        <p className="text-xs md:text-sm text-slate-600 mt-1">
          FR-7.6 & FR-13.5 · Privacy by design, consent policies, and personal data portability
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-6 text-xs">
        {/* Section 1: Privacy & Automation Safeguards */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>AI Automation & Privacy Principles</span>
          </h2>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-slate-600">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-slate-900">• User Control:</span>
              <span>The AI Career Agent never automatically submits an application to any external portal without explicit user approval per action (FR-019).</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-slate-900">• Grounded Factual Integrity:</span>
              <span>The AI is prohibited from inventing unevidenced work experience, degrees, or metrics. Missing criteria are flagged as omissions (FR-005, FR-9.2).</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-slate-900">• Data Privacy:</span>
              <span>Your career facts and uploaded CVs are processed confidentially and never exposed publicly.</span>
            </div>
          </div>
        </div>

        {/* Section 2: Data Portability & Export (FR-13.5) */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Download className="w-4 h-4 text-slate-700" />
            <span>Personal Data Export (FR-13.5)</span>
          </h2>
          <p className="text-slate-600">
            Download your complete profile, verified career facts, tailored document versions, and application tracking history in standardized JSON format.
          </p>
          <button
            onClick={handleExportAllData}
            className="px-4 py-2 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Complete Career Data Package (JSON)</span>
          </button>
        </div>

        {/* Section 3: Reset / Clear Session Data */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-rose-900">
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Reset Demo Data</span>
          </h2>
          <p className="text-slate-600">
            Restore initial demo profiles, seed opportunities, and default verified career facts.
          </p>
          <button
            onClick={onResetData}
            className="px-4 py-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Local Data to Demo Seed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
