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

messaging.onBackgroundMessage((payload) => {
    console.log("[SW] Mensaje de fondo recibido: ", payload);

    const notificationTitle = payload.data?.title || payload.notification?.title || 'Nova Notificação';
    const notificationBody = payload.data?.body || payload.notification?.body || 'Você recebeu uma nova notificação.';
    
    const appOrigin = self.location.origin;

    const notificationOptions = {
        body: notificationBody,
        icon: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        badge: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png',
        tag: 'lumix-notification',
        data: {
            url: new URL('/#notifications', appOrigin).href
        }
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// [NUEVA LÓGICA DE CLIC - MÁS ROBUSTA Y CON LOGS]
self.addEventListener('notificationclick', function(event) {
    console.log('[SW] Evento notificationclick DETECTADO.');
    event.notification.close();

    let targetUrl = event.notification.data.url;
    console.log('[SW] URL de destino extraída:', targetUrl);

    if (!targetUrl) {
        console.warn('[SW] No se encontró URL en los datos, usando el origen como fallback.');
        targetUrl = self.location.origin;
    }

    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then(function(windowClients) {
        console.log('[SW] Buscando ventanas de cliente abiertas. Encontradas:', windowClients.length);
        let matchingClient = null;
        for (let i = 0; i < windowClients.length; i++) {
            const windowClient = windowClients[i];
            if (new URL(windowClient.url).origin === new URL(targetUrl).origin) {
                matchingClient = windowClient;
                console.log('[SW] Se encontró una ventana compatible:', windowClient.url);
                break;
            }
        }

        if (matchingClient) {
            console.log('[SW] Enfocando y navegando ventana existente.');
            return matchingClient.navigate(targetUrl).then(client => client.focus());
        } else {
            console.log('[SW] No se encontró ventana, abriendo una nueva.');
            return clients.openWindow(targetUrl);
        }
    }).catch(function(err) {
        console.error('[SW] Error en la cadena de promesas de notificationclick:', err);
    });

    event.waitUntil(promiseChain);
});


