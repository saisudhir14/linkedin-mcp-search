/**
 * Shared HTTP client with retry on rate limiting.
 */

import axios from 'axios';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const client = axios.create({
  headers: {
    'User-Agent': USER_AGENT,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
  },
  timeout: 30_000,
});

// 429 = rate limited; 999 = LinkedIn's bot-detection response.
const RETRYABLE_STATUS = new Set([429, 999]);
const MAX_RETRIES = 2;

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class HttpError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

/**
 * Fetch a URL and return the response body as text. Sends a form POST when `form` is given.
 * Retries rate-limited requests with backoff.
 */
export async function fetchHtml(url: string, options: { form?: Record<string, string> } = {}): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = options.form
        ? await client.post<string>(url, new URLSearchParams(options.form).toString(), {
            responseType: 'text',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          })
        : await client.get<string>(url, { responseType: 'text' });
      return response.data;
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status && RETRYABLE_STATUS.has(status) && attempt < MAX_RETRIES) {
        await sleep(1000 * 2 ** attempt);
        continue;
      }
      if (status === 999 || status === 429) {
        throw new HttpError(`${new URL(url).hostname} is rate limiting requests. Wait a minute and try again.`, status);
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new HttpError(`Request failed: ${message}`, status);
    }
  }
}
