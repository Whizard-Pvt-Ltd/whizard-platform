/**
 * Development Environment Configuration
 */

/// <reference types="vite/client" />

export const environment = {
  production: false,

  // BFF API URL
  bffApiUrl: 'http://localhost:3000',

  // Stack Auth Configuration
  stackAuth: {
    projectId: 'a3f5b8a7-22d3-49d5-9f56-76e0489e8d51',
    publishableClientKey: 'pck_emn3m14ezqavtsp7b0bbv91swt0cpkazqy9ax83pfcmp8'
  }
};
