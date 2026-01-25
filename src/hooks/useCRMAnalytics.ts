import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type CRMEventType = 
  | 'tab_switch'
  | 'filter_apply'
  | 'search_query'
  | 'contact_view'
  | 'export_action'
  | 'print_action'
  | 'sync_action'
  | 'dedup_action'
  | 'import_action'
  | 'presentation_mode'
  | 'session_start'
  | 'session_end';

interface CRMEvent {
  event_type: CRMEventType;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// Debounce queue for batching events
let eventQueue: CRMEvent[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

export function useCRMAnalytics() {
  const { user } = useAuth();
  const sessionStartRef = useRef<string | null>(null);
  const isAuthenticatedRef = useRef(false);

  // Update auth ref when user changes
  useEffect(() => {
    isAuthenticatedRef.current = !!user;
  }, [user]);

  // Flush events to the database
  const flushEvents = useCallback(async () => {
    if (eventQueue.length === 0 || !isAuthenticatedRef.current) return;
    
    const eventsToFlush = [...eventQueue];
    eventQueue = [];
    
    try {
      // Log each event to activity_logs
      for (const event of eventsToFlush) {
        await supabase.rpc('log_activity', {
          _action: `crm_${event.event_type}`,
          _details: {
            event_type: event.event_type,
            ...event.metadata,
            timestamp: event.timestamp,
          },
        });
      }
    } catch (error) {
      console.error('Failed to log CRM analytics:', error);
      // Re-add failed events to queue for retry
      eventQueue = [...eventsToFlush, ...eventQueue];
    }
  }, []);

  // Queue an event for logging
  const trackEvent = useCallback((eventType: CRMEventType, metadata?: Record<string, unknown>) => {
    if (!isAuthenticatedRef.current) return;

    const event: CRMEvent = {
      event_type: eventType,
      metadata,
      timestamp: new Date().toISOString(),
    };
    
    eventQueue.push(event);
    
    // Debounce flush - wait 2 seconds after last event
    if (flushTimeout) clearTimeout(flushTimeout);
    flushTimeout = setTimeout(flushEvents, 2000);
  }, [flushEvents]);

  // Convenience methods for common events
  const trackTabSwitch = useCallback((tabId: string) => {
    trackEvent('tab_switch', { tab: tabId });
  }, [trackEvent]);

  const trackFilterApply = useCallback((filterType: string, filterValue: string | string[]) => {
    trackEvent('filter_apply', { 
      filter_type: filterType, 
      value_count: Array.isArray(filterValue) ? filterValue.length : 1 
    });
  }, [trackEvent]);

  const trackSearch = useCallback((hasResults: boolean, resultCount: number) => {
    trackEvent('search_query', { has_results: hasResults, result_count: resultCount });
  }, [trackEvent]);

  const trackContactView = useCallback((contactId: string) => {
    trackEvent('contact_view', { contact_id: contactId });
  }, [trackEvent]);

  const trackExport = useCallback((exportType: string, recordCount: number) => {
    trackEvent('export_action', { export_type: exportType, record_count: recordCount });
  }, [trackEvent]);

  const trackPrint = useCallback((recordCount: number) => {
    trackEvent('print_action', { record_count: recordCount });
  }, [trackEvent]);

  const trackSync = useCallback((syncType: string) => {
    trackEvent('sync_action', { sync_type: syncType });
  }, [trackEvent]);

  const trackDedup = useCallback((mergedCount: number) => {
    trackEvent('dedup_action', { merged_count: mergedCount });
  }, [trackEvent]);

  const trackImport = useCallback((importedCount: number) => {
    trackEvent('import_action', { imported_count: importedCount });
  }, [trackEvent]);

  const trackPresentationMode = useCallback((action: 'start' | 'end') => {
    trackEvent('presentation_mode', { action });
  }, [trackEvent]);

  // Session tracking
  const startSession = useCallback(() => {
    if (!sessionStartRef.current) {
      sessionStartRef.current = new Date().toISOString();
      trackEvent('session_start', {});
    }
  }, [trackEvent]);

  const endSession = useCallback(() => {
    if (sessionStartRef.current) {
      const sessionDuration = Math.round(
        (new Date().getTime() - new Date(sessionStartRef.current).getTime()) / 1000
      );
      trackEvent('session_end', { duration_seconds: sessionDuration });
      sessionStartRef.current = null;
      // Immediately flush on session end
      flushEvents();
    }
  }, [trackEvent, flushEvents]);

  // Track session start on mount, end on unmount
  useEffect(() => {
    if (user) {
      startSession();
    }
    
    return () => {
      endSession();
    };
  }, [user, startSession, endSession]);

  // Flush events before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [endSession]);

  return {
    trackEvent,
    trackTabSwitch,
    trackFilterApply,
    trackSearch,
    trackContactView,
    trackExport,
    trackPrint,
    trackSync,
    trackDedup,
    trackImport,
    trackPresentationMode,
    startSession,
    endSession,
  };
}
