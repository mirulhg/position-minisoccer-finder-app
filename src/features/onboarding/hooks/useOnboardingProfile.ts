import { useEffect, useState } from 'react';
import { dbGet, dbPut } from '../../../lib/db';
import { onboardingProfileSchema, type OnboardingProfile } from '../schema';

const STORE = 'onboardingProfile';
const KEY = 'profile';

export function useOnboardingProfile() {
  const [profile, setProfile] = useState<Partial<OnboardingProfile> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sinkronisasi satu kali dengan IndexedDB: memulihkan profil onboarding
    // yang tersimpan supaya pemain tidak mengisi ulang dari nol (FR-06).
    let isMounted = true;
    dbGet<unknown>(STORE, KEY).then((stored) => {
      if (!isMounted) return;
      const parsed = onboardingProfileSchema.partial().safeParse(stored);
      setProfile(parsed.success ? parsed.data : null);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  async function saveProfile(partial: Partial<OnboardingProfile>): Promise<void> {
    const merged = { ...profile, ...partial };
    setProfile(merged);
    await Promise.all([dbPut(STORE, KEY, merged), dbPut('meta', 'lastActivityAt', Date.now())]);
  }

  return { profile, isLoading, saveProfile };
}
