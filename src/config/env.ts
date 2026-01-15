/**
 * Environment Configuration
 * Loads and validates environment variables
 * @module config/env
 */

import { DEFAULT_CONFIG } from './constants.js';

export interface EnvConfig {
  linkedIn: {
    clientId: string;
    clientSecret: string;
    redirectPort: number;
  };
  isOAuthConfigured: boolean;
}

/**
 * Load environment configuration
 * Validates and provides defaults for missing values
 */
export function loadEnvConfig(): EnvConfig {
  const clientId = process.env.LINKEDIN_CLIENT_ID || '';
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
  const redirectPort = parseInt(
    process.env.LINKEDIN_REDIRECT_PORT || String(DEFAULT_CONFIG.OAUTH_PORT),
    10
  );

  return {
    linkedIn: {
      clientId,
      clientSecret,
      redirectPort,
    },
    isOAuthConfigured: Boolean(clientId && clientSecret),
  };
}

/**
 * Get environment configuration (singleton pattern)
 */
let envConfig: EnvConfig | null = null;

export function getEnvConfig(): EnvConfig {
  if (!envConfig) {
    envConfig = loadEnvConfig();
  }
  return envConfig;
}
