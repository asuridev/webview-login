import { environment } from '../../../../environments/environment';

/**
 * Resuelve una URL de asset del theme (`GET /api/theme/:slug`) a una URL absoluta.
 * Transversal devuelve los binarios de marca como rutas relativas (`/assets/:key`)
 * servidas desde su propio dominio; hay que anteponerles `transversalBaseUrl` o el
 * navegador las resolvería contra el dominio de webview-login y la imagen saldría rota.
 * Las URLs ya absolutas (`http(s)://…`, `data:`) y las vacías se devuelven tal cual.
 */
export function resolveAssetUrl(url: string | undefined): string {
  if (!url) return '';
  if (/^(https?:|data:)/i.test(url)) return url;
  return `${environment.transversalBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}
