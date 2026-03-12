/**
 * @format
 */
import './shim';
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;
global.process = require('process');

import { AppRegistry, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import { firebaseNotification } from './src/Dashboard/notifications/firebasePushMessages';
import PushNotification from "react-native-push-notification";
import { NavigationController } from './src/utilities/utilities';

async function requestPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  if (enabled) {
    console.log("FCM Permission granted:", authStatus);
  } else {
    console.log("FCM Permission denied");
  }
}

PushNotification.configure({
  onNotification: function (notification) {
    if (notification.userInteraction) {
      NavigationController('Home')
    }
  },
  onAction: function (notification) {
    if (notification.action === 'Yes') {
      console.log('Yes clicked')
    }
  },
  popInitialNotification: true,
  requestPermissions: true
})

PushNotification.createChannel(
  {
    channelId: "1",
    channelName: "My channel",
    channelDescription: "A channel to categorise your notifications",
    playSound: true,
    soundName: "default",
    importance: 5,
    vibrate: true,
  },
  (created) => console.log(`createChannel returned '${created}'`)
);

messaging().onMessage(async (remoteMessage) => {
    firebaseNotification(remoteMessage.notification.title,'SwiftEx',remoteMessage.notification.message,remoteMessage.notification.body,remoteMessage?.notification?.android?.imageUrl,remoteMessage?.data)
  });
requestPermission();
AppRegistry.registerComponent(Platform.OS==="ios"?"test_app":appName, () => App);
