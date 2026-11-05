import type { HistoryEntry } from "../models/nif";
import { ERROR_TITLE } from "./ErrorAlert";

const dateFormat = new Intl.DateTimeFormat("pt-AO", { dateStyle: "short", timeStyle: "medium" });

interface HistoryListProps {
  entries: HistoryEntry[];
  disabled: boolean;
  onRepeat: (nif: string) => void;
}

export function HistoryList({ entries, disabled, onRepeat }: HistoryListProps) {
  return (
    <section className="card history" aria-labelledby="history-title" data-testid="history">
      <h2 id="history-title" className="history__title">
        Histórico da sessão
      </h2>

      {entries.length === 0 ? (
        <p className="history__empty">As consultas desta sessão aparecem aqui.</p>
      ) : (
        <ul className="history__list">
          {entries.map((entry) => (
            <li key={entry.id} className="history__item" data-testid="history-item">
              <div className="history__info">
                <p className="history__nif">{entry.nif}</p>
                {entry.errorKind ? (
                  <p className="history__failure">{ERROR_TITLE[entry.errorKind]}</p>
                ) : (
                  <p className="history__name">
                    {entry.name} · {entry.status}
                  </p>
                )}
                <time className="history__time" dateTime={entry.queriedAt}>
                  {dateFormat.format(new Date(entry.queriedAt))}
                </time>
              </div>
              <button
                className="button button--secondary"
                type="button"
                disabled={disabled}
                aria-label={`Repetir a consulta do NIF ${entry.nif}`}
                onClick={() => onRepeat(entry.nif)}
              >
                Repetir
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
