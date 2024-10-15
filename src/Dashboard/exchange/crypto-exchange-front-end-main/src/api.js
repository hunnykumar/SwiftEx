import axios from 'axios'
import AsyncStorageLib from '@react-native-async-storage/async-storage'
import { REACT_APP_HOST, REACT_APP_GOOGLE_VPID_KEY, REACT_APP_LOCAL_TOKEN, REACT_APP_FCM_TOKEN_KEY} from './ExchangeConstants'
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

export const saveToken = (token) => {
  AsyncStorageLib.setItem(LOCAL_TOKEN, token) 
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
    .catch((error) => console.error(error));

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
        authorization: await getToken(),
      },
    }

    const res = await request(opts)
    return { res }
  } catch (error) {
    console.log('AUTHORIZED_REQUEST_ERROR: \n', JSON.stringify(error.response))
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
