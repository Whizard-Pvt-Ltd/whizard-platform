/**
 * Production Environment Configuration
 *
 * Note: These values are hardcoded for production Docker builds.
 * For different environments (staging, production), update these values
 * and rebuild the Docker image.
 */

export const environment = {
  production: true,

  // BFF API URL
  bffApiUrl: 'https://bfftest.whizard.club',

  // Stack Auth Configuration
  stackAuth: {
    projectId: 'a3f5b8a7-22d3-49d5-9f56-76e0489e8d51',
    publishableClientKey: 'pck_pd36qj7jeyemw01c5a7k1s1bfvkbm7servsmxrnkav8z8'
  }
};
