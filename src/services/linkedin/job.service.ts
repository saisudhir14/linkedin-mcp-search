/**
 * LinkedIn Job Search Service
 * Handles job search and details retrieval
 * @module services/linkedin/job
 */

import type { AxiosInstance } from 'axios';
import type {
  JobSearchParams,
  JobSearchResult,
  JobDetails,
  LinkedInJob,
} from '../../types/index.js';
import { createPublicClient, isAxiosError } from '../../utils/http.js';
import { buildJobSearchUrl } from '../../utils/url-builder.js';
import { DEFAULT_CONFIG } from '../../config/constants.js';
import { parserService } from './parser.service.js';

/**
 * Service for LinkedIn job search operations
 */
export class JobService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = createPublicClient();
  }

  /**
   * Search for jobs with given parameters
   */
  async searchJobs(params: JobSearchParams): Promise<JobSearchResult> {
    const url = buildJobSearchUrl(params);
    
    try {
      const response = await this.client.get(url);
      const jobs = parserService.parseJobListings(response.data);
      
      const limit = Math.min(params.limit || DEFAULT_CONFIG.DEFAULT_JOB_LIMIT, DEFAULT_CONFIG.MAX_JOB_LIMIT);
      const start = params.start || 0;
      const totalResults = parserService.extractTotalResults(response.data) || jobs.length + start;

      return {
        jobs: jobs.slice(0, limit),
        totalResults,
        currentPage: Math.floor(start / 25) + 1,
        hasMore: jobs.length >= 25,
        searchParams: params,
      };
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(`LinkedIn search failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Search for remote jobs
   */
  async searchRemoteJobs(
    keywords: string,
    options?: {
      datePosted?: JobSearchParams['datePosted'];
      experienceLevel?: JobSearchParams['experienceLevel'];
      limit?: number;
    }
  ): Promise<JobSearchResult> {
    return this.searchJobs({
      keywords,
      workplaceType: ['remote'],
      datePosted: options?.datePosted || 'past-week',
      experienceLevel: options?.experienceLevel,
      limit: options?.limit,
    });
  }

  /**
   * Search for entry-level and internship positions
   */
  async searchEntryLevelJobs(
    keywords: string,
    options?: {
      location?: string;
      includeInternships?: boolean;
      datePosted?: JobSearchParams['datePosted'];
      limit?: number;
    }
  ): Promise<JobSearchResult> {
    const experienceLevels: JobSearchParams['experienceLevel'] = ['entry-level'];
    if (options?.includeInternships !== false) {
      experienceLevels.push('internship');
    }

    return this.searchJobs({
      keywords,
      location: options?.location,
      experienceLevel: experienceLevels,
      datePosted: options?.datePosted || 'past-week',
      limit: options?.limit,
    });
  }

  /**
   * Get detailed information about a specific job
   */
  async getJobDetails(jobId: string): Promise<JobDetails | null> {
    const apiUrl = `/jobs-guest/jobs/api/jobPosting/${jobId}`;
    const htmlUrl = `/jobs/view/${jobId}`;

    try {
      // Try API endpoint first
      const response = await this.client.get(apiUrl);
      return this.parseApiJobDetails(response.data, jobId);
    } catch {
      // Fallback to HTML page
      try {
        const response = await this.client.get(htmlUrl);
        return parserService.parseJobDetails(response.data, jobId);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw new Error(`Failed to get job details: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Parse job details from API JSON response
   */
  private parseApiJobDetails(data: unknown, jobId: string): JobDetails | null {
    if (typeof data !== 'object' || data === null) {
      return null;
    }

    const json = data as Record<string, unknown>;
    const companyDetails = json.companyDetails as Record<string, Record<string, unknown>> | undefined;
    const companyInfo = companyDetails?.['com.linkedin.voyager.deco.jobs.web.shared.WebCompactJobPostingCompany'] as Record<string, Record<string, unknown>> | undefined;
    const applyMethod = json.applyMethod as Record<string, Record<string, unknown>> | undefined;
    const description = json.description as Record<string, unknown> | undefined;

    return {
      id: jobId,
      title: String(json.title || 'Unknown Title'),
      company: String(companyInfo?.companyResolutionResult?.name || 'Unknown Company'),
      location: String(json.formattedLocation || 'Unknown Location'),
      workplaceType: 'unknown',
      jobType: 'full-time',
      postedDate: '',
      postedTimeAgo: String(json.listedAt || 'Unknown'),
      url: `https://www.linkedin.com/jobs/view/${jobId}`,
      isEasyApply: Boolean(applyMethod?.['com.linkedin.voyager.jobs.ComplexOnsiteApply']),
      isPromoted: false,
      fullDescription: String(description?.text || ''),
      applicationUrl: String(applyMethod?.['com.linkedin.voyager.jobs.OffsiteApply']?.companyApplyUrl || ''),
    };
  }
}

// Export singleton instance
export const jobService = new JobService();
