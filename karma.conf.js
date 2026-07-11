// Karma config para ejecutar los tests con un navegador Chromium ya instalado
// en el sistema (Microsoft Edge o Google Chrome), sin depender de que haya
// Google Chrome ni de descargar un binario extra.
//
// Muchas estaciones corporativas no tienen Chrome pero sí Microsoft Edge, que
// es Chromium y acepta las mismas flags headless. Karma lo lanza igual que
// Chrome apuntando `CHROME_BIN` a `msedge.exe`.
const fs = require('fs');

// Resuelve el ejecutable del navegador. Orden de preferencia:
//   1. CHROME_BIN explícito (permite forzar cualquier binario en CI/otros SO).
//   2. Microsoft Edge (Chromium) — presente por defecto en Windows 10/11.
//   3. Google Chrome — por si está disponible.
function resolveChromiumBinary() {
  if (process.env.CHROME_BIN && fs.existsSync(process.env.CHROME_BIN)) {
    return process.env.CHROME_BIN;
  }

  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];

  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    throw new Error(
      'No se encontró Microsoft Edge ni Google Chrome. ' +
        'Define la variable de entorno CHROME_BIN con la ruta al ejecutable del navegador.'
    );
  }
  return found;
}

module.exports = function (config) {
  process.env.CHROME_BIN = resolveChromiumBinary();

  config.set({
    frameworks: ['jasmine'],
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      // Chromium headless endurecido para entornos restringidos/CI.
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    },
    restartOnFileChange: true,
  });
};
