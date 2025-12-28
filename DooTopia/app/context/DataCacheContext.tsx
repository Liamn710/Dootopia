import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type CacheData = {
  tasks: any | null;
  lists: any[] | null;
  userProfile: any | null;
  prizes: any[] | null;
  lastFetched: {
    tasks: number | null;
    lists: number | null;
    userProfile: number | null;
    prizes: number | null;
  };
};

type DataCacheContextType = {
  cache: CacheData;
  setTasksCache: (tasks: any) => void;
  setListsCache: (lists: any[]) => void;
  setUserProfileCache: (profile: any) => void;
  setPrizesCache: (prizes: any[]) => void;
  isTasksCached: () => boolean;
  isListsCached: () => boolean;
  isUserProfileCached: () => boolean;
  isPrizesCached: () => boolean;
  invalidateCache: (key?: 'tasks' | 'lists' | 'userProfile' | 'prizes' | 'all') => void;
  clearAllCache: () => void;
};

const initialCache: CacheData = {
  tasks: null,
  lists: null,
  userProfile: null,
  prizes: null,
  lastFetched: {
    tasks: null,
    lists: null,
    userProfile: null,
    prizes: null,
  },
};

const DataCacheContext = createContext<DataCacheContextType | undefined>(undefined);

export const DataCacheProvider = ({ children }: { children: ReactNode }) => {
  const [cache, setCache] = useState<CacheData>(initialCache);

  const setTasksCache = useCallback((tasks: any) => {
    setCache(prev => ({
      ...prev,
      tasks,
      lastFetched: { ...prev.lastFetched, tasks: Date.now() },
    }));
  }, []);

  const setListsCache = useCallback((lists: any[]) => {
    setCache(prev => ({
      ...prev,
      lists,
      lastFetched: { ...prev.lastFetched, lists: Date.now() },
    }));
  }, []);

  const setUserProfileCache = useCallback((profile: any) => {
    setCache(prev => ({
      ...prev,
      userProfile: profile,
      lastFetched: { ...prev.lastFetched, userProfile: Date.now() },
    }));
  }, []);

  const setPrizesCache = useCallback((prizes: any[]) => {
    setCache(prev => ({
      ...prev,
      prizes,
      lastFetched: { ...prev.lastFetched, prizes: Date.now() },
    }));
  }, []);

  const isTasksCached = useCallback(() => {
    return cache.tasks !== null && cache.lastFetched.tasks !== null;
  }, [cache.tasks, cache.lastFetched.tasks]);

  const isListsCached = useCallback(() => {
    return cache.lists !== null && cache.lastFetched.lists !== null;
  }, [cache.lists, cache.lastFetched.lists]);

  const isUserProfileCached = useCallback(() => {
    return cache.userProfile !== null && cache.lastFetched.userProfile !== null;
  }, [cache.userProfile, cache.lastFetched.userProfile]);

  const isPrizesCached = useCallback(() => {
    return cache.prizes !== null && cache.lastFetched.prizes !== null;
  }, [cache.prizes, cache.lastFetched.prizes]);

  const invalidateCache = useCallback((key?: 'tasks' | 'lists' | 'userProfile' | 'prizes' | 'all') => {
    if (!key || key === 'all') {
      setCache(initialCache);
      return;
    }
    setCache(prev => ({
      ...prev,
      [key]: null,
      lastFetched: { ...prev.lastFetched, [key]: null },
    }));
  }, []);

  const clearAllCache = useCallback(() => {
    setCache(initialCache);
  }, []);

  return (
    <DataCacheContext.Provider
      value={{
        cache,
        setTasksCache,
        setListsCache,
        setUserProfileCache,
        setPrizesCache,
        isTasksCached,
        isListsCached,
        isUserProfileCached,
        isPrizesCached,
        invalidateCache,
        clearAllCache,
      }}
    >
      {children}
    </DataCacheContext.Provider>
  );
};

export const useDataCache = (): DataCacheContextType => {
  const context = useContext(DataCacheContext);
  if (!context) {
    throw new Error('useDataCache must be used within a DataCacheProvider');
  }
  return context;
};

export default DataCacheContext;
