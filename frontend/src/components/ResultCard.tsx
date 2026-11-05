import type { NifQueryResult } from "../models/nif";

export function ResultCard({ result }: { result: NifQueryResult }) {
  const { data, cached } = result;
  const isActive = data.status.trim().toLowerCase() === "activo";

  return (
    <section className="card result" data-testid="result" aria-labelledby="result-title">
      <div className="result__header">
        <div>
          <h2 id="result-title" className="result__name" data-field="name">
            {data.name || "—"}
          </h2>
          <p className="result__nif">
            NIF <span data-field="nif">{data.nif || "—"}</span>
          </p>
        </div>
        <span
          className={`badge ${isActive ? "badge--success" : "badge--neutral"}`}
          data-field="status"
        >
          <span className="visually-hidden">Estado: </span>
          {data.status || "—"}
        </span>
      </div>

      <dl className="result__fields">
        <Field label="Tipo de contribuinte" field="type" value={data.type} />
        <Field label="Regime de IVA" field="vatRegime" value={data.vatRegime} />
        <Field label="Residência fiscal" field="taxResidence" value={data.taxResidence} />
        <Field
          label="Origem do resultado"
          field="source"
          value={cached ? "Cache da API (até 5 minutos)" : "Consulta nova ao Portal da AGT"}
        />
      </dl>
    </section>
  );
}

function Field({ label, field, value }: { label: string; field: string; value: string }) {
  return (
    <div className="result__field">
      <dt>{label}</dt>
      <dd data-field={field}>{value || "—"}</dd>
    </div>
  );
}
