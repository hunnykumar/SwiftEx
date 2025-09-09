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
import { fetchTokenInfo } from '../../../../../ethSwap/tokenUtils';
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
  const fetchUSDCBalnce = async (addresses) => {
    try {
      setbalanceLoading(true)
      if(state.STELLAR_ADDRESS_STATUS===false)
        {
            setACTIVATION_MODAL_PROD(true)
        }

      const usdtAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
      if (usdtAddress && addresses) {
         const resposeBalance = await fetchTokenInfo(usdtAddress, addresses)
        const balance = resposeBalance[0].tokenBalance;
        console.log(`USDT Balance of ${addresses}: ${balance} USDT`);
        
        setWALLETBALANCE(balance);
      }
      setbalanceLoading(false)
      BridgeUSDCValidation()
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
        navigation.navigate('/');
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
      <Text style={styles.chooseItemText}>{item.name}</Text>
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
      const wallet = new ethers.Wallet(state?.wallet?.privateKey);
      const respoExe = await swap_prepare(state?.wallet?.privateKey, wallet.address, state.STELLAR_PUBLICK_KEY, amount, "USDT", "USDC", "ETH")
      console.log("classic last ui res ---->", respoExe)
      if (respoExe?.status_task) {
        setfianl_modal_text("Transaction Successful");
        setfianl_modal_loading(false);
        setfianl_modal_error(true);
      }
      if (!respoExe.status_task) {
        setfianl_modal_text("Transaction Failed");
        console.log("Transaction Failed", respoExe);
        setfianl_modal_loading(false);
        setfianl_modal_error(true);
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
    debounce((value,chaiType) => {
      setmessageError(null);
      if (isValidNumber(value)&&value!=="null") {
        setmessageError(null);
        setresQuotes(null)
        setgetInfo(false)
        if(chaiType==="ETH")
        {
          setgetInfo(true);
          collectQuotes(value,chaiType) 
        }
        if(chaiType==="BSC")
          {
            setgetInfo(true);
            collectQuotes(value,chaiType) 
          }
      }
      else {
        setmessageError("Invalid Amount");
      }
    }, 400),
    []
  );
  
  const handleInputChange = (text,tokenChain) => {
    setresQuotes(null);
    const numericText = text.replace(/[^0-9.]/g, '');
    setamount(numericText)
    getQuote(numericText,tokenChain==="BNB"?"BSC":"ETH");
  };
  
  const collectQuotes = async (value,typeOfchain) => {
    const deviceToken = await getToken();
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("Authorization", "Bearer " + deviceToken);
      myHeaders.append("x-auth-device-token", deviceToken);
      const raw = JSON.stringify({
        "amount": value,
        "chainType":typeOfchain
      });
  
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      };
  
      fetch(REACT_PROXY_HOST + `/v1/bridge/swap-quotes`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
          console.log("---err->",result)
          if (result?.quotes) {
            setresQuotes(result?.quotes),
            setgetInfo(false)
          }
          else {
            setgetInfo(false)
            setresQuotes(null)
            console.log("---err->",result)
            Alert.alert("Info", "An error occurred. Please try again later.")
          }
        })
        .catch((error) => {
          setgetInfo(false)
          setresQuotes(null)
          console.log("--->errorClasic",error)
        });
    }

  return (
    <View style={{ backgroundColor: "#011434",width:wp(100),height:hp(100)}}>
     <Exchange_screen_header title="Bridge" onLeftIconPress={() => navigation.navigate("/")} onRightIconPress={() => console.log('Pressed')} />
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
      <ScrollView style={{marginBottom:hp(5)}}>
      <View style={styles.modalHeader}>
            <Text style={styles.headingText}>Import USDC on Trade Wallet</Text>
          </View>
          <View style={{ marginTop: hp(0),alignSelf:"center" }}>
              <TouchableOpacity style={styles.modalOpen} onPress={() => { setChooseModalVisible(true); setIdIndex(1); }}>
               <View style={{flexDirection:"row"}}>
               {chooseSelectedItemId === null ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemId === "BNB" ? <Image source={{ uri: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemId === "Matic" ? <Image source={{ uri: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912" }} style={styles.logoImg_TOP_1} /> : <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png" }} style={styles.logoImg_TOP_1} />}
                <View>
                <Text style={styles.networkSubHeading}>Network</Text>
                <Text style={styles.networkHeading}>{chooseSelectedItemId === null ? chooseItemList[1].name : chooseSelectedItemId}</Text>
                </View>
               </View>
              <Icon name={"chevron-right"} type={"materialCommunity"} color={"#fff"} size={30}/>
            </TouchableOpacity>

              <TouchableOpacity style={styles.modalOpen} onPress={() => { setchooseModalVisible_choose(true); setIdIndex(3); }}>
               <View style={{flexDirection:"row"}}>
                {chooseSelectedItemIdCho === null ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "USDC" ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "BNB" ? <Image source={{ uri: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "Matic" ? <Image source={{ uri: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912" }} style={styles.logoImg_TOP_1} /> : <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png" }} style={styles.logoImg_TOP_1} />}
               <View>
               <Text style={styles.networkSubHeading}>Assets</Text>
               <Text style={styles.networkHeading}>{chooseSelectedItemIdCho === null ? chooseItemList_ETH[0].name : chooseSelectedItemIdCho}</Text>
               </View>
               </View>
               <Icon name={"chevron-right"} type={"materialCommunity"} color={"#fff"} size={30}/>
              </TouchableOpacity>
          </View>

          <View style={[styles.modalOpen,{paddingVertical: hp(0.5),}]}>
            <View>
            <Text style={styles.subInputText}>Amount</Text>
            <TextInput maxLength={10} placeholder='0.0' placeholderTextColor={"gray"} keyboardType="number-pad" style={[ {width: wp(40),fontSize:18,color:"#fff",marginTop:hp(-0.9)}]} onChangeText={(value) => { handleInputChange(value,chooseSelectedItemId === null ? chooseItemList[1].name : chooseSelectedItemId) }} returnKeyType="done"/>
            </View>
            <TouchableOpacity style={styles.maxCon} onPress={()=>{setamount(parseFloat(WALLETBALANCE)===0?null:WALLETBALANCE)}}>
            <Text style={styles.maxBtn}>MAX</Text>
            </TouchableOpacity>    
          </View>

          <View style={[styles.modalOpen,{paddingVertical: hp(1.5),}]}>
            <Text style={[styles.subInputText,{ marginTop:hp(0)}]}>Address</Text>
            <View style={{width:"50%"}}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: "96%"}}>
                <Text style={{fontSize:17,color:"gray" }}>{WALLETADDRESS}</Text>
              </ScrollView>
            </View>
          </View>

          <View style={[styles.modalOpen,{paddingVertical: hp(1.5),marginTop:hp(0.5)}]}>
            <Text style={[styles.subInputText,{ marginTop:hp(0)}]}>Balance</Text>
            <View style={{width:"15%"}}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: "96%"}}>
            {balanceLoading?<ActivityIndicator color={"green"}/>:<Text style={{color:"gray",fontSize:17 }}>{WALLETBALANCE}</Text>}
              </ScrollView>
            </View>
          </View>

      <View style={styles.modalOpen}>
        <View style={{ flexDirection: "row" }}>
         {chooseSelectedItemIdCho === null ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "USDC" ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "BNB" ? <Image source={{ uri: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "Matic" ? <Image source={{ uri: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912" }} style={styles.logoImg_TOP_1} /> : <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }} style={styles.logoImg_TOP_1} />}
          <View>
            <Text style={styles.networkSubHeading}>Receive</Text>
            <View style={{flexDirection:"row",alignItems:"center"}}>
            <Text style={styles.networkHeading}>{chooseSelectedItemIdCho === null ? "USDC" : chooseSelectedItemIdCho === "USDC" ? chooseSelectedItemId === "Matic" || chooseSelectedItemIdCho === "Matic" ? "apUSDC" : "USDC" : chooseSelectedItemIdCho === "BNB" ? "BNB" : chooseSelectedItemIdCho === "Matic" ? "apMATIC" : "USDC"}</Text>
            <Text style={{color:"gray",fontSize:13}}> (centre.io)</Text>
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
      {resQuotes !== null && <View style={styles.modalQoutesCon}>
      <Text style={styles.quoteTitle}>Quote Details</Text>
        <View style={[styles.quoteDetailsContainer]}>
          <View style={styles.quoteRow}>
            <Text style={styles.quoteLabel}>Provider</Text>
            <Text style={styles.quoteValue}>Allbridge</Text>
          </View>

          <View style={styles.quoteRow}>
            <Text style={styles.quoteLabel}>Rate</Text>
            <Text style={styles.quoteValue}>
              1 USDT = {resQuotes.conversionRate} USDC
            </Text>
          </View>

          <View style={styles.quoteRow}>
            <Text style={styles.quoteLabel}>Slippage</Text>
            <Text style={styles.quoteValue}>
              {resQuotes.slippageTolerance}%
            </Text>
          </View>

          <View style={styles.quoteRow}>
            <Text style={styles.quoteLabel}>Minimum Received</Text>
            <View style={{ width: wp(25), flexDirection: 'row' }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Text style={styles.quoteValue}>{resQuotes.minimumAmountOut}</Text>
              </ScrollView>
              <Text style={styles.quoteValue}>USDC</Text>
            </View>
          </View>
        </View>
        <View style={styles.quoteTextCon}>
          <Text style={styles.quoteText}>≈</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={styles.quoteText}>{resQuotes.minimumAmountOut}</Text>
          </ScrollView>
          <Text style={styles.quoteText}>USDC</Text>
        </View>
      </View>}


            <TouchableOpacity
              // disabled={chooseSelectedItemIdCho === null||chooseSelectedItemId === null} 
              style={[styles.nextButton, { backgroundColor: !amount||balanceLoading||getInfo?"gray":'#2F7DFF' }]}
            disabled={!amount||fianl_modal_loading||balanceLoading||getInfo} onPress={() => { Keyboard.dismiss(),manage_swap() }}
            >
              {fianl_modal_loading||getInfo?<ActivityIndicator color={"white"}/>:<Text style={styles.nextButtonText}>Confirm Transaction</Text>}
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
              name={fianl_modal_text==="Transaction Faild"?"alert-circle-outline":"check-circle-outline"}
              type={"materialCommunity"}
              size={60}
              color={fianl_modal_text==="Transaction Faild"?"red":"green"}
              style={{marginTop:19}}
            />
            <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical: 19, color: "#fff" }}>{fianl_modal_text}</Text>
            <TouchableOpacity style={styles.alertBtn} onPress={()=>{fianl_modal_text==="Transaction Faild"?setfianl_modal_error(false):[setfianl_modal_error(false),navigation.navigate("Assets_manage")]}}>
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
          <View style={styles.chooseModalContent}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical:hp(1), color: "#fff" }}>Select Wallet</Text>
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
          <View style={styles.chooseModalContent}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginVertical:hp(1), color: "#fff" }}>Choose Asset</Text>
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
    marginTop: 10,
    color: "#fff",
    fontSize: 19,
  },
  subInputText: {
    marginTop:hp(1),
    color: "#94A3B8",
    fontSize: 16,
  },
  maxBtn: {
    color: "#FFF",
    fontSize: 16,
  },
  maxCon:{
    backgroundColor:"#2F7DFF",
    borderRadius:10,
    padding:8,
    paddingHorizontal:wp(5),
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
    width: '93%',
    flexDirection:"column",
    justifyContent:"space-between",
    backgroundColor:"#0D2041",
    marginTop: hp(1.8),
    borderRadius: 10,
    alignSelf:"center",
    paddingVertical:hp(1.8),
    paddingHorizontal:wp(3.6)
  },
  nextButton: {
    width: wp(93),
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: 20,
    alignSelf: "center",
    height:hp(6.4),
    marginTop:hp(1.6)
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
    height: 39,
    width: 39,
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
  card: {
    marginRight: 10,
    borderWidth: 1.9,
    borderColor: 'rgba(122, 59, 144, 1)rgba(100, 115, 197, 1)',
    borderRadius: 10,
    padding: 8,
    backgroundColor: "#011434"
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
    fontSize:16,
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
    backgroundColor: "#10B981",
    borderRadius: 8,
  },
  quoteText: {
    fontSize: 24,
    color: '#fff',
    borderRadius: 8,
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
});
export default classic;