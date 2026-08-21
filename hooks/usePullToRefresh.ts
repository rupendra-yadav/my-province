// hooks/usePullToRefresh.ts
// Wraps a context's refresh() in a local `isRefreshing` flag so pull-to-
// refresh only drives the native RefreshControl spinner — never the
// context's `isLoading` (which also covers first mount / manual retry and
// would otherwise cause the screen's full-page loading state to flash
// underneath the native spinner while pulling).

import { useCallback, useState } from 'react';

export function usePullToRefresh(refresh: () => void | Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  return { isRefreshing, onRefresh };
}