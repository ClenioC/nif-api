import { API_BASE_URL, HEALTH_TIMEOUT_MS, QUERY_TIMEOUT_MS } from "../config/api";
import type { ApiStatus, NifData, NifQueryResult, QueryError } from "../models/nif";

export class NifApiError extends Error implements QueryError {
  readonly kind: QueryError["kind"];
  readonly detail?: string;

  constructor(kind: QueryError["kind"], detail?: string) {
    super(detail ?? kind);
    this.name = "NifApiError";
    this.kind = kind;
    this.detail = detail;
  }
}

/**
 * O browser esconde a causa de um pedido bloqueado: CORS e servidor desligado dão o
 * mesmo TypeError. Um pedido `no-cors` não permite ler a resposta, mas só falha se o
 * servidor estiver inacessível, e é isso que distingue os dois casos.
 */
export async function checkHealth(): Promise<Exclude<ApiStatus, "checking">> {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      cache: "no-store",
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    if (!response.ok) return "offline";
    const body: unknown = await response.json();
    return isRecord(body) && body.status === "online" ? "online" : "offline";
  } catch {
    // Continua abaixo: falta saber se o servidor é alcançável
  }

  try {
    await fetch(`${API_BASE_URL}/`, {
      mode: "no-cors",
      cache: "no-store",
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    return "cors_blocked";
  } catch {
    return "offline";
  }
}

export async function queryNif(nif: string): Promise<NifQueryResult> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nif }),
      signal: AbortSignal.timeout(QUERY_TIMEOUT_MS),
    });
  } catch (error) {
    throw await classifyNetworkError(error);
  }

  // Alguns erros do Express vêm em HTML, por isso o corpo pode não ser JSON
  const body: unknown = await response.json().catch(() => null);

  if (response.ok) {
    if (isRecord(body) && body.success === true && isNifData(body.data)) {
      return { data: body.data, cached: body.cached === true };
    }
    throw new NifApiError("communication", "A API devolveu uma resposta num formato inesperado.");
  }

  throw classifyHttpError(response.status, body);
}

async function classifyNetworkError(error: unknown): Promise<NifApiError> {
  if (error instanceof DOMException && error.name === "TimeoutError") {
    return new NifApiError("timeout");
  }

  const detail = error instanceof Error ? error.message : String(error);
  const health = await checkHealth();
  if (health === "cors_blocked") return new NifApiError("cors_blocked", detail);
  if (health === "offline") return new NifApiError("api_unavailable", detail);
  return new NifApiError("communication", detail);
}

function classifyHttpError(status: number, body: unknown): NifApiError {
  const message = isRecord(body) && typeof body.message === "string" ? body.message : undefined;
  const portalError = isRecord(body) && typeof body.error === "string" ? body.error : undefined;

  switch (status) {
    case 400:
      return new NifApiError("bad_request", message);
    case 404:
      return classifyPortalError(portalError ?? message);
    case 429:
      return new NifApiError("rate_limited", message);
    default:
      return new NifApiError("communication", message ?? `HTTP ${status}`);
  }
}

/**
 * A API usa 404 tanto para NIF sem resultado como para falhas no portal. O portal não
 * mostra aviso para um NIF sem resultado: a página fica sem o painel e a API esgota o
 * tempo de espera. Só por este texto se distinguem os casos, e não com total certeza.
 */
function classifyPortalError(detail: string | undefined): NifApiError {
  const noResult =
    detail !== undefined &&
    (detail.includes("div.panel-default-header") ||
      detail.includes("NIF not found or incomplete data"));
  return new NifApiError(noResult ? "not_found" : "portal_failure", detail);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNifData(value: unknown): value is NifData {
  return (
    isRecord(value) &&
    (["nif", "name", "type", "status", "vatRegime", "taxResidence"] as const).every(
      (field) => typeof value[field] === "string"
    )
  );
}
