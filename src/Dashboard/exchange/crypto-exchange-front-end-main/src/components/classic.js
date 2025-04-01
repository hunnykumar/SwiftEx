import React, { useCallback, useEffect, useState } from 'react';
import { Modal, View, Text, Picker, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput, Image, Platform, Keyboard, Alert, BackHandler } from 'react-native';
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
import { REACT_APP_HOST, REACT_APP_LOCAL_TOKEN } from '../ExchangeConstants';
import AsyncStorageLib from '@react-native-async-storage/async-storage';
import darkBlue from '../../../../../../assets/darkBlue.png'
import steller_img from '../../../../../../assets/Stellar_(XLM).png'
import bnbimage from "../../../../../../assets/bnb-icon2_2x.png";
import WalletActivationComponent from '../utils/WalletActivationComponent';
import { GET, authRequest, getToken } from '../api';
import { ShowErrotoast, alert } from '../../../../reusables/Toasts';
import { toInt } from 'validator';
import { SignTransaction, swap_prepare } from '../../../../../../All_bridge';
import { Exchange_screen_header } from '../../../../reusables/ExchangeHeader';
import { ethers } from 'ethers';
import { OneTapContractAddress, OneTapUSDCAddress, RPC } from '../../../../constants';
import Clipboard from '@react-native-clipboard/clipboard';
import { QuoteModalBottomSheet } from '../utils/QuotesComponent';
import { CustomQuotes } from '../utils/CustomQuotes';
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
  const [fianl_modal_text,setfianl_modal_text]=useState("Transaction Faild")
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
  const fetchUSDCBalnce = async (addresses) => {
    try {
      setbalanceLoading(true)
      if(state.STELLAR_ADDRESS_STATUS===false)
        {
            setACTIVATION_MODAL_PROD(true)
        }
      const provider = new ethers.providers.JsonRpcProvider(RPC.ETHRPC);
      const usdtAddress = "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0";
      const usdtAbi = [
        "function balanceOf(address owner) view returns (uint256)"
      ];

      const usdtContract = new ethers.Contract(usdtAddress, usdtAbi, provider);

      const balance = await usdtContract.balanceOf(addresses);
      console.log(`USDT Balance of ${addresses}: ${ethers.utils.formatUnits(balance, 6)} USDT`);

      setWALLETBALANCE(ethers.utils.formatUnits(balance, 6));
      if(parseFloat(ethers.utils.formatUnits(balance, 6))===0||state.STELLAR_ADDRESS_STATUS===false)
        {
          setonTapFeature(true)
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
      keysUpdate()
      const provider = new ethers.providers.JsonRpcProvider(RPC.ETHRPC);
      const wallet = new ethers.Wallet(state?.wallet?.privateKey, provider);
      const usdtAddress = OneTapUSDCAddress.Address;  
      const usdtAbi = [
          "function transfer(address to, uint256 value) public returns (bool)"
      ];
      const usdtContract = new ethers.Contract(usdtAddress, usdtAbi, wallet);
      const valueInUSDT = ethers.utils.parseUnits(amount, 6);
      const tx = await usdtContract.transfer(OneTapContractAddress.Address, valueInUSDT);
      console.log("Transaction Sent", `Tx Hash: ${tx.hash}`);
  
      setfianl_modal_text("Transaction Successful");
      await tx.wait();
      setfianl_modal_loading(false);
      setfianl_modal_error(true);
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
  return (
    <View style={{ backgroundColor: "#011434",width:wp(100),height:hp(100)}}>
     <Exchange_screen_header title="Bridge" onLeftIconPress={() => navigation.navigate("/")} onRightIconPress={() => console.log('Pressed')} />
     {/* <WalletActivationComponent
         isVisible={ACTIVATION_MODAL_PROD}
         onClose={() => {ActivateModal}}
         onActivate={ActivateModal}
         navigation={navigation}
         appTheme={true}
         shouldNavigateBack={true}
       />  */}
         <CustomQuotes
                   isVisible={onTapFeature}
                   onClose={()=>{handleClose()}}
                   tokenChain={"ETH"}
                   tokenName={"WETH"}
                   tokenAddress={"0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"}
                   ACTIVATED={state?.STELLAR_ADDRESS_STATUS}
                 />
      <View style={styles.modalHeader}>
            <Text style={styles.textModal}>Import Assets on Trade Wallet</Text>
          </View>

          <View style={{ marginTop: hp(3),paddingHorizontal:wp(4),alignSelf:"flex-start" }}>

            <View style={{ width: wp(40), alignSelf: "center" }}>
              <Text style={[styles.textModal, { fontSize: 18 }]}>Select wallet</Text>

              <TouchableOpacity style={[styles.modalOpen, { width: wp(90) }]} onPress={() => { setChooseModalVisible(true); setIdIndex(1); }}>
                {chooseSelectedItemId === null ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemId === "BNB" ? <Image source={{ uri: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemId === "Matic" ? <Image source={{ uri: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912" }} style={styles.logoImg_TOP_1} /> : <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png" }} style={styles.logoImg_TOP_1} />}
                <Text style={{color:"#fff",fontSize:19,marginLeft:wp(1.3)}}>{chooseSelectedItemId === null ? chooseItemList[1].name : chooseSelectedItemId}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ width: wp(40), alignSelf: "center" }}>
              <Text style={[styles.textModal, { fontSize: 18 }]}>Choose asset</Text>
              <TouchableOpacity style={[styles.modalOpen, { width: wp(90) }]} onPress={() => { setchooseModalVisible_choose(true); setIdIndex(3); }}>
                {chooseSelectedItemIdCho === null ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "USDC" ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "BNB" ? <Image source={{ uri: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "Matic" ? <Image source={{ uri: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912" }} style={styles.logoImg_TOP_1} /> : <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png" }} style={styles.logoImg_TOP_1} />}
               <View>
               <Text style={{color:"#fff",fontSize:19,marginLeft:wp(1.3)}}>{chooseSelectedItemIdCho === null ? chooseItemList_ETH[0].name : chooseSelectedItemIdCho}</Text>
                <View style={{flexDirection:"row",alignItems:"center"}}>
                <Text style={{ color: "#fff", fontSize: 10, marginLeft: wp(1.3) }}>
                {chooseSelectedItemIdCho === null
                  ? "0x7e9fbbf33c595430848e767E162e4b0FF6b8205b"
                  : chooseSelectedItemIdCho === "USDT"
                    ? "0x7e9fbbf33c595430848e767E162e4b0FF6b8205b"
                    : "Arriving soon"}
              </Text>
              {chooseSelectedItemIdCho === "USDT"||chooseSelectedItemIdCho === null?<TouchableOpacity onPress={()=>{copyToClipboard("0x7e9fbbf33c595430848e767E162e4b0FF6b8205b")}} style={{ marginLeft: 5 }}>
              <Icon
                          name={"content-copy"}
                          type={"materialCommunity"}
                          color={"rgba(129, 108, 255, 0.97)"}
                          size={24}
                        />
              </TouchableOpacity>:<></>}

                </View>
               </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ width: wp(90),borderRadius:10, alignSelf: "flex-start",marginTop:hp(4),borderWidth: 1.9,borderColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",height: hp(8.6),backgroundColor: '#2F7DFF33',alignItems:"flex-start",justifyContent:"center",marginLeft:wp(4),paddingHorizontal:wp(1) }}>
              <View style={{flexDirection:"row",alignItems:"center",width:wp(85)}}>
              <Text style={{fontSize:16,textAlign:"center",color:"#fff",fontSize:19}}>Address: </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: "96%",borderRadius:10}}>
                <Text style={{fontSize:17,color:"#fff" }}>{WALLETADDRESS}</Text>
              </ScrollView>
              </View>
              <View style={{flexDirection:"row",alignItems:"center",width:wp(30)}}>
              <Text style={{fontSize:19,textAlign:"center",color:"#fff"}}>Balance: </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: "96%"}}>
                {balanceLoading?<ActivityIndicator color={"green"}/>:<Text style={{color:"#fff",fontSize:19 }}>{WALLETBALANCE}</Text>}
              </ScrollView>
              </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" ,marginTop:hp(2),paddingHorizontal:wp(4)}}>
            <View style={{ width: wp(40), alignSelf: "center" }}>
            <Text style={[styles.textModal, { fontSize: 18 }]}>Amount</Text>
              <TextInput maxLength={2} placeholder='0.0' placeholderTextColor={"gray"} keyboardType="number-pad" style={[styles.modalOpen, { padding:10, width: wp(40),fontSize:18,color:"#fff" }]} onChangeText={(value) => { setamount(value) }} returnKeyType="done"/>
            </View>
            <View style={{ width: wp(40), alignSelf: "center" }}>
              <Text style={[styles.textModal, { fontSize: 18 }]}>Receive</Text>
              <View style={[styles.modalOpen, { backgroundColor: "#33373DCC", width: wp(40) }]} onPress={() => { setchooseModalVisible_choose(true); setIdIndex(3); }}>
                {chooseSelectedItemIdCho === null ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "USDC" ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "BNB" ? <Image source={{ uri: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "Matic" ? <Image source={{ uri: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912" }} style={styles.logoImg_TOP_1} /> : <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }} style={styles.logoImg_TOP_1} />}
                <View>
                <Text style={{color:"#fff",fontSize:19,marginLeft:2}}>{chooseSelectedItemIdCho === null ? "USDC" : chooseSelectedItemIdCho === "USDC" ? chooseSelectedItemId === "Matic" || chooseSelectedItemIdCho === "Matic" ? "apUSDC" : "USDC" : chooseSelectedItemIdCho === "BNB" ? "BNB" : chooseSelectedItemIdCho === "Matic" ? "apMATIC" : "USDC"}</Text>
                {chooseSelectedItemIdCho === null||chooseSelectedItemIdCho ==="USDC"?<Text style={{color:"gray",fontSize:10}}>centre.io</Text>:chooseSelectedItemIdCho ==="USDT"?<Text style={{color:"gray",fontSize:10}}>centre.io</Text>:<></>}
                </View>
              </View>
            </View>
          </View>


            <TouchableOpacity
              // disabled={chooseSelectedItemIdCho === null||chooseSelectedItemId === null} 
              style={[styles.nextButton, { backgroundColor: !amount||balanceLoading?"gray":'#2F7DFF',height:hp(6),marginTop:hp(5) }]}
            disabled={!amount||fianl_modal_loading||balanceLoading} onPress={() => { Keyboard.dismiss(),manage_swap() }}
            >
              {fianl_modal_loading?<ActivityIndicator color={"white"}/>:<Text style={styles.nextButtonText}>Confirm Transaction</Text>}
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

    </View>
  );
};

const styles = StyleSheet.create({
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
    marginTop: 19,
    paddingLeft:wp(5)
  },
  textModal: {
    marginTop: 10,
    color: "#fff",
    fontSize: 19,
  },
  modalOpen: {
    width: '90%',
    height: hp(8),
    alignItems: "center",
    borderRadius: 10,
    backgroundColor:"#33373DCC",
    // paddingLeft: 10,
    marginTop: 10,
    flexDirection: "row",
    borderWidth: 1.9,
    borderColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
    borderRadius: 19,
    paddingLeft:10,
  },
  nextButton: {
    width: wp(90),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginTop: 20,
    alignSelf: "center"
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
    marginLeft: wp(22),
  },
  logoImg_TOP_1: {
    height: 39,
    width: 39,
    marginLeft: wp(1),
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
  }
});
export default classic;