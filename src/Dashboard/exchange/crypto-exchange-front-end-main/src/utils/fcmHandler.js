
import AsyncStorageLib from '@react-native-async-storage/async-storage'
import { authRequest, GET, getAuth, getToken } from '../api'
import { REACT_APP_FCM_TOKEN_KEY , REACT_APP_GOOGLE_VPID_KEY} from '../ExchangeConstants'
const REGISTERATION_TOKEN = REACT_APP_FCM_TOKEN_KEY


export const requestFirebaseNotificationPermission = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: REACT_APP_GOOGLE_VPID_KEY,
    })
    saveRegistrationToken(token)
    console.log("Token saved") // test...
  } catch (err) {
    console.log(err)
  }
}

export const setMessaging = () =>{
  
}

export const onMessageListener = () =>
  new Promise((resolve, reject) => {
   messaging.onMessage(async (payload) => {
      // Check if anyone is logged in
      const auth = getAuth()
      if (!auth) return reject()

      // Check if user is the bidder
      const { targetUser } = payload.data
      const { err, res } = await authRequest('/users/getUserDetails', GET)
      if (err) return reject(err.message)
      if (res._id !== targetUser) return reject()

      resolve(payload)
    })
  })

export const saveRegistrationToken = (token) =>
AsyncStorageLib.setItem(REGISTERATION_TOKEN, token)

export const getRegistrationToken = async () =>{
  const token = await AsyncStorageLib.getItem('fcmtoken')
  return JSON.parse(token)
}
