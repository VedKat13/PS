import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';
import { syncFirebaseUserToDatabase } from '@/lib/api';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  loginWithGithub: () => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  return useContext(AuthContext);
};

// Auto-logout configuration (in milliseconds)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE_LOGOUT = 5 * 60 * 1000; // Show warning 5 minutes before logout

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const signup = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Sync to database after signup
    await syncFirebaseUserToDatabase(result.user);
    return result;
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    // Sync to database after Google login
    await syncFirebaseUserToDatabase(result.user);
    return result;
  };

  const loginWithGithub = async () => {
    const result = await signInWithPopup(auth, githubProvider);
    // Sync to database after GitHub login
    await syncFirebaseUserToDatabase(result.user);
    return result;
  };

  const logout = () => {
    // Clear timers on logout
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    return signOut(auth);
  };

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    // Clear existing timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Only set timer if user is logged in
    if (currentUser) {
      // Set warning timer
      warningTimerRef.current = setTimeout(() => {
        alert('You will be logged out due to inactivity in 5 minutes. Move your mouse or press a key to stay logged in.');
      }, INACTIVITY_TIMEOUT - WARNING_BEFORE_LOGOUT);

      // Set logout timer
      inactivityTimerRef.current = setTimeout(async () => {
        console.log('Auto-logout due to inactivity');
        await logout();
        alert('You have been logged out due to inactivity.');
      }, INACTIVITY_TIMEOUT);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      // Sync user to database whenever auth state changes
      if (user) {
        try {
          await syncFirebaseUserToDatabase(user);
        } catch (error) {
          console.error('Failed to sync user to database:', error);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Set up inactivity tracking
  useEffect(() => {
    if (!currentUser) {
      // Clear timers if user is not logged in
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      return;
    }

    // Start the inactivity timer
    resetInactivityTimer();

    // Events that indicate user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Add event listeners for user activity
    events.forEach((event) => {
      document.addEventListener(event, resetInactivityTimer);
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetInactivityTimer);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, [currentUser]);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    loginWithGithub,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
