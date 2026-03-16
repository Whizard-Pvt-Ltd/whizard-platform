/**
 * Production Environment Configuration
 */

export const environment = {
  production: true,

  // BFF API URL - should be set via VITE_BFF_API_URL build arg in Dockerfile
  bffApiUrl: process.env['VITE_BFF_API_URL'] || 'https://api.whizard.com',

  // Stack Auth Configuration
  stackAuth: {
    projectId: process.env['VITE_STACK_AUTH_PROJECT_ID'] || 'a3f5b8a7-22d3-49d5-9f56-76e0489e8d51',
    publishableClientKey: process.env['VITE_STACK_AUTH_PUBLISHABLE_CLIENT_KEY'] || ''
  }
};
