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
  StatusBar,
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
import { Exchange_screen_header } from "../../../../reusables/ExchangeHeader";
import { Charts_Loadings, Exchange_single_loading } from "../../../../reusables/Exchange_loading";
import { LineChart } from "react-native-gifted-charts";
import useFirebaseCloudMessaging from "../../../../notifications/firebaseNotifications";
import DeviceInfo from 'react-native-device-info';
// import StellarSdk from '@stellar/stellar-sdk';
const StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();

export const HomeView = ({ setPressed }) => {
  const { FCM_getToken, requestUserPermission } = useFirebaseCloudMessaging();
  const dispatch_ = useDispatch()
  const [modalContainer_menu,setmodalContainer_menu]=useState(false);
  const AnchorViewRef = useRef(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [ShowButtonRight,setShowButtonRight]=useState(false);
  const [ShowButtonLeft,setShowButtonLeft]=useState(false);
  const [open_chart_api,setopen_chart_api]=useState(false);
  const [VISIBLE_SELECT,setVISIBLE_SELECT]=useState(false);
  const [Wallet_activation,setWallet_activation]=useState(false)
  const [chart_api,setchart_api]=useState([
    {id:0,name:"XLM  ",name_0:"USDC",url:"https://horizon.stellar.lobstr.co/trade_aggregations?base_asset_type=native&counter_asset_type=credit_alphanum4&counter_asset_code=USDC&counter_asset_issuer=GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN&start_time=1722320811000&resolution=60000&offset=0&limit=30&order=desc",img_0:'https://s2.coinmarketcap.com/static/img/coins/64x64/512.png',img:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"},
    {id:1,name:"ETH  ",name_0:"USDC",url:"https://horizon.stellar.lobstr.co/trade_aggregations?base_asset_type=credit_alphanum4&base_asset_code=ETH&base_asset_issuer=GBFXOHVAS43OIWNIO7XLRJAHT3BICFEIKOJLZVXNT572MISM4CMGSOCC&counter_asset_type=credit_alphanum4&counter_asset_code=USDC&counter_asset_issuer=GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN&start_time=1722320811000&resolution=60000&offset=0&limit=30&order=desc",img:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",img_0:"https://tokens.pancakeswap.finance/images/0x2170Ed0880ac9A755fd29B2688956BD959F933F8.png"},
    {id:2,name:"XLM  ",name_0:"EURC",url:"https://horizon.stellar.lobstr.co/trade_aggregations?base_asset_type=native&counter_asset_type=credit_alphanum4&counter_asset_code=EURC&counter_asset_issuer=GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2&start_time=1722322255000&resolution=60000&offset=0&limit=30&order=desc",img:"https://assets.coingecko.com/coins/images/26045/thumb/euro-coin.png?1655394420",img_0:'https://s2.coinmarketcap.com/static/img/coins/64x64/512.png'},
    {id:3,name:"USDC",name_0:"EURC",url:"https://horizon.stellar.org/trade_aggregations?base_asset_type=credit_alphanum4&base_asset_code=USDC&base_asset_issuer=GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN&counter_asset_type=credit_alphanum4&counter_asset_code=EURC&counter_asset_issuer=GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2&start_time=1722229906000&resolution=900000&offset=0&limit=30&order=desc",img:"https://assets.coingecko.com/coins/images/26045/thumb/euro-coin.png?1655394420",img_0:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"},
  ])
  const [chart_index,setchart_index]=useState(0);
  const chooseRenderItem_1 = ({ item }) => (
    <TouchableOpacity onPress={() => {setchart_index(item.id),setopen_chart_api(false)}} style={[styles.chooseItemContainer,{borderRadius:5,height:hp(6),justifyContent:'space-around'}]}>
      <Image source={ { uri: item.img_0 }} style={{width:wp(8),height:hp(4)}}/>
      <Text style={[styles.chooseItemText]}>{item.name}</Text>
      <Text style={{color:"#fff",fontSize:19}}>VS</Text>
      <Image source={ { uri: item.img }} style={{width:wp(8),height:hp(4),marginLeft:wp(3)}}/>
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
  const [steller_key,setsteller_key]=useState();
  const [loading,setloading]=useState(true);
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
    // {name:"MoneyGram",status:"Pending",image: require('../../../../../../assets/MONEY_GRAM.png'),city:"Afghanistan / Albania / Angola / Anguilla / Antigua and Barbuda / Argentina / Armenia / Aruba / Australia / Bahamas / Bahrain / Barbados / Belarus / Belgium / Belize / Benin / Berumda / Bhutan / Bolivia / Bosnia and Herzegovina / Botswana / Brazil / Brunei Darussalam / Bulgaria / Burkina Faso / Burundi / Cambodia / Cameroon / Canada / Cape Verde / Cayman Islands / Central African Republic / Chad / Chile / Colombia / Comoros / Costa Rica / Cote D'Ivoire / Croatia / Curacao / Cyprus / Czech Republic / Democratic Republic of the Congo / Denmark / Djibouti / Dominica / Dominican Republic / Ecuador / El Salvador / Equatorial Guinea / Estonia / Eswatini / Ethiopia / Fiji / Finland / France / French Guiana / Gabon / Gambia / Georgia / Germany / Ghana / Gibraltar / Greece / Grenada / Guadeloupe / Guam / Guatemala / Guinea / Guinea-Bissau / Guyana / Haiti / Honduras / Hong Kong / Hungary / Iceland / Indonesia / Ireland / Israel / Italy / Jamaica / Japan / Jordan / Kazakhstan / Kenya / Kosovo / Kuwait / Kyrgyzstan / Laos / Latvia / Lebanon / Liberia / Libya / Lithuania / Luxembourg / Macao / Macedonia / Madagascar / Malawi / Malaysia / Maldives / Mali / Malta / Marshall Islands / Martinique / Mauritania / Mauritius / Mayotte / Mexico / Micronesia / Moldova / Mongolia / Montenegro / Montserrat / Mozambique / Myanmar / Namibia / Netherlands / New Zealand / Nicaragua / Niger / Nigeria / Norway / Oman / Palestine / Panama / Paraguay / Peru / Philippines / Poland / Portugal / Puerto Rico / Reunion / Romania / Rwanda / Saint Kitts And Nevis / Saint Lucia / Saint Martin / Saint Vincent And The Grenadines / Samoa / Sao Tome And Principe / Saudi Arabia / Senegal / Serbia / Seychelles / Sierra Leone / Singapore / Sint Maarten / Slovakia / Solomon Islands / South Korea / South Sudan / Spain / Sri Lanka / Suriname / Sweden / Switzerland / Tanzania / Thailand / Timor-Leste / Togo / Tonga / Trinidad And Tobago / Turks And Caicos Islands / Tuvalu / Uganda / Ukraine / United Arab Emirates / United Kingdom / United States / Uruguay / Uzbekistan / Vanuatu / Venezuela / Vietnam / Virgin Islands, British / Virgin Islands, U.S. / Yemen / Zambia",Crypto_Assets:"USDC",Payment_Rails:"Global Rails, Cash" },
    {name:"Alchemy Pay",status:"Active",image: require('../../../../../../assets/AlcamyPay.jpg'),city:"Afghanistan / Albania / Algeria / Andorra / Angola / Anguilla / Antigua and Barbuda / Argentina / Armenia / Aruba / Australia / Austria / Azerbaijan / Bahamas / Bahrain / Bangladesh / Barbados / Belarus / Belgium / Belize / Benin / Bermuda / Bhutan / Bolivia / Bosnia and Herzegovina / Botswana / Brazil / Brunei Darussalam / Bulgaria / Burkina Faso / Burundi / Cambodia / Cameroon / Canada / Cape Verde / Cayman Islands / Central African Republic / Chad / Chile / China / Colombia / Comoros / Congo - Brazzaville / Congo - Kinshasa / Costa Rica / Cote D'Ivoire / Croatia / Cuba / Curacao / Cyprus / Czech Republic / Democratic Republic of the Congo / Denmark / Djibouti / Dominica / Dominican Republic / Ecuador / El Salvador / Equatorial Guinea / Eritrea / Estonia / Eswatini / Ethiopia / Fiji / Finland / France / French Guiana / Gabon / Gambia / Georgia / Germany / Ghana / Gibraltar / Global / Greece / Greenland / Grenada / Guadeloupe / Guam / Guatemala / Guinea / Guinea-Bissau / Guyana / Haiti / Honduras / Hong Kong / Hungary / Iceland / India / Indonesia / Ireland / Israel / Italy / Jamaica / Japan / Jordan / Kazakhstan / Kenya / Kosovo / Kuwait / Kyrgyzstan / Laos / Latvia / Lebanon / Liberia / Libya / Lithuania / Luxembourg / Macao / Macedonia / Madagascar / Malawi / Malaysia / Maldives / Mali / Malta / Marshall Islands / Martinique / Mauritania / Mauritius / Mayotte / Mexico / Micronesia / Moldova / Monaco / Mongolia / Montenegro / Montserrat / Mozambique / Myanmar / Namibia / Netherlands / New Zealand / Nicaragua / Niger / Nigeria / Norway / Oman / Pakistan / Palestine / Panama / Papua New Guinea / Paraguay / Peru / Philippines / Poland / Portugal / Puerto Rico / Qatar / Romania / Rwanda / Réunion / Saint Kitts And Nevis / Saint Lucia / Saint Martin / Saint Vincent And The Grenadines / Samoa / Sao Tome And Principe / Saudi Arabia / Senegal / Serbia / Seychelles / Sierra Leone / Singapore / Sint Maarten / Slovakia / Slovenia / Solomon Islands / South Africa / South Korea / South Sudan / Spain / Sri Lanka / Suriname / Sweden / Switzerland / Taiwan / Tanzania / Thailand / Timor-Leste / Togo / Tonga / Trinidad And Tobago / Turkey / Turks And Caicos Islands / Tuvalu / Uganda / Ukraine / United Arab Emirates / United Kingdom / United States / Uruguay / Uzbekistan / Vanuatu / Venezuela / Vietnam / Virgin Islands, British / Virgin Islands, U.S. / Yemen / Zambia",Crypto_Assets:"XLM",Fiat_Assets:"$ USD",Payment_Rails:"Apple PayBank, TransferCardGoogle, PayLocal, MethodSEPA" },
    {name:"Mykobo",status:"Active",image: require('../../../../../../assets/MYKOBO.png'),city:"Austria / Belgium / Bulgaria / Croatia / Cyprus / Czech Republic / Denmark / Estonia / Finland / France / Germany / Greece / Hungary / Ireland / Italy / Lithuania / Luxembourg / Malta / Netherlands / Poland / Portugal / Romania / Slovakia / Slovenia / Spain / Sweden",Fiat_Assets:"€ EUR",Crypto_Assets:"EURC",Payment_Rails:"Bank Transfer, SEPA" },
    // {name:"Banxa",status:"Pending",image: require('../../../../../../assets/BANXA.png'),city:"Australia / Austria / Brazil / Canada / Hong Kong / India / Indonesia / Mexico / Netherlands / Philippines / South Africa / Switzerland / Turkey / United States",Fiat_Assets:"$ USD",Crypto_Assets:"USDC ,XLM",Payment_Rails:"Card, Apple Pay, Google Pay, ACH, SEPA, Bank Transfer, Local Method"},
    // {name:"Clpx",status:"Pending",image: require('../../../../../../assets/CLPX.png'),city:"Chile",Crypto_Assets:"CLPX" },
    // {name:"Clickpesa",status:"Pending",image: require('../../../../../../assets/CLICKPESA.png'),city:"Kenya / Rwanda / Tanzania",Crypto_Assets:"USDC, XLM, RWF, TZS, KES",Fiat_Assets:"$ USD"},
    // {name:"Finclusive",status:"Pending",image: require('../../../../../../assets/FINCLUSIVE.png'),city:"Benin / Burkina Faso / Cape Verde / Cote D'Ivoire / Gambia / Ghana / Guinea / Guinea-Bissau / Liberia / Mali / Mauritania / Niger / Nigeria / Senegal / Sierra Leone / Togo",Crypto_Assets:"USDC",Fiat_Assets:"$ USD" },
  ];
  const [steller_key_private,setsteller_key_private]=useState("");
  const [Anchor_modal,setAnchor_modal]=useState(false);
  const [index_Anchor,setindex_Anchor]=useState(0);
  const [kyc_modal,setkyc_modal]=useState(false);
  const [kyc_status,setkyc_status]=useState(true);
  const [con_modal,setcon_modal]=useState(false)
  const [api_data_loading,setapi_data_loading]=useState(false)
  const [lineColor, setlineColor] = useState();
  const [Data, setData] = useState([]);
  const [lastData, setlastData] = useState([]);
  const [points_data,setpoints_data]=useState();
  const [points_data_time,setpoints_data_time]=useState();

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

  useEffect(()=>{
    const fetch_color=async()=>{
     try {
      const last_Value = Data?.close;
      const second_LastValue = lastData?.close;
      const line_Color = last_Value > second_LastValue ? "green" : "red";      
      setlineColor(line_Color)
    } catch (error) {
      console.log("*----",error)
    }
  }
  fetch_color()
},[Data])
  //activate stellar account function
  const active_account = async () => {
    console.log("<<<<<<<clicked");
    
    try {
      // Activate wallet feedback immediately
      setWallet_activation(true);
  
      // Retrieve token and stored email in parallel
      const [token, storedEmail] = await Promise.all([
        getToken(),
        AsyncStorageLib.getItem('user_email')
      ]);
  
      console.log("Token:", token);
  
      const postData = {
        email: storedEmail,
        publicKey: state?.STELLAR_PUBLICK_KEY,
        wallletPublicKey:state?.ETH_KEY
      };
  
      // Update public key by email
      const response = await fetch(`${REACT_APP_HOST}/users/updatePublicKeyByEmail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(postData),
      });
      
      const data = await response.json();
      console.log("--->>>>", data);
  
      if (data.message === "Funded successfully") {
        // Dispatch success action and load account details from Stellar in parallel
       await dispatch_({
          type: RAPID_STELLAR,
          payload: {
            ETH_KEY: state.ETH_KEY,
            STELLAR_PUBLICK_KEY: state.STELLAR_PUBLICK_KEY,
            STELLAR_SECRET_KEY: state.STELLAR_SECRET_KEY,
            STELLAR_ADDRESS_STATUS: true
          },
        });
        await dispatch_({
          type: SET_ASSET_DATA,
          payload:[{"asset_type": "native", "balance": "5.0000000", "buying_liabilities": "0.0000000", "selling_liabilities": "0.0000000"}],
        })
        setWallet_activation(false);

      } else if (data.message === "Error funding account") {
        console.log("Error: Funding account failed.");
        setWallet_activation(false);
      }
  
    } catch (error) {
      console.error('Network or fetch error:', error);
      setWallet_activation(false);
    }
  };
  
  

  
 
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
                    asset: new StellarSdk.Asset("USDC", "GALANI4WK6ZICIQXLRSBYNGJMVVH3XTZYFNIVIDZ4QA33GJLSFH2BSID"),
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
      setloading(true)
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
      setloading(false)
    } catch (error) {
      console.error('Error getting data for key steller keys:', error);
      setloading(true)
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
    if(state.STELLAR_ADDRESS_STATUS===false&&STELLAR_URL.USERTYPE!=="PROD")
    {
      // active_account()
    }
    getAccountDetails();
    getData_new_Kyc()
    getData()
  },[Focused_screen]);
  useEffect(() => {
    getAccountDetails();
    fetchProfileData();
    getData()
    // getOffersData();
    // getBidsData();
    syncDevice();
  }, []);
  useEffect(() => {
    fetchProfileData();
    // getOffersData();
    getData()
    // getBidsData();
    syncDevice();
  }, [change]);

  const syncDevice = async () => {
    const token = await FCM_getToken();
    console.log(token);
    console.log("hi----->>>ttokenb", token);
    const device_info = {
      'deviceBrand': await DeviceInfo.getBrand(),
      'deviceModel': await DeviceInfo.getModel(),
      'systemVersion': await DeviceInfo.getSystemVersion(),
      "deviceUniqueID": await DeviceInfo.getUniqueIdSync(),
      "deviceIP": await DeviceInfo.getIpAddressSync(),
      "deviceType": await DeviceInfo.getDeviceType(),
      "deviceMacAddress": await DeviceInfo.getMacAddress()
    }
    if(!token)
    {
      // const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
      //      AsyncStorage.removeItem(LOCAL_TOKEN);
      //      Navigate()
           
      // navigation.navigate('exchangeLogin')
      // return
    }
    try {
      const { res } = await authRequest(
        `/users/getInSynced/${token}`,
        GET
      );
      if (res.isInSynced) {
        const { err } = await authRequest("/users/syncDevice", POST, {
          fcmRegToken: token,
          deviceInfo:device_info
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
      const { res, err } = await authRequest("/users/:id", GET);
      await AsyncStorage.setItem("user_email",res.email);
      console.log("8888888000------1111-------",res,err)
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
      setData(records[0]);
      setlastData(records[1]);
      setpoints_data(records[0]?.close)
      setpoints_data_time(new Date(parseInt(records[0]?.timestamp)).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }))

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  const chartData = API_data.map(item => ({
    x: new Date(parseInt(item.timestamp)).getTime(), // Convert timestamp to milliseconds
    y: parseFloat(item.close), // Use the 'close' value for the y-axis
    avg: parseFloat(item.avg) // Include the 'avg' value
  }));

  useEffect(() => {
    fetchData()
    // const intervalId = setInterval(fetchData, 1000);
    // return () => clearInterval(intervalId);
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

// const formatDate = (timestamp) => {
//   const date = new Date(Number(timestamp)); // Convert string timestamp to number
//   return `${date.getHours()}:${date.getMinutes()}`; // Format as HH:mm
// };

useEffect(() => {
  if (API_data.length === 0) {
    setapi_data_loading(true);
  } else {
    setapi_data_loading(false); 
  }
}, [API_data]); 
  return (
    <>
           {Platform.OS==="ios"?<StatusBar hidden={true}/>:<StatusBar barStyle={"light-content"} backgroundColor={"#011434"}/>}
    <Exchange_screen_header title="Trade Wallet" onLeftIconPress={() => navigation.navigate("Home")} onRightIconPress={() => console.log('Pressed')} />

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
                 {/* {ShowButtonLeft? <TouchableOpacity style={{zIndex:20,position:"absolute",width:wp(8),marginTop:80,backgroundColor:"rgba(255,255,255,0.2)",borderRadius:10,padding:5}} onPress={() => {
          if (AnchorViewRef.current && contentWidth !== 0) {
            const backOffset = (AnchorViewRef.current.contentOffset ? AnchorViewRef.current.contentOffset.x : 0) - 3 * contentWidth / Anchor.length;
            handleScroll(backOffset);

          }}}><Icon name={"left"} type={"antDesign"} size={25} color={"white"} style={{marginRight:5}}/>
               </TouchableOpacity>:<></>} */}

              {/* {ShowButtonRight? <TouchableOpacity style={{zIndex:20,position:"absolute",width:wp(8),marginTop:80,backgroundColor:"rgba(255,255,255,0.2)",borderRadius:10,padding:5,alignSelf:"flex-end"}} onPress={() => {
          if (AnchorViewRef.current && contentWidth !== 0) {
            const nextOffset = (AnchorViewRef.current.contentOffset ? AnchorViewRef.current.contentOffset.x : 0) + 3 * contentWidth / Anchor.length;
            handleScroll(nextOffset);
          }
        }}><Icon name={"right"} type={"antDesign"} size={25} color={"white"}/></TouchableOpacity>:<></>} */}
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

      <ScrollView ref={AnchorViewRef} horizontal style={{paddingVertical:hp(1),padding:3,borderRadius:10,marginHorizontal:wp(0.1),marginLeft:wp(0.1)}} showsHorizontalScrollIndicator={false} onContentSizeChange={(width) => setContentWidth(width)} onScroll={handleScroll_new}>
              {Anchor.map((list, index) => {
                return (
                  <View>
                    <TouchableOpacity  onPress={()=>{setAnchor_modal(true),setindex_Anchor(index)}} style={[styles.card,{backgroundColor:list.status==="Pending"?"#2b3c57":"#2b3c57"}]} key={index}>
                      <View style={{ width: "30%", height: "27%", position: "absolute", alignSelf: "flex-end",zIndex:20 }}>
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
              <Modal
                animationType="fade"
                transparent={true}
                visible={Wallet_activation}>
                <View style={styles.kyc_Container}>
                  <View style={[styles.kyc_Content,{width:wp(90)}]}>
                    <Image source={darkBlue} style={styles.logoImg_kyc} />
                    <Text style={styles.kyc_text}>Stellar Wallet Activating and funding.</Text>
                    <ActivityIndicator size="large" color="green" />
                  </View>
                </View>
              </Modal>
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
                     <Text style={{fontSize:19,textAlign:"center",marginTop:19,fontWeight:"bold",color:"black"}}>{list.name}</Text>
                     </View>
                     <View style={{flexDirection:"row",marginStart:10,marginTop:10,borderWidth:1.3,margin:10,padding:5,borderBottomColor:"black",borderTopColor:"white",borderLeftColor:"white",borderRightColor:"white"}}>
                       <Icon name={"map-marker"} type={"materialCommunity"} size={30} color={"#212B53"}/>
                       <ScrollView style={{height:hp(14)}}>
                        <Text style={{marginStart:10,marginTop:5,color:"black"}}>{list.city}</Text>
                       </ScrollView>
                      <View>
                      </View>
                     </View>
                     <View style={{borderWidth:1.3,margin:10,padding:5,borderBottomColor:"black",borderTopColor:"white",borderLeftColor:"white",borderRightColor:"white"}}>
                     <Text style={{marginStart:21,marginTop:5,fontSize:20,color:"black"}}>Crypto Assets</Text>
                      <Text style={{marginStart:29,marginTop:9,fontSize:16,color:"black"}}>{list.Crypto_Assets}</Text>
                     </View>

                     <View style={{borderWidth:1.3,margin:10,padding:5,borderBottomColor:"black",borderTopColor:"white",borderLeftColor:"white",borderRightColor:"white"}}>
                     <Text style={{marginStart:26,marginTop:5,fontSize:20,color:"black"}}>Fiat Assets</Text>
                      <Text style={{marginStart:29,marginTop:9,fontSize:16,color:"black"}}>{list.Fiat_Assets}</Text>
                     </View>

                     <View style={{borderWidth:1.3,margin:10,padding:5,borderBottomColor:"black",borderTopColor:"white",borderLeftColor:"white",borderRightColor:"white"}}>
                     <Text style={{marginStart:26,marginTop:5,fontSize:20,color:"black"}}>Payment Rails</Text>
                      <Text style={{marginStart:29,marginTop:9,fontSize:16,color:"black"}}>{list.Payment_Rails}</Text>
                     </View>
                      
                     <View style={{margin:10,padding:5,width:"28%"}}>
                    <Button title="Check Out" color={"#4CA6EA"} onPress={()=>{[setAnchor_modal(false),navigation.navigate("KycComponent",{tabName:"Buy"})]}}/>
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
                    <Text style={styles.myWallet}>Linked Wallet </Text>
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

                  <View style={{marginVertical:hp(1)}}>
                    <Text style={styles.textColor}>Stellar Public Key</Text>
                    <View style={{flexDirection:"row"}}>
                    {loading&&!steller_key?<View style={{width: wp(70)}}>
                           <Exchange_single_loading/>
                        </View>:
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: wp(60), paddingVertical: 2.9, borderRadius: 5 }}>
                        <Text style={[styles.textColor, styles.width_scrroll]}>{steller_key}</Text>
                      </ScrollView>}
                      <TouchableOpacity onPress={() => { copyToClipboard(steller_key) }}>
                        <Icon
                          name={"content-copy"}
                          type={"materialCommunity"}
                          color={"rgba(129, 108, 255, 0.97)"}
                          size={24}
                          style={{ marginTop: 0.3, marginLeft: wp(1) }}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setVISIBLE_SELECT(true) }}>
                        <Text style={{ color: "#4CA6EA", marginLeft: wp(1), marginTop: hp(0.5), marginRight: wp(3) }}>Import</Text>
                      </TouchableOpacity>
                    </View>
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
            profile.isVerified === true ? (
              <View style={{ backgroundColor: "#011434", flexDirection: "row", justifyContent: "center", alignSelf: "center", width: "93%" }}>
                <TouchableOpacity
                  style={styles.PresssableBtn}
                  onPress={() => {
                    navigation.navigate("classic", { Asset_type: "ETH" })
                  }}
                >
                   <Icon name={"wallet"} type={"material"} color={"#fff"} size={30}/>
                  <Text style={styles.PresssableBtnText}>Bridge Tokens</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.PresssableBtn}
                  onPress={() => {
                    Offer_condition(Offer_active)
                  }}
                >
                   <Icon name={"moving"} type={"material"} color={"#fff"} size={30} />
                  <Text style={styles.PresssableBtnText}>Trade</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.PresssableBtn}
                  onPress={() => {
                    navigation.navigate("Assets_manage");
                  }}
                >
                   <Icon name={"wallet"} type={"material"} color={"#fff"} size={30}/>
                  <Text style={styles.PresssableBtnText}>Assets</Text>
                </TouchableOpacity>

              </View>
            ) : (
              <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 5 }}>
                <Text style={styles.kycText}>FETCHING UPDATES {profile.isVerified === false ? kyc() : ""}</Text>
                <ActivityIndicator color={"green"} />
              </View>
            )
          )}
</View>
        
        <View style={{ justifyContent: 'center', alignItems: 'flex-start', backgroundColor: "#011434", paddingVertical: 1,paddingLeft:wp(5) }}>
          <Text style={{ color: "#fff", fontSize: 19,fontWeight:"600" }}>${points_data || 0.00}</Text>
          <Text style={{ color: "#fff", fontSize: 14 }}>{points_data_time || 0.00}</Text>
        </View>
        <View style={{justifyContent:'center',alignItems:'center',backgroundColor:"#011434",}}>

    { api_data_loading?<Charts_Loadings/>:
              <Chart
              style={{ width: 370, height: 230 }}
              data={chartData}
              padding={{ left: 10, bottom: 30, right: 20, top: 30 }}
              xDomain={{ 
                min: Math.min(...chartData.map(d => d.x)), 
                max: Math.max(...chartData.map(d => d.x)) 
              }}
              yDomain={{ 
                min: Math.min(...chartData.map(d => d.y)) - (0.1 * (Math.max(...chartData.map(d => d.y)) - Math.min(...chartData.map(d => d.y)))), // 10% padding below
                max: Math.max(...chartData.map(d => d.y)) + (0.1 * (Math.max(...chartData.map(d => d.y)) - Math.min(...chartData.map(d => d.y)))) // 10% padding above
              }}
            >
              <Line
                tooltipComponent={
                  <Tooltip theme={{formatter: ({ y,x }) =>{setpoints_data(y),setpoints_data_time(x)
                    setpoints_data_time(new Date(parseInt(x)).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit' 
                    }))
                  },
                  shape: {
                    width: 0,
                    height: 0,
                    dx: 0,
                    dy: 0,
                    color: 'black',
                  }
                }}/>
                }
                theme={{
                  stroke: { color: lineColor || '#44bd32', width: 2 },
                  scatter: {
                    selected: { width: 8, height: 8, rx: 4,color: 'red' }
                  }
                }}
                smoothing="bezier" 
              />
            </Chart>
}
</View>
        {/* </View>  */}
<View style={{backgroundColor:"#011434"}}>
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
        <Modal
        animationType="slide"
        transparent={true}
        visible={open_chart_api}
        >
        <TouchableOpacity style={styles.chooseModalContainer} onPress={() => setopen_chart_api(false)}>
          <View style={[styles.chooseModalContent]}>
          <Text style={{fontSize:21,color:"#fff",fontWeight:"bold"}}>Select Assets Pair</Text>
            <FlatList
              data={chart_api}
              renderItem={chooseRenderItem_1}
              keyExtractor={(item) => item.id.toString()}
              />
          </View>
        </TouchableOpacity>
      </Modal>
              </View>
            {/* <OfferListViewHome/> */}
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
    padding: hp(1.2),
    paddingVertical: hp(2),
    borderRadius: hp(2),
    borderColor:"#FFFFFF33",
    borderWidth:1
  },
  textColor: {
    color: "#fff",
    marginVertical:hp(0.3)
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
    fontSize:16,
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
    borderColor:"#FFFFFF33",
    borderWidth:1,
    alignSelf: "center",
    borderRadius: hp(2),
    marginVertical:hp(1.4),
    alignItems:"center",
    width: "32%",
    marginHorizontal:wp(1),
    padding:6,
    paddingVertical:10
  },
  PresssableBtnText:{
    color:"#fff",
    fontSize:15,
    fontWeight:"600"
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
    // backgroundColor:"rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)",
    margin:10,
    borderRadius:10
  },
  card: {
    marginRight: 10,
    // borderWidth: 1.9,
    // borderColor: 'rgba(122, 59, 144, 1)rgba(100, 115, 197, 1)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
    color:"black"
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
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
chooseModalContent: {
  backgroundColor: 'rgba(33, 43, 83, 1)',
  padding: 20,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  width: "100%",
  maxHeight: '80%',
  borderTopColor:"rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
  borderWidth:2
},
chooseItemContainer: {
  marginVertical: 3,
  flexDirection: 'row',
  alignItems: 'center',
  borderColor: 'rgba(28, 41, 77, 1)',
  borderBottomWidth:0.9,
  borderBlockEndColor: '#fff',
  marginBottom: 4,
},
chooseItemText: {
  fontSize: 19,
  color: '#fff',
  marginLeft:wp(-10)
},
  
});
