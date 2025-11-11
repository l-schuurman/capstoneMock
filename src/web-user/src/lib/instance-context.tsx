/**
 * Instance Context Provider
 * Manages the current selected organization instance across the application
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { InstanceResponse as Instance } from '@large-event/api-types';
import TeamDConfig from '../../../../teamd.config.mts';

interface InstanceContextValue {
  currentInstance: Instance | null;
  instances: Instance[];
  loading: boolean;
  error: string | null;
  setCurrentInstance: (instance: Instance) => void;
  refreshInstances: () => Promise<void>;
}

const InstanceContext = createContext<InstanceContextValue | undefined>(undefined);

const STORAGE_KEY = 'teamd-current-instance';

export function InstanceProvider({ children }: { children: ReactNode }) {
  const [currentInstance, setCurrentInstanceState] = useState<Instance | null>(null);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load instances from API
  const refreshInstances = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get auth token from sessionStorage
      const authToken = sessionStorage.getItem('teamd-auth-token');

      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      // Add Authorization header if token is available
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${TeamDConfig.api.url.local}/api/instances`, {
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch instances: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data.instances) {
        setInstances(data.data.instances);

        // Try to restore previously selected instance
        const storedInstanceId = sessionStorage.getItem(STORAGE_KEY);
        if (storedInstanceId) {
          const restoredInstance = data.data.instances.find(
            (inst: Instance) => inst.id === parseInt(storedInstanceId)
          );
          if (restoredInstance) {
            setCurrentInstanceState(restoredInstance);
          } else {
            // Clear invalid stored instance
            sessionStorage.removeItem(STORAGE_KEY);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching instances:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Load instances on mount
  useEffect(() => {
    refreshInstances();
  }, []);

  // Listen for auth changes and refresh instances
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('Auth changed, refreshing instances...');
      refreshInstances();
    };

    window.addEventListener('teamd-auth-changed', handleAuthChange);
    return () => {
      window.removeEventListener('teamd-auth-changed', handleAuthChange);
    };
  }, []);

  // Set current instance and persist to storage
  const setCurrentInstance = (instance: Instance) => {
    setCurrentInstanceState(instance);
    sessionStorage.setItem(STORAGE_KEY, instance.id.toString());
  };

  const value: InstanceContextValue = {
    currentInstance,
    instances,
    loading,
    error,
    setCurrentInstance,
    refreshInstances,
  };

  return (
    <InstanceContext.Provider value={value}>
      {children}
    </InstanceContext.Provider>
  );
}

export function useInstance() {
  const context = useContext(InstanceContext);
  if (context === undefined) {
    throw new Error('useInstance must be used within an InstanceProvider');
  }
  return context;
}
