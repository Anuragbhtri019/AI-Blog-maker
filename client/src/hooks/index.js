import { useEffect, useState, useRef } from 'react';
import { useThemeStore } from '../store/themeStore';

/**
 * Hook to manage document theme class
 */
export const useTheme = () => {
  const { isDark, toggle, setDark } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return { isDark, toggle, setDark };
};

/**
 * Hook to detect if component is mounted (prevents hydration mismatch)
 */
export const useIsMounted = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
};

/**
 * Hook for infinite scroll
 */
export const useInfiniteScroll = (callback, options = {}) => {
  const [isFetching, setIsFetching] = useState(false);
  const { threshold = 200 } = options;
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;

      if (docHeight - scrollTop - winHeight < threshold && !isFetching) {
        setIsFetching(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, isFetching]);

  useEffect(() => {
    if (isFetching) {
      callbackRef.current();
      setIsFetching(false);
    }
  }, [isFetching]);
};

/**
 * Hook for media query
 */
export const useMediaQuery = query => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

/**
 * Hook for detecting if user is mobile
 */
export const useIsMobile = () => {
  return useMediaQuery('(max-width: 768px)');
};

/**
 * Hook for local storage
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      typeof window !== 'undefined' && window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {
      console.error(`Error setting local storage for ${key}`);
    }
  };

  return [storedValue, setValue];
};

/**
 * Hook for debounced value
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for async operations
 */
export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = async () => {
    setStatus('pending');
    setValue(null);
    setError(null);

    try {
      const result = await asyncFunction();
      setValue(result);
      setStatus('success');
      return result;
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, asyncFunction, execute]);

  return { execute, status, value, error };
};
