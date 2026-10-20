/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OpportunityCategory = 
  | 'Job'
  | 'Internship'
  | 'Fellowship'
  | 'Scholarship'
  | 'Grant'
  | 'Graduate Programme';

export type WorkArrangement = 'Remote' | 'Hybrid' | 'On-site' | 'Not specified';

export type FactType = 
  | 'summary'
  | 'education'
  | 'experience'
  | 'project'
  | 'skill'
  | 'certification'
  | 'achievement'
  | 'language';

export type VerificationStatus = 'verified' | 'pending_review' | 'ai_inferred';

export interface CareerFact {
  id: string;
  user_id: string;
  fact_type: FactType;
  title: string;
  subtitle?: string;
  date_range?: string;
  description?: string;
  highlights?: string[];
  skills?: string[];
  source_document_id?: string;
  verification_status: VerificationStatus;
  verified_at?: string;
  confidence_score?: number; // 0-100
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  location: string;
  professional_summary: string;
  career_goals: string;
  preferred_roles: string[];
  preferred_locations: string[];
  preferred_work_arrangements: WorkArrangement[];
  preferred_opportunity_types: OpportunityCategory[];
  eligibility_status: {
    work_authorization: string[];
    highest_degree: string;
    years_of_experience: number;
    citizenship: string;
    willing_to_relocate: boolean;
  };
  profile_completeness: number; // 0-100
  created_at: string;
  updated_at: string;
}

export interface CareerDocument {
  id: string;
  user_id: string;
  document_type: 'cv' | 'portfolio' | 'transcript' | 'other';
  original_filename: string;
  mime_type: string;
  file_size_kb: number;
  extracted_facts_count: number;
  processing_status: 'processed' | 'pending' | 'failed';
  uploaded_at: string;
  raw_text?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  description: string;
  location: string;
  work_arrangement: WorkArrangement;
  employment_type?: string;
  required_qualifications: string[];
  required_skills: string[];
  preferred_skills: string[];
  experience_requirements: string;
  eligibility_criteria: string[];
  compensation?: string;
  funding_amount?: string;
  deadline: string;
  original_url: string;
  application_destination: string;
  publication_date: string;
  last_verified_at: string;
  status: 'Active' | 'Closing Soon' | 'Archived';
  source_id: string;
  source_name: string;
  source_type: 'greenhouse' | 'lever' | 'public_feed' | 'manual_import';
  duplicate_count?: number;
  duplicate_sources?: string[];
  created_at: string;
  updated_at: string;
}

export interface FitAssessment {
  opportunity_id: string;
  fit_score: number; // 0-100
  fit_level: 'High Fit' | 'Moderate Fit' | 'Growth Opportunity' | 'Mandatory Criteria Unmet';
  fit_explanation: string;
  matched_requirements: string[];
  partial_requirements: string[];
  missing_evidence: string[];
  unmet_mandatory: string[];
  suggested_actions: string[];
  assessed_at: string;
}

export interface UserOpportunity {
  id: string;
  user_id: string;
  opportunity_id: string;
  saved_status: boolean;
  fit_assessment?: FitAssessment;
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus =
  | 'Interested'
  | 'Saved'
  | 'Preparing'
  | 'Awaiting review'
  | 'Ready to submit'
  | 'Submitted'
  | 'Assessment'
  | 'Interview'
  | 'Offer'
  | 'Rejected'
  | 'Withdrawn'
  | 'Closed';

export interface DocumentVersion {
  id: string;
  application_id: string;
  document_type: 'cv' | 'cover_letter';
  version_number: number;
  title: string;
  content: string; // Markdown / Plain Text
  generation_metadata: {
    grounded_facts_used: string[];
    missing_facts_flagged: string[];
    tailored_focus: string;
    model_used: string;
    word_count: number;
  };
  created_at: string;
}

export interface ApplicationAnswer {
  id: string;
  application_id: string;
  question: string;
  answer: string;
  answer_source: string;
  verification_status: 'grounded_in_profile' | 'requires_user_input';
  notes?: string;
  approved_at?: string;
  created_at: string;
}

export interface ApplicationEvent {
  id: string;
  application_id: string;
  event_type: 
    | 'created'
    | 'status_changed'
    | 'material_generated'
    | 'material_edited'
    | 'approval_granted'
    | 'submitted'
    | 'interview_scheduled'
    | 'outcome_logged';
  event_details: string;
  timestamp: string;
}

export interface Application {
  id: string;
  user_id: string;
  opportunity_id: string;
  status: ApplicationStatus;
  application_url: string;
  submitted_at?: string;
  deadline: string;
  next_follow_up_at?: string;
  submission_method: 'User Guided / External Portal' | 'Direct API Submission';
  submission_confirmation?: {
    confirmed_at: string;
    confirmation_code?: string;
    notes: string;
  };
  notes: string;
  cv_versions: DocumentVersion[];
  cover_letter_versions: DocumentVersion[];
  screening_answers: ApplicationAnswer[];
  events: ApplicationEvent[];
  created_at: string;
  updated_at: string;
}

export interface OpportunitySource {
  id: string;
  name: string;
  source_type: string;
  base_url: string;
  integration_status: 'Healthy' | 'Syncing' | 'Degraded';
  records_count: number;
  last_synced_at: string;
  created_at: string;
}

export interface SourceSyncRun {
  id: string;
  source_id: string;
  source_name: string;
  started_at: string;
  completed_at?: string;
  status: 'Completed' | 'Running' | 'Failed';
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  error_summary?: string;
}

export interface ConsentRecord {
  id: string;
  user_id: string;
  consent_type: 'external_submission' | 'data_retention' | 'ai_tailoring';
  scope: string;
  status: 'granted' | 'revoked';
  granted_at: string;
  metadata: Record<string, any>;
}

export type PersonaType = 
  | 'active_job_seeker'
  | 'early_career'
  | 'multi_opportunity'
  | 'platform_admin';
