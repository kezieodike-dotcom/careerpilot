/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Profile, 
  CareerFact, 
  Opportunity, 
  Application, 
  OpportunitySource, 
  SourceSyncRun, 
  ConsentRecord,
  PersonaType, 
  ApplicationStatus 
} from './types';
import { loadStoredData, saveStoredData, resetStoredData } from './utils/storage';

// Views
import { DashboardView } from './components/DashboardView';
import { DiscoverView } from './components/DiscoverView';
import { CareerProfileView } from './components/CareerProfileView';
import { ApplicationStudioView } from './components/ApplicationStudioView';
import { ApplicationsView } from './components/ApplicationsView';
import { AdminView } from './components/AdminView';
import { SettingsView } from './components/SettingsView';
import { ApprovalSubmissionModal } from './components/ApprovalSubmissionModal';
import { CreateProfileModal } from './components/CreateProfileModal';

// Icons
import { 
  Settings, 
  LayoutDashboard,
  Compass,
  UserRound,
  FileText,
  BriefcaseBusiness,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const [data, setData] = useState(() => {
    const loaded = loadStoredData();
    const seededProfile = loaded.profiles.active_job_seeker;
    // Migrate the original demo persona once so existing local sessions see the
    // new default identity without overwriting a name the user has chosen.
    if (seededProfile && ['Elena Rostova', 'Kezie Odike'].includes(seededProfile.full_name)) {
      return {
        ...loaded,
        profiles: {
          ...loaded.profiles,
          active_job_seeker: {
            ...seededProfile,
            id: 'prof-chikezie',
            user_id: 'user-chikezie',
            full_name: 'Chikezie Onyiaodike',
            email: 'chikezie.onyiaodike@example.com',
          },
        },
        facts: loaded.facts.map(f => f.user_id === 'user-elena' ? { ...f, user_id: 'user-chikezie' } : f),
        applications: loaded.applications.map(a => a.user_id === 'user-elena' ? { ...a, user_id: 'user-chikezie' } : a),
      };
    }
    return loaded;
  });
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'discover' | 'profile' | 'studio' | 'applications' | 'admin' | 'settings'
  >('dashboard');

  // Studio target opportunity
  const [studioTargetOpportunity, setStudioTargetOpportunity] = useState<Opportunity | null>(null);

  // Approval modal state
  const [approvalModalApp, setApprovalModalApp] = useState<Application | null>(null);
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveStoredData({
      activePersona: data.activePersona,
      profiles: data.profiles,
      facts: data.facts,
      opportunities: data.opportunities,
      applications: data.applications,
      sources: data.sources,
      syncRuns: data.syncRuns,
      consents: data.consents,
    });
  }, [data]);

  const currentProfile = data.profiles[data.activePersona] || data.profiles.active_job_seeker;
  const currentFacts = data.facts.filter(f => f.user_id === currentProfile.user_id);
  // Applications are user-scoped. Keeping this filter at the application boundary
  // prevents one persona's pipeline from leaking into another persona's workspace.
  const currentApplications = data.applications.filter(a => a.user_id === currentProfile.user_id);
  const savedOppIds = new Set(currentApplications.map(a => a.opportunity_id));

  // Persona switcher handler
  const handlePersonaChange = (newPersona: PersonaType) => {
    setData(prev => ({
      ...prev,
      activePersona: newPersona,
    }));
  };

  const handleCreateProfile = (profile: Profile) => {
    setData(prev => ({
      ...prev,
      profiles: { ...prev.profiles, [prev.activePersona]: profile },
    }));
  };

  // Opportunity Save / Unsave
  const handleToggleSaveOpportunity = (oppId: string) => {
    setData(prev => {
      const exists = prev.applications.some(a => a.user_id === currentProfile.user_id && a.opportunity_id === oppId);
      if (exists) {
        return {
          ...prev,
          applications: prev.applications.filter(a => !(a.user_id === currentProfile.user_id && a.opportunity_id === oppId)),
        };
      } else {
        const opp = prev.opportunities.find(o => o.id === oppId);
        if (!opp) return prev;
        const newApp: Application = {
          id: `app-${Date.now()}`,
          user_id: currentProfile.user_id,
          opportunity_id: oppId,
          status: 'Saved',
          application_url: opp.original_url,
          deadline: opp.deadline,
          submission_method: 'User Guided / External Portal',
          notes: 'Saved from discovery catalog',
          cv_versions: [],
          cover_letter_versions: [],
          screening_answers: [],
          events: [
            {
              id: `evt-${Date.now()}`,
              application_id: `app-${Date.now()}`,
              event_type: 'created',
              event_details: 'Opportunity saved to pipeline',
              timestamp: new Date().toISOString(),
            }
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return {
          ...prev,
          applications: [newApp, ...prev.applications],
        };
      }
    });
  };

  // Profile update
  const handleUpdateProfile = (updatedProfile: Profile) => {
    setData(prev => ({
      ...prev,
      profiles: {
        ...prev.profiles,
        [data.activePersona]: updatedProfile,
      }
    }));
  };

  // Fact handlers
  const handleAddFact = (newFact: CareerFact) => {
    setData(prev => ({
      ...prev,
      facts: [newFact, ...prev.facts],
    }));
  };

  const handleVerifyFact = (factId: string) => {
    setData(prev => ({
      ...prev,
      facts: prev.facts.map(f => f.id === factId ? {
        ...f,
        verification_status: 'verified',
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } : f)
    }));
  };

  const handleDeleteFact = (factId: string) => {
    setData(prev => ({
      ...prev,
      facts: prev.facts.filter(f => f.id !== factId)
    }));
  };

  const handleUpdateFact = (updatedFact: CareerFact) => {
    setData(prev => ({
      ...prev,
      facts: prev.facts.map(f => f.id === updatedFact.id ? updatedFact : f)
    }));
  };

  // New opportunity imported
  const handleOpportunityImported = (newOpp: Opportunity) => {
    setData(prev => ({
      ...prev,
      opportunities: [newOpp, ...prev.opportunities],
    }));
  };

  // Application Save from Studio
  const handleSaveApplicationPackage = (updatedApp: Application) => {
    setData(prev => {
      const index = prev.applications.findIndex(a => a.id === updatedApp.id);
      let updatedApps = [...prev.applications];
      if (index >= 0) {
        updatedApps[index] = updatedApp;
      } else {
        updatedApps = [updatedApp, ...updatedApps];
      }
      return {
        ...prev,
        applications: updatedApps,
      };
    });
  };

  // Application Status Change
  const handleUpdateApplicationStatus = (appId: string, newStatus: ApplicationStatus) => {
    // FR-019: changing a status to Submitted is itself a consequential action.
    // Route it through the action-specific approval gate instead of allowing a
    // dropdown change to bypass the confirmation modal.
    if (newStatus === 'Submitted') {
      const application = data.applications.find(a => a.id === appId && a.user_id === currentProfile.user_id);
      if (application) setApprovalModalApp(application);
      return;
    }
    setData(prev => ({
      ...prev,
      applications: prev.applications.map(a => a.id === appId ? {
        ...a,
        status: newStatus,
        events: [
          ...a.events,
          {
            id: `evt-${Date.now()}`,
            application_id: a.id,
            event_type: 'status_changed',
            event_details: `Status transitioned to ${newStatus}`,
            timestamp: new Date().toISOString(),
          }
        ],
        updated_at: new Date().toISOString(),
      } : a)
    }));
  };

  // Approval Submission Callback
  const handleApproveAndSubmit = (consentRecord: ConsentRecord, confirmationCode: string, notes: string) => {
    if (!approvalModalApp) return;

    setData(prev => ({
      ...prev,
      consents: [consentRecord, ...prev.consents],
      applications: prev.applications.map(a => a.id === approvalModalApp.id ? {
        ...a,
        status: 'Submitted',
        submitted_at: new Date().toISOString(),
        submission_confirmation: {
          confirmed_at: new Date().toISOString(),
          confirmation_code: confirmationCode || undefined,
          notes: notes || 'Explicit user approval verified and recorded',
        },
        events: [
          ...a.events,
          {
            id: `evt-${Date.now()}-appr`,
            application_id: a.id,
            event_type: 'approval_granted',
            event_details: `Explicit user approval granted: ${consentRecord.scope}`,
            timestamp: new Date().toISOString(),
          },
          {
            id: `evt-${Date.now()}-sub`,
            application_id: a.id,
            event_type: 'submitted',
            event_details: `Application marked as submitted. Confirmation: ${confirmationCode || 'Recorded'}`,
            timestamp: new Date().toISOString(),
          }
        ],
        updated_at: new Date().toISOString(),
      } : a)
    }));

    setApprovalModalApp(null);
  };

  // Admin trigger sync
  const handleTriggerSync = (sourceId: string) => {
    setData(prev => {
      const src = prev.sources.find(s => s.id === sourceId);
      const newSyncRun: SourceSyncRun = {
        id: `run-${Date.now()}`,
        source_id: sourceId,
        source_name: src?.name || 'Upstream Feed',
        started_at: new Date(Date.now() - 30000).toISOString(),
        completed_at: new Date().toISOString(),
        status: 'Completed',
        records_processed: 48,
        records_created: 3,
        records_updated: 14,
        records_failed: 0,
      };

      return {
        ...prev,
        sources: prev.sources.map(s => s.id === sourceId ? {
          ...s,
          last_synced_at: new Date().toISOString(),
          records_count: s.records_count + 3,
        } : s),
        syncRuns: [newSyncRun, ...prev.syncRuns],
      };
    });
  };

  // Reset demo
  const handleResetData = () => {
    resetStoredData();
    window.location.reload();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'profile', label: 'Career Profile', icon: UserRound },
    { id: 'studio', label: 'Application Studio', icon: FileText },
    { id: 'applications', label: 'Applications', icon: BriefcaseBusiness },
    { id: 'admin', label: 'Platform Admin', icon: ShieldCheck },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f4f7f8] font-sans text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
          <div className="px-6 py-6 border-b border-slate-100">
            <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-3 text-left group">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-sm group-hover:bg-emerald-700 transition-colors">CP</span>
              <span><span className="block text-sm font-bold tracking-tight">Career Pilot</span><span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">Personal workspace</span></span>
            </button>
          </div>

          <div className="px-4 pt-5">
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentView === item.id;
                return <button key={item.id} onClick={() => setCurrentView(item.id)} className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-all active:scale-[0.98] ${active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}><Icon className={`h-4 w-4 ${active ? 'text-emerald-300' : 'text-slate-400 group-hover:text-slate-700'}`} /><span>{item.label}</span>{item.id === 'applications' && currentApplications.length > 0 && <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500'}`}>{currentApplications.length}</span>}</button>;
              })}
            </nav>
          </div>

          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Grounded workspace</div>
              <p className="mt-2 text-[11px] leading-relaxed text-emerald-800/80">Generated materials use verified career facts only.</p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-10">
              <div className="flex items-center gap-3 lg:hidden"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-bold text-white">CP</span><span className="text-sm font-bold tracking-tight">Career Pilot</span></div>
              <div className="hidden lg:block"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{currentView === 'dashboard' ? 'Overview' : currentView.replace('_', ' ')}</p><h1 className="mt-1 text-lg font-bold tracking-tight text-slate-900">{currentView === 'dashboard' ? `Good to see you, ${currentProfile.full_name.split(' ')[0]}` : navItems.find(item => item.id === currentView)?.label || 'Settings'}</h1></div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 sm:px-3"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-bold text-slate-700 shadow-sm">{currentProfile.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}</span><select value={data.activePersona} onChange={(e) => handlePersonaChange(e.target.value as PersonaType)} className="max-w-[130px] bg-transparent text-[11px] font-semibold text-slate-700 outline-none sm:max-w-none" title="Switch profile"><option value="active_job_seeker">Job Seeker Profile</option><option value="early_career">Early Career Profile</option><option value="multi_opportunity">Multi-Opportunity Profile</option><option value="platform_admin">Admin Console</option></select></div>
                <button onClick={() => setIsCreateProfileOpen(true)} className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 text-[11px] font-bold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 sm:px-3" aria-label="Create a new profile"><UserRound className="h-4 w-4" /> <span className="hidden xl:inline">Create profile</span></button>
                <button onClick={() => setCurrentView('settings')} className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all active:scale-[0.96] ${currentView === 'settings' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900'}`} aria-label="Settings and data rights"><Settings className="h-4 w-4" /></button>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1400px] px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:px-10 lg:py-10 lg:pb-10">
        {currentView === 'dashboard' && (
          <DashboardView
            profile={currentProfile}
            facts={currentFacts}
            opportunities={data.opportunities}
            applications={currentApplications}
            activePersona={data.activePersona}
            onNavigate={(view) => setCurrentView(view)}
            onSelectOpportunityForStudio={(opp) => {
              setStudioTargetOpportunity(opp);
              setCurrentView('studio');
            }}
            onVerifyFactClick={() => setCurrentView('profile')}
            onOpenApprovalModal={(app) => setApprovalModalApp(app)}
          />
        )}

        {currentView === 'discover' && (
          <DiscoverView
            opportunities={data.opportunities}
            savedOppIds={savedOppIds}
            profile={currentProfile}
            verifiedFacts={currentFacts}
            onToggleSave={handleToggleSaveOpportunity}
            onSelectForStudio={(opp) => {
              setStudioTargetOpportunity(opp);
              setCurrentView('studio');
            }}
            onOpportunityImported={handleOpportunityImported}
          />
        )}

        {currentView === 'profile' && (
          <CareerProfileView
            profile={currentProfile}
            facts={currentFacts}
            onUpdateProfile={handleUpdateProfile}
            onAddFact={handleAddFact}
            onVerifyFact={handleVerifyFact}
            onDeleteFact={handleDeleteFact}
            onUpdateFact={handleUpdateFact}
          />
        )}

        {currentView === 'studio' && (
          <ApplicationStudioView
            opportunities={data.opportunities}
            applications={currentApplications}
            selectedOpportunityId={studioTargetOpportunity?.id}
            profile={currentProfile}
            verifiedFacts={currentFacts}
            onSaveApplicationPackage={handleSaveApplicationPackage}
            onOpenApprovalModal={(app) => setApprovalModalApp(app)}
          />
        )}

        {currentView === 'applications' && (
          <ApplicationsView
            applications={currentApplications}
            opportunities={data.opportunities}
            onUpdateApplicationStatus={handleUpdateApplicationStatus}
            onOpenApprovalModal={(app) => setApprovalModalApp(app)}
            onSelectForStudio={(opp) => {
              setStudioTargetOpportunity(opp);
              setCurrentView('studio');
            }}
          />
        )}

        {currentView === 'admin' && (
          <AdminView
            sources={data.sources}
            syncRuns={data.syncRuns}
            opportunities={data.opportunities}
            consents={data.consents}
            onTriggerSync={handleTriggerSync}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            profile={currentProfile}
            facts={currentFacts}
            opportunities={data.opportunities.filter(o => currentApplications.some(a => a.opportunity_id === o.id))}
            applications={currentApplications}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Approval Modal (FR-019 Gate) */}
      {approvalModalApp && (
        <ApprovalSubmissionModal
          application={approvalModalApp}
          opportunity={data.opportunities.find(o => o.id === approvalModalApp.opportunity_id) || data.opportunities[0]}
          onApproveAndSubmit={handleApproveAndSubmit}
          onClose={() => setApprovalModalApp(null)}
        />
      )}

      {isCreateProfileOpen && (
        <CreateProfileModal
          profile={currentProfile}
          onCreate={handleCreateProfile}
          onClose={() => setIsCreateProfileOpen(false)}
        />
      )}

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Career Pilot</span>
            <span aria-hidden="true">·</span>
            <span>Version 1.0</span>
            <span aria-hidden="true">·</span>
            <span>Grounded Opportunity Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Explicit User Approval Enforced (FR-019)</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Hallucination Verified Facts</span>
          </div>
        </div>
      </footer>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_12px_35px_-18px_rgba(15,23,42,0.55)] backdrop-blur-md lg:hidden" aria-label="Mobile navigation">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return <button key={item.id} onClick={() => setCurrentView(item.id)} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[9px] font-bold transition-all active:scale-[0.95] ${active ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700'}`} aria-label={item.label}><Icon className="h-4 w-4" /><span className="truncate">{item.id === 'profile' ? 'Profile' : item.id === 'studio' ? 'Studio' : item.label}</span></button>;
        })}
      </nav>
    </div>
    </div>
    </div>
  );
}
