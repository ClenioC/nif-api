const MAX_NIF_LENGTH = 14;

/** Mesma normalização que a API aplica antes de consultar. */
export function normalizeNif(value: string): string {
  return value.trim().toUpperCase();
}

/**
 * Validação propositadamente permissiva: rejeita só o que nunca pode ser um NIF, para
 * não recusar um NIF válido. Formatos já vistos: 10 dígitos e 14 caracteres (BI).
 */
export function validateNif(nif: string): string | null {
  if (!nif) return "Introduza um NIF.";
  if (!/^[A-Z0-9]+$/.test(nif)) return "O NIF só pode conter letras e números.";
  if (nif.length > MAX_NIF_LENGTH) return `O NIF não pode ter mais de ${MAX_NIF_LENGTH} caracteres.`;
  return null;
}
