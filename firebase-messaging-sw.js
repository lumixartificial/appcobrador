const SW_VERSION = "v5.2-final"; // Versión actualizada

// Importa los scripts de Firebase.
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

// Configuración de Firebase.
const firebaseConfig = {
    apiKey: "AIzaSyBRxJjpH6PBi-GRxOXS8klv-8v91sO4X-Y",
    authDomain: "lumix-financas-app.firebaseapp.com",
    projectId: "lumix-financas-app",
    storageBucket: "lumix-financas-app.appspot.com",
    messagingSenderId: "463777495321",
    appId: "1:463777495321:web:106118f56abd206ed88"
};

// Inicializa Firebase.
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log(`[SW-COBRADOR] Service Worker ${SW_VERSION} cargado y listo.`);

messaging.onBackgroundMessage((payload) => {
  const LOG_PREFIX = `[SW-COBRADOR-DIAGNOSTICO ${SW_VERSION}]`;
  console.log(`${LOG_PREFIX} >>> MENSAJE EN SEGUNDO PLANO RECIBIDO <<<`, payload);

  try {
    if (!payload.data) {
      console.error(`${LOG_PREFIX} ERROR: El payload no contiene la sección 'data'.`);
      return;
    }
    console.log(`${LOG_PREFIX} Payload 'data' validado.`, payload.data);

    const notificationTitle = payload.data.title;
    const notificationOptions = {
      body: payload.data.body,
      icon: payload.data.icon,
      tag: 'lumix-cobrador-notification', 
      data: { url: payload.data.url }
    };
    console.log(`${LOG_PREFIX} Opciones de notificación preparadas:`, notificationOptions);

    console.log(`${LOG_PREFIX} Intentando mostrar la notificación...`);
    return self.registration.showNotification(notificationTitle, notificationOptions)
      .then(() => {
        console.log(`${LOG_PREFIX} ¡ÉXITO! Notificación mostrada.`);
      })
      .catch(err => {
        console.error(`${LOG_PREFIX} ERROR al mostrar notificación:`, err);
      });

  } catch (error) {
    console.error(`${LOG_PREFIX} ERROR CATASTRÓFICO en onBackgroundMessage:`, error);
  }
});

self.addEventListener('install', (event) => {
  console.log(`[SW-COBRADOR ${SW_VERSION}] Instalando y forzando espera de activación.`);
  // [CORRECCIÓN]: Eliminamos self.skipWaiting() aquí. Dejamos que el navegador lo gestione.
  // Esto previene un bucle de recarga en algunos casos.
});

self.addEventListener('activate', (event) => {
  console.log(`[SW-COBRADOR ${SW_VERSION}] Activado y tomando control.`);
  // [CORRECCIÓN]: Se mantiene clients.claim() para tomar control de páginas existentes.
  // Pero la combinación con skipWaiting() debe manejarse con cuidado en el frontend.
  event.waitUntil(self.clients.claim());
});

// [SOLUCIÓN FINAL] Lógica de clic de notificación mejorada y robusta.
self.addEventListener('notificationclick', (event) => {
    const targetUrl = event.notification.data.url || self.location.origin;
    console.log(`[SW-COBRADOR] Clic en notificación. URL de destino: ${targetUrl}`);
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                let clientToFocus = null;

                // 1. Busca una ventana que ya esté abierta en la URL de destino y enfócala.
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    if (client.url === targetUrl && 'focus' in client) {
                        clientToFocus = client;
                        break;
                    }
                }

                if (clientToFocus) {
                    console.log('[SW-COBRADOR] Ventana en URL de destino encontrada y enfocada.');
                    return clientToFocus.focus();
                }

                // 2. Si no encontró una ventana en la URL exacta, busca cualquier ventana de la misma app
                //    que el Service Worker esté controlando (o pueda controlar).
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    // Si el cliente ya está bajo el control de este SW, intentamos navegarlo.
                    if (client.url.startsWith(self.location.origin) && 'focus' in client) {
                        console.log('[SW-COBRADOR] Ventana de la misma app encontrada. Navegando y enfocando.');
                        return client.navigate(targetUrl).then(c => c.focus());
                    }
                }

                // 3. Si no hay ninguna ventana existente que pueda ser reutilizada/enfocada, abre una nueva.
                console.log('[SW-COBRADOR] No hay ventanas existentes para reutilizar. Abriendo una nueva.');
                if (clients.openWindow) {
                    return clients.openWindow(targetUrl);
                } else {
                    console.error('[SW-COBRADOR] clients.openWindow no soportado. No se puede abrir nueva ventana.');
                    return null; // No se puede hacer nada más
                }
            })
            // [CORRECCIÓN]: Capturar el error TypeError específico.
            .catch(error => {
                if (error instanceof TypeError && error.message.includes("is not the client's active service worker")) {
                    console.warn(`[SW-COBRADOR] Reintento de apertura por error de Service Worker inactivo. Abriendo nueva ventana.`);
                    return clients.openWindow(targetUrl); // Forzar apertura de nueva ventana si hay este error.
                }
                console.error('[SW-COBRADOR] Error en notificationclick:', error);
                // Si clients.openWindow está disponible y no se ha usado ya, inténtalo como fallback.
                if (clients.openWindow) {
                    return clients.openWindow(targetUrl);
                }
            })
    );
});
