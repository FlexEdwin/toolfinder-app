import { toast } from 'sonner';
import UI_LABELS from '../constants/uiLabels';

/**
 * Centralized notification system using sonner toast
 * Provides consistent, labeled notifications across the application
 */
export const notify = {
  // Kit notifications
  kitCreated: () => toast.success(UI_LABELS.TOAST_KIT_CREATED),
  kitDeleted: () => toast.success(UI_LABELS.TOAST_KIT_DELETED),
  kitCopied: () => toast.success(UI_LABELS.TOAST_KIT_COPIED),
  
  // Tool notifications
  toolCreated: () => toast.success(UI_LABELS.TOAST_TOOL_CREATED),
  toolUpdated: () => toast.success(UI_LABELS.TOAST_TOOL_UPDATED),
  toolDeleted: () => toast.success(UI_LABELS.TOAST_TOOL_DELETED),
  
  // Error notifications
  error: (message) => toast.error(`${UI_LABELS.TOAST_ERROR_SAVE} ${message}`),
  deleteError: (message) => toast.error(`${UI_LABELS.TOAST_ERROR_DELETE} ${message}`),
  loadError: () => toast.error(UI_LABELS.TOAST_ERROR_LOAD),
  
  // Form validation
  formIncomplete: () => toast.error(UI_LABELS.TOAST_FORM_INCOMPLETE),
  duplicatePN: () => toast.error(UI_LABELS.TOAST_DUPLICATE_PN),
};

export default notify;
