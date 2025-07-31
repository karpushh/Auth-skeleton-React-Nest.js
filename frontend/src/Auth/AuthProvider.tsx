//AuthProvider.tsx
import { createContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { isAxiosError } from "axios";

interface IUser {
  username: string;
  email: string;
  id: string;
}
interface IloginData {
  email: string;
  password: string;
}
interface ISignupData {
  email: string;
  username: string;
  password: string;
}
interface AuthContextType {
  user: IUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (userData: IloginData) => Promise<void>;
  signup: (userData: ISignupData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: React.PropsWithChildren) => {
  const [user, setUser] = useState<null | IUser>(null);
  const [accessToken, setAccessToken] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const response = await api.post<{
          access_token: string;
          user: IUser;
        }>("/auth/refresh");
        const { access_token: newAccessToken, user: userData } = response.data;

        setAccessToken(newAccessToken);
        setUser(userData);
      } catch (error) {
        if (isAxiosError(error)) {
          console.log("No valid session found!", error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (accessToken && !config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [accessToken]);

  async function login(userData: IloginData) {
    const response = await api.post<{ access_token: string; user: IUser }>(
      "/auth/login",
      userData,
    );
    const { access_token: newAccessToken, user: newUser } = response.data;
    setAccessToken(newAccessToken);
    setUser(newUser);
  }

  async function signup(userData: ISignupData) {
    const response = await api.post<{ access_token: string; user: IUser }>(
      "/auth/signup",
      userData,
    );
    const { access_token: newAccessToken, user: newUser } = response.data;
    setAccessToken(newAccessToken);
    setUser(newUser);
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(
          "Backend logout failed:",
          error.response?.data?.message || error.message,
        );
      } else {
        console.error("An unexpected error occurred during logout:", error);
      }
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  }

  const authContextValue = useMemo(
    () => ({
      user,
      accessToken,
      isLoading,
      login,
      signup,
      logout,
    }),
    [user, accessToken, isLoading],
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
