/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Profile, 
  CareerFact, 
  FactType, 
  VerificationStatus,
  WorkArrangement 
} from '../types';
import { extractCVFacts } from '../utils/api';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Upload, 
  FileText, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';

interface CareerProfileViewProps {
  profile: Profile;
  facts: CareerFact[];
  onUpdateProfile: (updatedProfile: Profile) => void;
  onAddFact: (fact: CareerFact) => void;
  onVerifyFact: (factId: string) => void;
  onDeleteFact: (factId: string) => void;
  onUpdateFact: (updatedFact: CareerFact) => void;
}

export const CareerProfileView: React.FC<CareerProfileViewProps> = ({
  profile,
  facts,
  onUpdateProfile,
  onAddFact,
  onVerifyFact,
  onDeleteFact,
  onUpdateFact,
}) => {
  const [selectedFactType, setSelectedFactType] = useState<FactType | 'all'>('all');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Profile>(profile);

  // CV Upload state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [cvInputText, setCvInputText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // Add Fact Modal state
  const [isAddFactModalOpen, setIsAddFactModalOpen] = useState(false);
  const [newFactType, setNewFactType] = useState<FactType>('experience');
  const [newFactTitle, setNewFactTitle] = useState('');
  const [newFactSubtitle, setNewFactSubtitle] = useState('');
  const [newFactDates, setNewFactDates] = useState('');
  const [newFactDesc, setNewFactDesc] = useState('');
  const [newFactSkills, setNewFactSkills] = useState('');

  // Fact filter
  const filteredFacts = facts.filter((f) => {
    if (selectedFactType === 'all') return true;
    return f.fact_type === selectedFactType;
  });

  const verifiedCount = facts.filter(f => f.verification_status === 'verified').length;
  const pendingCount = facts.filter(f => f.verification_status === 'pending_review').length;
  const inferredCount = facts.filter(f => f.verification_status === 'ai_inferred').length;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editedProfile);
    setIsEditingProfile(false);
  };

  const handleCvExtraction = async () => {
    if (!cvInputText.trim()) return;
    setIsExtracting(true);
    try {
      const res = await extractCVFacts(cvInputText.trim(), 'Uploaded_Resume.pdf');
      if (res.success && res.facts) {
        res.facts.forEach((item: any, idx: number) => {
          const newFact: CareerFact = {
            id: `fact-extracted-${Date.now()}-${idx}`,
            user_id: profile.user_id,
            fact_type: (item.fact_type as FactType) || 'experience',
            title: item.title || 'Extracted Item',
            subtitle: item.subtitle || 'CV Extraction',
            date_range: item.date_range,
            description: item.description,
            highlights: item.highlights || [],
            skills: item.skills || [],
            source_document_id: 'doc-uploaded',
            verification_status: 'pending_review', // FR-004: awaiting user verification
            confidence_score: item.confidence_score || 85,
            notes: 'Extracted automatically from uploaded document. Review before verifying.',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          onAddFact(newFact);
        });
        setIsUploadModalOpen(false);
        setCvInputText('');
      }
    } catch (e) {
      console.error('CV Extraction failed', e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCreateManualFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactTitle.trim()) return;

    const parsedSkills = newFactSkills.split(',').map(s => s.trim()).filter(Boolean);
    const newFact: CareerFact = {
      id: `fact-manual-${Date.now()}`,
      user_id: profile.user_id,
      fact_type: newFactType,
      title: newFactTitle.trim(),
      subtitle: newFactSubtitle.trim() || undefined,
      date_range: newFactDates.trim() || undefined,
      description: newFactDesc.trim() || undefined,
      skills: parsedSkills.length > 0 ? parsedSkills : undefined,
      verification_status: 'verified', // Manually entered by user is verified
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onAddFact(newFact);
    setIsAddFactModalOpen(false);
    setNewFactTitle('');
    setNewFactSubtitle('');
    setNewFactDates('');
    setNewFactDesc('');
    setNewFactSkills('');
  };

  const loadSampleCvText = () => {
    setCvInputText(`DR. ALEXANDER V. MOROZOV
Zurich, Switzerland · alex.morozov@example.com · +41 78 901 23 45

EDUCATION
Ph.D. in Computer Science & Distributed Algorithms
ETH Zurich (2020 - 2024)
- Dissertation on Low-Latency Consensus Protocols for Edge Computing Networks.
- Co-authored 4 peer-reviewed conference publications in IEEE/ACM transactions.

EXPERIENCE
Lead Distributed Systems Engineer
Nexura Infrastructure Labs (2024 - Present)
- Engineered Byzantine fault-tolerant Raft replication layer in Go, reducing commit latency by 42%.
- Designed zero-knowledge state proofs and automated chaos engineering suites in Kubernetes.

Research Fellow
CERN Computing Division (2022 - 2023)
- Scaled petabyte-scale event pipeline processing high-luminosity LHC detector streams.
- Optimized C++ data decompression kernels using AVX-512 vectorization.

HONORS & CREDENTIALS
- Best Paper Award, European Conference on Distributed Systems (2023)
- AWS Certified Advanced Networking Specialty (Active)`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Verification Counter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Career Profile & Verified Facts
          </h1>
          <p className="text-xs md:text-sm text-slate-600 mt-1">
            FR-004 & FR-005 · The verified single source of truth for all tailored applications
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Upload CV & Extract</span>
          </button>
          <button
            onClick={() => setIsAddFactModalOpen(true)}
            className="px-3.5 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Career Fact</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Personal & Career Objectives</h2>
            <span className="text-xs text-slate-500 font-mono">
              (Completeness: {profile.profile_completeness}%)
            </span>
          </div>

          {!isEditingProfile ? (
            <button
              onClick={() => {
                setEditedProfile(profile);
                setIsEditingProfile(true);
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileSave}
                className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {!isEditingProfile ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="md:col-span-2 space-y-3">
              <div>
                <span className="font-semibold text-slate-700 block mb-0.5">Professional Summary:</span>
                <p className="text-slate-600 leading-relaxed">{profile.professional_summary}</p>
              </div>
              <div>
                <span className="font-semibold text-slate-700 block mb-0.5">Career Goals:</span>
                <p className="text-slate-600 leading-relaxed">{profile.career_goals}</p>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <span className="font-semibold text-slate-700 block mb-0.5">Eligibility & Work Authorization:</span>
                <div className="text-slate-600">
                  {(profile.eligibility_status.work_authorization || []).join(' · ')}
                </div>
              </div>
              <div>
                <span className="font-semibold text-slate-700 block mb-0.5">Degree & Experience:</span>
                <div className="text-slate-600">
                  {profile.eligibility_status.highest_degree} · {profile.eligibility_status.years_of_experience} yrs verified
                </div>
              </div>
              <div>
                <span className="font-semibold text-slate-700 block mb-0.5">Target Roles:</span>
                <div className="text-slate-600 flex flex-wrap gap-1 mt-0.5">
                  {profile.preferred_roles.map((r) => (
                    <span key={r} className="bg-white px-2 py-0.5 rounded border border-slate-200">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editedProfile.full_name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editedProfile.email}
                  onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Professional Summary</label>
              <textarea
                rows={3}
                value={editedProfile.professional_summary}
                onChange={(e) => setEditedProfile({ ...editedProfile, professional_summary: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Career Goals</label>
              <textarea
                rows={2}
                value={editedProfile.career_goals}
                onChange={(e) => setEditedProfile({ ...editedProfile, career_goals: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white"
              />
            </div>
          </form>
        )}
      </div>

      {/* Fact Grounding Notice & Filter Tabs */}
      <div className="space-y-4">
        {/* Verification Status Counter Strip */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{verifiedCount} Verified Facts</span>
            </div>
            <span aria-hidden="true" className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-amber-800 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{pendingCount} Awaiting Review</span>
            </div>
            <span aria-hidden="true" className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 text-purple-800 font-medium">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>{inferredCount} AI Suggestions</span>
            </div>
          </div>

          <div className="text-slate-500 flex items-center gap-1 text-[11px]">
            <Info className="w-3.5 h-3.5" />
            <span>PRD Section 9.2: Only verified facts are asserted in applications.</span>
          </div>
        </div>

        {/* Fact Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {([
            'all',
            'experience',
            'education',
            'project',
            'skill',
            'certification',
            'achievement'
          ] as (FactType | 'all')[]).map((type) => {
            const count = type === 'all' 
              ? facts.length 
              : facts.filter(f => f.fact_type === type).length;
            const isActive = selectedFactType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedFactType(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap capitalize transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <span>{type}</span>
                <span className={`text-[11px] font-mono tabular-nums ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Career Facts Cards List */}
        <div className="space-y-3">
          {filteredFacts.map((fact) => {
            const isVerified = fact.verification_status === 'verified';
            const isPending = fact.verification_status === 'pending_review';
            const isInferred = fact.verification_status === 'ai_inferred';

            return (
              <div
                key={fact.id}
                className={`bg-white rounded-xl p-5 border transition-all shadow-xs ${
                  isPending 
                    ? 'border-amber-300/80 bg-amber-50/20' 
                    : isInferred 
                    ? 'border-purple-200/80 bg-purple-50/20'
                    : 'border-slate-200/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    {/* Unboxed Metadata Header */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="capitalize font-medium text-slate-700">{fact.fact_type}</span>
                      {fact.date_range && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{fact.date_range}</span>
                        </>
                      )}
                      {fact.confidence_score && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Confidence: {fact.confidence_score}%</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-slate-900">
                      {fact.title}
                    </h3>
                    {fact.subtitle && (
                      <div className="text-xs font-medium text-slate-700">
                        {fact.subtitle}
                      </div>
                    )}

                    {fact.description && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-1">
                        {fact.description}
                      </p>
                    )}

                    {fact.highlights && fact.highlights.length > 0 && (
                      <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pt-1">
                        {fact.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    )}

                    {fact.skills && fact.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {fact.skills.map((s) => (
                          <span
                            key={s}
                            className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {fact.notes && (
                      <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200/60 mt-2">
                        {fact.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions & Verification Badges */}
                  <div className="flex items-center sm:flex-col gap-2 shrink-0 sm:items-end">
                    {isVerified && (
                      <div className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified</span>
                      </div>
                    )}

                    {isPending && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onVerifyFact(fact.id)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Verify Fact</span>
                        </button>
                        <button
                          onClick={() => onDeleteFact(fact.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Reject / Delete Fact"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {isInferred && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onVerifyFact(fact.id)}
                          className="px-3 py-1.5 text-xs font-medium text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Confirm Fact</span>
                        </button>
                        <button
                          onClick={() => onDeleteFact(fact.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Dismiss Inferred Fact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {isVerified && (
                      <button
                        onClick={() => onDeleteFact(fact.id)}
                        className="text-xs text-slate-400 hover:text-rose-600 p-1"
                        title="Delete fact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredFacts.length === 0 && (
            <div className="bg-white rounded-xl p-8 border border-slate-200 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-900">No career facts in this category</div>
              <p className="text-xs text-slate-500">
                Upload a CV or manually add a fact to establish verified background records.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CV Upload / Extraction Modal (FR-004) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-slate-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Upload CV & Extract Career Facts
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Paste the text from your CV or resume below. The system will extract structured education, employment, skills, and certifications into a review queue.
                </p>
                <button
                  type="button"
                  onClick={loadSampleCvText}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md whitespace-nowrap transition-colors"
                >
                  Load Sample CV Text
                </button>
              </div>

              <div>
                <textarea
                  rows={10}
                  placeholder="Paste your CV text here..."
                  value={cvInputText}
                  onChange={(e) => setCvInputText(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white font-mono leading-relaxed resize-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                <strong>FR-005 Safeguard:</strong> Extracted items will be marked as "Pending Review" and will NOT be included in generated applications until you explicitly verify them.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCvExtraction}
                disabled={isExtracting || !cvInputText.trim()}
                className={`px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors inline-flex items-center gap-2 ${
                  isExtracting || !cvInputText.trim()
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800 shadow-xs'
                }`}
              >
                {isExtracting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Extracting Facts with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Extraction</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Career Fact Modal */}
      {isAddFactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-semibold text-slate-900">
                Add Verified Career Fact
              </h3>
              <button
                onClick={() => setIsAddFactModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualFact} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Fact Category</label>
                <select
                  value={newFactType}
                  onChange={(e) => setNewFactType(e.target.value as FactType)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white"
                >
                  <option value="experience">Work & Volunteer Experience</option>
                  <option value="education">Education & Academic Degree</option>
                  <option value="project">Key Technical Project</option>
                  <option value="skill">Skill & Competency</option>
                  <option value="certification">Certification & Credential</option>
                  <option value="achievement">Award & Achievement</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Backend Engineer or B.S. in Computer Science"
                  value={newFactTitle}
                  onChange={(e) => setNewFactTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Organization / Institution</label>
                  <input
                    type="text"
                    placeholder="e.g. Google or Stanford University"
                    value={newFactSubtitle}
                    onChange={(e) => setNewFactSubtitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Date Range</label>
                  <input
                    type="text"
                    placeholder="e.g. 2022 - Present"
                    value={newFactDates}
                    onChange={(e) => setNewFactDates(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description & Achievements</label>
                <textarea
                  rows={3}
                  placeholder="Concrete verified achievements, responsibilities, and quantified outcomes..."
                  value={newFactDesc}
                  onChange={(e) => setNewFactDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Associated Skills (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. TypeScript, React, Distributed Systems"
                  value={newFactSkills}
                  onChange={(e) => setNewFactSkills(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddFactModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                >
                  Save Verified Fact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
