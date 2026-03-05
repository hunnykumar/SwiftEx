// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js')


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
