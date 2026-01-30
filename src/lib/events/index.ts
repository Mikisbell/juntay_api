/**
 * Events Module
 *
 * Centralized event management system for JUNTAY.
 * Provides observable architecture for system-wide events.
 *
 * @module Events
 */

// Re-export everything from system-events-store
export {
  useSystemEvents,
  useCriticalEvents,
  useErrorCount,
  useUnacknowledgedCount,
  useModuleEvents,
  getSeverityColor,
  getSeverityIcon,
  formatEvent,
} from './system-events-store'

// Re-export types
export type {
  SystemEvent,
  EventSeverity,
  EventModule,
  EventCategory,
} from './system-events-store'

// Convenience re-exports for common patterns
export { useSystemEvents as default } from './system-events-store'
