import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Picker,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Button,
  Image
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Modal from "react-native-modal";
import { TextInput } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { _getCurrencyOptions } from "./newAccount.model";
import { alert } from "../../../../reusables/Toasts";
import { LinearGradient } from "react-native-linear-gradient";
import Icon from "../../../../../icon";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from '@react-navigation/native'
import { useIsFocused } from '@react-navigation/native';
import { EthereumSecret, smart_contract_Address,RPC } from "../../../../constants";
import contractABI from './contractABI.json';
import { authRequest, GET, getToken, POST } from "../api";
import { REACT_APP_HOST } from "../ExchangeConstants";
import darkBlue from "../../../../../../assets/darkBlue.png";
import { STELLAR_URL } from "./src/Dashboard/constants";
const Web3 = require('web3');
const StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();
const alchemyUrl = RPC.ETHRPC;
const server = new StellarSdk.Server(STELLAR_URL.URL);
export const NewOfferModal = () => {
  const back_data=useRoute();
  const { user, open, setOpen, getOffersData, onCrossPress }=back_data.params;
  const isFocused = useIsFocused();
  const state = useSelector((state) => state);
  const [loading, setloading] = useState(false)
  const [show, setshow] = useState(false)
  const [activ,setactiv]=useState(true);
  const [selectedValue, setSelectedValue] = useState("XUSD");
  const [Balance, setbalance] = useState('');
  const [offer_amount, setoffer_amount] = useState('');
  const [offer_price, setoffer_price] = useState('');
  const [AssetIssuerPublicKey, setAssetIssuerPublicKey] = useState("");
  const [route, setRoute] = useState("BUY");
  const [Loading, setLoading] = useState(false);
  const [u_email,setemail]=useState('');
  const [titel,settitel]=useState("Activate Stellar Account for trading");
  // const [PublicKey, setPublicKey] = useState("GCUOMNFW7YG55YHY5S5W7FE247PWODUDUZ4SOVZFEON47KZ7AXFG6D6A");
  // const [SecretKey, setSecretKey] = useState("SCJSKKPNYIZJSF6ROF7ZMVNXL6U6HVUA4RK4JLFDH6CLTNRCGZCUUU7S");
  const [PublicKey, setPublicKey] = useState("");
  const [SecretKey, setSecretKey] = useState("");
  const inActiveColor = ["#131E3A", "#131E3A"];
  const activeColor = ["rgba(70, 169, 234, 1)", "rgba(185, 116, 235, 1)"];
  const navigation = useNavigation()
  const [show_bal,setshow_bal]=useState(false);
  const [deposit_loading,setdeposit_loading]=useState(false);
  const [postData, setPostData] = useState({
    email: "",
    publicKey: "",
  });
const [eth_modal_visible,seteth_modal_visible]=useState(false);
const [eth_modal_amount,seteth_modal_amount]=useState("");
const [eth_modal_load,seteth_modal_load]=useState(false);
const [account_message,setaccount_message]=useState('');
const [info_amount,setinfo_amount]=useState(false);
const [info_price,setinfo_price]=useState(false);
const [info_,setinfo_]=useState(false);
const getAccountDetails = async () => {
    try {
      const { res, err } = await authRequest("/users/:id", GET);
      // console.log("_+++++++",res.email)
      setemail(res.email);
      if (err) return setMessage(` ${err.message} please log in again!`);

    } catch (err) {
      //console.log(err)
      setMessage(err.message || "Something went wrong");
    }
};
  ///////////////////////////////////start offer function
 const Save_offer = async (asset, amount, price, forTransaction, status, date) => {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>" + asset + amount + date);
    let userTransactions = [];

    try {
        const transactions = await AsyncStorageLib.getItem(`offer_data`);
        console.log(JSON.parse(transactions));

        const data = JSON.parse(transactions);

        if (data) {
            data.forEach((item) => {
                userTransactions.push(item);
            });

            console.log("Existing transactions:", userTransactions);

            let txBody = {
                asset,
                amount,
                price,
                forTransaction,
                status,
                date,
            };
            userTransactions.push(txBody);
            await AsyncStorageLib.setItem(`offer_data`, JSON.stringify(userTransactions));
        } else {
            let transactions = [];
            let txBody = {
                asset,
                amount,
                price,
                forTransaction,
                status,
                date,
            };
            transactions.push(txBody);

            await AsyncStorageLib.setItem(`offer_data`, JSON.stringify(transactions));

            userTransactions = transactions;
        }

        console.log("Updated userTransactions:", userTransactions);

        return userTransactions;
    } catch (error) {
        console.error("Error saving transaction:", error);
        throw error;
    }
};
  async function Sell() {
    const sourceKeypair = StellarSdk.Keypair.fromSecret(SecretKey);
    console.log("Sell Offer Peram =>>>>>>>>>>>>", offer_amount, offer_price, SecretKey, AssetIssuerPublicKey)
    try {
      const account = await server.loadAccount(sourceKeypair.publicKey());
      const base_asset_sell = new StellarSdk.Asset(selectedValue, AssetIssuerPublicKey);
      const counter_asset_buy = new StellarSdk.Asset(selectedValue === "XETH" ? "XUSD" : "XETH", AssetIssuerPublicKey);
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET
      })
      const offer = StellarSdk.Operation.manageOffer({
        selling: base_asset_sell,
        buying: counter_asset_buy,
        amount: offer_amount, // XETH to sell
        price: offer_price, // 1 XETH in terms of XUSD
        offerId: parseInt(0)
      });

      const offerTx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET
      })
        .addOperation(offer)
        .setTimeout(30)
        .build();
      offerTx.sign(sourceKeypair);
      const offerResult = await server.submitTransaction(offerTx);
      console.log('=> Sell Offer placed...');
      Save_offer(base_asset_sell, offer_amount, offer_price, "Sell", "Success", "1234");
      alert("success", "Sell offer created.");
      setLoading(false)
      setOpen(false);
      return 'Sell Offer placed successfully';
    } catch (error) {
      console.error('Error occurred:', error.response ? error.response.data.extras.result_codes : error);
      alert("error", "Sell Offer not-created.");
      setLoading(false)
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async function Buy() {
    const sourceKeypair = StellarSdk.Keypair.fromSecret(SecretKey);
    console.log("Buy Offer Peram =>>>>>>>>>>>>", offer_amount, offer_price, SecretKey, AssetIssuerPublicKey)
    try {
      const account = await server.loadAccount(sourceKeypair.publicKey());
      const base_asset_sell = new StellarSdk.Asset(selectedValue === "XETH" ? "XUSD" : "XETH", AssetIssuerPublicKey);
      const counter_asset_buy = new StellarSdk.Asset(selectedValue, AssetIssuerPublicKey);
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET
      })
      const offer = StellarSdk.Operation.manageOffer({
        selling: base_asset_sell,
        buying: counter_asset_buy,
        amount: offer_amount,
        price: offer_price,
        offerId: parseInt(0)
      });

      const offerTx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET
      })
        .addOperation(offer)
        .setTimeout(30)
        .build();
      offerTx.sign(sourceKeypair);
      const offerResult = await server.submitTransaction(offerTx);
      console.log('=> Buy Offer placed...');
      Save_offer(counter_asset_buy, offer_amount, offer_price, "Buy", "Success", "1234");
      alert("success", "Buy offer created.")
      setLoading(false)
      setOpen(false);
      return 'Sell Offer placed successfully';
    } catch (error) {
      alert("error", "Buy offer not-created.");
      setLoading(false)
      console.error('Error occurred:', error.response ? error.response.data.extras.result_codes : error);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }




  async function getAssetIssuerId(_code) {
    try {
      const account = await server.loadAccount(PublicKey);

      account.balances.forEach((balance) => {
        if (_code === balance.asset_code) {
          setAssetIssuerPublicKey(balance.asset_issuer)
          console.log("L:::::> ", AssetIssuerPublicKey)
        }
      });
    } catch (error) {
      console.log('Error loading account:', error);
    }
  }

  //////////////////////////////////end
  const getData = async () => {
    try {
      const storedData = await AsyncStorageLib.getItem('myDataKey');
      if (storedData !== null) {
        const parsedData = JSON.parse(storedData);
        console.log('Retrieved data:', parsedData);
        const publicKey = parsedData.key1
        const secretKey = parsedData.key2
        setPublicKey(publicKey)
        setSecretKey(secretKey)
      }
      else {
        console.log('No data found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
    }
  };

  const get_stellar = async (asset) => {
    try {
        // if(asset==="XUSD")
        // {
          setbalance("");
          setshow(true)
          console.log("<><", PublicKey)
          StellarSdk.Network.useTestNetwork();
          const server = new StellarSdk.Server(STELLAR_URL.URL);
          server.loadAccount(PublicKey)
            .then(account => {
              console.log('Balances for account:', PublicKey);
              account.balances.forEach(balance => {
                if (balance.asset_code === asset) {
                  console.log(`${balance.asset_code}: ${balance.balance}`);
                  setbalance(balance.balance)
                  setshow_bal(true)
                  setactiv(false)
                }
              });
              setshow(false)
            })
            .catch(error => {
              console.log('Error loading account:', error);
              // alert("error", "Account Balance not found.");
              setshow(false)
              setactiv(true)
            });
        // }
    } catch (error) {
      console.log("Error in get_stellar")
      alert("error", "Something went wrong.");
      setshow(false)
    }
  }

  const offer_creation = () => {
    getData();
    if (offer_amount !== "" && offer_price !== "") {
      { route === "SELL" ? Sell() : Buy() }
    }
    else {
      alert("error", "Empty input found.")
      setLoading(false)
    }
  }

  const active_account=async()=>{
    console.log("<<<<<<<clicked");
    
    // const token = await AsyncStorageLib.getItem(LOCAL_TOKEN);
    const token = await getToken();
    console.log(token)
  try {
        settitel("Activating.....");
    const response = await fetch(REACT_APP_HOST+'/users/updatePublicKeyByEmail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData),
    });

    const data = await response.json();
     if(data.success===true)
     {
      Account_active()
     }
    if (response.ok) {
      console.log("===",data.success);
    } else {
      console.error('Error:', data);
      setactiv(false)
      settitel("Activate Account");
      alert("error","Internal server error.")
    }
  } catch (error) {
    settitel("Activate Account");
    console.error('Network error:', error);
    alert("error","Something went worng.")
    setactiv(true)
  }
  
  }
  const changeTrust = async (g_asset, secretKey) => {
    try {
        settitel("Adding trust...")
        const account = await server.loadAccount(StellarSdk.Keypair.fromSecret(secretKey).publicKey());

        const transaction = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Network.current().networkPassphrase,
        })
            .addOperation(
                StellarSdk.Operation.changeTrust({
                    asset: new StellarSdk.Asset(g_asset, "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI"),
                })
            )
            .setTimeout(30)
            .build();

        transaction.sign(StellarSdk.Keypair.fromSecret(secretKey));

        const result = await server.submitTransaction(transaction);

        console.log(`Trustline updated successfully for ${g_asset}`);

    } catch (error) {
        console.error(`Error changing trust for ${g_asset}:`, error);
    }
};

  const Account_active=()=>{
    console.log("clicked")
    changeTrust('XETH', SecretKey)
    .then(() => {
        return changeTrust('XUSD', SecretKey);
    })
    .then(() => {
        console.log('Trustline updates for XETH and XUSD are complete.');
        setactiv(false)
    })
    .catch((error) => {
        console.error('Error:', error);
        setactiv(false)
    });
  }
 
  // for get user balance from smart contract.
  // async function deposited_Ether_in_smart()
  // {
  //   setshow(true);
  //   const web3 = new Web3(alchemyUrl);
  //   const contract = new web3.eth.Contract(contractABI, smart_contract_Address);
  //   // const addressToCheck = '0xd4787fFaa142c62280732afF7899B3AB03Ea0eAA';//for test ether account.
  //   const addressToCheck=PublicKey;
  //   contract.methods.reservedEth(addressToCheck).call()
  //       .then(balance => {
  //         setshow(false);
  //         const balanceInEth = web3.utils.fromWei(balance, 'ether');
  //         setbalance(balanceInEth);
  //       })
  //       .catch(error => {
  //         setshow(false);
  //           console.error('Error:-----', error);
  //       });        
  // }
  
  // const eth_services=()=>{
  //   selectedValue==="XUSD"?getData():
  //   setPublicKey(state.wallet.address);
  //   setactiv(false);
  //   deposited_Ether_in_smart();
  // }

//   const add_XETH=async()=>{
//     console.log("======= called")
//     const myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/json");
// myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZU51bWJlciI6Imh1bm55QGthdGNoaW50ZWNoLmNvbSIsIl9pZCI6IjY2MGNlMTgwMjFmN2VmMTZiMzYwYjAxOSIsImlhdCI6MTcxMjEyMDIxOSwiZXhwIjoxNzEyMzc5NDE5fQ.1oEqP79IoJBtApQ31JJ5O2MlSOCYX3dLwvkJycdOfdw");

// const raw = JSON.stringify({
//   "email": u_email,
//   "amount": eth_modal_amount
// });

// const requestOptions = {
//   method: "POST",
//   headers: myHeaders,
//   body: raw,
//   redirect: "follow"
// };

// fetch(REACT_APP_HOST+"/users/SendXETH", requestOptions)
//   .then((response) => response.text())
//   .then((result) => {
//     alert("success","XETH Recived");
//     console.log("===res get xeth===>",result)})
//   .catch((error) => console.error(error));
//   }

  // const Deposit_Eth=()=>{
  //   seteth_modal_visible(true)
  //   setdeposit_loading(true);

  //   // Platform.OS==='android'?handleOpenModal():  Alert.prompt(
  //   //   'Deposit Ether',
  //   //   'Please Enter Amount of Ether',
  //   //   (pin) => {
  //   //     if (!pin) {
  //   //       setdeposit_loading(false);
  //   //       alert("error","worng pin try agin.")
  //   //     } else {
  //   //       deposit_Ether(pin);
  //   //     }
  //   //   },
  //   //   'plain-text', 
  //   //   '',
  //   //   'numeric',
  //   // );
  // }

  /// service for deposit ether
  // async function deposit_Ether(offer_amount) {
  //   seteth_modal_load(true);
  //   // const PublicKey="0xd4787fFaa142c62280732afF7899B3AB03Ea0eAA";
  //   if(!offer_amount){
  //     alert("error","Input correct value.");
  //   seteth_modal_load(false);
  //   }
  //   else
  //   {
  //   const web3 = new Web3();
  //   setshow(true);
  //   const valueInWei = web3.utils.toWei(offer_amount, 'ether');
  //   try {
  //     const web3 = new Web3(new Web3.providers.HttpProvider(alchemyUrl));
  //         const contract = new web3.eth.Contract(contractABI, smart_contract_Address);
  //         const txData = contract.methods.depositEth(valueInWei).encodeABI();
      
  //         const nonce = await web3.eth.getTransactionCount(PublicKey);
  //         const txObject = {
  //           nonce: web3.utils.toHex(nonce),
  //           gasLimit: web3.utils.toHex(300000), 
  //           gasPrice: web3.utils.toHex(await web3.eth.getGasPrice()),
  //           to: smart_contract_Address,
  //           data: txData,
  //           value: web3.utils.toHex(valueInWei)
  //     };
  
  //     // const signedTx = await web3.eth.accounts.signTransaction(txObject, "9d9e1e7a8fdb0ed51a40a4c6b3e32c91f64615e37281150932fa1011d1a59daf");
  //     const signedTx = await web3.eth.accounts.signTransaction(txObject, state.wallet.privateKey);

  
  //     const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  //     setshow(false);
  //     // seteth_modal_amount('');
  //     alert("success","Ether Deposited.");
  //     setdeposit_loading(false);
  //     seteth_modal_load(false);
  //     console.log('Transaction hash:', txReceipt.transactionHash);
  //     console.log('Transaction from:', txReceipt.from);
  //     console.log('Transaction status:', txReceipt.status);
  //      if(txReceipt.status===true)
  //      {
  //        add_XETH();
  //      }
  //     // console.log('Transaction hash:', txReceipt.transactionHash);
  //     // console.log('Transaction receipt:', txReceipt);
  //   } catch (error) {
  //   seteth_modal_load(false);
  //     setshow(false);
  //     setLoading(false);
  //     setdeposit_loading(false);
  //     seteth_modal_amount('');
  //     alert("error",error);
  //     console.error('Error:', error);
  //   }
  // }
  // }
  useEffect(()=>{
    getAccountDetails();
    getData();
    get_stellar(selectedValue)
    getAssetIssuerId(selectedValue)
    setTimeout(()=>{
      // setemail(user.email);
      setPostData({
        email: u_email,
        publicKey: PublicKey,
      })
      console.log("MAIL:===",u_email)
     },1000)
  },[isFocused])
  useEffect(() => {
    getAccountDetails();
    setinfo_(false);
    setinfo_amount(false);
    setinfo_price(false);
    get_stellar(selectedValue)
    getAssetIssuerId(selectedValue)
    // eth_services()
  }, [show_bal,selectedValue, route,isFocused])

 useEffect(()=>{
   setTimeout(()=>{
    // setemail(user.email);
    getAccountDetails();
    setPostData({
      email: u_email,
      publicKey: PublicKey,
    })
    seteth_modal_amount('');
    console.log("MAIL:===",u_email)
   },1000)
 },[selectedValue, route,isFocused])

  return (
    // <Modal
    //   animationIn="slideInRight"
    //   animationOut="slideOutRight"
    //   animationInTiming={100}
    //   animationOutTiming={200}
    //   isVisible={open}
    //   useNativeDriver={true}
    //   useNativeDriverForBackdrop={true}
    //   backdropTransitionOutTiming={0}
    //   hideModalContentWhileAnimating
    //   onBackdropPress={() => {
    //     setOpen(false);
    //   }}
    //   onBackButtonPress={() => {
    //     setOpen(false);
    //   }}
    // >
    <>
    <View style={styles.headerContainer1_TOP}>
        <View
          style={{
            justifyContent: "space-around",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={() => navigation.navigate("/")}>
            <Icon
              name={"left"}
              type={"antDesign"}
              size={28}
              color={"white"}
            />
          </TouchableOpacity>
        </View>
      
        {Platform.OS === "android" ? (
          <Text style={styles.text_TOP}>Exchange</Text>
        ) : (
          <Text style={[styles.text_TOP, styles.text1_ios_TOP]}>Exchange</Text>
        )}
      
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Image source={darkBlue} style={styles.logoImg_TOP} />
        </TouchableOpacity>
      
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => {
              console.log('clicked');
              const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
              AsyncStorage.removeItem(LOCAL_TOKEN);
              navigation.navigate('exchangeLogin');
            }}
          >
            <Icon
              name={"logout"}
              type={"materialCommunity"}
              size={30}
              color={"#fff"}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View
        style={{
          backgroundColor: "#011434",
          flex:1
        }}
      >
        {/* <Icon type={'entypo'} name='cross' color={'gray'} size={24} style={styles.crossIcon} onPress={onCrossPress} /> */}
        <View style={[styles.toggleContainer]}>
          <LinearGradient
            colors={route == "BUY" ? activeColor : inActiveColor}
            style={{ borderRadius: 8 }}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
          >
            <Pressable
              activeOpacity={0.8}
              style={[
                styles.toggleBtn,
                route == "BUY"
                  ? { borderRadius: hp(4) }
                  : { borderRadius: null },
              ]}
              onPress={() => {
                setRoute("BUY");
                setoffer_amount("");
                setoffer_price("");
              }}
            >
              <Text style={[route == "BUY" ? { color: "#fff" } : { color: "#407EC9" }]}>BUY</Text>
            </Pressable>
          </LinearGradient>
          <LinearGradient
            style={{ borderRadius: 8 }}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            colors={route == "SELL" ? activeColor : inActiveColor}
          >
            <Pressable
              activeOpacity={0.8}
              style={[styles.toggleBtn2]}
              onPress={() => {
                setRoute("SELL");
                setoffer_amount("");
                setoffer_price("");
              }}>
              <Text style={[route == "SELL" ? { color: "#fff" } : { color: "#407EC9" }]}>SELL</Text>
            </Pressable>
          </LinearGradient>{
          }
        </View>
        <View
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <View
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: 'row', width: '60%' }}>
              <Text style={{ color: "white", fontSize: hp(2) }}>Account: </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: wp(3) }}>
                <Text style={{ color: "white", width: '100%', fontSize: hp(2) }}>{PublicKey}</Text>
              </ScrollView>
            </View>

            <View
              style={{
                display: "flex",
                alignSelf: "center",
              }}
            >

              <View style={{ flexDirection: "row" }}>
              {activ===true?<TouchableOpacity onPress={()=>{active_account()}}><View><Text style={{margin:10,color:'green',fontSize:19}}>{titel}</Text></View></TouchableOpacity>: <Text style={styles.balance}>Balance: {Balance ? Number(Balance).toFixed(8) : 0.0} </Text>}
                { show === true ? selectedValue==="XETH"?<></>:<ActivityIndicator color={"green"} /> : <></>}
              </View>
            </View>

            <View style={[styles.dropdownContainer, Platform.OS === "ios" ? styles.down : <></>]}>

              <View style={{ width: '30%', marginTop: 19 }}>
                <Text style={Platform.OS === "ios" ? [styles.assetText, styles.down_] : styles.assetText}>Select Asset</Text>
                <Picker
                  selectedValue={selectedValue}
                  style={Platform.OS === "ios" ? { marginTop: -60, width: '120%', color: "white", marginLeft: -25 } : { marginTop: 3, width: "140%", color: "white", marginLeft: -25 }}
                  onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
                >
                  <Picker.Item label="XUSD" value="XUSD" color={Platform.OS === "ios" ? "white" : "black"} />
                  <Picker.Item label="XETH" value="XETH" color={Platform.OS === "ios" ? "white" : "black"} />
                </Picker>
              </View>

              {/* <View style={{ width: '40%', marginTop: 19 }}>
                <View style={{flexDirection:"row"}}>
                <Text style={Platform.OS === "ios" ? [styles.currencyText, styles.down_] : styles.currencyText}> Curency</Text>
                </View>
                <Text style={Platform.OS === "ios" ? { marginTop: 35, width: '90%',color:"gray",fontSize:22,marginLeft:21 } : {marginTop: 16, width: '90%',color:"gray",fontSize:16,marginLeft:21 }}>{selectedValue==="XUSD"?"USD":"ETH"}</Text>
             
              </View> */}
              
                      </View>
          </View>
         
          <View
            style={{
              display: "flex",
            }}
          >
            <View style={styles.inputContainer}>
             <View style={{flexDirection:"row"}}>  
              <Text style={styles.unitText}>Amount</Text>
               <TouchableOpacity onPress={()=>{info_amount===false?setinfo_amount(true):setinfo_amount(false)}}>
               <Icon
                      name={"information-outline"}
                      type={"materialCommunity"}
                      color={"rgba(129, 108, 255, 0.97)"}
                      size={21}
                      style={{marginLeft:10}}
                    />
               </TouchableOpacity>
{info_amount===true?<View style={{backgroundColor:"gray",backgroundColor:"#212B53",padding:3.6,borderRadius:10,zIndex:20,position:"absolute",marginStart:95}}>
                      <Text style={{color:"white"}}>Offered Amount for {selectedValue}</Text>
                    </View>:<></>}
             </View>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={offer_amount}
                placeholder={"Amount of " + selectedValue}
                onChangeText={(text) => {
                  setoffer_amount(text)
                  if (offer_amount > Balance) {
                    alert("error", "Inputed Balance not found in account.");
                  }
                }}
                disabled={Balance==="0.0000000"||Balance==="0"}
                autoCapitalize={"none"}
              />
              <View style={{flexDirection:"row"}}> 
              <Text style={styles.unitText}>Price</Text>
              <TouchableOpacity onPress={()=>{info_price===false?setinfo_price(true):setinfo_price(false)}}>
               <Icon
                      name={"information-outline"}
                      type={"materialCommunity"}
                      color={"rgba(129, 108, 255, 0.97)"}
                      size={21}
                      style={{marginLeft:10}}
                    />
               </TouchableOpacity>
{info_price===true?<View style={{backgroundColor:"gray",backgroundColor:"#212B53",padding:3.6,borderRadius:10,zIndex:20,position:"absolute",marginStart:70}}>
                      <Text style={{color:"white"}}>Offered Price for {selectedValue}</Text>
                    </View>:<></>}
              </View>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={offer_price}
                placeholder={"Price of " + route.toLocaleLowerCase()}
                onChangeText={(text) => {
                  setoffer_price(text)
                }}
                autoCapitalize={"none"}
                disabled={Balance==="0.0000000"||Balance==="0"}
              />
            </View>

          </View>
        </View>

        <View style={styles.Buttons}>
          {/* <View style={styles.confirmButton}> */}
            {/* <LinearGradient
              style={styles.confirmButton}
              start={[1, 0]}
              end={[0, 1]}
              colors={["rgba(70, 169, 234, 1)", "rgba(185, 116, 235, 1)"]}
            > */}

              <TouchableOpacity
                activeOpacity={true}
                style={[{
                  alignItems: "center", paddingVertical: hp(1.3), paddingHorizontal: wp(1),
                },styles.confirmButton]}
                onPress={() => { setLoading(true), offer_creation() }}
                color="green"
              >
                <Text style={styles.textColor}>{Loading === true ? <ActivityIndicator color={"white"} /> : "Create"}</Text>
              </TouchableOpacity>
            {/* </LinearGradient> */}
          {/* </View> */}
          {loading ? (
            <ActivityIndicator size="small" color="blue" />
          ) : (
            <View></View>
          )}

        </View>
          {/* <Text style={styles.noteText}>{account_message}</Text> */}
        {/* <Text style={styles.noteText}>
          <Text style={{ fontWeight: "700" }}>Note:</Text> The above totals are
          just estimations that can vary depending on currency rates.
        </Text> */}
      </View>


    </>

  );
};

const styles = StyleSheet.create({
  input: {
    height: hp("5%"),
    marginBottom: hp("2"),
    marginTop: hp("1"),
    borderBottomWidth: 1,
    width: wp(80),
  },
  content: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "space-evenly",
    marginTop: hp("1"),
    color: "white",
  },
  addingText: {
    color: "#fff",
    fontSize: hp(3),
    borderRadius: 0,
    borderWidth: 0,
    marginVertical: hp(1),
    marginBottom: hp(5)
  },
  assetText: {
    color: "#fff",
    fontSize: hp(2),
    width: wp(25),
    marginLeft: -20,
  },
  currencyText: {
    color: "#fff",
    fontSize: hp(2),
    marginLeft: 7.6,

  },
  down_: {
    marginBottom: -16
  },
  dropdownText: {
    width: wp(28),
    borderColor: "#407EC9",
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
  },
  dropdownContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp(70),
  },
  down: {
    marginBottom: -69
  },
  unitText: {
    color: "#fff",
    fontSize: hp(2),
    marginTop: hp(0),
  },
  inputContainer: {
    marginRight: wp(0),
    marginTop: hp(1)
  },
  balance: {
    color: "#fff",
    textAlign: "center",
    marginVertical: hp(2),
    fontSize: hp(2),
  },
  textColor: {
    color: "#fff",
  },
  noteText: {
    color: "#fff",
    marginVertical: hp(3),
    marginHorizontal: wp(17),
    width: wp(58),
    color:"orange"
  },
  confirmButton: {
    alignItems: "center",
    width: wp(23),
    borderRadius:10,
    borderRadius: 9,
    backgroundColor:"#212B53",
    borderColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
    borderWidth:0.9,
  },
  cancelButton: {
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth * 1,
    borderColor: "green",
    width: wp(23),
    paddingVertical: hp(0.7),
    borderRadius: 6,
    backgroundColor: 'green',
  },
  BuyButton: {
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth * 1,
    borderColor: "green",
    width: wp(23),
    paddingVertical: hp(1),
    borderRadius: 6,
    margin: 1,
    marginTop: 48,
    backgroundColor: 'green',
    height: 40
  },
  Buttons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(3),
    justifyContent: "center",
    alignSelf: "center",
    width: wp(100),
  },
  cancelText: {
    color: "white",
  },
  crossIcon: {
    alignSelf: "flex-end",
    padding: hp(1)
  },
  toggleContainer: {
    alignSelf: "center",
    marginVertical: hp(4),
    borderColor: "#407EC9",
    borderWidth: StyleSheet.hairlineWidth * 1,
    flexDirection: "row",
    borderRadius: 8,
  },
  toggleBtn: {
    width: wp(43),
    justifyContent: "space-around",
    alignItems: "center",
    height: hp(6),
    flexDirection: "row",
    alignSelf: "center",
  },
  toggleBtn2: {
    width: wp(43),
    height: hp(6),
    borderRadius: 8,
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "center",
  },
  headerContainer1_TOP: {
    backgroundColor: "#4CA6EA",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    width: wp(100),
    paddingHorizontal: wp(2),
  },
  logoImg_TOP: {
    height: hp("9"),
    width: wp("12"),
    marginLeft: wp(14),
  },
  text_TOP: {
    color: "white",
    fontSize:19,
    fontWeight:"bold",
    alignSelf: "center",
    marginStart:wp(30)
  },
  text1_ios_TOP: {
    color: "white",
    fontWeight: "700",
    alignSelf: "center",
    marginStart: wp(31),
    top:19,
    fontSize:17
  }
});

