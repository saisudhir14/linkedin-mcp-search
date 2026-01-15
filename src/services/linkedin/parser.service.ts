/**
 * LinkedIn HTML Parser Service
 * Extracts job and company data from LinkedIn HTML responses
 * @module services/linkedin/parser
 */

import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import type { LinkedInJob, JobDetails, LinkedInCompany } from '../../types/index.js';
import {
  extractJobIdFromUrn,
  extractJobId,
  detectWorkplaceType,
  mapJobType,
  mapExperienceLevel,
  parseNumber,
} from '../../utils/parsers.js';

/**
 * Parser service for LinkedIn HTML content
 */
export class ParserService {
  /**
   * Parse job listings from search results HTML
   */
  parseJobListings(html: string): LinkedInJob[] {
    const $ = cheerio.load(html);
    const jobs: LinkedInJob[] = [];

    $('div.base-card, li').each((_: number, element: Element) => {
      try {
        const job = this.parseJobCard($, $(element));
        if (job) {
          jobs.push(job);
        }
      } catch {
        // Skip malformed entries
      }
    });

    return jobs;
  }

  /**
   * Parse a single job card element
   */
  private parseJobCard(
    $: cheerio.CheerioAPI,
    $card: cheerio.Cheerio<Element>
  ): LinkedInJob | null {
    // Get job ID from data-entity-urn attribute (preferred)
    let jobId: string | null = null;
    const entityUrn = $card.attr('data-entity-urn') || '';
    jobId = extractJobIdFromUrn(entityUrn);

    // Fallback: extract from link href
    if (!jobId) {
      const jobLink = $card.find('a.base-card__full-link, a').first().attr('href') || '';
      jobId = extractJobId(jobLink);
    }

    if (!jobId) return null;

    const title = $card.find('h3.base-search-card__title').text().trim() ||
                 $card.find('.base-search-card__title').text().trim();
    
    const companyEl = $card.find('h4.base-search-card__subtitle');
    const company = companyEl.find('a').text().trim() || companyEl.text().trim();
    
    const companyLogo = $card.find('img.artdeco-entity-image').attr('data-delayed-url') ||
                       $card.find('img').attr('data-delayed-url') || undefined;
    
    const location = $card.find('.job-search-card__location').text().trim();
    const postedTimeAgo = $card.find('time').text().trim();
    const postedDate = $card.find('time').attr('datetime') || '';
    const salary = $card.find('.job-search-card__salary-info').text().trim() || undefined;

    const cardText = $card.text().toLowerCase();
    const isEasyApply = cardText.includes('easy apply');
    const isPromoted = cardText.includes('promoted');
    const workplaceType = detectWorkplaceType(cardText);

    return {
      id: jobId,
      title: title || 'Unknown Title',
      company: company || 'Unknown Company',
      companyLogo,
      location: location || 'Unknown Location',
      workplaceType,
      jobType: 'full-time',
      postedDate,
      postedTimeAgo: postedTimeAgo || 'Unknown',
      salary,
      url: `https://www.linkedin.com/jobs/view/${jobId}`,
      isEasyApply,
      isPromoted,
    };
  }

  /**
   * Parse job details from job view page HTML
   */
  parseJobDetails(html: string, jobId: string): JobDetails | null {
    const $ = cheerio.load(html);

    try {
      // Try multiple selectors for title
      const title = this.extractText($, [
        'h1.top-card-layout__title',
        'h1.topcard__title',
        'h2.top-card-layout__title',
        '.top-card-layout__title',
        'h1',
      ]);

      // Company
      const company = this.extractText($, [
        'a.topcard__org-name-link',
        '.topcard__flavor--black-link',
        'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
        '.top-card-layout__second-subline a',
      ]);

      // Location
      const location = this.extractText($, [
        'span.topcard__flavor--bullet',
        '.top-card-layout__bullet',
        '.topcard__flavor:eq(1)',
      ]);

      // Description
      const fullDescription = this.extractText($, [
        'div.show-more-less-html__markup',
        '.description__text',
        '.show-more-less-html',
        'section.description',
      ]);

      const postedTimeAgo = $('span.posted-time-ago__text').text().trim();
      const applicants = $('span.num-applicants__caption').text().trim() || undefined;
      const salary = $('div.salary-main-rail').text().trim() || undefined;

      // Job criteria
      const criteria = this.extractJobCriteria($);
      const companyLinkedInUrl = $('a.topcard__org-name-link').attr('href') || undefined;
      const isEasyApply = $('button.jobs-apply-button').text().toLowerCase().includes('easy apply');

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
        url: `https://www.linkedin.com/jobs/view/${jobId}`,
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

  /**
   * Parse company info from company page HTML
   */
  parseCompany(html: string, companyId: string): LinkedInCompany | null {
    const $ = cheerio.load(html);

    try {
      const name = this.extractText($, [
        'h1.org-top-card-summary__title',
        'h1.top-card-layout__title',
      ]);

      const description = this.extractText($, [
        'p.org-top-card-summary__tagline',
        '.org-about-company-module__description',
      ]);

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
        linkedInUrl: `https://www.linkedin.com/company/${companyId}`,
      };
    } catch {
      return null;
    }
  }

  /**
   * Parse company search results
   */
  parseCompanySearchResults(html: string): LinkedInCompany[] {
    const $ = cheerio.load(html);
    const companies: LinkedInCompany[] = [];

    $('li.reusable-search__result-container').each((_: number, element: Element) => {
      try {
        const $item = $(element);
        const link = $item.find('a.app-aware-link').attr('href') || '';
        const companyId = link.match(/\/company\/([^/]+)/)?.[1];

        if (!companyId) return;

        const name = $item.find('.entity-result__title-text').text().trim();
        const industry = $item.find('.entity-result__primary-subtitle').text().trim();
        const logo = $item.find('img.EntityPhoto-square-3').attr('src') || undefined;

        companies.push({
          id: companyId,
          name,
          industry,
          logo,
          linkedInUrl: `https://www.linkedin.com/company/${companyId}`,
        });
      } catch {
        // Skip malformed entries
      }
    });

    return companies;
  }

  /**
   * Extract total results count from search HTML
   */
  extractTotalResults(html: string): number | null {
    const $ = cheerio.load(html);
    const resultsText = $('span.results-context-header__job-count').text().trim();
    const count = parseNumber(resultsText);
    return count > 0 ? count : null;
  }

  // ==================== Private Helpers ====================

  private extractText($: cheerio.CheerioAPI, selectors: string[]): string {
    for (const selector of selectors) {
      const text = $(selector).first().text().trim();
      if (text) return text;
    }
    return '';
  }

  private extractJobCriteria($: cheerio.CheerioAPI): Record<string, string> {
    const criteria: Record<string, string> = {};
    
    $('li.description__job-criteria-item').each((_: number, el: Element) => {
      const label = $(el).find('h3').text().trim().toLowerCase();
      const value = $(el).find('span').text().trim();
      criteria[label] = value;
    });

    return criteria;
  }
}

// Export singleton instance
export const parserService = new ParserService();
