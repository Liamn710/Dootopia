import { useCallback, useEffect, useState } from 'react';
import { getUsers } from '../../backend/api';

export type UsersMap = { [id: string]: string };

export type UseUsersMapResult = {
  usersMap: UsersMap;
  refreshUsers: () => Promise<void>;
  loading: boolean;
};

const useUsersMap = (): UseUsersMapResult => {
  const [usersMap, setUsersMap] = useState<UsersMap>({});
  const [loading, setLoading] = useState<boolean>(false);

  const refreshUsers = useCallback(async () => {
    setLoading(true);
    try {
      const users = await getUsers();
      const map: UsersMap = {};
      users.forEach((user: any) => {
        if (user?._id) {
          map[user._id] = user.name || 'Unknown';
        }
      });
      setUsersMap(map);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  return { usersMap, refreshUsers, loading };
};

export default useUsersMap;
