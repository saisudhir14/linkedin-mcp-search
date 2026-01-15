/**
 * Application Constants
 * Centralized configuration values and mappings
 * @module config/constants
 */

import type { JobType, ExperienceLevel, WorkplaceType, DatePosted, LinkedInScope } from '../types/index.js';

// ==================== API Endpoints ====================

export const LINKEDIN_URLS = {
  OAUTH: 'https://www.linkedin.com/oauth/v2',
  API: 'https://api.linkedin.com/v2',
  BASE: 'https://www.linkedin.com',
  JOBS_GUEST_API: 'https://www.linkedin.com/jobs-guest/jobs/api',
} as const;

// ==================== Default Configuration ====================

export const DEFAULT_CONFIG = {
  OAUTH_PORT: 8585,
  REQUEST_TIMEOUT: 30000,
  DEFAULT_JOB_LIMIT: 25,
  MAX_JOB_LIMIT: 50,
} as const;

export const DEFAULT_SCOPES: LinkedInScope[] = [
  'openid',
  'profile',
  'email',
];

// ==================== LinkedIn Parameter Mappings ====================

export const JOB_TYPE_CODES: Record<JobType, string> = {
  'full-time': 'F',
  'part-time': 'P',
  'contract': 'C',
  'temporary': 'T',
  'internship': 'I',
  'volunteer': 'V',
  'other': 'O',
};

export const EXPERIENCE_LEVEL_CODES: Record<ExperienceLevel, string> = {
  'internship': '1',
  'entry-level': '2',
  'associate': '3',
  'mid-senior': '4',
  'director': '5',
  'executive': '6',
};

export const WORKPLACE_TYPE_CODES: Record<Exclude<WorkplaceType, 'unknown'>, string> = {
  'on-site': '1',
  'remote': '2',
  'hybrid': '3',
};

export const DATE_POSTED_CODES: Record<DatePosted, string> = {
  'past-24-hours': 'r86400',
  'past-week': 'r604800',
  'past-month': 'r2592000',
  'any-time': '',
};

// ==================== Reference Data ====================

export const POPULAR_LOCATIONS = [
  { name: 'United States', geoId: '103644278' },
  { name: 'New York, NY', geoId: '102571732' },
  { name: 'San Francisco Bay Area', geoId: '90000084' },
  { name: 'Los Angeles, CA', geoId: '102448103' },
  { name: 'Seattle, WA', geoId: '104116203' },
  { name: 'Austin, TX', geoId: '104472866' },
  { name: 'Chicago, IL', geoId: '103112676' },
  { name: 'Boston, MA', geoId: '102380872' },
  { name: 'Denver, CO', geoId: '103203548' },
  { name: 'United Kingdom', geoId: '101165590' },
  { name: 'London, UK', geoId: '102257491' },
  { name: 'Canada', geoId: '101174742' },
  { name: 'Toronto, Canada', geoId: '100025096' },
  { name: 'Germany', geoId: '101282230' },
  { name: 'India', geoId: '102713980' },
] as const;

export const INDUSTRIES = [
  'Technology, Information and Internet',
  'Hospitals and Health Care',
  'Financial Services',
  'IT Services and IT Consulting',
  'Software Development',
  'Retail',
  'Staffing and Recruiting',
  'Manufacturing',
  'Higher Education',
  'Banking',
  'Insurance',
  'Real Estate',
  'Construction',
  'Marketing Services',
  'Telecommunications',
  'Automotive',
  'Entertainment Providers',
  'Non-profit Organizations',
  'Government Administration',
  'Legal Services',
] as const;

export const JOB_FUNCTIONS = [
  'Engineering',
  'Information Technology',
  'Sales',
  'Marketing',
  'Human Resources',
  'Finance',
  'Operations',
  'Product Management',
  'Design',
  'Data Science',
  'Project Management',
  'Business Development',
  'Customer Service',
  'Legal',
  'Research',
  'Quality Assurance',
  'Administrative',
  'Consulting',
  'Writing/Editing',
  'Healthcare Services',
] as const;

// ==================== HTTP Headers ====================

export const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
} as const;
