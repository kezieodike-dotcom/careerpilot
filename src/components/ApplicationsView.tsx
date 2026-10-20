/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Application, 
  ApplicationStatus, 
  Opportunity 
} from '../types';
import { 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  FileText, 
  Send, 
  ShieldCheck, 
  Calendar, 
  List, 
  Kanban, 
  ArrowRight,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface ApplicationsViewProps {
  applications: Application[];
  opportunities: Opportunity[];
  onUpdateApplicationStatus: (appId: string, newStatus: ApplicationStatus) => void;
  onOpenApprovalModal: (app: Application) => void;
  onSelectForStudio: (opportunity: Opportunity) => void;
}

const PIPELINE_STAGES: ApplicationStatus[] = [
  'Interested',
  'Preparing',
  'Ready to submit',
  'Submitted',
  'Interview',
  'Offer'
];

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  opportunities,
  onUpdateApplicationStatus,
  onOpenApprovalModal,
  onSelectForStudio,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const getOpp = (oppId: string) => opportunities.find(o => o.id === oppId);

  const handleStatusChange = (app: Application, nextStatus: ApplicationStatus) => {
    if (nextStatus === 'Submitted') {
      // Gate through FR-019 explicit approval modal!
      onOpenApprovalModal(app);
    } else {
      onUpdateApplicationStatus(app.id, nextStatus);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header and Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Applications & Tracking Pipeline
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            FR-021 · Manage application statuses, interview schedules, and approval-gated submissions
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start md:self-auto">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 ${
              viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List Table</span>
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageApps = applications.filter(a => a.status === stage);
            return (
              <div 
                key={stage}
                className="bg-slate-100/70 rounded-xl p-3 border border-slate-200/60 min-w-[210px] space-y-2.5"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-slate-800">{stage}</span>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500 font-semibold bg-white px-2 py-0.5 rounded shadow-2xs">
                    {stageApps.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {stageApps.map((app) => {
                    const opp = getOpp(app.opportunity_id);
                    if (!opp) return null;

                    return (
                      <div
                        key={app.id}
                        className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs hover:border-slate-300 transition-colors space-y-2"
                      >
                        <div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {opp.organization}
                          </div>
                          <h4 
                            onClick={() => setSelectedApplication(app)}
                            className="text-xs font-semibold text-slate-900 hover:text-slate-700 cursor-pointer line-clamp-2 mt-0.5"
                          >
                            {opp.title}
                          </h4>
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="font-mono tabular-nums">Due {app.deadline}</span>
                          <span className="text-slate-400">{opp.category}</span>
                        </div>

                        {/* Status Transition Control */}
                        <div className="pt-2 flex items-center justify-between gap-1">
                          <button
                            onClick={() => onSelectForStudio(opp)}
                            className="text-[11px] text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Studio</span>
                          </button>

                          {stage === 'Ready to submit' ? (
                            <button
                              onClick={() => onOpenApprovalModal(app)}
                              className="px-2 py-1 text-[11px] font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                            >
                              Approve
                            </button>
                          ) : (
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app, e.target.value as ApplicationStatus)}
                              className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-700"
                            >
                              {PIPELINE_STAGES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {stageApps.length === 0 && (
                    <div className="text-center py-6 text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold">
                <th className="py-3 px-4">Opportunity & Organization</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Materials Packaged</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => {
                const opp = getOpp(app.opportunity_id);
                if (!opp) return null;

                return (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{opp.title}</div>
                      <div className="text-slate-500 text-[11px]">{opp.organization}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {opp.category}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app, e.target.value as ApplicationStatus)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-800 font-medium"
                      >
                        {PIPELINE_STAGES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      {app.deadline}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {app.cv_versions.length > 0 ? `CV v${app.cv_versions.length}` : 'None'} · {app.cover_letter_versions.length > 0 ? 'Cover Letter' : 'No letter'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => onSelectForStudio(opp)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
                      >
                        Studio
                      </button>
                      <button
                        onClick={() => onOpenApprovalModal(app)}
                        className="px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md"
                      >
                        Approve / Submit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Application Detail Modal (Audit History & Events) */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Application Audit & Event Timeline
                </h3>
                <div className="text-xs text-slate-500">
                  {getOpp(selectedApplication.opportunity_id)?.title}
                </div>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Status & Submission Details</h4>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-slate-600">
                  <div><strong>Status:</strong> {selectedApplication.status}</div>
                  <div><strong>Method:</strong> {selectedApplication.submission_method}</div>
                  {selectedApplication.submission_confirmation && (
                    <div className="text-emerald-800">
                      <strong>Confirmed:</strong> {selectedApplication.submission_confirmation.confirmed_at} ({selectedApplication.submission_confirmation.notes})
                    </div>
                  )}
                  {selectedApplication.notes && (
                    <div><strong>Notes:</strong> {selectedApplication.notes}</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Auditable Event History</h4>
                <div className="space-y-2">
                  {selectedApplication.events.map((evt) => (
                    <div key={evt.id} className="p-3 rounded-lg border border-slate-100 bg-white space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900 capitalize">
                          {evt.event_type.replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        {evt.event_details}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
