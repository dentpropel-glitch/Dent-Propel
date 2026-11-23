import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { FALLBACK_PUBLIC_CONFIG } from '../config/businessConfig';
import type { PublicBusinessConfig } from '../lib/funnelLogic';

export type AppRoute =
  | '/'
  | '/checkout'
  | '/thank-you'
  | '/privacy'
  | '/terms'
  | '/refund-policy';

interface FunnelContextValue {
  route: AppRoute;
  searchParams: URLSearchParams;
  navigate: (to: string) => void;
  config: PublicBusinessConfig;
  configLoaded: boolean;
  selectedDeliverableIds: string[];
  toggleDeliverable: (id: string) => void;
  selectedAddonIds: string[];
  toggleAddon: (id: string) => void;
  lastOrderId: string | null;
  setLastOrderId: (id: string | null) => void;
}

const FunnelContext = createContext<FunnelContextValue | null>(null);

const KNOWN_ROUTES: AppRoute[] = [
  '/',
  '/checkout',
  '/thank-you',
  '/privacy',
  '/terms',
  '/refund-policy',
];

function parseRoute(pathname: string): AppRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return (KNOWN_ROUTES.includes(clean as AppRoute) ? clean : '/') as AppRoute;
}

const STORAGE_KEY_DELIVERABLES = 'dp-selected-deliverables';
const STORAGE_KEY_ADDONS = 'dp-selected-addons';
const STORAGE_KEY_ORDER_ID = 'dp-last-order-id';

export function FunnelProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<AppRoute>(() =>
    typeof window !== 'undefined' ? parseRoute(window.location.pathname) : '/',
  );
  const [searchParams, setSearchParams] = useState<URLSearchParams>(() =>
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams(),
  );
  const [config, setConfig] = useState<PublicBusinessConfig>(FALLBACK_PUBLIC_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);

  const [selectedDeliverableIds, setSelectedDeliverableIds] = useState<string[]>(() => {
    const defaults = FALLBACK_PUBLIC_CONFIG.deliverables
      .filter((d) => d.includedByDefault)
      .map((d) => d.id);
    if (typeof window === 'undefined') return defaults;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_DELIVERABLES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return defaults;
  });

  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_ADDONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return [];
  });

  const [lastOrderId, setLastOrderIdState] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(STORAGE_KEY_ORDER_ID);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let active = true;
    fetch('/api/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PublicBusinessConfig | null) => {
        if (active && data) {
          setConfig(data);
        }
      })
      .catch(() => {
        // Keep fallback public config gracefully
      })
      .finally(() => {
        if (active) setConfigLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRoute(window.location.pathname));
      setSearchParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string) => {
    if (to.startsWith('#')) {
      const targetId = to.slice(1);
      if (parseRoute(window.location.pathname) !== '/') {
        window.history.pushState({}, '', `/${to}`);
        setRoute('/');
        setSearchParams(new URLSearchParams());
        setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      } else {
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const [pathPart, queryPart] = to.split('?');
    const hashSplit = (queryPart || '').split('#');
    const queryStr = hashSplit[0] ? `?${hashSplit[0]}` : '';
    const hashStr = hashSplit[1] ? `#${hashSplit[1]}` : '';
    const nextRoute = parseRoute(pathPart || '/');
    const fullUrl = `${nextRoute}${queryStr}${hashStr}`;

    window.history.pushState({}, '', fullUrl);
    setRoute(nextRoute);
    setSearchParams(new URLSearchParams(queryStr));
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const toggleDeliverable = useCallback(
    (id: string) => {
      const target = config.deliverables.find((d) => d.id === id);
      if (!target || !target.configurable) return;
      setSelectedDeliverableIds((prev) => {
        const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
        try {
          sessionStorage.setItem(STORAGE_KEY_DELIVERABLES, JSON.stringify(next));
        } catch {
          // Ignore
        }
        return next;
      });
    },
    [config.deliverables],
  );

  const toggleAddon = useCallback((id: string) => {
    setSelectedAddonIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        sessionStorage.setItem(STORAGE_KEY_ADDONS, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const setLastOrderId = useCallback((id: string | null) => {
    setLastOrderIdState(id);
    try {
      if (id) {
        sessionStorage.setItem(STORAGE_KEY_ORDER_ID, id);
      } else {
        sessionStorage.removeItem(STORAGE_KEY_ORDER_ID);
      }
    } catch {
      // Ignore
    }
  }, []);

  return (
    <FunnelContext.Provider
      value={{
        route,
        searchParams,
        navigate,
        config,
        configLoaded,
        selectedDeliverableIds,
        toggleDeliverable,
        selectedAddonIds,
        toggleAddon,
        lastOrderId,
        setLastOrderId,
      }}
    >
      {children}
    </FunnelContext.Provider>
  );
}

export function useFunnel(): FunnelContextValue {
  const ctx = useContext(FunnelContext);
  if (!ctx) {
    throw new Error('useFunnel must be used within FunnelProvider');
  }
  return ctx;
}
