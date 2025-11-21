import {
  confirmForgotPassword as confirmForgotPasswordRequest,
  confirmSignUp as confirmSignUpRequest,
  forgotPassword as forgotPasswordRequest,
  signIn as signInRequest,
  signUp as signUpRequest,
  type AuthUser,
  type ConfirmForgotPasswordPayload,
  type ConfirmSignUpPayload,
  type ForgotPasswordPayload,
  type SignInPayload,
  type SignUpPayload,
} from "../api/auth";
import { clearAuthState, loadAuthState, saveAuthState, type StoredAuthState } from "../utils/storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  initializing: boolean;
  signIn: (payload: SignInPayload) => Promise<AuthUser>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  confirmSignUp: (payload: ConfirmSignUpPayload) => Promise<void>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>;
  confirmForgotPassword: (payload: ConfirmForgotPasswordPayload) => Promise<void>;
  signOut: () => void;
  updateUser: (user: AuthUser) => void;
  isSessionActive: () => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [initializing, setInitializing] = useState(true);
  const logoutTimerRef = useRef<number | null>(null);

  const setLogoutTimer = useCallback(
    (expiresAt: number) => {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
      }
      const msUntilExpiry = expiresAt - Date.now();
      if (msUntilExpiry <= 0) {
        logoutTimerRef.current = window.setTimeout(() => {
          handleSignOut();
        }, 0);
        return;
      }
      logoutTimerRef.current = window.setTimeout(() => {
        handleSignOut();
      }, msUntilExpiry);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const persistAuthState = useCallback((nextUser: AuthUser, nextTokens: AuthTokens) => {
    const stored: StoredAuthState = {
      accessToken: nextTokens.accessToken,
      idToken: nextTokens.idToken,
      refreshToken: nextTokens.refreshToken,
      expiresAt: nextTokens.expiresAt,
      user: {
        email: nextUser.email,
        userId: nextUser.userId,
        isVerified: nextUser.isVerified ?? true,
        savedEvents: nextUser.savedEvents ?? [],
      },
    };
    saveAuthState(stored);
    setLogoutTimer(nextTokens.expiresAt);
  }, [setLogoutTimer]);

  const restoreAuthState = useCallback(() => {
    const stored = loadAuthState();
    if (!stored) {
      setInitializing(false);
      return;
    }

    if (stored.expiresAt <= Date.now()) {
      clearAuthState();
      setInitializing(false);
      return;
    }

    const restoredTokens: AuthTokens = {
      accessToken: stored.accessToken,
      idToken: stored.idToken,
      refreshToken: stored.refreshToken,
      expiresAt: stored.expiresAt,
    };
    const restoredUser: AuthUser = {
      email: stored.user.email,
      userId: stored.user.userId,
      isVerified: stored.user.isVerified ?? true,
      savedEvents: stored.user.savedEvents ?? [],
    };

    setUser(restoredUser);
    setTokens(restoredTokens);
    setLogoutTimer(restoredTokens.expiresAt);
    setInitializing(false);
  }, [setLogoutTimer]);

  useEffect(() => {
    restoreAuthState();
    return () => {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
      }
    };
  }, [restoreAuthState]);

  const handleSignIn = useCallback(
    async (payload: SignInPayload) => {
      const response = await signInRequest(payload);
      const normalizedUser: AuthUser = {
        email: response.user.email,
        userId: response.user.userId,
        savedEvents: response.user.savedEvents ?? [],
        isVerified: response.user.isVerified ?? true,
      };

      if (normalizedUser.isVerified === false) {
        throw new Error("Please verify your email before signing in.");
      }

      const expiresAt = Date.now() + response.expiresIn * 1000;
      const nextTokens: AuthTokens = {
        accessToken: response.accessToken,
        idToken: response.idToken,
        refreshToken: response.refreshToken,
        expiresAt,
      };

      setUser(normalizedUser);
      setTokens(nextTokens);
      persistAuthState(normalizedUser, nextTokens);
      return normalizedUser;
    },
    [persistAuthState],
  );

  const handleSignUp = useCallback(async (payload: SignUpPayload) => {
    await signUpRequest(payload);
  }, []);

  const handleConfirmSignUp = useCallback(async (payload: ConfirmSignUpPayload) => {
    await confirmSignUpRequest(payload);
  }, []);

  const handleForgotPassword = useCallback(async (payload: ForgotPasswordPayload) => {
    await forgotPasswordRequest(payload);
  }, []);

  const handleConfirmForgotPassword = useCallback(
    async (payload: ConfirmForgotPasswordPayload) => {
      await confirmForgotPasswordRequest(payload);
    },
    [],
  );

  function handleSignOut() {
    setUser(null);
    setTokens(null);
    clearAuthState();
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }

  const handleUpdateUser = useCallback(
    (nextUser: AuthUser) => {
      const normalizedUser: AuthUser = {
        email: nextUser.email,
        userId: nextUser.userId,
        savedEvents: nextUser.savedEvents ?? [],
        isVerified: nextUser.isVerified ?? true,
      };
      setUser(normalizedUser);
      if (tokens) {
        persistAuthState(normalizedUser, tokens);
      }
    },
    [persistAuthState, tokens],
  );

  const isSessionActive = useCallback(() => {
    if (!tokens) return false;
    return tokens.expiresAt > Date.now();
  }, [tokens]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      initializing,
      signIn: handleSignIn,
      signUp: handleSignUp,
      confirmSignUp: handleConfirmSignUp,
      forgotPassword: handleForgotPassword,
      confirmForgotPassword: handleConfirmForgotPassword,
      signOut: handleSignOut,
      updateUser: handleUpdateUser,
      isSessionActive,
    }),
    [
      user,
      tokens,
      initializing,
      handleSignIn,
      handleSignUp,
      handleConfirmSignUp,
      handleForgotPassword,
      handleConfirmForgotPassword,
      handleUpdateUser,
      isSessionActive,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
