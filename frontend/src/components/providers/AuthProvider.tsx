import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProfile } from '@/hooks/useAuth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, isAuthenticated } = useAuthStore();
  const { data: profile } = useProfile();

  useEffect(() => {
    if (profile) {
      setUser(profile);
    }
  }, [profile, setUser]);

  return <>{children}</>;
}
