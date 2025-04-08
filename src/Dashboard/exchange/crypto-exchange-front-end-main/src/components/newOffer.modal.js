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
  TextInput,
  KeyboardAvoidingView,
  StatusBar
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
import StellarAccountReserve from "../utils/StellarReserveComponent";
import { GetStellarAvilabelBalance, GetStellarUSDCAvilabelBalance } from "../../../../../utilities/StellarUtils";
import InfoComponent from "./InfoComponent";
import WalletActivationComponent from "../utils/WalletActivationComponent";
import CustomOrderBook from "../pages/stellar/CustomOrderBook";
import AMMSwap from "../pages/stellar/AMMSwap";
import InstentTradeHistory from "../pages/stellar/InstentTradeHistory";
const Web3 = require('web3');
const StellarSdk = require('stellar-sdk');
      StellarSdk.Network.useTestNetwork();
const alchemyUrl = RPC.ETHRPC;
const server = new StellarSdk.Server(STELLAR_URL.URL);
export const NewOfferModal = () => {
  const toast=useToast();
  const dispatch_=useDispatch();
  const [chooseSearchQuery, setChooseSearchQuery] = useState('');
  const back_data=useRoute();
  // const { user, open, getOffersData, onCrossPress }=back_data.params;
  const [activeTab, setActiveTab] = useState(0);
  const [activeTradeType, setactiveTradeType] = useState(0);
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
  const [route, setRoute] = useState("SELL");
  const [btnRoot, setbtnRoot] = useState(0);
  const [Loading, setLoading] = useState(false);
  const [open_offer, setopen_offer] = useState(false);
  const [show_trust_modal,setshow_trust_modal]=useState(false);
  const [tradeTrust,settradeTrust]=useState(false);
  const [usdcBidgeTrust,setusdcBidgeTrust]=useState(false);
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
  const [reserveLoading,setreserveLoading]=useState(false);
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
const [reservedError, setreservedError] = useState(false);
const [infoVisible,setinfoVisible]=useState("");
const [infotype,setinfotype]=useState("success");
const [infomessage,setinfomessage]=useState("");
const [assetInfo, setassetInfo] = useState(false);
const [ACTIVATION_MODAL_PROD,setACTIVATION_MODAL_PROD]=useState(false);
const messageShownRef = useRef(false);



const getAccountDetails = async () => {
      const storedData = await AsyncStorageLib.getItem('myDataKey');
      const parsedData = JSON.parse(storedData);
      const matchedData = parsedData.filter(item => item.Ether_address === state.wallet.address);
      console.log('Retrieved data:', matchedData);
      const publicKey = matchedData[0].publicKey;
    try {
      const { res, err } = await authRequest("/users/:id", GET);
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
const [amountSuggest, setamountSuggest] = useState([{ id: 1, amountSuggest: "25%" }, { id: 2, amountSuggest: "50%" }, { id: 3, amountSuggest: "75%" }, { id: 4, amountSuggest: "100%" },]);

const chooseItemList = [
  { id: 1, name: "XLM/USDC" ,base_value:"USDC",counter_value:"native",visible_0:"XLM",visible_1:"USDC",asset_dom:"steller.org",asset_dom_1:"centre.io",visible0Issuer:"native",visible1Issuer:"GALANI4WK6ZICIQXLRSBYNGJMVVH3XTZYFNIVIDZ4QA33GJLSFH2BSID"},
  { id: 2, name: "ETH/BTC" ,base_value:"BTC",counter_value:"ETH",visible_0:"ETH",visible_1:"BTC",asset_dom:"ultracapital.xyz",asset_dom_1:"ultracapital.xyz",visible0Issuer:"GALANI4WK6ZICIQXLRSBYNGJMVVH3XTZYFNIVIDZ4QA33GJLSFH2BSID",visible1Issuer:"GALANI4WK6ZICIQXLRSBYNGJMVVH3XTZYFNIVIDZ4QA33GJLSFH2BSID"},
  { id: 3, name: "ETH/USDC" ,base_value:"USDC",counter_value:"ETH",visible_0:"ETH",visible_1:"USDC",asset_dom:"ultracapital.xyz",asset_dom_1:"centre.io",visible0Issuer:"GALANI4WK6ZICIQXLRSBYNGJMVVH3XTZYFNIVIDZ4QA33GJLSFH2BSID",visible1Issuer:"GALANI4WK6ZICIQXLRSBYNGJMVVH3XTZYFNIVIDZ4QA33GJLSFH2BSID"},
  { id: 4, name: "BTC/ETH" ,base_value:"ETH",counter_value:"BTC",visible_0:"BTC",visible_1:"ETH",asset_dom:"ultracapital.xyz",asset_dom_1:"ultracapital.xyz",visible0Issuer:"GALANI4WK6ZICIQXLRSBYNGJMVVH3XTZYFNIVIDZ4QA33GJLSFH2BSID",visible1Issuer:"GALANI4WK6ZICIQXLRSBYNGJMVVH3XTZYFNIVIDZ4QA33GJLSFH2BSID"},
  { id: 5, name: "XLM/BTC" ,base_value:"BTC",counter_value:"native",visible_0:"XLM",visible_1:"BTC",asset_dom:"steller.org",asset_dom_1:"centre.io",visible0Issuer:"native",visible1Issuer:"GALANI4WK6ZICIQXLRSBYNGJMVVH3XTZYFNIVIDZ4QA33GJLSFH2BSID"},
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
const [AssetIssuerPublicKey, setAssetIssuerPublicKey] = useState(chooseItemList[0].visible0Issuer);
const [AssetIssuerPublicKey1, setAssetIssuerPublicKey1] = useState(chooseItemList[0].visible1Issuer);
const chooseFilteredItemList = chooseItemList.filter(
  item => item.name.toLowerCase().includes(chooseSearchQuery.toLowerCase())
);
const chooseRenderItem = ({ item }) => (
  <TouchableOpacity onPress={() => { setRoute("SELL"),setvisible_value(item.name),settop_value(item.visible_0),setAssetIssuerPublicKey(item.visible0Issuer),setAssetIssuerPublicKey1(item.visible1Issuer),settop_domain(item.asset_dom),settop_domain_0(item.asset_dom_1),settop_value_0(item.visible_1),setSelectedValue(item.base_value),setSelectedBaseValue(item.counter_value),setchooseModalPair(false)}} style={[styles.chooseItemContainer,{
    borderBottomWidth:0.9,
    borderBlockEndColor: '#fff',
    paddingVertical:hp(1.5)
  }]}>
    <Text style={styles.chooseItemText}>{item.name}</Text>
  </TouchableOpacity>
);
const chooseRenderItem_1 = ({ item }) => (
  <TouchableOpacity onPress={() => {setRoute(item.name),reves_fun(top_value, top_value_0, AssetIssuerPublicKey,AssetIssuerPublicKey1),setopen_offer(false)}} style={[styles.chooseItemContainer,{backgroundColor:item.name==="BUY"?"green":"red",borderRadius:15,height:hp(8),justifyContent:"center"}]}>
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
    const temp_amount=parseFloat(offer_amount);
    const temp_offer_price=parseFloat(offer_price);
    if (
      isNaN(parseFloat(temp_amount)) || 
      isNaN(parseFloat(temp_offer_price)) || 
      parseFloat(temp_amount) < 0.1 || 
      parseFloat(temp_offer_price) < 0.1
    ) {
      setLoading(false);
      ShowErrotoast(toast, "Invalid value");
    } 
    else{
     const sourceKeypair = StellarSdk.Keypair.fromSecret(SecretKey);
    console.log("Sell Offer Peram =>>>>>>>>>>>>", offer_amount, offer_price, SecretKey, AssetIssuerPublicKey,AssetIssuerPublicKey1)
    try {
      const account = await server.loadAccount(sourceKeypair.publicKey());
   const base_asset_sell = SelectedBaseValue==="native"?new StellarSdk.Asset.native():new StellarSdk.Asset(SelectedBaseValue, AssetIssuerPublicKey);
      const counter_asset_buy = selectedValue==="native"?new StellarSdk.Asset.native():new StellarSdk.Asset(selectedValue, AssetIssuerPublicKey1);
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
      // Save_offer(base_asset_sell, offer_amount, offer_price, "Sell", "Success", offerResult.hash);
      Showsuccesstoast(toast, "Sell offer created.");
      setLoading(false)
      // setOpen(false);
      navigation?.navigate("Offers")
      return 'Sell Offer placed successfully';
    } catch (error) {
      setoffer_amount('')
      setoffer_price('')
      console.error('Error occurred:---', error.response ? error.response.data.extras.result_codes : error);
      const errMessage = error.response && error.response.data.extras ? 
      error.response.data.extras.result_codes.operations.join(', ') : 
      "An error occurred while creating the sell offer.";
      ShowErrotoast(toast,errMessage==="op_low_reserve"||errMessage==="op_underfunded"?SelectedBaseValue==="native"?"XLM low reserve in account":SelectedBaseValue +"low reserve in account":errMessage==="op_cross_self"?"Account already has an active offer with an Opposing order":"Sell Offer not-created");
      setLoading(false)
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
   }
  }

  async function Buy() {
    const temp_amount=parseFloat(offer_amount);
    const temp_offer_price=parseFloat(offer_price);
    if (
      isNaN(parseFloat(temp_amount)) || 
      isNaN(parseFloat(temp_offer_price)) || 
      parseFloat(temp_amount) < 0.1 || 
      parseFloat(temp_offer_price) < 0.1
    ) {
      setLoading(false);
      ShowErrotoast(toast, "Invalid value");
    } else{
    const sourceKeypair = StellarSdk.Keypair.fromSecret(SecretKey);
    console.log("Buy Offer Peram =>>>>>>>>>>>>", offer_amount, offer_price, SecretKey, AssetIssuerPublicKey,AssetIssuerPublicKey1)
    try {
      const account = await server.loadAccount(sourceKeypair.publicKey());
      const counter_asset_buy = top_value==="XLM"?new StellarSdk.Asset.native():new StellarSdk.Asset(top_value_0, AssetIssuerPublicKey);
      const  base_asset_sell= top_value_0==="XLM"?new StellarSdk.Asset.native():new StellarSdk.Asset(top_value, AssetIssuerPublicKey1);
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET
      })
      const offer = StellarSdk.Operation.manageOffer({
        selling: counter_asset_buy,
        buying: base_asset_sell,
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
      // Save_offer(counter_asset_buy, offer_amount, offer_price, "Buy", "Success", "1234");
      Showsuccesstoast(toast, "Buy offer created.")
      setLoading(false)
      // setOpen(false);
      navigation?.navigate("Offers")
      return 'Sell Offer placed successfully';
    } catch (error) {
      setoffer_amount('')
      setoffer_price('')
      const errMessage = error.response && error.response.data.extras ? 
      error.response.data.extras.result_codes.operations.join(', ') : 
      "An error occurred while creating the sell offer.";
      ShowErrotoast(toast,errMessage==="op_low_reserve"||errMessage==="op_underfunded"?SelectedBaseValue==="native"?"XLM low reserve in account":SelectedBaseValue +" low reserve in account": errMessage==="op_cross_self"?"Account already has an active offer with an Opposing order":"Buy offer not-created.");
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
      console.log("_+_+_+_+_IIIO",ALL_STELLER_BALANCES)
        setbalance("");
        setreserveLoading(true);
        const hasAsset = ALL_STELLER_BALANCES.some(
            (balance) => balance.asset_code === asset || balance.asset_type === asset
        );
        if (!hasAsset&&asset!=="native") {
            setshow_trust_modal(true);
        }

        ALL_STELLER_BALANCES.forEach((balance) => {
            if (balance.asset_code === asset || balance.asset_type === asset) {
                if (asset !== "native" && asset !== "USDC") {
                    setactiv(false);
                    setshow_bal(true);
                }
            }
        });

        if (asset === "native") {
            GetStellarAvilabelBalance(state?.STELLAR_PUBLICK_KEY)
                .then((result) => {
                    setbalance(result?.availableBalance);
                    setreserveLoading(false);
                })
                .catch((error) => {
                    console.log("Error loading account:", error);
                    setreserveLoading(false);
                });
        }

        if (asset === "USDC"||asset==="ETH"||asset==="BTC") {
            GetStellarUSDCAvilabelBalance(state?.STELLAR_PUBLICK_KEY,asset)
                .then((result) => {
                    setbalance(result?.availableBalance);
                    setreserveLoading(false);
                })
                .catch((error) => {
                    console.log("Error loading account:", error);
                    setreserveLoading(false);
                });
        }
    } catch (error) {
        console.log("Error in get_stellar");
        // Showsuccesstoast(toast, "Please wait, account is updating....");
        setshow(false);
        setreserveLoading(false);
    }
};

  const proceedToBridgeValidation=async()=>{
    const hasAsset = ALL_STELLER_BALANCES.some(
      (balance) => balance.asset_code === "USDC" || balance.asset_type === "USDC"
    );
    if (!hasAsset) {
      setusdcBidgeTrust(true)
      setLoading(false)
      setshow_trust_modal(true);
    }
    else{
      setinfoVisible(false)
      navigation.navigate("classic",{Asset_type:"ETH"})
    }
  }
  const offer_creation = () => {
    const hasAsset = ALL_STELLER_BALANCES.some(
      (balance) => balance.asset_code === selectedValue || balance.asset_type === selectedValue
    );
    if (!hasAsset && selectedValue !== "native") {
      settradeTrust(true)
      setLoading(false)
      setshow_trust_modal(true);
    }
    else {
      const temp_amount = parseInt(offer_amount);
      if (temp_amount > Balance) {
        ShowErrotoast(toast, "Insufficient Balance");
        setLoading(false)
      }
      else {
        console.log("---selectedValue", selectedValue)
        // if (selectedValue === "USDC" || selectedValue === "XLM" || selectedValue === "native") {
          getData();
          if (titel !== "Activate Stellar Account for trading" && offer_amount !== "" && offer_price !== "" && offer_amount !== "0" && offer_price !== "0" && offer_amount !== "." && offer_price !== "." && offer_amount !== "," && offer_price !== ",") {
            { route === "SELL" ? Sell() : Buy() }
          }
          else {
            titel === "Activate Stellar Account for trading" ? ShowErrotoast(toast, "Activation Required") : ShowErrotoast(toast, "Input Correct Value.")
            setLoading(false)
          }
        // }
        // else {
        //   setLoading(false)
        //   Showsuccesstoast(toast, "Available Soon.")
        // }
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
        setactiveTradeType(1)
        setreservedError(false)
        setassetInfo(false)
        settop_value(back_data?.params?.tradeAssetType || chooseItemList[0].visible_0);
        settop_value_0(chooseItemList[0].visible_1)
        setAssetIssuerPublicKey(back_data?.params?.tradeAssetIssuer ||chooseItemList[0].visible0Issuer)
        setAssetIssuerPublicKey1(chooseItemList[0].visible1Issuer)
        setloading_trust_modal(false)
        setALL_STELLER_BALANCES(state?.assetData)
        setshow_trust_modal(false);
        setactiv(false)
        setshow_bal(true)
        await get_stellar(back_data?.params?.tradeAssetType || "native")
        if(state.STELLAR_ADDRESS_STATUS===false)
        {
            setACTIVATION_MODAL_PROD(true)
        }
      } catch (error) {
        console.log("=-====#", error)
      }
    }
    fetch_ins()
  },[isFocused])

  useEffect(()=>{
    const fetch_ins1 = async () => {
      try {
        setreservedError(false)
        setassetInfo(false)
        settop_value(back_data?.params?.tradeAssetType || chooseItemList[0].visible_0);
        settop_value_0(chooseItemList[0].visible_1)
        setAssetIssuerPublicKey(back_data?.params?.tradeAssetIssuer ||chooseItemList[0].visible0Issuer)
        setAssetIssuerPublicKey1(chooseItemList[0].visible1Issuer)
        setloading_trust_modal(false)
        setALL_STELLER_BALANCES(state?.assetData)
        setshow_trust_modal(false);
        setactiv(false)
        setshow_bal(true)
        await get_stellar(back_data?.params?.tradeAssetType || "native")
        if(state.STELLAR_ADDRESS_STATUS===false)
        {
            setACTIVATION_MODAL_PROD(true)
        }
      } catch (error) {
        console.log("=-====#", error)
      }
    }
    fetch_ins1()
  },[ACTIVATION_MODAL_PROD])

  useEffect(()=>{
    getAccountDetails();
    getData();
    get_stellar(SelectedBaseValue)
    getAssetIssuerId(selectedValue)

  },[isFocused])
  useEffect(() => {
    setusdcBidgeTrust(false)
    settradeTrust(false)
    setALL_STELLER_BALANCES(state.assetData)
    getAccountDetails();
    setinfo_(false);
    setinfo_amount(false);
    setinfo_price(false);
    get_stellar(SelectedBaseValue)
    getAssetIssuerId(selectedValue)
    // eth_services()
  }, [show_bal,selectedValue, route,isFocused,loading_trust_modal])

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

const reves_fun=async(fist_data,second_data,Issuer1,Issuer2)=>{
  settop_value_0(fist_data)
  settop_value(second_data)
  setAssetIssuerPublicKey1(Issuer1)
  setAssetIssuerPublicKey(Issuer2)
  settop_domain(top_domain_0);
  settop_domain_0(top_domain)
  setSelectedValue(SelectedBaseValue)
  setSelectedBaseValue(selectedValue)
}


const change_Trust_New = async (assetName,domainIssuerPublicKey) => {
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
                  asset: new StellarSdk.Asset(assetName, domainIssuerPublicKey),
              })
          )
          .setTimeout(30)
          .build();
      transaction.sign(StellarSdk.Keypair.fromSecret(state.STELLAR_SECRET_KEY));
      const result = await server.submitTransaction(transaction);
      console.log(`Trustline updated successfully`);
      Snackbar.show({
          text: 'Trustline updated successfully',
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor:'green',
      });
      server.loadAccount(state.STELLAR_PUBLICK_KEY)
          .then(account => {
              console.log('Balances for account:', account.balances);
              account.balances.forEach(balance => {
                dispatch_({
                  type: SET_ASSET_DATA,
                  payload: account.balances,
                })
                settradeTrust(false);
                setusdcBidgeTrust(false);
                setloading_trust_modal(false)
                setshow_trust_modal(false)
              });
              // navigation.goBack()
          })
          .catch(error => {
              console.log('Error loading account:', error);
              settradeTrust(false);
              setusdcBidgeTrust(false);
              setloading_trust_modal(false)
              Snackbar.show({
                  text: 'Trustline failed to updated',
                  duration: Snackbar.LENGTH_SHORT,
                  backgroundColor:'red',
              });
          });
  } catch (error) {
      console.error(`Error changing trust:`, error);
      settradeTrust(false);
      setusdcBidgeTrust(false);
      setloading_trust_modal(false)
      Snackbar.show({
          text: 'Trustline failed to updated',
          duration: Snackbar.LENGTH_SHORT,
          backgroundColor:'red',
      });
  }
};

const handleCloseModal = () => {
  setreservedError(false);
};

  useEffect(() => {
    const isZeroBalance = Balance === "0.0000000" || parseFloat(Balance) === 0;
    if (isZeroBalance && !messageShownRef.current) {
      setassetInfo(true);
      setinfomessage("Insufficient Balance");
      setinfotype("warning");
      setinfoVisible(true);
      messageShownRef.current = true;
    }
  }, [Balance])

  const ActivateModal = () => {
    setACTIVATION_MODAL_PROD(false);
    navigation.goBack()
  };
  
  console.log("0---",AssetIssuerPublicKey)
  console.log("1---",AssetIssuerPublicKey1)
  return (
    
    <View style={styles.scrollView0}>
       {Platform.OS==="ios"?<StatusBar hidden={true}/>:<StatusBar barStyle={"light-content"} backgroundColor={"#011434"}/>}
      <Exchange_screen_header title="Trade" onLeftIconPress={() => navigation.goBack()} onRightIconPress={() => console.log('Pressed')} />
        
      <View style={styles.tradeContainer}>
        <TouchableOpacity
          style={[styles.tradetab, activeTradeType === 1 && styles.tradeactiveTab]}
          onPress={() =>{setActiveTab(0),setactiveTradeType(1)}}
        >
          <Icon type={"ionicon"} name="flash" size={20} color="#EFBF04" />
          <Text style={[styles.tabText, activeTradeType === 1 && styles.tradeactiveTabText]}> Instant trade</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tradetab, activeTradeType === 0 && styles.tradeactiveTab]}
          onPress={() => {setActiveTab(0),setactiveTradeType(0)}}
        >
          <Icon type={"ionicon"} name="analytics-outline" size={20} color="gray" />
          <Text style={[styles.tabText, activeTradeType === 0 && styles.tradeactiveTabText]}> Large Order Trade</Text>
        </TouchableOpacity>
      </View>

       <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 0 && styles.activeTab]} 
                onPress={() => setActiveTab(0)}
              >
                <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>Trade</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 1 && styles.activeTab]} 
                onPress={() => setActiveTab(1)}
              >
                <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>Overview</Text>
              </TouchableOpacity>
              {activeTradeType===1&&<TouchableOpacity 
                style={[styles.tab, activeTab === 4 && styles.activeTab]} 
                onPress={() => {setActiveTab(4)}}
              >
                <Text style={[styles.tabText, activeTab === 4 && styles.activeTabText]}>Transactions</Text>
              </TouchableOpacity>}


              {activeTradeType===0&&<TouchableOpacity 
                style={[styles.tab, activeTab === 2 && styles.activeTab]} 
                onPress={() => {setActiveTab(2)}}
              >
                <Text style={[styles.tabText, activeTab === 2 && styles.activeTabText]}>{"Orderbook"}</Text>
              </TouchableOpacity>}
              {activeTradeType===0&&<TouchableOpacity 
                style={[styles.tab, activeTab === 3 && styles.activeTab]} 
                onPress={() => setActiveTab(3)}
              >
                <Text style={[styles.tabText, activeTab === 3 && styles.activeTabText]}>Last Trade</Text>
              </TouchableOpacity>}
            </View>
    <ScrollView style={{ width: "99%"}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={{ flex: 1, backgroundColor: "#011434", }}
      >
      
        <InfoComponent
          visible={infoVisible}
          type={infotype}
          message={infomessage}
          onClose={() => setinfoVisible(false)}
        />

        <View>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {assetInfo&&
           <View style={styles.informationContiner}>
           <Text style={styles.amountSugCon.amountSugCardText}>Click 'Import' to add token.</Text>
           <TouchableOpacity style={styles.amountSugCon.amountSugCard} onPress={()=>{proceedToBridgeValidation()}}>
           <Text style={styles.amountSugCon.amountSugCardText}>Import</Text>
           </TouchableOpacity>
         </View>
        }
  {activeTab===0&&(
  activeTradeType===1?<AMMSwap/>:
    <>
          <View style={styles.pariViewCon}>
        <TouchableOpacity style={styles.pairNameCon}>
          <Text style={styles.pairNameText}>{top_value}</Text>
          <Text style={styles.pairNameText.pairDomainText}>{top_domain}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pairSwapCon} onPress={()=>{settop_domain(top_domain_0),settop_value(top_value_0),settop_domain_0(top_domain),settop_value_0(top_value),setAssetIssuerPublicKey(AssetIssuerPublicKey1),setAssetIssuerPublicKey1(AssetIssuerPublicKey)}}>
          <Icon name="swap" type={"antDesign"} size={25} color={"#141C2B"} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.pairNameCon}>
          <Text style={styles.pairNameText}>{top_value_0}</Text>
          <Text style={styles.pairNameText.pairDomainText}>{top_domain_0}</Text>
        </TouchableOpacity>
      </View>
    {/* offer seletion container */}
    <View style={[styles.pairSelectionCon]}>
     <Text style={styles.pairHeadingText}>Trading Pair</Text>
     <TouchableOpacity style={styles.pairSelectionSubCon} onPress={()=>{setchooseModalPair(true)}}>
       <Text style={styles.pairSelectionSubCon.pairSelectionName}>{top_value+" / "+top_value_0}</Text>
       <Icon name="down" type={"antDesign"} size={20} color={"#FFFFFF"} />
     </TouchableOpacity>
     <Text style={[styles.pairHeadingText, { marginTop: 13, }]}>Select Offer</Text>
     <View style={styles.offerSelctionCon}>
       <TouchableOpacity style={[styles.offerSelctionBtn,{ backgroundColor: btnRoot===0?"#2164C1":"#1F2937" }]} onPress={()=>{setRoute("BUY"),setbtnRoot(0),reves_fun(top_value, top_value_0, AssetIssuerPublicKey,AssetIssuerPublicKey1)}}>
         <Text style={styles.pairSelectionSubCon.pairSelectionName}>Buy</Text>
       </TouchableOpacity>
       <TouchableOpacity style={[styles.offerSelctionBtn, { backgroundColor: btnRoot===1?"#2164C1":"#1F2937" }]} onPress={()=>{setRoute("SELL"),setbtnRoot(1),reves_fun(top_value, top_value_0, AssetIssuerPublicKey,AssetIssuerPublicKey1)}}>
         <Text style={styles.pairSelectionSubCon.pairSelectionName}>Sell</Text>
       </TouchableOpacity>
       <Modal
     animationType="slide"
     transparent={true}
     visible={chooseModalPair}
     >
     <TouchableOpacity style={styles.chooseModalContainer} onPress={() => setchooseModalPair(false)}>
       <View style={styles.chooseModalContent}>
       <Text style={styles.chooseItem_text}>Select Trading Pair</Text>
         <FlatList
           data={chooseFilteredItemList}
           renderItem={chooseRenderItem}
           keyExtractor={(item) => item.id.toString()}
           />
       </View>
     </TouchableOpacity>
   </Modal>
     </View>
   </View>
         {/* account info container */}
         <View style={styles.pairSelectionCon}>
     <View style={styles.accountInfoCon}>
       <Text style={styles.pairHeadingText}>Account</Text>
       <View style={{width:wp(60)}}>
       <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: wp(60) }}>
       <Text style={styles.accountInfoCon.accountInfoText} numberOfLines={1}>{PublicKey}</Text>
       </ScrollView>
       </View>
     </View>
     <View style={[styles.accountInfoCon, { marginTop: 9 }]}>
       <TouchableOpacity style={{flexDirection:"row",alignItems:"center"}} onPress={()=>{setreservedError(true)}}>
       <Text style={styles.pairHeadingText}>Balance</Text>
       <Icon name={"information-outline"} type={"materialCommunity"} size={15} color={"#818895"} style={{marginLeft:3}}/>
       </TouchableOpacity>
       {reserveLoading?<ActivityIndicator color={"green"}/>:
       <Text style={styles.accountInfoCon.accountInfoText} numberOfLines={1}>{Balance!=="Error" ? Number(Balance).toFixed(5) : 0.0} </Text>}
     </View>
   </View>
   {/* amount input */}
   <View style={styles.amountCon}>
     <View style={styles.amountSubinfo}>
       <Text style={[styles.pairHeadingText]}>Amount </Text>
       <TouchableOpacity onPress={()=>{setinfoVisible(true),setinfotype("success"),setinfomessage(`Offered Amount for ${SelectedBaseValue==="native"?"XLM":SelectedBaseValue}`)}}>
       <Icon name={"information-outline"} type={"materialCommunity"} size={15} color={"#818895"}/>
                   </TouchableOpacity>
     </View>
     <View style={styles.amountInputCon}>
       <TextInput  
       style={{color:"#fff",fontSize:16,width:"100%",height:"100%"}}
           keyboardType="numeric"
             returnKeyType="done"
             value={offer_amount}
             contextMenuHidden={true}
             disableFullscreenUI={true}
             placeholder={SelectedBaseValue==="native"?"Amount of XLM":"Amount of "+SelectedBaseValue}
             placeholderTextColor={"gray"}
             onChangeText={(text) => {
               onChangeamount(text)
               if (offer_amount > Balance) {
                 setinfoVisible(true),setinfotype("error"),setinfomessage("Inputed Balance not found in account.")
               }
             }}
             disabled={Balance==="0.0000000"||Balance==="0"}
             autoCapitalize={"none"}/>
     </View>
     <View style={styles.amountSugCon}>
       {amountSuggest.map((item, index) => {
         return (
           <TouchableOpacity style={styles.amountSugCon.amountSugCard} key={index}>
             <Text style={styles.amountSugCon.amountSugCardText}>{item.amountSuggest}</Text>
           </TouchableOpacity>
         )
       })}
     </View>
   </View>

   {/* price input */}
   <View style={[styles.amountCon,{marginTop:"14%"}]}>
     <View style={styles.amountSubinfo}>
       <Text style={[styles.pairHeadingText]}>Price </Text>
       <TouchableOpacity onPress={()=>{setinfoVisible(true),setinfotype("success"),setinfomessage(`Offered Price for ${selectedValue==="native"?"XLM":selectedValue}`)}}>
       <Icon name={"information-outline"} type={"materialCommunity"} size={15} color={"#818895"} />
       </TouchableOpacity>
     </View>
     <View style={styles.amountInputCon}>

       <TextInput 
             style={{color:"#fff",fontSize:16,width:"100%",height:"100%"}}
             returnKeyType="done"
             keyboardType="numeric"
             value={offer_price}
             contextMenuHidden={true}
             disableFullscreenUI={true}
             placeholder={"Price of " + route.toLocaleLowerCase()}
             placeholderTextColor={"gray"}
             onChangeText={(text) => {
               onChangename(text)
             }}
             autoCapitalize={"none"}
             disabled={Balance === "0.0000000" || Balance === "0"}
           />
     </View>
     </View>
     {/* total view */}
     <View style={styles.priceInfoCon}>
     <View style={styles.amountSubinfo}>
       <Text style={[styles.pairHeadingText]}>Total </Text>
       <TouchableOpacity onPress={()=>{setinfoVisible(true),setinfotype("success"),setinfomessage(`Total for ${selectedValue==="native"?"XLM":selectedValue}`)}}>
       <Icon name={"information-outline"} type={"materialCommunity"} size={15} color={"#818895"} />
       </TouchableOpacity>
     </View>
       <Text style={[styles.accountInfoCon.accountInfoText,{fontWeight:"900"}]} numberOfLines={1}>{offer_price*offer_amount}</Text>
     </View>
     {/* create offer button */}

     
     <View
       style={{
         display: "flex",
         alignItems: "center",
         marginTop:Platform.OS==="ios"?30:30
       }}
       >
         <View style={{display: "flex", alignSelf: "center",}}>
           <StellarAccountReserve
             isVisible={reservedError}
             onClose={handleCloseModal}
             title="Reserved"
             />
         </View>
     </View>

           <TouchableOpacity
             activeOpacity={true}
             style={[styles.submitBtn,{backgroundColor:Loading === true?"gray":"#2164C1"}]}
             onPress={() => { setLoading(true), offer_creation() }}
             color="green"
             disabled={Loading||Balance==="0.0000000"||parseFloat(Balance)===0}
             >
             <Text style={styles.textColor}>{Loading === true ? <ActivityIndicator color={"white"} /> :"Create Offer"}</Text>
           </TouchableOpacity>
         
       {loading ? (
         <ActivityIndicator size="small" color="blue" />
       ) : (
         <View></View>
       )}



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
           <Text style={styles.AccounheadingContainer}>Please trust {usdcBidgeTrust?"USDC":tradeTrust?top_value_0:top_value} first before creating your offer.</Text>
           <View style={{ flexDirection: "row",justifyContent:"space-around",width:wp(80),marginTop:hp(3),alignItems:"center" }}>
             <TouchableOpacity disabled={loading_trust_modal} style={styles.AccounbtnContainer} onPress={() => {setshow_trust_modal(false),navigation.goBack()}}>
                <Text style={styles.Accounbtntext}>Cancel</Text>
             </TouchableOpacity>
             <TouchableOpacity disabled={loading_trust_modal} style={styles.AccounbtnContainer} onPress={()=>{change_Trust_New(usdcBidgeTrust?"USDC":tradeTrust?top_value_0:top_value,tradeTrust?AssetIssuerPublicKey1:AssetIssuerPublicKey)}}>
                <Text style={styles.Accounbtntext}>{loading_trust_modal?<ActivityIndicator color={"green"}/>:"Trust"}</Text>
             </TouchableOpacity>
           </View>
         </View>
       </View>
     </Modal>
 </>)
  }
  {activeTab===1&&
    <View style={{width:"100%"}}>
     <CustomOrderBook visibleTabs={['chart']} />
   </View>
  }
  {activeTab===2&&
    <View style={{width:"100%"}}>
     <CustomOrderBook visibleTabs={['bids']} />
   </View>
  }
    {activeTab===3&&
    <View style={{width:"100%"}}>
     <CustomOrderBook visibleTabs={['trades']} />
   </View>
  }
  {activeTab===4&&
    <View style={{width:"100%"}}>
     <InstentTradeHistory/>
   </View>
  }
</ScrollView>
  </View>
        </KeyboardAvoidingView>
        </ScrollView>
        <WalletActivationComponent
          isVisible={ACTIVATION_MODAL_PROD}
          onClose={() => {ActivateModal}}
          onActivate={()=>{setACTIVATION_MODAL_PROD(false)}}
          navigation={navigation}
          appTheme={true}
          shouldNavigateBack={true}
        />
        </View>

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
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 10,
    color: "#fff",
    textAlign:"center"
  },
  scrollView:{
    flexGrow: 1,
    alignItems:"center"
  },
  scrollView0:{
    flex:1,
    alignItems:"center",
    backgroundColor: "#011434",
  },
  pariViewCon: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf:"center",
    backgroundColor: "#141C2B",
    alignItems: "center",
    width: "98%",
    // height: "9%",
    height: 69,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF33",
    paddingHorizontal: 13,
    marginTop:"1%"
  },
  pairNameCon: {
    width: 122,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFFFFF33",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F2937"
  },
  pairSwapCon: {
    width: 33,
    height: 33,
    backgroundColor: "#EBECF5",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30
  },
  pairNameText: {
    fontSize: 16,
    color: "#FFFFFF",
    pairDomainText:{
      color: "#818895",
      fontSize: 10,
    }
  },
  pairHeadingText: {
    color: "#818895",
    fontSize: 14,
  },
  pairSelectionCon: {
    marginTop: 13,
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#141C2B",
    alignItems: "flex-start",
    width: "98%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF33",
    padding: 13
  },
  pairSelectionSubCon: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    top: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF33",
    backgroundColor: "#1F2937",
    padding: 15,
    pairSelectionName: {
      fontSize: 16,
      color: "#FFFFFF"
    }
  },
  offerSelctionCon: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    top: 5,
    padding: 5,
    pairSelectionName: {
      fontSize: 16,
      color: "#FFFFFF"
    }
  },
  offerSelctionBtn: {
    width: "48%",
    height: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF33",
    alignItems: "center",
    justifyContent: "center"
  },
  accountInfoCon: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    accountInfoText: {
      fontSize: 14,
      color: "#FFFFFF"
    }
  },
  amountCon: {
    width: "98%",
    height: 71,
    marginTop: "3%",
    gap: 2,
  },
  amountSubinfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    left: 4
  },
  amountInputCon: {
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#141C2B",
    borderColor: "#FFFFFF33",
    marginTop: 2
  },
  amountSugCon: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6.9,
    paddingHorizontal: 5,
    amountSugCard: {
      alignItems: "center",
      justifyContent: "center",
      width: 80,
      height: 33,
      borderRadius: 8,
      backgroundColor: "#141C2B"
    },
    amountSugCardText: {
      color: "#FFFFFF",
      fontSize: 16
    }
  },
  priceInfoCon: {
    flexDirection:"row",
    paddingHorizontal: 15,
    justifyContent: "space-between",
    alignItems: "center",
    width: "98%",
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: "#141C2B",
    borderColor: "#FFFFFF33",
    marginTop: 14,
    alignSelf:"center"
  },
  submitBtn: {
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
    width: "95%",
    height: 48,
    borderRadius: 37,
    marginTop: "1%",
    marginBottom:"10%",
    alignSelf:"center",
    backgroundColor:"#2164C1",
    submitBtnText:{
      fontSize:17,
      fontWeight:"3400",
      color:"#FFFFFF"
    }
  },
  informationContiner: {
    position:"relative",
    zIndex:20,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FC691A",
    alignItems: "center",
    width: "95%",
    height: "8%",
    top: "4.4%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F7CC49",
    paddingHorizontal: 13
  },
  infoBtnCon:{
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 33,
    borderRadius: 8,
    backgroundColor: "gray",
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#011434',
    alignSelf:"center",
    marginBottom:"2%",
    width: "98%",
  },
  tradeContainer: {
    flexDirection: 'row',
    backgroundColor: '#011434',
    alignSelf:"center",
    marginBottom:"2%",
    width: "98%",
    marginTop:"2%"
  },
  tradetab: {
    flex: 1,
    flexDirection:"row",
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent:"center",
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tradeactiveTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomColor: '#2b3c57',
    borderTopLeftRadius:15,
    borderTopRightRadius:15
  },
  tradeactiveTabText: {
    fontSize:16,
    color: 'white',
    fontWeight: '500',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    // backgroundColor: '#141C2B',
    borderBottomColor: '#2b3c57',
    borderTopLeftRadius:15,
    borderTopRightRadius:15
  },
  tabText: {
    fontSize:15,
    color: 'gray',
    fontWeight: '300',
  },
  activeTabText: {
    color: 'white',
    fontWeight: '500',
  },
});
