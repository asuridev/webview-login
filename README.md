# webview-login

App Angular independiente que implementa el **login externo** del Back Office
(feature `008-login-externo-transferencia-sesion` de la transversal,
`C:\sofka\bnp\transversal`). Vive en un dominio distinto al de la transversal y
se autentica contra un **segundo cliente OIDC** (`webview-login`) del mismo
reino `backoffice`.

**Contrato de consumo a implementar aquí**:
[`specs/008-login-externo-transferencia-sesion/contracts/webview-login-consumption.contract.md`](../transversal/specs/008-login-externo-transferencia-sesion/contracts/webview-login-consumption.contract.md)
en el repo `transversal` — define: login OIDC contra el cliente `webview-login`,
derivación del partner desde el propio token (claim `partner`, cardinalidad
exactamente-uno), consumo de `GET https://<transversal>/api/theme/:slug` (CORS)
para themear la página modular de cards, cada card → `GET
https://<transversal>/api/auth/login?module=<moduleId>`, y ser el
`post_logout_redirect_uri` del logout de la transversal. Ver también
`specs/008-login-externo-transferencia-sesion/{research.md,data-model.md,quickstart.md}`
en `transversal` para el diseño completo (D1–D6) y los escenarios E2E.

---

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.31.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
