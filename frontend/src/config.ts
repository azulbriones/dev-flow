/**
 * App Configuration
 * Controls runtime behavior based on environment
 */

/**
 * READ_ONLY_MODE:
 * - false (default): Full functionality (local development)
 * - true: Demo mode - read-only, no create/edit/delete
 *
 * Set via environment variable: VITE_READ_ONLY_MODE=true
 */
export const READ_ONLY_MODE = import.meta.env.VITE_READ_ONLY_MODE === 'true' || false;

/**
 * App version and environment info
 */
export const APP_CONFIG = {
  name: 'DevFlow',
  version: '1.0.0',
  readOnlyMode: READ_ONLY_MODE,
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
} as const;

/**
 * Feature flags based on READ_ONLY_MODE
 */
export const FEATURES = {
  /** Can create new workflows */
  canCreateWorkflow: !READ_ONLY_MODE,
  /** Can edit existing workflows */
  canEditWorkflow: !READ_ONLY_MODE,
  /** Can delete workflows or executions */
  canDelete: !READ_ONLY_MODE,
  /** Can access composer in edit mode */
  canComposerEdit: !READ_ONLY_MODE,
  /** Show "Demo Mode" banner */
  showDemoBanner: READ_ONLY_MODE,
} as const;
