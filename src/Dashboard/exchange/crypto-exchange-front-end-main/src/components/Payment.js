
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert,Text, TextInput, TouchableOpacity, Keyboard, ActivityIndicator} from 'react-native';
import { WebView } from 'react-native-webview';
import { alert } from "../../../../reusables/Toasts";
import { REACT_APP_HOST } from '../ExchangeConstants';
import { GET, authRequest } from '../api';
let url_payment;

const Payment = () => {
  const [deposit_amount,setdeposit_amount]=useState(0);
  const [openweb,setopenweb]=useState(false);
  const [button,setbutton]=useState(false);
  const [payment_url,setpayment_url]=useState("");
  const [email,setemail]=useState("");
  useEffect(()=>{
    setemail("");
    setopenweb(false);
    setdeposit_amount(0);
    setbutton(false);
    fetchProfileData()
  },[]);
  const fetchProfileData = async () => {
    
    try {
      const { res, err } = await authRequest("/users/getUserDetails", GET);
      if (err) return alert("error","getting error in fatching data.");
      console.log("+++++++++++++++++++++++++++",res.email)
      setemail(res.email);
    } catch (err) {
      alert("error","getting error in fatching data.");
    }
  };



  const get_payment_link =async () => {
    console.log("###################",email)
    let num = deposit_amount;
     let xusd_amount = num.toString();

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      "id": email,
      "amount": deposit_amount*100,
      "XUSD_amount": xusd_amount
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch(REACT_APP_HOST+"/stripe-payment/payment_link", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result.url)
        open_web_view(result.url);
        setbutton(false)
      })
      .catch((error) => console.error(error));
  }

  const open_web_view=(url)=>{
     if(!url)
     {
       alert("error","Sorry something went worng.");
     }
     else{
       url_payment=url;
      setopenweb(true);
     }
  }


  const payment_manage=async()=>{
    setbutton(true);
    Keyboard.dismiss()
     if(deposit_amount<=0)
     {
        alert("error","Invalid value");
        setbutton(false);
     }
     else{
       await get_payment_link()
     }

  }
  const onChangeamount = (input) => {
    const formattedInput = input.replace(/[,\s-]/g, '');
    setdeposit_amount(formattedInput);
};
  return(
    openweb===false?
   ( <View style={{backgroundColor:"#011434",flex:1}}>
      <Text style={{padding:15,fontSize:23,color:"white",marginTop:60}}>Deposit Amount</Text>
      <View  style={{marginTop:40,borderWidth:1.9,borderColor:"#212B53",height:41,borderRadius:10,margin:19,backgroundColor:"#fff",justifyContent:"center"}}>
        <TextInput style={{marginStart:10,fontSize:19}} placeholder='100' keyboardType="number-pad"  value={deposit_amount} onChangeText={(value)=>{onChangeamount(value)}}/>
      </View>

      <TouchableOpacity disabled={button} style={{backgroundColor:"green",justifyContent:"center",alignSelf:"center",marginTop:50,width:"40%",height:45,borderRadius:15}} onPress={()=>{payment_manage()}}>
          {button===true?<ActivityIndicator color={"white"}/>:<Text style={{textAlign:"center",fontSize:19,color:"white"}}>Procced</Text>}
        </TouchableOpacity>

    </View>):(<View style={styles.container}>
      {console.log("|||||||||||||||||",url_payment)}
    <WebView
      source={{ uri: url_payment }}
      style={styles.webview}
    />
  </View>)
  )
  // Alert.alert("Card Info","Use this 4242 4242 4242 4242 Card Number Test for Payments")
  // return (
  //   <View style={styles.container}>
  //     <WebView
  //       source={{ uri: 'https://buy.stripe.com/test_eVag2k8fHcwVg7eeUW' }}
  //       style={styles.webview}
  //     />
  //   </View>
  // );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default Payment;
