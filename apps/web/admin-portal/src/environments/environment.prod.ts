/**
 * Production Environment Configuration
 */

export const environment = {
  production: true,

  // BFF API URL - should be set via VITE_BFF_API_URL build arg in Dockerfile
  // @ts-ignore - Vite injects import.meta.env at build time
  bffApiUrl: import.meta.env['VITE_BFF_API_URL'] || 'https://bfftest.whizard.club',

  // Stack Auth Configuration
  stackAuth: {
    // @ts-ignore - Vite injects import.meta.env at build time
    projectId: import.meta.env['VITE_STACK_AUTH_PROJECT_ID'] || 'a3f5b8a7-22d3-49d5-9f56-76e0489e8d51',
    // @ts-ignore - Vite injects import.meta.env at build time
    publishableClientKey: import.meta.env['VITE_STACK_AUTH_PUBLISHABLE_CLIENT_KEY'] || ''
  }
};
