const STORAGE_KEY = 'webview-login.pkce-transaction';

export interface PkceTransaction {
  readonly codeVerifier: string;
  readonly state: string;
  readonly nonce: string;
}

export function savePkceTransaction(transaction: PkceTransaction): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(transaction));
}

export function readPkceTransaction(): PkceTransaction | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as PkceTransaction;
  } catch {
    return null;
  }
}

export function clearPkceTransaction(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}
