import type { HistoryEntry } from "../models/nif";

const STORAGE_KEY = "nif-api:history";

export function loadHistory(): HistoryEntry[] {
  try {
    const stored: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(stored) ? (stored as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Sem sessionStorage, o histórico mantém-se até recarregar a página
  }
}
