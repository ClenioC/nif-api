import type { ApiStatus } from "../models/nif";

const STATUS_LABEL: Record<ApiStatus, string> = {
  checking: "A verificar…",
  online: "Online",
  cors_blocked: "Online · CORS bloqueado",
  offline: "Offline",
};

const STATUS_TITLE: Record<ApiStatus, string> = {
  checking: "A verificar a disponibilidade da API",
  online: "A API está a responder. Isto não indica o estado do Portal da AGT.",
  cors_blocked: "A API está a responder, mas não aceita pedidos desta origem.",
  offline: "A API não está a responder.",
};

interface HeaderProps {
  status: ApiStatus;
  apiBaseUrl: string;
}

export function Header({ status, apiBaseUrl }: HeaderProps) {
  return (
    <header className="header">
      <div>
        <h1 className="header__title">Angola NIF API</h1>
        <p className="header__description">
          Consulta de dados fiscais através do Portal do Contribuinte da AGT.
        </p>
      </div>
      <div className="header__status">
        <span
          className={`status status--${status}`}
          role="status"
          title={STATUS_TITLE[status]}
          data-testid="api-status"
        >
          <span className="status__dot" aria-hidden="true" />
          API: {STATUS_LABEL[status]}
        </span>
        <code className="header__url">{apiBaseUrl}</code>
      </div>
    </header>
  );
}
