const DEFAULT_API_BASE_URL = "http://localhost:3000";

/** Único local onde a URL base da API é definida. Configurável em VITE_API_BASE_URL. */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

/**
 * No pior caso, a API faz 3 tentativas de cerca de 95 s cada (carregar o portal,
 * esperar pelo formulário e esperar pelo resultado), com 2 s entre tentativas.
 */
export const QUERY_TIMEOUT_MS = 5 * 60 * 1000;

export const HEALTH_TIMEOUT_MS = 10 * 1000;
export const HEALTH_POLL_INTERVAL_MS = 30 * 1000;

export const HISTORY_MAX_ENTRIES = 20;
