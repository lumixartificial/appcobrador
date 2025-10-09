//Version 1

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-messaging-sw.js";

// IMPORTANTE: Esta configuración debe ser idéntica a la de tus aplicaciones web.
const firebaseConfig = {
    apiKey: "AIzaSyBRxJjpH6PBi-GRxOXS8klv-8v91sO4X-Y",
    authDomain: "lumix-financas-app.firebaseapp.com",
    projectId: "lumix-financas-app",
    storageBucket: "lumix-financas-app.appspot.com",
    messagingSenderId: "463777495321",
    appId: "1:463777495321:web:106118f53f56abd206ed88"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * onBackgroundMessage se encarga de procesar las notificaciones push
 * cuando la aplicación está en segundo plano o cerrada.
 */
onBackgroundMessage(messaging, (payload) => {
    console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano: ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: 'https://res.cloudinary.com/dc6as14p0/image/upload/v1759873183/LOGO_LUMIX_REDUCI_czkw4p.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});