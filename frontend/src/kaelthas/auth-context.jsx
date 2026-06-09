import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  getMe,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
} from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMe()
      .then((acc) => active && setAccount(acc))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const login = useCallback(async (username, password) => {
    const { account: acc } = await apiLogin(username, password);
    setAccount(acc);
  }, []);

  const register = useCallback(async (username, email, password) => {
    const { account: acc } = await apiRegister(username, email, password);
    setAccount(acc);
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setAccount(null);
  }, []);

  return (
    <AuthContext.Provider value={{ account, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
