import { useCallback, useEffect, useRef, useState } from "react";
import { HISTORY_MAX_ENTRIES } from "../config/api";
import type { HistoryEntry, NifQueryResult, QueryError } from "../models/nif";
import { loadHistory, saveHistory } from "../services/historyStorage";
import { NifApiError, queryNif } from "../services/nifApi";

export type QueryState =
  | { phase: "idle" }
  | { phase: "loading"; nif: string }
  | { phase: "success"; nif: string; result: NifQueryResult }
  | { phase: "error"; nif: string; error: QueryError };

export function useNifQuery(onSettled?: () => void) {
  const [state, setState] = useState<QueryState>({ phase: "idle" });
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const inFlight = useRef(false);

  useEffect(() => saveHistory(history), [history]);

  const addToHistory = useCallback((entry: Omit<HistoryEntry, "id" | "queriedAt">) => {
    const newEntry = { ...entry, id: crypto.randomUUID(), queriedAt: new Date().toISOString() };
    setHistory((entries) => [newEntry, ...entries].slice(0, HISTORY_MAX_ENTRIES));
  }, []);

  const runQuery = useCallback(
    async (nif: string) => {
      // Cada consulta abre um Chromium na API: nunca enviar duas ao mesmo tempo
      if (inFlight.current) return;
      inFlight.current = true;
      setState({ phase: "loading", nif });

      try {
        const result = await queryNif(nif);
        setState({ phase: "success", nif, result });
        addToHistory({ nif, name: result.data.name, status: result.data.status });
      } catch (caught) {
        const error =
          caught instanceof NifApiError
            ? { kind: caught.kind, detail: caught.detail }
            : { kind: "communication" as const, detail: String(caught) };
        setState({ phase: "error", nif, error });
        addToHistory({ nif, errorKind: error.kind });
      } finally {
        inFlight.current = false;
        onSettled?.();
      }
    },
    [addToHistory, onSettled]
  );

  return { state, history, runQuery };
}
