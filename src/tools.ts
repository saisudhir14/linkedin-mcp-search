/**
 * LinkedIn MCP Tool Definitions
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'temporary', 'internship', 'volunteer'];
const EXPERIENCE_LEVELS = ['internship', 'entry-level', 'associate', 'mid-senior', 'director', 'executive'];
const WORKPLACE_TYPES = ['on-site', 'remote', 'hybrid'];
const DATE_POSTED = ['past-hour', 'past-24-hours', 'past-week', 'past-month', 'any-time'];
const POST_DATE_POSTED = ['past-24-hours', 'past-week', 'past-month', 'any-time'];
const MIN_SALARIES = ['40k', '60k', '80k', '100k', '120k', '140k', '160k', '180k', '200k'];

const stringArray = (values: string[], description: string) => ({
  type: 'array',
  items: { type: 'string', enum: values },
  description,
});

/** Filters shared by search_jobs and build_job_search_url. */
const jobFilterProperties = {
  keywords: { type: 'string', description: 'Job search keywords (e.g., "forward deployed engineer", "product manager python")' },
  location: { type: 'string', description: 'Location (e.g., "San Francisco, CA", "United States", "Remote")' },
  geoId: { type: 'string', description: 'LinkedIn geographic ID for precise location filtering (see get_popular_locations)' },
  distance: { type: 'number', enum: [5, 10, 25, 50, 100], description: 'Search radius in miles from location' },
  company: { type: 'string', description: 'Company name (e.g., "Kyndryl"). Only jobs from matching companies are returned.' },
  companyIds: { type: 'array', items: { type: 'string' }, description: 'Numeric LinkedIn company IDs' },
  jobType: stringArray(JOB_TYPES, 'Filter by job type(s)'),
  experienceLevel: stringArray(EXPERIENCE_LEVELS, 'Filter by experience level(s)'),
  workplaceType: stringArray(WORKPLACE_TYPES, 'Filter by workplace type(s)'),
  datePosted: { type: 'string', enum: DATE_POSTED, description: 'Filter by when jobs were posted' },
  industryIds: { type: 'array', items: { type: 'string' }, description: 'LinkedIn industry IDs (see get_industries)' },
  jobFunctions: { type: 'array', items: { type: 'string' }, description: 'Job function codes, e.g. "eng", "it" (see get_job_functions)' },
  minSalary: { type: 'string', enum: MIN_SALARIES, description: 'Minimum annual salary (US jobs only)' },
  easyApply: { type: 'boolean', description: 'Only jobs with LinkedIn Easy Apply' },
  fewApplicants: { type: 'boolean', description: 'Only jobs with fewer than 10 applicants' },
  sortBy: { type: 'string', enum: ['most-relevant', 'most-recent'], description: 'Sort by relevance or date' },
};

const limitProperty = { type: 'number', description: 'Maximum results to return (default: 25, max: 100)' };

const postFilterProperties = {
  keywords: { type: 'string', description: 'Topic or role keywords (e.g., "forward deployed engineer")' },
  company: { type: 'string', description: 'Only posts mentioning this company' },
  hiringOnly: { type: 'boolean', description: 'Only posts that look like hiring announcements' },
  datePosted: { type: 'string', enum: POST_DATE_POSTED, description: 'Filter by when posts were published' },
};

export const tools: Tool[] = [
  // Job Tools
  {
    name: 'search_jobs',
    description:
      'Search LinkedIn jobs with full filters (location, company, experience, job type, workplace type, date, industry, function, salary, Easy Apply). No authentication required. Use nextStart from the result to fetch more.',
    inputSchema: {
      type: 'object',
      properties: {
        ...jobFilterProperties,
        start: { type: 'number', description: 'Pagination offset (use nextStart from a previous result)' },
        limit: limitProperty,
      },
    },
  },
  {
    name: 'get_job_details',
    description: 'Get the full description and criteria of a LinkedIn job posting',
    inputSchema: {
      type: 'object',
      properties: { jobId: { type: 'string', description: 'The LinkedIn job ID (from a job URL or search result)' } },
      required: ['jobId'],
    },
  },
  {
    name: 'search_remote_jobs',
    description: 'Quick search for remote jobs',
    inputSchema: {
      type: 'object',
      properties: {
        keywords: jobFilterProperties.keywords,
        datePosted: { ...jobFilterProperties.datePosted, default: 'past-week' },
        experienceLevel: jobFilterProperties.experienceLevel,
        limit: limitProperty,
      },
      required: ['keywords'],
    },
  },
  {
    name: 'search_entry_level_jobs',
    description: 'Search for entry-level and internship positions',
    inputSchema: {
      type: 'object',
      properties: {
        keywords: jobFilterProperties.keywords,
        location: jobFilterProperties.location,
        includeInternships: { type: 'boolean', description: 'Include internships (default: true)' },
        datePosted: { ...jobFilterProperties.datePosted, default: 'past-week' },
        limit: limitProperty,
      },
      required: ['keywords'],
    },
  },

  // Company Tools
  {
    name: 'get_company',
    description: 'Get a company\'s public LinkedIn profile (description, industry, size, website, headquarters)',
    inputSchema: {
      type: 'object',
      properties: { companyId: { type: 'string', description: 'Company vanity name from its LinkedIn URL (e.g., "kyndryl", "microsoft")' } },
      required: ['companyId'],
    },
  },
  {
    name: 'search_companies',
    description: 'Find companies by name and get their LinkedIn vanity IDs (discovered from public job listings)',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Company name' } },
      required: ['query'],
    },
  },
  {
    name: 'get_company_jobs',
    description: 'Get open jobs at a specific company',
    inputSchema: {
      type: 'object',
      properties: {
        companyId: { type: 'string', description: 'Company name, vanity name (e.g., "kyndryl"), or numeric LinkedIn company ID' },
        keywords: { type: 'string', description: 'Additional keywords (e.g., "forward deployed engineer")' },
        location: jobFilterProperties.location,
        datePosted: jobFilterProperties.datePosted,
        limit: limitProperty,
      },
      required: ['companyId'],
    },
  },

  // Post Tools
  {
    name: 'search_posts',
    description:
      'Search public LinkedIn posts, e.g. hiring announcements from recruiters and managers. Returns post links, authors, and snippets. Also returns a LinkedIn search URL for signed-in browsing.',
    inputSchema: {
      type: 'object',
      properties: { ...postFilterProperties, limit: limitProperty },
      required: ['keywords'],
    },
  },
  {
    name: 'get_post_details',
    description: 'Get the full text, author, publish date, and engagement of a public LinkedIn post',
    inputSchema: {
      type: 'object',
      properties: { url: { type: 'string', description: 'LinkedIn post URL (linkedin.com/posts/... or linkedin.com/feed/update/...)' } },
      required: ['url'],
    },
  },
  {
    name: 'build_post_search_url',
    description: 'Generate a LinkedIn post search URL (sorted by latest) to open in a signed-in browser',
    inputSchema: {
      type: 'object',
      properties: postFilterProperties,
      required: ['keywords'],
    },
  },

  // Helper Tools
  {
    name: 'get_popular_locations',
    description: 'List popular job search locations with their LinkedIn geographic IDs',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_industries',
    description: 'List LinkedIn industries with the IDs used by the industryIds filter',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_job_functions',
    description: 'List LinkedIn job functions with the codes used by the jobFunctions filter',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'build_job_search_url',
    description: 'Generate a LinkedIn job search URL with filters that can be opened in a browser',
    inputSchema: { type: 'object', properties: jobFilterProperties },
  },
];
