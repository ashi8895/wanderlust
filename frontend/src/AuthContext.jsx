import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wl-user");
    if (saved) setUser(JSON.parse(saved));
    setReady(true);
  }, []);

  function login({ token, user }) {
    localStorage.setItem("wl-token", token);
    localStorage.setItem("wl-user", JSON.stringify(user));
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("wl-token");
    localStorage.removeItem("wl-user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
