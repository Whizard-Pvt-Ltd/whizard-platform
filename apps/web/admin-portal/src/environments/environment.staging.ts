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
  bffApiUrl: 'https://bffstaging.whizard.club',

  // Stack Auth Configuration
  stackAuth: {
    projectId: 'a3f5b8a7-22d3-49d5-9f56-76e0489e8d51',
    publishableClientKey: 'pck_emn3m14ezqavtsp7b0bbv91swt0cpkazqy9ax83pfcmp8'
  }
};
