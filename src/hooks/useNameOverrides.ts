import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "crm-name-overrides";

interface NameOverrides {
  [recordId: string]: string;
}

export function useNameOverrides() {
  const [overrides, setOverrides] = useState<NameOverrides>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }, [overrides]);

  const getOverride = useCallback((recordId: string): string | undefined => {
    return overrides[recordId];
  }, [overrides]);

  const setOverride = useCallback((recordId: string, name: string) => {
    setOverrides(prev => {
      if (!name.trim()) {
        const { [recordId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [recordId]: name.trim() };
    });
  }, []);

  const removeOverride = useCallback((recordId: string) => {
    setOverrides(prev => {
      const { [recordId]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const hasOverride = useCallback((recordId: string): boolean => {
    return !!overrides[recordId];
  }, [overrides]);

  return { getOverride, setOverride, removeOverride, hasOverride, overrides };
}
