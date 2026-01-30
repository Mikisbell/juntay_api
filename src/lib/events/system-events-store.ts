/**
 * System Events Store
 *
 * Zustand-based centralized event management for JUNTAY.
 * Replaces scattered event handling with a clean, observable architecture.
 *
 * @module SystemEvents
 * @see docs/SYSTEM_BLUEPRINT.md - Architecture patterns
 * @author JUNTAY Development Team
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Event severity levels (aligned with logging standards)
 */
export type EventSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical'

/**
 * System modules that can emit events
 */
export type EventModule =
  | 'replication'    // RxDB sync events
  | 'auth'          // Authentication & authorization
  | 'database'      // Supabase & RxDB operations
  | 'business'      // Business logic (creditos, pagos, etc)
  | 'ui'            // UI interactions & navigation
  | 'system'        // System-level (build, deploy, config)
  | 'external'      // External integrations (WhatsApp, etc)

/**
 * Event categories for filtering
 */
export type EventCategory =
  | 'sync'          // Data synchronization
  | 'validation'    // Data validation errors
  | 'security'      // Security & permissions
  | 'performance'   // Performance issues
  | 'user_action'   // User-triggered actions
  | 'background'    // Background jobs/cron
  | 'notification'  // User-facing notifications

/**
 * Individual system event
 */
export interface SystemEvent {
  /** Unique identifier */
  id: string

  /** Event severity level */
  severity: EventSeverity

  /** Module that emitted the event */
  module: EventModule

  /** Event category for filtering */
  category: EventCategory

  /** Human-readable message */
  message: string

  /** When the event occurred */
  timestamp: Date

  /** Optional additional data */
  metadata?: Record<string, unknown>

  /** Optional error object */
  error?: Error

  /** User ID if relevant */
  userId?: string

  /** Empresa ID if relevant (multi-tenant) */
  empresaId?: string

  /** Whether this event has been acknowledged */
  acknowledged?: boolean
}

/**
 * Store state
 */
interface SystemEventsState {
  /** All events (limited to last N) */
  events: SystemEvent[]

  /** Maximum events to keep in memory */
  maxEvents: number

  /** Paused state (useful for debugging) */
  isPaused: boolean
}

/**
 * Store actions
 */
interface SystemEventsActions {
  // ========================================
  // Core Actions
  // ========================================

  /** Add a new event to the store */
  addEvent: (event: Omit<SystemEvent, 'id' | 'timestamp'>) => void

  /** Clear all events */
  clearEvents: () => void

  /** Clear events older than N minutes */
  clearOldEvents: (minutes: number) => void

  /** Acknowledge an event (mark as seen) */
  acknowledgeEvent: (id: string) => void

  /** Acknowledge all events */
  acknowledgeAll: () => void

  // ========================================
  // Query/Filter Methods
  // ========================================

  /** Get events by module */
  getByModule: (module: EventModule) => SystemEvent[]

  /** Get events by severity */
  getBySeverity: (severity: EventSeverity) => SystemEvent[]

  /** Get events by category */
  getByCategory: (category: EventCategory) => SystemEvent[]

  /** Get unacknowledged events */
  getUnacknowledged: () => SystemEvent[]

  /** Get errors only */
  getErrors: () => SystemEvent[]

  /** Get recent events (last N) */
  getRecent: (count: number) => SystemEvent[]

  // ========================================
  // Helper Shortcuts
  // ========================================

  /** Quick method to log replication error */
  logReplicationError: (collection: string, error: Error) => void

  /** Quick method to log auth event */
  logAuthEvent: (action: string, userId: string, success: boolean) => void

  /** Quick method to log business event */
  logBusinessEvent: (action: string, metadata?: Record<string, unknown>) => void

  /** Quick method to log performance warning */
  logPerformanceWarning: (operation: string, duration: number) => void

  // ========================================
  // Control Methods
  // ========================================

  /** Pause event collection (for debugging) */
  pause: () => void

  /** Resume event collection */
  resume: () => void

  /** Set max events limit */
  setMaxEvents: (max: number) => void
}

/**
 * Complete store type
 */
type SystemEventsStore = SystemEventsState & SystemEventsActions

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useSystemEvents = create<SystemEventsStore>()(
  devtools(
    (set, get) => ({
      // ========================================
      // Initial State
      // ========================================
      events: [],
      maxEvents: 500, // Keep last 500 events
      isPaused: false,

      // ========================================
      // Core Actions
      // ========================================

      addEvent: (eventData) => {
        const state = get()

        // Don't add if paused
        if (state.isPaused) return

        const newEvent: SystemEvent = {
          ...eventData,
          id: crypto.randomUUID(),
          timestamp: new Date(),
          acknowledged: false,
        }

        set((state) => ({
          events: [newEvent, ...state.events].slice(0, state.maxEvents)
        }), false, 'addEvent')

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          const emoji = {
            debug: '🐛',
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌',
            critical: '🚨'
          }[newEvent.severity]

          console.log(
            `${emoji} [${newEvent.module}] ${newEvent.message}`,
            newEvent.metadata || ''
          )
        }
      },

      clearEvents: () => {
        set({ events: [] }, false, 'clearEvents')
      },

      clearOldEvents: (minutes) => {
        const cutoff = new Date(Date.now() - minutes * 60 * 1000)
        set((state) => ({
          events: state.events.filter(e => e.timestamp > cutoff)
        }), false, 'clearOldEvents')
      },

      acknowledgeEvent: (id) => {
        set((state) => ({
          events: state.events.map(e =>
            e.id === id ? { ...e, acknowledged: true } : e
          )
        }), false, 'acknowledgeEvent')
      },

      acknowledgeAll: () => {
        set((state) => ({
          events: state.events.map(e => ({ ...e, acknowledged: true }))
        }), false, 'acknowledgeAll')
      },

      // ========================================
      // Query Methods
      // ========================================

      getByModule: (module) => {
        return get().events.filter(e => e.module === module)
      },

      getBySeverity: (severity) => {
        return get().events.filter(e => e.severity === severity)
      },

      getByCategory: (category) => {
        return get().events.filter(e => e.category === category)
      },

      getUnacknowledged: () => {
        return get().events.filter(e => !e.acknowledged)
      },

      getErrors: () => {
        return get().events.filter(e =>
          e.severity === 'error' || e.severity === 'critical'
        )
      },

      getRecent: (count) => {
        return get().events.slice(0, count)
      },

      // ========================================
      // Helper Shortcuts
      // ========================================

      logReplicationError: (collection, error) => {
        get().addEvent({
          severity: 'error',
          module: 'replication',
          category: 'sync',
          message: `Replication error in ${collection}`,
          error,
          metadata: { collection }
        })
      },

      logAuthEvent: (action, userId, success) => {
        get().addEvent({
          severity: success ? 'info' : 'warning',
          module: 'auth',
          category: 'security',
          message: `Auth: ${action} - ${success ? 'Success' : 'Failed'}`,
          userId,
          metadata: { action, success }
        })
      },

      logBusinessEvent: (action, metadata) => {
        get().addEvent({
          severity: 'info',
          module: 'business',
          category: 'user_action',
          message: action,
          metadata
        })
      },

      logPerformanceWarning: (operation, duration) => {
        get().addEvent({
          severity: 'warning',
          module: 'system',
          category: 'performance',
          message: `Slow operation: ${operation} took ${duration}ms`,
          metadata: { operation, duration }
        })
      },

      // ========================================
      // Control Methods
      // ========================================

      pause: () => {
        set({ isPaused: true }, false, 'pause')
      },

      resume: () => {
        set({ isPaused: false }, false, 'resume')
      },

      setMaxEvents: (max) => {
        set((state) => ({
          maxEvents: max,
          events: state.events.slice(0, max)
        }), false, 'setMaxEvents')
      },
    }),
    { name: 'SystemEvents' }
  )
)

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook to get only critical events
 */
export function useCriticalEvents() {
  return useSystemEvents(state =>
    state.events.filter(e => e.severity === 'critical')
  )
}

/**
 * Hook to get error count
 */
export function useErrorCount() {
  return useSystemEvents(state =>
    state.events.filter(e =>
      e.severity === 'error' || e.severity === 'critical'
    ).length
  )
}

/**
 * Hook to get unacknowledged count
 */
export function useUnacknowledgedCount() {
  return useSystemEvents(state =>
    state.events.filter(e => !e.acknowledged).length
  )
}

/**
 * Hook to get events by module
 */
export function useModuleEvents(module: EventModule) {
  return useSystemEvents(state =>
    state.events.filter(e => e.module === module)
  )
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get severity color for UI
 */
export function getSeverityColor(severity: EventSeverity): string {
  const colors = {
    debug: 'text-slate-500',
    info: 'text-blue-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    critical: 'text-red-600 font-bold'
  }
  return colors[severity]
}

/**
 * Get severity icon
 */
export function getSeverityIcon(severity: EventSeverity): string {
  const icons = {
    debug: '🐛',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    critical: '🚨'
  }
  return icons[severity]
}

/**
 * Format event for display
 */
export function formatEvent(event: SystemEvent): string {
  const time = event.timestamp.toLocaleTimeString()
  const icon = getSeverityIcon(event.severity)
  return `${icon} [${time}] [${event.module}] ${event.message}`
}
