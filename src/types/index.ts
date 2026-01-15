/**
 * Type Definitions Index
 * Re-exports all types for easy importing
 * @module types
 */

// Auth types
export type {
  LinkedInScope,
  LinkedInAuthConfig,
  LinkedInTokens,
  LinkedInUser,
  AuthStatus,
} from './auth.types.js';

// Job types
export type {
  WorkplaceType,
  JobType,
  ExperienceLevel,
  DatePosted,
  SortBy,
  ApplicationStatus,
  AlertFrequency,
  LinkedInJob,
  JobDetails,
  SalaryRange,
  JobSearchParams,
  JobSearchResult,
  SavedJob,
  JobApplication,
  JobAlert,
} from './job.types.js';

// Company types
export type {
  LinkedInCompany,
  CompanySearchResult,
} from './company.types.js';
