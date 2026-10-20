/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Profile, 
  CareerFact, 
  Opportunity, 
  OpportunitySource, 
  SourceSyncRun, 
  Application,
  PersonaType 
} from '../types';

export const INITIAL_PROFILES: Record<PersonaType, Profile> = {
  active_job_seeker: {
    id: 'prof-chikezie',
    user_id: 'user-chikezie',
    full_name: 'Chikezie Onyiaodike',
    email: 'chikezie.onyiaodike@example.com',
    phone: '+1 (555) 234-8901',
    location: 'San Francisco, CA (Open to Remote / Europe)',
    professional_summary: 'Senior Full-Stack & Distributed Systems Engineer with 6+ years building resilient web services, real-time collaboration engines, and developer infrastructure. Proven track record leading API architecture at scale.',
    career_goals: 'Advance to Staff Engineer or Technical Lead at an engineering-led product company focusing on developer tools, cloud infrastructure, or real-time distributed platforms.',
    preferred_roles: ['Senior Full-Stack Engineer', 'Staff Systems Engineer', 'Technical Lead', 'Platform Architect'],
    preferred_locations: ['San Francisco, CA', 'Remote (Global)', 'London, UK', 'Berlin, Germany'],
    preferred_work_arrangements: ['Remote', 'Hybrid'],
    preferred_opportunity_types: ['Job', 'Fellowship'],
    eligibility_status: {
      work_authorization: ['US Citizen', 'EU Blue Card Eligible'],
      highest_degree: 'B.S. in Computer Science',
      years_of_experience: 6,
      citizenship: 'United States',
      willing_to_relocate: true,
    },
    profile_completeness: 88,
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-10-18T14:30:00Z',
  },
  early_career: {
    id: 'prof-marcus',
    user_id: 'user-marcus',
    full_name: 'Marcus Chen',
    email: 'marcus.chen@alumni.edu',
    phone: '+44 20 7946 0192',
    location: 'Cambridge, UK',
    professional_summary: 'Recent Master of Science in Advanced Computer Science with distinction from University of Cambridge. Strong foundation in machine learning systems, statistical modeling, and Python/C++. Published workshop author in multimodal reasoning.',
    career_goals: 'Secure a prestigious graduate rotation programme or research fellowship in applied AI/ML systems where I can transition academic research into production impact.',
    preferred_roles: ['Associate Machine Learning Engineer', 'AI Research Resident', 'Graduate Software Engineer', 'Research Fellow'],
    preferred_locations: ['Cambridge, UK', 'London, UK', 'Zurich, Switzerland', 'Remote (EMEA)'],
    preferred_work_arrangements: ['Hybrid', 'On-site', 'Remote'],
    preferred_opportunity_types: ['Graduate Programme', 'Fellowship', 'Internship', 'Job'],
    eligibility_status: {
      work_authorization: ['UK Graduate Visa (2 years)', 'Singapore Citizen'],
      highest_degree: 'M.Sc. in Advanced Computer Science',
      years_of_experience: 1,
      citizenship: 'Singapore',
      willing_to_relocate: true,
    },
    profile_completeness: 79,
    created_at: '2026-06-20T10:00:00Z',
    updated_at: '2026-10-19T11:00:00Z',
  },
  multi_opportunity: {
    id: 'prof-amara',
    user_id: 'user-amara',
    full_name: 'Dr. Amara Diallo',
    email: 'amara.diallo@biolab.org',
    phone: '+33 1 42 68 55 00',
    location: 'Paris, France (Open to Global Relocation)',
    professional_summary: 'Computational Biologist & Climate Systems Scientist with PhD in Molecular Genetics. Specializes in metagenomic sequence analysis, protein folding simulations, and open science data pipelines.',
    career_goals: 'Pursuing independent research fellowships, discovery grants, or lead scientist positions in climate biotech tackling carbon sequestration and microbial genomics.',
    preferred_roles: ['Principal Investigator', 'Postdoctoral Fellow', 'Lead Computational Biologist', 'Senior Bioinformatician'],
    preferred_locations: ['Paris, France', 'Geneva, Switzerland', 'Boston, MA', 'Oxford, UK'],
    preferred_work_arrangements: ['Hybrid', 'On-site'],
    preferred_opportunity_types: ['Fellowship', 'Grant', 'Scholarship', 'Job'],
    eligibility_status: {
      work_authorization: ['EU Citizen (France)', 'J-1 Scholar Eligible'],
      highest_degree: 'Ph.D. in Computational Biology',
      years_of_experience: 4,
      citizenship: 'France',
      willing_to_relocate: true,
    },
    profile_completeness: 94,
    created_at: '2026-03-01T08:00:00Z',
    updated_at: '2026-10-20T06:00:00Z',
  },
  platform_admin: {
    id: 'prof-admin',
    user_id: 'user-admin',
    full_name: 'Kezie Odike',
    email: 'kezieodike@gmail.com',
    location: 'Operations & Engineering HQ',
    professional_summary: 'Platform Administrator & Quality Lead. Oversees source health, AI factual grounding evaluations, ingestion pipelines, and compliance audit logs.',
    career_goals: 'Maintain platform reliability, 100% factual grounding integrity, and seamless multi-source integration.',
    preferred_roles: ['Platform Administrator'],
    preferred_locations: ['HQ'],
    preferred_work_arrangements: ['Remote'],
    preferred_opportunity_types: ['Job', 'Fellowship', 'Grant', 'Scholarship'],
    eligibility_status: {
      work_authorization: ['Global Admin'],
      highest_degree: 'Senior Technical Lead',
      years_of_experience: 10,
      citizenship: 'United Kingdom',
      willing_to_relocate: false,
    },
    profile_completeness: 100,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-10-20T07:00:00Z',
  }
};

export const INITIAL_FACTS: CareerFact[] = [
  // Chikezie's verified facts
  {
    id: 'fact-1',
    user_id: 'user-chikezie',
    fact_type: 'experience',
    title: 'Senior Software Engineer',
    subtitle: 'Veloce Cloud Systems · Full-time',
    date_range: '2023 - Present',
    description: 'Designed and deployed multi-tenant websocket pub/sub pipeline handling 450,000 active concurrent connections with p99 latency under 28ms.',
    highlights: [
      'Migrated legacy monolithic services to Go and Node.js microservices with zero downtime.',
      'Reduced cloud egress costs by 34% through intelligent payload delta compression.',
      'Mentored 4 junior and mid-level engineers in distributed debugging and automated integration testing.'
    ],
    skills: ['TypeScript', 'Node.js', 'Go', 'Redis', 'PostgreSQL', 'Docker', 'Kubernetes', 'WebSockets'],
    source_document_id: 'doc-elena-resume',
    verification_status: 'verified',
    verified_at: '2026-01-16T10:00:00Z',
    created_at: '2026-01-15T09:30:00Z',
    updated_at: '2026-01-16T10:00:00Z',
  },
  {
    id: 'fact-2',
    user_id: 'user-chikezie',
    fact_type: 'experience',
    title: 'Full-Stack Software Engineer',
    subtitle: 'Aura Interactive · Full-time',
    date_range: '2020 - 2023',
    description: 'Core contributor to real-time design collaboration canvas using WebGL and CRDT conflict resolution algorithms.',
    highlights: [
      'Engineered optimistic UI rendering that cut perceived canvas latency from 120ms to 8ms.',
      'Authored automated end-to-end testing suite achieving 92% coverage across critical state machines.'
    ],
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'CRDTs', 'GraphQL', 'Jest', 'Cypress'],
    source_document_id: 'doc-elena-resume',
    verification_status: 'verified',
    verified_at: '2026-01-16T10:00:00Z',
    created_at: '2026-01-15T09:30:00Z',
    updated_at: '2026-01-16T10:00:00Z',
  },
  {
    id: 'fact-3',
    user_id: 'user-chikezie',
    fact_type: 'education',
    title: 'B.S. in Computer Science',
    subtitle: 'University of Washington · Magna Cum Laude',
    date_range: '2016 - 2020',
    description: 'Specialization in Distributed Systems & Human-Computer Interaction. GPA: 3.86/4.0.',
    highlights: ['Dean’s Honor List all semesters', 'Teaching Assistant for Data Structures & Algorithms (CSE 373)'],
    skills: ['Algorithms', 'Distributed Systems', 'Computer Architecture'],
    source_document_id: 'doc-elena-resume',
    verification_status: 'verified',
    verified_at: '2026-01-16T10:00:00Z',
    created_at: '2026-01-15T09:30:00Z',
    updated_at: '2026-01-16T10:00:00Z',
  },
  {
    id: 'fact-4',
    user_id: 'user-chikezie',
    fact_type: 'project',
    title: 'FastCRDT Open Source Library',
    subtitle: 'Lead Creator & Maintainer',
    date_range: '2024 - Present',
    description: 'High-performance, zero-dependency JSON CRDT engine for state synchronization in browser and Node environments. 2,800+ GitHub stars.',
    highlights: ['Benchmarked at 4x faster throughput compared to Automerge v1 on text splice benchmarks.'],
    skills: ['TypeScript', 'Performance Optimization', 'Open Source', 'Algorithms'],
    verification_status: 'verified',
    verified_at: '2026-03-10T12:00:00Z',
    created_at: '2026-03-10T12:00:00Z',
    updated_at: '2026-03-10T12:00:00Z',
  },
  {
    id: 'fact-5',
    user_id: 'user-chikezie',
    fact_type: 'skill',
    title: 'Core Technical Stack',
    description: 'Extensively verified in production systems over 5+ years.',
    skills: ['TypeScript', 'React', 'Node.js', 'Go', 'PostgreSQL', 'Redis', 'Docker', 'REST APIs', 'GraphQL', 'Tailwind CSS'],
    verification_status: 'verified',
    verified_at: '2026-01-16T10:00:00Z',
    created_at: '2026-01-15T09:30:00Z',
    updated_at: '2026-01-16T10:00:00Z',
  },
  // Extracted item awaiting user review (Demonstrates FR-004 & FR-005)
  {
    id: 'fact-6',
    user_id: 'user-chikezie',
    fact_type: 'certification',
    title: 'AWS Certified Solutions Architect – Associate',
    subtitle: 'Amazon Web Services',
    date_range: 'Issued Nov 2024 · Expires Nov 2027',
    description: 'Extracted automatically from uploaded CV file. Verification requested to validate credential ID and active status.',
    confidence_score: 95,
    source_document_id: 'doc-elena-resume',
    verification_status: 'pending_review',
    notes: 'Please confirm active validation code before including in official submissions.',
    created_at: '2026-10-18T14:35:00Z',
    updated_at: '2026-10-18T14:35:00Z',
  },
  {
    id: 'fact-7',
    user_id: 'user-chikezie',
    fact_type: 'achievement',
    title: 'HackTech Global Grand Prize Winner',
    subtitle: 'First Place out of 340 international teams',
    date_range: '2022',
    description: 'Created peer-to-peer offline mesh dispatch application for emergency medical coordination.',
    confidence_score: 88,
    source_document_id: 'doc-elena-resume',
    verification_status: 'pending_review',
    notes: 'Detected in CV "Honors & Competitions" section.',
    created_at: '2026-10-18T14:35:00Z',
    updated_at: '2026-10-18T14:35:00Z',
  },
  {
    id: 'fact-8',
    user_id: 'user-chikezie',
    fact_type: 'skill',
    title: 'Rust & WebAssembly Experience',
    description: 'AI inferred from commit history and side project FastCRDT repository.',
    skills: ['Rust', 'WebAssembly', 'Memory Management'],
    confidence_score: 72,
    verification_status: 'ai_inferred',
    notes: 'Marked as unverified inference. Will NOT be asserted in tailored applications unless verified by user.',
    created_at: '2026-10-18T15:00:00Z',
    updated_at: '2026-10-18T15:00:00Z',
  }
];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'Senior Full-Stack Infrastructure Engineer',
    organization: 'Stripe',
    category: 'Job',
    description: 'Join Stripe’s Core Applications team to build next-generation developer tooling, financial dashboard architecture, and resilient API gateways serving millions of global businesses.',
    location: 'San Francisco, CA / Seattle, WA (Remote friendly)',
    work_arrangement: 'Remote',
    employment_type: 'Full-time',
    required_qualifications: [
      '5+ years professional experience building production web services and distributed systems.',
      'Deep fluency with TypeScript/JavaScript, React, and server-side languages (Go, Java, or Ruby).',
      'Strong architectural intuition for database schema design, caching strategies, and API reliability.'
    ],
    required_skills: ['TypeScript', 'React', 'Node.js', 'Go', 'Distributed Systems', 'PostgreSQL'],
    preferred_skills: ['Redis', 'Kafka', 'GraphQL', 'Observability (Datadog/OpenTelemetry)'],
    experience_requirements: '5+ years software engineering experience',
    eligibility_criteria: ['Authorized to work in the US without current visa sponsorship requirements'],
    compensation: '$185,000 - $235,000 USD + Equity + Comprehensive Benefits',
    deadline: '2026-11-30',
    original_url: 'https://boards.greenhouse.io/stripe/jobs/4982710002',
    application_destination: 'Greenhouse ATS (Direct Job Board)',
    publication_date: '2026-10-14',
    last_verified_at: '2026-10-20T04:00:00Z',
    status: 'Active',
    source_id: 'src-gh',
    source_name: 'Greenhouse API Feeds',
    source_type: 'greenhouse',
    duplicate_count: 2,
    duplicate_sources: ['Lever Public API', 'LinkedIn Jobs Feed'],
    created_at: '2026-10-14T10:00:00Z',
    updated_at: '2026-10-20T04:00:00Z',
  },
  {
    id: 'opp-2',
    title: 'Staff Frontend Systems Architect',
    organization: 'Linear',
    category: 'Job',
    description: 'Linear is looking for a Staff Frontend Architect to push the boundaries of real-time application performance, local-first database synchronization, and fluid desktop-grade keyboard interactions.',
    location: 'Remote (Worldwide)',
    work_arrangement: 'Remote',
    employment_type: 'Full-time',
    required_qualifications: [
      '6+ years developing high-performance web applications with exceptional attention to UX and speed.',
      'Proven mastery of CRDTs, client-side SQLite/IndexedDB syncing, or local-first architecture.',
      'Exemplary technical leadership and cross-functional design collaboration.'
    ],
    required_skills: ['TypeScript', 'React', 'CRDTs', 'Local-First Systems', 'Performance Profiling'],
    preferred_skills: ['WebSockets', 'Tailwind CSS', 'IndexedDB', 'Wasm'],
    experience_requirements: '6+ years in frontend engineering and architecture',
    eligibility_criteria: ['Global remote applicants welcome; overlap with UTC-8 to UTC+2 working hours'],
    compensation: '$210,000 - $260,000 USD + Top-tier Equity',
    deadline: '2026-12-15',
    original_url: 'https://linear.app/careers/staff-frontend-architect',
    application_destination: 'Linear Custom Career Portal',
    publication_date: '2026-10-16',
    last_verified_at: '2026-10-20T05:30:00Z',
    status: 'Active',
    source_id: 'src-lever',
    source_name: 'Lever Direct Feeds',
    source_type: 'lever',
    duplicate_count: 1,
    duplicate_sources: ['RemoteOK Ingestion'],
    created_at: '2026-10-16T12:00:00Z',
    updated_at: '2026-10-20T05:30:00Z',
  },
  {
    id: 'opp-3',
    title: 'Mozilla Technology & Society Fellowship 2027',
    organization: 'Mozilla Foundation',
    category: 'Fellowship',
    description: 'An 18-month fully funded fellowship empowering technologists, software engineers, and public interest advocates to develop open-source systems that safeguard digital rights, transparency, and accessible web standards.',
    location: 'Remote or Mozilla Spaces (Berlin, London, San Francisco)',
    work_arrangement: 'Remote',
    employment_type: '18-month Fellowship',
    required_qualifications: [
      'Demonstrated commitment to open-source software, ethical technology, or decentralized protocols.',
      'Clear project proposal outlining tangible software impact or developer tools.',
      'Proven record of independent execution in software or research.'
    ],
    required_skills: ['Open Source', 'Software Architecture', 'Technical Writing', 'Public Interest Tech'],
    preferred_skills: ['Decentralized Systems', 'Web Privacy Standards', 'Community Leadership'],
    experience_requirements: '3+ years relevant software, civic tech, or academic experience',
    eligibility_criteria: ['Open to international applicants; no nationality restrictions'],
    funding_amount: '$120,000 USD stipend + $15,000 project equipment & travel allowance',
    deadline: '2026-11-15',
    original_url: 'https://foundation.mozilla.org/en/fellowships/apply-2027',
    application_destination: 'Mozilla Submittable Portal',
    publication_date: '2026-09-01',
    last_verified_at: '2026-10-19T22:00:00Z',
    status: 'Closing Soon',
    source_id: 'src-fellowship',
    source_name: 'Global Fellowships Syndicate',
    source_type: 'public_feed',
    duplicate_count: 0,
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-10-19T22:00:00Z',
  },
  {
    id: 'opp-4',
    title: 'Rhodes Scholarship for International Postgraduate Study 2027',
    organization: 'The Rhodes Trust / University of Oxford',
    category: 'Scholarship',
    description: 'The world’s oldest and perhaps most prestigious international graduate scholarship, enabling outstanding young leaders from around the world to undertake postgraduate study at the University of Oxford.',
    location: 'Oxford, United Kingdom',
    work_arrangement: 'On-site',
    employment_type: 'Full 2 to 3-year Postgraduate Degree',
    required_qualifications: [
      'Completed Bachelor’s degree with First Class Honours, GPA >= 3.75/4.0, or equivalent distinction.',
      'Literary and scholastic attainments of highest order.',
      'Energy to use one’s talents to the full, moral force of character, and instincts to lead.'
    ],
    required_skills: ['Academic Rigor', 'Leadership', 'Ethics', 'Written & Oral Advocacy'],
    preferred_skills: ['Peer-reviewed Publications', 'Community Impact Projects'],
    experience_requirements: 'Undergraduate degree completed before October 2027; age 18-28',
    eligibility_criteria: ['Citizenship or residency in recognized Rhodes constituency; Bachelor’s degree completed'],
    funding_amount: '100% University & College Tuition Fees + £19,092 per annum living stipend + airfare',
    deadline: '2026-10-28',
    original_url: 'https://www.rhodeshouse.ox.ac.uk/scholarships/apply',
    application_destination: 'Embark Rhodes Application Gateway',
    publication_date: '2026-06-01',
    last_verified_at: '2026-10-20T01:00:00Z',
    status: 'Closing Soon',
    source_id: 'src-academic',
    source_name: 'Oxford Academic Feeds',
    source_type: 'public_feed',
    duplicate_count: 0,
    created_at: '2026-06-01T08:00:00Z',
    updated_at: '2026-10-20T01:00:00Z',
  },
  {
    id: 'opp-5',
    title: 'Wellcome Trust Early-Career Discovery Grant',
    organization: 'Wellcome Trust',
    category: 'Grant',
    description: 'Funding for early-career researchers and computational scientists to develop groundbreaking research programmes in human health, infectious disease dynamics, or genomics.',
    location: 'UK, Republic of Ireland, or Low-to-Middle-Income Countries',
    work_arrangement: 'Hybrid',
    employment_type: '5-year Research Grant',
    required_qualifications: [
      'PhD completed or equivalent research experience in biological sciences, bioinformatics, or data science.',
      'Compelling track record of scientific innovation and verified publications.',
      'Host institution sponsorship agreement.'
    ],
    required_skills: ['Bioinformatics', 'Genomics', 'Grant Writing', 'Python / R', 'Statistical Modeling'],
    preferred_skills: ['Metagenomics', 'High Performance Computing (HPC)'],
    experience_requirements: 'Up to 3 years postdoctoral research experience',
    eligibility_criteria: ['PhD conferred within last 3 years; eligible host institution agreement'],
    funding_amount: 'Up to £400,000 GBP over 5 years (salary + research expenses)',
    deadline: '2026-12-08',
    original_url: 'https://wellcome.org/grant-funding/schemes/early-career-awards',
    application_destination: 'Wellcome Funding Portal (GrantTracker)',
    publication_date: '2026-08-15',
    last_verified_at: '2026-10-18T18:00:00Z',
    status: 'Active',
    source_id: 'src-grants',
    source_name: 'Grants.gov & Wellcome Feed',
    source_type: 'public_feed',
    duplicate_count: 1,
    duplicate_sources: ['UKRI Research Registry'],
    created_at: '2026-08-15T08:00:00Z',
    updated_at: '2026-10-18T18:00:00Z',
  },
  {
    id: 'opp-6',
    title: 'CERN European Graduate Fellowships Programme 2027',
    organization: 'CERN (European Organization for Nuclear Research)',
    category: 'Graduate Programme',
    description: 'Two-year graduate rotation programme for recent graduates in computer science, distributed computing, and electronics to engineer data processing pipelines for high-luminosity particle accelerators.',
    location: 'Geneva, Switzerland',
    work_arrangement: 'On-site',
    employment_type: '2-year Graduate Employment Contract',
    required_qualifications: [
      'Graduated with Bachelor’s or Master’s in Computer Science, Software Engineering, or Applied Physics within past 24 months.',
      'Proficiency in C++, Python, or modern distributed architecture.',
      'Excellent working knowledge of English or French.'
    ],
    required_skills: ['C++', 'Python', 'Linux Systems', 'Distributed Computing'],
    preferred_skills: ['Kubernetes', 'Real-time Systems', 'Data Analysis'],
    experience_requirements: '0 - 2 years post-graduation experience',
    eligibility_criteria: ['Nationals of CERN Member or Associate Member States'],
    compensation: '5,500 CHF/month net tax-free stipend + relocation + health insurance',
    deadline: '2027-01-15',
    original_url: 'https://careers.cern/graduate-programmes',
    application_destination: 'SmartRecruiters CERN Gateway',
    publication_date: '2026-10-01',
    last_verified_at: '2026-10-19T14:00:00Z',
    status: 'Active',
    source_id: 'src-gh',
    source_name: 'European Scientific Research Portal',
    source_type: 'public_feed',
    duplicate_count: 0,
    created_at: '2026-10-01T08:00:00Z',
    updated_at: '2026-10-19T14:00:00Z',
  },
  {
    id: 'opp-7',
    title: 'Frontier AI Research & Systems Intern (Summer 2027)',
    organization: 'Anthropic',
    category: 'Internship',
    description: '12-week intensive research internship working on model interpretability, evaluation harnesses, and scalable distributed training infrastructure.',
    location: 'San Francisco, CA or London, UK',
    work_arrangement: 'Hybrid',
    employment_type: 'Summer Internship (12 weeks)',
    required_qualifications: [
      'Currently enrolled in BS, MS, or PhD programme in Computer Science, Math, or related STEM field.',
      'Proficiency in Python and deep learning frameworks (PyTorch, JAX).',
      'Demonstrated research curiosity and rigorous scientific method.'
    ],
    required_skills: ['Python', 'PyTorch', 'Linear Algebra', 'Systems Programming'],
    preferred_skills: ['Transformer Architectures', 'CUDA / GPU Programming'],
    experience_requirements: 'Enrolled student graduating between Dec 2027 and Summer 2028',
    eligibility_criteria: ['Eligible to work in US or UK for summer duration'],
    compensation: '$65 - $80 USD/hour + housing stipend & travel',
    deadline: '2026-11-20',
    original_url: 'https://boards.greenhouse.io/anthropic/jobs/5918230',
    application_destination: 'Greenhouse ATS',
    publication_date: '2026-10-10',
    last_verified_at: '2026-10-20T03:00:00Z',
    status: 'Active',
    source_id: 'src-gh',
    source_name: 'Greenhouse API Feeds',
    source_type: 'greenhouse',
    duplicate_count: 0,
    created_at: '2026-10-10T11:00:00Z',
    updated_at: '2026-10-20T03:00:00Z',
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    user_id: 'user-chikezie',
    opportunity_id: 'opp-1',
    status: 'Preparing',
    application_url: 'https://boards.greenhouse.io/stripe/jobs/4982710002',
    deadline: '2026-11-30',
    next_follow_up_at: '2026-11-05',
    submission_method: 'User Guided / External Portal',
    notes: 'Tailored CV v2 completed focusing on high-concurrency websocket infrastructure and API latency wins.',
    cv_versions: [
      {
        id: 'cv-stripe-v1',
        application_id: 'app-1',
        document_type: 'cv',
        version_number: 1,
        title: 'Chikezie Onyiaodike - Stripe Tailored CV (v1)',
        content: `# ELENA ROSTOVA
San Francisco, CA · chikezie.onyiaodike@example.com · +1 (555) 234-8901

## PROFESSIONAL SUMMARY
Senior Full-Stack & Distributed Systems Engineer with 6+ years designing high-throughput web infrastructure and real-time collaborative services. Expert in TypeScript, Node.js, Go, and high-concurrency API performance.

## VERIFIED WORK EXPERIENCE

### Senior Software Engineer | Veloce Cloud Systems (2023 - Present)
- Engineered multi-tenant websocket pub/sub pipeline servicing 450,000 concurrent sessions with p99 latency <28ms.
- Migrated core monolithic services to decoupled Go/Node.js microservices with zero operational downtime.
- Reduced cloud egress expenditure by 34% through intelligent payload delta compression.
- Mentored 4 engineers in distributed debugging and automated load testing.

### Full-Stack Software Engineer | Aura Interactive (2020 - 2023)
- Core contributor to collaborative canvas utilizing WebGL and CRDT conflict resolution.
- Engineered optimistic UI rendering cutting perceived user latency from 120ms to 8ms.
- Authored automated E2E testing framework with 92% coverage across critical state machines.

## VERIFIED OPEN SOURCE PROJECTS
- **FastCRDT**: Lead Maintainer. High-performance JSON CRDT engine for state sync (2,800+ GitHub stars). Benchmarked at 4x faster throughput vs Automerge v1.

## EDUCATION
- **B.S. in Computer Science** | University of Washington (Magna Cum Laude, GPA 3.86/4.0)

## VERIFIED TECHNICAL SKILLS
TypeScript, Node.js, Go, React, PostgreSQL, Redis, Docker, Kubernetes, REST APIs, WebSockets.`,
        generation_metadata: {
          grounded_facts_used: ['fact-1 (Veloce Cloud)', 'fact-2 (Aura)', 'fact-3 (UW)', 'fact-4 (FastCRDT)', 'fact-5 (Skills)'],
          missing_facts_flagged: ['Kafka experience not verified in profile; omitted rather than fabricated.'],
          tailored_focus: 'Emphasized distributed systems, websocket scale, and API latency.',
          model_used: 'Grounded Career Engine (gemini-3.8-flash)',
          word_count: 245
        },
        created_at: '2026-10-18T16:00:00Z',
      }
    ],
    cover_letter_versions: [
      {
        id: 'cl-stripe-v1',
        application_id: 'app-1',
        document_type: 'cover_letter',
        version_number: 1,
        title: 'Cover Letter - Stripe Core Applications',
        content: `Dear Stripe Engineering Hiring Team,

I am writing to express my strong interest in the Senior Full-Stack Infrastructure Engineer position with the Core Applications team at Stripe. Having spent the last six years architecting high-throughput distributed systems and developer tools, I have long admired Stripe's gold-standard dedication to developer experience, API elegance, and operational rigor.

At Veloce Cloud Systems, I led the architecture of our real-time pub/sub infrastructure, engineering a multi-tenant websocket pipeline that scales across 450,000 active concurrent connections while maintaining p99 latency below 28ms. Achieving that reliability required deep optimization across Go, Node.js, and Redis schemas, as well as authoring custom payload compression that reduced bandwidth consumption by 34%.

Prior to Veloce, my work at Aura Interactive centered on real-time state synchronization, where I applied conflict-free replicated data types (CRDTs) to deliver seamless multi-user collaboration. This work also inspired FastCRDT, an open-source library I created and maintain that has garnered over 2,800 stars.

Stripe’s mission of increasing the GDP of the internet requires infrastructure that never falters under pressure. I would be thrilled to bring my grounded experience in distributed API design, production resilience, and pragmatic team mentorship to your team.

Sincerely,
Chikezie Onyiaodike`,
        generation_metadata: {
          grounded_facts_used: ['fact-1', 'fact-2', 'fact-4'],
          missing_facts_flagged: ['No fabricated metrics; all numbers trace to verified records.'],
          tailored_focus: 'Connected 450k concurrency and FastCRDT directly to Stripe infrastructure scale.',
          model_used: 'Grounded Career Engine (gemini-3.8-flash)',
          word_count: 218
        },
        created_at: '2026-10-18T16:15:00Z'
      }
    ],
    screening_answers: [
      {
        id: 'ans-1',
        application_id: 'app-1',
        question: 'Describe a complex technical challenge in distributed systems you solved recently.',
        answer: 'At Veloce Cloud Systems, our websocket cluster suffered from latency spikes during bursty reconnect events. I designed an adaptive backpressure and jittered connection broker in Go that smoothed re-registration, paired with Redis-backed delta-syncing. This brought our p99 response times down to under 28ms across 450,000 concurrent sessions.',
        answer_source: 'fact-1 (Verified experience at Veloce Cloud Systems)',
        verification_status: 'grounded_in_profile',
        notes: '100% grounded in verified career fact-1.',
        approved_at: '2026-10-18T16:20:00Z',
        created_at: '2026-10-18T16:20:00Z'
      },
      {
        id: 'ans-2',
        application_id: 'app-1',
        question: 'What is your current US work authorization status?',
        answer: 'US Citizen (Authorized to work for any employer without sponsorship).',
        answer_source: 'profile.eligibility_status',
        verification_status: 'grounded_in_profile',
        approved_at: '2026-10-18T16:20:00Z',
        created_at: '2026-10-18T16:20:00Z'
      }
    ],
    events: [
      {
        id: 'evt-1',
        application_id: 'app-1',
        event_type: 'created',
        event_details: 'Opportunity saved from Greenhouse feed and added to Preparing stage.',
        timestamp: '2026-10-18T15:30:00Z'
      },
      {
        id: 'evt-2',
        application_id: 'app-1',
        event_type: 'material_generated',
        event_details: 'Grounded Tailored CV v1 and Cover Letter generated using 5 verified career facts.',
        timestamp: '2026-10-18T16:15:00Z'
      }
    ],
    created_at: '2026-10-18T15:30:00Z',
    updated_at: '2026-10-18T16:20:00Z'
  },
  {
    id: 'app-2',
    user_id: 'user-chikezie',
    opportunity_id: 'opp-2',
    status: 'Ready to submit',
    application_url: 'https://linear.app/careers/staff-frontend-architect',
    deadline: '2026-12-15',
    next_follow_up_at: '2026-11-10',
    submission_method: 'User Guided / External Portal',
    notes: 'Application package fully reviewed. Ready for user explicit approval before external submission.',
    cv_versions: [],
    cover_letter_versions: [],
    screening_answers: [],
    events: [
      {
        id: 'evt-3',
        application_id: 'app-2',
        event_type: 'created',
        event_details: 'Added from Lever Direct Feed.',
        timestamp: '2026-10-17T11:00:00Z'
      },
      {
        id: 'evt-4',
        application_id: 'app-2',
        event_type: 'status_changed',
        event_details: 'Moved from Preparing to Ready to submit. Awaiting user approval signature.',
        timestamp: '2026-10-19T18:00:00Z'
      }
    ],
    created_at: '2026-10-17T11:00:00Z',
    updated_at: '2026-10-19T18:00:00Z'
  },
  {
    id: 'app-3',
    user_id: 'user-chikezie',
    opportunity_id: 'opp-3',
    status: 'Interested',
    application_url: 'https://foundation.mozilla.org/en/fellowships/apply-2027',
    deadline: '2026-11-15',
    submission_method: 'User Guided / External Portal',
    notes: 'Great match for FastCRDT and open-source civic technology mission.',
    cv_versions: [],
    cover_letter_versions: [],
    screening_answers: [],
    events: [],
    created_at: '2026-10-19T09:00:00Z',
    updated_at: '2026-10-19T09:00:00Z'
  }
];

export const INITIAL_SOURCES: OpportunitySource[] = [
  {
    id: 'src-gh',
    name: 'Greenhouse Job Ingestion API',
    source_type: 'greenhouse',
    base_url: 'https://boards-api.greenhouse.io/v1/boards',
    integration_status: 'Healthy',
    records_count: 1240,
    last_synced_at: '2026-10-20T06:15:00Z',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'src-lever',
    name: 'Lever Postings Feed',
    source_type: 'lever',
    base_url: 'https://api.lever.co/v0/postings',
    integration_status: 'Healthy',
    records_count: 890,
    last_synced_at: '2026-10-20T05:30:00Z',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'src-academic',
    name: 'Global Academic & Fellowships Syndicate',
    source_type: 'public_feed',
    base_url: 'https://academic-syndicate.org/api/v2',
    integration_status: 'Healthy',
    records_count: 310,
    last_synced_at: '2026-10-20T04:00:00Z',
    created_at: '2026-02-15T00:00:00Z'
  },
  {
    id: 'src-grants',
    name: 'Grants & Research Awards Registry',
    source_type: 'public_feed',
    base_url: 'https://grants-registry.gov/api/feed',
    integration_status: 'Healthy',
    records_count: 450,
    last_synced_at: '2026-10-20T03:00:00Z',
    created_at: '2026-03-01T00:00:00Z'
  }
];

export const INITIAL_SYNC_RUNS: SourceSyncRun[] = [
  {
    id: 'run-101',
    source_id: 'src-gh',
    source_name: 'Greenhouse Job Ingestion API',
    started_at: '2026-10-20T06:10:00Z',
    completed_at: '2026-10-20T06:15:00Z',
    status: 'Completed',
    records_processed: 312,
    records_created: 18,
    records_updated: 42,
    records_failed: 0,
  },
  {
    id: 'run-102',
    source_id: 'src-lever',
    source_name: 'Lever Postings Feed',
    started_at: '2026-10-20T05:25:00Z',
    completed_at: '2026-10-20T05:30:00Z',
    status: 'Completed',
    records_processed: 198,
    records_created: 12,
    records_updated: 29,
    records_failed: 1,
    error_summary: '1 record skipped: malformed JSON payload from upstream partner.'
  },
  {
    id: 'run-103',
    source_id: 'src-academic',
    source_name: 'Global Academic & Fellowships Syndicate',
    started_at: '2026-10-20T03:55:00Z',
    completed_at: '2026-10-20T04:00:00Z',
    status: 'Completed',
    records_processed: 85,
    records_created: 5,
    records_updated: 8,
    records_failed: 0,
  }
];
