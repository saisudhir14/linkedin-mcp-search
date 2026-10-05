/**
 * LinkedIn URL constants and filter codes.
 */

import type { DatePosted, ExperienceLevel, JobType, MinSalary, WorkplaceType } from './types.js';

export const LINKEDIN_BASE = 'https://www.linkedin.com';
export const JOBS_GUEST_API = `${LINKEDIN_BASE}/jobs-guest/jobs/api`;

/** The guest job search API always returns this many cards per page. */
export const JOBS_PAGE_SIZE = 10;
export const DEFAULT_LIMIT = 25;
export const MAX_LIMIT = 100;

export const JOB_TYPE_CODES: Record<JobType, string> = {
  'full-time': 'F', 'part-time': 'P', 'contract': 'C',
  'temporary': 'T', 'internship': 'I', 'volunteer': 'V', 'other': 'O',
};

export const EXPERIENCE_CODES: Record<ExperienceLevel, string> = {
  'internship': '1', 'entry-level': '2', 'associate': '3',
  'mid-senior': '4', 'director': '5', 'executive': '6',
};

export const WORKPLACE_CODES: Record<Exclude<WorkplaceType, 'unknown'>, string> = {
  'on-site': '1', 'remote': '2', 'hybrid': '3',
};

/** Seconds-based "time posted range" values used by f_TPR. */
export const DATE_CODES: Record<Exclude<DatePosted, 'any-time'>, string> = {
  'past-hour': 'r3600',
  'past-24-hours': 'r86400',
  'past-week': 'r604800',
  'past-month': 'r2592000',
};

/** Salary bucket codes used by f_SB2 (US salaries). */
export const SALARY_CODES: Record<MinSalary, string> = {
  '40k': '1', '60k': '2', '80k': '3', '100k': '4', '120k': '5',
  '140k': '6', '160k': '7', '180k': '8', '200k': '9',
};

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
];

/** Industry IDs accepted by the f_I filter. */
export const INDUSTRIES = [
  { name: 'Software Development', id: '4' },
  { name: 'Technology, Information and Internet', id: '6' },
  { name: 'IT Services and IT Consulting', id: '96' },
  { name: 'Financial Services', id: '43' },
  { name: 'Banking', id: '41' },
  { name: 'Insurance', id: '42' },
  { name: 'Hospitals and Health Care', id: '14' },
  { name: 'Retail', id: '27' },
  { name: 'Telecommunications', id: '8' },
  { name: 'Staffing and Recruiting', id: '104' },
  { name: 'Higher Education', id: '68' },
  { name: 'Real Estate', id: '44' },
  { name: 'Construction', id: '48' },
  { name: 'Government Administration', id: '75' },
];

/** Job function codes accepted by the f_F filter. */
export const JOB_FUNCTIONS = [
  { name: 'Engineering', code: 'eng' },
  { name: 'Information Technology', code: 'it' },
  { name: 'Product Management', code: 'prdm' },
  { name: 'Project Management', code: 'prjm' },
  { name: 'Design', code: 'dsgn' },
  { name: 'Analyst', code: 'anls' },
  { name: 'Research', code: 'rsch' },
  { name: 'Quality Assurance', code: 'qa' },
  { name: 'Consulting', code: 'cnsl' },
  { name: 'Sales', code: 'sale' },
  { name: 'Business Development', code: 'bd' },
  { name: 'Marketing', code: 'mrkt' },
  { name: 'Customer Service', code: 'cust' },
  { name: 'Finance', code: 'fin' },
  { name: 'Human Resources', code: 'hr' },
  { name: 'Legal', code: 'lgl' },
  { name: 'Management', code: 'mgmt' },
  { name: 'Administrative', code: 'adm' },
  { name: 'Writing/Editing', code: 'wr' },
];
