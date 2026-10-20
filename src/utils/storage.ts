/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Profile, 
  CareerFact, 
  Opportunity, 
  Application, 
  OpportunitySource, 
  SourceSyncRun, 
  ConsentRecord,
  PersonaType 
} from '../types';
import { 
  INITIAL_PROFILES, 
  INITIAL_FACTS, 
  INITIAL_OPPORTUNITIES, 
  INITIAL_APPLICATIONS, 
  INITIAL_SOURCES, 
  INITIAL_SYNC_RUNS 
} from '../data/mockData';

const STORAGE_KEYS = {
  ACTIVE_PERSONA: 'aca_active_persona',
  PROFILES: 'aca_profiles',
  FACTS: 'aca_facts',
  OPPORTUNITIES: 'aca_opportunities',
  APPLICATIONS: 'aca_applications',
  SOURCES: 'aca_sources',
  SYNC_RUNS: 'aca_sync_runs',
  CONSENTS: 'aca_consents',
};

export function loadStoredData() {
  try {
    const activePersona: PersonaType = (localStorage.getItem(STORAGE_KEYS.ACTIVE_PERSONA) as PersonaType) || 'active_job_seeker';
    
    const storedProfiles = localStorage.getItem(STORAGE_KEYS.PROFILES);
    const profiles: Record<PersonaType, Profile> = storedProfiles ? JSON.parse(storedProfiles) : INITIAL_PROFILES;
    
    const storedFacts = localStorage.getItem(STORAGE_KEYS.FACTS);
    const facts: CareerFact[] = storedFacts ? JSON.parse(storedFacts) : INITIAL_FACTS;
    
    const storedOpps = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
    const opportunities: Opportunity[] = storedOpps ? JSON.parse(storedOpps) : INITIAL_OPPORTUNITIES;
    
    const storedApps = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    const applications: Application[] = storedApps ? JSON.parse(storedApps) : INITIAL_APPLICATIONS;
    
    const storedSources = localStorage.getItem(STORAGE_KEYS.SOURCES);
    const sources: OpportunitySource[] = storedSources ? JSON.parse(storedSources) : INITIAL_SOURCES;
    
    const storedSyncRuns = localStorage.getItem(STORAGE_KEYS.SYNC_RUNS);
    const syncRuns: SourceSyncRun[] = storedSyncRuns ? JSON.parse(storedSyncRuns) : INITIAL_SYNC_RUNS;
    
    const storedConsents = localStorage.getItem(STORAGE_KEYS.CONSENTS);
    const consents: ConsentRecord[] = storedConsents ? JSON.parse(storedConsents) : [];

    return {
      activePersona,
      profiles,
      facts,
      opportunities,
      applications,
      sources,
      syncRuns,
      consents,
    };
  } catch (e) {
    console.warn('Failed to load from localStorage, using initial mock data', e);
    return {
      activePersona: 'active_job_seeker' as PersonaType,
      profiles: INITIAL_PROFILES,
      facts: INITIAL_FACTS,
      opportunities: INITIAL_OPPORTUNITIES,
      applications: INITIAL_APPLICATIONS,
      sources: INITIAL_SOURCES,
      syncRuns: INITIAL_SYNC_RUNS,
      consents: [],
    };
  }
}

export function saveStoredData(data: {
  activePersona?: PersonaType;
  profiles?: Record<PersonaType, Profile>;
  facts?: CareerFact[];
  opportunities?: Opportunity[];
  applications?: Application[];
  sources?: OpportunitySource[];
  syncRuns?: SourceSyncRun[];
  consents?: ConsentRecord[];
}) {
  try {
    if (data.activePersona) localStorage.setItem(STORAGE_KEYS.ACTIVE_PERSONA, data.activePersona);
    if (data.profiles) localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(data.profiles));
    if (data.facts) localStorage.setItem(STORAGE_KEYS.FACTS, JSON.stringify(data.facts));
    if (data.opportunities) localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(data.opportunities));
    if (data.applications) localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(data.applications));
    if (data.sources) localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(data.sources));
    if (data.syncRuns) localStorage.setItem(STORAGE_KEYS.SYNC_RUNS, JSON.stringify(data.syncRuns));
    if (data.consents) localStorage.setItem(STORAGE_KEYS.CONSENTS, JSON.stringify(data.consents));
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
  }
}

export function resetStoredData() {
  try {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  } catch (e) {
    console.warn('Failed to reset localStorage', e);
  }
}
