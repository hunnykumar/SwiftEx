/**
 * @format
 */
import './shim';
import 'react-native-get-random-values'; // For RandomBytes support
import { Buffer } from 'buffer';
global.Buffer = Buffer;
global.process = require('process'); // Polyfill for process
import { AppRegistry } from 'react-native';
import App from './App'; // Ensure this points to the correct file
import { name as appName } from './app.json';
import PushNotification from "react-native-push-notification";
import messaging, { firebase } from '@react-native-firebase/messaging';
import { NavigationController } from './src/utilities/utilities';
import { firebaseNotification } from './src/Dashboard/notifications/firebasePushMessages';

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

PushNotification.getChannels(function (channel_ids) {
    console.log(channel_ids); // ['channel_id_1']
  });

  PushNotification.configure({
    // (required) Called when a remote or local notification is opened or received
    onNotification: function(notification) {
      console.log('LOCAL NOTIFICATION ==>', notification)
      if(notification.userInteraction){
        //Navigation.navigate('exchange')
        NavigationController('Transactions')
      }
      console.log("Actions",notification.actions)
    },
   onAction:function(notification){

    console.log("My actions",notification)
    if(notification.action==='Yes'){
      console.log('Yes clicked')
    }
   },
    popInitialNotification: true,
    requestPermissions: true
  })

  
  PushNotification.createChannel(
    {
      channelId: "1", // (required)
      channelName: "My channel", // (required)
      channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
      playSound: true, // (optional) default: true
      soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
      importance: 4, // (optional) default: 4. Int value of the Android notification importance
      vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
    },
    (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
  );


// messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//     firebaseNotification(remoteMessage.notification.title,'SwiftEx',remoteMessage.notification.message,remoteMessage.notification.body,remoteMessage?.notification?.android?.imageUrl,remoteMessage?.data?.transaction)
// });
messaging().onMessage(async (remoteMessage) => {
    firebaseNotification(remoteMessage.notification.title,'SwiftEx',remoteMessage.notification.message,remoteMessage.notification.body,remoteMessage?.notification?.android?.imageUrl,remoteMessage?.data?.transaction)
  });

AppRegistry.registerComponent(appName, () => App);
