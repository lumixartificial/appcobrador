// firebase-messaging-sw.js

// Version: 1.7 (Incrementa este número para forzar actualizaciones)

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

      console.log("[firebase-messaging-sw.js] Mensaje recibido en segundo plano: ", payload);

    

      // Extraemos la información del payload "data"

      const notificationTitle = payload.data.title;

      const notificationOptions = {

        body: payload.data.body,

        icon: payload.data.icon || '/default-icon.png', // Un ícono por si acaso

        badge: '/badge-icon.png', // Ícono para la barra de notificaciones de Android

        data: {

            click_action: payload.data.click_action // Pasamos la URL a la notificación

        }

      };

    

      // Mostramos la notificación

      return self.registration.showNotification(notificationTitle, notificationOptions);

    });

    

    // Este manejador se activa cuando el usuario hace clic en la notificación

    self.addEventListener('notificationclick', (event) => {

        // Cierra la notificación

        event.notification.close(); 

    

        const urlToOpen = event.notification.data.click_action;

        if (urlToOpen) {

            // Abre la ventana de la app en la URL especificada

            event.waitUntil(clients.openWindow(urlToOpen));

        }

    });

