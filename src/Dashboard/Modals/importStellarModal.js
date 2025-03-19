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
const StellarSdk = require('stellar-sdk');
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
      StellarSdk.Network.usePublicNetwork();
      const server = new StellarSdk.Server(STELLAR_URL.URL);
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
          setTimeout(() => {
            navigation.navigate("Home");
          }, 1000);
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


// const storeData_marge = async (publicKey,secretKey,Ether_address) => {
//   try {
//     let userTransactions = [];
//     const transactions = await AsyncStorageLib.getItem('myDataKey');
//     if (transactions) {
//       userTransactions = JSON.parse(transactions);
//       if (!Array.isArray(userTransactions)) {
//         userTransactions = [];
//       }
//     }
//     const newTransaction = {
//       Ether_address,
//       publicKey,
//       secretKey
//     };
//     userTransactions.push(newTransaction);
//     await AsyncStorageLib.setItem('myDataKey', JSON.stringify(userTransactions));
//     console.log('Updated userTransactions:', userTransactions);
//     alert('success',"Account Imported.");
//     setWalletVisible(false)
//     setTimeout(()=>{
//     navigation.navigate("Home")
//     },2000)
//   } catch (error) {
//     console.error('Error saving payout:', error);
//     throw error;
//   }
// };

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
    >
      <Modal
        animationIn="slideInRight"
        animationOut="slideOutRight"
        animationInTiming={500}
        animationOutTiming={650}
        isVisible={Visible}
        useNativeDriver={true}
        onBackdropPress={() => setWalletVisible(false)}
        onBackButtonPress={() => {
          setWalletVisible(false);
        }}
      >
        <View style={style.Body}>
          <Icon type={'entypo'} name='cross' color={'gray'} size={24} style={style.crossIcon} onPress={onCrossPress} />
          <Text style={style.coinText}>Stellar wallet</Text>
          <View style={style.inputView}>
            <TouchableOpacity
              onPress={async () => {
                Paste(setsecretkey);
              }}
            >
              <Text style={style.paste}>Paste</Text>
            </TouchableOpacity>
            <Text style={{color:"#4CA6EA"}}>Secret Key</Text>
            <TextInput
              placeholder={"Enter your secret Key here"}
              placeholderTextColor={"gray"}
              style={[style.input,{color:"black"}]}
              value={secretkey}
              onChangeText={(text) => {
                setsecretkey(text)
              }}
            />
          </View>
          <TouchableOpacity style={[style.btn,{backgroundColor:loadingAccount?"gray":"#4CA6EA"}]} disabled={loadingAccount} onPress={()=>{add_wallet()}}>
            {loadingAccount?<ActivityIndicator color={"#4CA6EA"} size={"small"}/>:<Text style={{ color: "white" }}>Import</Text>}
          </TouchableOpacity>
        </View>
      </Modal>
    </Animated.View>
  );
};

export default ImportStellarModal;

const style = StyleSheet.create({
  Body: {
    display: "flex",
    backgroundColor: "white",
    height: hp(75),
    width: wp(97),
    textAlign: "center",
    borderRadius: hp(1),
    alignSelf: "center",
    marginTop: hp(5)
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
    backgroundColor: "#4CA6EA",
    paddingVertical: hp(1.6),
    width: wp(90),
    alignSelf: "center",
    borderRadius: hp(1),
    alignItems: "center",
    marginTop:hp(10)
  },
  paste: { textAlign: "right", color: "#4CA6EA" },
  coinText: {
    textAlign: "center",
    marginTop: hp(1.5),
    fontSize: 15,
    fontWeight: "700",
    color:"black"
  },
  inputView: {
    borderWidth: 1,
    width: wp(90),
    alignSelf: "center",
    padding: 10,
    marginTop: hp(3),
    borderRadius: hp(1),
    borderColor: "#DADADA",
  },
  crossIcon: {
    alignSelf: "flex-end",
    padding: hp(1.5)
  }
});