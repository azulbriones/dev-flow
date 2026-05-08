import { READ_ONLY_MODE, FEATURES } from '../config';

/**
 * Permission checks for UI elements
 * Centralizes READ_ONLY_MODE logic across the app
 */
export const usePermissions = () => {
  return {
    /** Whether we're in demo/read-only mode */
    isReadOnly: READ_ONLY_MODE,

    /** Can create new workflows */
    canCreate: FEATURES.canCreateWorkflow,

    /** Can edit existing workflows */
    canEdit: FEATURES.canEditWorkflow,

    /** Can delete workflows or executions */
    canDelete: FEATURES.canDelete,

    /** Can composer edit mode */
    canComposerEdit: FEATURES.canComposerEdit,

    /** Show demo mode banner */
    showDemoBanner: FEATURES.showDemoBanner,

    /**
     * Get message for blocked actions
     * Use this when user tries to do something blocked
     */
    getBlockedMessage: (action?: 'create' | 'edit' | 'delete') => {
      if (!READ_ONLY_MODE) return null;
      const actionLabel = action ? ` ${action}` : '';
      return (
        `This${actionLabel} action is disabled in demo mode. ` +
        'Run locally for full features.'
      );
    },

    /**
     * Check if an action is allowed
     */
    isActionAllowed: (action: 'create' | 'edit' | 'delete') => {
      if (READ_ONLY_MODE) return false;
      switch (action) {
        case 'create':
          return FEATURES.canCreateWorkflow;
        case 'edit':
          return FEATURES.canEditWorkflow;
        case 'delete':
          return FEATURES.canDelete;
      }
    },
  };
};

/**
 * Helper to conditionally render based on permissions
 * Usage: {whenAllowed('create') && <Button>New</Button>}
 */
export const whenAllowed = (action: 'create' | 'edit' | 'delete') => {
  if (READ_ONLY_MODE) return false;
  switch (action) {
    case 'create':
      return FEATURES.canCreateWorkflow;
    case 'edit':
      return FEATURES.canEditWorkflow;
    case 'delete':
      return FEATURES.canDelete;
  }
};
