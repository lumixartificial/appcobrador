// firebase-messaging-sw.js

// Version: 1.8 (Incrementa este número para forzar actualizaciones)

// Importa los scripts de Firebase

// Importamos los scripts de Firebase necesarios

importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

// Copia tu configuración de Firebase aquí
const firebaseConfig = {
    apiKey: "AIzaSyBRxJjpH6PBi-GRxOXS8klv-8v91sO4X-Y",
    authDomain: "lumix-financas-app.firebaseapp.com",
    projectId: "lumix-financas-app",
    storageBucket: "lumix-financas-app.appspot.com",
    messagingSenderId: "463777495321",
    appId: "1:463777495321:web:106118f53f56abd206ed88"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

const SW_VERSION = "v2.1-hybrid-fix";
console.log(`Service Worker ${SW_VERSION} cargado.`);

self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] Instalando...`);
  // Forza al nuevo service worker a activarse inmediatamente.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] Activado y tomando control.`);
  // Toma el control de todas las pestañas abiertas de la app.
  event.waitUntil(self.clients.claim());
});

// NO HAY 'onBackgroundMessage'. Esto es crucial para evitar notificaciones duplicadas.
// El navegador mostrará la parte 'notification' del payload híbrido automáticamente.

// Este manejador SÓLO se ejecuta cuando el usuario hace clic en la notificación.
self.addEventListener('notificationclick', (event) => {
    console.log(`[SW ${SW_VERSION}] Evento 'notificationclick' DETECTADO.`);
    event.notification.close();

    // La URL viene del campo 'data' de nuestro payload híbrido.
    const targetUrl = event.notification.data.url;
    
    if (!targetUrl) {
        console.error(`[SW ${SW_VERSION}] No se encontró URL en los datos de la notificación. Abriendo página principal.`);
        return event.waitUntil(clients.openWindow(self.location.origin));
    }

    // Lógica robusta para encontrar una pestaña existente o abrir una nueva.
    const promiseChain = clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then((windowClients) => {
        // Revisa si hay una ventana de la app ya abierta.
        for (const client of windowClients) {
            // Compara el origen para asegurarse de que es la misma PWA.
            if (new URL(client.url).origin === new URL(targetUrl).origin && 'focus' in client) {
                console.log(`[SW ${SW_VERSION}] Ventana encontrada. Navegando y enfocando: ${targetUrl}`);
                // Si la encuentra, la trae al frente y navega a la URL correcta.
                return client.navigate(targetUrl).then(c => c.focus());
            }
        }
        // Si no hay ninguna ventana abierta, abre una nueva.
        if (clients.openWindow) {
            console.log(`[SW ${SW_VERSION}] Abriendo nueva ventana en: ${targetUrl}`);
            return clients.openWindow(targetUrl);
        }
    });

    event.waitUntil(promiseChain);
});

