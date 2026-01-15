/**
 * LinkedIn OAuth Service
 * Handles OAuth 2.0 authentication flow
 * @module services/auth/oauth
 */

import * as http from 'http';
import * as crypto from 'crypto';
import open from 'open';
import type { LinkedInTokens, LinkedInUser, LinkedInScope } from '../../types/index.js';
import { LINKEDIN_URLS, DEFAULT_CONFIG, DEFAULT_SCOPES } from '../../config/constants.js';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  port?: number;
}

/**
 * LinkedIn OAuth 2.0 Authentication Service
 */
export class OAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly port: number;
  
  private tokens: LinkedInTokens | null = null;
  private user: LinkedInUser | null = null;

  constructor(config: OAuthConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.port = config.port || DEFAULT_CONFIG.OAUTH_PORT;
    this.redirectUri = config.redirectUri || `http://localhost:${this.port}/callback`;
  }

  // ==================== Public API ====================

  isAuthenticated(): boolean {
    if (!this.tokens) return false;
    return Date.now() < this.tokens.expiresAt;
  }

  getAccessToken(): string | null {
    if (!this.isAuthenticated()) return null;
    return this.tokens?.accessToken || null;
  }

  getUser(): LinkedInUser | null {
    return this.user;
  }

  getTokens(): LinkedInTokens | null {
    return this.tokens;
  }

  setTokens(tokens: LinkedInTokens): void {
    this.tokens = tokens;
  }

  logout(): void {
    this.tokens = null;
    this.user = null;
  }

  // ==================== OAuth Flow ====================

  getAuthorizationUrl(scopes: LinkedInScope[] = DEFAULT_SCOPES, state?: string): string {
    const actualState = state || crypto.randomBytes(16).toString('hex');
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: actualState,
      scope: scopes.join(' '),
    });

    return `${LINKEDIN_URLS.OAUTH}/authorization?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<LinkedInTokens> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
    });

    const response = await fetch(`${LINKEDIN_URLS.OAUTH}/accessToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for tokens: ${error}`);
    }

    const data = await response.json();
    
    this.tokens = {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      expiresAt: Date.now() + (data.expires_in * 1000),
      refreshToken: data.refresh_token,
      scope: data.scope,
      tokenType: data.token_type || 'Bearer',
    };

    return this.tokens;
  }

  async refreshAccessToken(): Promise<LinkedInTokens> {
    if (!this.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.tokens.refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const response = await fetch(`${LINKEDIN_URLS.OAUTH}/accessToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    const data = await response.json();
    
    this.tokens = {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      expiresAt: Date.now() + (data.expires_in * 1000),
      refreshToken: data.refresh_token || this.tokens.refreshToken,
      scope: data.scope || this.tokens.scope,
      tokenType: data.token_type || 'Bearer',
    };

    return this.tokens;
  }

  // ==================== User Profile ====================

  async fetchUserProfile(): Promise<LinkedInUser> {
    if (!this.tokens?.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${LINKEDIN_URLS.API}/userinfo`, {
      headers: { 'Authorization': `Bearer ${this.tokens.accessToken}` },
    });

    if (!response.ok) {
      return this.fetchLegacyProfile();
    }

    const data = await response.json();
    
    this.user = {
      id: data.sub,
      firstName: data.given_name || '',
      lastName: data.family_name || '',
      email: data.email,
      profilePicture: data.picture,
      headline: data.headline,
    };

    return this.user;
  }

  private async fetchLegacyProfile(): Promise<LinkedInUser> {
    if (!this.tokens?.accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${LINKEDIN_URLS.API}/me`, {
      headers: { 'Authorization': `Bearer ${this.tokens.accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    
    this.user = {
      id: data.id,
      firstName: data.localizedFirstName || data.firstName?.localized?.en_US || '',
      lastName: data.localizedLastName || data.lastName?.localized?.en_US || '',
      vanityName: data.vanityName,
    };

    // Try to fetch email separately
    await this.fetchEmail();

    return this.user;
  }

  private async fetchEmail(): Promise<void> {
    if (!this.tokens?.accessToken || !this.user) return;

    try {
      const response = await fetch(
        `${LINKEDIN_URLS.API}/emailAddress?q=members&projection=(elements*(handle~))`,
        { headers: { 'Authorization': `Bearer ${this.tokens.accessToken}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.elements?.[0]?.['handle~']?.emailAddress) {
          this.user.email = data.elements[0]['handle~'].emailAddress;
        }
      }
    } catch {
      // Email fetch is optional
    }
  }

  // ==================== Interactive OAuth Flow ====================

  async startOAuthFlow(scopes: LinkedInScope[] = DEFAULT_SCOPES): Promise<LinkedInTokens> {
    return new Promise((resolve, reject) => {
      const state = crypto.randomBytes(16).toString('hex');
      
      const server = http.createServer(async (req, res) => {
        const url = new URL(req.url || '', `http://localhost:${this.port}`);
        
        if (url.pathname === '/callback') {
          await this.handleCallback(url, state, res, server, resolve, reject);
        }
      });

      server.listen(this.port, () => {
        const authUrl = this.getAuthorizationUrl(scopes, state);
        console.error(`Opening browser for LinkedIn authentication...`);
        console.error(`If browser doesn't open, visit: ${authUrl}`);
        open(authUrl).catch(() => {
          console.error(`Please open this URL manually: ${authUrl}`);
        });
      });

      server.on('error', (err) => {
        reject(new Error(`Failed to start OAuth server: ${err.message}`));
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        server.close();
        reject(new Error('OAuth flow timed out'));
      }, 5 * 60 * 1000);
    });
  }

  private async handleCallback(
    url: URL,
    expectedState: string,
    res: http.ServerResponse,
    server: http.Server,
    resolve: (tokens: LinkedInTokens) => void,
    reject: (error: Error) => void
  ): Promise<void> {
    const code = url.searchParams.get('code');
    const returnedState = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (error) {
      this.sendErrorResponse(res, errorDescription || error);
      server.close();
      reject(new Error(errorDescription || error));
      return;
    }

    if (!code || returnedState !== expectedState) {
      this.sendErrorResponse(res, 'Missing code or state mismatch');
      server.close();
      reject(new Error('Invalid OAuth callback: missing code or state mismatch'));
      return;
    }

    try {
      const tokens = await this.exchangeCodeForTokens(code);
      await this.fetchUserProfile();
      
      this.sendSuccessResponse(res);
      server.close();
      resolve(tokens);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.sendErrorResponse(res, message);
      server.close();
      reject(err instanceof Error ? err : new Error(message));
    }
  }

  private sendSuccessResponse(res: http.ServerResponse): void {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(this.generateSuccessHtml());
  }

  private sendErrorResponse(res: http.ServerResponse, message: string): void {
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(this.generateErrorHtml(message));
  }

  private generateSuccessHtml(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Successful</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #0077b5 0%, #00a0dc 100%);">
          <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; max-width: 400px;">
            <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
            <h1 style="color: #0077b5; margin: 0 0 16px 0;">Successfully Connected!</h1>
            <p style="color: #666; margin: 0 0 8px 0;">Welcome, ${this.user?.firstName || 'User'}!</p>
            <p style="color: #999; font-size: 14px; margin: 0;">You can close this window and return to your application.</p>
          </div>
        </body>
      </html>
    `;
  }

  private generateErrorHtml(message: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Failed</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); text-align: center; max-width: 400px;">
            <div style="font-size: 48px; margin-bottom: 16px;">❌</div>
            <h1 style="color: #e53e3e; margin: 0 0 16px 0;">Authentication Failed</h1>
            <p style="color: #666; margin: 0;">${message}</p>
          </div>
        </body>
      </html>
    `;
  }
}
