import React, { useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Modal from "react-native-modal";
import { alert } from "../reusables/Toasts";
import { Paste } from "../../utilities/utilities";
import Icon from "../../icon";
import { useDispatch, useSelector } from "react-redux";
import { STELLAR_URL } from "../constants";
import { RAPID_STELLAR, SET_ASSET_DATA } from "../../components/Redux/actions/type";
import { getEthBalance } from "../../components/Redux/actions/auth";
import * as StellarSdk from '@stellar/stellar-sdk';
import apiHelper from "../exchange/crypto-exchange-front-end-main/src/apiHelper";
import { REACT_APP_HOST } from "../exchange/crypto-exchange-front-end-main/src/ExchangeConstants";
const ImportStellarModal = ({
  setWalletVisible,
  Visible,
  onCrossPress
}) => {
  const state = useSelector((state) => state);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [secretkey, setsecretkey] = useState("");
  const [loadingAccount, setloadingAccount] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch()

const add_wallet=()=>{
    if(!secretkey)
    {
     alert("error","Secret Key Missing.");
    }
    else{
        storeData(secretkey)
    }
}
const storeData = async (secretKey) => {
        
    try {
      setloadingAccount(true);
      const data_1=await AsyncStorageLib.getItem('myDataKey');
      console.log('Data ',data_1);
      try {
        const keypair = StellarSdk.Keypair.fromSecret(secretKey);
        const publicKey = keypair.publicKey();
          const data = {
            Ether_address:state.wallet.address,
            key1: publicKey,
            key2: secretKey,
          };
          await storeData_marge(data.key1,data.key2,data.Ether_address)
      } catch (error) {
        setloadingAccount(false);
        console.error('Error storing data:', error);
        alert('error', "Account Not import yet.");
      }
    } catch (error) {
      setloadingAccount(false);
      console.error('Error clearing data:', error);
    }
   
};

const updateWallet=async(stellarAdd,WalletAdd)=>{
  const resultApi =await apiHelper.post(REACT_APP_HOST+'/v1/wallet', {
    "multiChainAddress":WalletAdd,
    "stellarAddress": stellarAdd,
    "isPrimary": true
  });
  console.log("result---result",resultApi)
  
  if (resultApi.success) {
     alert("success","wallet synced!");
  } else {
    alert("error","unable to sync wallet.");
    console.log('Error:', resultApi.error, 'Status:', resultApi.status);
  }
}

const storeData_marge = async (publicKey, secretKey, Ether_address) => {
  try {
    let userTransactions = [];
    const transactions = await AsyncStorageLib.getItem('myDataKey');
    if (transactions) {
      userTransactions = JSON.parse(transactions);
      if (!Array.isArray(userTransactions)) {
        userTransactions = [];
      }
    }

    const existingIndex = userTransactions.findIndex(
      (transaction) => transaction.Ether_address === Ether_address
    );

    if (existingIndex !== -1) {
      // Update existing transaction
      userTransactions[existingIndex].publicKey = publicKey;
      userTransactions[existingIndex].secretKey = secretKey;
    } else {
      // Add new transaction
      const newTransaction = {
        Ether_address,
        publicKey,
        secretKey,
      };
      userTransactions.push(newTransaction);
    }

    await AsyncStorageLib.setItem('myDataKey', JSON.stringify(userTransactions));
    console.log('Updated userTransactions:', userTransactions);
    alert('success', "Account Imported.");
    setWalletVisible(false);
    try {
      StellarSdk.Networks.PUBLIC
      const server = new StellarSdk.Horizon.Server(STELLAR_URL.URL);
      server.loadAccount(publicKey)
        .then(account => {
          dispatch({
            type: SET_ASSET_DATA,
            payload: account.balances,
          })
          account.balances.forEach(balance => {
          dispatch({
            type: RAPID_STELLAR,
            payload: {
              ETH_KEY:Ether_address,
              STELLAR_PUBLICK_KEY:publicKey,
              STELLAR_SECRET_KEY:secretKey,
              STELLAR_ADDRESS_STATUS:true
            },
          })
          dispatch(getEthBalance(Ether_address))
          console.log("==Dispacthed+Waller+success==")
          setloadingAccount(false);
          updateWallet(publicKey, Ether_address)
          // setTimeout(() => {
            navigation.navigate("Home");
          // }, 1000);
          });
        })
        .catch(error => {
          console.log('Error +loading +account:', error);
          dispatch({
            type: RAPID_STELLAR,
            payload: {
              ETH_KEY:Ether_address,
              STELLAR_PUBLICK_KEY:publicKey,
              STELLAR_SECRET_KEY:secretKey,
              STELLAR_ADDRESS_STATUS:false
            },
          })
          console.log("==Dispacthed+success==")
          console.log(':===ERROR +STELLER ACCOUNT NEED TO ACTIVATE===:');
          setloadingAccount(false);
          setTimeout(() => {
            navigation.navigate("Home");
          }, 1000);
        });
    } catch (error) {
      setloadingAccount(false);
      console.log("Error in +get_stellar")
    }
  } catch (error) {
    setloadingAccount(false);
    console.error('Error saving +payout:', error);
    throw error;
  }
};


  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
    >
      <Modal
        isVisible={Visible}
        onBackdropPress={() => setWalletVisible(false)}
        onBackButtonPress={() => setWalletVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver
        hideModalContentWhileAnimating
        style={style.modal}
      >
         <Animated.View style={[style.overlay]}>
        <View style={[style.Body, { backgroundColor: state.THEME.THEME ? "#242426" : "#F4F4F8" }]}>
        <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 30
          }}>
            <View style={{
              paddingHorizontal: 10,
              alignItems: "flex-start"
            }}>
              <Text style={[style.coinText, { color: state.THEME.THEME ? "#fff" : "black" }]}>Stellar Wallet</Text>
              <Text style={[style.coinSubText, { color: state.THEME.THEME ? "#AAAAAA" : "black" }]}>Import your wallet using your secret recovery key.</Text>
            </View>
            <Icon type={'entypo'} name='cross' color={"black"} size={24} style={[style.crossIcon, { backgroundColor: "#FFFFFF" }]} onPress={onCrossPress} />
          </View>

          <View style={style.infoCard}>
            <Icon type={'entypo'} name='info-with-circle' color={"#ECB742"} size={20} />
            <Text style={[style.coinSubText, { color: "#ECB742", marginLeft: 5 }]}>Never share this phrase. Enter it here only to recover your wallet.</Text>
          </View>

    <View style={[style.card, { backgroundColor: state.THEME.THEME === false ? "#FFFFFF" : "#1B1B1C" }]}>
          <View style={{flexDirection:"row",justifyContent:"space-between"}}>
           <Text style={[style.label, { color: state.THEME.THEME === false ? "#6C757D" : "#8B93A7" }]}>Secret Key</Text>
            <TouchableOpacity
              onPress={async () => {
                Paste(setsecretkey);
              }}
              style={{flexDirection:"row"}}
            >
              <Icon type={'material'} name='content-copy' color={"#5B65E1"} size={19} />
              <Text style={style.paste}> PASTE</Text>
            </TouchableOpacity>
           </View>
           <View style={[style.inputContainer, {
                         backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426",
                       }]}>
            <TextInput
              placeholder={"Enter your secret Key here"}
              placeholderTextColor={"gray"}
              style={{ color: state.THEME.THEME === false ?"black":"#fff" }}
              value={secretkey}
              onChangeText={(text) => {
                setsecretkey(text)
              }}
            />
            </View>
          </View>
          <TouchableOpacity style={[style.btn,{backgroundColor:loadingAccount?"gray":"#4052D6"}]} disabled={loadingAccount} onPress={()=>{add_wallet()}}>
            {loadingAccount?<ActivityIndicator color={"#4CA6EA"} size={"small"}/>:<Text style={{ color: "white" }}>Import</Text>}
          </TouchableOpacity>
        </View>
        </Animated.View>
      </Modal>
    </Animated.View>
  );
};

export default ImportStellarModal;

const style = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  overlay: {
    justifyContent: "flex-end",
  },
  Body: {
    width: wp(100),
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignSelf: "center",
    paddingHorizontal: 15,
  },
  Button: {
    marginTop: hp(0),
    display: "flex",
    flexDirection: "row",
    alignContent: "space-around",
    alignItems: "center",
  },
  input: {
    height: hp("5%"),
    marginBottom: hp("2"),
    color: "black",
    marginTop: hp("2"),
    width: wp("85"),
    paddingRight: wp("7"),
    backgroundColor: "white",
  },
  btn: {
    backgroundColor: "#4052D6",
    paddingVertical: hp(1.6),
    width: wp(90),
    alignSelf: "center",
    borderRadius: hp(1),
    alignItems: "center",
    marginVertical:hp(3)
  },
  paste: {
    fontSize:15,
    fontWeight:"500",
    color: "#5B65E1"
  },
 infoCard: {
    marginVertical: 15,
    backgroundColor: "#FEF6D8",
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center"
  },
  crossIcon: {
    marginTop:hp(-4),
    height: 31,
    width: 30,
    padding: 3,
    borderRadius: 30
  },
  coinText: {
    fontSize: 16,
    fontWeight: "500",
  },
  coinSubText: {
    fontSize: 13,
    fontWeight: "400",
  },
  card: {
    borderRadius: 16,
    padding: wp(3),
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: hp(1.5),
    letterSpacing: 0.3,
    paddingVertical:1.5
  },
  inputContainer: {
    alignItems: "flex-start",
    borderRadius: 12,
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
  },
});