/**
 * LinkedIn MCP Types
 */

// Job filter types
export type WorkplaceType = 'on-site' | 'remote' | 'hybrid' | 'unknown';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship' | 'volunteer' | 'other';
export type ExperienceLevel = 'internship' | 'entry-level' | 'associate' | 'mid-senior' | 'director' | 'executive';
export type DatePosted = 'past-24-hours' | 'past-week' | 'past-month' | 'any-time';
export type SortBy = 'most-relevant' | 'most-recent';

// Job interfaces
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
  isEasyApply: boolean;
  isPromoted: boolean;
}

export interface JobDetails extends LinkedInJob {
  fullDescription: string;
  companyDescription?: string;
  companySize?: string;
  companyIndustry?: string;
  companyUrl?: string;
  companyLinkedInUrl?: string;
  seniorityLevel?: string;
  employmentType?: string;
  industries?: string[];
  jobFunctions?: string[];
  applicationUrl?: string;
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
  companyIds?: string[];
  easyApply?: boolean;
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

// Company interface
export interface LinkedInCompany {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  industry?: string;
  size?: string;
  website?: string;
  linkedInUrl: string;
  followers?: string;
  employees?: string;
  headquarters?: string;
  founded?: string;
  specialties?: string[];
}
