import { useEffect, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseSessionTimeoutOptions {
  timeoutMinutes: number;
  warningMinutes: number;
  onTimeout: () => void;
  enabled: boolean;
}

export function useSessionTimeout({
  timeoutMinutes,
  warningMinutes,
  onTimeout,
  enabled,
}: UseSessionTimeoutOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
  }, []);

  const resetTimers = useCallback(() => {
    if (!enabled) return;

    clearTimers();
    warningShownRef.current = false;

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;

    // Set warning timer
    warningRef.current = setTimeout(() => {
      if (!warningShownRef.current) {
        warningShownRef.current = true;
        toast({
          title: "Session Expiring Soon",
          description: `Your session will expire in ${warningMinutes} minute${warningMinutes > 1 ? 's' : ''} due to inactivity.`,
          variant: "destructive",
        });
      }
    }, warningMs);

    // Set timeout timer
    timeoutRef.current = setTimeout(() => {
      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity.",
      });
      onTimeout();
    }, timeoutMs);
  }, [enabled, timeoutMinutes, warningMinutes, onTimeout, clearTimers]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    // Events that indicate user activity
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetTimers();
    };

    // Initial timer setup
    resetTimers();

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      clearTimers();
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [enabled, resetTimers, clearTimers]);

  return { resetTimers };
}
