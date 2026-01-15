/**
 * MCP Tool Definitions
 * Defines all available tools for the LinkedIn MCP server
 * @module tools/definitions
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

/**
 * Authentication tool definitions
 */
export const authTools: Tool[] = [
  {
    name: 'linkedin_login',
    description: 'Authenticate with LinkedIn using OAuth 2.0. Opens a browser window for the user to sign in. Required for features like viewing saved jobs and applications.',
    inputSchema: {
      type: 'object',
      properties: {
        scopes: {
          type: 'array',
          items: { type: 'string', enum: ['openid', 'profile', 'email', 'w_member_social'] },
          description: 'OAuth scopes to request. Default: openid, profile, email',
          default: ['openid', 'profile', 'email'],
        },
      },
    },
  },
  {
    name: 'linkedin_logout',
    description: 'Sign out from LinkedIn and clear stored credentials',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'linkedin_status',
    description: 'Check current authentication status and user info',
    inputSchema: { type: 'object', properties: {} },
  },
];

/**
 * Job search tool definitions
 */
export const jobTools: Tool[] = [
  {
    name: 'search_jobs',
    description: 'Search for jobs on LinkedIn with comprehensive filters. No authentication required.',
    inputSchema: {
      type: 'object',
      properties: {
        keywords: {
          type: 'string',
          description: 'Job search keywords (e.g., "software engineer", "product manager python")',
        },
        location: {
          type: 'string',
          description: 'Location to search in (e.g., "San Francisco, CA", "Remote", "United States")',
        },
        geoId: {
          type: 'string',
          description: 'LinkedIn geographic ID for more precise location filtering',
        },
        distance: {
          type: 'number',
          enum: [5, 10, 25, 50, 100],
          description: 'Search radius in miles from location',
        },
        jobType: {
          type: 'array',
          items: { type: 'string', enum: ['full-time', 'part-time', 'contract', 'temporary', 'internship', 'volunteer'] },
          description: 'Filter by job type(s)',
        },
        experienceLevel: {
          type: 'array',
          items: { type: 'string', enum: ['internship', 'entry-level', 'associate', 'mid-senior', 'director', 'executive'] },
          description: 'Filter by experience level(s)',
        },
        workplaceType: {
          type: 'array',
          items: { type: 'string', enum: ['on-site', 'remote', 'hybrid'] },
          description: 'Filter by workplace type(s)',
        },
        datePosted: {
          type: 'string',
          enum: ['past-24-hours', 'past-week', 'past-month', 'any-time'],
          description: 'Filter by when jobs were posted',
        },
        easyApply: {
          type: 'boolean',
          description: 'Only show jobs with Easy Apply option',
        },
        companyIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by specific company IDs',
        },
        sortBy: {
          type: 'string',
          enum: ['most-relevant', 'most-recent'],
          description: 'Sort results by relevance or date',
        },
        start: {
          type: 'number',
          description: 'Pagination offset (default: 0)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 25, max: 50)',
        },
      },
    },
  },
  {
    name: 'get_job_details',
    description: 'Get detailed information about a specific job posting',
    inputSchema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          description: 'The LinkedIn job ID',
        },
      },
      required: ['jobId'],
    },
  },
  {
    name: 'search_remote_jobs',
    description: 'Quick search for remote jobs with keywords',
    inputSchema: {
      type: 'object',
      properties: {
        keywords: {
          type: 'string',
          description: 'Job search keywords',
        },
        datePosted: {
          type: 'string',
          enum: ['past-24-hours', 'past-week', 'past-month', 'any-time'],
          default: 'past-week',
        },
        experienceLevel: {
          type: 'array',
          items: { type: 'string', enum: ['internship', 'entry-level', 'associate', 'mid-senior', 'director', 'executive'] },
        },
        limit: { type: 'number', default: 25 },
      },
      required: ['keywords'],
    },
  },
  {
    name: 'search_entry_level_jobs',
    description: 'Search specifically for entry-level and internship positions',
    inputSchema: {
      type: 'object',
      properties: {
        keywords: {
          type: 'string',
          description: 'Job search keywords',
        },
        location: {
          type: 'string',
          description: 'Location to search in',
        },
        includeInternships: {
          type: 'boolean',
          description: 'Include internship positions',
          default: true,
        },
        datePosted: {
          type: 'string',
          enum: ['past-24-hours', 'past-week', 'past-month', 'any-time'],
          default: 'past-week',
        },
        limit: { type: 'number', default: 25 },
      },
      required: ['keywords'],
    },
  },
];

/**
 * Company tool definitions
 */
export const companyTools: Tool[] = [
  {
    name: 'get_company',
    description: 'Get information about a company on LinkedIn',
    inputSchema: {
      type: 'object',
      properties: {
        companyId: {
          type: 'string',
          description: 'The LinkedIn company ID or vanity name (e.g., "google", "microsoft")',
        },
      },
      required: ['companyId'],
    },
  },
  {
    name: 'search_companies',
    description: 'Search for companies on LinkedIn',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Company search query',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_company_jobs',
    description: 'Get job listings from a specific company',
    inputSchema: {
      type: 'object',
      properties: {
        companyId: {
          type: 'string',
          description: 'The LinkedIn company ID',
        },
        keywords: {
          type: 'string',
          description: 'Additional keywords to filter jobs',
        },
        limit: { type: 'number', default: 25 },
      },
      required: ['companyId'],
    },
  },
];

/**
 * Helper tool definitions
 */
export const helperTools: Tool[] = [
  {
    name: 'get_popular_locations',
    description: 'Get a list of popular job search locations with their LinkedIn geographic IDs',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_industries',
    description: 'Get a list of LinkedIn industry categories',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_job_functions',
    description: 'Get a list of LinkedIn job function categories',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'build_job_search_url',
    description: 'Generate a LinkedIn job search URL that can be opened in a browser',
    inputSchema: {
      type: 'object',
      properties: {
        keywords: { type: 'string' },
        location: { type: 'string' },
        jobType: {
          type: 'array',
          items: { type: 'string', enum: ['full-time', 'part-time', 'contract', 'temporary', 'internship', 'volunteer'] },
        },
        experienceLevel: {
          type: 'array',
          items: { type: 'string', enum: ['internship', 'entry-level', 'associate', 'mid-senior', 'director', 'executive'] },
        },
        workplaceType: {
          type: 'array',
          items: { type: 'string', enum: ['on-site', 'remote', 'hybrid'] },
        },
        datePosted: {
          type: 'string',
          enum: ['past-24-hours', 'past-week', 'past-month', 'any-time'],
        },
        easyApply: { type: 'boolean' },
      },
    },
  },
];

/**
 * All tool definitions combined
 */
export const allTools: Tool[] = [
  ...authTools,
  ...jobTools,
  ...companyTools,
  ...helperTools,
];
