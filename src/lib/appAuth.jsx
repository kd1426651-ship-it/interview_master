import React, { createContext, useContext, useState, useEffect } from 'react';

const AppAuthContext = createContext(null);
const STORAGE_KEY = 'shuukatsu_user_v1';

export const DEMO_USER = {
  name: 'Yamada Taro',
  nameJp: '山田 太郎',
  level: 'N2',
  industry: 'IT',
  sttLang: 'ja-JP',
  avatar: 'YT',
};

export function AppAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        delete parsed.apiKey;
        delete parsed.mockMode;
        setUser({ ...DEMO_USER, ...parsed });
      }
    } catch (e) {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const u = { ...DEMO_USER, ...(userData || {}) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const updateUser = (data) => {
    const u = { ...user, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  return (
    <AppAuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AppAuthContext.Provider>
  );
}

export const useAppAuth = () => useContext(AppAuthContext);