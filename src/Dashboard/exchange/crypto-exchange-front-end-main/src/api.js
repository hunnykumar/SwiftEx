import axios from 'axios'
import AsyncStorageLib from '@react-native-async-storage/async-storage'
import { REACT_APP_HOST, REACT_APP_GOOGLE_VPID_KEY, REACT_APP_LOCAL_TOKEN, REACT_APP_FCM_TOKEN_KEY, REACT_PROXY_HOST} from './ExchangeConstants'
import DeviceInfo from 'react-native-device-info'
import messaging from '@react-native-firebase/messaging'
const SERVER_URL = REACT_APP_HOST
const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN
let TOKEN =''
const HEADERS = { 'Content-type': 'application/json' }

// Getting Authority status
export const getAuth = async () => {
  if (!TOKEN) {
    TOKEN = await AsyncStorageLib.getItem(LOCAL_TOKEN)
  }
  return TOKEN
}

// Getting Refreshed Tokens
export const getToken = async () => {
  const token = await AsyncStorageLib.getItem(LOCAL_TOKEN)
  if(token){

    return token 
  }
  return TOKEN
}

export const saveToken =async (token) => {
  await AsyncStorageLib.setItem(LOCAL_TOKEN, token) 
}

export const removeAuth = () => {
  AsyncStorageLib.removeItem(LOCAL_TOKEN)
}

// Authenticating requests
export const login = async (userData) => {
  try {
    const opts = {
      url: '/users/login',
      body: userData,
      
      
    }
    const res = await POST(opts)
    .then((resp)=>{
      console.log(resp)
    }).catch((e)=>{
      console.log(e)
    })
    console.log('starting')
    console.log("RESPONSEE",res)
    return { res }
  } catch (error) {
    console.log('LOGIN_ERROR: \n' + JSON.stringify(error.response))
    const err = {
      message: error.response.data.message,
      status: error.response.statusText,
    }
    return { err }
  }
}

export const verifyLoginOtp = async (loginOtpData) => {
  try {
    const opts = {
      url: '/users/verifyLoginOtp',
      body: loginOtpData,
    }
    const { token } = await POST(opts)
    saveToken(token)
    return 'success'
  } catch (error) {
    console.log("===",error)
    console.log('LOGIN_ERROR: \n' + error.response)
    const err = {
      message: error.response.data.message,
      status: error.response.statusText,
    }
    return { err }
  }
}

export const signup = async (userData) => {
  try {
    const opts = {
      url: '/users/register',
      body: userData,
    }
    const res = await POST(opts)
    return { res }
  } catch (error) {
    console.log('SIGNUP_ERROR: \n' + error.response)
    const err = {
      message: error.response.data.message,
      status: error.response.statusText,
    }
    return { err }
  }
}

// passcode adding
export const Add_pin = async (userData) => {
 try {
  console.log("___",userData+await getToken())
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", "Bearer "+await getToken());  
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: userData,
    redirect: "follow"
  };
  
  fetch(REACT_APP_HOST+"/users/updatePasscode", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log(error));

 } catch (error) {
      return {error}
 }
}

// Authorized Requests
export const authRequest = async (url, request, body = {}) => {
  try {
    const opts = {
      url,
      body: body,
      headers: {
        authorization:"Bearer "+await getToken(),
      },
    }

    const res = await request(opts)
    return { res }
  } catch (error) {
    console.log('AUTHORIZED_REQUEST_ERROR: \n', JSON.stringify(error.response))
    // createGuestUser()
    const err = {
      message: error.response.data.message,
      status: error.response.statusText,
    }
    return { err }
  }
}

// Basic requests
export async function GET(opts) {
  const URL = SERVER_URL + opts.url
  const header = opts.headers ? opts.headers : HEADERS
  const res = await axios.get(URL, { headers: header })
  return res.data
}

export async function POST(opts) {
  const URL = SERVER_URL + opts.url
  const header = opts.headers ? opts.headers : HEADERS
  const body = opts.body
  const res = await axios.post(URL, body, { headers: header })
  return res.data
}

export async function PATCH(opts) {
  const URL = SERVER_URL + opts.url
  const header = opts.headers ? opts.headers : HEADERS
  const body = opts.body
  const res = await axios.patch(URL, body, { headers: header })
  return res.data
}

// Add guest auth
export const createGuestUser=async()=>{
  try {
  const token = await messaging().getToken();
  console.log("----createGuestUser----")
    const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      'brand': await DeviceInfo.getBrand(),
      'model': await DeviceInfo.getModel(),
      "uniqueId": await DeviceInfo.getUniqueIdSync(),
      "type": await DeviceInfo.getDeviceType(),
      "macAddress": await DeviceInfo.getMacAddress()||"00000",
      "fcmToken":token
  });
  
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };
  
  fetch(REACT_APP_HOST+"/v1/device", requestOptions)
    .then((response) => response.json())
    .then(async(result) => {
      console.log("--Guest auth --",result)
      if(result?.deviceToken)
      {
        await saveToken(result?.deviceToken)
      }
    })
    .catch((error) => {
      console.log("--Guest auth Error--",error)
    });
  } catch (error) {
    console.log("--Guest Auth Creation Faild--",error)
  }
}


// Authorized Requests
export const proxyRequest = async (url, request, body = {}) => {
  try {
    const deviceToken = await getToken();
    const opts = {
      url,
      body: body,
      headers: {
        authorization: `Bearer ${deviceToken}`,
        "x-auth-device-token": deviceToken,
      },
    }

    const res = await request(opts)
    return { res }
  } catch (error) {
    console.log('proxyError: \n', JSON.stringify(error))
    const err = {
      message: JSON.stringify(error.response.data.error)||JSON.stringify(error.response.data.message),
      status: error.response.status,
    }
    return { err }
  }
}

export async function PGET(opts) {
  const URL = REACT_PROXY_HOST + opts.url
  const header = opts.headers ? opts.headers : HEADERS
  const res = await axios.get(URL, { headers: header })
  return res.data
}

export async function PPOST(opts) {
  const URL = REACT_PROXY_HOST + opts.url
  const header = opts.headers ? opts.headers : HEADERS
  const body = opts.body
  const res = await axios.post(URL, body, { headers: header })
  return res.data
}