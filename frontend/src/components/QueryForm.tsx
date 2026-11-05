import { useState, type FormEvent } from "react";
import { normalizeNif, validateNif } from "../utils/nif";

interface QueryFormProps {
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSubmit: (nif: string) => void;
}

export function QueryForm({ value, loading, onChange, onSubmit }: QueryFormProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nif = normalizeNif(value);
    const error = validateNif(nif);
    setValidationError(error);
    if (!error) onSubmit(nif);
  }

  return (
    <form className="card query-form" onSubmit={handleSubmit} noValidate>
      <label className="query-form__label" htmlFor="nif">
        NIF
      </label>
      <div className="query-form__row">
        <input
          id="nif"
          className="query-form__input"
          type="text"
          value={value}
          placeholder="Ex.: 5000470287"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={validationError !== null}
          aria-describedby={validationError ? "nif-error" : undefined}
          onChange={(event) => {
            onChange(event.target.value);
            setValidationError(null);
          }}
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? "A consultar…" : "Consultar"}
        </button>
      </div>
      {validationError && (
        <p id="nif-error" className="query-form__error" role="alert">
          {validationError}
        </p>
      )}
    </form>
  );
}
