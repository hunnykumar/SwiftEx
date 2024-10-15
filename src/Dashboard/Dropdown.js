import { Dropdown } from 'react-native-element-dropdown';
import { StyleSheet, Text, View, Image, TextInput, FlatList, TouchableOpacity, Alert, LayoutAnimation, Platform, UIManager  } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { setCurrentWallet } from '../components/Redux/actions/auth';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import AsyncStorageLib from '@react-native-async-storage/async-storage';



export const DropdownComponent =()=>{
    const state =  useSelector( (state) =>  state)
    const walletState = useSelector((state) =>  state.wallets)
    const [wallet, getWallet] = useState(walletState?walletState:[])
    const[Data, setData]= useState([])
    const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(false);

    const dispatch = useDispatch();
    let wallets = []
  var WalletData=[]

    const getWallets =async()=>{
  
   
      wallets.push(state.wallets)
      try{
        let data =[]
        const user= await AsyncStorageLib.getItem('user')
        const wallets = await AsyncStorageLib.getItem(`${user}-wallets`)
        console.log(wallets)
        //console.log(user)    
    
         if(wallets[0]){
          
          data.push(wallets)
            console.log(JSON.parse(data))
            await state.wallets?await state.wallets.map( (item)=>{
              return(
                console.log(item.name),
                WalletData.push({label: item.name, value: item.address, privateKey: item.privateKey}),
                console.log(WalletData),
                setData(WalletData)
                )
                
                
              }):JSON.parse(data).map( (item)=>{
                return(
                  console.log(item.name),
                  WalletData.push({label: item.name, value: item.address, privateKey: item.privateKey}),
                  console.log(WalletData),
                  setData(WalletData)
                  )
                  
                  
                })
            
            }
       }catch(error){
         console.log(error)
       }
       }
 useEffect(()=>{
    try{

        getWallets()
     }catch(error){
       console.log(error)
       
       alert('no wallets found. Make sure you have the file with private keys saved in your device')
     }
 },[])     

    return(
        <View style={styles.container}>
            <Text style={styles.label}>
          My Wallets
        </Text>
        <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={Data}
        search
        maxHeight={200}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? state.wallet.name ?state.wallet.name :'select Wallet': 'Select wallet'}
        searchPlaceholder="Search..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={async (item) => {
          console.log(item.label)
          setValue(item.value);
          setIsFocus(false);

          try{
           await dispatch(setCurrentWallet(item.value, item.label, item.privateKey))
          .then( (response) => {
            if(response){
           //console.log(response)
           alert(`Wallet selected :${item.label}`)
          }
          else{
            alert('failed to select wallet. please try again')
          }
            
            
          })
          .catch((error) => {
            
            console.log(error)
            alert('failed to select wallet. please try again')
            
          });
   
          }catch(e){
            alert('failed to select wallet')
          }
        }}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={isFocus ? 'blue' : 'white'}
            name="Safety"
            size={20}
          />
        )}
      />
    </View>
     
    )
}

const styles=StyleSheet.create({
    profile:{
     borderWidth:1,
     borderColor:'red',
     width:wp('15.1'),
     height:hp('7.7'),
     marginTop:hp('5'),
     marginRight:wp('5'),
     borderRadius:10
    },
    profileText:{
      color:'white',
      fontWeight:'bold',
      marginTop:hp('1'),
      marginLeft:wp('3')
    },
    text:{
  bottom:wp('35'),
  color:'white'
    },
    textDesign:{
  color:'white',
  fontStyle:'italic',
  fontWeight:'bold',
  marginLeft:wp('3')
    },
    textDesign2:{
      color:'white',
      fontWeight:'bold',
      marginLeft:wp('5')
        },
        textDesign3:{
          color:'white',
          fontWeight:'bold',
          marginLeft:wp('2')
            },
            textDesign4:{
              color:'white',
              fontWeight:'bold',
              marginLeft:wp('4')
                },
    buttons:{
      display:'flex',
      flexDirection:'row',
      justifyContent:'space-evenly',
      bottom:hp('16')
    },
    addButton: {
      display:'flex',
      paddingLeft:wp('4'),
      opacity:0.8,
      alignItems:'center',
      textAlign:'center',
      zIndex: 11,
      backgroundColor: 'grey',
      width: wp('15'),
      height: hp('6'),
      borderRadius: 45,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
    },
    addButton2: {
      position: 'absolute',
      zIndex: 11,
      left: 20,
      bottom: 90,
      backgroundColor: 'green',
      width: 80,
      height: 70,
      borderRadius: 35,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 8,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 18,
    },
    container: {
      backgroundColor: 'white',
      position:'absolute',
      padding:10,
      width:wp('50'),
      marginTop:hp('2'),
      marginLeft:wp('55'),
      color:'black'
    },
    dropdown: {
      height: hp('6'),
      width:wp('40'),
      borderColor: 'gray',
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
      marginTop:hp('1'),
      marginRight:20
    },
    icon: {
      marginRight: 5,
      backgroundColor:'blue'
    },
    label: {
      position: 'absolute',
      backgroundColor: 'white',
      left: wp('13'),
      zIndex: -999,
      paddingHorizontal: 8,
      fontSize: 14,
      color:'black',
      height:hp('3'),
      bottom:hp('8')
    },
    placeholderStyle: {
      fontSize: 16,
      color:'black'
    },
    selectedTextStyle: {
      fontSize: 11,
      color:'black'
    },
    iconStyle: {
      width: 20,
      height: 20,
      backgroundColor:'blue'
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
    
  
  
  })
  