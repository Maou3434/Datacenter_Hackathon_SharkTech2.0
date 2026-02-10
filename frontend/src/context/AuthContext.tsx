import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'buyer' | 'business';

interface User {
  id: string;
  name: string;
  role: UserRole;
  businessName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, id?: string, name?: string, businessName?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole, id = 'mock-1', name = 'Mock User', businessName = 'Mock Corp') => {
    setUser({ id, name, role, businessName: role === 'business' ? businessName : undefined });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
