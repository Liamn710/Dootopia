import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../../FirebaseConfig';
import { createUser, getMongoUserByFirebaseId } from '../../backend/api';

export type CurrentUserHookResult = {
  firebaseUserId: string | null;
  mongoUserId: string;
  mongoUserLoading: boolean;
};

const useCurrentUser = (): CurrentUserHookResult => {
  const [firebaseUserId, setFirebaseUserId] = useState<string | null>(null);
  const [mongoUserId, setMongoUserId] = useState<string>('');
  const [mongoUserLoading, setMongoUserLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setFirebaseUserId(user?.uid ?? null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchOrCreateMongoUser = async () => {
      setMongoUserLoading(true);

      if (!firebaseUserId) {
        if (isMounted) {
          setMongoUserId('');
          setMongoUserLoading(false);
        }
        return;
      }

      try {
        let mongoUser = await getMongoUserByFirebaseId(firebaseUserId);

        if (!mongoUser || !mongoUser._id) {
          const firebaseUser = auth.currentUser;
          if (!firebaseUser) {
            throw new Error('Missing Firebase user when attempting to create Mongo user.');
          }

          const newUserPayload = {
            firebaseUserId: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email || 'Unnamed User',
            email: firebaseUser.email || '',
          };

          mongoUser = await createUser(newUserPayload);
        }

        if (isMounted) {
          setMongoUserId(mongoUser?._id ?? '');
        }
      } catch (error) {
        console.error('Error fetching or creating MongoDB user:', error);
        if (isMounted) {
          setMongoUserId('');
        }
      } finally {
        if (isMounted) {
          setMongoUserLoading(false);
        }
      }
    };

    fetchOrCreateMongoUser();
    return () => {
      isMounted = false;
    };
  }, [firebaseUserId]);

  return { firebaseUserId, mongoUserId, mongoUserLoading };
};

export default useCurrentUser;
