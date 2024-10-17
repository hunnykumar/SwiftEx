import React ,{ useState, useEffect } from "react";
import darkBlue from "../../../../../../assets/darkBlue.png";
import { authRequest, GET, getToken, POST } from "../api";
import { NewOfferModal } from "../components/newOffer.modal";
import { FieldView } from "./profile";
import { OfferListView, OfferListViewHome } from "./offers";
import { ConnectToWallet } from "../web3";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  BackHandler,
  FlatList,
  Dimensions,
} from "react-native";
import BootstrapStyleSheet from "react-native-bootstrap-styles";
import { useDispatch, useSelector } from "react-redux";
import { getRegistrationToken } from "../utils/fcmHandler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions, useFocusEffect, useIsFocused, useNavigation } from "@react-navigation/native";
import { REACT_APP_HOST, REACT_APP_LOCAL_TOKEN } from "../ExchangeConstants";
import walletImg from "../../../../../../assets/walletImg.png";
import idCard from "../../../../../../assets/idCard.png";

import copyRide from "../.././../../../../assets/copyRide.png";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { BidsListView } from "../components/bidsListView";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "react-native-linear-gradient";
import Icon from "../../../../../icon";
import { alert } from "../../../../reusables/Toasts";
import { Chart, VerticalAxis, HorizontalAxis, Line, Area, Tooltip } from 'react-native-responsive-linechart';
import { Platform,Modal} from "react-native";
import  Clipboard from "@react-native-clipboard/clipboard";
import { useRef } from "react";
import { RAPID_STELLAR, SET_ASSET_DATA } from "../../../../../components/Redux/actions/type";
import SelectWallet from "../../../../Modals/SelectWallet";
import SELECT_WALLET_EXC from "../../../../Modals/SELECT_WALLET_EXC";
import { STELLAR_URL } from "../../../../constants";
// import StellarSdk from '@stellar/stellar-sdk';
const StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();

export const HomeView = ({ setPressed }) => {
  const dispatch_ = useDispatch()
  const [modalContainer_menu,setmodalContainer_menu]=useState(false);
  const AnchorViewRef = useRef(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [ShowButtonRight,setShowButtonRight]=useState(false);
  const [ShowButtonLeft,setShowButtonLeft]=useState(false);
  const [open_chart_api,setopen_chart_api]=useState(false);
  const [VISIBLE_SELECT,setVISIBLE_SELECT]=useState(false);
  const [chart_api,setchart_api]=useState([
    {id:0,name:"XLM  ",name_0:"USDC",url:"https://horizon.stellar.lobstr.co/trade_aggregations?base_asset_type=native&counter_asset_type=credit_alphanum4&counter_asset_code=USDC&counter_asset_issuer=GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN&start_time=1722320811000&resolution=60000&offset=0&limit=20&order=desc",img_0:'https://s2.coinmarketcap.com/static/img/coins/64x64/512.png',img:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"},
    {id:1,name:"ETH  ",name_0:"USDC",url:"https://horizon.stellar.lobstr.co/trade_aggregations?base_asset_type=credit_alphanum4&base_asset_code=ETH&base_asset_issuer=GBFXOHVAS43OIWNIO7XLRJAHT3BICFEIKOJLZVXNT572MISM4CMGSOCC&counter_asset_type=credit_alphanum4&counter_asset_code=USDC&counter_asset_issuer=GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN&start_time=1722320811000&resolution=60000&offset=0&limit=20&order=desc",img:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",img_0:"https://tokens.pancakeswap.finance/images/0x2170Ed0880ac9A755fd29B2688956BD959F933F8.png"},
    {id:2,name:"XLM  ",name_0:"EURC",url:"https://horizon.stellar.lobstr.co/trade_aggregations?base_asset_type=native&counter_asset_type=credit_alphanum4&counter_asset_code=EURC&counter_asset_issuer=GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2&start_time=1722322255000&resolution=60000&offset=0&limit=20&order=desc",img:"https://assets.coingecko.com/coins/images/26045/thumb/euro-coin.png?1655394420",img_0:'https://s2.coinmarketcap.com/static/img/coins/64x64/512.png'},
    {id:3,name:"USDC",name_0:"EURC",url:"https://horizon.stellar.org/trade_aggregations?base_asset_type=credit_alphanum4&base_asset_code=USDC&base_asset_issuer=GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN&counter_asset_type=credit_alphanum4&counter_asset_code=EURC&counter_asset_issuer=GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2&start_time=1722229906000&resolution=900000&offset=0&limit=20&order=desc",img:"https://assets.coingecko.com/coins/images/26045/thumb/euro-coin.png?1655394420",img_0:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"},
  ])
  const [chart_index,setchart_index]=useState(0);
  const chooseRenderItem_1 = ({ item }) => (
    <TouchableOpacity onPress={() => {setchart_index(item.id),setopen_chart_api(false)}} style={[styles.chooseItemContainer,{borderRadius:5,height:hp(6),justifyContent:"flex-start"}]}>
      <Image source={ { uri: item.img_0 }} style={{width:wp(7.7),height:hp(3.5)}}/>
      <Text style={[styles.chooseItemText]}>{item.name}   vs</Text>
      <Image source={ { uri: item.img }} style={{width:wp(7.7),height:hp(3.5),marginLeft:wp(3)}}/>
      <Text style={[styles.chooseItemText]}>{item.name_0}</Text>
    </TouchableOpacity>
  );
  const handleScroll = (xOffset) => {
    if (AnchorViewRef.current) {
      AnchorViewRef.current.scrollTo({ x: xOffset, animated: true });
    }
  };
  const handleScroll_new = (event) => {
    const xOffset = event.nativeEvent.contentOffset.x;
    if (xOffset > 100) {
      setShowButtonRight(false);
      setShowButtonLeft(true);
    }
    if(xOffset<30)
    {
      setShowButtonLeft(false);
        setShowButtonRight(true);
    }
  };
  const Focused_screen=useIsFocused();
  const [steller_key,setsteller_key]=useState("Updating keys...");
  const state = useSelector((state) => state);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState();
  const [bids, setBids] = useState();
  const [route, setRoute] = useState("Offers");
  const [profile, setProfile] = useState({
    isVerified: false,
    firstName: "jane",
    lastName: "doe",
    email: "xyz@gmail.com",
    phoneNumber: "93400xxxx",
    isEmailVerified: false,
  });
  const chartHeight = Dimensions.get('window').height * 0.35;
  const chartWidth = Dimensions.get('window').width * 0.80;
  const [API_data,setAPI_data]=useState([]);
  const base_asset_code='XETH';
  const counter_asset_code='XUSD';
  
  const [offers, setOffers] = useState();
  const [walletType, setWalletType] = useState(null);
  const [change, setChange] = useState(false);
  const activeColor = ["rgba(70, 169, 234, 1)", "rgba(185, 116, 235, 1)"];
  const inActiveColor = ["#131E3A", "#131E3A"];
  const [Offer_active,setOffer_active]=useState(false);
  const Anchor=[
    // {name:"SwiftEx",status:"Verified",image: require('../../../../../../assets/darkBlue.png'),city:"India / Indonesia / Ireland / Israel / Italy / Jamaica / Japan / Jordan / Kazakhstan / Kenya / Kosovo / Kuwait / Kyrgyzstan / Laos / Latvia / Lebanon / Liberia / Libya / Slovakia / Slovenia / Solomon Islands / South Africa / South Korea / South Sudan / Spain / Sri Lanka / Suriname / Sweden / Switzerland / Taiwan / Tanzania / Thailand / Timor-Leste / Togo / Tonga / Trinidad And Tobago / Turkey / Turks And Caicos Islands / Tuvalu / Uganda / Ukraine / United Arab Emirates / United Kingdom / United States / Uruguay / Uzbekistan / Vanuatu / Venezuela / Vietnam / Virgin Islands, British / Virgin Islands, U.S. / Yemen / Zambia",Crypto_Assets:"XETH, XUSD",Fiat_Assets:"$ USD, € EUR",Payment_Rails:"Card, Bank Transfer, Local Method" },
    {name:"MoneyGram",status:"Pending",image: require('../../../../../../assets/MONEY_GRAM.png'),city:"Afghanistan / Albania / Angola / Anguilla / Antigua and Barbuda / Argentina / Armenia / Aruba / Australia / Bahamas / Bahrain / Barbados / Belarus / Belgium / Belize / Benin / Berumda / Bhutan / Bolivia / Bosnia and Herzegovina / Botswana / Brazil / Brunei Darussalam / Bulgaria / Burkina Faso / Burundi / Cambodia / Cameroon / Canada / Cape Verde / Cayman Islands / Central African Republic / Chad / Chile / Colombia / Comoros / Costa Rica / Cote D'Ivoire / Croatia / Curacao / Cyprus / Czech Republic / Democratic Republic of the Congo / Denmark / Djibouti / Dominica / Dominican Republic / Ecuador / El Salvador / Equatorial Guinea / Estonia / Eswatini / Ethiopia / Fiji / Finland / France / French Guiana / Gabon / Gambia / Georgia / Germany / Ghana / Gibraltar / Greece / Grenada / Guadeloupe / Guam / Guatemala / Guinea / Guinea-Bissau / Guyana / Haiti / Honduras / Hong Kong / Hungary / Iceland / Indonesia / Ireland / Israel / Italy / Jamaica / Japan / Jordan / Kazakhstan / Kenya / Kosovo / Kuwait / Kyrgyzstan / Laos / Latvia / Lebanon / Liberia / Libya / Lithuania / Luxembourg / Macao / Macedonia / Madagascar / Malawi / Malaysia / Maldives / Mali / Malta / Marshall Islands / Martinique / Mauritania / Mauritius / Mayotte / Mexico / Micronesia / Moldova / Mongolia / Montenegro / Montserrat / Mozambique / Myanmar / Namibia / Netherlands / New Zealand / Nicaragua / Niger / Nigeria / Norway / Oman / Palestine / Panama / Paraguay / Peru / Philippines / Poland / Portugal / Puerto Rico / Reunion / Romania / Rwanda / Saint Kitts And Nevis / Saint Lucia / Saint Martin / Saint Vincent And The Grenadines / Samoa / Sao Tome And Principe / Saudi Arabia / Senegal / Serbia / Seychelles / Sierra Leone / Singapore / Sint Maarten / Slovakia / Solomon Islands / South Korea / South Sudan / Spain / Sri Lanka / Suriname / Sweden / Switzerland / Tanzania / Thailand / Timor-Leste / Togo / Tonga / Trinidad And Tobago / Turks And Caicos Islands / Tuvalu / Uganda / Ukraine / United Arab Emirates / United Kingdom / United States / Uruguay / Uzbekistan / Vanuatu / Venezuela / Vietnam / Virgin Islands, British / Virgin Islands, U.S. / Yemen / Zambia",Crypto_Assets:"USDC",Payment_Rails:"Global Rails, Cash" },
    {name:"Mykobo",status:"Pending",image: require('../../../../../../assets/MYKOBO.png'),city:"Austria / Belgium / Bulgaria / Croatia / Cyprus / Czech Republic / Denmark / Estonia / Finland / France / Germany / Greece / Hungary / Ireland / Italy / Lithuania / Luxembourg / Malta / Netherlands / Poland / Portugal / Romania / Slovakia / Slovenia / Spain / Sweden",Fiat_Assets:"€ EUR",Crypto_Assets:"EURC",Payment_Rails:"Bank Transfer, SEPA" },
    {name:"Banxa",status:"Pending",image: require('../../../../../../assets/BANXA.png'),city:"Australia / Austria / Brazil / Canada / Hong Kong / India / Indonesia / Mexico / Netherlands / Philippines / South Africa / Switzerland / Turkey / United States",Fiat_Assets:"$ USD",Crypto_Assets:"USDC ,XLM",Payment_Rails:"Card, Apple Pay, Google Pay, ACH, SEPA, Bank Transfer, Local Method"},
    {name:"Clpx",status:"Pending",image: require('../../../../../../assets/CLPX.png'),city:"Chile",Crypto_Assets:"CLPX" },
    {name:"Clickpesa",status:"Pending",image: require('../../../../../../assets/CLICKPESA.png'),city:"Kenya / Rwanda / Tanzania",Crypto_Assets:"USDC, XLM, RWF, TZS, KES",Fiat_Assets:"$ USD"},
    {name:"Finclusive",status:"Pending",image: require('../../../../../../assets/FINCLUSIVE.png'),city:"Benin / Burkina Faso / Cape Verde / Cote D'Ivoire / Gambia / Ghana / Guinea / Guinea-Bissau / Liberia / Mali / Mauritania / Niger / Nigeria / Senegal / Sierra Leone / Togo",Crypto_Assets:"USDC",Fiat_Assets:"$ USD" },
  ];
  const [steller_key_private,setsteller_key_private]=useState("");
  const [Anchor_modal,setAnchor_modal]=useState(false);
  const [index_Anchor,setindex_Anchor]=useState(0);
  const [kyc_modal,setkyc_modal]=useState(false);
  const [kyc_status,setkyc_status]=useState(true);
  const [con_modal,setcon_modal]=useState(false)

  const bootstrapStyleSheet = new BootstrapStyleSheet();
  const { s, c } = bootstrapStyleSheet;
  const navigation = useNavigation();
  const Navigate = () => {
    navigation.dispatch((state) => {
      // Remove the home route from the stack
      const routes = state.routes.filter((r) => r.name !== "exchange");
      
      return CommonActions.reset({
        ...state,
        routes,
        index: routes.length - 1,
      });
    });
  };
  useEffect(()=>{
    setShowButtonRight(true);
    setShowButtonLeft(false);
  },[Focused_screen])

  //activate stellar account function
  const active_account=async()=>{
    console.log("<<<<<<<clicked");
    const token = await getToken();
    console.log(token)
  try {
    const storedData = await AsyncStorageLib.getItem('user_email');
    const postData={
      email: storedData,
      publicKey: state.STELLAR_PUBLICK_KEY,
    }
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
      dispatch_({
          type: RAPID_STELLAR,
          payload: {
            ETH_KEY:state.ETH_KEY,
            STELLAR_PUBLICK_KEY:state.STELLAR_PUBLICK_KEY,
            STELLAR_SECRET_KEY:state.STELLAR_SECRET_KEY,
            STELLAR_ADDRESS_STATUS:true
          },
        })
            // await changeTrust()
     }
    if (response.ok) {
      console.log("===",data.success);
    } else {
      console.error('Error:', data);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
  
  }

  
 
 const changeTrust = async () => {
    try {
      console.log(":++++ Entered into trusting ++++:")
const server = new StellarSdk.Server(STELLAR_URL.URL);
        const account = await server.loadAccount(StellarSdk.Keypair.fromSecret(state.STELLAR_SECRET_KEY).publicKey());
        const transaction = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Network.current().networkPassphrase,
        })
            // .addOperation(
            //     StellarSdk.Operation.changeTrust({
            //         asset: new StellarSdk.Asset("XETH", "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI"),
            //     })
            // )
            .addOperation(
                StellarSdk.Operation.changeTrust({
                    asset: new StellarSdk.Asset("USDC", "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"),
                })
            )
            .setTimeout(30)
            .build();

        transaction.sign(StellarSdk.Keypair.fromSecret(state.STELLAR_SECRET_KEY));

        const result = await server.submitTransaction(transaction);
        dispatch_({
          type: RAPID_STELLAR,
          payload: {
            ETH_KEY:state.ETH_KEY,
            STELLAR_PUBLICK_KEY:state.STELLAR_PUBLICK_KEY,
            STELLAR_SECRET_KEY:state.STELLAR_SECRET_KEY,
            STELLAR_ADDRESS_STATUS:true
          },
        })
        console.log(`Trustline updated successfully`);
        StellarSdk.Network.useTestNetwork();
          server.loadAccount(state.STELLAR_PUBLICK_KEY)
            .then(account => {
              console.log('Balances for account:', state.STELLAR_PUBLICK_KEY);
              account.balances.forEach(balance => {
                dispatch_({
                  type: SET_ASSET_DATA,
                  payload: account.balances,
                })
              });
            })
            .catch(error => {
              console.log('Error loading account:', error);
            });

    } catch (error) {
        console.error(`Error changing trust:`, error);
    }
};




  const getData_new_Kyc = async () => {
    try {
      const key = 'KYC_NEW';
      const value = await AsyncStorage.getItem(key);
    const parsedValue = JSON.parse(value); 
    console.log("++++_+_+_",parsedValue)
    parsedValue===null?setkyc_status(true):setkyc_status(true)
      console.log('Retrieved value:', parsedValue);
    } catch (error) {
      console.error('Error retrieving data', error);
      setkyc_status(true);
    }
  };

  const getData = async () => {
    try {
      const data = await AsyncStorageLib.getItem('myDataKey');
      // if (data) {
        // const parsedData = JSON.parse(data);
        // const matchedData = parsedData.filter(item => item.Ether_address === state.wallet.address);
        // console.log('Retrieved data:', matchedData);
        // const publicKey = matchedData[0].publicKey;
        console.log("========home===",state.STELLAR_PUBLICK_KEY)
        setsteller_key(state.STELLAR_PUBLICK_KEY)
        // const secretKey_Key = matchedData[0].secretKey;
        console.log("=======home====",state.STELLAR_SECRET_KEY)
        setsteller_key_private(state.STELLAR_SECRET_KEY)
      // } else {
        // console.log('No data found for key steller keys');
      // }
    } catch (error) {
      console.error('Error getting data for key steller keys:', error);
    }
    // try {
    //   const storedData = await AsyncStorageLib.getItem('myDataKey');
    //   if (storedData !== null) {
    //     const parsedData = JSON.parse(storedData);
    //     console.log('Retrieved data:', parsedData);
    //     const publicKey = parsedData.key1
    //     setsteller_key(publicKey)
    //     const secretKey_Key = parsedData.key2
    //     setsteller_key_private(secretKey_Key)
    //   }
    //   else {
    //     console.log('No data found in AsyncStorage');
    //   }
    // } catch (error) {
    //   console.error('Error retrieving data:', error);
    // }
  };

  const getAccountDetails = async () => {
    try {
      const { res, err } = await authRequest("/users/getStripeAccount", GET);
    if(res)
    {
      setOffer_active(true);
    }
    if(err)
    {
      const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
           AsyncStorage.removeItem(LOCAL_TOKEN);
           Navigate()
           
      navigation.navigate('exchangeLogin')
    }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(()=>{
    if(state.STELLAR_ADDRESS_STATUS===false)
    {
      active_account()
    }
    getData()
    getAccountDetails();
    getData_new_Kyc()
  },[Focused_screen]);
  useEffect(() => {
    getData()
    getAccountDetails();
    fetchProfileData();
    getOffersData();
    getBidsData();
    // syncDevice();
  }, []);
  useEffect(() => {
    getData()
    fetchProfileData();
    getOffersData();
    getBidsData();
    // syncDevice();
  }, [change]);

  const syncDevice = async () => {
    const token = await getRegistrationToken();
    console.log(token);
    console.log("hi", token);
    if(!token)
    {
      const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
           AsyncStorage.removeItem(LOCAL_TOKEN);
           Navigate()
           
      navigation.navigate('exchangeLogin')
      return
    }
    try {
      const { res } = await authRequest(
        `/users/getInSynced/${await getRegistrationToken()}`,
        GET
      );
      if (res.isInSynced) {
        const { err } = await authRequest("/users/syncDevice", POST, {
          fcmRegToken: await getRegistrationToken(),
        });
        if (err) return setMessage(`${err.message}`);
        return setMessage("Your device is synced");
      }

      return setMessage("");
    } catch (err) {
      //console.log(err)
      setMessage(err.message || "Something went wrong");
    }
  };

  const fetchProfileData = async () => {
    try {
      const { res, err } = await authRequest("/users/getUserDetails", GET);
      await AsyncStorage.setItem("user_email",res.email);
      if (err)return [navigation.navigate("exchangeLogin"),setMessage(` ${err.message} please log in again!`)];
      setProfile(res);
    } catch (err) {
      //console.log(err)
      setMessage(err.message || "Something went wrong");
    }
  };

  const getOffersData = async () => {
    try {
      const { res, err } = await authRequest("/offers", GET);
      if (err) return setMessage(`${err.message}`);
      setOffers(res);
    } catch (err) {
      // console.log(err)
      setMessage(err.message || "Something went wrong");
    }
  };

  const applyForKyc = async () => {
    try {
      const { err } = await authRequest("/users/kyc", POST);
      if (err) return setMessage(`${err.message}`);

      await fetchProfileData();
      return setMessage("KYC success");
    } catch (err) {
      // console.log(err)
      setMessage(err.message || "Something went wrong");
    }
  };

  const getBidsData = async () => {
    try {
      const { res, err } = await authRequest("/bids", GET);
      if (err) return setMessage(`${err.status}: ${err.message}`);
      setBids(res);
    } catch (err) {
      console.log(err);
      setMessage(err.message || "Something went wrong");
    }
  };

  const fetchData = async () => {
    try {
      const response =await fetch(chart_api[chart_index].url)

      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const apiResponse = await response.json();
      const records = apiResponse._embedded.records;
      setAPI_data(records);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  // Transform data for the chart
  const chartData = API_data.map(item => ({
    x: new Date(parseInt(item.timestamp)).getTime(), // Convert timestamp to milliseconds
    y: parseFloat(item.close), // Use the 'close' value for the y-axis
    avg: parseFloat(item.avg) // Include the 'avg' value
  }));

  useEffect(() => {
    fetchData()
    const intervalId = setInterval(fetchData, 1000);
    return () => clearInterval(intervalId);
  }, [chart_index]);

  useEffect(() => {
    AsyncStorageLib.getItem("walletType").then((walletType) => {
      console.log(walletType);
      setWalletType(JSON.parse(walletType));
    });
  }, [Focused_screen]);

const kyc=()=>{
  console.log("called");
  applyForKyc();
}
  
const Offer_condition=(data,para)=>{
  if(kyc_status===false)
  {
    alert("error","Please Submit KYC from Home Tab");
  }
  else{
  getAccountDetails()
  // if(Offer_active===true)
  // {
    if (
      walletType === "Ethereum" ||
      walletType === "Multi-coin"
    ) {
      // setOpen(true);
      navigation.navigate("newOffer_modal",{
        user:{profile},
                    open:{open},
                    // onCrossPress={()=>{setOpen(false)}},
                    // setOpen:{setOpen}
                    getOffersData:{getOffersData}
      });
    } else {
      
      alert('error',"Only Ethereum wallet are supported");
    }
  // }
  // else{
    // Alert.alert("Account","Add Bank Account from Profile Tab.");
  // }
  }
}
const copyToClipboard = (data) => {
  Clipboard.setString(data);
  alert("success", "Copied");
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

const shiningAnimation = animation.interpolate({
  inputRange: [0, 1],
  outputRange: ['rgba(129, 108, 255, 0.97)', '#fff'],
});


const submit_kyc=async()=>{
  try {
    const key = 'KYC_NEW';
    const value = true;
    await AsyncStorage.setItem(key, JSON.stringify(value));
    setkyc_modal(true);
    setTimeout(()=>{
      setkyc_modal(false);
      setcon_modal(true)
      setkyc_status(true);
      close_()
    },1300)
  } catch (error) {
    console.error('Error storing data', error);
  }
}
const close_=()=>{
  setTimeout(()=>{
    setcon_modal(false)
  },1500)
}
useFocusEffect(
  React.useCallback(() => {
    const onBackPress = () => {
      // Return true to disable the back button
      navigation.navigate("Home")
      return true;
    };

    // Add event listener for hardware back button press
    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    // Clean up the event listener when component is unmounted
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, [])
);

  return (
    <>
 <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // padding: 10,
      backgroundColor: '#4CA6EA',
      elevation: 4,
    }}>
      {/* Left Icon */}
      <Icon
              name={"left"}
              type={"antDesign"}
              size={28}
              color={"white"}
              style={{marginLeft:wp(2)}}
              onPress={() =>navigation.navigate("Home")}
            />

      {/* Middle Text */}
      <Text style={{
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color:"#fff",
        flex: 1,
        marginLeft:wp(13),
        marginTop:Platform.OS==="ios"?hp(3):hp(0)
      }}>Home</Text>

      {/* Right Image and Menu Icon */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}>
         <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Image
          source={darkBlue}
          style={{
            height: hp("8"),
            width: wp("12"),
            marginRight: 10,
            borderRadius: 15,
          }}
        />
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => {
              setmodalContainer_menu(true)
            }}
          >
        <Icon
              name={"menu"}
              type={"materialCommunity"}
              size={30}
              color={"#fff"}
            />
        </TouchableOpacity>
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalContainer_menu}>

            <TouchableOpacity style={styles.modalContainer_option_top} onPress={() => { setmodalContainer_menu(false) }}>
              <View style={styles.modalContainer_option_sub}>



                <TouchableOpacity style={styles.modalContainer_option_view}>
                  <Icon
                    name={"anchor"}
                    type={"materialCommunity"}
                    size={30}
                    color={"gray"}
                  />
                  <Text style={styles.modalContainer_option_text}>Anchor Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalContainer_option_view}>
                  <Icon
                    name={"badge-account-outline"}
                    type={"materialCommunity"}
                    size={30}
                    color={"gray"}
                  />
                  <Text style={styles.modalContainer_option_text}>KYC</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalContainer_option_view}>
                  <Icon
                    name={"playlist-check"}
                    type={"materialCommunity"}
                    size={30}
                    color={"gray"}
                  />
                  <Text style={styles.modalContainer_option_text}>My Subscription</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalContainer_option_view} onPress={() => {
                  console.log('clicked');
                  const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
                  AsyncStorage.removeItem(LOCAL_TOKEN);
                  setmodalContainer_menu(false)
                  navigation.navigate('exchangeLogin');
                }}>
                  <Icon
                    name={"logout"}
                    type={"materialCommunity"}
                    size={30}
                    color={"#fff"}
                  />
                  <Text style={[styles.modalContainer_option_text, { color: "#fff" }]}>Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalContainer_option_view} onPress={() => { setmodalContainer_menu(false) }}>
                  <Icon
                    name={"close"}
                    type={"materialCommunity"}
                    size={30}
                    color={"#fff"}
                  />
                  <Text style={[styles.modalContainer_option_text, { color: "#fff" }]}>Close Menu</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
      </View>
    </View>
<Modal
      animationType="fade"
      transparent={true}
      visible={modalContainer_menu}>
       
      <TouchableOpacity style={styles.modalContainer_option_top}  onPress={()=>{setmodalContainer_menu(false)}}> 
      <View style={styles.modalContainer_option_sub}>
     

      <TouchableOpacity style={styles.modalContainer_option_view}>
      <Icon
        name={"anchor"}
        type={"materialCommunity"}
        size={30}
        color={"gray"}
      />
      <Text style={styles.modalContainer_option_text}>Anchor Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.modalContainer_option_view}>
      <Icon
        name={"badge-account-outline"}
        type={"materialCommunity"}
        size={30}
        color={"gray"}
      />
      <Text style={styles.modalContainer_option_text}>KYC</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.modalContainer_option_view} onPress={()=>{navigation.navigate("Home")}}>
      <Icon
        name={"wallet-outline"}
        type={"materialCommunity"}
        size={30}
        color={"white"}
      />
      <Text style={[styles.modalContainer_option_text,{color:"white"}]}>Wallet</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.modalContainer_option_view}   onPress={() => {
        console.log('clicked');
        const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
        AsyncStorage.removeItem(LOCAL_TOKEN);
        setmodalContainer_menu(false)
        navigation.navigate('exchangeLogin');
      }}>
      <Icon
        name={"logout"}
        type={"materialCommunity"}
        size={30}
        color={"#fff"}
      />
      <Text style={[styles.modalContainer_option_text,{color:"#fff"}]}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.modalContainer_option_view} onPress={()=>{setmodalContainer_menu(false)}}>
      <Icon
        name={"close"}
        type={"materialCommunity"}
        size={30}
        color={"#fff"}
      />
      <Text style={[styles.modalContainer_option_text,{color:"#fff"}]}>Close Menu</Text>
      </TouchableOpacity>
      </View>
      </TouchableOpacity>
    </Modal>

      
    <ScrollView
    style={{ backgroundColor: "#011434"}}
      contentContainerStyle={{
        // paddingBottom: hp(20),
        backgroundColor: "#131E3A",
      }}
    >
      
      <View style={styles.container}>
      
               <View style={styles.container_a}>
                  {/* <View style={{flexDirection:"row",justifyContent:"space-between",zIndex:20,position:"absolute",width:wp(95),marginTop:80}}> */}
                 {ShowButtonLeft? <TouchableOpacity style={{zIndex:20,position:"absolute",width:wp(8),marginTop:80,backgroundColor:"rgba(255,255,255,0.2)",borderRadius:10,padding:5}} onPress={() => {
          if (AnchorViewRef.current && contentWidth !== 0) {
            const backOffset = (AnchorViewRef.current.contentOffset ? AnchorViewRef.current.contentOffset.x : 0) - 3 * contentWidth / Anchor.length;
            handleScroll(backOffset);

          }}}><Icon name={"left"} type={"antDesign"} size={25} color={"white"} style={{marginRight:5}}/>
               </TouchableOpacity>:<></>}

              {ShowButtonRight? <TouchableOpacity style={{zIndex:20,position:"absolute",width:wp(8),marginTop:80,backgroundColor:"rgba(255,255,255,0.2)",borderRadius:10,padding:5,alignSelf:"flex-end"}} onPress={() => {
          if (AnchorViewRef.current && contentWidth !== 0) {
            const nextOffset = (AnchorViewRef.current.contentOffset ? AnchorViewRef.current.contentOffset.x : 0) + 3 * contentWidth / Anchor.length;
            handleScroll(nextOffset);
          }
        }}><Icon name={"right"} type={"antDesign"} size={25} color={"white"}/></TouchableOpacity>:<></>}
                  {/* </View> */}
               <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
               <Text style={{textAlign:"left",marginHorizontal:10,marginTop:10,fontWeight: "bold",fontSize:20,color:"#fff"}}>Anchors</Text>
                <TouchableOpacity style={{flexDirection:"row",justifyContent:"center",alignItems:"center"}} onPress={()=>{navigation.navigate("Home")}}>
                <Icon
                      name={"chevron-left"}
                      type={"materialCommunity"}
                      color={"#4CA6EA"}
                      size={24}
                      style={{marginTop:13}}
                    />
                <Text style={{marginLeft:-5,textAlign:"left",marginHorizontal:10,marginTop:10,fontWeight: "300",fontSize:20,color:"#4CA6EA"}}>Wallet</Text>
                </TouchableOpacity>
               </View>

      <ScrollView ref={AnchorViewRef} horizontal style={{backgroundColor:"rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)",padding:8,borderRadius:10,marginHorizontal:19,marginLeft:wp(6)}} showsHorizontalScrollIndicator={false} onContentSizeChange={(width) => setContentWidth(width)} onScroll={handleScroll_new}>
              {Anchor.map((list, index) => {
                return (
                  <View>
                    <TouchableOpacity  onPress={()=>{setAnchor_modal(true),setindex_Anchor(index)}} style={[styles.card,{backgroundColor:list.status==="Pending"?"#2b3c57":"#011434"}]} key={index}>
                      <View style={{ width: "30%", height: "27%", borderBottomLeftRadius: 10, borderColor: 'rgba(122, 59, 144, 1)rgba(100, 115, 197, 1)', borderWidth: 1.9, position: "absolute", alignSelf: "flex-end", borderTopRightRadius: 10,zIndex:20 }}>
                        <Icon name={list.status === "Pending" ? "clock-time-two-outline" : "check-circle-outline"} type={"materialCommunity"} color={list.status === "Pending" ? "yellow" : "#35CA1D"} size={24} />
                      </View>
                     <View style={styles.image}>
                     <Image
                        source={list.image}
                        style={{width: 70,
                          height: 65,
                          borderRadius:list.name==="Mykobo"? 100:10}}
                      />
                     </View>
                      <Text style={styles.name}>{list.name}</Text>
                      <Text style={[styles.status, { color: list.status === "Pending" ? "yellow" : "#35CA1D" }]}>{list.status}</Text>
                    </TouchableOpacity>
                        {kyc_status===false?<TouchableOpacity onPress={()=>{submit_kyc()}}>
                      {list.name==="SwiftEx"&&<Animated.View style={[styles.frame_1, { borderColor: shiningAnimation }]}>
               <Text style={{color:'green',fontSize:16,textAlign:"center"}}>Submit KYC</Text>
                </Animated.View>}
                    </TouchableOpacity>:<></>}
                    <Modal
      animationType="fade"
      transparent={true}
      visible={kyc_modal}>
      <View style={styles.kyc_Container}>
        <View style={styles.kyc_Content}>
    <Image source={darkBlue} style={styles.logoImg_kyc} />
          <Text style={styles.kyc_text}>Document submiting for KYC</Text>
          <ActivityIndicator size="large" color="green" />
        </View>
      </View>
    </Modal>
                  </View>
                )
              })}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={Anchor_modal}
        // onRequestClose={closeModal}
      >
      
      <View style={{backgroundColor: '#fff',borderRadius: 10,marginHorizontal:10,height:hp(80),marginTop:hp(10)}}>
          <TouchableOpacity style={{alignSelf:"flex-end",padding:10}} onPress={()=>{setAnchor_modal(false),setindex_Anchor(0)}}>
          <Icon name={"close"} type={"materialCommunity"} size={30} color={"black"}/>
          </TouchableOpacity>
           {Anchor.map((list,index)=>{
              if(index===index_Anchor)
              {
                  return(
                    <View style={{flex:1}}>
                     <View style={{flexDirection:"row"}}>
                     <View style={styles.image}>
                     <Image
                        source={list.image}
                        style={{width: 75,
                          height: 65,
                          borderRadius:list.name==="Mykobo"? 30:10,
                          marginLeft:10}}
                      />
                     </View>
                     <Text style={{fontSize:19,textAlign:"center",marginTop:19,fontWeight:"bold"}}>{list.name}</Text>
                     </View>
                     <View style={{flexDirection:"row",marginStart:10,marginTop:10,borderWidth:1.3,margin:10,padding:5,borderBottomColor:"black",borderTopColor:"white",borderLeftColor:"white",borderRightColor:"white"}}>
                       <Icon name={"map-marker"} type={"materialCommunity"} size={30} color={"#212B53"}/>
                       <ScrollView style={{height:hp(14)}}>
                        <Text style={{marginStart:10,marginTop:5}}>{list.city}</Text>
                       </ScrollView>
                      <View>
                      </View>
                     </View>
                     <View style={{borderWidth:1.3,margin:10,padding:5,borderBottomColor:"black",borderTopColor:"white",borderLeftColor:"white",borderRightColor:"white"}}>
                     <Text style={{marginStart:21,marginTop:5,fontSize:20}}>Crypto Assets</Text>
                      <Text style={{marginStart:29,marginTop:9,fontSize:16}}>{list.Crypto_Assets}</Text>
                     </View>

                     <View style={{borderWidth:1.3,margin:10,padding:5,borderBottomColor:"black",borderTopColor:"white",borderLeftColor:"white",borderRightColor:"white"}}>
                     <Text style={{marginStart:26,marginTop:5,fontSize:20}}>Fiat Assets</Text>
                      <Text style={{marginStart:29,marginTop:9,fontSize:16}}>{list.Fiat_Assets}</Text>
                     </View>

                     <View style={{borderWidth:1.3,margin:10,padding:5,borderBottomColor:"black",borderTopColor:"white",borderLeftColor:"white",borderRightColor:"white"}}>
                     <Text style={{marginStart:26,marginTop:5,fontSize:20}}>Payment Rails</Text>
                      <Text style={{marginStart:29,marginTop:9,fontSize:16}}>{list.Payment_Rails}</Text>
                     </View>
                    </View>
                  )
              }
           })}
        </View>

      </Modal>
    </View>
              <View style={[styles.linearContainer,{backgroundColor:"rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)"}]}>
              <SELECT_WALLET_EXC
        visible={VISIBLE_SELECT}
        setVisible={setVISIBLE_SELECT}
        setModalVisible={setVISIBLE_SELECT}
      />
            {state.wallet ? (
              <View>
                <View style={styles.iconwithTextContainer}>
                  <TouchableOpacity style={[styles.walletContainer,{ borderColor:"rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)",borderBottomColor:"#4CA6EA",borderWidth:1}]} onPress={()=>{navigation.navigate("MyWallet")}}>
                    <Text style={styles.myWallet}>My Wallet </Text>
                    <Icon
                      name={"wallet"}
                      type={"materialCommunity"}
                      color={"rgba(129, 108, 255, 0.97)"}
                      size={24}
                    />
                    {/* <Image source={walletImg} style={styles.walletImg} /> */}
                  </TouchableOpacity>
                  <View style={styles.walletContainer}>
                    {/* <Icon
                      name={"check-outline"}
                      type={"materialCommunity"}
                      color={"#008C62"}
                    /> */}
                    <Text style={styles.connectedText}>Connected!</Text>
                  </View>
                </View>
                <View style={{}}>
                  <View style={{flexDirection:"row",marginTop:19}}>
                    <Text style={styles.textColor}>Ethereum Address </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: wp(60),borderColor:"#485DCA",borderWidth:0.9,paddingVertical:2.2,borderRadius:5}}>
                   <Text style={[styles.textColor,styles.width_scrroll]}>{state.wallet.address}</Text>
                    </ScrollView>
                    <TouchableOpacity onPress={()=>{copyToClipboard(state.wallet.address)}}>
                    <Icon
                      name={"content-copy"}
                      type={"materialCommunity"}
                      color={"rgba(129, 108, 255, 0.97)"}
                      size={24}
                      style={{marginTop:0.3,marginLeft:2.9}}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>{navigation.navigate("AllWallets")}}>
                    <Text style={{color:"#4CA6EA",marginLeft:wp(1),marginTop:hp(0.5),paddingHorizontal:(1.5)}}>Manage</Text>
                    </TouchableOpacity>
                  </View> 

                  <View style={{flexDirection:"row",marginTop:10}}>
                    <Text style={styles.textColor}>Stellar Public Key   </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: wp(60),borderColor:"#485DCA",borderWidth:0.9,paddingVertical:2.9,borderRadius:5}}>
                   <Text style={[styles.textColor,styles.width_scrroll]}>{steller_key}</Text>
                    </ScrollView>
                    <TouchableOpacity onPress={()=>{copyToClipboard(steller_key)}}>
                    <Icon
                      name={"content-copy"}
                      type={"materialCommunity"}
                      color={"rgba(129, 108, 255, 0.97)"}
                      size={24}
                      style={{marginTop:0.3,marginLeft:wp(1)}}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>{setVISIBLE_SELECT(true)}}>
                    <Text style={{color:"#4CA6EA",marginLeft:wp(1),marginTop:hp(0.5),marginRight:wp(3)}}>Import</Text>
                    </TouchableOpacity>
                  </View> 

                  
                </View>
              </View>
            ) : (
              <Text style={styles.textColor}>
                Please select a wallet first!
              </Text>
            )}



         
        </View>
       

         {walletType === "Ethereum" || walletType === "Multi-coin" ? (
          // <Text style={{ color: "white" }}>{walletType} Wallet Connected</Text>
          <></>
        ) : (
          <Text style={styles.whiteColor}>
            Only Ethereum and Multi-coin based wallets are supported.
          </Text>
        )}
      </View>

<View style={{backgroundColor:"#011434"}}>
{profile && (
          <View>
              {profile.isVerified===true ? (
                <View style={{flexDirection:"row",justifyContent:"center"}}>
                  <TouchableOpacity 
                    style={[styles.PresssableBtn,{width: wp(93),marginLeft:3,height:hp(8)}]}
                    onPress={() => {
                     // setOpen(true)
                        Offer_condition(Offer_active)
                    }}
                  >
                    <Text style={{ color: "#fff",fontSize:19,fontWeight:"bold" }}>Trade</Text>
                  </TouchableOpacity>
                  
                  {/* <NewOfferModal
                    user={profile}
                    open={open}
                    onCrossPress={()=>{setOpen(false)}}
                    setOpen={setOpen}
                    getOffersData={getOffersData}
                  /> */}
                </View>
              ) : (
               <View style={{flexDirection:"row",justifyContent:"center",marginVertical:5}}>
                <Text style={styles.kycText}>FATCHING UPDATING {profile.isVerified===false?kyc():""}</Text>
                <ActivityIndicator color={"green"}/>
               </View>
              )}
            </View>
          // </View>
        )}
</View>
        <View style={{ backgroundColor: "#011434",flexDirection:"row",justifyContent:"center" }}>
          <TouchableOpacity
            style={[styles.PresssableBtn,{flexDirection:"row",justifyContent:"center",marginTop:1,width: wp(45),height:hp(8),marginLeft:3,paddingHorizontal:wp(0)}]}
            onPress={() => {
              navigation.navigate("classic",{Asset_type:"Ethereum"})
            }}
          >
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "bold",textAlign:"center"}}>Bridge Tokens</Text>
          </TouchableOpacity>
          <TouchableOpacity 
                    style={[styles.PresssableBtn,{height:hp(8),width: wp(45),marginLeft:10,marginTop:1,justifyContent:"center"}]}
                    onPress={() => {
                      navigation.navigate("Assets_manage");
                    }}
                  >
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "bold",textAlign:"center"}}>Assets</Text>

                    {/* <Text style={{ color: "#fff",fontSize:18,fontWeight:"bold" }}>Assets</Text> */}
                  </TouchableOpacity>
        </View>

  <View style={Platform.OS === "ios" ?{justifyContent:'center',alignItems:'center',backgroundColor:"#011434"} :{justifyContent:'center',alignItems:'center',backgroundColor:"#011434"}}>
    <View style={{position:"relative",zIndex:20,marginBottom:-30,marginTop:10,alignSelf:"flex-end",marginRight:25}}>
    <Icon
        name={"chevron-down"}
        type={"materialCommunity"}
        size={28}
        color={"white"}
        onPress={()=>{setopen_chart_api(true)}}
      />
    </View>

    
    { API_data.length===0?<ActivityIndicator color={"green"} size={"large"}/>:
    <Chart
      style={{  width:370,height:310, padding: 1 }}
      data={chartData}
      padding={{ left: 40, bottom: 30, right: 20, top: 30 }}
      xDomain={{ min: Math.min(...chartData.map(d => d.x)), max: Math.max(...chartData.map(d => d.x)) }}
      yDomain={{ min: Math.min(...chartData.map(d => d.y)), max: Math.max(...chartData.map(d => d.y)) }}
    >
      <VerticalAxis
        tickCount={10}
        theme={{
          grid:{visible:false},
          labels: {
            formatter: (v) => v.toFixed(1),
            label: { color: "#fff" }
          },
        }}
      />
      <HorizontalAxis
        tickCount={10}
        theme={{
          grid:{visible:false},
          labels: {
            formatter: (v) => {
              const date = new Date(v);
              return `${date.getHours()}:${date.getMinutes()}`;
            },
            label: { color: "#fff" }
          }
        }}
      />
      <Area
        theme={{ gradient: { from: { color: '#44bd32' }, to: { color: '#44bd32', opacity: 0.2 } } }}
      />
      <Line
        tooltipComponent={
          <Tooltip
            theme={{
              label: {
                color: 'white',
                fontSize: 11,
                fontWeight: 700,
                textAnchor: 'middle',
                opacity: 1,
                dx: 0,
                dy: 16.5,
              },
              shape: {
                width: 80,
                height: 30,
                dx: 0,
                dy: 20,
                rx: 4,
                color: 'black',
              }
            }}
            formatter={(d) => `Close: ${d.y.toFixed(10)}\nAvg: ${d.avg.toFixed(10)}`}
          />
        }
        theme={{
          stroke: { color: '#44bd32', width: 5 },
          scatter: {
            default: { width: 8, height: 8, rx: 4, color: '#44ad32' },
            selected: { color: 'red' }
          }
        }}
      />
    </Chart>
    }

        <TouchableOpacity style={{backgroundColor: "rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)",
    padding: hp(0.5),
    width: wp(95),
    alignSelf: "center",
    borderRadius: hp(1.6),
    marginBottom: hp(1),
    marginTop:hp(1.4)}}
    onPress={()=>{setopen_chart_api(true)}}
    >
              <Text style={{fontSize: 19,color: "white",textAlign:"center",fontWeight:"500"}}>Trade between {chart_api[chart_index].name==="USDC"?chart_api[chart_index].name+"  ":chart_api[chart_index].name}vs  {chart_api[chart_index].name_0}</Text>
        </TouchableOpacity>
        </View> 
        <Modal
        animationType="slide"
        transparent={true}
        visible={open_chart_api}
      >
        <TouchableOpacity style={styles.chooseModalContainer} onPress={() => setopen_chart_api(false)}>
          <View style={[styles.chooseModalContent]}>
          <Text style={{fontSize:21,color:"#fff"}}>Select Assets Pair</Text>
            <FlatList
              data={chart_api}
              renderItem={chooseRenderItem_1}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        </TouchableOpacity>
      </Modal>
            <OfferListViewHome/>
    </ScrollView>
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    width: wp(100),
    // height: hp(20),
    display: "flex",
    alignContent: "center",
    alignItems: "center",
    textAlign: "center",
    // backgroundColor: "#131E3A",   //OLD
    backgroundColor: "#011434",
  },
  linearContainer: {
    width: wp(94),
    padding: hp(2),
    paddingVertical: hp(3),
    borderRadius: hp(2),
    // marginTop: hp(3),
  },
  textColor: {
    color: "#fff",
  },
  iconwithTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  copyTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: wp(1.9),
  },
  copyText: {
    color: "#2027AC",
  },
  myWallet: {
    fontWeight: "bold",
    fontSize:20,
    color:"#fff"
  },
  width_scrroll:{
    marginLeft: 1.9
},
  walletContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  connectedText: {
    color: "#35CA1D",
  },
  walletImg: {
    height: hp(2.8),
    width: wp(5),
    alignSelf: "center",
  },
  copyRideContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingRight: wp(6.8),
    width: wp(90),
  },
  copyText: {
    textAlign: "right",
    color: "black",
    marginHorizontal: wp(5),
  },
  messageStyle: {
    color: "black",
    width: wp(45),
  },
  PresssableBtn: {
    backgroundColor: "rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)",
    padding: hp(2),
    width: wp(93.6),
    borderColor:"rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
    borderWidth:1.3,
    alignSelf: "center",
    paddingHorizontal: wp(3),
    borderRadius: hp(2.5),
    marginBottom: hp(1),
    alignItems: "center",
    marginTop:hp(1.4)
  },
  addofferText: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp(50),
    marginLeft: wp(40),
    alignItems: "center",
  },
  whiteColor: {
    color: "#fff",
    marginVertical: hp(2),
    width: wp(80),
  },
  toggleContainer: {
    alignSelf: "center",
    marginVertical: hp(2),
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
  logoImg: {
    height: hp("15"),
    width: wp("15"),
    alignSelf: "center",
  },
  actionText: {
    color: "#fff",
    marginBottom: hp(2),
  },
  kycText: {
    color: "green",
    // marginTop: hp(2),
    fontSize:19,
  },
  bidText: {
    color: "#fff",
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
    marginLeft: wp(22),
  },
  text_TOP: {
    color: "white",
    fontSize:19,
    fontWeight:"bold",
    alignSelf: "center",
    marginStart:wp(35)
  },
  text1_ios_TOP: {
    color: "white",
    fontWeight: "700",
    alignSelf: "center",
    marginStart: wp(31),
    top:19,
    fontSize:17
  },
  container_a: {
    flex: 1,
    width:"94%",
    // alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor:"rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)",
    margin:10,
    borderRadius:10
  },
  card: {
    marginRight: 10,
    borderWidth: 1.9,
    borderColor: 'rgba(122, 59, 144, 1)rgba(100, 115, 197, 1)',
    borderRadius: 10,
    padding: 8,
    backgroundColor:"#011434"
  },
  image: {
    width: 90,
    height: 65,
    borderRadius: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
    color:"#fff"
  },
  status: {
    fontSize: 14,
    color: 'yellow',
  },
  frame_1: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding:3,
    width:"90%",
    marginTop:3
  },
  kyc_Container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  kyc_Content: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  kyc_text: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoImg_kyc: {
    height: hp("9"),
    width: wp("12"),
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
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
chooseModalContent: {
  backgroundColor: 'rgba(33, 43, 83, 1)',
  padding: 20,
  borderRadius: 10,
  width: '80%',
  maxHeight: '80%',
},
chooseItemContainer: {
  marginVertical: 3,
  flexDirection: 'row',
  alignItems: 'center',
  borderColor: 'rgba(28, 41, 77, 1)',
  borderWidth: 0.9,
  borderBottomColor: '#fff',
  marginBottom: 4,
},
chooseItemText: {
  fontSize: 19,
  color: '#fff',
  marginLeft:wp(3)
},
  
});
