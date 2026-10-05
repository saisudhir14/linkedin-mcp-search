/**
 * Job search and job details via LinkedIn's public (guest) job APIs.
 */

import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import { fetchHtml, HttpError, sleep } from './http.js';
import {
  DATE_CODES, DEFAULT_LIMIT, EXPERIENCE_CODES, JOB_TYPE_CODES, JOBS_GUEST_API, JOBS_PAGE_SIZE,
  LINKEDIN_BASE, MAX_LIMIT, SALARY_CODES, WORKPLACE_CODES,
} from './constants.js';
import type {
  ExperienceLevel, JobDetails, JobSearchParams, JobSearchResult, JobType, LinkedInJob, WorkplaceType,
} from './types.js';

// ============ URL building ============

function buildFilterParams(params: JobSearchParams): URLSearchParams {
  const sp = new URLSearchParams();
  const setList = (key: string, values?: string[]) => {
    if (values?.length) sp.set(key, values.join(','));
  };

  // A company name doubles as a keyword so LinkedIn ranks that company's jobs first.
  const keywords = [params.company, params.keywords].filter(Boolean).join(' ');
  if (keywords) sp.set('keywords', keywords);
  if (params.location) sp.set('location', params.location);
  if (params.geoId) sp.set('geoId', params.geoId);
  if (params.distance) sp.set('distance', String(params.distance));

  setList('f_JT', params.jobType?.map(t => JOB_TYPE_CODES[t]));
  setList('f_E', params.experienceLevel?.map(e => EXPERIENCE_CODES[e]));
  setList('f_WT', params.workplaceType
    ?.filter((w): w is Exclude<WorkplaceType, 'unknown'> => w !== 'unknown')
    .map(w => WORKPLACE_CODES[w]));
  setList('f_C', params.companyIds);
  setList('f_I', params.industryIds);
  setList('f_F', params.jobFunctions);

  if (params.datePosted && params.datePosted !== 'any-time') sp.set('f_TPR', DATE_CODES[params.datePosted]);
  if (params.minSalary) sp.set('f_SB2', SALARY_CODES[params.minSalary]);
  if (params.easyApply) sp.set('f_AL', 'true');
  if (params.fewApplicants) sp.set('f_EA', 'true');
  if (params.sortBy) sp.set('sortBy', params.sortBy === 'most-recent' ? 'DD' : 'R');

  return sp;
}

/** Public LinkedIn job search URL that can be opened in a browser. */
export function buildPublicJobUrl(params: JobSearchParams): string {
  return `${LINKEDIN_BASE}/jobs/search/?${buildFilterParams(params)}`;
}

function buildGuestSearchUrl(params: JobSearchParams, start: number): string {
  const sp = buildFilterParams(params);
  if (start > 0) sp.set('start', String(start));
  return `${JOBS_GUEST_API}/seeMoreJobPostings/search?${sp}`;
}

// ============ Parsing ============

const clean = (text: string) => text.replace(/\s+/g, ' ').trim();
const stripQuery = (url?: string) => url?.split('?')[0];

function detectWorkplaceType(text: string): WorkplaceType {
  const lower = text.toLowerCase();
  if (lower.includes('remote')) return 'remote';
  if (lower.includes('hybrid')) return 'hybrid';
  if (/on-?site/.test(lower)) return 'on-site';
  return 'unknown';
}

function mapJobType(type = ''): JobType | undefined {
  const lower = type.toLowerCase();
  if (lower.includes('full')) return 'full-time';
  if (lower.includes('part')) return 'part-time';
  if (lower.includes('contract')) return 'contract';
  if (lower.includes('temporary')) return 'temporary';
  if (lower.includes('internship')) return 'internship';
  if (lower.includes('volunteer')) return 'volunteer';
  return lower ? 'other' : undefined;
}

function mapExperienceLevel(level = ''): ExperienceLevel | undefined {
  const lower = level.toLowerCase();
  if (lower.includes('internship')) return 'internship';
  if (lower.includes('entry')) return 'entry-level';
  if (lower.includes('associate')) return 'associate';
  if (lower.includes('mid') || lower.includes('senior')) return 'mid-senior';
  if (lower.includes('director')) return 'director';
  if (lower.includes('executive')) return 'executive';
  return undefined;
}

function parseJobCard($card: cheerio.Cheerio<Element>): LinkedInJob | null {
  const id = $card.attr('data-entity-urn')?.match(/jobPosting:(\d+)/)?.[1];
  if (!id) return null;

  const title = clean($card.find('.base-search-card__title').text());
  const $company = $card.find('.base-search-card__subtitle');
  const location = clean($card.find('.job-search-card__location').text());
  const $time = $card.find('time');
  const cardText = $card.text().toLowerCase();

  return {
    id,
    title: title || 'Unknown Title',
    company: clean($company.text()) || 'Unknown Company',
    companyUrl: stripQuery($company.find('a').attr('href')),
    companyLogo: $card.find('img').attr('data-delayed-url') || undefined,
    location: location || 'Unknown Location',
    // Only look at title + location; card text elsewhere can mention "remote" incidentally.
    workplaceType: detectWorkplaceType(`${title} ${location}`),
    postedDate: $time.attr('datetime') || '',
    postedTimeAgo: clean($time.text()) || 'Unknown',
    salary: clean($card.find('.job-search-card__salary-info').text()) || undefined,
    url: `${LINKEDIN_BASE}/jobs/view/${id}`,
    isEasyApply: cardText.includes('easy apply'),
    isPromoted: cardText.includes('promoted'),
  };
}

function parseJobCards(html: string): LinkedInJob[] {
  const $ = cheerio.load(html);
  return $('div.base-card')
    .toArray()
    .map(el => parseJobCard($(el)))
    .filter((job): job is LinkedInJob => job !== null);
}

const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

function matchesCompany(job: LinkedInJob, company: string): boolean {
  const target = normalize(company);
  return normalize(job.company).includes(target) ||
    (job.companyUrl ? normalize(job.companyUrl.split('/company/')[1] ?? '').includes(target) : false);
}

// ============ Public API ============

const PAGE_DELAY_MS = 500;

/**
 * Search jobs, paging through the guest API (10 jobs per page) until `limit` is reached.
 * When `company` is set, only jobs from a matching company are returned.
 */
export async function searchJobs(params: JobSearchParams): Promise<JobSearchResult> {
  const limit = Math.min(Math.max(params.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  // Company filtering discards non-matching jobs, so allow scanning extra pages.
  const maxPages = Math.ceil(limit / JOBS_PAGE_SIZE) * (params.company ? 3 : 1);

  const jobs: LinkedInJob[] = [];
  const seen = new Set<string>();
  let start = params.start ?? 0;
  let exhausted = false;

  for (let page = 0; page < maxPages && jobs.length < limit; page++) {
    if (page > 0) await sleep(PAGE_DELAY_MS);

    const pageJobs = parseJobCards(await fetchHtml(buildGuestSearchUrl(params, start)));
    start += JOBS_PAGE_SIZE;

    for (const job of pageJobs) {
      if (seen.has(job.id)) continue;
      seen.add(job.id);
      if (params.company && !matchesCompany(job, params.company)) continue;
      jobs.push(job);
    }

    if (pageJobs.length < JOBS_PAGE_SIZE) {
      exhausted = true;
      break;
    }
  }

  return {
    jobs: jobs.slice(0, limit),
    nextStart: exhausted ? null : start,
    searchUrl: buildPublicJobUrl(params),
  };
}

export async function getJobDetails(jobId: string): Promise<JobDetails | null> {
  let html: string;
  try {
    html = await fetchHtml(`${JOBS_GUEST_API}/jobPosting/${encodeURIComponent(jobId)}`);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null;
    throw error;
  }

  const $ = cheerio.load(html);
  const title = clean($('.top-card-layout__title').first().text());
  if (!title) return null;

  const criteria: Record<string, string> = {};
  $('li.description__job-criteria-item').each((_, el) => {
    criteria[clean($(el).find('h3').text()).toLowerCase()] = clean($(el).find('span').text());
  });

  const location = clean($('.topcard__flavor--bullet').first().text());
  const $companyLink = $('a.topcard__org-name-link');
  const splitList = (value?: string) => value?.split(',').map(s => s.trim()).filter(Boolean);

  return {
    id: jobId,
    title,
    company: clean($companyLink.text()) || 'Unknown Company',
    companyUrl: stripQuery($companyLink.attr('href')),
    location: location || 'Unknown Location',
    workplaceType: detectWorkplaceType(`${title} ${location}`),
    jobType: mapJobType(criteria['employment type']),
    experienceLevel: mapExperienceLevel(criteria['seniority level']),
    postedDate: '',
    postedTimeAgo: clean($('.posted-time-ago__text').text()) || 'Unknown',
    applicants: clean($('.num-applicants__caption').text()) || undefined,
    salary: clean($('.salary.compensation__salary').text()) || undefined,
    url: `${LINKEDIN_BASE}/jobs/view/${jobId}`,
    isEasyApply: false,
    isPromoted: false,
    fullDescription: $('.show-more-less-html__markup').text().trim(),
    seniorityLevel: criteria['seniority level'],
    employmentType: criteria['employment type'],
    industries: splitList(criteria['industries']),
    jobFunctions: splitList(criteria['job function']),
  };
}
