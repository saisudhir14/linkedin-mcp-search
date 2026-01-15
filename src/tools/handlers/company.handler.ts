/**
 * Company Tool Handlers
 * @module tools/handlers/company
 */

import { companyService } from '../../services/linkedin/index.js';

/**
 * Handle get_company tool call
 */
export async function handleGetCompany(args: { companyId: string }): Promise<string> {
  try {
    const company = await companyService.getCompany(args.companyId);

    if (!company) {
      return JSON.stringify({
        success: false,
        error: 'Company not found',
      });
    }

    return JSON.stringify({
      success: true,
      company,
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get company',
    });
  }
}

/**
 * Handle search_companies tool call
 */
export async function handleSearchCompanies(args: { query: string }): Promise<string> {
  try {
    const companies = await companyService.searchCompanies(args.query);
    
    return JSON.stringify({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
    });
  }
}

/**
 * Handle get_company_jobs tool call
 */
export async function handleGetCompanyJobs(args: {
  companyId: string;
  keywords?: string;
  limit?: number;
}): Promise<string> {
  try {
    const result = await companyService.getCompanyJobs(args.companyId, {
      keywords: args.keywords,
      limit: args.limit,
    });

    return JSON.stringify({
      success: true,
      companyId: args.companyId,
      totalResults: result.totalResults,
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
