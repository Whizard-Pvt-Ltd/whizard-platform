/**
 * Development Environment Configuration
 */

/// <reference types="vite/client" />

export const environment = {
  production: false,

  // BFF API URL
  bffApiUrl: process.env['VITE_BFF_API_URL'] || 'http://localhost:3000'

  // Stack Auth Configuration
  stackAuth: {
    projectId: 'a3f5b8a7-22d3-49d5-9f56-76e0489e8d51',
    publishableClientKey: 'pck_pd36qj7jeyemw01c5a7k1s1bfvkbm7servsmxrnkav8z8'
  }
};
