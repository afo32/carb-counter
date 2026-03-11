import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const {
      access_token,
      user_id,
      username,
      role,
      first_name,
      last_name,
      country,
    } = response.data;

    const userData = {
      id: user_id,
      username,
      email,
      role,
      first_name,
      last_name,
      country,
    };

    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (
    email,
    password,
    username,
    first_name,
    last_name,
    country,
  ) => {
    const response = await authService.register({
      email,
      password,
      username,
      first_name,
      last_name,
      country,
    });
    const { access_token, user_id, role } = response.data;

    const userData = {
      id: user_id,
      username,
      email,
      role,
      first_name,
      last_name,
      country,
    };

    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Si falla el logout en el servidor, igual limpiamos el estado local
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
