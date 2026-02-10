import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner@2.0.3'; // Ensure this matches the version in package.json if possible, or remove version suffix

export type UserRole = 'buyer' | 'business';

export type User = {
  name: string;
  email: string;
  picture?: string;
  credential: string;
  role: UserRole;
  businessName?: string;
} | null;

type AuthContextValue = {
  user: User;
  signOut: () => void;
  // login is not needed for Google Auth flow as it's handled by the button/script, 
  // but if we want to keep compatibility we could add a dummy one or just update consumer.
  // We will update consumer CarbonMarketplace to not use login.
  initialized: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  signOut: () => { },
  initialized: false,
  isAuthenticated: false
});

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    const backendUrl = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:5000';
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not set');
      setInitialized(true);
      return;
    }

    // Load Google Identity Services script
    const existing = document.getElementById('google-identity');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = 'google-identity';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // @ts-ignore
        if (window.google && window.google.accounts && window.google.accounts.id) {
          // @ts-ignore
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: any) => {
              const credential = response?.credential;
              if (!credential) return;
              const payload = decodeJwtPayload(credential);
              if (!payload) return;

              // Optimistically set client-side user
              // Default role to 'buyer' for now since backend doesn't provide it yet
              const clientUser: User = {
                name: payload.name,
                email: payload.email,
                picture: payload.picture,
                credential,
                role: 'buyer', // Default role for Google Auth users
                // businessName: 'My Business' // Could prompt for this later
              };
              setUser(clientUser);
              try { localStorage.setItem('auth_user', JSON.stringify(clientUser)); } catch { }

              // Send ID token to backend to create a server-side session (cookie)
              try {
                const res = await fetch(`${backendUrl}/api/auth/signin`, {
                  method: 'POST',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id_token: credential }),
                });
                if (res.ok) {
                  const data = await res.json();
                  if (data?.user) {
                    // Merge backend user with our default role if needed
                    const backendUser = { ...clientUser, ...data.user };
                    // Ensure role exists if backend doesn't send it
                    if (!backendUser.role) backendUser.role = 'buyer';

                    setUser(backendUser);
                    try { localStorage.setItem('auth_user', JSON.stringify(backendUser)); } catch { }
                    // notify success
                    // try { toast.success(`Signed in as ${backendUser.name}`); } catch {}
                  }
                } else {
                  const txt = await res.text();
                  console.warn('Backend signin failed', txt);
                  // try { toast.error('Server sign-in failed'); } catch {}
                }
              } catch (e) {
                console.warn('Error sending id_token to backend', e);
                // try { toast.error('Sign-in failed'); } catch {}
              }
            },
          });

          // Enable automatic hint prompt if possible
          // @ts-ignore
          window.google.accounts.id.renderButton?.(document.createElement('div'));
        }
        setInitialized(true);
      };
      document.head.appendChild(script);
    } else {
      setInitialized(true);
    }

    return () => {
      // no-op cleanup
    };
  }, []);

  // On mount, try to sync server session if any
  useEffect(() => {
    const backendUrl = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:5000';
    (async () => {
      try {
        const res = await fetch(`${backendUrl}/api/auth/user`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            // Apply defaults for missing properties
            const loadedUser = {
              ...data.user,
              credential: '', // Backend might not return credential, but we need it for type
              role: data.user.role || 'buyer'
            };
            setUser(loadedUser);
            try { localStorage.setItem('auth_user', JSON.stringify(loadedUser)); } catch { }
          }
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const signOut = () => {
    const backendUrl = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:5000';
    // Try to clear server session
    try {
      fetch(`${backendUrl}/api/auth/signout`, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => { });
    } catch { }

    setUser(null);
    try { localStorage.removeItem('auth_user'); } catch { }
    // @ts-ignore
    if (window.google && window.google.accounts && window.google.accounts.id) {
      // @ts-ignore
      window.google.accounts.id.disableAutoSelect?.();
    }
    // try { toast.success('Signed out'); } catch {}
  };

  return <AuthContext.Provider value={{ user, signOut, initialized, isAuthenticated: !!user }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthProvider;
