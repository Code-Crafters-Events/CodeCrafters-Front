import { useState } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    try {
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error al parsear el usuario del localStorage", error);
      return null;
    }
  });

  const login = (userData) => {
    const userId = userData.id || userData.userId || userData.user?.id;

    const normalizedUser = {
      ...userData,
      id: userId,
    };

    localStorage.setItem("user", JSON.stringify(normalizedUser));
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }

    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (newData) => {
    const updated = { ...user, ...newData };

    if (!updated.id && updated.userId) {
      updated.id = updated.userId;
    }

    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    console.log("AuthProvider: Usuario actualizado:", updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
