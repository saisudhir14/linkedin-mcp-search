#!/usr/bin/env node

/**
 * LinkedIn MCP Server
 * Model Context Protocol server for LinkedIn jobs, companies, and posts.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { tools } from './tools.js';
import { buildPublicJobUrl, getJobDetails, searchJobs } from './jobs.js';
import { getCompany, searchCompanies } from './companies.js';
import { buildPostSearchUrl, getPostDetails, searchPosts } from './posts.js';
import { INDUSTRIES, JOB_FUNCTIONS, POPULAR_LOCATIONS } from './constants.js';
import type { ExperienceLevel, JobSearchParams, JobSearchResult, PostSearchParams } from './types.js';

type Args = Record<string, unknown>;

const server = new Server(
  { name: 'linkedin-mcp-search', version: '1.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    const result = await handleTool(name, args);
    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { content: [{ type: 'text', text: JSON.stringify({ error: message }) }], isError: true };
  }
});

// ============ Argument helpers ============

function requireString(args: Args, key: string): string {
  const value = args[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`"${key}" is required and must be a non-empty string`);
  }
  return value.trim();
}

/** Job search arguments use the same names and values as the search_jobs input schema. */
const toJobParams = (args: Args): JobSearchParams => args as JobSearchParams;

const toPostParams = (args: Args): PostSearchParams => ({
  ...(args as Partial<PostSearchParams>),
  keywords: requireString(args, 'keywords'),
});

const formatJobs = (result: JobSearchResult) => ({
  success: true,
  jobCount: result.jobs.length,
  nextStart: result.nextStart,
  searchUrl: result.searchUrl,
  jobs: result.jobs,
});

// ============ Tool dispatch ============

async function handleTool(name: string, args: Args): Promise<unknown> {
  switch (name) {
    // Jobs
    case 'search_jobs':
      return formatJobs(await searchJobs(toJobParams(args)));

    case 'get_job_details': {
      const job = await getJobDetails(requireString(args, 'jobId'));
      return job ? { success: true, job } : { success: false, error: 'Job not found' };
    }

    case 'search_remote_jobs':
      return formatJobs(await searchJobs({
        keywords: requireString(args, 'keywords'),
        workplaceType: ['remote'],
        datePosted: (args.datePosted as JobSearchParams['datePosted']) ?? 'past-week',
        experienceLevel: args.experienceLevel as ExperienceLevel[] | undefined,
        limit: args.limit as number | undefined,
      }));

    case 'search_entry_level_jobs': {
      const experienceLevel: ExperienceLevel[] = ['entry-level'];
      if (args.includeInternships !== false) experienceLevel.push('internship');
      return formatJobs(await searchJobs({
        keywords: requireString(args, 'keywords'),
        location: args.location as string | undefined,
        experienceLevel,
        datePosted: (args.datePosted as JobSearchParams['datePosted']) ?? 'past-week',
        limit: args.limit as number | undefined,
      }));
    }

    // Companies
    case 'get_company': {
      const company = await getCompany(requireString(args, 'companyId'));
      return company ? { success: true, company } : { success: false, error: 'Company not found' };
    }

    case 'search_companies': {
      const companies = await searchCompanies(requireString(args, 'query'));
      return { success: true, count: companies.length, companies };
    }

    case 'get_company_jobs': {
      const companyId = requireString(args, 'companyId');
      // LinkedIn's company filter only accepts numeric IDs; otherwise match by name.
      const companyFilter = /^\d+$/.test(companyId)
        ? { companyIds: [companyId] }
        : { company: companyId.replace(/-/g, ' ') };
      return formatJobs(await searchJobs({
        ...companyFilter,
        keywords: args.keywords as string | undefined,
        location: args.location as string | undefined,
        datePosted: args.datePosted as JobSearchParams['datePosted'],
        limit: args.limit as number | undefined,
      }));
    }

    // Posts
    case 'search_posts': {
      const result = await searchPosts(toPostParams(args));
      return { success: true, postCount: result.posts.length, ...result };
    }

    case 'get_post_details': {
      const post = await getPostDetails(requireString(args, 'url'));
      return post ? { success: true, post } : { success: false, error: 'Post not found or not public' };
    }

    case 'build_post_search_url':
      return { url: buildPostSearchUrl(toPostParams(args)) };

    // Helpers
    case 'get_popular_locations':
      return { locations: POPULAR_LOCATIONS };

    case 'get_industries':
      return { industries: INDUSTRIES };

    case 'get_job_functions':
      return { jobFunctions: JOB_FUNCTIONS };

    case 'build_job_search_url':
      return { url: buildPublicJobUrl(toJobParams(args)) };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ============ Entry point ============

async function main(): Promise<void> {
  await server.connect(new StdioServerTransport());
  console.error('LinkedIn MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
