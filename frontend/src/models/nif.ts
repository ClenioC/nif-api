/** Dados devolvidos pela API em `data` (POST /query). */
export interface NifData {
  nif: string;
  name: string;
  type: string;
  status: string;
  vatRegime: string;
  taxResidence: string;
}

export interface NifQueryResult {
  data: NifData;
  cached: boolean;
}

export type QueryErrorKind =
  | "bad_request"
  | "not_found"
  | "portal_failure"
  | "rate_limited"
  | "cors_blocked"
  | "api_unavailable"
  | "timeout"
  | "communication";

export interface QueryError {
  kind: QueryErrorKind;
  /** Texto devolvido pela API ou pelo browser, sem tradução. */
  detail?: string;
}

/**
 * online: a API responde e aceita a origem do frontend.
 * cors_blocked: a API responde, mas recusa a origem do frontend.
 * Nenhum dos estados diz respeito ao Portal da AGT.
 */
export type ApiStatus = "checking" | "online" | "cors_blocked" | "offline";

export interface HistoryEntry {
  id: string;
  nif: string;
  /** ISO 8601 */
  queriedAt: string;
  name?: string;
  status?: string;
  errorKind?: QueryErrorKind;
}
