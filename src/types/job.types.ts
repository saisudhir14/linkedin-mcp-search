/**
 * LinkedIn Job Types
 * @module types/job
 */

// ==================== Enums & Literals ====================

export type WorkplaceType = 'on-site' | 'remote' | 'hybrid' | 'unknown';

export type JobType =
  | 'full-time'
  | 'part-time'
  | 'contract'
  | 'temporary'
  | 'internship'
  | 'volunteer'
  | 'other';

export type ExperienceLevel =
  | 'internship'
  | 'entry-level'
  | 'associate'
  | 'mid-senior'
  | 'director'
  | 'executive';

export type DatePosted =
  | 'past-24-hours'
  | 'past-week'
  | 'past-month'
  | 'any-time';

export type SortBy = 'most-relevant' | 'most-recent';

export type ApplicationStatus =
  | 'applied'
  | 'viewed'
  | 'in-progress'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type AlertFrequency = 'daily' | 'weekly' | 'instant';

// ==================== Core Interfaces ====================

export interface LinkedInJob {
  id: string;
  title: string;
  company: string;
  companyId?: string;
  companyLogo?: string;
  location: string;
  workplaceType: WorkplaceType;
  jobType: JobType;
  experienceLevel?: ExperienceLevel;
  postedDate: string;
  postedTimeAgo: string;
  applicants?: string;
  salary?: string;
  description?: string;
  url: string;
  skills?: string[];
  benefits?: string[];
  isEasyApply: boolean;
  isPromoted: boolean;
  isSaved?: boolean;
  hasApplied?: boolean;
}

export interface JobDetails extends LinkedInJob {
  fullDescription: string;
  companyDescription?: string;
  companySize?: string;
  companyIndustry?: string;
  companyUrl?: string;
  companyLinkedInUrl?: string;
  requirements?: string[];
  responsibilities?: string[];
  seniorityLevel?: string;
  employmentType?: string;
  industries?: string[];
  jobFunctions?: string[];
  applicationUrl?: string;
}

// ==================== Search Interfaces ====================

export interface SalaryRange {
  min?: number;
  max?: number;
  currency?: string;
}

export interface JobSearchParams {
  keywords?: string;
  location?: string;
  geoId?: string;
  distance?: number;
  jobType?: JobType[];
  experienceLevel?: ExperienceLevel[];
  workplaceType?: WorkplaceType[];
  datePosted?: DatePosted;
  salary?: SalaryRange;
  company?: string[];
  companyIds?: string[];
  industry?: string[];
  jobFunction?: string[];
  title?: string[];
  easyApply?: boolean;
  underTenApplicants?: boolean;
  sortBy?: SortBy;
  start?: number;
  limit?: number;
}

export interface JobSearchResult {
  jobs: LinkedInJob[];
  totalResults: number;
  currentPage: number;
  hasMore: boolean;
  searchParams: JobSearchParams;
}

// ==================== User Job Data ====================

export interface SavedJob {
  jobId: string;
  job: LinkedInJob;
  savedAt: string;
  notes?: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  job: LinkedInJob;
  appliedAt: string;
  status: ApplicationStatus;
  resume?: string;
  coverLetter?: string;
}

export interface JobAlert {
  id: string;
  name: string;
  searchParams: JobSearchParams;
  frequency: AlertFrequency;
  createdAt: string;
  isActive: boolean;
}
