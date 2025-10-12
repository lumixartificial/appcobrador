// firebase-messaging-sw.js

// Version: 1.8 (Incrementa este número para forzar actualizaciones)

// Importa los scripts de Firebase

importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-compat.js");

// Usa la misma configuración de Firebase de tu app
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

// Este manejador está funcionando correctamente.
messaging.onBackgroundMessage((payload) => {
    console.log("[SW FINAL] Mensaje recibido: ", payload);

    const notificationTitle = payload.data?.title || payload.notification?.title || 'Nova Notificação';
    const notificationBody = payload.data?.body || payload.notification?.body || 'Você recebeu uma nova notificação.';

    const notificationOptions = {
        body: notificationBody,
        icon: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        badge: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        tag: 'lumix-cobrador-notification', // Evita notificaciones duplicadas
        data: {
            // Guardamos la URL completa y absoluta a la que debemos navegar.
            url: new URL('/#notifications', self.location.origin).href
        }
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// [LÓGICA DE CLIC DEFINITIVA Y A PRUEBA DE FALLOS]
self.addEventListener('notificationclick', (event) => {
    console.log('[SW FINAL] Notificación clickeada:', event.notification);
    event.notification.close();

    const targetUrl = event.notification.data.url;

    // waitUntil() asegura que el Service Worker no termine antes de que completemos la acción.
    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        let matchingClient = null;

        // 1. Busca si ya hay una ventana/pestaña de la app abierta.
        for (let i = 0; i < windowClients.length; i++) {
            const client = windowClients[i];
            // Usamos el 'scope' para asegurarnos de que es nuestra PWA.
            if (client.url.startsWith(self.registration.scope)) {
                matchingClient = client;
                break; // Encontramos una, no necesitamos buscar más.
            }
        }

        // 2. Si encontramos una ventana abierta...
        if (matchingClient) {
            console.log("[SW FINAL] App encontrada. Navegando y enfocando.");
            // La navegamos a la URL correcta y LUEGO la traemos al frente (focus).
            return matchingClient.navigate(targetUrl).then((client) => client.focus());
        }
        
        // 3. Si no hay ninguna ventana abierta, abrimos una nueva.
        console.log("[SW FINAL] App no encontrada. Abriendo nueva ventana.");
        return clients.openWindow(targetUrl);
    });

    event.waitUntil(promiseChain);
});

