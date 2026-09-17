import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    // Sinkronisasi dengan window.matchMedia: breakpoint viewport bisa
    // berubah kapan saja (resize, rotasi), bukan sesuatu yang bisa dihitung
    // dari state React.
    const mediaQueryList = window.matchMedia(query);
    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }
    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}
