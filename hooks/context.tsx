import { useContext, createContext, type PropsWithChildren } from 'react';
import { useStorageState } from './useStorageState';

const AuthContext = createContext<{
  setAppSession: (userData : {user:string}) => void;
  signOut: () => void;
  session?: {
    user: string;
  } | null;
  isLoading: boolean;
}>({
  setAppSession: (userData : {user:string}) => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState<{ user: string}>('session');

  return (
    <AuthContext.Provider
      value={{
        setAppSession: (userData : {user:string}) => {
          // Perform sign-in logic here
          setSession(userData);
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
