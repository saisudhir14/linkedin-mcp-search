/**
 * URL Builder Utilities
 * Constructs LinkedIn search URLs with parameters
 * @module utils/url-builder
 */

import type { JobSearchParams, WorkplaceType } from '../types/index.js';
import {
  JOB_TYPE_CODES,
  EXPERIENCE_LEVEL_CODES,
  WORKPLACE_TYPE_CODES,
  DATE_POSTED_CODES,
  LINKEDIN_URLS,
} from '../config/constants.js';

/**
 * Build LinkedIn guest job search API URL
 */
export function buildJobSearchUrl(params: JobSearchParams): string {
  const searchParams = new URLSearchParams();

  if (params.keywords) {
    searchParams.set('keywords', params.keywords);
  }

  if (params.location) {
    searchParams.set('location', params.location);
  }

  if (params.geoId) {
    searchParams.set('geoId', params.geoId);
  }

  if (params.distance) {
    searchParams.set('distance', params.distance.toString());
  }

  if (params.jobType && params.jobType.length > 0) {
    const codes = params.jobType.map(t => JOB_TYPE_CODES[t]).join(',');
    searchParams.set('f_JT', codes);
  }

  if (params.experienceLevel && params.experienceLevel.length > 0) {
    const codes = params.experienceLevel.map(e => EXPERIENCE_LEVEL_CODES[e]).join(',');
    searchParams.set('f_E', codes);
  }

  if (params.workplaceType && params.workplaceType.length > 0) {
    const codes = params.workplaceType
      .filter((w): w is Exclude<WorkplaceType, 'unknown'> => w !== 'unknown')
      .map(w => WORKPLACE_TYPE_CODES[w])
      .join(',');
    if (codes) {
      searchParams.set('f_WT', codes);
    }
  }

  if (params.datePosted && params.datePosted !== 'any-time') {
    searchParams.set('f_TPR', DATE_POSTED_CODES[params.datePosted]);
  }

  if (params.easyApply) {
    searchParams.set('f_AL', 'true');
  }

  if (params.underTenApplicants) {
    searchParams.set('f_EA', 'true');
  }

  if (params.companyIds && params.companyIds.length > 0) {
    searchParams.set('f_C', params.companyIds.join(','));
  }

  if (params.sortBy === 'most-recent') {
    searchParams.set('sortBy', 'DD');
  } else {
    searchParams.set('sortBy', 'R');
  }

  const start = params.start || 0;
  if (start > 0) {
    searchParams.set('start', start.toString());
  }

  return `${LINKEDIN_URLS.JOBS_GUEST_API}/seeMoreJobPostings/search?${searchParams.toString()}`;
}

/**
 * Build public-facing LinkedIn job search URL (for browser)
 */
export function buildPublicSearchUrl(params: JobSearchParams): string {
  const searchParams = new URLSearchParams();

  if (params.keywords) searchParams.set('keywords', params.keywords);
  if (params.location) searchParams.set('location', params.location);

  if (params.jobType && params.jobType.length > 0) {
    const codes = params.jobType.map(t => JOB_TYPE_CODES[t]).join(',');
    searchParams.set('f_JT', codes);
  }

  if (params.experienceLevel && params.experienceLevel.length > 0) {
    const codes = params.experienceLevel.map(e => EXPERIENCE_LEVEL_CODES[e]).join(',');
    searchParams.set('f_E', codes);
  }

  if (params.workplaceType && params.workplaceType.length > 0) {
    const codes = params.workplaceType
      .filter((w): w is Exclude<WorkplaceType, 'unknown'> => w !== 'unknown')
      .map(w => WORKPLACE_TYPE_CODES[w])
      .join(',');
    if (codes) {
      searchParams.set('f_WT', codes);
    }
  }

  if (params.datePosted && params.datePosted !== 'any-time') {
    searchParams.set('f_TPR', DATE_POSTED_CODES[params.datePosted]);
  }

  if (params.easyApply) searchParams.set('f_AL', 'true');

  return `${LINKEDIN_URLS.BASE}/jobs/search/?${searchParams.toString()}`;
}
