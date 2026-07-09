/** Roles que clasifican a un usuario como "administrador" — mismo criterio que `resolveModuleRoute` en transversal (module-catalog.ts). */
const ADMIN_ROLES: readonly string[] = ['platform-admin', 'partner-editor', 'auditor'];

export interface AuthClaims {
  readonly subject: string;
  readonly roles: readonly string[];
  readonly partnerSlug: string | undefined;
  readonly isAdmin: boolean;
}

export function deriveIsAdmin(roles: readonly string[]): boolean {
  return roles.some((role) => ADMIN_ROLES.includes(role));
}

function derivePartnerSlug(rawPartner: unknown): string | undefined {
  if (typeof rawPartner === 'string') {
    return rawPartner.length > 0 ? rawPartner : undefined;
  }
  if (Array.isArray(rawPartner)) {
    const values = rawPartner.filter((value): value is string => typeof value === 'string' && value.length > 0);
    return values.length === 1 ? values[0] : undefined;
  }
  return undefined;
}

interface IdTokenPayload {
  readonly sub: string;
  readonly realm_access?: { readonly roles?: readonly string[] };
  readonly partner?: unknown;
}

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return atob(padded);
}

/** Decodifica el `id_token` (sin verificar firma — solo lectura de UI, research.md R3) a `AuthClaims`. */
export function decodeAuthClaims(idToken: string): AuthClaims {
  const [, payloadSegment] = idToken.split('.');
  if (!payloadSegment) {
    throw new Error('id_token inválido: falta el segmento de payload');
  }
  const payload = JSON.parse(decodeBase64Url(payloadSegment)) as IdTokenPayload;
  const roles = payload.realm_access?.roles ?? [];

  return {
    subject: payload.sub,
    roles,
    partnerSlug: derivePartnerSlug(payload.partner),
    isAdmin: deriveIsAdmin(roles),
  };
}
