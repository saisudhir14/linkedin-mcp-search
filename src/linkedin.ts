/**
 * LinkedIn MCP - All LinkedIn operations consolidated
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import type {
  JobSearchParams,
  JobSearchResult,
  JobDetails,
  LinkedInJob,
  LinkedInCompany,
  WorkplaceType,
  JobType,
  ExperienceLevel,
} from './types.js';

// ============ Constants ============

const LINKEDIN_BASE = 'https://www.linkedin.com';
const JOBS_API = `${LINKEDIN_BASE}/jobs-guest/jobs/api`;

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

const JOB_TYPE_CODES: Record<JobType, string> = {
  'full-time': 'F', 'part-time': 'P', 'contract': 'C',
  'temporary': 'T', 'internship': 'I', 'volunteer': 'V', 'other': 'O',
};

const EXPERIENCE_CODES: Record<ExperienceLevel, string> = {
  'internship': '1', 'entry-level': '2', 'associate': '3',
  'mid-senior': '4', 'director': '5', 'executive': '6',
};

const WORKPLACE_CODES: Record<Exclude<WorkplaceType, 'unknown'>, string> = {
  'on-site': '1', 'remote': '2', 'hybrid': '3',
};

const DATE_CODES: Record<string, string> = {
  'past-24-hours': 'r86400', 'past-week': 'r604800',
  'past-month': 'r2592000', 'any-time': '',
};

export const POPULAR_LOCATIONS = [
  { name: 'United States', geoId: '103644278' },
  { name: 'New York, NY', geoId: '102571732' },
  { name: 'San Francisco Bay Area', geoId: '90000084' },
  { name: 'Los Angeles, CA', geoId: '102448103' },
  { name: 'Seattle, WA', geoId: '104116203' },
  { name: 'Austin, TX', geoId: '104472866' },
  { name: 'Chicago, IL', geoId: '103112676' },
  { name: 'Boston, MA', geoId: '102380872' },
  { name: 'Denver, CO', geoId: '103203548' },
  { name: 'United Kingdom', geoId: '101165590' },
  { name: 'London, UK', geoId: '102257491' },
  { name: 'Canada', geoId: '101174742' },
  { name: 'Toronto, Canada', geoId: '100025096' },
  { name: 'Germany', geoId: '101282230' },
  { name: 'India', geoId: '102713980' },
];

export const INDUSTRIES = [
  'Technology, Information and Internet', 'Hospitals and Health Care',
  'Financial Services', 'IT Services and IT Consulting', 'Software Development',
  'Retail', 'Staffing and Recruiting', 'Manufacturing', 'Higher Education',
  'Banking', 'Insurance', 'Real Estate', 'Construction', 'Marketing Services',
  'Telecommunications', 'Automotive', 'Entertainment Providers',
  'Non-profit Organizations', 'Government Administration', 'Legal Services',
];

export const JOB_FUNCTIONS = [
  'Engineering', 'Information Technology', 'Sales', 'Marketing',
  'Human Resources', 'Finance', 'Operations', 'Product Management',
  'Design', 'Data Science', 'Project Management', 'Business Development',
  'Customer Service', 'Legal', 'Research', 'Quality Assurance',
  'Administrative', 'Consulting', 'Writing/Editing', 'Healthcare Services',
];

// ============ HTTP Client ============

const client = axios.create({
  baseURL: LINKEDIN_BASE,
  headers: DEFAULT_HEADERS,
  timeout: 30000,
});

// ============ URL Builders ============

function buildSearchUrl(params: JobSearchParams): string {
  const sp = new URLSearchParams();

  if (params.keywords) sp.set('keywords', params.keywords);
  if (params.location) sp.set('location', params.location);
  if (params.geoId) sp.set('geoId', params.geoId);
  if (params.distance) sp.set('distance', params.distance.toString());

  if (params.jobType?.length) {
    sp.set('f_JT', params.jobType.map(t => JOB_TYPE_CODES[t]).join(','));
  }
  if (params.experienceLevel?.length) {
    sp.set('f_E', params.experienceLevel.map(e => EXPERIENCE_CODES[e]).join(','));
  }
  if (params.workplaceType?.length) {
    const codes = params.workplaceType
      .filter((w): w is Exclude<WorkplaceType, 'unknown'> => w !== 'unknown')
      .map(w => WORKPLACE_CODES[w])
      .join(',');
    if (codes) sp.set('f_WT', codes);
  }
  if (params.datePosted && params.datePosted !== 'any-time') {
    sp.set('f_TPR', DATE_CODES[params.datePosted]);
  }
  if (params.easyApply) sp.set('f_AL', 'true');
  if (params.companyIds?.length) sp.set('f_C', params.companyIds.join(','));

  sp.set('sortBy', params.sortBy === 'most-recent' ? 'DD' : 'R');
  if (params.start && params.start > 0) sp.set('start', params.start.toString());

  return `${JOBS_API}/seeMoreJobPostings/search?${sp.toString()}`;
}

export function buildPublicJobUrl(params: JobSearchParams): string {
  const sp = new URLSearchParams();

  if (params.keywords) sp.set('keywords', params.keywords);
  if (params.location) sp.set('location', params.location);

  if (params.jobType?.length) {
    sp.set('f_JT', params.jobType.map(t => JOB_TYPE_CODES[t]).join(','));
  }
  if (params.experienceLevel?.length) {
    sp.set('f_E', params.experienceLevel.map(e => EXPERIENCE_CODES[e]).join(','));
  }
  if (params.workplaceType?.length) {
    const codes = params.workplaceType
      .filter((w): w is Exclude<WorkplaceType, 'unknown'> => w !== 'unknown')
      .map(w => WORKPLACE_CODES[w])
      .join(',');
    if (codes) sp.set('f_WT', codes);
  }
  if (params.datePosted && params.datePosted !== 'any-time') {
    sp.set('f_TPR', DATE_CODES[params.datePosted]);
  }
  if (params.easyApply) sp.set('f_AL', 'true');

  return `${LINKEDIN_BASE}/jobs/search/?${sp.toString()}`;
}

// ============ Parsers ============

function extractJobId(url: string): string | null {
  const patterns = [/\/jobs\/view\/(\d+)/, /currentJobId=(\d+)/, /jobId=(\d+)/, /\/(\d{10,})/];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractJobIdFromUrn(urn: string): string | null {
  const m = urn.match(/jobPosting:(\d+)/);
  return m ? m[1] : null;
}

function detectWorkplaceType(text: string): WorkplaceType {
  const lower = text.toLowerCase();
  if (lower.includes('remote')) return 'remote';
  if (lower.includes('hybrid')) return 'hybrid';
  if (lower.includes('on-site') || lower.includes('onsite')) return 'on-site';
  return 'unknown';
}

function mapJobType(type: string): JobType {
  const lower = type.toLowerCase();
  if (lower.includes('full-time') || lower.includes('full time')) return 'full-time';
  if (lower.includes('part-time') || lower.includes('part time')) return 'part-time';
  if (lower.includes('contract')) return 'contract';
  if (lower.includes('temporary')) return 'temporary';
  if (lower.includes('internship')) return 'internship';
  if (lower.includes('volunteer')) return 'volunteer';
  return 'other';
}

function mapExperienceLevel(level: string): ExperienceLevel | undefined {
  const lower = level.toLowerCase();
  if (lower.includes('internship')) return 'internship';
  if (lower.includes('entry')) return 'entry-level';
  if (lower.includes('associate')) return 'associate';
  if (lower.includes('mid') || lower.includes('senior')) return 'mid-senior';
  if (lower.includes('director')) return 'director';
  if (lower.includes('executive')) return 'executive';
  return undefined;
}

function parseNumber(text: string): number {
  const m = text.match(/[\d,]+/);
  return m ? parseInt(m[0].replace(/,/g, ''), 10) : 0;
}

function extractText($: cheerio.CheerioAPI, selectors: string[]): string {
  for (const sel of selectors) {
    const text = $(sel).first().text().trim();
    if (text) return text;
  }
  return '';
}

function parseJobCard($: cheerio.CheerioAPI, $card: cheerio.Cheerio<Element>): LinkedInJob | null {
  let jobId = extractJobIdFromUrn($card.attr('data-entity-urn') || '');
  if (!jobId) {
    jobId = extractJobId($card.find('a.base-card__full-link, a').first().attr('href') || '');
  }
  if (!jobId) return null;

  const title = $card.find('h3.base-search-card__title').text().trim() ||
                $card.find('.base-search-card__title').text().trim();
  const companyEl = $card.find('h4.base-search-card__subtitle');
  const company = companyEl.find('a').text().trim() || companyEl.text().trim();
  const companyLogo = $card.find('img.artdeco-entity-image').attr('data-delayed-url') ||
                      $card.find('img').attr('data-delayed-url');
  const location = $card.find('.job-search-card__location').text().trim();
  const postedTimeAgo = $card.find('time').text().trim();
  const postedDate = $card.find('time').attr('datetime') || '';
  const salary = $card.find('.job-search-card__salary-info').text().trim() || undefined;
  const cardText = $card.text().toLowerCase();

  return {
    id: jobId,
    title: title || 'Unknown Title',
    company: company || 'Unknown Company',
    companyLogo: companyLogo || undefined,
    location: location || 'Unknown Location',
    workplaceType: detectWorkplaceType(cardText),
    jobType: 'full-time',
    postedDate,
    postedTimeAgo: postedTimeAgo || 'Unknown',
    salary,
    url: `${LINKEDIN_BASE}/jobs/view/${jobId}`,
    isEasyApply: cardText.includes('easy apply'),
    isPromoted: cardText.includes('promoted'),
  };
}

function parseJobListings(html: string): LinkedInJob[] {
  const $ = cheerio.load(html);
  const jobs: LinkedInJob[] = [];

  $('div.base-card, li').each((_: number, el: Element) => {
    try {
      const job = parseJobCard($, $(el));
      if (job) jobs.push(job);
    } catch { /* skip */ }
  });

  return jobs;
}

function parseTotalResults(html: string): number | null {
  const $ = cheerio.load(html);
  const text = $('span.results-context-header__job-count').text().trim();
  const count = parseNumber(text);
  return count > 0 ? count : null;
}

function parseJobDetails(html: string, jobId: string): JobDetails | null {
  const $ = cheerio.load(html);

  try {
    const title = extractText($, [
      'h1.top-card-layout__title', 'h1.topcard__title',
      'h2.top-card-layout__title', '.top-card-layout__title', 'h1',
    ]);
    const company = extractText($, [
      'a.topcard__org-name-link', '.topcard__flavor--black-link',
      'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
      '.top-card-layout__second-subline a',
    ]);
    const location = extractText($, [
      'span.topcard__flavor--bullet', '.top-card-layout__bullet', '.topcard__flavor:eq(1)',
    ]);
    const fullDescription = extractText($, [
      'div.show-more-less-html__markup', '.description__text',
      '.show-more-less-html', 'section.description',
    ]);

    const postedTimeAgo = $('span.posted-time-ago__text').text().trim();
    const applicants = $('span.num-applicants__caption').text().trim() || undefined;
    const salary = $('div.salary-main-rail').text().trim() || undefined;
    const companyLinkedInUrl = $('a.topcard__org-name-link').attr('href') || undefined;
    const isEasyApply = $('button.jobs-apply-button').text().toLowerCase().includes('easy apply');

    // Extract job criteria
    const criteria: Record<string, string> = {};
    $('li.description__job-criteria-item').each((_: number, el: Element) => {
      const label = $(el).find('h3').text().trim().toLowerCase();
      const value = $(el).find('span').text().trim();
      criteria[label] = value;
    });

    return {
      id: jobId,
      title: title || 'Unknown Title',
      company: company || 'Unknown Company',
      location: location || 'Unknown Location',
      workplaceType: detectWorkplaceType($('body').text()),
      jobType: mapJobType(criteria['employment type'] || ''),
      experienceLevel: mapExperienceLevel(criteria['seniority level'] || ''),
      postedDate: '',
      postedTimeAgo: postedTimeAgo || 'Unknown',
      applicants,
      salary,
      url: `${LINKEDIN_BASE}/jobs/view/${jobId}`,
      isEasyApply,
      isPromoted: false,
      fullDescription,
      seniorityLevel: criteria['seniority level'],
      employmentType: criteria['employment type'],
      industries: criteria['industries']?.split(',').map(s => s.trim()),
      jobFunctions: criteria['job function']?.split(',').map(s => s.trim()),
      companyLinkedInUrl,
    };
  } catch {
    return null;
  }
}

function parseCompany(html: string, companyId: string): LinkedInCompany | null {
  const $ = cheerio.load(html);

  try {
    const name = extractText($, ['h1.org-top-card-summary__title', 'h1.top-card-layout__title']);
    const description = extractText($, ['p.org-top-card-summary__tagline', '.org-about-company-module__description']);
    const logo = $('img.org-top-card-primary-content__logo').attr('src') || undefined;
    const industry = $('div.org-top-card-summary-info-list__info-item').first().text().trim();
    const website = $('a.org-top-card-primary-actions__action').attr('href') || undefined;

    return {
      id: companyId,
      name: name || 'Unknown Company',
      description,
      logo,
      industry,
      website,
      linkedInUrl: `${LINKEDIN_BASE}/company/${companyId}`,
    };
  } catch {
    return null;
  }
}

function parseCompanySearchResults(html: string): LinkedInCompany[] {
  const $ = cheerio.load(html);
  const companies: LinkedInCompany[] = [];

  $('li.reusable-search__result-container').each((_: number, el: Element) => {
    try {
      const $item = $(el);
      const link = $item.find('a.app-aware-link').attr('href') || '';
      const companyId = link.match(/\/company\/([^/]+)/)?.[1];
      if (!companyId) return;

      companies.push({
        id: companyId,
        name: $item.find('.entity-result__title-text').text().trim(),
        industry: $item.find('.entity-result__primary-subtitle').text().trim(),
        logo: $item.find('img.EntityPhoto-square-3').attr('src') || undefined,
        linkedInUrl: `${LINKEDIN_BASE}/company/${companyId}`,
      });
    } catch { /* skip */ }
  });

  return companies;
}

// ============ Public API ============

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 50;

export async function searchJobs(params: JobSearchParams): Promise<JobSearchResult> {
  const url = buildSearchUrl(params);
  const limit = Math.min(params.limit || DEFAULT_LIMIT, MAX_LIMIT);
  const start = params.start || 0;

  try {
    const response = await client.get(url);
    const jobs = parseJobListings(response.data);
    const totalResults = parseTotalResults(response.data) || jobs.length + start;

    return {
      jobs: jobs.slice(0, limit),
      totalResults,
      currentPage: Math.floor(start / 25) + 1,
      hasMore: jobs.length >= 25,
      searchParams: params,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`LinkedIn search failed: ${error.message}`);
    }
    throw error;
  }
}

export async function searchRemoteJobs(
  keywords: string,
  options?: { datePosted?: JobSearchParams['datePosted']; experienceLevel?: JobSearchParams['experienceLevel']; limit?: number }
): Promise<JobSearchResult> {
  return searchJobs({
    keywords,
    workplaceType: ['remote'],
    datePosted: options?.datePosted || 'past-week',
    experienceLevel: options?.experienceLevel,
    limit: options?.limit,
  });
}

export async function searchEntryLevelJobs(
  keywords: string,
  options?: { location?: string; includeInternships?: boolean; datePosted?: JobSearchParams['datePosted']; limit?: number }
): Promise<JobSearchResult> {
  const levels: JobSearchParams['experienceLevel'] = ['entry-level'];
  if (options?.includeInternships !== false) levels.push('internship');

  return searchJobs({
    keywords,
    location: options?.location,
    experienceLevel: levels,
    datePosted: options?.datePosted || 'past-week',
    limit: options?.limit,
  });
}

export async function getJobDetails(jobId: string): Promise<JobDetails | null> {
  const htmlUrl = `/jobs/view/${jobId}`;

  try {
    const response = await client.get(htmlUrl);
    return parseJobDetails(response.data, jobId);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw new Error(`Failed to get job details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getCompany(companyId: string): Promise<LinkedInCompany | null> {
  try {
    const response = await client.get(`/company/${companyId}`);
    return parseCompany(response.data, companyId);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw new Error(`Failed to get company: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function searchCompanies(query: string): Promise<LinkedInCompany[]> {
  try {
    const response = await client.get(`/search/results/companies/?keywords=${encodeURIComponent(query)}`);
    return parseCompanySearchResults(response.data);
  } catch (error) {
    throw new Error(`Company search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getCompanyJobs(
  companyId: string,
  options?: { keywords?: string; limit?: number }
): Promise<JobSearchResult> {
  return searchJobs({
    keywords: options?.keywords,
    companyIds: [companyId],
    limit: options?.limit,
  });
}
