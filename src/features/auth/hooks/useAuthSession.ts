import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(supabase !== null);

  useEffect(() => {
    // Sinkronisasi dengan sesi Supabase Auth: dibaca sekali saat mount,
    // lalu didengarkan lewat onAuthStateChange untuk menangkap sesi baru
    // dari redirect Google OAuth atau tautan magic-link. Tanpa kredensial
    // (`supabase` null), pemain dianggap selalu logged-out — Fase 1 tetap
    // berjalan penuh.
    if (!supabase) return;
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, isLoading };
}
