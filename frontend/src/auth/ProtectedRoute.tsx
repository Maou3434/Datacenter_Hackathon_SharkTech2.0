import React, { useEffect, useRef } from 'react';
import { useAuth } from './AuthProvider';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, initialized } = useAuth();
  const btnRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!initialized) return;

    // If the user is not signed in and the GIS script is present, render the button
    // @ts-ignore
    if (!user && window.google && window.google.accounts && window.google.accounts.id && btnRef.current) {
      // @ts-ignore
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: 'outline',
        size: 'large',
      });
      // @ts-ignore
      window.google.accounts.id.prompt();
    }
  }, [initialized, user]);

  if (!initialized) {
    return <div className="p-8">Initializing authentication…</div>;
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold text-white">Sign in required</h2>
          <p className="text-sm text-[#AEB7B3]">You must sign in with Google to access the Marketplace.</p>
          <div ref={btnRef} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
