/**
 * LinkedIn Company Types
 * @module types/company
 */

export interface LinkedInCompany {
  id: string;
  name: string;
  universalName?: string;
  logo?: string;
  description?: string;
  website?: string;
  industry?: string;
  companySize?: string;
  headquarters?: string;
  founded?: number;
  specialties?: string[];
  linkedInUrl: string;
  followerCount?: number;
  employeeCount?: string;
}

export interface CompanySearchResult {
  companies: LinkedInCompany[];
  totalResults: number;
}
