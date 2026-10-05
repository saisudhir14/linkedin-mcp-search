/**
 * LinkedIn MCP Types
 */

// Job filter types
export type WorkplaceType = 'on-site' | 'remote' | 'hybrid' | 'unknown';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship' | 'volunteer' | 'other';
export type ExperienceLevel = 'internship' | 'entry-level' | 'associate' | 'mid-senior' | 'director' | 'executive';
export type DatePosted = 'past-hour' | 'past-24-hours' | 'past-week' | 'past-month' | 'any-time';
export type SortBy = 'most-relevant' | 'most-recent';
export type MinSalary = '40k' | '60k' | '80k' | '100k' | '120k' | '140k' | '160k' | '180k' | '200k';

// Job interfaces
export interface LinkedInJob {
  id: string;
  title: string;
  company: string;
  companyUrl?: string;
  companyLogo?: string;
  location: string;
  workplaceType: WorkplaceType;
  postedDate: string;
  postedTimeAgo: string;
  salary?: string;
  url: string;
  isEasyApply: boolean;
  isPromoted: boolean;
}

export interface JobDetails extends LinkedInJob {
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  applicants?: string;
  fullDescription: string;
  seniorityLevel?: string;
  employmentType?: string;
  industries?: string[];
  jobFunctions?: string[];
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
  /** Numeric LinkedIn company IDs (LinkedIn's own company filter). */
  companyIds?: string[];
  /** Company name; results are filtered to jobs whose company matches. */
  company?: string;
  /** LinkedIn industry IDs (see get_industries). */
  industryIds?: string[];
  /** LinkedIn job function codes (see get_job_functions). */
  jobFunctions?: string[];
  minSalary?: MinSalary;
  easyApply?: boolean;
  fewApplicants?: boolean;
  sortBy?: SortBy;
  start?: number;
  limit?: number;
}

export interface JobSearchResult {
  jobs: LinkedInJob[];
  /** Offset to pass as `start` for the next page, or null when there are no more results. */
  nextStart: number | null;
  searchUrl: string;
}

// Company interface
export interface LinkedInCompany {
  id: string;
  name: string;
  linkedInUrl: string;
  logo?: string;
  description?: string;
  industry?: string;
  size?: string;
  website?: string;
  headquarters?: string;
  founded?: string;
  specialties?: string;
  followers?: string;
}

// Post interfaces
export interface LinkedInPost {
  id: string;
  url: string;
  author: string;
  authorProfileUrl?: string;
  title: string;
  snippet: string;
  isHiring: boolean;
}

export interface PostDetails {
  id: string;
  url: string;
  author: string;
  authorProfileUrl?: string;
  content: string;
  publishedAt?: string;
  reactions?: number;
  comments?: number;
  isHiring: boolean;
}

export interface PostSearchParams {
  keywords: string;
  company?: string;
  hiringOnly?: boolean;
  datePosted?: Exclude<DatePosted, 'past-hour'>;
  limit?: number;
}

export interface PostSearchResult {
  posts: LinkedInPost[];
  query: string;
  linkedInSearchUrl: string;
}
