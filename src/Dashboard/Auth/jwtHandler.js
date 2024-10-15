import { sign } from "react-native-pure-jwt";
import { jwtSecret } from "../constants";
import JWT from 'expo-jwt';
var jwtDecode = require('jwt-decode');
export const genUsrToken =  (user) => {
 
  const token = JWT.encode(user.accountName,user.pin,jwtSecret, { algorithm: 'HS512' });
  console.log(token)
  return token
};

export const decodeUserToken = (token) =>{
  console.log(token)
 const decoded= jwtDecode(token,jwtSecret);
 //JWT.decode(token, jwtSecret, { timeSkew: 30 })
 console.log('hi'+decoded)
 if(decoded){
  return decoded
 }
 else{

   return null
 }
}
export const genrateAuthToken = async (Body) =>{
  const generate = await sign(
        {
          iss: Body,
          exp: new Date().getTime() + 3600 * 1000, // expiration date, required, in ms, absolute to 1/1/1970
          additional: "payload"
        }, // body
        jwtSecret, // secret
        {
          alg: "HS256"
        }
      )
        .then((token)=>{
            console.log(token)
        }) // token as the only argument
        .catch(console.error); // possible errors

        console.log(generate)
        return generate



}