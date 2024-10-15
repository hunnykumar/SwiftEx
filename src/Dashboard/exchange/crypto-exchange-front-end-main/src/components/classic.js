import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Picker, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput, Image, Platform, Keyboard } from 'react-native';
import Icon from "../../../../../icon";
import { FlatList, useToast } from 'native-base';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Bridge from "../../../../../../assets/Bridge.png";
import { useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { REACT_APP_LOCAL_TOKEN } from '../ExchangeConstants';
import AsyncStorageLib from '@react-native-async-storage/async-storage';
import darkBlue from '../../../../../../assets/darkBlue.png'
import steller_img from '../../../../../../assets/Stellar_(XLM).png'
import bnbimage from "../../../../../../assets/bnb-icon2_2x.png";

import { GET, authRequest } from '../api';
import { ShowErrotoast, alert } from '../../../../reusables/Toasts';
import { toInt } from 'validator';
import { SignTransaction, swap_prepare } from '../../../../../../All_bridge';
const classic = ({ route }) => {
  const toast=useToast();
  const navigation=useNavigation();
  const { Asset_type } = route.params;
  const TEMPCHOSE=Asset_type==="ETH"?"Ethereum":Asset_type==="BNB"?"BNB":Asset_type 
  console.log("-=-=-=-=-=-=-=-------=======",Asset_type,TEMPCHOSE)
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
  const chooseItemList = [
    { id: 1, name: "Ethereum", url: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png" },
    { id: 2, name: "BNB", url: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png" },
    // { id: 3, name: "Matic", url: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912" },
  ]
  const chooseItemList_ETH = [
    { id: 1, name: "USDT", url: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png" },
    chooseSelectedItemId === "Ethereum" ? { id: 2, name: "USDC", url: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" } :
    chooseSelectedItemId === "Matic"?{ id: 2, name: "Matic", url: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912" }:{ id: 2, name: "BNB", url: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png" },
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
useEffect(()=>{
  setfianl_modal_loading(false)
},[])
  const for_trading = async () => {
    try {
        const { res, err } = await authRequest("/users/getUserDetails", GET);
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

  const manage_swap = async (wallet_type, asset_type, receive_token) => {
    const receivetoken = wallet_type === "Ethereum" && asset_type === "USDT" && receive_token === null ? "USDC" : wallet_type === "BNB" && asset_type === "USDT" && receive_token === null ? "aeETH" : wallet_type === "Ethereum" && asset_type === "USDT" ? "aeETH" : wallet_type === "BNB" && asset_type === "USDT" ? "aeETH" : receive_token;
    setfianl_modal_loading(true);
    let temp_bal = toInt(state.EthBalance)
    let temp_amt = toInt(amount)
    if (temp_amt >= temp_bal || temp_amt === 0) {
      setfianl_modal_loading(false)
      ShowErrotoast(toast,temp_amt === 0 ? "Invalid amount" : "Insufficient funds");
    }
    else {
      setfianl_modal_loading(false)      // comment this code for run allbridge
      setfianl_modal_error(true)         // comment this code for run allbridge

      // uncomment this code for run allbridge

      // const ressult_swap = await swap_prepare(state.wallet.privateKey, state.wallet.address, state.STELLAR_PUBLICK_KEY, amount, asset_type, receivetoken, wallet_type)
      // console.log("----", ressult_swap.status_task)
      // if (ressult_swap.status_task) {
      //   setfianl_modal_loading(false)
      //   setfianl_modal(true)
      // }
      // else {
      //   setfianl_modal_loading(false)
      //   setfianl_modal_error(true)
      // }
    }
  }
  return (
    <View style={{ backgroundColor: "rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)",width:wp(100),height:hp(100)}}>
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
              onPress={() =>navigation.goBack()}
            />

      {/* Middle Text */}
      <Text style={{
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color:"#fff",
        flex: 1,
        marginLeft:wp(13),
        marginTop:Platform.OS==="android"?hp(0):hp(3)
      }}>Bridge</Text>

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
      <View style={styles.modalHeader}>
            <Text style={styles.textModal}>Import assets on exchange</Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between",marginTop: hp(3),paddingHorizontal:wp(4) }}>

            <View style={{ width: wp(30), alignSelf: "center" }}>
              <Text style={[styles.textModal, { fontSize: 18 }]}>Select wallet</Text>

              <TouchableOpacity style={[styles.modalOpen, { width: wp(40) }]} onPress={() => { setChooseModalVisible(true); setIdIndex(1); }}>
                {chooseSelectedItemId === null ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemId === "BNB" ? <Image source={{ uri: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemId === "Matic" ? <Image source={{ uri: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912" }} style={styles.logoImg_TOP_1} /> : <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png" }} style={styles.logoImg_TOP_1} />}
                <Text>{chooseSelectedItemId === null ? chooseItemList[1].name : chooseSelectedItemId}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ width: wp(40), alignSelf: "center" }}>
              <Text style={[styles.textModal, { fontSize: 18 }]}>Choose asset</Text>
              <TouchableOpacity style={[styles.modalOpen, { width: wp(40) }]} onPress={() => { setchooseModalVisible_choose(true); setIdIndex(3); }}>
                {chooseSelectedItemIdCho === null ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "USDC" ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "BNB" ? <Image source={{ uri: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "Matic" ? <Image source={{ uri: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912" }} style={styles.logoImg_TOP_1} /> : <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png" }} style={styles.logoImg_TOP_1} />}
                <Text>{chooseSelectedItemIdCho === null ? chooseItemList_ETH[0].name : chooseSelectedItemIdCho}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ width: wp(90),borderRadius:10, alignSelf: "flex-start",marginTop:40,height: hp(6.9),backgroundColor: '#ededeb',alignItems:"flex-start",justifyContent:"center",marginLeft:wp(4),paddingHorizontal:wp(1) }}>
              <View style={{flexDirection:"row",alignItems:"center",width:wp(85)}}>
              <Text style={{fontSize:16,textAlign:"center"}}>Address: </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: "96%",borderRadius:10,borderColor:"#4CA6EA",borderWidth:1,backgroundColor:"silver"}}>
                <Text style={{fontSize:17 }}>{state.wallet.address}</Text>
              </ScrollView>
              </View>
              <View style={{flexDirection:"row",alignItems:"center",width:wp(30)}}>
              <Text style={{fontSize:16,textAlign:"center"}}>Balance: </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: "96%"}}>
                <Text style={{fontSize:17 }}>{state.EthBalance}</Text>
              </ScrollView>
              </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" ,marginTop:19,paddingHorizontal:wp(4)}}>
            <View style={{ width: wp(40), alignSelf: "center" }}>
            <Text style={[styles.textModal, { fontSize: 18 }]}>Amount</Text>
              <TextInput placeholder='0.0' placeholderTextColor={"gray"} keyboardType="number-pad" style={[styles.modalOpen, { padding:10, width: wp(40),fontSize:18 }]} onChangeText={(value) => { setamount(value) }} returnKeyType="done"/>
            </View>
            <View style={{ width: wp(40), alignSelf: "center" }}>
              <Text style={[styles.textModal, { fontSize: 18 }]}>Receive</Text>
              <View style={[styles.modalOpen, { backgroundColor: "silver", width: wp(40) }]} onPress={() => { setchooseModalVisible_choose(true); setIdIndex(3); }}>
                {chooseSelectedItemIdCho === null ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "USDC" ? <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "BNB" ? <Image source={{ uri: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png" }} style={styles.logoImg_TOP_1} /> : chooseSelectedItemIdCho === "Matic" ? <Image source={{ uri: "https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png?1624446912" }} style={styles.logoImg_TOP_1} /> : <Image source={{ uri: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png" }} style={styles.logoImg_TOP_1} />}
                <View>
                <Text>{chooseSelectedItemIdCho === null ? "USDC" : chooseSelectedItemIdCho === "USDC" ? chooseSelectedItemId === "Matic" || chooseSelectedItemIdCho === "Matic" ? "apUSDC" : "USDC" : chooseSelectedItemIdCho === "BNB" ? "BNB" : chooseSelectedItemIdCho === "Matic" ? "apMATIC" : "aeETH"}</Text>
                {chooseSelectedItemIdCho === null||chooseSelectedItemIdCho ==="USDC"?<Text style={{color:"gray",fontSize:10}}>centre.io</Text>:chooseSelectedItemIdCho ==="USDT"?<Text style={{color:"gray",fontSize:10}}>allbridge.io</Text>:<></>}
                </View>
              </View>
            </View>
          </View>


            <TouchableOpacity
              // disabled={chooseSelectedItemIdCho === null||chooseSelectedItemId === null} 
              style={[styles.nextButton, { backgroundColor: !amount?"gray":'green',height:hp(6),marginTop:hp(5) }]}
            disabled={!amount||fianl_modal_loading} onPress={() => { Keyboard.dismiss(),manage_swap(chooseSelectedItemId === null ? chooseItemList[1].name : chooseSelectedItemId,chooseSelectedItemIdCho === null ? chooseItemList_ETH[0].name : chooseSelectedItemIdCho,chooseSelectedItemIdCho) }}
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
                <Text>{state.wallet.address}</Text>
              </ScrollView>
            </View>
            <View style={styles.inputContainer}>
              <TextInput placeholder='Amount' placeholderTextColor="gray" keyboardType="number-pad" style={styles.input} onChangeText={(value) => { setamount(value) }} />
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
          
        <TouchableOpacity style={styles.modalContainer} onPress={()=>{setfianl_modal_error(false)}}>
          <View style={{
            backgroundColor: 'rgba(33, 43, 83, 1)',
            padding: 20,
            borderRadius: 10,
            alignItems: 'center',
            width: "90%",
            height: "25%",
            justifyContent: "center"
          }}>
             <TouchableOpacity style={{alignSelf:"flex-end",marginTop:-50,marginRight:-13}} onPress={()=>{setfianl_modal_error(false)}}>
          <Icon
              name={"close-circle-outline"}
              type={"materialCommunity"}
              size={35}
              color={"orange"}
            />
          </TouchableOpacity>
            <Icon
              name={"alert-circle-outline"}
              type={"materialCommunity"}
              size={60}
              color={"red"}
              style={{marginTop:19}}
            />
            <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 10, color: "#fff" }}>Transaction Faild</Text>
          </View>
        </TouchableOpacity>
      </Modal>


      <Modal
        animationType="slide"
        transparent={true}
        visible={chooseModalVisible}
      >
        <TouchableOpacity style={styles.chooseModalContainer} onPress={() => setChooseModalVisible(false)}>
          <View style={styles.chooseModalContent}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={"gray"}
              onChangeText={text => setChooseSearchQuery(text)}
              value={chooseSearchQuery}
              autoCapitalize='none'
            />
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
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={"gray"}
              onChangeText={text => setChooseSearchQuery(text)}
              value={chooseSearchQuery}
              autoCapitalize='none'
            />
            <FlatList
              data={chooseItemList_ETH}
              renderItem={chooseRenderItem}
              keyExtractor={(item) => item.id.toString()}
            />
          </View>
        </TouchableOpacity>
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
    justifyContent: "center",
    marginTop: 19
  },
  textModal: {
    marginTop: 10,
    color: "#fff",
    fontSize: 19,
  },
  modalOpen: {
    width: '90%',
    height: hp(6),
    backgroundColor: '#ededeb',
    alignItems: "center",
    borderRadius: 10,
    // paddingLeft: 10,
    marginTop: 10,
    flexDirection: "row"
  },
  nextButton: {
    width: '50%',
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
    borderColor: 'rgba(28, 41, 77, 1)',
    borderWidth: 0.9,
    borderBottomColor: '#fff',
    marginBottom: 4,
  },
  chooseItemImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    marginVertical: 3,
  },
  chooseItemText: {
    marginLeft: 10,
    fontSize: 19,
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
    height: hp(4),
    width: wp(8.3),
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
  }
});
export default classic;