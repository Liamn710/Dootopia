import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMongoUserByFirebaseId } from '../../backend/api';
import useCurrentUser from './useCurrentUser';

type MongoUser = Record<string, any> | null;

type CacheEntry = {
  data: MongoUser;
  timestamp: number;
};

const DEFAULT_CACHE_MS = 2 * 60 * 1000; // 2 minutes
const profileCache: Record<string, CacheEntry> = {};
const storageKeyForProfile = (firebaseUserId: string) => `cachedProfile:${firebaseUserId}`;

const isCacheValid = (entry: CacheEntry | undefined, ttl: number): entry is CacheEntry => {
  return !!entry && Date.now() - entry.timestamp < ttl;
};

const useMongoUserProfile = (cacheMs: number = DEFAULT_CACHE_MS) => {
  const { firebaseUserId } = useCurrentUser();
  const [profile, setProfile] = useState<MongoUser>(() => {
    if (!firebaseUserId) {
      return null;
    }
    const entry = profileCache[firebaseUserId];
    return isCacheValid(entry, cacheMs) ? entry.data : null;
  });
  const [loading, setLoading] = useState<boolean>(!profile && !!firebaseUserId);
  const [error, setError] = useState<Error | null>(null);
  const ttlRef = useRef(cacheMs);
  ttlRef.current = cacheMs;

  const updateCache = useCallback((data: MongoUser) => {
    if (!firebaseUserId) {
      return;
    }
    if (data) {
      profileCache[firebaseUserId] = { data, timestamp: Date.now() };
      AsyncStorage.setItem(storageKeyForProfile(firebaseUserId), JSON.stringify({ data, timestamp: Date.now() })).catch(() => {
        // Persist failure is non-fatal
      });
    } else {
      delete profileCache[firebaseUserId];
      AsyncStorage.removeItem(storageKeyForProfile(firebaseUserId)).catch(() => {
        // Ignore
      });
    }
  }, [firebaseUserId]);

  const refresh = useCallback(async (force = false) => {
    if (!firebaseUserId) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return null;
    }

    const cacheEntry = profileCache[firebaseUserId];
    if (!force && isCacheValid(cacheEntry, ttlRef.current)) {
      setProfile(cacheEntry.data);
      setError(null);
      return cacheEntry.data;
    }

    setLoading(true);
    try {
      const mongoUser = await getMongoUserByFirebaseId(firebaseUserId);
      updateCache(mongoUser);
      setProfile(mongoUser);
      setError(null);
      return mongoUser;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [firebaseUserId, updateCache]);

  useEffect(() => {
    if (!firebaseUserId) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    const entry = profileCache[firebaseUserId];
    if (isCacheValid(entry, ttlRef.current)) {
      setProfile(entry.data);
      setLoading(false);
      return;
    }

    // Try loading from persistent storage before network.
    AsyncStorage.getItem(storageKeyForProfile(firebaseUserId))
      .then(stored => {
        if (!stored) {
          throw new Error('no stored profile');
        }
        const parsed = JSON.parse(stored);
        if (parsed && parsed.data) {
          profileCache[firebaseUserId] = { data: parsed.data, timestamp: parsed.timestamp ?? 0 };
          setProfile(parsed.data);
          setLoading(false);
        } else {
          throw new Error('malformed stored profile');
        }
      })
      .catch(() => {
        refresh(true).catch(() => {
          // Error handled inside refresh; avoid unhandled promise rejection
        });
      });
  }, [firebaseUserId, refresh]);

  const mutateProfile = useCallback((updater: (current: MongoUser) => MongoUser) => {
    setProfile(prev => {
      const next = updater(prev);
      updateCache(next);
      return next;
    });
  }, [updateCache]);

  const invalidate = useCallback(() => {
    if (firebaseUserId) {
      delete profileCache[firebaseUserId];
      AsyncStorage.removeItem(storageKeyForProfile(firebaseUserId)).catch(() => {
        // Ignore
      });
    }
  }, [firebaseUserId]);

  return useMemo(() => ({
    profile,
    loading,
    error,
    refresh,
    mutateProfile,
    invalidate,
  }), [profile, loading, error, refresh, mutateProfile, invalidate]);
};

export default useMongoUserProfile;
