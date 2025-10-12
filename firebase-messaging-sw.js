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

// Inicializamos Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// [CÓDIGO REFORZADO FINAL] - Manejador para notificaciones en segundo plano.
messaging.onBackgroundMessage(async (payload) => {
    console.log("[SW Final] Mensaje recibido:", payload);

    const notificationTitle = payload.data?.title || 'Nova Notificação';
    const notificationBody = payload.data?.body || 'Você recebeu uma nova notificação.';
    const targetUrl = new URL('#notifications', self.registration.scope).href;

    const notificationOptions = {
        body: notificationBody,
        // Usamos URLs absolutas para los íconos para máxima compatibilidad
        icon: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        badge: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        
        // [FIX DUPLICADOS] - La 'tag' asegura que solo haya una notificación de este tipo a la vez.
        // Si el sistema muestra una y luego nuestro código muestra otra, esta la reemplazará.
        tag: 'lumix-cobrador-notification',
        renotify: true, // Permite que el dispositivo vibre o suene de nuevo al reemplazar.

        data: {
            url: targetUrl // Guardamos la URL completa para el evento 'notificationclick'
        }
    };

    console.log('[SW Final] Mostrando notificación controlada:', notificationTitle);
    await self.registration.showNotification(notificationTitle, notificationOptions);
});


// [SOLUCIÓN DEFINITIVA PARA EL CLIC] - Manejador de clic en la notificación.
self.addEventListener('notificationclick', (event) => {
    console.log('[SW Final] Notificación clickeada:', event.notification.data);
    event.notification.close();

    const targetUrl = event.notification.data.url;
    if (!targetUrl) {
        console.error('[SW Final] URL no encontrada en los datos de la notificación.');
        return;
    }

    // `waitUntil` asegura que el Service Worker se mantenga activo hasta que la acción se complete.
    event.waitUntil(
        (async () => {
            const clientList = await clients.matchAll({
                type: "window",
                includeUncontrolled: true
            });

            // 1. Revisa si la app ya está abierta en alguna pestaña.
            for (const client of clientList) {
                if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
                    console.log('[SW Final] App ya está abierta. Navegando y enfocando.');
                    // La trae al frente y la navega a la sección correcta.
                    await client.navigate(targetUrl);
                    return client.focus();
                }
            }

            // 2. Si no hay ninguna pestaña abierta, abre una nueva.
            if (clients.openWindow) {
                console.log('[SW Final] App no encontrada. Abriendo una nueva ventana.');
                // Este método es el más robusto para Android: abre la app y LUEGO navega.
                const windowClient = await clients.openWindow(self.registration.scope);
                if (windowClient) {
                    return windowClient.navigate(targetUrl);
                }
            }
        })()
    );
});

