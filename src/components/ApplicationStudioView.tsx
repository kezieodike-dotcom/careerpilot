/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Opportunity, 
  Profile, 
  CareerFact, 
  Application, 
  DocumentVersion, 
  ApplicationAnswer 
} from '../types';
import { generateMaterials } from '../utils/api';
import { 
  FileText, 
  Mail, 
  HelpCircle, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  Printer, 
  History,
  Send,
  Eye,
  Edit
} from 'lucide-react';

interface ApplicationStudioViewProps {
  opportunities: Opportunity[];
  applications: Application[];
  selectedOpportunityId?: string;
  profile: Profile;
  verifiedFacts: CareerFact[];
  onSaveApplicationPackage: (app: Application) => void;
  onOpenApprovalModal: (app: Application) => void;
}

export const ApplicationStudioView: React.FC<ApplicationStudioViewProps> = ({
  opportunities,
  applications,
  selectedOpportunityId,
  profile,
  verifiedFacts,
  onSaveApplicationPackage,
  onOpenApprovalModal,
}) => {
  // Target opportunity selector
  const [currentOppId, setCurrentOppId] = useState<string>(
    selectedOpportunityId || (opportunities[0] ? opportunities[0].id : '')
  );

  const currentOpp = opportunities.find(o => o.id === currentOppId) || opportunities[0];

  // Active studio tab
  const [activeTab, setActiveTab] = useState<'cv' | 'cover_letter' | 'answers'>('cv');

  // Find or initialize application for this opportunity
  const existingApp = applications.find(a => a.opportunity_id === currentOpp?.id);
  
  // Local document states
  const [cvContent, setCvContent] = useState<string>(
    existingApp?.cv_versions[existingApp.cv_versions.length - 1]?.content || ''
  );
  const [coverLetterContent, setCoverLetterContent] = useState<string>(
    existingApp?.cover_letter_versions[existingApp.cover_letter_versions.length - 1]?.content || ''
  );
  const [screeningAnswers, setScreeningAnswers] = useState<ApplicationAnswer[]>(
    existingApp?.screening_answers || []
  );

  const [groundingNotes, setGroundingNotes] = useState<string[]>(
    existingApp?.cv_versions[0]?.generation_metadata.missing_facts_flagged || [
      'Grounded in candidate verified career facts only.',
      'No unevidenced skills or credentials will be invented.'
    ]
  );

  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  // Trigger generator
  const handleGenerateDocument = async (type: 'cv' | 'cover_letter' | 'screening_answers') => {
    if (!currentOpp) return;
    setIsGenerating(true);
    try {
      const res = await generateMaterials(type, profile, verifiedFacts, currentOpp, customInstructions);
      if (res.success && res.result) {
        if (type === 'cv') {
          setCvContent(res.result.content || '');
          if (res.result.missing_facts_flagged) {
            setGroundingNotes(res.result.missing_facts_flagged);
          }
        } else if (type === 'cover_letter') {
          setCoverLetterContent(res.result.content || '');
        } else if (type === 'screening_answers') {
          setScreeningAnswers(res.result.answers || []);
        }
      }
    } catch (e) {
      console.error('Generation failed', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    const textToCopy = activeTab === 'cv' 
      ? cvContent 
      : activeTab === 'cover_letter' 
      ? coverLetterContent 
      : JSON.stringify(screeningAnswers, null, 2);

    navigator.clipboard.writeText(textToCopy);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  const handleDownloadFile = () => {
    const filename = `${profile.full_name.replace(/\s+/g, '_')}_${currentOpp.organization}_${activeTab.toUpperCase()}.txt`;
    const content = activeTab === 'cv' ? cvContent : coverLetterContent;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSavePackage = () => {
    if (!currentOpp) return;

    const newCvVersion: DocumentVersion = {
      id: `cv-${Date.now()}`,
      application_id: existingApp?.id || `app-${Date.now()}`,
      document_type: 'cv',
      version_number: (existingApp?.cv_versions.length || 0) + 1,
      title: `${currentOpp.organization} Tailored CV (v${(existingApp?.cv_versions.length || 0) + 1})`,
      content: cvContent,
      generation_metadata: {
        grounded_facts_used: verifiedFacts.map(f => f.title),
        missing_facts_flagged: groundingNotes,
        tailored_focus: customInstructions || 'Standard tailored profile',
        model_used: 'gemini-3.8-flash',
        word_count: cvContent.split(/\s+/).length,
      },
      created_at: new Date().toISOString(),
    };

    const newCoverLetterVersion: DocumentVersion = {
      id: `cl-${Date.now()}`,
      application_id: existingApp?.id || `app-${Date.now()}`,
      document_type: 'cover_letter',
      version_number: (existingApp?.cover_letter_versions.length || 0) + 1,
      title: `${currentOpp.organization} Cover Letter`,
      content: coverLetterContent,
      generation_metadata: {
        grounded_facts_used: verifiedFacts.map(f => f.title),
        missing_facts_flagged: [],
        tailored_focus: 'Role alignment',
        model_used: 'gemini-3.8-flash',
        word_count: coverLetterContent.split(/\s+/).length,
      },
      created_at: new Date().toISOString(),
    };

    const updatedApp: Application = existingApp ? {
      ...existingApp,
      cv_versions: cvContent ? [...existingApp.cv_versions, newCvVersion] : existingApp.cv_versions,
      cover_letter_versions: coverLetterContent ? [...existingApp.cover_letter_versions, newCoverLetterVersion] : existingApp.cover_letter_versions,
      screening_answers: screeningAnswers,
      status: existingApp.status === 'Interested' || existingApp.status === 'Saved' ? 'Preparing' : existingApp.status,
      updated_at: new Date().toISOString(),
    } : {
      id: `app-${Date.now()}`,
      user_id: profile.user_id,
      opportunity_id: currentOpp.id,
      status: 'Preparing',
      application_url: currentOpp.original_url,
      deadline: currentOpp.deadline,
      submission_method: 'User Guided / External Portal',
      notes: `Application package created in Studio for ${currentOpp.title}`,
      cv_versions: cvContent ? [newCvVersion] : [],
      cover_letter_versions: coverLetterContent ? [newCoverLetterVersion] : [],
      screening_answers: screeningAnswers,
      events: [
        {
          id: `evt-${Date.now()}`,
          application_id: `app-${Date.now()}`,
          event_type: 'created',
          event_details: 'Created application package in Application Studio',
          timestamp: new Date().toISOString(),
        }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onSaveApplicationPackage(updatedApp);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Studio Header & Target Opportunity Selector */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>FR-015 to FR-018</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Grounded Factual Mode
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Application Preparation Studio
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-600 whitespace-nowrap">
            Target Opportunity:
          </label>
          <select
            value={currentOppId}
            onChange={(e) => {
              setCurrentOppId(e.target.value);
              const found = opportunities.find(o => o.id === e.target.value);
              const matchingApp = applications.find(a => a.opportunity_id === found?.id);
              if (matchingApp) {
                setCvContent(matchingApp.cv_versions[matchingApp.cv_versions.length - 1]?.content || '');
                setCoverLetterContent(matchingApp.cover_letter_versions[matchingApp.cover_letter_versions.length - 1]?.content || '');
                setScreeningAnswers(matchingApp.screening_answers || []);
              }
            }}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white font-medium text-slate-900 max-w-xs truncate"
          >
            {opportunities.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title} — {o.organization}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Studio Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 cols): Opportunity Briefing & Verified Facts Match */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">
                {currentOpp?.category} · {currentOpp?.work_arrangement}
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {currentOpp?.title}
              </h2>
              <div className="text-xs font-semibold text-slate-700 mt-0.5">
                {currentOpp?.organization}
              </div>
            </div>

            <div className="text-xs space-y-1.5 text-slate-600 pt-2 border-t border-slate-100">
              <div><strong>Deadline:</strong> {currentOpp?.deadline}</div>
              <div><strong>Location:</strong> {currentOpp?.location}</div>
              {currentOpp?.compensation && (
                <div><strong>Compensation:</strong> {currentOpp?.compensation}</div>
              )}
            </div>

            {/* Target Requirements */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Opportunity Requirements
              </h3>
              <ul className="text-xs text-slate-700 space-y-1.5">
                {currentOpp?.required_qualifications.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Factual Grounding Guardrail Box */}
            <div className="p-3.5 bg-emerald-50/80 rounded-lg border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Zero-Hallucination Safeguard</span>
              </div>
              <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                The AI is constrained to only draw from your <strong>{verifiedFacts.length} verified career facts</strong>. If an employer requirement is not evidenced in your profile, the system will highlight the omission rather than invent claims.
              </p>
              {groundingNotes.length > 0 && (
                <div className="pt-1 text-[11px] text-emerald-800">
                  <span className="font-medium">Omission flags:</span>
                  <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                    {groundingNotes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Interactive Application Workspace */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
            {/* Studio Workspace Header Tabs */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('cv')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'cv'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Tailored CV</span>
                </button>
                <button
                  onClick={() => setActiveTab('cover_letter')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'cover_letter'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Cover Letter</span>
                </button>
                <button
                  onClick={() => setActiveTab('answers')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeTab === 'answers'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Screening Answers</span>
                </button>
              </div>

              {/* View / Edit Mode Toggle */}
              {activeTab !== 'answers' && (
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                  <button
                    onClick={() => setPreviewMode('edit')}
                    className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                      previewMode === 'edit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setPreviewMode('preview')}
                    className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                      previewMode === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Preview
                  </button>
                </div>
              )}
            </div>

            {/* Custom Instructions Bar */}
            <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                placeholder="Optional direction: e.g. Emphasize distributed architecture and leadership metrics..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                onClick={() => handleGenerateDocument(activeTab === 'answers' ? 'screening_answers' : activeTab)}
                disabled={isGenerating}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shadow-xs disabled:bg-slate-300"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Grounded Draft...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Tailored {activeTab === 'cv' ? 'CV' : activeTab === 'cover_letter' ? 'Letter' : 'Answers'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Editor & Content Area */}
            <div className="p-5 flex-1 min-h-[420px]">
              {activeTab === 'cv' && (
                previewMode === 'edit' ? (
                  <textarea
                    rows={18}
                    value={cvContent}
                    onChange={(e) => setCvContent(e.target.value)}
                    placeholder="Click 'Generate Tailored CV' above or paste your resume content here..."
                    className="w-full h-full p-4 text-xs font-mono bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white resize-none leading-relaxed"
                  />
                ) : (
                  <div className="p-6 bg-white border border-slate-200 rounded-lg prose prose-sm max-w-none text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                    {cvContent || 'No CV content generated yet.'}
                  </div>
                )
              )}

              {activeTab === 'cover_letter' && (
                previewMode === 'edit' ? (
                  <textarea
                    rows={18}
                    value={coverLetterContent}
                    onChange={(e) => setCoverLetterContent(e.target.value)}
                    placeholder="Click 'Generate Tailored Letter' above to draft a tailored cover letter grounded in verified facts..."
                    className="w-full h-full p-4 text-xs font-sans bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white resize-none leading-relaxed"
                  />
                ) : (
                  <div className="p-6 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                    {coverLetterContent || 'No cover letter content generated yet.'}
                  </div>
                )
              )}

              {activeTab === 'answers' && (
                <div className="space-y-4">
                  {screeningAnswers.length > 0 ? (
                    screeningAnswers.map((ans, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-900">
                            Question {idx + 1}: {ans.question}
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                            ans.verification_status === 'grounded_in_profile' 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {ans.verification_status === 'grounded_in_profile' ? 'Grounded in Profile' : 'Input Required'}
                          </span>
                        </div>

                        <textarea
                          rows={3}
                          value={ans.answer}
                          onChange={(e) => {
                            const updated = [...screeningAnswers];
                            updated[idx] = { ...updated[idx], answer: e.target.value };
                            setScreeningAnswers(updated);
                          }}
                          className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />

                        <div className="text-[11px] text-slate-500">
                          Source: {ans.answer_source || 'Verified Profile Record'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                      <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
                      <div>No screening answers drafted yet.</div>
                      <p className="text-[11px]">Click "Generate Tailored Answers" to draft role-specific responses.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Bar Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyText}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  {copiedNotification ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadFile}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Document</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSavePackage}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
                >
                  Save Version
                </button>

                {existingApp && (
                  <button
                    onClick={() => {
                      handleSavePackage();
                      onOpenApprovalModal(existingApp);
                    }}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Proceed to Submission Approval</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
