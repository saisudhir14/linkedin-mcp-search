/**
 * Job Tool Handlers
 * @module tools/handlers/job
 */

import type {
  JobSearchParams,
  JobType,
  ExperienceLevel,
  WorkplaceType,
  DatePosted,
  SortBy,
} from '../../types/index.js';
import { jobService } from '../../services/linkedin/index.js';
import { DEFAULT_CONFIG } from '../../config/constants.js';

/**
 * Handle search_jobs tool call
 */
export async function handleSearchJobs(args: Record<string, unknown>): Promise<string> {
  const params: JobSearchParams = {
    keywords: args.keywords as string | undefined,
    location: args.location as string | undefined,
    geoId: args.geoId as string | undefined,
    distance: args.distance as number | undefined,
    jobType: args.jobType as JobType[] | undefined,
    experienceLevel: args.experienceLevel as ExperienceLevel[] | undefined,
    workplaceType: args.workplaceType as WorkplaceType[] | undefined,
    datePosted: args.datePosted as DatePosted | undefined,
    easyApply: args.easyApply as boolean | undefined,
    companyIds: args.companyIds as string[] | undefined,
    sortBy: args.sortBy as SortBy | undefined,
    start: args.start as number | undefined,
    limit: Math.min(
      (args.limit as number) || DEFAULT_CONFIG.DEFAULT_JOB_LIMIT,
      DEFAULT_CONFIG.MAX_JOB_LIMIT
    ),
  };

  try {
    const result = await jobService.searchJobs(params);
    
    return JSON.stringify({
      success: true,
      totalResults: result.totalResults,
      currentPage: result.currentPage,
      hasMore: result.hasMore,
      jobCount: result.jobs.length,
      jobs: result.jobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        workplaceType: job.workplaceType,
        postedTimeAgo: job.postedTimeAgo,
        salary: job.salary,
        isEasyApply: job.isEasyApply,
        isPromoted: job.isPromoted,
        url: job.url,
      })),
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
    });
  }
}

/**
 * Handle get_job_details tool call
 */
export async function handleGetJobDetails(args: { jobId: string }): Promise<string> {
  try {
    const job = await jobService.getJobDetails(args.jobId);

    if (!job) {
      return JSON.stringify({
        success: false,
        error: 'Job not found',
      });
    }

    return JSON.stringify({
      success: true,
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        workplaceType: job.workplaceType,
        jobType: job.jobType,
        experienceLevel: job.experienceLevel,
        postedTimeAgo: job.postedTimeAgo,
        applicants: job.applicants,
        salary: job.salary,
        isEasyApply: job.isEasyApply,
        url: job.url,
        description: job.fullDescription,
        seniorityLevel: job.seniorityLevel,
        employmentType: job.employmentType,
        industries: job.industries,
        jobFunctions: job.jobFunctions,
        companyLinkedInUrl: job.companyLinkedInUrl,
        applicationUrl: job.applicationUrl,
      },
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get job details',
    });
  }
}

/**
 * Handle search_remote_jobs tool call
 */
export async function handleSearchRemoteJobs(args: {
  keywords: string;
  datePosted?: DatePosted;
  experienceLevel?: ExperienceLevel[];
  limit?: number;
}): Promise<string> {
  try {
    const result = await jobService.searchRemoteJobs(args.keywords, {
      datePosted: args.datePosted,
      experienceLevel: args.experienceLevel,
      limit: args.limit,
    });

    return JSON.stringify({
      success: true,
      searchType: 'remote_jobs',
      totalResults: result.totalResults,
      jobCount: result.jobs.length,
      jobs: result.jobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        postedTimeAgo: job.postedTimeAgo,
        salary: job.salary,
        isEasyApply: job.isEasyApply,
        url: job.url,
      })),
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
    });
  }
}

/**
 * Handle search_entry_level_jobs tool call
 */
export async function handleSearchEntryLevelJobs(args: {
  keywords: string;
  location?: string;
  includeInternships?: boolean;
  datePosted?: DatePosted;
  limit?: number;
}): Promise<string> {
  try {
    const result = await jobService.searchEntryLevelJobs(args.keywords, {
      location: args.location,
      includeInternships: args.includeInternships,
      datePosted: args.datePosted,
      limit: args.limit,
    });

    return JSON.stringify({
      success: true,
      searchType: 'entry_level_jobs',
      totalResults: result.totalResults,
      jobCount: result.jobs.length,
      jobs: result.jobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        postedTimeAgo: job.postedTimeAgo,
        salary: job.salary,
        isEasyApply: job.isEasyApply,
        url: job.url,
      })),
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
    });
  }
}
