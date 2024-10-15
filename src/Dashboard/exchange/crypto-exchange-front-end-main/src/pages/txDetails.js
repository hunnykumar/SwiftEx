import React,{useEffect, useLayoutEffect, useState} from 'react'
import { StyleSheet, Text, View, Button ,TextInput, FlatList, TouchableOpacity,ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Avatar,  Card, Title, Paragraph, CardItem} from 'react-native-paper';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { urls } from './constants';
import { WebView } from 'react-native-webview';
import { useDispatch, useSelector } from "react-redux";
import AsyncStorageLib from '@react-native-async-storage/async-storage';
import { alert } from '../../../../reusables/Toasts';



export const TxDetails = (props)=>{
  const type = useSelector((state) =>  state.walletType)
  const[walletType, setWalletType] = useState()
const url = `https://testnet.bscscan.com/tx/${props.route.params.data.hash}`

console.log(props.route.params.data.hash)
useEffect(async()=>{
  AsyncStorageLib.getItem('walletType').then(async(Type)=>{

    if(JSON.parse(Type)=="Ethereum"){
      setWalletType('Ethereum')
    }else if(JSON.parse(Type)=="Matic"){
      setWalletType('Matic')
      
    }else if(JSON.parse(Type)=="Xrp"){
      setWalletType('Xrp')
      
    }
    else if(JSON.parse(Type)=="BSC"){
      setWalletType("BSC")
    }
    else if(JSON.parse(Type)=="Multi-coin"){
      if(props.route.params.data.chainType==='Eth'){
        setWalletType('Ethereum')
      }
      else if(props.route.params.data.chainType==='BSC'){
        setWalletType("BSC")

      }
      else if(props.route.params.data.chainType==='Matic'){
        setWalletType("Matic")

      }
      else{
        
        return alert('error',"no chainType found in multi-coin transaction. Error 404")
      }
    }
  })
},[])
    return (
    
   
        <View style={styles.container}>
        
        <WebView 
        source={{ uri: walletType=='Ethereum'?etherUrl:walletType=='Matic'?MaticUrl:walletType=='Xrp'?XrpUrl:url }}
        
        />
          </View>
      );

}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      marginTop:50,
      height:10,
    },
   content:{
  padding:40,
   },
   list:{
  marginTop:30,
   }
  });

