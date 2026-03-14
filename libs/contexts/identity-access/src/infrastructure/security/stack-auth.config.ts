/**
 * Stack Auth Configuration
 *
 * Loads Stack Auth settings from environment variables.
 */

export interface StackAuthConfig {
  readonly projectId: string;
  readonly secretServerKey?: string;
  readonly publishableClientKey?: string;
}

const assertEnvVar = (value: string | undefined, envKey: string): string => {
  if (!value || value.trim().length === 0) {
    throw new Error(`${envKey} must be set and non-empty.`);
  }
  return value.trim();
};

/**
 * Load Stack Auth configuration from environment variables
 *
 * Required:
 * - STACK_AUTH_PROJECT_ID: Your Stack Auth project ID
 *
 * Optional:
 * - STACK_AUTH_SECRET_SERVER_KEY: Server-side API key (for REST API calls)
 * - STACK_AUTH_PUBLISHABLE_CLIENT_KEY: Client-side publishable key (for frontend)
 */
export const loadStackAuthConfig = (): StackAuthConfig => {
  return {
    projectId: assertEnvVar(process.env.STACK_AUTH_PROJECT_ID, 'STACK_AUTH_PROJECT_ID'),
    secretServerKey: process.env.STACK_AUTH_SECRET_SERVER_KEY,
    publishableClientKey: process.env.STACK_AUTH_PUBLISHABLE_CLIENT_KEY
  };
};
