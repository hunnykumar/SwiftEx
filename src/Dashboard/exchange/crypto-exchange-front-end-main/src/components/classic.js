import React, { useCallback, useEffect, useState } from 'react';
import { Modal, View, Text, Picker, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput, Image, Platform, Keyboard, Alert, BackHandler, TouchableWithoutFeedback } from 'react-native';
import Icon from "../../../../../icon";
import { FlatList, useToast } from 'native-base';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import Bridge from "../../../../../../assets/Bridge.png";
import { useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { REACT_APP_HOST, REACT_APP_LOCAL_TOKEN, REACT_PROXY_HOST } from '../ExchangeConstants';
import AsyncStorageLib from '@react-native-async-storage/async-storage';
import darkBlue from '../../../../../../assets/darkBlue.png'
import steller_img from '../../../../../../assets/Stellar_(XLM).png'
import bnbimage from "../../../../../../assets/bnb-icon2_2x.png";
import WalletActivationComponent from '../utils/WalletActivationComponent';
import { GET, PGET, PPOST, authRequest, getToken, proxyRequest } from '../api';
import { ShowErrotoast, alert } from '../../../../reusables/Toasts';
import { toInt } from 'validator';
import { SignTransaction, swap_prepare } from '../../../../../../All_bridge';
import { Exchange_screen_header } from '../../../../reusables/ExchangeHeader';
import { ethers } from 'ethers';
import { OneTapContractAddress, OneTapUSDCAddress, RPC } from '../../../../constants';
import Clipboard from '@react-native-clipboard/clipboard';
import { QuoteModalBottomSheet } from '../utils/QuotesComponent';
import { CustomQuotes } from '../utils/CustomQuotes';
import Wallet_selection_bottom from '../../../../Wallets/Wallet_selection_bottom';
import { debounce } from 'lodash';
import { fetchBSCTokenInfo, fetchTokenInfo } from '../../../../../ethSwap/tokenUtils';
import { SwapPepare } from '../../../../../utilities/AllbridgeBscUtil';
import CustomInfoProvider from './CustomInfoProvider';
import AllbridgeTxTrack from './AllbridgeTxTrack';
import { convertMultiple } from '../utils/UsdPriceHandler';
import { colors } from '../../../../../Screens/ThemeColorsConfig';
const classic = ({ route }) => {
  const Focused=useIsFocused();
  const toast=useToast();
  const navigation=useNavigation();
  const { Asset_type } = route.params;
  const TEMPCHOSE=Asset_type==="ETH"?"Ethereum":Asset_type==="BNB"?"BNB":Asset_type 
  const state = useSelector((state) => state);
  const nav = useNavigation();
  const [chooseModalVisible, setChooseModalVisible] = useState(false);
  const [modalContainer_menu, setmodalContainer_menu] = useState(false);
  const [con_modal, setcon_modal] = useState(false)
  const [chooseSelectedItemId, setChooseSelectedItemId] = useState(TEMPCHOSE);
  const [chooseSelectedItemIdCho, setChooseSelectedItemIdCho] = useState(null);
  const [chooseSearchQuery, setChooseSearchQuery] = useState('');
  const [idIndex, setIdIndex] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [main_modal, setmain_modal] = useState(true);
  const [fianl_modal, setfianl_modal] = useState(false);
  const [fianl_modal_error, setfianl_modal_error] = useState(false);
  const [fianl_modal_loading, setfianl_modal_loading] = useState(false);
  const [amount, setamount] = useState('');
  const [chooseModalVisible_choose, setchooseModalVisible_choose] = useState(false);
  const [not_avilable, setnot_avilable] = useState(false);
  const [WALLETADDRESS,setWALLETADDRESS]=useState('')
  const [WALLETBALANCE,setWALLETBALANCE]=useState('')
  const [ErrorMessageUI,setErrorMessageUI]=useState(null);
  const [ACTIVATION_MODAL_PROD,setACTIVATION_MODAL_PROD]=useState(false);
  const [balanceLoading,setbalanceLoading]=useState(false)
  const [onTapFeature,setonTapFeature]=useState(false)
  const [Wallet_modal,setWallet_modal]=useState(false);
  const [fianl_modal_text,setfianl_modal_text]=useState("Transaction Faild")
  const [messageError,setmessageError]=useState(null);
  const [resQuotes,setresQuotes]=useState(null);
  const [getInfo,setgetInfo]=useState(false);
  const [payFeeType,setPayFeeType]=useState("native");
  const [errorMsg,seterrorMsg]=useState(null)
  const [showTx,setshowTx]=useState(false);
  const [showTxHash,setshowTxHash]=useState([]);
  const [viewInUSD, setViewInUSD] = useState(false);
  const manageFeeViewer = () => setViewInUSD(prev => !prev);

  const chooseItemList = [
    { id: 1, name: "Ethereum", url: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png" },
    { id: 2, name: "BNB", url: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png" },
  ]
  const chooseItemList_ETH = [
    { id: 1, name: "USDT", url: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png" },
    { id: 2, name: "USDC", url: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }
  ];
  const [Profile, setProfile] = useState({
    isVerified: false,
    firstName: "jane",
    lastName: "doe",
    email: "xyz@gmail.com",
    phoneNumber: "93400xxxx",
    isEmailVerified: false,
});
const [open, setOpen] = useState(false);
const ActivateModal = () => {
  setACTIVATION_MODAL_PROD(false);
  navigation.goBack()
};
useEffect(()=>{
  setshowTx(false);
  setshowTxHash([]);
  setmessageError(null)
  setresQuotes(null)
  setgetInfo(false)
  setonTapFeature(false)
  setACTIVATION_MODAL_PROD(false)
  setbalanceLoading(false)
  setErrorMessageUI(null);
  fetchUSDCBalnce(state&&state.wallet && state.wallet.address)
  setfianl_modal_error(false);
  setWALLETBALANCE(state&&state.EthBalance)
  setWALLETADDRESS(state&&state.wallet && state.wallet.address)
  setfianl_modal_loading(false)
  setamount('');
  setPayFeeType('native')
  seterrorMsg(null)
},[])
useEffect(()=>{
  setonTapFeature(false)
  setACTIVATION_MODAL_PROD(false)
  setbalanceLoading(false)
  setErrorMessageUI(null);
  fetchUSDCBalnce(state&&state.wallet && state.wallet.address)
  setfianl_modal_error(false);
  setWALLETBALANCE(state&&state.EthBalance)
  setWALLETADDRESS(state&&state.wallet && state.wallet.address)
  setfianl_modal_loading(false)
  setamount('');
},[state?.wallet?.address])

useEffect(()=>{
  setonTapFeature(false)
  setACTIVATION_MODAL_PROD(false)
  setbalanceLoading(false)
  setErrorMessageUI(null);
  fetchUSDCBalnce(state&&state.wallet && state.wallet.address)
  setfianl_modal_error(false);
  setWALLETBALANCE(state&&state.EthBalance)
  setWALLETADDRESS(state&&state.wallet && state.wallet.address)
  setfianl_modal_loading(false)
  setamount('');
  setshowTx(false);
  setshowTxHash([]);
  setmessageError(null)
  setresQuotes(null)
  setgetInfo(false)
  setPayFeeType('native')
  seterrorMsg(null)
},[chooseSelectedItemId === null ? chooseItemList[1].name : chooseSelectedItemId,chooseSelectedItemIdCho === null ? chooseItemList_ETH[0].name : chooseSelectedItemIdCho])

  const fetchUSDCBalnce = async (addresses) => {
    try {
      setbalanceLoading(true)
      const activeAsset=chooseSelectedItemIdCho === null ? chooseItemList_ETH[0].name : chooseSelectedItemIdCho;
      if(state.STELLAR_ADDRESS_STATUS===false)
        {
            setACTIVATION_MODAL_PROD(true)
        }
      const activeNetwork=chooseSelectedItemId === null ? chooseItemList[1].name : chooseSelectedItemId;
      console.log("activeNetwork",activeNetwork)
      if(activeNetwork==="Ethereum")
      {
        const usdtAddress = activeAsset==="USDT"?"0xdAC17F958D2ee523a2206206994597C13D831ec7":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
        if (usdtAddress && addresses) {
          const resposeBalance = await fetchTokenInfo(usdtAddress, addresses)
          const balance = resposeBalance[0].tokenBalance;
          console.log(`USDT Balance of ${addresses}: ${balance} USDT`);
          
          setWALLETBALANCE(balance);
        }
        setbalanceLoading(false)
        BridgeUSDCValidation()
      }
      if(activeNetwork==="BNB")
      {
        const usdtAddress = activeAsset==="USDT"?"0x55d398326f99059fF775485246999027B3197955":"0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
        if (usdtAddress && addresses) {
          const resposeBalance = await fetchBSCTokenInfo(usdtAddress, addresses)
          const balance = resposeBalance[0].tokenBalance;
          console.log(`USDT Balance of ${addresses}: ${balance} USDT`);
          
          setWALLETBALANCE(balance);
        }
        setbalanceLoading(false)
        BridgeUSDCValidation()
      }
    } catch (error) {
      setWALLETBALANCE(0.00);
      setbalanceLoading(false)
      BridgeUSDCValidation()
      console.log("Error fetching balance:", error);
    }
  }
  function isAssetData(state) {
    return state?.assetData !== undefined && state?.assetData !== null;
}
  const BridgeUSDCValidation=async()=>{
    const avlRes=isAssetData(state?.assetData);
    if(!avlRes)
    {
      const ALL_STELLER_BALANCES=state?.assetData;
      const hasAsset = ALL_STELLER_BALANCES.some(
        (balance) => balance.asset_code === "USDC" || balance.asset_type === "USDC"
      );
      if (!hasAsset) {
        // setnot_avilable(true);
      }
      else{
        setnot_avilable(false);
      }
    }
    
  }
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  const for_trading = async () => {
    try {
        const { res, err } = await authRequest("/users/:id", GET);
        setProfile(res);
        await getOffersData()
    } catch (err) {
        console.log(err)
    }
};
const getOffersData = async () => {
  try {
      // const { res, err } = await authRequest("/offers", GET);
      // if (err) return console.log(`${err.message}`);
      //  setOffers(res);
  } catch (err) {
      console.log(err)
  }
  setfianl_modal(false)
  navigation.navigate("newOffer_modal", {
      user: { Profile },
      open: { open },
      getOffersData: { getOffersData }
  });

}
  const handleUpdate = (id) => {
    if (idIndex === 1) {
      setChooseSelectedItemId(id);
      setChooseModalVisible(false);
      setmain_modal(true)
    } else if (idIndex === 3) {
      setChooseSelectedItemIdCho(id);
      setmain_modal(true)
    }
    setchooseModalVisible_choose(false);
  };

  const chooseRenderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleUpdate(item.name)} style={styles.chooseItemContainer}>
      <Image style={styles.chooseItemImage} source={{ uri: item.url }} />
      <Text style={[styles.chooseItemText,{color:theme.headingTx}]}>{item.name}</Text>
    </TouchableOpacity>
  );

  const chooseFilteredItemList = chooseItemList.filter(
    item => item.name.toLowerCase().includes(chooseSearchQuery.toLowerCase())
  );

  const handleNext = () => {
    setmain_modal(false)
    setConfirmModalVisible(true);
  };
  {
    fianl_modal === true && setTimeout(() => {
      nav.goBack()
    }, 1300)
  }

  const keysUpdate=async()=>{
    try {
       const postData = {
              publicKey: state?.STELLAR_PUBLICK_KEY,
              wallletPublicKey:state?.ETH_KEY
            };
        
            // Update public key by email
            const response = await fetch(`${REACT_APP_HOST}/users/updatePublicKey`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer "+await getToken()
              },
              body: JSON.stringify(postData),
            });
            
            const data = await response.json();
            console.log("---keysUpdate>>>>", data);
    } catch (error) {
      console.log(error)
    }
  }

  const sendEthToContract = async () => {
    try {
      const activeNetwork=chooseSelectedItemId === null ? chooseItemList[1].name : chooseSelectedItemId;
      const activeAsset=chooseSelectedItemIdCho === null ? chooseItemList_ETH[0].name : chooseSelectedItemIdCho;
      console.log("active -",activeNetwork,activeAsset)
      const wallet = new ethers.Wallet(state?.wallet?.privateKey);
     if(activeNetwork==="Ethereum"){
      const respoExe = await swap_prepare(state?.wallet?.privateKey, wallet.address, state.STELLAR_PUBLICK_KEY, amount, activeAsset, "USDC", "ETH",payFeeType)
      console.log("classic last ui res ---->", respoExe)
      if (respoExe?.status_task) {
        setfianl_modal_text("Transaction Successful");
        setfianl_modal_loading(false);
        setfianl_modal_error(true);
        setshowTx(true)
        setshowTxHash([{ chain: "ETH", hash: respoExe.res.transferTxHash }]);
      }
      if (!respoExe.status_task) {
        setfianl_modal_text("Transaction Failed");
        console.log("Transaction Failed", respoExe);
        setfianl_modal_loading(false);
        setfianl_modal_error(true);
      }
     }
     if(activeNetwork==="BNB"){
      const respoExe = await SwapPepare(state?.wallet?.privateKey, wallet.address, state.STELLAR_PUBLICK_KEY, amount, activeAsset, "USDC", "BNB",payFeeType)
      console.log("bnb last ui response ---->", respoExe)
      if (respoExe?.status_task) {
        setfianl_modal_text("Transaction Successful");
        setfianl_modal_loading(false);
        setfianl_modal_error(true);
        setshowTx(true)
        setshowTxHash([{ chain: "BSC", hash: respoExe.res.transferTxHash }]);
      }
      if (!respoExe.status_task) {
        setfianl_modal_text("Transaction Failed");
        console.log("Transaction Failed", respoExe);
        setfianl_modal_loading(false);
        setfianl_modal_error(true);
      }
     }

    } catch (error) {
      setfianl_modal_text("Transaction Failed");
      console.log("Transaction Failed", error);
      setfianl_modal_loading(false);
      setfianl_modal_error(true);
    }
  
  };
  const manage_swap = async () => {
    setfianl_modal_loading(true);
    const amountValue = parseFloat(amount);
    const walletBalanceValue = parseFloat(WALLETBALANCE);
    if (isNaN(amount)||amountValue == 0) {
      setfianl_modal_loading(false);
      ShowErrotoast(toast, "Invalid amount");
      setamount("");
    }
    else{
      if (amountValue <= 0 || amountValue > walletBalanceValue) {
        setfianl_modal_loading(false);
        ShowErrotoast(toast, "Insufficient funds");
        setamount("");
      }
      else{
        sendEthToContract()
      }
      
    }
      
      // setfianl_modal_loading(false) //error alert
      // setfianl_modal_error(true)


  }
  const copyToClipboard = (tokenAddress) => {
    Clipboard.setString(tokenAddress);
    alert("success", "Copied to clipboard!");
  };
  const handleClose=()=>{
    setonTapFeature(false)
    navigation.goBack();
  }

  const isValidNumber = (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num !== 0;
  };
  const getQuote = useCallback(
    debounce((value,chaiType,inputToken) => {
      setmessageError(null);
      if (isValidNumber(value)&&value!=="null") {
        setmessageError(null);
        setresQuotes(null)
        setgetInfo(false)
        if(chaiType==="ETH")
        {
          setgetInfo(true);
          collectQuotes(value,chaiType,inputToken) 
        }
        if(chaiType==="BNB")
          {
            setgetInfo(true);
            collectQuotes(value,chaiType,inputToken) 
          }
      }
      else {
        setmessageError("Invalid Amount");
      }
    }, 400),
    []
  );
  
  const handleInputChange = (text,tokenChain,inputToken) => {
    setresQuotes(null);
    const numericText = text.replace(/[^0-9.]/g, '');
    setamount(numericText)
    getQuote(numericText,tokenChain==="BNB"?"BNB":"ETH",inputToken);
  };
  
  const collectQuotes = async (value,typeOfchain,spendToken) => {
    const deviceToken = await getToken();
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", "Bearer " + deviceToken);
      myHeaders.append("x-auth-device-token", deviceToken);
      const raw = JSON.stringify({
        "amount": value,
        "chainType":typeOfchain,
        "sourceToken":spendToken
      });
  
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };
  
      fetch(REACT_PROXY_HOST + `/v1/bridge/swap-quotes`, requestOptions)
        .then((response) => response.json())
        .then(async(result) => {
          console.log("---err->",result)
          if (result?.quotes) {
            Keyboard.dismiss();
            const respo = await convertMultiple([
              { token: result?.quotes?.fee?.native?.symbol, amount: result?.quotes?.fee?.native?.amount },
              { token: result?.quotes?.fee?.stablecoin?.symbol, amount: result?.quotes?.fee?.stablecoin?.amount }
            ]);
            const mergedQuotes = { ...result?.quotes };
            for (const item of respo) {
              if (item.success) {
                if (item.token === mergedQuotes.fee.native.symbol) {
                  mergedQuotes.fee.native = { ...mergedQuotes.fee.native, ...item };
                } else if (item.token === mergedQuotes.fee.stablecoin.symbol) {
                  mergedQuotes.fee.stablecoin = { ...mergedQuotes.fee.stablecoin, ...item };
                }
              }
            }
            setresQuotes(mergedQuotes),
            setgetInfo(false)
          }
          else {
            setgetInfo(false)
            setresQuotes(null)
            console.log("---err->",result)
           CustomInfoProvider.show("Info", result?.message==="Amount must be greater than zero"?result?.message:"An error occurred. Please try again later.")
          }
        })
        .catch((error) => {
          setgetInfo(false)
          setresQuotes(null)
          console.log("--->errorClasic",error)
        });
    }

    useEffect(() => {
      if (!resQuotes) return;
      const feeAmount = payFeeType === "native"
        ? parseFloat(resQuotes?.fee?.native?.amount || "0")
        : parseFloat(resQuotes?.fee?.stablecoin?.amount || "0");
    
      const minReceive = parseFloat(resQuotes?.minimumAmountOut || "0");
      const netReceive = Math.max(0, minReceive - feeAmount);
    
      if (netReceive <= 0 || (payFeeType === "stable" && feeAmount > parseFloat(WALLETBALANCE))) {
        seterrorMsg("Insufficient funds to pay gas.");
      } else {
        seterrorMsg(null);
      }
    }, [payFeeType, resQuotes, WALLETBALANCE]);
    
    const feeData = payFeeType === "native"
      ? resQuotes?.fee?.native
      : resQuotes?.fee?.stablecoin;

    
      const theme = state.THEME.THEME ? colors.dark : colors.light;

  return (
    <View style={{ backgroundColor: theme.bg,width:wp(100),height:hp(100)}}>
     <Exchange_screen_header title="Bridge" onLeftIconPress={() => navigation.goBack()} onRightIconPress={() => console.log('Pressed')} />
     <WalletActivationComponent
         isVisible={ACTIVATION_MODAL_PROD}
         onClose={() => {ActivateModal}}
         onActivate={()=>{setACTIVATION_MODAL_PROD(false)}}
         navigation={navigation}
         appTheme={true}
         shouldNavigateBack={true}
       /> 
         {/* <CustomQuotes
                   isVisible={onTapFeature}
                   onClose={()=>{handleClose()}}
                   tokenChain={"ETH"}
                   tokenName={"WETH"}
                   tokenAddress={"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"}
                   ACTIVATED={state?.STELLAR_ADDRESS_STATUS}
                 /> */}
      <ScrollView style={{marginBottom:hp(5),paddingHorizontal:wp(3.5)}}>
        <View style={[styles.card,{backgroundColor:theme.cardBg,flexDirection:"column"}]}>
            <Text style={[styles.headingText,{color:theme.headingTx}]}>Import USDC on Trade Wallet</Text>
          <View style={[styles.exportBottomCon,{backgroundColor:theme.cardBg}]}>
              <TouchableOpacity style={[styles.exportCon,{backgroundColor:theme.bg}]} onPress={() => { setChooseModalVisible(true); setIdIndex(1); }}>
               <View style={{flexDirection:"row"}}>
               {chooseSelectedItemId === null ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemId === "BNB" ? <Image source={{ uri: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemId === "Matic" ? <Image source={{ uri: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912" }} style={styles.logoImg_TOP_1} /> : <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png" }} style={styles.logoImg_TOP_1} />}
                <View>
                <Text style={styles.networkSubHeading}>Network</Text>
                <Text style={[styles.networkHeading,{color:theme.headingTx}]}>{chooseSelectedItemId === null ? chooseItemList[1].name : chooseSelectedItemId}</Text>
                </View>
               </View>
              <Icon name={"chevron-down"} type={"materialCommunity"} color={theme.headingTx} size={30}/>
            </TouchableOpacity>

              <TouchableOpacity style={[styles.exportCon,{backgroundColor:theme.bg}]} onPress={() => { setchooseModalVisible_choose(true); setIdIndex(3); }}>
               <View style={{flexDirection:"row"}}>
                {chooseSelectedItemIdCho === null ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "USDC" ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "BNB" ? <Image source={{ uri: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "Matic" ? <Image source={{ uri: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912" }} style={styles.logoImg_TOP_1} /> : <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png" }} style={styles.logoImg_TOP_1} />}
               <View>
               <Text style={styles.networkSubHeading}>Assets</Text>
               <Text style={[styles.networkHeading,{color:theme.headingTx}]}>{chooseSelectedItemIdCho === null ? chooseItemList_ETH[0].name : chooseSelectedItemIdCho}</Text>
               </View>
               </View>
               <Icon name={"chevron-down"} type={"materialCommunity"} color={theme.headingTx} size={30}/>
              </TouchableOpacity>
          </View>
          </View>
          
                  <View style={[styles.card,{backgroundColor:theme.cardBg,flexDirection:"column",borderBottomLeftRadius:0,borderBottomRightRadius:0}]}>
                  <View style={[styles.rowBtnCon, { paddingVertical: hp(-0.5),backgroundColor:theme.cardBg }]}>
                      <Text style={[styles.subInputText,{color:theme.inactiveTx,marginTop: hp(0)}]}>Amount</Text>
                      <TouchableOpacity style={styles.maxCon} onPress={()=>{parseFloat(WALLETBALANCE)===0?alert("error","Invalid amount."):handleInputChange(parseFloat(WALLETBALANCE)===0?null:WALLETBALANCE,chooseSelectedItemId === null ? chooseItemList[1].name : chooseSelectedItemId,chooseSelectedItemIdCho === null ? chooseItemList_ETH[0].name : chooseSelectedItemIdCho)}}>
                      <Text style={styles.maxBtn}>MAX</Text>
                    </TouchableOpacity>
                      </View>
                   <View style={[styles.modalOpen, { paddingVertical: hp(0.5),backgroundColor:theme.bg }]}>
                      <TextInput maxLength={10} placeholder='0.0' placeholderTextColor={"gray"} keyboardType="number-pad" value={amount} style={[styles.textInputForCrossChain,{ fontSize: 18, color: theme.headingTx, }]} onChangeText={(value) => { handleInputChange(value,chooseSelectedItemId === null ? chooseItemList[1].name : chooseSelectedItemId,chooseSelectedItemIdCho === null ? chooseItemList_ETH[0].name : chooseSelectedItemIdCho) }} returnKeyType="done"/>
                  </View>
                  </View>
        <View style={[styles.card, { backgroundColor: theme.cardBg, flexDirection: "column", borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: -4, borderTopColor: theme.smallCardBorderColor, borderTopWidth: 1 }]}>
          <View style={styles.accountDetailsCon}>
            <Text style={[styles.subInputText, { color: theme.inactiveTx }]}>Active Wallet :</Text>
            <View style={{ width: "60%" }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: "99%" }}>
                <Text style={{ fontSize: 14, color: theme.headingTx }}>{WALLETADDRESS}</Text>
              </ScrollView>
            </View>
          </View>
          <View style={styles.accountDetailsCon}>
            <Text style={[styles.subInputText, { color: theme.inactiveTx }]}>Balance :</Text>
            <View style={{ minWidth: wp(15) }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: "96%" }}>
                {balanceLoading ? <ActivityIndicator color={"green"} /> : <Text style={{ color: theme.headingTx, fontSize: 14 }}>{WALLETBALANCE}</Text>}
              </ScrollView>
            </View>
          </View>

        </View>

        <View style={[styles.card,{backgroundColor:theme.cardBg,flexDirection:"column",borderBottomLeftRadius:0,borderBottomRightRadius:0}]}>
          <View style={{ flexDirection: "row", paddingLeft: wp(3) }}>
            <Icon name={"fire"} type={"materialCommunity"} size={25} color={"#4052D6"} />
            <Text style={[styles.subInputText, { fontSize: 16,color:theme.headingTx }]}> Relayer Fee</Text>
          </View>
            <View style={{flexDirection:"row",marginLeft:5}}>
            <TouchableOpacity style={[styles.feePayCon,{backgroundColor:payFeeType==="native"?"#4052D6":theme.bg}]} onPress={() => { setPayFeeType("native") }}>
              <Icon name={"fire"} type={"materialCommunity"} size={25} color={payFeeType==="native"?"#fff":"#4052D6"} />
              <Text style={[styles.feePayTx,{color: payFeeType==="native"?"#fff":theme.headingTx}]}>Native </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.feePayCon,{backgroundColor:payFeeType==="stable"?"#4052D6":theme.bg}]} onPress={() => { setPayFeeType("stable") }}>
              <Icon name={"fire"} type={"materialCommunity"} size={25} color={payFeeType==="stable"?"#fff":"#4052D6"} />
              <Text style={[styles.feePayTx,{color: payFeeType==="stable"?"#fff":theme.headingTx}]}>Stable-Coin </Text>
            </TouchableOpacity>
            </View>
        </View>
        <View style={[styles.card, { backgroundColor: theme.cardBg, flexDirection: "column", borderTopLeftRadius: 0, borderTopRightRadius: 0, marginTop: -4, borderTopColor: theme.smallCardBorderColor, borderTopWidth: 1 }]}>
        <View style={styles.accountDetailsCon}>
        <View style={{ flexDirection: "row", }}>
         {chooseSelectedItemIdCho === null ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "USDC" ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "BNB" ? <Image source={{ uri: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "Matic" ? <Image source={{ uri: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912" }} style={styles.logoImg_TOP_1} /> : <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }} style={styles.logoImg_TOP_1} />}
          <View>
            <Text style={styles.networkSubHeading}>Receive</Text>
            <View style={{flexDirection:"row",alignItems:"center"}}>
            <Text style={[styles.networkHeading,{color:theme.headingTx}]}>{chooseSelectedItemIdCho === null ? "USDC" : chooseSelectedItemIdCho === "USDC" ? chooseSelectedItemId === "Matic" || chooseSelectedItemIdCho === "Matic" ? "apUSDC" : "USDC" : chooseSelectedItemIdCho === "BNB" ? "BNB" : chooseSelectedItemIdCho === "Matic" ? "apMATIC" : "USDC"}</Text>
            <Text style={{color:"gray",fontSize:13}}> (centre.io)</Text>
            </View>
          </View>
        </View>
      </View>
          </View>

      {getInfo && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={styles.loadingText}>Getting best quote...</Text>
              </View>
            )}
      {resQuotes !== null && 
      <View style={[styles.modalQoutesCon,{backgroundColor:theme.cardBg}]}>
      <Text style={[styles.quoteTitle,{color:theme.headingTx}]}>Quote Details</Text>
        <View style={[styles.quoteDetailsContainer]}>
          <View style={styles.quoteRow}>
            <Text style={[styles.quoteLabel,{color:theme.inactiveTx}]}>Provider</Text>
            <Text style={[styles.quoteValue,{color:theme.headingTx}]}>Allbridge</Text>
          </View>

          <View style={styles.quoteRow}>
            <Text style={[styles.quoteLabel,{color:theme.inactiveTx}]}>Rate</Text>
            <Text style={[styles.quoteValue,{color:theme.headingTx}]}>
              1 USDT = {resQuotes.conversionRate} USDC
            </Text>
          </View>

          <View style={styles.quoteRow}>
            <Text style={[styles.quoteLabel,{color:theme.inactiveTx}]}>Slippage</Text>
            <Text style={[styles.quoteValue,{color:theme.headingTx}]}>
              {resQuotes.slippageTolerance}%
            </Text>
          </View>

          <View style={styles.quoteRow}>
            <Text style={[styles.quoteLabel,{color:theme.inactiveTx}]}>Minimum Received</Text>
            <View style={{ width: wp(25), flexDirection: 'row' }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={[styles.quoteValue,{color:theme.headingTx}]}>{resQuotes.minimumAmountOut}</Text>
              </ScrollView>
              <Text style={[styles.quoteValue,{color:theme.headingTx}]}> USDC</Text>
            </View>
          </View>
            <View style={styles.quoteRow}>
              <Text style={[styles.quoteLabel,{color:theme.inactiveTx}]}>Network Fee</Text>
                <View View style={{ width: wp(25), flexDirection: "row", alignItems: "center" }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Text style={[styles.quoteValue,{color:theme.headingTx}]}>
                      {feeData?.amount}
                    </Text>
                  </ScrollView>
                  <Text style={[styles.quoteValue,{color:theme.headingTx}]}>
                    {" " + feeData?.symbol}
                  </Text>
                </View>
            </View>

            <View style={styles.quoteRow}>
              <Text style={[styles.quoteLabel,{color:theme.inactiveTx}]}>Network Fee (USD)</Text>
                <Text style={[[styles.quoteValue,{color:theme.headingTx}], { textAlign: "right" }]}>{feeData?.formattedUSD || `$${Number(feeData?.usdValue || 0).toFixed(2)}`}</Text>
            </View>

            <View style={styles.quoteRow}>
              <Text style={[styles.quoteLabel,{color:theme.inactiveTx}]}>Estimated time</Text>
              <Text style={[styles.quoteValue,{color:theme.headingTx}]}>{resQuotes.completionTime?(resQuotes.completionTime / (1000 * 60)+" Min"):"getting.."}</Text>
            </View>
        </View>
        <View style={[styles.quoteTextCon,{borderColor:theme.inactiveTx}]}>
          <Text style={[styles.quoteText,{color:theme.headingTx}]}>≈</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text style={[styles.quoteText,{color:theme.headingTx}]}>
                {Math.max(
                  0,
                  parseFloat(resQuotes.minimumAmountOut || "0") -
                  parseFloat(
                    payFeeType === "native"
                      ? resQuotes?.fee?.native?.amount || "0"
                      : resQuotes?.fee?.stablecoin?.amount || "0"
                  )
                ).toFixed(6)}
              </Text>
            </ScrollView>
          <Text style={[styles.quoteText,{color:theme.headingTx}]}>USDC</Text>
        </View>
      </View>
      }


            <TouchableOpacity
              // disabled={chooseSelectedItemIdCho === null||chooseSelectedItemId === null} 
              style={[styles.nextButton, { backgroundColor: !amount||balanceLoading||getInfo||errorMsg!==null?"gray":'#4052D6' }]}
            disabled={!amount||fianl_modal_loading||balanceLoading||getInfo||errorMsg!==null} onPress={() => { Keyboard.dismiss(),manage_swap() }}
            >
              {fianl_modal_loading||getInfo?<ActivityIndicator color={"white"}/>:<Text style={styles.nextButtonText}>{errorMsg!==null?errorMsg:"Confirm Transaction"}</Text>}
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

            <TouchableOpacity style={styles.modalContainer_option_view} onPress={()=>{navigation.navigate("Wallet")}}>
      <Icon
        name={"wallet-outline"}
        type={"materialCommunity"}
        size={30}
        color={"white"}
      />
      <Text style={[styles.modalContainer_option_text,{color:"white"}]}>Wallet</Text>
      </TouchableOpacity>
            <TouchableOpacity style={styles.modalContainer_option_view} onPress={() => {
              console.log('clicked');
              const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
              AsyncStorageLib.removeItem(LOCAL_TOKEN);
              setmodalContainer_menu(false)
              nav.navigate('exchangeLogin');
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
      {/* <Image source={Bridge}/> */}
      {/* <Modal
        animationType="fade"
        transparent={true}
        visible={main_modal}
      > */}

      {/* </Modal> */}

      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModalVisible}
      // visible={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.confirmModalContent}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
              <Text style={[styles.confirmText, { marginStart: 60 }]}>Confirm Transaction</Text>
              <Icon name={"close"} size={28} color={"white"} onPress={() => { setConfirmModalVisible(false) }} />
            </View>
            <View style={styles.inputContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: "96%" }}>
                <Text>{WALLETADDRESS}</Text>
              </ScrollView>
            </View>
            <View style={styles.inputContainer}>
              <TextInput placeholder='Amount' placeholderTextColor="gray" keyboardType="number-pad" value={amount} style={styles.input} onChangeText={(value) => { setamount(value) }} />
            </View>
            <TouchableOpacity style={[styles.confirmButton, { backgroundColor: !amount ? "gray" : "green" }]} disabled={!amount} onPress={() => { setConfirmModalVisible(false), setfianl_modal(true) }}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={fianl_modal}>

        <View style={styles.modalContainer}>
          <View style={{
            backgroundColor: 'rgba(33, 43, 83, 1)',
            padding: 20,
            borderRadius: 10,
            alignItems: 'center',
            width: "90%",
            height: "25%",
            justifyContent: "center"
          }}>
            <Icon
              name={"check-circle-outline"}
              type={"materialCommunity"}
              size={60}
              color={"green"}
            />
            <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 10, color: "#fff" }} onPress={() => { nav.goBack() }}>Transaction Success</Text>
            {/* <TouchableOpacity style={[styles.confirmButton, { backgroundColor: "green" }]} onPress={() => {  for_trading() }}>
              <Text style={styles.confirmButtonText}>Trade</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={fianl_modal_error}>
          
        <View style={styles.modalContainer}>
          <View style={{
            backgroundColor: 'rgba(33, 43, 83, 1)',
            padding: 20,
            borderRadius: 10,
            alignItems: 'center',
            width: "90%",
            height: "30%",
          }}>
            
            <Icon
              name={fianl_modal_text==="Transaction Failed"?"alert-circle-outline":"check-circle-outline"}
              type={"materialCommunity"}
              size={60}
              color={fianl_modal_text==="Transaction Failed"?"red":"green"}
              style={{marginTop:19}}
            />
            <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: 19, color: "#fff" }}>{fianl_modal_text}</Text>
            <TouchableOpacity style={styles.alertBtn} onPress={()=>{fianl_modal_text==="Transaction Failed"?setfianl_modal_error(false):[setfianl_modal_error(false),navigation.navigate("Assets_manage")]}}>
              <Text style={styles.alertBtnText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      <Modal
        animationType="slide"
        transparent={true}
        visible={chooseModalVisible}
      >
        <TouchableOpacity style={styles.chooseModalContainer} onPress={() => setChooseModalVisible(false)}>
          <View style={[styles.chooseModalContent,{backgroundColor:theme.cardBg}]}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical:hp(1), color: theme.headingTx }}>Select Wallet</Text>
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={chooseModalVisible_choose}
      >
        <TouchableOpacity style={styles.chooseModalContainer} onPress={() => setchooseModalVisible_choose(false)}>
          <View style={[styles.chooseModalContent,{backgroundColor:theme.cardBg}]}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical:hp(1), color: theme.headingTx }}>Choose Asset</Text>
            {/* <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={"gray"}
              onChangeText={text => setChooseSearchQuery(text)}
              value={chooseSearchQuery}
              autoCapitalize='none'
            /> */}
            <FlatList
              data={chooseItemList_ETH}
              renderItem={chooseRenderItem}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={not_avilable}>
        <View style={styles.modalContainer}>
          <View style={{
            backgroundColor: 'rgba(33, 43, 83, 1)',
            padding: 10,
            borderRadius: 10,
            alignItems: 'center',
            width: "95%",
            height: "30%",
            justifyContent: "center",
            borderColor:"#4CA6EA",
            borderWidth:2
          }}>
            <Icon
              name={"shield-alert-outline"}
              type={"materialCommunity"}
              size={60}
              color={"orange"}
            />
            <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: hp(2.5), color: "#fff",textAlign:"center" }}>To use this feature, you must trust USDC. Please trust USDC first to ensure a smooth and uninterrupted experience.</Text>
            <View style={{ flexDirection: "row",justifyContent:"space-around",width:"83%" }}>
              <TouchableOpacity style={{
                alignSelf: "center", marginTop: hp(2.5), backgroundColor: "gray", alignContent: "center", justifyContent: "center", width: "40%", paddingVertical: hp(1), borderRadius: 10, borderColor: "#4CA6EA",
                borderWidth: 2
              }} onPress={() => {setnot_avilable(false),navigation.goBack()}}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff", textAlign: "center" }}>Maybe Later</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ alignSelf: "center", marginTop:hp(2.5),backgroundColor:"green",alignContent:"center",justifyContent:"center",width:"40%",paddingVertical:hp(1),borderRadius:10,borderColor:"#4CA6EA",
            borderWidth:2 }} onPress={() => {navigation.navigate("Assets_manage",{openAssetModal:true})}}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff",textAlign:"center" }}>Trust Now</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
          animationType="slide"
          transparent={true}
          visible={Wallet_modal}
          onRequestClose={() => setWallet_modal(false)}
        >
          <TouchableWithoutFeedback onPress={() => {setWallet_modal(false)}}>
            <View style={styles.modalBackground}>
              <TouchableOpacity
                onPress={() => setWallet_modal(false)}
                style={{ marginBottom: Platform.OS === "ios" ? hp(-1.5) : hp(-2) }}
              >
              </TouchableOpacity>
              <View style={[styles.modalView, { backgroundColor: state.THEME.THEME === false ? "#fff" : "black", borderBottomColor: state.THEME.THEME === false ? "#fff" : "black" }]}>
                <View style={styles.modal_heading_view}>
                  <Text style={[styles.modalText, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Choose wallet</Text>
                  <TouchableOpacity
                    onPress={() => [setWallet_modal(false), navigation.navigate("Wallet")]}
                  >
                    <Text style={[styles.modalText, { color: '#2196F3' }]}>Add Wallet</Text>
                  </TouchableOpacity>
                </View>
                <Wallet_selection_bottom onClose={()=>{setWallet_modal(false)}} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
      <View style={styles.allBridgeTxCon}>
        <AllbridgeTxTrack txs={showTxHash} isDarkMode={state?.THEME?.THEME} showTx={showTx} closeTx={() => { setshowTx(false) }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalView: {
    width: wp(100),
    height: hp(30),
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: hp(1.5),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderColor: "#2196F3",
    borderWidth: 0.9,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: "400"
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modal_heading_view: {
    flexDirection: "row",
    width: wp(100),
    paddingVertical: 5,
    paddingHorizontal: 16,
    justifyContent: "space-between"
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'rgba(33, 43, 83, 1)',
    width: wp(100),
    height: hp(100)
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: "flex-start",
    marginTop: 1,
    paddingLeft:wp(5)
  },
  headingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight:"400",
    textAlign: "left",
    paddingLeft: wp(5)
  },
  subInputText: {
    color: "#94A3B8",
    fontSize: 15,
  },
  maxBtn: {
    color: "#FFF",
    fontSize: 16,
  },
  maxCon: {
    backgroundColor: "#4052D6",
    borderRadius: 10,
    paddingVertical:5,
    paddingHorizontal: wp(5),
  },
  modalOpen: {
    width: '93%',
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems: "center",
    backgroundColor:"#0D2041",
    marginTop: hp(1.5),
    borderRadius: 10,
    alignSelf:"center",
    paddingVertical:hp(1.8),
    paddingHorizontal:wp(3.6)
  },
  modalQoutesCon: {
    width: '100%',
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#0D2041",
    marginTop: hp(1),
    borderRadius: 10,
    alignSelf: "center",
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(3.6)
  },
  nextButton: {
    width: wp(93),
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: 20,
    alignSelf: "center",
    height:hp(6.4),
    marginTop:hp(1.6),
    marginBottom:hp(3)
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight:"bold"
  },
  confirmModalContent: {
    backgroundColor: 'rgba(33, 43, 83, 1)',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputContainer: {
    width: '90%',
    borderRadius: 19,
    borderColor: 'gray',
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 19,
    padding: 10,
    backgroundColor: '#ededeb',
  },
  input: {
    backgroundColor: '#ededeb',
  },
  confirmButton: {
    width: '50%',
    borderRadius: 19,
    borderColor: 'gray',
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 19,
    padding: 10,
    backgroundColor: 'green',
  },
  confirmButtonText: {
    textAlign: 'center',
    color: '#fff',
  },
  chooseModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  chooseModalContent: {
    backgroundColor: 'rgba(33, 43, 83, 1)',
    padding: 20,
    borderRadius: 10,
    width: wp(99),
    maxHeight: '80%',
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: "#fff"
  },
  chooseItemContainer: {
    marginVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth:0.9,
    borderBlockEndColor: '#fff',
    marginBottom: hp(0.5),
    paddingBottom:hp(2)
  },
  chooseItemImage: {
    width: 39,
    height: 39,
    resizeMode: 'contain',
    marginVertical: 3,
  },
  chooseItemText: {
    marginLeft: 10,
    fontSize: 24,
    color: '#fff',
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
  },
  logoImg_TOP_1: {
    height: 35,
    width: 35,
    marginRight: 3
  },
  text_TOP: {
    color: "white",
    fontSize: 19,
    fontWeight: "bold",
    alignSelf: "center",
    marginStart: wp(34)
  },
  text1_ios_TOP: {
    alignSelf:"center",
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    paddingTop:hp(3),
  },
  container_a: {
    flex: 1,
    width: "94%",
    // alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: "rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)",
    margin: 10,
    borderRadius: 10
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
    color: "#fff"
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
    padding: 3,
    width: "90%",
    marginTop: 3
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
    alignSelf: "flex-end",
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: "100%",
    height: "60%",
  },
  modalContainer_option_sub: {
    alignSelf: "flex-end",
    backgroundColor: 'rgba(33, 43, 83, 1)',
    padding: 10,
    borderRadius: 10,
    width: "65%",
    height: "70%"
  },
  modalContainer_option_view: {
    flexDirection: "row",
    marginTop: 25,
    alignItems: "center",
  },
  modalContainer_option_text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "gray",
    marginStart: 5
  },
  alertBtn: {
    width: "90%",
    height: 40,
    borderRadius: 80,
    marginTop:19,
    backgroundColor:"#2164C1",
    alignItems:"center",
    justifyContent:"center"
  },
  alertBtnText:{
      textAlign:"center",
      fontSize:19,
      fontWeight:"400",
      color:"#fff"
  },
  networkHeading:{
    color:"#fff",
    fontSize:14,
    fontWeight:"500",
    marginLeft:wp(1.3),
    marginTop:hp(-0.1)
  },
  networkSubHeading:{
    color:"#94A3B8",
    fontSize:13,
    marginLeft:wp(1.3)
  },
  quoteTextCon: {
    flexDirection: "row",
    padding: 9,
    borderWidth:1,
    borderRadius: 8,
  },
  quoteText: {
    fontSize: 20,
    color: '#fff',
    borderRadius: 8,
    fontWeight:"600"
  },
  quoteDetailsContainer: {
    paddingHorizontal: 1,
    borderRadius: 8,
  },
  quoteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#fff',
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quoteLabel: {
    fontSize: 14,
    color: 'silver',
    fontWeight:"500"
  },
  quoteValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  loadingText: {
    marginTop: 8,
    color: 'silver',
  },
  feePayCon:{
    flexDirection: "row",
    marginLeft:10,
    paddingVertical:hp(1),
    paddingHorizontal:wp(2),
    borderRadius:10,
    maxWidth:wp(38),
    alignItems:"center",
    justifyContent:"center",
    marginTop:8
   },
   feePayTx: {
    fontSize: 16,
    fontWeight:"600"
  },
  allBridgeTxCon:{
    zIndex:20,
    position:"absolute",
    width:"100%",
    maxHeight:"50%",
    bottom:25
  },
  exportBottomCon: {
    width: '100%',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    alignSelf: "center",
    marginTop:12,
    paddingVertical: hp(0),
    paddingHorizontal: wp(3.9)
  },
  exportCon: {
    width: wp(41),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0D2041",
    borderRadius: 10,
    alignSelf: "center",
    paddingVertical: hp(1.4),
    paddingHorizontal: wp(3)
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#2b3c57",
    borderRadius: 10,
    paddingVertical:hp(1.9),
    marginVertical: hp(0.5),
    justifyContent: "space-between",
  },
  accountDetailsCon:{
    flexDirection:"row",
    justifyContent:"space-between",
    paddingHorizontal:wp(4.5)
  },
  rowBtnCon: {
    width: '93%',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 10,
    alignSelf: "center",
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(2)
  },
  textInputForCrossChain: {
    width:"100%",
    paddingHorizontal: wp(2),
    paddingVertical:  Platform.OS=="android"?hp(1):hp(2),
  },
});
export default classic;