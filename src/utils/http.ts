/**
 * HTTP Utilities
 * Shared HTTP client factory and helpers
 * @module utils/http
 */

import axios, { AxiosInstance } from 'axios';
import { DEFAULT_HEADERS, DEFAULT_CONFIG, LINKEDIN_URLS } from '../config/constants.js';

/**
 * Create a configured HTTP client for public LinkedIn requests
 */
export function createPublicClient(): AxiosInstance {
  return axios.create({
    baseURL: LINKEDIN_URLS.BASE,
    headers: DEFAULT_HEADERS,
    timeout: DEFAULT_CONFIG.REQUEST_TIMEOUT,
  });
}

/**
 * Create an authenticated HTTP client for LinkedIn API
 */
export function createAuthenticatedClient(accessToken: string): AxiosInstance {
  return axios.create({
    baseURL: LINKEDIN_URLS.API,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    timeout: DEFAULT_CONFIG.REQUEST_TIMEOUT,
  });
}

/**
 * Check if an error is an Axios error
 */
export function isAxiosError(error: unknown): error is import('axios').AxiosError {
  return axios.isAxiosError(error);
}
