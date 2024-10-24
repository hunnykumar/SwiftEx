import { useEffect, useRef, useState } from "react";
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
  Image,
  Animated,
  Easing,
  FlatList,
  TextInput
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Modal from "react-native-modal";
import { useDispatch, useSelector } from "react-redux";
import { _getCurrencyOptions } from "./newAccount.model";
import { ShowErrotoast, Showsuccesstoast, alert } from "../../../../reusables/Toasts";
import { LinearGradient } from "react-native-linear-gradient";
import Icon from "../../../../../icon";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from '@react-navigation/native'
import { useIsFocused } from '@react-navigation/native';
import { EthereumSecret, smart_contract_Address,RPC, STELLAR_URL } from "../../../../constants";
import contractABI from './contractABI.json';
import { authRequest, GET, getToken, POST } from "../api";
import { REACT_APP_HOST, REACT_APP_LOCAL_TOKEN } from "../ExchangeConstants";
import darkBlue from "../../../../../../assets/darkBlue.png";
import Bridge from "../../../../../../assets/Bridge.png";
import Snackbar from "react-native-snackbar";
import { SET_ASSET_DATA } from "../../../../../components/Redux/actions/type";
import { useToast } from "native-base";
import { Exchange_screen_header } from "../../../../reusables/ExchangeHeader";
const Web3 = require('web3');
const StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();
const alchemyUrl = RPC.ETHRPC;
const server = new StellarSdk.Server(STELLAR_URL.URL);
export const NewOfferModal = () => {
  const toast=useToast();
  const dispatch_=useDispatch();
  const [chooseSearchQuery, setChooseSearchQuery] = useState('');
  // const back_data=useRoute();
  // const { user, open, getOffersData, onCrossPress }=back_data.params;
  const isFocused = useIsFocused();
  const state = useSelector((state) => state);
  const [ALL_STELLER_BALANCES,setALL_STELLER_BALANCES]=useState([]);
  const [loading, setloading] = useState(false)
  const [show, setshow] = useState(false)
  const [activ,setactiv]=useState(false);
  const [selectedValue, setSelectedValue] = useState("USDC");
  const [SelectedBaseValue, setSelectedBaseValue] = useState("native");
  const [Balance, setbalance] = useState('');
  const [offer_amount, setoffer_amount] = useState('');
  const [offer_price, setoffer_price] = useState('');
  const [AssetIssuerPublicKey, setAssetIssuerPublicKey] = useState("GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN");
  const [route, setRoute] = useState("SELL");
  const [Loading, setLoading] = useState(false);
  const [open_offer, setopen_offer] = useState(false);
  const [show_trust_modal,setshow_trust_modal]=useState(false);
  const [loading_trust_modal,setloading_trust_modal]=useState(false);
  const [u_email,setemail]=useState('');
  const [titel,settitel]=useState("UPDATING..");
  // const [PublicKey, setPublicKey] = useState("GBHRHA3KGRJBXBFER7VHI3WS5SKUXOP5TQ3YITVD7WJ2D3INGK62FZJR");
  // const [SecretKey, setSecretKey] = useState("SB2IR7WZS3EDS2YEJGC3POI56E5CESRZPUVN72DWHTS4AACW5OYZXDTZ");
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
  const slipage=[{data:"25%"},{data:"50%"},{data:"75%"},{data:"100%"}]
const [eth_modal_visible,seteth_modal_visible]=useState(false);
const [eth_modal_amount,seteth_modal_amount]=useState("");
const [eth_modal_load,seteth_modal_load]=useState(false);
const [account_message,setaccount_message]=useState('');
const [info_amount,setinfo_amount]=useState(false);
const [info_price,setinfo_price]=useState(false);
const [info_,setinfo_]=useState(false);
const [isVisible, setIsVisible] = useState(true);
const [modalContainer_menu,setmodalContainer_menu]=useState(false);
const [chooseModalPair,setchooseModalPair]=useState(false);
const [total_price,settotal_price]=useState(0);
const [total_price_info,settotal_price_info]=useState(false);



const getAccountDetails = async () => {
      const storedData = await AsyncStorageLib.getItem('myDataKey');
      const parsedData = JSON.parse(storedData);
      const matchedData = parsedData.filter(item => item.Ether_address === state.wallet.address);
      console.log('Retrieved data:', matchedData);
      const publicKey = matchedData[0].publicKey;
    try {
      const { res, err } = await authRequest("/users/getUserDetails", GET);
      // console.log("_+++++++",res.email)
      setPostData({
        email: res.email,
        publicKey: publicKey,
      })
      setemail(res.email);
      if (err) return setMessage(` ${err.message} please log in again!`);

    } catch (err) {
      //console.log(err)
      setMessage(err.message || "Something went wrong");
    }
};

const chooseItemList = [
  { id: 1, name: "XLM/USDC" ,base_value:"USDC",counter_value:"native",visible_0:"XLM",visible_1:"USDC",asset_dom:"steller.org",asset_dom_1:"centre.io"},
  // { id: 2, name: "USDC/XLM" ,base_value:"native",counter_value:"USDC",visible_0:"USDC",visible_1:"XLM",asset_dom:"centre.io",asset_dom_1:"steller.org"},
  // { id: 2, name: "ETH/USDC" ,base_value:"USDC",counter_value:"native",visible_0:"ETH",visible_1:"USDC",asset_dom:"allbridge.io",asset_dom_1:"allbridge.io"},
  // { id: 3, name: "BNB/XLM" ,base_value:"native",counter_value:"USDC",visible_0:"BNB",visible_1:"XLM",asset_dom:"allbridge.io",asset_dom_1:"allbridge.io"},
  // { id: 4, name: "SWIFTEX/XLM" ,base_value:"native",counter_value:"USDC",visible_0:"SWIFTEX",visible_1:"XLM",asset_dom:"swiftex",asset_dom_1:"steller.org"},
  // { id: 5, name: "ETH/XLM" ,base_value:"native",counter_value:"USDC",visible_0:"ETH",visible_1:"XLM",asset_dom:"allbridge.io",asset_dom_1:"steller.org"},
  // { id: 6, name: "USDC/ETH" ,base_value:"native",counter_value:"USDC",visible_0:"USDC",visible_1:"ETH",asset_dom:"allbridge.io",asset_dom_1:"allbridge.io"},

]
const chooseItemList_1 = [
  {id:1,name:"BUY"},
  {id:1,name:"SELL"},
]
const [visible_value, setvisible_value] = useState(chooseItemList[0].name);
const [top_value,settop_value]=useState(chooseItemList[0].visible_0)
const [top_value_0,settop_value_0]=useState(chooseItemList[0].visible_1)
const [top_domain,settop_domain]=useState(chooseItemList[0].asset_dom)
const [top_domain_0,settop_domain_0]=useState(chooseItemList[0].asset_dom_1)
const chooseFilteredItemList = chooseItemList.filter(
  item => item.name.toLowerCase().includes(chooseSearchQuery.toLowerCase())
);
const chooseRenderItem = ({ item }) => (
  <TouchableOpacity onPress={() => { setRoute("SELL"),setvisible_value(item.name),settop_value(item.visible_0),settop_domain(item.asset_dom),settop_domain_0(item.asset_dom_1),settop_value_0(item.visible_1),setSelectedValue(item.base_value),setSelectedBaseValue(item.counter_value),setchooseModalPair(false)}} style={[styles.chooseItemContainer,{
    borderBottomWidth:0.9,
    borderBlockEndColor: '#fff',
    paddingVertical:hp(1.5)
  }]}>
    <Text style={styles.chooseItemText}>{item.name}</Text>
  </TouchableOpacity>
);
const chooseRenderItem_1 = ({ item }) => (
  <TouchableOpacity onPress={() => {setRoute(item.name),reves_fun(top_value, top_value_0),setopen_offer(false)}} style={[styles.chooseItemContainer,{backgroundColor:item.name==="BUY"?"green":"red",borderRadius:15,height:hp(8),justifyContent:"center"}]}>
    <Text style={[styles.chooseItemText,{marginLeft:5,fontWeight:"500"}]}>{item.name}</Text>
  </TouchableOpacity>
);
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
    const temp_amount=parseInt(offer_amount);
    const temp_offer_price=parseInt(offer_price);
   if(temp_amount<=0||temp_offer_price<=0)
   {
    setLoading(false);
    ShowErrotoast(toast,"Invalid value");

   }else{
     const sourceKeypair = StellarSdk.Keypair.fromSecret(SecretKey);
    console.log("Sell Offer Peram =>>>>>>>>>>>>", offer_amount, offer_price, SecretKey, AssetIssuerPublicKey)
    try {
      const account = await server.loadAccount(sourceKeypair.publicKey());
   const base_asset_sell = SelectedBaseValue==="native"?new StellarSdk.Asset.native():new StellarSdk.Asset(SelectedBaseValue, AssetIssuerPublicKey);
      const counter_asset_buy = selectedValue==="native"?new StellarSdk.Asset.native():new StellarSdk.Asset(selectedValue, AssetIssuerPublicKey);
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
      console.log('=> Sell Offer placed...',offerResult.hash);
      Save_offer(base_asset_sell, offer_amount, offer_price, "Sell", "Success", offerResult.hash);
      Showsuccesstoast(toast, "Sell offer created.");
      setLoading(false)
      // setOpen(false);
      return 'Sell Offer placed successfully';
    } catch (error) {
      console.error('Error occurred:', error.response ? error.response.data.extras.result_codes : error);
      const errMessage = error.response && error.response.data.extras ? 
      error.response.data.extras.result_codes.operations.join(', ') : 
      "An error occurred while creating the sell offer.";
      ShowErrotoast(toast,errMessage==="op_low_reserve"?SelectedBaseValue==="native"?"XLM low reserve in account":SelectedBaseValue +"low reserve in account":"Sell Offer not-created");
      setLoading(false)
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
   }
  }

  async function Buy() {
    const temp_amount=parseInt(offer_amount);
    const temp_offer_price=parseInt(offer_price);
   if(temp_amount<=0||temp_offer_price<=0)
   {
    setLoading(false);
    ShowErrotoast(toast,"Invalid value");

   }else{
    const sourceKeypair = StellarSdk.Keypair.fromSecret(SecretKey);
    console.log("Buy Offer Peram =>>>>>>>>>>>>", offer_amount, offer_price, SecretKey, AssetIssuerPublicKey)
    try {
      const account = await server.loadAccount(sourceKeypair.publicKey());
      const counter_asset_buy = SelectedBaseValue==="native"?new StellarSdk.Asset.native():new StellarSdk.Asset(SelectedBaseValue, AssetIssuerPublicKey);
      const  base_asset_sell= selectedValue==="native"?new StellarSdk.Asset.native():new StellarSdk.Asset(selectedValue, AssetIssuerPublicKey);
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
      console.log("++++++++++++++++++++++++++++",offerResult)
      console.log('=> Buy Offer placed...');
      Save_offer(counter_asset_buy, offer_amount, offer_price, "Buy", "Success", "1234");
      Showsuccesstoast(toast, "Buy offer created.")
      setLoading(false)
      // setOpen(false);
      return 'Sell Offer placed successfully';
    } catch (error) {
      const errMessage = error.response && error.response.data.extras ? 
      error.response.data.extras.result_codes.operations.join(', ') : 
      "An error occurred while creating the sell offer.";
      ShowErrotoast(toast,errMessage==="op_low_reserve"?SelectedBaseValue==="native"?"XLM low reserve in account":SelectedBaseValue +"low reserve in account":"Buy offer not-created.");
      setLoading(false)
      console.error('Error occurred:', error.response ? error.response.data.extras.result_codes : error);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  }




  async function getAssetIssuerId(_code) {
    try {
      const account = await server.loadAccount(PublicKey);

      account.balances.forEach((balance) => {
        if (_code === balance.asset_code) {
          // setAssetIssuerPublicKey(balance.asset_issuer)
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
        setPublicKey(state.STELLAR_PUBLICK_KEY)
        setSecretKey(state.STELLAR_SECRET_KEY)
    } catch (error) {
      console.error('Error getting data for key steller keys:', error);
    }
  };
  

  const get_stellar = async (asset) => {
    try {
      console.log("",ALL_STELLER_BALANCES)

              ALL_STELLER_BALANCES.forEach(balance => {
                if (asset==="native"?balance.asset_type === asset:balance.asset_code === asset) {
                  setactiv(false)
                  setbalance(balance.balance)
                  setshow_bal(true)
                }
                if(!ALL_STELLER_BALANCES.some((obj) => obj.hasOwnProperty('asset_code')))
                {
                  setshow_trust_modal(true)
                }
              });
    } catch (error) {
      console.log("Error in get_stellar")
      Showsuccesstoast(toast, "Please wait account is updating....");
      setshow(false)
    }
  }

  const offer_creation = () => {
    const temp_amount=parseInt(offer_amount);
   if(temp_amount>=Balance)
    {
      ShowErrotoast(toast,"Insufficient Balance");
      setLoading(false)
    }
    else{
      if(selectedValue==="USDC"||selectedValue==="XLM")
    {
    getData();
    if (titel!=="Activate Stellar Account for trading" && offer_amount !== "" && offer_price !== ""&& offer_amount !== "0"&& offer_price !== "0"&& offer_amount !== "."&& offer_price !== "."&& offer_amount !== ","&& offer_price !== ",") {
      { route === "SELL" ? Sell() : Buy() }
    }
    else {
      titel==="Activate Stellar Account for trading"? ShowErrotoast(toast,"Activation Required"): ShowErrotoast(toast,"Input Correct Value.")
      setLoading(false)
    }
    }
    else{
      setLoading(false)
      Showsuccesstoast(toast, "Available Soon.")
    }
    }
  }
  const active_account=async()=>{
    console.log("<<<<<<<clicked");
    // const token = await AsyncStorageLib.getItem(LOCAL_TOKEN);
    const token = await getToken();
    console.log(token)
  try {
    const storedData_1 = await AsyncStorageLib.getItem('myDataKey');
      const parsedData = JSON.parse(storedData_1);
      const matchedData = parsedData.filter(item => item.Ether_address === state.wallet.address);
      console.log('Retrieved data:', matchedData);
      const publicKey = matchedData[0].publicKey;
    const storedData = await AsyncStorageLib.getItem('user_email');
    const postData={
      email: storedData,
      publicKey: publicKey,
    }
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
      settitel("Activate Stellar Account for trading");
      ShowErrotoast(toast,"Internal server error.")
    }
  } catch (error) {
    settitel("Activate Stellar Account for trading");
    console.error('Network error:', error);
    ShowErrotoast(toast,"Something went worng.")
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
        get_stellar(SelectedBaseValue);

    } catch (error) {
        console.error(`Error changing trust for ${g_asset}:`, error);
    }
};

  const Account_active=async()=>{
    const data = await AsyncStorageLib.getItem('myDataKey');
        const parsedData = JSON.parse(data);
        const matchedData = parsedData.filter(item => item.Ether_address === state.wallet.address);
        const secretKey_Key = matchedData[0].secretKey;
    console.log("clicked")
    await changeTrust('XETH', secretKey_Key)
    .then(() => {
        return changeTrust('XUSD', secretKey_Key);
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
 
  useEffect(()=>{
    const fetch_ins = async () => {
      try {
        setloading_trust_modal(false)
        setshow_trust_modal(false);
        setactiv(false)
        setshow_bal(true)
        await get_stellar("native")
      } catch (error) {
        console.log("=-====#", error)
      }
    }
    fetch_ins()
  },[isFocused])
  useEffect(()=>{
    getAccountDetails();
    getData();
    get_stellar(SelectedBaseValue)
    getAssetIssuerId(selectedValue)

  },[isFocused])
  useEffect(() => {
    setALL_STELLER_BALANCES(state.assetData)
    getAccountDetails();
    setinfo_(false);
    setinfo_amount(false);
    setinfo_price(false);
    get_stellar(SelectedBaseValue)
    getAssetIssuerId(selectedValue)
    // eth_services()
  }, [show_bal,selectedValue, route,isFocused])

 useEffect(()=>{
   setTimeout(()=>{
    // setemail(user.email);
    getAccountDetails();
    // setPostData({
    //   email: u_email,
    //   publicKey: PublicKey,
    // })
    seteth_modal_amount('');
    // console.log("MAIL:===",u_email)
   },1000)
 },[selectedValue, route,isFocused])

//  useEffect(() => {
//    const intervalId = setInterval(() => {
//      setIsVisible((prevVisible) => !prevVisible);
//    }, 1000); // Toggle every 1000 milliseconds (1 second)

//    return () => clearInterval(intervalId);
//  }, []);

 const onChangename = (input) => {
  const formattedInput = input.replace(/[,\s-]/g, '');
  setoffer_price(formattedInput);
};

const onChangeamount = (input) => {
  const formattedInput = input.replace(/[,\s-]/g, '');
  setoffer_amount(formattedInput)
};

const animation = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.loop(
    Animated.timing(animation, {
      toValue: 1,
      duration: 1500,
      easing: Easing.linear,
      useNativeDriver: false,
    })
  ).start();
}, []);

const reves_fun=async(fist_data,second_data)=>{
  settop_value_0(fist_data)
  settop_value(second_data)
  settop_domain(top_domain_0);
  settop_domain_0(top_domain)
  setSelectedValue(SelectedBaseValue)
  setSelectedBaseValue(selectedValue)
}


const change_Trust_New = async () => {
  setloading_trust_modal(true)
  try {
      console.log(":++++ Entered into trusting ++++:")
      const server = new StellarSdk.Server(STELLAR_URL.URL);
      StellarSdk.Network.useTestNetwork();
      const account = await server.loadAccount(StellarSdk.Keypair.fromSecret(state.STELLAR_SECRET_KEY).publicKey());
      const transaction = new StellarSdk.TransactionBuilder(account, {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase: StellarSdk.Network.current().networkPassphrase,
      })
          .addOperation(
              StellarSdk.Operation.changeTrust({
                  asset: new StellarSdk.Asset("USDC", "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"),
              })
          )
          .setTimeout(30)
          .build();
      transaction.sign(StellarSdk.Keypair.fromSecret(state.STELLAR_SECRET_KEY));
      const result = await server.submitTransaction(transaction);
      console.log(`Trustline updated successfully`);
      Snackbar.show({
          text: 'USDC added successfully',
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor:'green',
      });
      server.loadAccount(state.STELLAR_PUBLICK_KEY)
          .then(account => {
              console.log('Balances for account:', state.STELLAR_PUBLICK_KEY);
              account.balances.forEach(balance => {
                setloading_trust_modal(false)
                setshow_trust_modal(false)
                  dispatch_({
                      type: SET_ASSET_DATA,
                      payload: account.balances,
                    })
              });
              navigation.goBack()
          })
          .catch(error => {
              console.log('Error loading account:', error);
              setloading_trust_modal(false)
              Snackbar.show({
                  text: 'USDC faild to added',
                  duration: Snackbar.LENGTH_SHORT,
                  backgroundColor:'red',
              });
          });
  } catch (error) {
      console.error(`Error changing trust:`, error);
      Snackbar.show({
          text: 'USDC faild to added',
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor:'red',
      });
  }
};


  return (
   
    <>
    <Exchange_screen_header title="Trade" onLeftIconPress={() => navigation.goBack()} onRightIconPress={() => console.log('Pressed')} />
      <View
        style={{
          backgroundColor: "#011434",
          flex:1
        }}
      >
      

      <View
      style={{
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        marginTop: 19,
        marginLeft: 6
      }}
    >
      <View style={{ flex: 1, alignItems: "flex-end", paddingRight: 10 }}>
        <Text style={{ fontSize: 24, color: "#fff" }}>{top_value}</Text>
        <Text style={{ fontSize: 10, color: "gray" }}>{top_domain}</Text>
      </View>
      <View style={{ flex: 0 }}>
        <Icon
          name="swap-horizontal"
          type="materialCommunity"
          color="rgba(129, 108, 255, 0.97)"
          size={29}
          // onPress={() => { reves_fun(top_value, top_value_0); }}
        />
      </View>
      <View style={{ flex: 1, alignItems: "flex-start", paddingLeft: 10 }}>
        <Text style={{ fontSize: 24, color: "#fff" }}>{top_value_0}</Text>
        <Text style={{ fontSize: 10, color: "gray" }}>{top_domain_0}</Text>
      </View>
    </View>
       
       <View style={{flexDirection:"row",justifyContent:"space-between",padding:Platform.OS==="android"?10:19}}>
       <View style={{ width: '40%', marginTop: 19 }}>
                <Text style={{color:"#fff",fontSize:21,textAlign:"center",marginLeft:Platform.OS==="android"&&30}}>{Platform.OS==="android"?"Trading Pair":"Trading Pair"}</Text>
                <TouchableOpacity  style={Platform.OS === "ios" ? { marginTop: 10, width: '90%', borderColor:"'rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",borderWidth:1, marginLeft: 15,paddingVertical:7.6,alignItems:"center",borderRadius:6 } : { height:hp(4),marginTop: 13, width: "90%", color: "white", marginLeft:30,borderColor:"'rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",borderWidth:1,justifyContent:"center",alignItems:"center",borderRadius:5 }} onPress={()=>{setchooseModalPair(true)}}>
                  <Text style={{fontSize:15,color:"#fff"}}>{top_value+"/"+top_value_0}</Text>
                </TouchableOpacity>
                
                <Modal
        animationType="slide"
        transparent={true}
        visible={chooseModalPair}
      >
        <TouchableOpacity style={styles.chooseModalContainer} onPress={() => setchooseModalPair(false)}>
          <View style={styles.chooseModalContent}>
          <Text style={styles.chooseItem_text}>Select Trading Pair</Text>
            {/* <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={"gray"}
              onChangeText={text => setChooseSearchQuery(text)}
              value={chooseSearchQuery}
              autoCapitalize='none'
            /> */}
            <FlatList
              data={chooseFilteredItemList}
              renderItem={chooseRenderItem}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        </TouchableOpacity>
      </Modal>

              </View>

              <View style={{ width: '40%', marginTop: 19, }}>
                <Text style={{color:"#fff",fontSize:21,textAlign:"center"}}>Select Offer</Text>
                <TouchableOpacity style={{width:wp(29),height:hp(4),marginTop:hp(1.5),borderColor:"'rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",borderWidth:1,borderRadius:5,padding:3,marginLeft:wp(5),justifyContent:"center"}} onPress={()=>{
                  setopen_offer(open_offer?false:true)
                }}>
                  <Text style={{color:"#fff",fontSize:16,textAlign:"center"}}>{route}</Text>
                  <Modal
        animationType="slide"
        transparent={true}
        visible={open_offer}
      >
        <TouchableOpacity style={styles.chooseModalContainer} onPress={() => setopen_offer(false)}>
          <View style={[styles.chooseModalContent]}>
          <Text style={styles.chooseItem_text}>Select Offer</Text>
            <FlatList
              data={chooseItemList_1}
              renderItem={chooseRenderItem_1}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        </TouchableOpacity>
      </Modal>
                </TouchableOpacity>
                {/* <Picker
                  mode={"dropdown"}
                  selectedValue={route}
                  style={Platform.OS === "ios" ? { marginTop: -50, width: '120%', color: "white", marginLeft: -15 } : { marginTop: 3, width: "90%", color: "white", marginLeft: 14 }}
                  onValueChange={(itemValue, itemIndex) => setRoute(itemValue)}
                >
                  <Picker.Item label="BUY" value="BUY" color={Platform.OS === "ios" ? "white" : "black"} />
                  <Picker.Item label="SELL" value="SELL" color={Platform.OS === "ios" ? "white" : "black"} />
                </Picker> */}
              </View>
       </View>

        
        <View
          style={{
            display: "flex",
            alignItems: "center",
            marginTop:Platform.OS==="ios"?30:30
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

            

    <View style={{ flexDirection: "row",alignSelf:"center" }}>
              {activ===true?
              <TouchableOpacity style={styles.background_1}>
               <Animated.View style={[styles.frame_1, { borderColor: "gray" ,flexDirection:"row"}]}>
               <Text style={{color:'green',fontSize:19,textAlign:"center"}}>Updating.</Text>
               <ActivityIndicator color={"green"}/>
                </Animated.View>
                </TouchableOpacity>
                :
                <View style={{flexDirection:"row"}}><Text style={styles.balance}>Balance:</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: wp(9),marginLeft:1 }}>
                <Text style={styles.balance}>{Balance ? Number(Balance).toFixed(8) : 0.0} </Text></ScrollView>
                </View>
                }

                {/* { show === true ? selectedValue==="XETH"?<></>:<ActivityIndicator color={"green"} /> : <></>} */}
              </View>






              
            </View>

           
          </View>
         
          <View
            style={{
              display: "flex",
            }}
          >
            <View style={{width:wp(37),alignSelf:"center"}}>
            {Balance==="0.0000000"&&<Text style={{textAlign:"center",color:"red",borderColor:"red",borderWidth:1.9,borderRadius:10}}>Insufficient Balance</Text>}
            {/* {selectedValue==="XETH"||selectedValue==="XUSD"?<></>:<Text style={{textAlign:"center",color:"orange",borderColor:"orange",borderWidth:1.9,borderRadius:10}}>Available Soon</Text>} */}

            </View>
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
                      <Text style={{color:"white"}}>Offered Amount for {SelectedBaseValue==="native"?"XLM":SelectedBaseValue}</Text>
                    </View>:<></>}
             </View>
              <TextInput
                style={[styles.input,{backgroundColor:"#fff",color:"black",borderRadius:5}]}
                keyboardType="numeric"
                returnKeyType="done"
                value={offer_amount}
                placeholder={SelectedBaseValue==="native"?"Amount of XLM":"Amount of "+SelectedBaseValue}
                placeholderTextColor={"gray"}
                onChangeText={(text) => {
                  onChangeamount(text)
                  // setoffer_amount(text)
                  if (offer_amount > Balance) {
                    ShowErrotoast(toast, "Inputed Balance not found in account.");
                  }
                }}
                disabled={Balance==="0.0000000"||Balance==="0"}
                autoCapitalize={"none"}
              />
              <View style={{flexDirection:"row",paddingTop:10,marginTop:-10,width:"10%"}}>
                {slipage.map((list,index)=>{
                  return(
                    <TouchableOpacity style={styles.slipage_1} key={index}>
                      <Text style={{color:"#fff"}}>{list.data}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
              <View style={{flexDirection:"row"}}> 
              <Text style={styles.unitText}>Price</Text>
                <TouchableOpacity onPress={() => { info_price === false ? setinfo_price(true) : setinfo_price(false) }}>
                  <Icon
                    name={"information-outline"}
                    type={"materialCommunity"}
                    color={"rgba(129, 108, 255, 0.97)"}
                    size={21}
                    style={{ marginLeft: 10 }}
                  />
                </TouchableOpacity>
                {info_price === true ? <View style={{ backgroundColor: "gray", backgroundColor: "#212B53", padding: 3.6, borderRadius: 10, zIndex: 20, position: "absolute", marginStart: 70 }}>
                  <Text style={{ color: "white" }}>Offered Price for {selectedValue==="native"?"XLM":selectedValue}</Text>
                </View> : <></>}
              </View>
              <TextInput
                style={[styles.input,{backgroundColor:"#fff",color:"black",borderRadius:5}]}
                returnKeyType="done"
                keyboardType="numeric"
                value={offer_price}
                placeholder={"Price of " + route.toLocaleLowerCase()}
                placeholderTextColor={"gray"}
                onChangeText={(text) => {
                  onChangename(text)
                }}
                autoCapitalize={"none"}
                disabled={Balance === "0.0000000" || Balance === "0"}
              />

<View style={{flexDirection:"row"}}> 
              <Text style={styles.unitText}>Total</Text>
                <TouchableOpacity onPress={() => { total_price_info === false ? settotal_price_info(true) : settotal_price_info(false) }}>
                  <Icon
                    name={"information-outline"}
                    type={"materialCommunity"}
                    color={"rgba(129, 108, 255, 0.97)"}
                    size={21}
                    style={{ marginLeft: 10 }}
                  />
                </TouchableOpacity>
                {total_price_info === true ? <View style={{ backgroundColor: "gray", backgroundColor: "#212B53", padding: 3.6, borderRadius: 10, zIndex: 20, position: "absolute", marginStart: 70 }}>
                  <Text style={{ color: "white" }}>Total for {selectedValue==="native"?"XLM":selectedValue}</Text>
                </View> : <></>}
              </View>
              <Text style={[styles.input,{backgroundColor:"silver",borderTopLeftRadius:4,borderTopRightRadius:4,color:"black",paddingTop:5,paddingLeft:10,fontSize:19}]}>{offer_price*offer_amount}</Text>


            </View>

          </View>
        </View>

        <View style={styles.Buttons}>
        

              <TouchableOpacity
                activeOpacity={true}
                style={[{
                  alignItems: "center", paddingVertical: hp(1.3), paddingHorizontal: wp(1),
                },styles.confirmButton]}
                onPress={() => { setLoading(true), offer_creation() }}
                color="green"
                disabled={Loading||Balance==="0.0000000"}
              >
                <Text style={styles.textColor}>{Loading === true ? <ActivityIndicator color={"white"} /> :"Create Offer"}</Text>
              </TouchableOpacity>
            
          {loading ? (
            <ActivityIndicator size="small" color="blue" />
          ) : (
            <View></View>
          )}

        </View>
         
      </View>

      <Modal
          animationType="fade"
          transparent={true}
          visible={show_trust_modal}
          >
          <View style={styles.AccountmodalContainer}>
            <View style={styles.AccounsubContainer}>
              <Icon
                name={"alert-circle-outline"}
                type={"materialCommunity"}
                size={60}
                color={"orange"}
              />
              <Text style={styles.AccounheadingContainer}>Trust USDT by Center.io ?</Text>
              <View style={{ flexDirection: "row",justifyContent:"space-around",width:wp(80),marginTop:hp(3),alignItems:"center" }}>
                <TouchableOpacity disabled={loading_trust_modal} style={styles.AccounbtnContainer} onPress={() => {setshow_trust_modal(false),navigation.goBack()}}>
                   <Text style={styles.Accounbtntext}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity disabled={loading_trust_modal} style={styles.AccounbtnContainer} onPress={()=>{change_Trust_New()}}>
                   <Text style={styles.Accounbtntext}>{loading_trust_modal?<ActivityIndicator color={"green"}/>:"Trust"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    fontSize:16
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
    width: wp(30),
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
    marginVertical: hp(3),
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
    height: hp("8"),
    width: wp("12"),
    marginLeft: wp(14),
  },
  text_TOP: {
    color: "white",
    fontSize:19,
    fontWeight:"bold",
    alignSelf: "center",
    marginStart:wp(27)
  },
  text1_ios_TOP: {
    alignSelf:"center",
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      paddingTop:hp(3),
      
  },
  background_1: {
    // width: '8%',
    height: '100%',
    borderWidth: 2,
    borderColor: 'transparent',
    marginTop:15,
    marginBottom:5
  },
  frame_1: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding:10
  },
  text_1: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContainer_option_top: {
    // flex: 1,
    alignSelf:"flex-end",
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width:"100%",
    height:"60%",
  },
  modalContainer_option_sub:{
    alignSelf:"flex-end",
    backgroundColor: 'rgba(33, 43, 83, 1)',
  padding: 10,
  borderRadius: 10,
  width:"65%",
  height:"70%"
},
modalContainer_option_view:{
  flexDirection:"row",
  marginTop:25,
  alignItems:"center",
},
modalContainer_option_text:{
fontSize:20,
fontWeight:"bold",
color:"gray",
marginStart:5
},
chooseModalContainer: {
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'center',
  // backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
chooseModalContent: {
  backgroundColor: 'rgba(33, 43, 83, 1)',
  paddingVertical: 5,
  paddingHorizontal: 20,
  borderTopLeftRadius: 10,
  borderTopRightRadius:10,
  width: wp(99),
  maxHeight: '80%',
  borderColor: 'rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)',
  borderTopWidth:3,
},
chooseItem_text:{
  color:"#fff",
  fontSize:21,
  textAlign:"left",
  marginVertical:hp(2),
  fontWeight:"500"
},
searchInput: {
  height: 40,
  borderColor: 'gray',
  borderWidth: 1,
  marginBottom: 10,
  paddingHorizontal: 10,
  color:"#fff"
},
  chooseItemContainer: {
    marginVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  chooseItemText: {
    marginLeft: 10,
    fontSize: 19,
    color: '#fff',
  },
  slipage_1: {
    margin: 5,
    alignItems: "center",
    width: wp(15),
    borderColor: "'rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
    borderWidth: 1,
    borderRadius: 10,
    padding: 3,
    marginBottom:15
  },
  AccountmodalContainer: {
    width:wp(100),
    height:hp(100),
    marginLeft:-20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:"rgba(0,0,0,0.4)"
  },
  AccounsubContainer:{
    backgroundColor:"#131E3A",
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: "90%",
    height: "29%",
    justifyContent: "center",
    borderColor:"#4CA6EA",
    borderWidth:1
  },
  AccounbtnContainer:{
    width:wp(35),
    height:hp(5),
    backgroundColor:"rgba(33, 43, 83, 1)",
    alignItems:"center",
    justifyContent:"center",
    borderRadius:10,
    borderColor:"#4CA6EA",
    borderWidth:1
  },
  Accounbtntext:{
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff"
  },
  AccounheadingContainer:{
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#fff"
  }
});
