import type { QueryError, QueryErrorKind } from "../models/nif";

export const ERROR_TITLE: Record<QueryErrorKind, string> = {
  bad_request: "Pedido inválido",
  not_found: "NIF inválido ou não encontrado",
  portal_failure: "Falha na consulta ao Portal da AGT",
  rate_limited: "Limite de pedidos excedido",
  cors_blocked: "Pedido bloqueado por CORS",
  api_unavailable: "API indisponível",
  timeout: "A consulta demorou demasiado",
  communication: "Erro de comunicação",
};

function errorMessage(kind: QueryErrorKind): string {
  switch (kind) {
    case "bad_request":
      return "A API recusou o pedido. Confirme o NIF introduzido.";
    case "not_found":
      return "O portal não devolveu dados para este NIF. Confirme o número. Se tiver a certeza de que está correcto, tente mais tarde, porque um portal lento produz o mesmo resultado.";
    case "portal_failure":
      return "A API não conseguiu concluir a consulta ao portal após 3 tentativas. O portal pode estar indisponível. Tente novamente mais tarde.";
    case "rate_limited":
      return "A API aceita 30 pedidos por IP em cada 15 minutos. Aguarde alguns minutos antes de tentar novamente.";
    case "cors_blocked":
      return `A API está a responder, mas não aceita pedidos desta origem (${window.location.origin}). Acrescente-a à variável CORS_ORIGINS da API e reinicie a API.`;
    case "api_unavailable":
      return "Não foi possível contactar a API. Confirme que está em execução e que o endereço configurado está correcto.";
    case "timeout":
      return "A API não respondeu dentro do tempo limite de 5 minutos. Tente novamente.";
    case "communication":
      return "Ocorreu um erro inesperado na comunicação com a API. Tente novamente.";
  }
}

export function ErrorAlert({ nif, error }: { nif: string; error: QueryError }) {
  return (
    <section className="card alert" role="alert" data-testid="error" data-kind={error.kind}>
      <h2 className="alert__title">{ERROR_TITLE[error.kind]}</h2>
      <p className="alert__message">{errorMessage(error.kind)}</p>
      <p className="alert__nif">NIF consultado: {nif}</p>
      {error.detail && (
        <details className="alert__details">
          <summary>Detalhe técnico</summary>
          <code>{error.detail}</code>
        </details>
      )}
    </section>
  );
}
