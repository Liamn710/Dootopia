import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  createSubtask,
  createTask,
  deleteSubtask as deleteSubtaskApi,
  deleteTask as deleteTaskApi,
  getMongoUserByEmail,
  getSubtasks,
  getTasks,
  updateSubtask,
  updateTask,
  updateUser,
} from '../../backend/api';
import type { CreatableTaskValues, EditableTaskValues } from '../components/TaskModal';
import { useDataCache } from '../context/DataCacheContext';
import type { Subtask } from '../types/Subtask';
import type { Tag as TagItem, Task, TaskDictionary } from '../types/Task';

export type UseTasksDataResult = {
  tasks: TaskDictionary;
  refreshTasks: (forceRefresh?: boolean) => Promise<void>;
  addTask: (values: CreatableTaskValues) => Promise<boolean>;
  addSubtask: (taskId: string, text: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string) => void;
  toggleSubtaskCompletion: (taskId: string, subtaskId: string) => void;
  toggleTaskExpansion: (taskId: string) => void;
  deleteTask: (taskId: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  editSubtaskText: (taskId: string, subtaskId: string, newText: string) => void;
  updateDueDate: (taskId: string, dueDate: string) => Promise<void>;
  reassignTask: (taskId: string, email: string) => Promise<void>;
  updateTaskTags: (taskId: string, updatedTags: TagItem[]) => Promise<void>;
  editTask: (taskId: string, values: EditableTaskValues) => Promise<void>;
  isCreatingTask: boolean;
  isReassignLoading: boolean;
  updatingTaskId: string | null;
};

const normalizeTags = (tags: any[]): TagItem[] => {
  if (!Array.isArray(tags)) {
    return [];
  }
  return tags.map((t: any) =>
    typeof t === 'string'
      ? { label: t }
      : { label: t?.label ?? String(t), color: t?.color }
  );
};

const useTasksData = (mongoUserId: string): UseTasksDataResult => {
  const [tasks, setTasks] = useState<TaskDictionary>({});
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isReassignLoading, setIsReassignLoading] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  
  const { cache, setTasksCache, isTasksCached } = useDataCache();

  // Load from cache on mount if available
  useEffect(() => {
    if (isTasksCached() && cache.tasks) {
      setTasks(cache.tasks);
    }
    setHasMounted(true);
  }, []);

  // Sync tasks to cache whenever they change (after initial load)
  useEffect(() => {
    if (hasMounted && Object.keys(tasks).length > 0) {
      setTasksCache(tasks);
    }
  }, [tasks, hasMounted, setTasksCache]);

  const refreshTasks = useCallback(async (forceRefresh: boolean = false) => {
    if (!mongoUserId) {
      setTasks({});
      return;
    }
    
    // Use cached data if available and not forcing refresh
    if (!forceRefresh && isTasksCached() && cache.tasks) {
      console.log('useTasksData: Using cached tasks');
      setTasks(cache.tasks);
      return;
    }

    try {
      const [tasksData, subtasksData] = await Promise.all([getTasks(), getSubtasks()]);

      if (!Array.isArray(tasksData)) {
        throw new Error('Unexpected response when fetching tasks');
      }

      const formatted = tasksData
        .filter(task => task.assignedToId === mongoUserId || task.userId === mongoUserId)
        .reduce((acc: TaskDictionary, task: any) => {
          const taskId = task._id ?? task.id;
          if (!taskId) {
            return acc;
          }

          const taskSubtasks: Subtask[] = subtasksData
            .filter((subtask: any) => subtask.parentTaskId === taskId)
            .map((subtask: any) => ({
              id: subtask._id,
              text: subtask.text || subtask.title,
              completed: Boolean(subtask.completed),
            }));

          acc[taskId] = {
            id: taskId,
            title: task.title ?? 'Untitled Task',
            text: task.text ?? '',
            points: Number(task.points) || 0,
            completed: Boolean(task.completed),
            subtasks: taskSubtasks,
            expanded: false,
            assignedToId: task.assignedToId,
            dueDate: task.dueDate,
            tags: normalizeTags(task.tags ?? []),
          };
          return acc;
        }, {} as TaskDictionary);

      setTasks(formatted);
      setTasksCache(formatted); // Update cache
      console.log('useTasksData: Fetched and cached tasks');
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, [mongoUserId, isTasksCached, cache.tasks, setTasksCache]);

  const addTask = useCallback(async (values: CreatableTaskValues) => {
    if (!mongoUserId) {
      Alert.alert('Error', 'Mongo user is not ready yet.');
      return false;
    }

    setIsCreatingTask(true);
    let wasSuccessful = false;
    try {
      let assignToId = mongoUserId;
      if (values.assignEmail && values.assignEmail !== '') {
        try {
          const assignedUser = await getMongoUserByEmail(values.assignEmail);
          if (assignedUser && assignedUser._id) {
            assignToId = assignedUser._id;
          } else {
            Alert.alert('Error', 'No user found with that email. Assigning to yourself.');
          }
        } catch (error) {
          Alert.alert('Error', 'No user found with that email. Assigning to yourself.');
        }
      }

      const payload = {
        title: values.title,
        text: values.text,
        completed: false,
        createdAt: new Date().toISOString(),
        points: values.points,
        userId: mongoUserId,
        assignedToId: assignToId,
        dueDate: values.dueDate || undefined,
        tags: Array.isArray(values.tags) ? values.tags.map(t => ({ label: t.label, color: t.color })) : [],
      };

      const result = await createTask(payload);

      const newTask: Task = {
        id: result._id,
        title: values.title,
        text: values.text,
        points: values.points,
        completed: false,
        subtasks: [],
        expanded: false,
        assignedToId: result.assignedToId,
        dueDate: result.dueDate || undefined,
        tags: Array.isArray(result.tags) ? normalizeTags(result.tags) : values.tags ?? [],
      };

      setTasks(prev => ({
        ...prev,
        [newTask.id]: newTask,
      }));
      wasSuccessful = true;
    } catch (error) {
      console.error('Failed to add task', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    } finally {
      setIsCreatingTask(false);
    }
    return wasSuccessful;
  }, [mongoUserId]);

  const addSubtask = useCallback(async (taskId: string, text: string) => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter subtask text');
      return;
    }

    try {
      const subtaskPayload = {
        title: text.trim(),
        text: text.trim(),
        parentTaskId: taskId,
        completed: false,
        createdAt: new Date().toISOString(),
        points: 0,
        userId: mongoUserId,
      };

      const result = await createSubtask(subtaskPayload);

      const finalSubtask: Subtask = {
        id: result._id,
        text: result.text || result.title,
        completed: Boolean(result.completed),
      };

      setTasks(prev => {
        const task = prev[taskId];
        if (!task) return prev;
        return {
          ...prev,
          [taskId]: {
            ...task,
            subtasks: [...task.subtasks, finalSubtask],
          },
        };
      });
    } catch (error) {
      console.error('Error creating subtask:', error);
      Alert.alert('Error', 'Failed to create subtask');
    }
  }, [mongoUserId]);

  const toggleTaskCompletion = useCallback((taskId: string) => {
    setTasks(prev => {
      const task = prev[taskId];
      if (!task) {
        return prev;
      }

      const updatedTask = { ...task, completed: !task.completed };
      updateTask(taskId, { completed: updatedTask.completed });

      if (mongoUserId) {
        const pointsChange = updatedTask.completed ? task.points : -task.points;
        updateUser(mongoUserId, { $inc: { points: pointsChange } });
      }

      return {
        ...prev,
        [taskId]: updatedTask,
      };
    });
  }, [mongoUserId]);

  const toggleSubtaskCompletion = useCallback((taskId: string, subtaskId: string) => {
    setTasks(prev => {
      const task = prev[taskId];
      if (!task) {
        return prev;
      }

      const updatedSubtasks = task.subtasks.map(subtask => {
        if (subtask.id !== subtaskId) {
          return subtask;
        }

        const updatedSubtask = { ...subtask, completed: !subtask.completed };
        updateSubtask(subtaskId, {
          title: updatedSubtask.text,
          text: updatedSubtask.text,
          completed: updatedSubtask.completed,
          parentTaskId: taskId,
        }).catch(error => {
          console.error('Failed to update subtask in backend:', error);
        });

        return updatedSubtask;
      });

      return {
        ...prev,
        [taskId]: {
          ...task,
          subtasks: updatedSubtasks,
        },
      };
    });
  }, []);

  const toggleTaskExpansion = useCallback((taskId: string) => {
    setTasks(prev => {
      const task = prev[taskId];
      if (!task) {
        return prev;
      }
      return {
        ...prev,
        [taskId]: {
          ...task,
          expanded: !task.expanded,
        },
      };
    });
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteTaskApi(taskId);
      setTasks(prev => {
        const { [taskId]: _removed, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  }, []);

  const deleteSubtask = useCallback(async (taskId: string, subtaskId: string) => {
    try {
      await deleteSubtaskApi(subtaskId);
      setTasks(prev => {
        const task = prev[taskId];
        if (!task) return prev;
        return {
          ...prev,
          [taskId]: {
            ...task,
            subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId),
          },
        };
      });
    } catch (error) {
      console.error('Failed to delete subtask', error);
    }
  }, []);

  const editSubtaskText = useCallback((taskId: string, subtaskId: string, newText: string) => {
    setTasks(prev => {
      const task = prev[taskId];
      if (!task) return prev;
      return {
        ...prev,
        [taskId]: {
          ...task,
          subtasks: task.subtasks.map(subtask =>
            subtask.id === subtaskId ? { ...subtask, text: newText } : subtask
          ),
        },
      };
    });
  }, []);

  const updateDueDate = useCallback(async (taskId: string, dueDate: string) => {
    try {
      await updateTask(taskId, { dueDate });
      setTasks(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          dueDate,
        },
      }));
    } catch (error) {
      console.error('Failed to update due date', error);
      Alert.alert('Error', 'Failed to update due date.');
    }
  }, []);

  const reassignTask = useCallback(async (taskId: string, email: string) => {
    setIsReassignLoading(true);
    try {
      let newAssignedToId = mongoUserId;
      if (email && email !== '') {
        try {
          const assignedUser = await getMongoUserByEmail(email);
          if (assignedUser && assignedUser._id) {
            newAssignedToId = assignedUser._id;
          } else {
            Alert.alert('Error', 'No user found with that email. Assigning to yourself.');
          }
        } catch (error) {
          Alert.alert('Error', 'No user found with that email. Assigning to yourself.');
        }
      }

      await updateTask(taskId, { assignedToId: newAssignedToId });
      setTasks(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          assignedToId: newAssignedToId,
        },
      }));
    } finally {
      setIsReassignLoading(false);
    }
  }, [mongoUserId]);

  const updateTaskTags = useCallback(async (taskId: string, updatedTags: TagItem[]) => {
    try {
      await updateTask(taskId, { tags: updatedTags.map(tag => ({ label: tag.label, color: tag.color })) });
      setTasks(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          tags: updatedTags,
        },
      }));
    } catch (error) {
      console.error('Failed to update tags', error);
      Alert.alert('Error', 'Failed to update tags');
    }
  }, []);

  const editTask = useCallback(async (taskId: string, values: EditableTaskValues) => {
    if (!tasks[taskId]) {
      return;
    }

    try {
      setUpdatingTaskId(taskId);
      await updateTask(taskId, {
        title: values.title,
        text: values.text,
        points: values.points,
        assignedToId: values.assignedToId,
        dueDate: values.dueDate ?? null,
        tags: values.tags?.map(tag => ({ label: tag.label, color: tag.color })) ?? [],
      });

      setTasks(prev => {
        const current = prev[taskId];
        if (!current) return prev;
        return {
          ...prev,
          [taskId]: {
            ...current,
            title: values.title,
            text: values.text,
            points: values.points,
            assignedToId: values.assignedToId,
            dueDate: values.dueDate ?? undefined,
            tags: values.tags,
          },
        };
      });
    } catch (error) {
      console.error('Failed to save task edits', error);
      Alert.alert('Error', 'Failed to save task changes.');
    } finally {
      setUpdatingTaskId(null);
    }
  }, [tasks]);

  return {
    tasks,
    refreshTasks,
    addTask,
    addSubtask,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    toggleTaskExpansion,
    deleteTask,
    deleteSubtask,
    editSubtaskText,
    updateDueDate,
    reassignTask,
    updateTaskTags,
    editTask,
    isCreatingTask,
    isReassignLoading,
    updatingTaskId,
  };
};

export default useTasksData;
