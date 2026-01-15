/**
 * Tool Handlers Index
 * @module tools/handlers
 */

// Auth handlers
export {
  handleLogin,
  handleLogout,
  handleStatus,
} from './auth.handler.js';
export type { AuthHandlerDeps } from './auth.handler.js';

// Job handlers
export {
  handleSearchJobs,
  handleGetJobDetails,
  handleSearchRemoteJobs,
  handleSearchEntryLevelJobs,
} from './job.handler.js';

// Company handlers
export {
  handleGetCompany,
  handleSearchCompanies,
  handleGetCompanyJobs,
} from './company.handler.js';

// Helper handlers
export {
  handleGetPopularLocations,
  handleGetIndustries,
  handleGetJobFunctions,
  handleBuildJobSearchUrl,
} from './helper.handler.js';
