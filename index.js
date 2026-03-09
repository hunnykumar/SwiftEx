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

messaging().onMessage(async (remoteMessage) => {
    firebaseNotification(remoteMessage.notification.title,'SwiftEx',remoteMessage.notification.message,remoteMessage.notification.body,remoteMessage?.notification?.android?.imageUrl,remoteMessage?.data)
  });
AppRegistry.registerComponent(Platform.OS==="ios"?"test_app":appName, () => App);
