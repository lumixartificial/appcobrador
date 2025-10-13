// firebase-messaging-sw.js

// Version: 1.8 (Incrementa este número para forzar actualizaciones)

// Importa los scripts de Firebase

// Importamos los scripts de Firebase necesarios

importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

const firebaseConfig = {
    apiKey: "AIzaSyBRxJjpH6PBi-GRxOXS8klv-8v91sO4X-Y",
    authDomain: "lumix-financas-app.firebaseapp.com",
    projectId: "lumix-financas-app",
    storageBucket: "lumix-financas-app.appspot.com",
    messagingSenderId: "463777495321",
    appId: "1:463777495321:web:106118f56abd206ed88"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

const SW_VERSION = "v1.9-stable";
console.log(`Service Worker ${SW_VERSION} cargado.`);

self.addEventListener('install', (event) => {
  console.log(`[SW ${SW_VERSION}] Instalando...`);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log(`[SW ${SW_VERSION}] Activado y tomando control.`);
  event.waitUntil(self.clients.claim());
});

// SE HA ELIMINADO EL CÓDIGO 'onBackgroundMessage' POR COMPLETO.
// Esto evita la duplicación. El navegador mostrará la notificación enviada desde el servidor.

self.addEventListener('notificationclick', (event) => {
    console.log(`[SW ${SW_VERSION}] Evento 'notificationclick' DETECTADO.`);
    event.notification.close();

    // Lee la URL del objeto 'data' enviado desde la Cloud Function.
    const targetUrl = event.notification.data.url;
    if (!targetUrl) {
        console.error(`[SW ${SW_VERSION}] No se encontró URL en los datos de la notificación.`);
        return;
    }

    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        for (const client of windowClients) {
            // Si encuentra una pestaña de la app, la enfoca.
            if (new URL(client.url).origin === new URL(targetUrl).origin && 'focus' in client) {
                console.log(`[SW ${SW_VERSION}] Se encontró una ventana abierta. Navegando y enfocando.`);
                return client.navigate(targetUrl).then(c => c.focus());
            }
        }
        // Si no hay ninguna pestaña abierta, abre una nueva en la URL correcta.
        if (clients.openWindow) {
            console.log(`[SW ${SW_VERSION}] No se encontraron ventanas. Abriendo una nueva en: ${targetUrl}`);
            return clients.openWindow(targetUrl);
        }
    });

    event.waitUntil(promiseChain);
});
