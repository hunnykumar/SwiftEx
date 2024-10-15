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
            
            }       }catch(error){
         console.log(error)
       }
       }
 useEffect(async()=>{
    try{

       await getWallets()
     }catch(error){
       console.log(error)
       alert('no wallets found. Make sure you have the file with private keys saved in your device')
     }
 },[ state.wallets])     

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
        placeholder={!isFocus ? state.wallet.name ?state.wallet.name :'select Wallet' : 'Select wallet'}
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
    
    container: {
        backgroundColor: '#000C66',
        position:'absolute',
        padding:10,
        width:wp('50'),
        marginTop:hp('2'),
        marginLeft:wp('14')
      },
      dropdown: {
        height: hp('6'),
        width:wp('50'),
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginTop:hp('1'),
        marginRight:20
      },
      icon: {
        marginRight: 5,
      },
      label: {
        position: 'absolute',
        backgroundColor: '#000C66',
        left: wp('13'),
        zIndex: -999,
        paddingHorizontal: 8,
        fontSize: 14,
        color:'white',
        height:hp('3'),
        bottom:hp('8')
      },
      placeholderStyle: {
        fontSize: 16,
        color:'white'
      },
      selectedTextStyle: {
        fontSize: 11,
        color:'white'
      },
      iconStyle: {
        width: 20,
        height: 20,
        backgroundColor:'white'
      },
      inputSearchStyle: {
        height: 40,
        fontSize: 16,
      },
      
     
  
  
  })
  