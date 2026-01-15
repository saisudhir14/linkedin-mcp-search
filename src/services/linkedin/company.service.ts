/**
 * LinkedIn Company Service
 * Handles company search and information retrieval
 * @module services/linkedin/company
 */

import type { AxiosInstance } from 'axios';
import type { LinkedInCompany, JobSearchResult } from '../../types/index.js';
import { createPublicClient, isAxiosError } from '../../utils/http.js';
import { parserService } from './parser.service.js';
import { jobService } from './job.service.js';

/**
 * Service for LinkedIn company operations
 */
export class CompanyService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = createPublicClient();
  }

  /**
   * Get company information by ID or vanity name
   */
  async getCompany(companyId: string): Promise<LinkedInCompany | null> {
    try {
      const response = await this.client.get(`/company/${companyId}`);
      return parserService.parseCompany(response.data, companyId);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to get company: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search for companies
   */
  async searchCompanies(query: string): Promise<LinkedInCompany[]> {
    try {
      const response = await this.client.get(
        `/search/results/companies/?keywords=${encodeURIComponent(query)}`
      );
      return parserService.parseCompanySearchResults(response.data);
    } catch (error) {
      throw new Error(`Company search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get job listings from a specific company
   */
  async getCompanyJobs(
    companyId: string,
    options?: {
      keywords?: string;
      limit?: number;
    }
  ): Promise<JobSearchResult> {
    return jobService.searchJobs({
      keywords: options?.keywords,
      companyIds: [companyId],
      limit: options?.limit,
    });
  }
}

// Export singleton instance
export const companyService = new CompanyService();
