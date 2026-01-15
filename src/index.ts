#!/usr/bin/env node

/**
 * LinkedIn MCP Server
 * Model Context Protocol server for LinkedIn job search
 * @module linkedin-mcp-search
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Internal imports
import { getEnvConfig } from './config/index.js';
import { OAuthService } from './services/auth/index.js';
import { allTools } from './tools/definitions.js';
import {
  // Auth handlers
  handleLogin,
  handleLogout,
  handleStatus,
  // Job handlers
  handleSearchJobs,
  handleGetJobDetails,
  handleSearchRemoteJobs,
  handleSearchEntryLevelJobs,
  // Company handlers
  handleGetCompany,
  handleSearchCompanies,
  handleGetCompanyJobs,
  // Helper handlers
  handleGetPopularLocations,
  handleGetIndustries,
  handleGetJobFunctions,
  handleBuildJobSearchUrl,
} from './tools/handlers/index.js';
import type { DatePosted, ExperienceLevel } from './types/index.js';

// ==================== Initialization ====================

const config = getEnvConfig();

// Initialize OAuth service if configured
const auth = config.isOAuthConfigured
  ? new OAuthService({
      clientId: config.linkedIn.clientId,
      clientSecret: config.linkedIn.clientSecret,
      port: config.linkedIn.redirectPort,
    })
  : null;

// ==================== MCP Server ====================

const server = new Server(
  {
    name: 'linkedin-mcp-search',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ==================== Request Handlers ====================

/**
 * List all available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: allTools };
});

/**
 * Handle tool invocations
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    const result = await routeToolCall(name, args as Record<string, unknown>);
    return {
      content: [{ type: 'text', text: result }],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error',
          }),
        },
      ],
      isError: true,
    };
  }
});

/**
 * Route tool calls to appropriate handlers
 */
async function routeToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  switch (name) {
    // ==================== Auth Tools ====================
    case 'linkedin_login':
      return handleLogin(args as { scopes?: string[] }, { auth });

    case 'linkedin_logout':
      return handleLogout({ auth });

    case 'linkedin_status':
      return handleStatus({ auth });

    // ==================== Job Tools ====================
    case 'search_jobs':
      return handleSearchJobs(args);

    case 'get_job_details':
      return handleGetJobDetails(args as { jobId: string });

    case 'search_remote_jobs':
      return handleSearchRemoteJobs(
        args as {
          keywords: string;
          datePosted?: DatePosted;
          experienceLevel?: ExperienceLevel[];
          limit?: number;
        }
      );

    case 'search_entry_level_jobs':
      return handleSearchEntryLevelJobs(
        args as {
          keywords: string;
          location?: string;
          includeInternships?: boolean;
          datePosted?: DatePosted;
          limit?: number;
        }
      );

    // ==================== Company Tools ====================
    case 'get_company':
      return handleGetCompany(args as { companyId: string });

    case 'search_companies':
      return handleSearchCompanies(args as { query: string });

    case 'get_company_jobs':
      return handleGetCompanyJobs(
        args as {
          companyId: string;
          keywords?: string;
          limit?: number;
        }
      );

    // ==================== Helper Tools ====================
    case 'get_popular_locations':
      return handleGetPopularLocations();

    case 'get_industries':
      return handleGetIndustries();

    case 'get_job_functions':
      return handleGetJobFunctions();

    case 'build_job_search_url':
      return handleBuildJobSearchUrl(args);

    // ==================== Unknown Tool ====================
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// ==================== Entry Point ====================

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('LinkedIn MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
