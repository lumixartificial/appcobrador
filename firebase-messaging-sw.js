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

// Este manejador se activa cuando llega una notificación con la app en segundo plano
messaging.onBackgroundMessage((payload) => {
    console.log("[SW Final] Mensaje recibido en segundo plano: ", payload);

    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: payload.data.icon || 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        badge: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        tag: 'lumix-cobrador-notification', // Evita notificaciones duplicadas
        data: {
            hash: '#notifications' 
        }
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});


// [SOLUCIÓN DEFINITIVA PARA EL CLIC] - Este manejador se activa cuando el usuario hace clic en la notificación
self.addEventListener('notificationclick', (event) => {
    console.log('[SW Final] Notificación clickeada:', event.notification.data);
    
    event.notification.close();

    const targetHash = event.notification.data.hash || '#';
    // self.registration.scope es la URL base de tu PWA (ej: "https://cobrador.lumixartificial.com/")
    const targetUrl = new URL(targetHash, self.registration.scope).href;

    console.log(`[SW Final] URL de destino construida: ${targetUrl}`);

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
                    await client.navigate(targetUrl);
                    return client.focus();
                }
            }

            // 2. Si no hay ninguna pestaña abierta, la abrimos.
            // ESTA ES LA LÓGICA MÁS ROBUSTA PARA ANDROID CUANDO LA APP ESTÁ CERRADA:
            if (clients.openWindow) {
                console.log('[SW Final] App no encontrada. Abriendo una nueva ventana.');
                // Primero, abre la app en su URL base (el "scope").
                const windowClient = await clients.openWindow(self.registration.scope);
                // Una vez que la ventana está abierta y lista, la dirigimos a la sección correcta.
                if (windowClient) {
                    return windowClient.navigate(targetUrl);
                }
            }
        })()
    );
});
