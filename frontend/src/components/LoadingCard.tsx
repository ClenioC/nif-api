import { useEffect, useState } from "react";

export function LoadingCard({ nif }: { nif: string }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const interval = setInterval(
      () => setSeconds(Math.floor((Date.now() - startedAt) / 1000)),
      1000
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="card loading" aria-busy="true" data-testid="loading">
      <span className="spinner" aria-hidden="true" />
      <div>
        <p className="loading__title" role="status">
          A consultar o NIF {nif}…
        </p>
        <p className="loading__hint">
          {seconds} s decorridos. Um NIF sem resultado pode demorar cerca de 1 minuto, porque a
          API tenta 3 vezes.
        </p>
      </div>
    </section>
  );
}
