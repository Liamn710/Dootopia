import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  addTaskToList as addTaskToListApi,
  createList as createListApi,
  deleteList as deleteListApi,
  getListsByUserId,
  removeTaskFromList as removeTaskFromListApi,
  updateListName as updateListNameApi,
} from '../../backend/api.js';
import { useDataCache } from '../context/DataCacheContext';

export type List = {
  _id: string;
  name: string;
  taskIds: string[];
  userId: string;
  createdAt?: string;
};

export type UseListsDataResult = {
  lists: List[];
  refreshLists: (forceRefresh?: boolean) => Promise<void>;
  createList: (name: string) => Promise<boolean>;
  deleteList: (listId: string) => Promise<void>;
  renameList: (listId: string, newName: string) => Promise<void>;
  addTaskToList: (listId: string, taskId: string) => Promise<void>;
  removeTaskFromList: (listId: string, taskId: string) => Promise<void>;
  isCreatingList: boolean;
  isLoading: boolean;
};

const useListsData = (mongoUserId: string): UseListsDataResult => {
  const [lists, setLists] = useState<List[]>([]);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const { cache, setListsCache, isListsCached } = useDataCache();

  // Load from cache on mount if available
  useEffect(() => {
    if (isListsCached() && cache.lists) {
      setLists(cache.lists);
    }
    setHasMounted(true);
  }, []);

  // Sync lists to cache whenever they change (after initial load)
  useEffect(() => {
    if (hasMounted && lists.length > 0) {
      setListsCache(lists);
    }
  }, [lists, hasMounted, setListsCache]);

  const refreshLists = useCallback(async (forceRefresh: boolean = false) => {
    if (!mongoUserId) {
      console.log('useListsData.refreshLists: No mongoUserId, skipping');
      setLists([]);
      return;
    }

    // Use cached data if available and not forcing refresh
    if (!forceRefresh && isListsCached() && cache.lists) {
      console.log('useListsData: Using cached lists');
      setLists(cache.lists);
      return;
    }

    setIsLoading(true);
    console.log('useListsData.refreshLists: Fetching lists for user:', mongoUserId);
    
    try {
      const userLists = await getListsByUserId(mongoUserId);
      console.log('useListsData.refreshLists: Received:', userLists);
      // Handle both array response and error object response
      if (Array.isArray(userLists)) {
        setLists(userLists);
        setListsCache(userLists); // Update cache
      } else if (userLists?.error) {
        // No lists found is not an error, just empty
        console.log('useListsData.refreshLists: No lists found or error:', userLists.error);
        setLists([]);
      } else {
        setLists([]);
      }
    } catch (error) {
      console.error('useListsData.refreshLists: Error fetching lists:', error);
      setLists([]);
    } finally {
      setIsLoading(false);
    }
  }, [mongoUserId, isListsCached, cache.lists, setListsCache]);

  const createList = useCallback(async (name: string): Promise<boolean> => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return false;
    }

    if (!mongoUserId) {
      Alert.alert('Error', 'User not ready. Please try again.');
      return false;
    }

    setIsCreatingList(true);
    try {
      const newList = {
        name: name.trim(),
        taskIds: [],
        userId: mongoUserId,
        createdAt: new Date().toISOString(),
      };

      console.log('useListsData.createList: Creating list:', newList);
      const result = await createListApi(newList);
      console.log('useListsData.createList: Created:', result);

      if (result && result._id) {
        setLists(prev => [...prev, result]);
        Alert.alert('Success', `List "${name}" created!`);
        return true;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('useListsData.createList: Error:', error);
      Alert.alert('Error', 'Failed to create list. Please try again.');
      return false;
    } finally {
      setIsCreatingList(false);
    }
  }, [mongoUserId]);

  const deleteList = useCallback(async (listId: string) => {
    try {
      console.log('useListsData.deleteList:', listId);
      await deleteListApi(listId);
      setLists(prev => prev.filter(l => l._id !== listId));
    } catch (error) {
      console.error('useListsData.deleteList: Error:', error);
      Alert.alert('Error', 'Failed to delete list');
    }
  }, []);

  const renameList = useCallback(async (listId: string, newName: string) => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    try {
      console.log('useListsData.renameList:', listId, newName);
      await updateListNameApi(listId, newName.trim());
      setLists(prev => prev.map(l =>
        l._id === listId ? { ...l, name: newName.trim() } : l
      ));
    } catch (error) {
      console.error('useListsData.renameList: Error:', error);
      Alert.alert('Error', 'Failed to rename list');
    }
  }, []);

  const addTaskToList = useCallback(async (listId: string, taskId: string) => {
    try {
      console.log('useListsData.addTaskToList:', listId, taskId);
      const updatedList = await addTaskToListApi(listId, taskId);
      setLists(prev => prev.map(l =>
        l._id === listId ? { ...l, taskIds: updatedList.taskIds || [] } : l
      ));
    } catch (error) {
      console.error('useListsData.addTaskToList: Error:', error);
      Alert.alert('Error', 'Failed to add task to list');
    }
  }, []);

  const removeTaskFromList = useCallback(async (listId: string, taskId: string) => {
    try {
      console.log('useListsData.removeTaskFromList:', listId, taskId);
      const updatedList = await removeTaskFromListApi(listId, taskId);
      setLists(prev => prev.map(l =>
        l._id === listId ? { ...l, taskIds: updatedList.taskIds || [] } : l
      ));
    } catch (error) {
      console.error('useListsData.removeTaskFromList: Error:', error);
      Alert.alert('Error', 'Failed to remove task from list');
    }
  }, []);

  return {
    lists,
    refreshLists,
    createList,
    deleteList,
    renameList,
    addTaskToList,
    removeTaskFromList,
    isCreatingList,
    isLoading,
  };
};

export default useListsData;
