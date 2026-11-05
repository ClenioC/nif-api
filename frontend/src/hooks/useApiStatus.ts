import { useCallback, useEffect, useState } from "react";
import { HEALTH_POLL_INTERVAL_MS } from "../config/api";
import type { ApiStatus } from "../models/nif";
import { checkHealth } from "../services/nifApi";

export function useApiStatus() {
  const [status, setStatus] = useState<ApiStatus>("checking");

  const refresh = useCallback(async () => {
    setStatus(await checkHealth());
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), HEALTH_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  return { status, refresh };
}
