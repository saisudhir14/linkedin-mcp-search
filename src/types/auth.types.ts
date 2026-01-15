/**
 * LinkedIn Authentication Types
 * @module types/auth
 */

export type LinkedInScope =
  | 'openid'
  | 'profile'
  | 'email'
  | 'w_member_social'
  | 'r_liteprofile'
  | 'r_emailaddress';

export interface LinkedInAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: LinkedInScope[];
}

export interface LinkedInTokens {
  accessToken: string;
  expiresIn: number;
  expiresAt: number;
  refreshToken?: string;
  scope: string;
  tokenType: string;
}

export interface LinkedInUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string;
  headline?: string;
  vanityName?: string;
}

export interface AuthStatus {
  configured: boolean;
  authenticated: boolean;
  user: {
    name: string;
    email?: string;
    id: string;
  } | null;
  tokenExpiry: string | null;
}
