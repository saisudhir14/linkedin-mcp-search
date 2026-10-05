/**
 * Company lookup via LinkedIn's public company pages and job listings.
 */

import * as cheerio from 'cheerio';
import { fetchHtml, HttpError } from './http.js';
import { LINKEDIN_BASE } from './constants.js';
import { searchJobs } from './jobs.js';
import type { LinkedInCompany } from './types.js';

const clean = (text: string) => text.replace(/\s+/g, ' ').trim();

/** Get a company's public profile by its vanity name (e.g. "microsoft") or numeric ID. */
export async function getCompany(companyId: string): Promise<LinkedInCompany | null> {
  const linkedInUrl = `${LINKEDIN_BASE}/company/${encodeURIComponent(companyId)}`;

  let html: string;
  try {
    html = await fetchHtml(linkedInUrl);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null;
    throw error;
  }

  const $ = cheerio.load(html);
  const name = clean($('h1.top-card-layout__title').first().text()) || clean($('h1').first().text());
  if (!name) return null;

  // The public "About" section tags each field with data-test-id="about-us__<field>".
  const about = (field: string) =>
    clean($(`[data-test-id="about-us__${field}"] dd`).first().text()) || undefined;

  return {
    id: companyId,
    name,
    linkedInUrl,
    logo: $('img.top-card-layout__entity-image').attr('data-delayed-url') || undefined,
    description: clean($('[data-test-id="about-us__description"]').first().text()) ||
      $('meta[name="description"]').attr('content') || undefined,
    industry: about('industry'),
    size: about('size'),
    website: about('website'),
    headquarters: about('headquarters'),
    founded: about('foundedOn'),
    specialties: about('specialties'),
    followers: clean($('.top-card-layout__first-subline').text()).match(/[\d,.]+[KM]? followers/i)?.[0],
  };
}

/**
 * Find companies by name. LinkedIn's company search requires a login, so this
 * discovers companies from public job listings that match the query.
 */
export async function searchCompanies(query: string, limit = 10): Promise<LinkedInCompany[]> {
  const { jobs } = await searchJobs({ keywords: query, limit: 50 });
  const target = query.toLowerCase();
  const companies = new Map<string, LinkedInCompany>();

  for (const job of jobs) {
    const vanity = job.companyUrl?.split('/company/')[1]?.replace(/\/$/, '');
    if (!vanity || companies.has(vanity) || !job.company.toLowerCase().includes(target)) continue;
    companies.set(vanity, {
      id: vanity,
      name: job.company,
      linkedInUrl: `${LINKEDIN_BASE}/company/${vanity}`,
    });
  }

  return [...companies.values()].slice(0, limit);
}
