import PushNotification from "react-native-push-notification";
import { useNavigation } from '@react-navigation/native'
import PushNotificationIOS from '@react-native-community/push-notification-ios';
//import notifee from '@notifee/react-native';


/*PushNotification.getChannels(function (channel_ids) {
>>>>>>> 82f128721a5a5b21099fa7fb22b426127b2a24a6
    console.log(channel_ids); // ['channel_id_1']
  });

  PushNotification.configure({
    // (required) Called when a remote or local notification is opened or received
    onNotification: function(notification) {
      console.log('LOCAL NOTIFICATION ==>', notification)
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
<<<<<<< HEAD

=======
*/
export default function PushNotifications(){
    const navigation = useNavigation()
        PushNotification.configure({
            // (optional) Called when Token is generated (iOS and Android)
            onRegister: function(token) {
              console.log("TOKEN:", token);
            },
          
            // (required) Called when a remote or local notification is opened or received

            
            onNotification: function(notification) {
              console.log("NOTIFICATION:", notification);
              navigation.navigate('exchange')
              // process the notification here
          
              // required on iOS only 
              notification.finish(PushNotificationIOS.FetchResult.NoData);
            },
            // Android only
            senderID: "1090501687137",
            // iOS only
            permissions: {
              alert: true,
              badge: true,
              sound: true
            },
            popInitialNotification: true,
            requestPermissions: true
          });
    

          
    
}

// export const FirebaseSendNotification = async(title,message)=>{
//   await notifee.requestPermission()

//   // Create a channel (required for Android)
//   const channelId = await notifee.createChannel({
//     id: 'default',
//     name: 'Default Channel',
//   });

//   // Display a notification
//   await notifee.displayNotification({
//     title: title,
//     body: message,
//     android: {
//       channelId,
//       smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
//       // pressAction is needed if you want the notification to open the app when pressed
//       pressAction: {
//         id: 'default',
//       },
//     },
//   });
// }


// =======
// >>>>>>> 82f128721a5a5b21099fa7fb22b426127b2a24a6

  export const firebaseNotification = (title,appName,submessage,message) => {
    
    PushNotification.localNotification({
        channelId: "1",
      autoCancel: true,
      bigText:
        submessage,
      subText: appName,
      title: title,
      message: message,
      vibrate: true,
      vibration: 300,
      playSound: true,
      soundName: 'default',
      actions: ["Yes", "No"],
      invokeApp:false
    })
  }