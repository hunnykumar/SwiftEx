// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js')

// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
  apiKey: "AIzaSyAWxzGg2Jiy3clbfywr0TZKRwg1g0eeNd0",
  authDomain: "proxy-server-99cc2.firebaseapp.com",
  projectId: "proxy-server-99cc2",
  storageBucket: "proxy-server-99cc2.firebasestorage.app",
  messagingSenderId: "121537912071",
  appId: "1:121537912071:web:07efa9bed63b89dce3b9a2",
  measurementId: "G-V78H9W46GL"
}

firebase.initializeApp(firebaseConfig)

// Retrieve firebase messaging
const messaging = firebase.messaging()

self.addEventListener('notificationclick', function (event) {
  let url = 'http://localhost:3000/transactions?newTx=true'
  event.notification.close() // Android needs explicit close.
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i]
        // If so, just focus it.
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    }),
  )
})

messaging.onBackgroundMessage(function (payload) {
  console.log('Received background message ', payload)

  // Customize notification here
  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    vibrate: [200, 100, 200, 100, 200, 100, 200],
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
