// firebase-messaging-sw.js
// Version: 1.6 (Incrementa este número para forzar actualizaciones)
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js');

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

// Este evento se dispara cuando el Service Worker se instala.
// self.skipWaiting() fuerza al nuevo Service Worker a activarse inmediatamente.
self.addEventListener('install', (event) => {
  console.log('Nuevo Service Worker instalado, forzando activación.');
  self.skipWaiting();
});

// Este evento se dispara cuando el Service Worker se activa.
// self.clients.claim() hace que el SW tome control de todas las pestañas abiertas de la app.
self.addEventListener('activate', (event) => {
  console.log('Service Worker activado y tomando control.');
  event.waitUntil(self.clients.claim());
});


messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});





