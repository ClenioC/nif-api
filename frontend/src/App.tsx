import { useState } from "react";
import { ErrorAlert } from "./components/ErrorAlert";
import { Header } from "./components/Header";
import { HistoryList } from "./components/HistoryList";
import { LoadingCard } from "./components/LoadingCard";
import { QueryForm } from "./components/QueryForm";
import { ResultCard } from "./components/ResultCard";
import { API_BASE_URL } from "./config/api";
import { useApiStatus } from "./hooks/useApiStatus";
import { useNifQuery } from "./hooks/useNifQuery";

export function App() {
  const [nifInput, setNifInput] = useState("");
  const { status, refresh } = useApiStatus();
  const { state, history, runQuery } = useNifQuery(refresh);
  const loading = state.phase === "loading";

  function handleRepeat(nif: string) {
    setNifInput(nif);
    void runQuery(nif);
  }

  return (
    <div className="page">
      <Header status={status} apiBaseUrl={API_BASE_URL} />

      <main className="layout">
        <div className="layout__main">
          <QueryForm
            value={nifInput}
            loading={loading}
            onChange={setNifInput}
            onSubmit={(nif) => void runQuery(nif)}
          />
          {state.phase === "loading" && <LoadingCard nif={state.nif} />}
          {state.phase === "success" && <ResultCard result={state.result} />}
          {state.phase === "error" && <ErrorAlert nif={state.nif} error={state.error} />}
        </div>

        <aside className="layout__side">
          <HistoryList entries={history} disabled={loading} onRepeat={handleRepeat} />
        </aside>
      </main>
    </div>
  );
}
