// firebase-messaging-sw.js

// Version: 1.8 (Incrementa este número para forzar actualizaciones)

// Importa los scripts de Firebase

// Importamos los scripts de Firebase necesarios

// VERSIÓN CORREGIDA Y DEFINITIVA
const SW_VERSION = "v3.0-final-fix";

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
    appId: "1:463777495321:web:106118f56abd206ed88"
};

// Inicializa Firebase.
firebase.initializeApp(firebaseConfig);

// Obtén la instancia de Messaging DESPUÉS de inicializar Firebase.
const messaging = firebase.messaging();

console.log(`Service Worker ${SW_VERSION} cargado y listo.`);

/**
 * [LÓGICA CLAVE PARA MOSTRAR NOTIFICACIONES]
 * Esto se ejecuta cuando llega un mensaje y la app está cerrada o en segundo plano.
 */
messaging.onBackgroundMessage((payload) => {
  console.log(`[SW ${SW_VERSION}] Mensaje en segundo plano recibido:`, payload);

  // Asegúrate de que los datos existen.
  if (!payload.data) {
    console.error(`[SW ${SW_VERSION}] El payload no contiene la sección 'data'.`);
    return;
  }

  // Extraemos los datos que enviamos desde la Cloud Function.
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon,
    // Agregamos un tag para evitar notificaciones duplicadas si llegan muy rápido.
    tag: 'lumix-cobrador-notification', 
    // Pasamos la URL al evento de clic.
    data: {
      url: payload.data.url 
    }
  };

  // Mostramos la notificación en el dispositivo.
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] Instalando...`);
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




