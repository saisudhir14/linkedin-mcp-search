/**
 * Data Parsing Utilities
 * Helpers for extracting and transforming data
 * @module utils/parsers
 */

import type { WorkplaceType, JobType, ExperienceLevel } from '../types/index.js';

/**
 * Extract job ID from various LinkedIn URL formats
 */
export function extractJobId(url: string): string | null {
  const patterns = [
    /\/jobs\/view\/(\d+)/,
    /currentJobId=(\d+)/,
    /jobId=(\d+)/,
    /\/(\d{10,})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

/**
 * Extract job ID from LinkedIn entity URN
 */
export function extractJobIdFromUrn(urn: string): string | null {
  const match = urn.match(/jobPosting:(\d+)/);
  return match ? match[1] : null;
}

/**
 * Detect workplace type from text content
 */
export function detectWorkplaceType(text: string): WorkplaceType {
  const lower = text.toLowerCase();
  
  if (lower.includes('remote')) return 'remote';
  if (lower.includes('hybrid')) return 'hybrid';
  if (lower.includes('on-site') || lower.includes('onsite')) return 'on-site';
  
  return 'unknown';
}

/**
 * Map employment type string to JobType
 */
export function mapJobType(type: string): JobType {
  const lower = type.toLowerCase();
  
  if (lower.includes('full-time') || lower.includes('full time')) return 'full-time';
  if (lower.includes('part-time') || lower.includes('part time')) return 'part-time';
  if (lower.includes('contract')) return 'contract';
  if (lower.includes('temporary')) return 'temporary';
  if (lower.includes('internship')) return 'internship';
  if (lower.includes('volunteer')) return 'volunteer';
  
  return 'other';
}

/**
 * Map seniority level string to ExperienceLevel
 */
export function mapExperienceLevel(level: string): ExperienceLevel | undefined {
  const lower = level.toLowerCase();
  
  if (lower.includes('internship')) return 'internship';
  if (lower.includes('entry')) return 'entry-level';
  if (lower.includes('associate')) return 'associate';
  if (lower.includes('mid') || lower.includes('senior')) return 'mid-senior';
  if (lower.includes('director')) return 'director';
  if (lower.includes('executive')) return 'executive';
  
  return undefined;
}

/**
 * Clean and normalize text content
 */
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse number from string with commas
 */
export function parseNumber(text: string): number {
  const match = text.match(/[\d,]+/);
  if (match) {
    return parseInt(match[0].replace(/,/g, ''), 10);
  }
  return 0;
}
