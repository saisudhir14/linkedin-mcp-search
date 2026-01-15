/**
 * Authentication Tool Handlers
 * @module tools/handlers/auth
 */

import type { LinkedInScope } from '../../types/index.js';
import type { OAuthService } from '../../services/auth/index.js';

export interface AuthHandlerDeps {
  auth: OAuthService | null;
}

/**
 * Handle linkedin_login tool call
 */
export async function handleLogin(
  args: { scopes?: string[] },
  deps: AuthHandlerDeps
): Promise<string> {
  const { auth } = deps;

  if (!auth) {
    return JSON.stringify({
      error: 'LinkedIn OAuth not configured',
      message: 'Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET environment variables',
      setup_instructions: [
        '1. Go to https://www.linkedin.com/developers/apps',
        '2. Create a new app or select existing one',
        '3. Copy the Client ID and Client Secret',
        '4. Add http://localhost:8585/callback to Authorized redirect URLs',
        '5. Set environment variables:',
        '   - LINKEDIN_CLIENT_ID=your_client_id',
        '   - LINKEDIN_CLIENT_SECRET=your_client_secret',
      ],
    });
  }

  if (auth.isAuthenticated()) {
    const user = auth.getUser();
    return JSON.stringify({
      status: 'already_authenticated',
      user: user ? {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        id: user.id,
      } : null,
    });
  }

  try {
    const scopes = (args.scopes || ['openid', 'profile', 'email']) as LinkedInScope[];
    await auth.startOAuthFlow(scopes);
    const user = auth.getUser();

    return JSON.stringify({
      status: 'authenticated',
      message: 'Successfully logged in to LinkedIn!',
      user: user ? {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        id: user.id,
      } : null,
    });
  } catch (error) {
    return JSON.stringify({
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Handle linkedin_logout tool call
 */
export async function handleLogout(deps: AuthHandlerDeps): Promise<string> {
  const { auth } = deps;

  if (!auth) {
    return JSON.stringify({ status: 'not_configured' });
  }

  auth.logout();
  return JSON.stringify({
    status: 'logged_out',
    message: 'Successfully logged out from LinkedIn',
  });
}

/**
 * Handle linkedin_status tool call
 */
export async function handleStatus(deps: AuthHandlerDeps): Promise<string> {
  const { auth } = deps;

  if (!auth) {
    return JSON.stringify({
      configured: false,
      authenticated: false,
      message: 'LinkedIn OAuth not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET.',
    });
  }

  const isAuth = auth.isAuthenticated();
  const user = auth.getUser();
  const tokens = auth.getTokens();

  return JSON.stringify({
    configured: true,
    authenticated: isAuth,
    user: user ? {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      id: user.id,
    } : null,
    tokenExpiry: tokens?.expiresAt ? new Date(tokens.expiresAt).toISOString() : null,
  });
}
