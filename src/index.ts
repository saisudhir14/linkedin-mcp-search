#!/usr/bin/env node

/**
 * LinkedIn MCP Server
 * Model Context Protocol server for LinkedIn job search
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { tools } from './tools.js';
import {
  searchJobs,
  searchRemoteJobs,
  searchEntryLevelJobs,
  getJobDetails,
  getCompany,
  searchCompanies,
  getCompanyJobs,
  buildPublicJobUrl,
  POPULAR_LOCATIONS,
  INDUSTRIES,
  JOB_FUNCTIONS,
} from './linkedin.js';
import type { JobSearchParams, DatePosted, ExperienceLevel } from './types.js';

// MCP Server
const server = new Server(
  { name: 'linkedin-mcp-search', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    const result = await handleTool(name, args as Record<string, unknown>);
    return { content: [{ type: 'text', text: result }] };
  } catch (error) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }) }],
      isError: true,
    };
  }
});

async function handleTool(name: string, args: Record<string, unknown>): Promise<string> {
  switch (name) {
    // Job tools
    case 'search_jobs': {
      const params: JobSearchParams = {
        keywords: args.keywords as string | undefined,
        location: args.location as string | undefined,
        geoId: args.geoId as string | undefined,
        distance: args.distance as number | undefined,
        jobType: args.jobType as JobSearchParams['jobType'],
        experienceLevel: args.experienceLevel as JobSearchParams['experienceLevel'],
        workplaceType: args.workplaceType as JobSearchParams['workplaceType'],
        datePosted: args.datePosted as DatePosted | undefined,
        easyApply: args.easyApply as boolean | undefined,
        companyIds: args.companyIds as string[] | undefined,
        sortBy: args.sortBy as JobSearchParams['sortBy'],
        start: args.start as number | undefined,
        limit: args.limit as number | undefined,
      };
      const result = await searchJobs(params);
      return JSON.stringify({
        success: true,
        totalResults: result.totalResults,
        currentPage: result.currentPage,
        hasMore: result.hasMore,
        jobCount: result.jobs.length,
        jobs: result.jobs.map(j => ({
          id: j.id, title: j.title, company: j.company, location: j.location,
          workplaceType: j.workplaceType, postedTimeAgo: j.postedTimeAgo,
          salary: j.salary, isEasyApply: j.isEasyApply, isPromoted: j.isPromoted, url: j.url,
        })),
      });
    }

    case 'get_job_details': {
      const job = await getJobDetails(args.jobId as string);
      if (!job) return JSON.stringify({ success: false, error: 'Job not found' });
      return JSON.stringify({
        success: true,
        job: {
          id: job.id, title: job.title, company: job.company, location: job.location,
          workplaceType: job.workplaceType, jobType: job.jobType, experienceLevel: job.experienceLevel,
          postedTimeAgo: job.postedTimeAgo, applicants: job.applicants, salary: job.salary,
          isEasyApply: job.isEasyApply, url: job.url, description: job.fullDescription,
          seniorityLevel: job.seniorityLevel, employmentType: job.employmentType,
          industries: job.industries, jobFunctions: job.jobFunctions,
          companyLinkedInUrl: job.companyLinkedInUrl, applicationUrl: job.applicationUrl,
        },
      });
    }

    case 'search_remote_jobs': {
      const result = await searchRemoteJobs(args.keywords as string, {
        datePosted: args.datePosted as DatePosted | undefined,
        experienceLevel: args.experienceLevel as ExperienceLevel[] | undefined,
        limit: args.limit as number | undefined,
      });
      return JSON.stringify({
        success: true,
        searchType: 'remote_jobs',
        totalResults: result.totalResults,
        jobCount: result.jobs.length,
        jobs: result.jobs.map(j => ({
          id: j.id, title: j.title, company: j.company, location: j.location,
          postedTimeAgo: j.postedTimeAgo, salary: j.salary, isEasyApply: j.isEasyApply, url: j.url,
        })),
      });
    }

    case 'search_entry_level_jobs': {
      const result = await searchEntryLevelJobs(args.keywords as string, {
        location: args.location as string | undefined,
        includeInternships: args.includeInternships as boolean | undefined,
        datePosted: args.datePosted as DatePosted | undefined,
        limit: args.limit as number | undefined,
      });
      return JSON.stringify({
        success: true,
        searchType: 'entry_level_jobs',
        totalResults: result.totalResults,
        jobCount: result.jobs.length,
        jobs: result.jobs.map(j => ({
          id: j.id, title: j.title, company: j.company, location: j.location,
          postedTimeAgo: j.postedTimeAgo, salary: j.salary, isEasyApply: j.isEasyApply, url: j.url,
        })),
      });
    }

    // Company tools
    case 'get_company': {
      const company = await getCompany(args.companyId as string);
      if (!company) return JSON.stringify({ success: false, error: 'Company not found' });
      return JSON.stringify({ success: true, company });
    }

    case 'search_companies': {
      const companies = await searchCompanies(args.query as string);
      return JSON.stringify({ success: true, count: companies.length, companies });
    }

    case 'get_company_jobs': {
      const result = await getCompanyJobs(args.companyId as string, {
        keywords: args.keywords as string | undefined,
        limit: args.limit as number | undefined,
      });
      return JSON.stringify({
        success: true,
        companyId: args.companyId,
        totalResults: result.totalResults,
        jobCount: result.jobs.length,
        jobs: result.jobs.map(j => ({
          id: j.id, title: j.title, company: j.company, location: j.location,
          workplaceType: j.workplaceType, postedTimeAgo: j.postedTimeAgo,
          salary: j.salary, isEasyApply: j.isEasyApply, url: j.url,
        })),
      });
    }

    // Helper tools
    case 'get_popular_locations':
      return JSON.stringify({ locations: POPULAR_LOCATIONS });

    case 'get_industries':
      return JSON.stringify({ industries: INDUSTRIES });

    case 'get_job_functions':
      return JSON.stringify({ jobFunctions: JOB_FUNCTIONS });

    case 'build_job_search_url': {
      const url = buildPublicJobUrl({
        keywords: args.keywords as string | undefined,
        location: args.location as string | undefined,
        jobType: args.jobType as JobSearchParams['jobType'],
        experienceLevel: args.experienceLevel as JobSearchParams['experienceLevel'],
        workplaceType: args.workplaceType as JobSearchParams['workplaceType'],
        datePosted: args.datePosted as DatePosted | undefined,
        easyApply: args.easyApply as boolean | undefined,
      });
      return JSON.stringify({ url });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// Entry point
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('LinkedIn MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
