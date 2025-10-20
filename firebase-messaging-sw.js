const SW_VERSION = "v5.0-correccion-appId"; // Versión actualizada para forzar la actualización

// Importa los scripts de Firebase. Esto debe hacerse primero.
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

// Configuración de Firebase.
const firebaseConfig = {
    apiKey: "AIzaSyBRxJjpH6PBi-GRxOXS8klv-8v91sO4X-Y",
    authDomain: "lumix-financas-app.firebaseapp.com",
    projectId: "lumix-financas-app",
    storageBucket: "lumix-financas-app.appspot.com",
    messagingSenderId: "463777495321",
    // [CORRECCIÓN CRÍTICA] Se ha corregido el appId. Ahora es idéntico al de la aplicación principal.
    appId: "1:463777495321:web:106118f53f56abd206ed88"
};

// Inicializa Firebase.
firebase.initializeApp(firebaseConfig);

// Obtén la instancia de Messaging DESPUÉS de inicializar Firebase.
const messaging = firebase.messaging();

console.log(`[SW-COBRADOR] Service Worker ${SW_VERSION} cargado y listo.`);

/**
 * [LÓGICA CLAVE PARA MOSTRAR NOTIFICACIONES]
 * Esto se ejecuta cuando llega un mensaje y la app está cerrada o en segundo plano.
 */
messaging.onBackgroundMessage((payload) => {
  const LOG_PREFIX = `[SW-COBRADOR-DIAGNOSTICO ${SW_VERSION}]`;
  console.log(`${LOG_PREFIX} >>> ¡MENSAJE EN SEGUNDO PLANO RECIBIDO! <<<`, payload);

  try {
    if (!payload.data) {
      console.error(`${LOG_PREFIX} ERROR FATAL: El payload no contiene la sección 'data'. No se puede mostrar la notificación.`);
      return;
    }
    console.log(`${LOG_PREFIX} Payload 'data' validado.`, payload.data);

    const notificationTitle = payload.data.title;
    const notificationOptions = {
      body: payload.data.body,
      icon: payload.data.icon,
      tag: 'lumix-cobrador-notification', 
      data: {
        url: payload.data.url 
      }
    };
    console.log(`${LOG_PREFIX} Opciones de notificación preparadas:`, notificationOptions);

    console.log(`${LOG_PREFIX} Intentando mostrar la notificación AHORA...`);
    // self.registration.showNotification devuelve una "Promise", la retornamos para que el SW sepa que debe esperar.
    return self.registration.showNotification(notificationTitle, notificationOptions)
      .then(() => {
        console.log(`${LOG_PREFIX} ¡ÉXITO! showNotification() se completó.`);
      })
      .catch(err => {
        console.error(`${LOG_PREFIX} ERROR DENTRO de showNotification():`, err);
      });

  } catch (error) {
    console.error(`${LOG_PREFIX} ERROR CATASTRÓFICO DENTRO DE onBackgroundMessage:`, error);
  }
});

self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] Instalando y forzando activación inmediata.`);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] Activado y tomando control.`);
  event.waitUntil(self.clients.claim());
});

/**
 * [LÓGICA PARA EL CLIC]
 * Esto se ejecuta cuando el usuario toca la notificación.
 */
self.addEventListener('notificationclick', (event) => {
    console.log(`[SW ${SW_VERSION}] El usuario hizo clic en la notificación.`);
    event.notification.close();

    const targetUrl = event.notification.data.url || self.location.origin;

    // Busca si la app ya está abierta para enfocarla, si no, abre una nueva ventana.
    const promiseChain = clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then((windowClients) => {
        for (const client of windowClients) {
            // Compara el origen para asegurarse de que es la misma app.
            if (new URL(client.url).origin === new URL(targetUrl).origin && 'focus' in client) {
                return client.navigate(targetUrl).then(c => c.focus());
            }
        }
        if (clients.openWindow) {
            return clients.openWindow(targetUrl);
        }
    });
    event.waitUntil(promiseChain);
});


