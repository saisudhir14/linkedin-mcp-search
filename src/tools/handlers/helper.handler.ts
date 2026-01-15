/**
 * Helper Tool Handlers
 * @module tools/handlers/helper
 */

import { POPULAR_LOCATIONS, INDUSTRIES, JOB_FUNCTIONS } from '../../config/constants.js';
import { buildPublicSearchUrl } from '../../utils/url-builder.js';
import type { JobSearchParams } from '../../types/index.js';

/**
 * Handle get_popular_locations tool call
 */
export function handleGetPopularLocations(): string {
  return JSON.stringify({
    locations: POPULAR_LOCATIONS.map(loc => ({
      name: loc.name,
      geoId: loc.geoId,
      usage: `Use geoId "${loc.geoId}" for precise filtering`,
    })),
  });
}

/**
 * Handle get_industries tool call
 */
export function handleGetIndustries(): string {
  return JSON.stringify({
    industries: INDUSTRIES,
    note: 'Use these industry names when filtering job searches',
  });
}

/**
 * Handle get_job_functions tool call
 */
export function handleGetJobFunctions(): string {
  return JSON.stringify({
    jobFunctions: JOB_FUNCTIONS,
    note: 'Use these job function names when filtering job searches',
  });
}

/**
 * Handle build_job_search_url tool call
 */
export function handleBuildJobSearchUrl(args: Record<string, unknown>): string {
  const params: JobSearchParams = {
    keywords: args.keywords as string | undefined,
    location: args.location as string | undefined,
    jobType: args.jobType as JobSearchParams['jobType'],
    experienceLevel: args.experienceLevel as JobSearchParams['experienceLevel'],
    workplaceType: args.workplaceType as JobSearchParams['workplaceType'],
    datePosted: args.datePosted as JobSearchParams['datePosted'],
    easyApply: args.easyApply as boolean | undefined,
  };

  const url = buildPublicSearchUrl(params);

  return JSON.stringify({
    url,
    message: 'Open this URL in a browser to see the job search results',
  });
}
