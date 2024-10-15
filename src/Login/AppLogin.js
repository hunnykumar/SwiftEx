import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Text
} from "react-native";
import { TextInput } from 'react-native-paper';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Button,ActivityIndicator, Image} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome'
import title_icon from '../../../../../../../assets/title_icon.png'
import { LinearGradient } from 'react-native-linear-gradient';
import { useDispatch } from "react-redux";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import PhoneInput from "react-native-phone-number-input";
import { Colors } from "react-native/Libraries/NewAppScreen";
import { login, verifyLoginOtp } from '../../api'
import { useNavigation } from "@react-navigation/native";

export  const AppLogin = (props ) => {
  const [value, setValue] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const [valid, setValid] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const phoneInput = useRef(null);
  const[loading, setLoading]= useState(false)
  const[message, setMessage] = useState('')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [otp, setOtp] = useState()
  const dispatch = useDispatch();
  const navigation = useNavigation()
    const submitPhoneNumber = async () => {
      try {
        
        if (!value) {
          return(setMessage('phone number is required to proceed'))
        }
  
        
        console.log(formattedValue)
        const { err } = await login({ phoneNumber: `${formattedValue}` })
        if (err) {
          return(setMessage(err.message))
        }
  
        setMessage('OTP is sent')
        setIsOtpSent(true)
      } catch (err) {
        setMessage(err.message)
      } finally {
        setLoading(false)
      }
    }
  
    const submitOtp = async () => {
      try {
        
        if (!otp) {
          return(setMessage('OTP is required'))
        }
  
        const { err } = await verifyLoginOtp({
          phoneNumber: `${formattedValue}`,
          otp:otp,
        })
        if (err) return(setMessage(err.message))
       navigation.navigate('exchange')
       alert('success')
      } catch (err) {
        setMessage(err.message)
      } finally {
        setLoading(false)
        
      }
    }

    useEffect(() => {
      try{

        if(props.route.params){
          
          if (props.route.params.phoneNumber) {
            const phoneNumber = props.route.params.phoneNumber
            if (phoneNumber) {
              setFormattedValue(phoneNumber)
              setIsOtpSent(true)
          }
        }
      }
    }catch(e){
      console.log(e)
    }
    }, [])
  
  return (
    
    <View style={styles.container}>
    <View style={styles.content}>
    <View>
    <Image
    style={styles.tinyLogo}
    source={title_icon}
  />
    </View>
    

      <Text style={styles.text}>
      Welcome Back!
       </Text>
       <Text style={{color:'#FFFFFF',
       marginBottom:20,
       fontSize:16}}>
      Login to your account
       </Text>
       <View style={{marginTop:30}}>
            <PhoneInput
            
            ref={phoneInput}
            defaultValue={value}
            defaultCode="IN"
            layout="first"
            onChangeText={(text) => {
              setValue(text);
            }}
            onChangeFormattedText={(text) => {
              setFormattedValue(text);
            }}
            withDarkTheme
            withShadow
            autoFocus
            />
      
      </View>
          
      <View style={{marginTop:10}} >
             {showMessage?<Text style={{color:'white'}}>{message}</Text>:<Text></Text>}
            </View> 
      
        {loading? <ActivityIndicator size="large" color="white" />:<Text> </Text>}

      <View  style={styles.btn}>
      <LinearGradient
      colors={['#12c2e9', '#c471ed', '#f64f59']}
      start={{x: 0, y: 0.5}}
      end={{x: 1, y: 1}}
      style={styles.button}
      >
      <TouchableOpacity onPress={()=> {
        setLoading('true')
        const checkValid = phoneInput.current?.isValidNumber(value);
        setLoading(false)
        if(checkValid){
          setMessage('Your number is valid')
          submitPhoneNumber()
        }else{
          setMessage('Your number is invalid')
        }
        setShowMessage(true);
        setValid(checkValid ? checkValid : false);
        console.log(checkValid)
      }}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      
     
      </LinearGradient>
      </View>
      <View style={styles.lowerbox}>
      <TouchableOpacity onPress={()=>{
        navigation.navigate('exchangeRegister')
      }}>
      <Text style={styles.lowerboxtext}><Text style={{color:'#78909c'}}>Don't have an account?</Text> Register now</Text>
      </TouchableOpacity>
      </View>
      </View>
      </View>
      
    
  );
};

const styles = StyleSheet.create({
  input: {
    height: hp('5%'),
    marginBottom: hp('2'),
    color:'#fff',
    marginTop:hp('2'),
    width:wp('70'),
    paddingRight:wp('7'),
    backgroundColor:'#131E3A',
    borderRadius:wp('20'),
    marginLeft:wp('10'),

  },
  content: {
   display: 'flex',
   alignItems:'center',
   textAlign:'center',
   justifyContent:'space-evenly',
    marginTop:hp('10'),
    color:'white'
   
  },
  inp:{
    borderWidth:2,
    marginTop:hp('5'),
    color:'#FFF',
    borderRadius:20,
    borderColor:'#808080',
   width:wp('90')
  },
  btn:{
    marginTop:hp('10'),
    width:wp('80'),
    borderRadius:380,
    overflow: 'hidden',
    backgroundColor:'rgba(0,0,0,0.8)'

  },
  icon:{
    display:'flex',
    flexDirection:'row',
    marginTop:hp('10'),
    marginLeft:wp('15')
  },
  text:{
    color:'#FFFFFF',
    marginBottom:wp('5'),
    fontSize:hp('5')
  },
  tinyLogo: {
    width: wp('5'),
    height: hp('5'),
    padding:30
  },
  icon:{
    display:'flex',
    flexDirection:'row',
    marginTop:hp('2'),
    marginLeft:wp('4')
  },
  icon2:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-evenly',
    marginTop:hp('5'),
    paddingLeft:wp('2'),
  },
  button: {
    paddingVertical: hp('2'),
    paddingHorizontal: wp('2'),
    borderRadius: wp('10')
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 24
  },
  lowerbox:{
    marginTop:hp(20),
    height:100,
    width:400,
    backgroundColor:'#003166',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    display:'flex',
    alignItems:'center',
    textAlign:'center',
    justifyContent:'center'
  },
  lowerboxtext:{
    fontSize: 20,
    color:'#FFFFFF',
    textAlign:'center',
    alignSelf:'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#131E3A',
    height:10,
    color:'#fff',
    
  }
});
