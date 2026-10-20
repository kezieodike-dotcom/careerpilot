/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Application, Opportunity, ConsentRecord } from '../types';
import { ExternalLink, ShieldCheck, CheckCircle2, AlertTriangle, FileText, X } from 'lucide-react';

interface ApprovalSubmissionModalProps {
  application: Application;
  opportunity: Opportunity;
  onApproveAndSubmit: (consentRecord: ConsentRecord, confirmationCode: string, notes: string) => void;
  onClose: () => void;
}

export const ApprovalSubmissionModal: React.FC<ApprovalSubmissionModalProps> = ({
  application,
  opportunity,
  onApproveAndSubmit,
  onClose,
}) => {
  const [hasConfirmedAccuracy, setHasConfirmedAccuracy] = useState(false);
  const [hasAcknowledgedExternalDestination, setHasAcknowledgedExternalDestination] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');

  const activeCv = application.cv_versions[application.cv_versions.length - 1];
  const activeCoverLetter = application.cover_letter_versions[application.cover_letter_versions.length - 1];
  const screeningAnswers = application.screening_answers || [];

  const canApprove = hasConfirmedAccuracy && hasAcknowledgedExternalDestination;

  const handleConfirm = () => {
    if (!canApprove) return;
    const consentRecord: ConsentRecord = {
      id: `consent-${Date.now()}`,
      user_id: application.user_id,
      consent_type: 'external_submission',
      scope: `Submission package for ${opportunity.title} at ${opportunity.organization} (${opportunity.application_destination})`,
      status: 'granted',
      granted_at: new Date().toISOString(),
      metadata: {
        opportunity_id: opportunity.id,
        application_id: application.id,
        destination_url: opportunity.original_url,
        cv_version_used: activeCv?.version_number || 1,
        cover_letter_included: !!activeCoverLetter,
        screening_answers_count: screeningAnswers.length,
      }
    };

    onApproveAndSubmit(consentRecord, confirmationCode, submissionNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Application Review & Explicit Submission Approval
              </h2>
              <p className="text-xs text-slate-500">
                FR-019 Gate · Explicit action approval required before external submission
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Destination Warning & Details */}
          <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-medium text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Target External Submission Destination</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              You are preparing to submit or mark submitted for <strong>{opportunity.title}</strong> at <strong>{opportunity.organization}</strong>.
            </p>
            <div className="text-xs flex items-center justify-between pt-1">
              <span className="text-slate-600">Application Portal:</span>
              <a 
                href={opportunity.original_url} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                <span>{opportunity.application_destination}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Package Overview */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Application Package Manifest
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/40">
                <div className="flex items-center gap-2 text-slate-900 font-medium text-xs mb-1">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Curriculum Vitae</span>
                </div>
                <div className="text-xs text-slate-600">
                  {activeCv ? (
                    <span>Version {activeCv.version_number} ({activeCv.title})</span>
                  ) : (
                    <span className="text-amber-600">Default Verified Profile Resume</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Grounded strictly in verified career facts.
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/40">
                <div className="flex items-center gap-2 text-slate-900 font-medium text-xs mb-1">
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>Cover Letter</span>
                </div>
                <div className="text-xs text-slate-600">
                  {activeCoverLetter ? (
                    <span>{activeCoverLetter.title}</span>
                  ) : (
                    <span className="text-slate-500">Not attached or optional</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {activeCoverLetter ? 'Tailored to organization requirements' : 'None included'}
                </div>
              </div>
            </div>

            {screeningAnswers.length > 0 && (
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/40 text-xs">
                <span className="font-medium text-slate-800">{screeningAnswers.length} Screening Responses Attached</span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  All answers verified and grounded in candidate records.
                </p>
              </div>
            )}
          </div>

          {/* Submission Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Submission Confirmation Record
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Confirmation / Reference Number (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. STRIPE-APP-2026-9812"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Submission Notes or Follow-up Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. Recruiter email confirmed receipt"
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Mandatory Checkboxes */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasConfirmedAccuracy}
                onChange={(e) => setHasConfirmedAccuracy(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-xs text-slate-700">
                I have reviewed all generated materials and confirm that all facts, dates, qualifications, and claims accurately reflect my authentic background without fabrication.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAcknowledgedExternalDestination}
                onChange={(e) => setHasAcknowledgedExternalDestination(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-xs text-slate-700">
                I explicitly grant permission for this specific submission to <strong>{opportunity.organization}</strong>. I understand this approval does NOT grant unrestricted automated submission to any other website.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <a
              href={opportunity.original_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
            >
              <span>Open Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={handleConfirm}
              disabled={!canApprove}
              className={`px-4 py-2 text-xs font-medium rounded-lg inline-flex items-center gap-2 transition-colors ${
                canApprove
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Record Submission</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
