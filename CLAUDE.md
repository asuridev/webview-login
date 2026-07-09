# webview-login — Rol y funciones dentro del sistema Back Office

> Este documento explica **qué es este proyecto, por qué existe y qué debe
> hacer** dentro del sistema. Para convenciones de código (stack, patrones
> Angular, arquitectura de carpetas) ver los documentos en `.claude/`
> (§8). La **fuente autoritativa** del contrato entre este repo y `transversal`
> son las specs en `../transversal/specs/008-...` y `009-...` (§9).

---

## 1. Qué es este proyecto (rol en el sistema)

`webview-login` es una **SPA Angular 20.3 pura** (cliente de navegador; **sin
backend propio, sin SSR**), servida como estáticos/CDN en su **propio dominio**,
separado del de `transversal`.

Es el **único punto de entrada de login al Back Office**: todos los usuarios
(administradores y asesores) se autentican aquí. **No existe superficie de login
dentro de `transversal`** — cuando `transversal` detecta que no hay sesión,
redirige el navegador a este proyecto.

Técnicamente es un **cliente OIDC público (Authorization Code + PKCE, sin
secreto)**: el segundo cliente SSO `webview-login` del reino `backoffice`.

**Repo hermano (backend):** `transversal` — Angular SSR + Express BFF — en
`../transversal`. Es quien posee la sesión real, la lógica de autorización y los
temas de los partners.

## 2. Responsabilidad y límites

Este proyecto **solo decide qué pantalla mostrar** tras autenticar. Todo lo
demás es responsabilidad del servidor (`transversal`):

- La autorización real (validar partner activo, resolver el módulo/destino,
  crear la sesión `bo_session`) ocurre **server-side en `transversal`**.
- El `id_token` se decodifica **sin verificar la firma** — lectura de claims en
  cliente, únicamente para elegir pantalla. No es una decisión de seguridad.
- **Nunca reenvía los tokens del IdP a `transversal`.** Tras el login, hace un
  redirect de documento completo a `transversal`, que **reconstruye su propia
  sesión mediante OIDC silencioso** (ver §3 y §5).

Invariante: si dudas entre "validarlo aquí" y "dejar que lo valide transversal",
lo valida transversal. Este repo es deliberadamente delgado.

## 3. Flujo OIDC que implementa (en el navegador)

- **Authorization Code + PKCE (S256)** ejecutado **enteramente en el navegador**,
  con primitivas nativas: `crypto.subtle` para `code_verifier`/`code_challenge`
  y `HttpClient` para el intercambio de código. **Sin librería OIDC de terceros**
  (`oidc-client-ts`, `angular-oauth2-oidc`, etc. están descartadas por diseño).
- **No forzar `prompt=login`** en la URL de autorización. Omitirlo permite que
  una sesión de reino existente devuelva el `code` sin volver a pedir
  credenciales (**SSO silencioso**).
- Los **claims viven solo en memoria** (una signal en el session store), nunca
  en `localStorage` ni cookies. Solo los datos transitorios de la transacción
  (`code_verifier` / `state` / `nonce`, el `PkceTransaction`) pueden persistir en
  `sessionStorage` para sobrevivir la recarga del callback, y se **borran tras un
  único uso**.
- Tras el callback y decidida la pantalla/destino, se hace un **redirect de
  documento completo** (`window.location.href`) hacia `transversal`; la SPA se
  descarta. Ambos clientes SSO comparten la sesión de identidad del reino, así
  que la autorización de `transversal` completa **en silencio, sin prompt**.

## 4. Los dos roles y sus flujos divergentes

Esta es la **regla de comportamiento central** del proyecto. La clasificación de
rol es **client-side y solo para elegir pantalla**:

- `isAdmin` = los `roles` (de `realm_access.roles`) intersectan
  `{ platform-admin, partner-editor, auditor }`.
- **asesor** = no es admin y su claim `partner` resuelve a **exactamente un**
  partner (`0` o `>1` ⇒ no es asesor válido).

| Estado | Comportamiento |
|---|---|
| `/` + anónimo | Dispara el redirect Code+PKCE al IdP (reino `backoffice`, cliente `webview-login`). **No renderiza contenido.** |
| Autenticado + `isAdmin === true` | **Redirect de documento completo** a `GET https://<transversal>/api/auth/login?module=admin`. **NO ve la página de cards.** *(Decisión de la spec 009 que actualiza la 008.)* |
| Autenticado + asesor (`isAdmin === false` + `partnerSlug` presente) | **Muestra la página de cards modulares** (diseño Figma), themeada por su partner. Clic en cualquier card → redirect completo a `.../api/auth/login?module=<...>`, que resuelve server-side al shell del asesor `/:partnerSlug`. |
| Autenticado + asesor **sin** `partnerSlug` | Estado de **acceso denegado**; no cards, no se crea sesión. |

Notas:
- El destino del admin es **siempre** la página de admin de transversal; el
  administrador ya **no** pasa por la página de cards.
- Un fallo al obtener el tema **no** bloquea el acceso: las cards siguen usables
  con el tema neutro.

## 5. Contrato de API con `transversal`

Todos los endpoints los expone `transversal`. Este repo solo los **consume**.

| Endpoint | Uso desde webview-login |
|---|---|
| `GET /api/theme/:slug` | Tema público del partner, **con CORS** (el servidor hace *echo* del `Origin` exacto, nunca `*`, y **sin** `Access-Control-Allow-Credentials` — el tema es público). Consumir vía **TanStack Query**, key `['theme', slug, version]`. Cacheable (`ETag`/`If-None-Match`, `max-age`). Fallback neutro `__default__` cuando no aplica. |
| `GET /api/auth/login?module=<moduleId>` | Punto de entrada al backend tras el login. Enviar **solo el `moduleId`, nunca una ruta interna** — el servidor resuelve el destino (`resolveModuleRoute`) y crea la sesión. |
| `POST /api/auth/logout` | Logout único de reino (RP-initiated). El `post_logout_redirect_uri` **devuelve al usuario a webview-login**, que debe ofrecer re-login. |

**Transferencia de sesión:** no hay cookies compartidas entre dominios
(`bo_session` es `SameSite=Strict` y no cruza dominios). El handoff funciona
porque **ambos clientes SSO comparten la sesión de identidad del reino**:
autenticarse aquí la establece, y la autorización posterior de `transversal`
completa sin prompt. El partner se sella server-side desde el claim, **nunca**
desde datos que envíe el cliente.

## 6. Theming por partner

`transversal` es la **única fuente autoritativa de temas**; este repo **no debe
mantener una definición de tema duplicada**.

- Deriva `partnerSlug` de su propio token (claim `partner`, semántica
  *exactamente-uno*), hace `GET /api/theme/:slug` y aplica las variables
  `--brand-*`, reutilizando el vocabulario de `theme-css-vars.ts` / `styles.css`
  de `transversal`.
- **Fallback neutro** (`__default__`) cuando: es admin / no hay partner (`0` o
  `>1` claims), el partner está inactivo o sin tema publicado, o el tema no está
  disponible. **Nunca aplicar el tema de otro partner.**
- Diseño de la página de cards: Figma **"BO Experiencia Modular", node
  `12286-272780`**. El número y etiquetas de las cards vienen de Figma, no están
  fijados en las specs.

## 7. Configuración (valores de entorno — dev actuales)

> Estos son valores de **desarrollo**, no verdades fijas. Dependen del entorno;
> viven en `src/environments/environment*.ts`.

- **Reino:** `backoffice`. **Cliente:** `webview-login` (`publicClient`, PKCE
  `S256`, `redirectUris: http://localhost:4300/*`).
- **IdP issuer:** `http://localhost:8080/auth/realms/backoffice` (RH-SSO 7.6,
  bajo `/auth`). De ahí derivan los endpoints `.../protocol/openid-connect/auth`,
  `.../token`, `.../logout`.
- **Puertos dev:** webview-login **4300** (`npm start` → `ng serve --port 4300`),
  transversal **4000**, IdP **8080**.
- `src/environments/environment.ts` apunta a los endpoints authorize / token /
  end_session del reino, `oidcClientId: 'webview-login'`, y `transversalBaseUrl`
  (`http://localhost:4000`).
- Usuarios de prueba del reino (password = username): `admin-user`
  (platform-admin), `editor-user` (partner-editor), `auditor-user` (auditor),
  `norole-user` (sin roles), `asesor-a` (partner `banco-a`), `asesor-b`
  (`banco-b`), `asesor-inactivo` (`banco-inactivo`).

## 8. Convenciones de código → ver `.claude/`

Para el **cómo** (stack y patrones) sigue los documentos existentes en `.claude/`;
**no se repiten aquí**:

- `.claude/CLAUDE.md` — best practices TypeScript/Angular.
- `.claude/ARCHITECTURE.md` — estructura de carpetas, capa HTTP, routing,
  NgRx Signals vs TanStack Query, componentes.
- `.claude/CONSTITUTION.md` — reglas innegociables (prioridad
  `CONSTITUTION > ARCHITECTURE > CLAUDE`).
- `.claude/TOOLS.md` — herramientas CLI (Playwright, `ctx7`).

Resumen operativo: Angular 20.3 standalone-only, **zoneless**
(`provideZonelessChangeDetection`, sin `zone.js`/`NgZone`), signals + OnPush,
**NgRx Signals** para estado de sesión/UI síncrono y **TanStack Query** solo para
el fetch de tema, `inject()` para DI, guards funcionales, rutas lazy, **Tailwind
v4** como única solución de estilos, `HttpClient` (sin axios), **sin nueva
librería OIDC**.

## 9. Fuente autoritativa del contrato + gaps conocidos

**Contrato transversal↔webview-login (autoritativo):**
- `../transversal/specs/008-login-externo-transferencia-sesion/` — contrato
  técnico congelado (endpoints server-side, CORS, segundo cliente de reino,
  transferencia de sesión, logout único). `contracts/`:
  `webview-login-consumption`, `auth-login-module`, `theme-cors`,
  `realm-second-client`.
- `../transversal/specs/009-webview-login-experiencia-usuario/` — experiencia de
  usuario que este repo implementa sobre 008 (**override:** el admin ya no ve
  cards). `contracts/webview-login-routing.contract.md`, `research.md`,
  `data-model.md`, `quickstart.md`.

**Gaps / inconsistencias a tener presentes:**
- El `moduleId` para el clic de card del asesor (que debe resolver a
  `/:partnerSlug`) **aún no existe** en `MODULE_CATALOG` de `transversal`: solo
  está definido `admin` → `/admin`. Destino previsto pero `moduleId`/entrada de
  catálogo sin resolver en esta iteración.
- `package.json` y `angular.json` todavía llevan el nombre de proyecto por
  defecto `transversal` (no `webview-login`).
- El `README.md` menciona el puerto 4200, pero `npm start` sirve en **4300**.
