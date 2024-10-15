import { Platform, StyleSheet, Text, TouchableOpacity, View, Image, Modal, TextInput, ActivityIndicator } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage";
import darkBlue from "../../../../../../assets/darkBlue.png";
import Icon from "../../../../../icon";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { REACT_APP_LOCAL_TOKEN } from "../ExchangeConstants";
import { useSelector } from "react-redux";
import Bridge from "../../../../../../assets/Bridge.png";
import xrp from "../../../../../../assets/CLICKPESA.png";
import bnb from "../../../../../../assets/CLPX.png";
import { useState } from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useRef } from "react";
import { ScrollView } from "native-base";
import { useEffect } from "react";
import { WebView } from 'react-native-webview';
const StellarSdk = require('stellar-sdk');
import { launchImageLibrary } from 'react-native-image-picker';

const Payout = () => {
  const state = useSelector((state) => state);
  const Assets = [
    { name: "USDC",by:"centre.io", address: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",dis_ass:"GA5...KZVN",img:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" },
    { name: "EURC",by:" circle.com", address: "GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2", dis_ass:"GDH...NPP2",img:"https://assets.coingecko.com/coins/images/26045/thumb/euro-coin.png?1655394420"},
    { name: "CLPX",by:"clpx", address: "GDYSPBVZHPQTYMGSYNOHRZQNLB3ZWFVQ2F7EP7YBOLRGD42XIC3QUX5G",dis_ass:"GDY...UX5G",img:"../../../../../../assets/CLPX.png" },
    { name: "RWF",by:"clickpesa", address: "GA2MSSZKJOU6RNL3EJKH3S5TB5CDYTFQFWRYFGUJVIN5I6AOIRTLUHTO",dis_ass:"GA2...UHTO",img:"../../../../../../assets/CLICKPESA.png" },
    { name: "KES",by:"clickpesa", address: "GA2MSSZKJOU6RNL3EJKH3S5TB5CDYTFQFWRYFGUJVIN5I6AOIRTLUHTO",dis_ass:"GA2...UHTO",img:"../../../../../../assets/CLICKPESA.png" },
  ];
  const Anchors=[
    // {name:"SwiftEx",by:"centre.io", address: state.wallet.address,image: require('../../../../../../assets/darkBlue.png'), seps: ["SEP 6", "SEP 12", "SEP 24"]},
    {name:"MoneyGram", address: state.wallet.address,image: require('../../../../../../assets/MONEY_GRAM.png'),dis_ass:"moneygram.com", seps: ["SEP 24"],tom_url:"https://www.moneygram.com/intl/moneygramaccess"},
    {name:"Banxa", address: state.wallet.address,image: require('../../../../../../assets/BANXA.png'),dis_ass:"banxa.com", seps: ["SEP 24"],tom_url:"https://banxa.com/"},
    {name:"Clpx", address: state.wallet.address,image: require('../../../../../../assets/CLPX.png'),dis_ass:"clpx.finance", seps: ["SEP 6", "SEP 24", "SEP 31"],tom_url:"https://clpx.finance/transactions"},
    {name:"Clickpesa", address: state.wallet.address,image: require('../../../../../../assets/CLICKPESA.png'),dis_ass:"clickpesa.com", seps: ["SEP 6", "SEP 24", "SEP 31"],tom_url:"https://clickpesa.com/"},
    {name:"Finclusive", address: state.wallet.address,image: require('../../../../../../assets/FINCLUSIVE.png'),dis_ass:"finclusive.com", seps: ["SEP 6", "SEP 24", "SEP 31"],tom_url:"https://finclusive.com/"},
    {name:"Mykobo", address: state.wallet.address,image: require('../../../../../../assets/MYKOBO.png'),dis_ass:"mykobo.co", seps: ["SEP 6", "SEP 24", "SEP 31"],tom_url:"https://mykobo.co/"},
  ];
  const price_data=[
    { name: "USDC", price: "100", fee:"0.5", asset_code:"USDC" },
    { name: "USDC", price: "100", fee:"0.5", asset_code:"USDC" },
    // { name: "USDC", price: "4", fee:"10", asset_code:"USDC" },
    // { name: "USDC", price: "4", fee:"10", asset_code:"" },
    // { name: "USDC", price: "4", fee:"10", asset_code:"XUSD" },
    // { name: "USDC", price: "4", fee:"10", asset_code:"XUSD" },
    // { name: "USDC", price: "4", fee:"10", asset_code:"XUSD" },
    // { name: "USDC", price: "4", fee:"10", asset_code:"XUSD" },
    // { name: "USDC", price: "4", fee:"10", asset_code:"XUSD" },
    // { name: "USDC", price: "4", fee:"10", asset_code:"XUSD" },
  ]
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [modalContainer_menu, setmodalContainer_menu] = useState(false);
  const [done_modal, setdone_modal] = useState(false);
  const [UPLAOD_1, setUPLAOD_1] = useState(false);
  const [UPLAOD, setUPLAOD] = useState(false);
  const [select_asset_modal, setselect_asset_modal] = useState(true);
  const [search_text, setsearch_text] = useState("");
  const AssetViewRef = useRef(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [show_anchors, setshow_anchors] = useState(false);
  const [kyc_modal_text, setkyc_modal_text] = useState("Fetching stellar.toml");
  const [kyc_modal, setkyc_modal] = useState(false);
  const [modal_load, setmodal_load] = useState(false);
  const [image_hide, setimage_hide] = useState(false);
  const [radio_btn_selectio_, setradio_btn_selectio_] = useState(true);
  const [radio_btn_selectio_0, setradio_btn_selectio_0] = useState(false);
  const [KYC_INFO, setKYC_INFO] = useState(false);
  const [deposit_modal, setdeposit_modal] = useState(false);
  const [price_modal, setprice_modal] = useState(false);
  const [send_price, setsend_price] = useState(false);
  const [Deposit_modal_new, setDeposit_modal_new] = useState(false);
  const [open_web_view, setopen_web_view] = useState(false);
  const [loading, setLoading] = useState(true);
  const [higlight,sethiglight]=useState(0);
  const [imageUri, setImageUri] = useState(null);
  const [Anchor_selection,setAnchor_selection]=useState(0);
  const [matchesFound, setMatchesFound] = useState(false);
  const [URL_OPEN, setURL_OPEN] = useState("");
  const filteredAssets = Assets.filter(list => list.name.includes(search_text));
  const filteredAnchors = Anchors.filter(list => list.name.includes(search_text));
  const handleScroll = (xOffset) => {
    if (AssetViewRef.current) {
      AssetViewRef.current.scrollTo({ x: xOffset, animated: true });
    }
  };
  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri };
        console.log("--------",source)
        setImageUri(source.uri);
        setUPLAOD_1(true)
        console.log("----source.uri----",imageUri)
      }
    });
  };
  const selectImage_1 = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri };
        console.log("--------",source)
        setImageUri(source.uri);
        setUPLAOD(true)
        console.log("----source.uri----",imageUri)
      }
    });
  };
  const off_modal=()=>{
    setDeposit_modal_new(false),
    setTimeout(()=>{
      setdone_modal(false),
      navigation.navigate("/")
    },3000)
  }
  
  const off_modal_1=()=>{
    setsend_price(false),
    setTimeout(()=>{
      setdone_modal(false)
      navigation.navigate("/")
    },3000)
  }

  useEffect(() => {
    setkyc_modal_text("Fetching stellar.toml");
    setUPLAOD(false)
    setUPLAOD_1(false)
    sethiglight(0);
    setLoading(false)
    setsend_price(false)
    setdeposit_modal(false);
    setprice_modal(false)
    setimage_hide(false);
    setKYC_INFO(false);
    setsearch_text('');
    setselect_asset_modal(true);
    setshow_anchors(false);
    setkyc_modal(false);
    setDeposit_modal_new(false)
    setopen_web_view(false)
  }, [isFocused])

  useEffect(() => {
    setmodal_load(true);
    if (kyc_modal) {
      const timer1 = setTimeout(() => {
        setkyc_modal_text("Fetching stellar.toml")
      }, 3000);
      const timer2 = setTimeout(() => {
        setkyc_modal_text("Fetching Tx Challange")
      }, 5000);
      const timer3 = setTimeout(() => {
        setmodal_load(false);
      }, 9000);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [kyc_modal]);
  const after_accept_asset = async () => {
    setmodal_load(true);
    setkyc_modal_text("Document submiting for KYC");
    setTimeout(() => {
      setkyc_modal_text("Verifying KYC Details");
      setmodal_load(false);
      setimage_hide(true);
      setKYC_INFO(true);
      // setTimeout(() => {
      //   setkyc_modal_text("Transaction Succeeded");
      //   setTimeout(() => {
      //   setmodal_load(false);
      //   setkyc_modal(false);
      //     setkyc_modal_text("Fetching stellar.toml")
      //     navigation.navigate("/")
      //   }, 2500);
      // }, 3000);
    }, 3000);
  }

  const handle_close_KYC = async () => {
    setkyc_modal(false);
    setdeposit_modal(true);
  }
  return (
    <View style={styles.main}>
     {/* <View style={{    backgroundColor: "#4CA6EA",
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    width: wp(100),
    justifyContent:"space-between"
    }}>
          <TouchableOpacity onPress={() =>navigation.goBack()}>
            <Icon
              name={"left"}
              type={"antDesign"}
              size={28}
              color={"white"}
            />
          </TouchableOpacity>
        <View style={{backgroundColor:"pink",alignItems:"center",width:wp(60)}}>
        {Platform.OS === "android" ? (
          <Text>Deposit/Withdrawal</Text>
        ) : (
          <Text style={[styles.text_TOP, styles.text1_ios_TOP]}>Deposit/Withdrawal</Text>
        )}
        </View>
        <View style={{width:wp(20),flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
        <TouchableOpacity onPress={() => navigation.navigate("")}>
          <Image source={darkBlue} style={[{ height: hp("8"),width: wp("12")}]} />
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
        </View>
     </View> */}
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
        marginTop:Platform.OS==="ios"?hp(3):hp(0)
      }}>Deposit/Withdrawal</Text>

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
      {/* header end */}
      {select_asset_modal && <View style={styles.select_asset_modal}>
        <Text style={styles.select_asset_heading}>Select Assets</Text>
        <TextInput placeholder="Search" placeholderTextColor={"gray"} value={search_text} onChangeText={(value) => { setsearch_text(value.toUpperCase()) }} style={styles.search_bar} />
        {search_text.length === 0 && <View style={styles.ScrollView_contain}>
          {/* <TouchableOpacity style={[styles.left_icon,]} onPress={() => {
            if (AssetViewRef.current && contentWidth !== 0) {
              const backOffset = (AssetViewRef.current.contentOffset ? AssetViewRef.current.contentOffset.x : 0) - 3 * contentWidth / Assets.length;
              handleScroll(backOffset);

            }
          }}><Icon name={"left"} type={"antDesign"} size={25} color={"white"} />
          </TouchableOpacity>
          <TouchableOpacity style={[[styles.left_icon,], { alignSelf: "flex-end" }]} onPress={() => {
            if (AssetViewRef.current && contentWidth !== 0) {
              const nextOffset = (AssetViewRef.current.contentOffset ? AssetViewRef.current.contentOffset.x : 0) + 8 * contentWidth / Assets.length;
              handleScroll(nextOffset);
            }
          }}><Icon name={"right"} type={"antDesign"} size={25} color={"white"} /></TouchableOpacity>
          <ScrollView ref={AssetViewRef} horizontal style={styles.ScrollView} showsHorizontalScrollIndicator={false} onContentSizeChange={(width) => setContentWidth(width)}> */}
          <ScrollView>
            {Assets.map((list, index) => {
              return (
                <TouchableOpacity style={[styles.card, {marginTop:5,width: wp("90%"), justifyContent: "flex-start", borderColor: higlight === index ? "green" : "#011434", flexDirection: "row", alignItems: "center", }]} key={index} onPress={() => { sethiglight(index) }}>
                  <Image
                    source={list.by === "clpx" ? bnb : list.by === "clickpesa" ? xrp : { uri: list.img }}
                    style={styles.image_asset}
                    resizeMode="cover"
                  />
                  <View style={{ flexDirection: "column", marginLeft: 9,marginTop:3 }}>
                    <Text style={[styles.card_text,{textAlign:"left"}]}>{list.name}</Text>
                    {/* <Text style={[{textAlign:"left",fontSize:10,color:"#fff"}]}>Issued by</Text> */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: wp(24),borderColor:"#485DCA",paddingVertical:0}}>
                    <Text style={[styles.card_text,{textAlign:"left",fontSize:16}]}>{list.dis_ass}</Text>
                    </ScrollView>
                  </View>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>}
        {/* for search result */}
        {search_text.length !== 0 && <View style={styles.ScrollView_contain}>
          {/* <TouchableOpacity style={styles.left_icon} onPress={() => {
            if (AssetViewRef.current && contentWidth !== 0) {
              const backOffset = (AssetViewRef.current.contentOffset ? AssetViewRef.current.contentOffset.x : 0) - 3 * contentWidth / Assets.length;
              handleScroll(backOffset);

            }
          }}><Icon name={"left"} type={"antDesign"} size={25} color={"white"} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.left_icon, { alignSelf: "flex-end" }]} onPress={() => {
            if (AssetViewRef.current && contentWidth !== 0) {
              const nextOffset = (AssetViewRef.current.contentOffset ? AssetViewRef.current.contentOffset.x : 0) + 8 * contentWidth / Assets.length;
              handleScroll(nextOffset);
            }
          }}><Icon name={"right"} type={"antDesign"} size={25} color={"white"} /></TouchableOpacity>
          <ScrollView ref={AssetViewRef} horizontal style={styles.ScrollView} showsHorizontalScrollIndicator={false} onContentSizeChange={(width) => setContentWidth(width)}> */}
          <ScrollView>
          {filteredAssets.length > 0 ? (
        filteredAssets.map((list, index) => (
          <TouchableOpacity style={[styles.card, { marginTop:5,width: wp("90%"),justifyContent: "flex-start",borderColor:higlight===index?"green":"#011434",flexDirection:"row",alignItems:"center" }]} key={index} onPress={()=>{sethiglight(index)}}>
          <Image
                    source={list.by === "clpx" ? bnb : list.by === "clickpesa" ? xrp : { uri: list.img }}
                  style={styles.image_asset}
                  resizeMode="cover"
                />
                             <View style={{ flexDirection: "column", marginLeft: 9,marginTop:3 }}>
                    <Text style={[styles.card_text,{textAlign:"left"}]}>{list.name}</Text>
                    {/* <Text style={[{textAlign:"left",fontSize:10,color:"#fff"}]}>Issued by</Text> */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: wp(24),borderColor:"#485DCA",paddingVertical:0}}>
                    <Text style={[styles.card_text,{textAlign:"left",fontSize:16}]}>{list.dis_ass}</Text>
                    </ScrollView>
                  </View>
                          </TouchableOpacity>
        ))
      ) : (
        <Text style={[styles.notFoundText,{marginTop:20,marginLeft:110,}]}>Not Found</Text>
      )}
          </ScrollView>
        </View>}

        <TouchableOpacity disabled={filteredAssets.length <= 0} style={styles.next_btn} onPress={() => { setsearch_text(''),setselect_asset_modal(false), setshow_anchors(true) }}>
          <Text style={styles.next_btn_txt}>Next</Text>
        </TouchableOpacity>
      </View>}

      {/* Anchors View */}

      {show_anchors && <View style={[styles.select_asset_modal]}>
        <Text style={styles.select_asset_heading}>Select Anchor</Text>
        <TextInput placeholder="Search" placeholderTextColor={"gray"} value={search_text} onChangeText={(value) => { setsearch_text(value.toUpperCase()) }} style={styles.search_bar} />
        {search_text.length === 0 && <View style={[styles.ScrollView_contain,]}>
          {/* <TouchableOpacity style={[styles.left_icon, { marginTop: 120.5, }]} onPress={() => {
            if (AssetViewRef.current && contentWidth !== 0) {
              const backOffset = (AssetViewRef.current.contentOffset ? AssetViewRef.current.contentOffset.x : 0) - 3 * contentWidth / Assets.length;
              handleScroll(backOffset);

            }
          }}><Icon name={"left"} type={"antDesign"} size={25} color={"white"} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.left_icon, { alignSelf: "flex-end", marginTop: 120.5 },]} onPress={() => {
            if (AssetViewRef.current && contentWidth !== 0) {
              const nextOffset = (AssetViewRef.current.contentOffset ? AssetViewRef.current.contentOffset.x : 0) + 8 * contentWidth / Assets.length;
              handleScroll(nextOffset);
            }
          }}><Icon name={"right"} type={"antDesign"} size={25} color={"white"} /></TouchableOpacity>
          <ScrollView ref={AssetViewRef} horizontal style={[styles.ScrollView,{marginHorizontal: 9}]} showsHorizontalScrollIndicator={false} onContentSizeChange={(width) => setContentWidth(width)}> */}
          <ScrollView>
            {Anchors.map((list, index) => {
              return (
                <TouchableOpacity style={[styles.card,{width: wp("90%"),height:hp("10%"),marginTop:10,alignItems:"flex-start",borderColor:Anchor_selection===index?"green":"gray"}]} key={index} onPress={()=>{setAnchor_selection(index),setURL_OPEN(list.tom_url),setLoading(true),setopen_web_view(true)}}>
                  <View style={{flexDirection:"row",alignItems:"center"}}>
                  <Image
                  source={list.image}
                  style={{width:list.name==="SwiftEx"?60:50,height:list.name==="SwiftEx"?60:50,alignSelf:"center",borderRadius:15,marginTop:list.name==="SwiftEx"?1:15}}
                  resizeMode="cover"
                />
                    <View style={{alignItems:"flex-start",marginLeft:10}}>
                    <Text style={[styles.card_text,{marginTop:list.name==="SwiftEx"?4:9}]}>{list.name}</Text>
                    <Text style={[styles.card_text,{color:"gray"}]}>{list.dis_ass}</Text>
                    </View>
                  {/* <Text style={[styles.next_btn_txt,{fontSize:13,marginTop:5,fontWeight:"500"}]}>Vist stellar website</Text> */}
                    <TouchableOpacity disabled={Anchor_selection!==index} style={[styles.next_btn, { marginLeft:10,marginTop: 10, height: "39%",backgroundColor:"#011434",alignSelf:"center" }]} onPress={()=>{[setLoading(true),setopen_web_view(true)]}}>
                      <Text style={[styles.next_btn_txt,{fontSize:16}]}>SEP-24</Text>
                    </TouchableOpacity>
                    {list.name==="Clpx"&&<TouchableOpacity disabled={true} style={[styles.next_btn, { marginLeft:10,marginTop: 10, height: "39%",backgroundColor:"gray",alignSelf:"center" }]} onPress={()=>{[setLoading(true),setopen_web_view(true)]}}>
                      <Text style={[styles.next_btn_txt,{fontSize:16}]}>SEP-6</Text>
                    </TouchableOpacity>}
                  </View>
                  {/* {list?.seps.map((sep, sepIndex) => (
                    <TouchableOpacity disabled={sepIndex===1||sepIndex===3||Anchor_selection!==index} style={[styles.next_btn, { marginTop: 10, height: "13%",backgroundColor:sepIndex===1||sepIndex===3?"gray":"#011434" }]} onPress={()=>{sepIndex===2?[setLoading(true),setopen_web_view(true)]:setkyc_modal(true)}}>
                      <Text style={styles.next_btn_txt} key={sepIndex}>
                        {sep}
                      </Text>
                      
                    </TouchableOpacity>
                  ))} */}
                 {/* {Anchor_selection===index&&<View style={{justifyContent:"center",alignSelf:"center",marginTop:10}}>
                  <Icon
                    name={"check-circle-outline"}
                    type={"materialCommunity"}
                    size={30}
                    color={"green"}
                  />
                  </View>
                  } */}
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>}
        {/* for search result */}
        {search_text.length !== 0 && <View style={[styles.ScrollView_contain]}>
          {/* <TouchableOpacity style={[styles.left_icon, { marginTop: 120.5 }]} onPress={() => {
            if (AssetViewRef.current && contentWidth !== 0) {
              const backOffset = (AssetViewRef.current.contentOffset ? AssetViewRef.current.contentOffset.x : 0) - 3 * contentWidth / Assets.length;
              handleScroll(backOffset);

            }
          }}><Icon name={"left"} type={"antDesign"} size={25} color={"white"} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.left_icon, { alignSelf: "flex-end", marginTop: 120.5 },]} onPress={() => {
            if (AssetViewRef.current && contentWidth !== 0) {
              const nextOffset = (AssetViewRef.current.contentOffset ? AssetViewRef.current.contentOffset.x : 0) + 8 * contentWidth / Assets.length;
              handleScroll(nextOffset);
            }
          }}><Icon name={"right"} type={"antDesign"} size={25} color={"white"} /></TouchableOpacity>
          <ScrollView ref={AssetViewRef} horizontal style={[styles.ScrollView,{marginHorizontal: 9}]} showsHorizontalScrollIndicator={false} onContentSizeChange={(width) => setContentWidth(width)}> */}
          <ScrollView>
          {filteredAnchors.length > 0 ? (
            filteredAnchors.map((list, index) => {
             
                return (
                  <TouchableOpacity style={[styles.card,{width: wp("90%"),height:hp("10%"),marginTop:10,alignItems:"flex-start",borderColor:Anchor_selection===index?"green":"gray"}]} key={index} onPress={()=>{setAnchor_selection(index),setURL_OPEN(list.tom_url),setLoading(true),setopen_web_view(true)}}>
                  <View style={{flexDirection:"row",alignItems:"center"}}>
                  <Image
                  source={list.image}
                  style={{width:list.name==="SwiftEx"?60:50,height:list.name==="SwiftEx"?60:50,alignSelf:"center",borderRadius:15,marginTop:list.name==="SwiftEx"?1:15}}
                  resizeMode="cover"
                />
                    <View style={{alignItems:"flex-start",marginLeft:10}}>
                    <Text style={[styles.card_text,{marginTop:list.name==="SwiftEx"?4:9}]}>{list.name}</Text>
                    <Text style={[styles.card_text,{color:"gray"}]}>{list.dis_ass}</Text>
                    </View>
                  {/* <Text style={[styles.next_btn_txt,{fontSize:13,marginTop:5,fontWeight:"500"}]}>Vist stellar website</Text> */}
                    <TouchableOpacity disabled={Anchor_selection!==index} style={[styles.next_btn, { marginLeft:10,marginTop: 10, height: "39%",backgroundColor:"#011434",alignSelf:"center" }]} onPress={()=>{[setLoading(true),setopen_web_view(true)]}}>
                      <Text style={[styles.next_btn_txt,{fontSize:16}]}>SEP-24</Text>
                    </TouchableOpacity>
                    {list.name==="Clpx"&&<TouchableOpacity disabled={true} style={[styles.next_btn, { marginLeft:10,marginTop: 10, height: "39%",backgroundColor:"gray",alignSelf:"center" }]} onPress={()=>{[setLoading(true),setopen_web_view(true)]}}>
                      <Text style={[styles.next_btn_txt,{fontSize:16}]}>SEP-6</Text>
                    </TouchableOpacity>}
                  </View>
                  {/* {list?.seps.map((sep, sepIndex) => (
                    <TouchableOpacity disabled={sepIndex===1||sepIndex===3||Anchor_selection!==index} style={[styles.next_btn, { marginTop: 10, height: "13%",backgroundColor:sepIndex===1||sepIndex===3?"gray":"#011434" }]} onPress={()=>{sepIndex===2?[setLoading(true),setopen_web_view(true)]:setkyc_modal(true)}}>
                      <Text style={styles.next_btn_txt} key={sepIndex}>
                        {sep}
                      </Text>
                      
                    </TouchableOpacity>
                  ))} */}
                 {/* {Anchor_selection===index&&<View style={{justifyContent:"center",alignSelf:"center",marginTop:10}}>
                  <Icon
                    name={"check-circle-outline"}
                    type={"materialCommunity"}
                    size={30}
                    color={"green"}
                  />
                  </View>
                  } */}
                </TouchableOpacity>
                )

            })
            ) : (
              <Text style={styles.notFoundText}>Not Found</Text>
            )}
          </ScrollView>
        </View>}

      <View style={{flexDirection:"row",justifyContent:"space-between"}}>
      <TouchableOpacity style={[styles.next_btn,{marginTop:5}]} onPress={() => { setsearch_text(''),setshow_anchors(false),setselect_asset_modal(true) }}>
          <Text style={styles.next_btn_txt}>Back</Text>
        </TouchableOpacity>
      {/* <TouchableOpacity disabled={true} style={[styles.next_btn,{marginTop:5,backgroundColor:"gray"}]} onPress={() => { setsearch_text(''),setkyc_modal(true) }}>
          <Text style={styles.next_btn_txt}>Next</Text>
        </TouchableOpacity> */}
        </View>
      </View>}

      <Modal
        animationType="fade"
        transparent={true}
        visible={kyc_modal}>
        {/* // visible={true}> */}
        <View style={[styles.kyc_Container]}>
          <View style={[styles.kyc_Content, { height: modal_load === false ? image_hide === true ? 510 : "40%" : KYC_INFO === false ? 190 : "160%" }]}>
            {kyc_modal_text !== "Transaction Succeeded" && image_hide === false && <Image source={darkBlue} style={styles.logoImg_kyc} />}
            {kyc_modal_text === "Transaction Succeeded" ?
              <View style={{ justifyContent: "center", alignItems: "center", marginTop: 28 }}>
                <Icon
                  name={"check-circle-outline"}
                  type={"materialCommunity"}
                  size={63}
                  color={"green"}
                />
                <Text style={styles.kyc_text}>{kyc_modal_text}</Text>
              </View>
              : modal_load === false ? <></> : <Text style={styles.kyc_text}>{kyc_modal_text}</Text>}
            {/* {modal_load === false ? <ActivityIndicator size="large" color="green" /> : */}
            {modal_load === true ? kyc_modal_text === "Transaction Succeeded" ? <></> : <ActivityIndicator size="large" color="green" /> :
              KYC_INFO === false ?
                <>
                  <Text style={[styles.radio_text_selectio, { marginStart: -20.9, marginBottom: 19, marginTop: 10 }]}>Singing Challange</Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.radio_text_selectio}>Address</Text>
                    <Text style={[styles.radio_text_selectio, { marginStart: 18, marginRight: 15 }]}>GDMJXL4V6R...</Text>
                  </View>
                  <View style={{ flexDirection: "row", marginTop: 19 }}>
                    {/* <ScrollView style={{height:"2%",width:"90%",borderColor: "#485DCA",borderWidth: 1.3,borderRadius: 10}}> */}
                    {/* <Text style={{color:"#fff",fontSize:19}}>AAAAAgAAAACpn2Fr7GAZ4XOcFvEz+xduBFDK1NDLQP875GtWWlJ0XQAAAMgAAAAAAAAAAAAAAAEAAAAAZnPuLAAAAABmc/GwAAAAAAAAAAIAAAABAAAAAKHKP5NPyx+n79o/pXcd0AP/K9pcLCjMJWf+2EWj1fa8AAAACgAAABt0ZXN0YW5jaG9yLnN0ZWxsYXIub3JnIGF1dGgAAAAAAQAAAEBBK1VRV0M4SlV0NTB3aXFvOFNYWHMraVFWUFBXL0p0bFJpMGNkS1kvR3JJOWQ3cDM1RGx5bkFRZHZkUWtKQXR3AAAAAQAAAACpn2Fr7GAZ4XOcFvEz+xduBFDK1NDLQP875GtWWlJ0XQAAAAoAAAAPd2ViX2F1dGhfZG9tYWluAAAAAAEAAAAWdGVzdGFuY2hvci5zdGVsbGFyLm9yZwAAAAAAAAAAAAJaUnRdAAAAQMe3RoZ/bcehjBPK9svjQKKorQkk8YO+DdQtCIXvmHgwMECwx54jK106O8KTzODvEFS940wJv/nxRz3lsroF+Qaj1fa8AAAAQMDSlRbR0AfAJ+Qig/w9N39GJdWeBIZ9tCkon6pmzuU2ukupLqKkclNc10CwRLMyU7bNF5YWJbwntmgPBFZAcwo=</Text> */}
                    {/* </ScrollView> */}
                    <Text style={[styles.radio_text_selectio, { marginStart: 10, marginRight: 15 }]}> AAAAAgAAAACpn2Fr7G...</Text>
                  </View>
                  <TouchableOpacity onPress={() => { after_accept_asset() }} style={{ width: "50%", height: "15%", backgroundColor: "green", marginTop: 35, borderRadius: 10, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: "#fff", fontSize: 19 }}>Confirm</Text>
                  </TouchableOpacity>
                </> :
                <>
                  <Text style={styles.detailsHeading}>KYC Details</Text>
                  <View style={styles.formContainer}>
                    <Text style={styles.detailsSubHeading}>Fields Required *</Text>
                    <View style={styles.inputRow}>
                      <Text style={styles.detailsLabel}>First Name :</Text>
                      <TextInput placeholderTextColor={"gray"} placeholder="Jon" style={styles.detailsInput} />
                    </View>
                    <View style={styles.inputRow}>
                      <Text style={styles.detailsLabel}>Last Name :</Text>
                      <TextInput placeholderTextColor={"gray"} placeholder="Alis" style={styles.detailsInput} />
                    </View>
                    <View style={styles.inputRow}>
                      <Text style={styles.detailsLabel}>Bank Acc No :</Text>
                      <TextInput placeholderTextColor={"gray"} placeholder="019283291" style={styles.detailsInput} />
                    </View>
                    <View style={styles.inputRow}>
                      <Text style={styles.detailsLabel}>Swift Code :</Text>
                      <TextInput placeholderTextColor={"gray"} placeholder="TELOPGB1" style={styles.detailsInput} />
                    </View>
                    <View style={styles.inputRow}>
                      <Text style={styles.detailsLabel}>Passport Front :</Text>
                      <TouchableOpacity  style={styles.detailsInput} onPress={()=>{selectImage_1()}}>
                        <Text style={{textAlign:"center",color:"#fff"}}>{UPLAOD===true?"Uploaded":"Upload"}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.inputRow}>
                      <Text style={styles.detailsLabel}>Passport Back :</Text>
                      <TouchableOpacity  style={styles.detailsInput} onPress={()=>{selectImage()}}>
                        <Text style={{textAlign:"center",color:"#fff"}}>{UPLAOD_1===true?"Uploaded":"Upload"}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => { handle_close_KYC() }} style={[styles.next_btn, { alignSelf: "center", width: "50%", backgroundColor: "green" }]}>
                    <Text style={styles.submitButtonText}>Submit KYC</Text>
                  </TouchableOpacity>
                </>

            }
          </View>
        </View>
      </Modal>


      <Modal
        animationType="fade"
        transparent={true}
        visible={deposit_modal}>
        <View style={[styles.kyc_Container]}>
          <View style={[styles.kyc_Content, { height: "20%",width:"90%" }]}>
          <Text style={[styles.radio_text_selectio, { marginBottom: 19, marginTop: 10,alignSelf:"flex-start",fontSize:24 }]}>Select Method :</Text>
          <View style={{flexDirection:"row",marginTop:-15}}>
          <TouchableOpacity onPress={() => {setdeposit_modal(false),setDeposit_modal_new(true)}} style={[styles.next_btn, { alignSelf: "center", width: "50%", backgroundColor: "green" }]}>
                    <Text style={styles.submitButtonText}>Deposit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {setdeposit_modal(false),setprice_modal(true)}} style={[styles.next_btn, { alignSelf: "center", width: "50%", backgroundColor: "green",marginStart:9 }]}>
                    <Text style={styles.submitButtonText}>Withdrawal</Text>
                  </TouchableOpacity>
          </View>
          </View>
        </View>

      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={price_modal}>
        {/* visible={true}> */}
        <View style={[styles.kyc_Container]}>
          <View style={[styles.kyc_Content, { height: "50%", width: "90%" }]}>
            <Text style={[styles.radio_text_selectio, { marginBottom: 19, marginTop: 10, alignSelf: "flex-start", fontSize: 24 }]}>Fetching price info :</Text>
            <ScrollView style={{paddingTop:10,paddingBottom:10}}>
            <View style={{ marginTop: -10, alignSelf: "flex-start" }}>
            {price_data.map((list,index)=>{
              return(
                <TouchableOpacity onPress={() => {setprice_modal(false),setsend_price(true)}} style={[styles.Price_card]} key={index}>
                <Text style={[styles.submitButtonText,{textAlign:"left"}]}>Asset      {list.name}</Text>
                <Text style={[styles.submitButtonText,{textAlign:"left"}]}>Price      {list.price}</Text>
                <Text style={[styles.submitButtonText,{textAlign:"left"}]}>Fee        {list.fee}</Text>
                <Text style={[styles.submitButtonText,{textAlign:"left"}]}>Asset Code {list.asset_code}</Text>
              </TouchableOpacity>
              )
            })}
            </View>
            </ScrollView>
          </View>
        </View>

      </Modal>


      <Modal
        animationType="fade"
        transparent={true}
        visible={send_price}>
        {/* // visible={true}> */}
        <View style={[styles.kyc_Container]}>
          <View style={[styles.kyc_Content, { height: "34%",width:"90%" }]}>
          <Text style={[styles.radio_text_selectio, { marginBottom: 19, marginTop: 10,alignSelf:"flex-start",fontSize:20,fontWeight:"bold" }]}>Deposit/Withdrawal details:</Text>
         <View style={{alignSelf:"flex-start"}}>
         <Text style={[styles.submitButtonText,{textAlign:"left",fontSize:20}]}>Address: 1234o7654388</Text>
          <Text style={[styles.submitButtonText,{fontSize:20}]}>Transaction ID: 34567898..</Text>
         </View>
          <View style={{marginTop:20}}>
          <TouchableOpacity onPress={() => {setdone_modal(true),off_modal_1()}} style={[styles.next_btn, { alignSelf: "center", width: "50%", backgroundColor: "green",paddingHorizontal:40 }]}>
                    <Text style={styles.submitButtonText}>Send</Text>
                  </TouchableOpacity>
          </View>
          </View>
        </View>

      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={Deposit_modal_new}>
        {/* // visible={true}> */}
        <View style={[styles.kyc_Container]}>
          <View style={[styles.kyc_Content, { height: "29%",width:"90%" }]}>
          <Text style={[styles.radio_text_selectio, { marginBottom: 19, marginTop: 10,alignSelf:"flex-start",fontSize:20,fontWeight:"bold" }]}>Deposit:</Text>
         <View style={{alignSelf:"flex-start"}}>
         <Text style={[styles.submitButtonText,{textAlign:"left",fontSize:20}]}>Bank Acc No: 1234o7654388</Text>
          <Text style={[styles.submitButtonText,{textAlign:"left",fontSize:20}]}>IFSC code: 3456789876543</Text>
         </View>
          <View style={{marginTop:20}}>
          <TouchableOpacity onPress={() => {setdone_modal(true),off_modal()}} style={[styles.next_btn, { alignSelf: "center", width: "50%", backgroundColor: "green",paddingHorizontal:40 }]}>
                    <Text style={styles.submitButtonText}>Deposit</Text>
                  </TouchableOpacity>
          </View>
          </View>
        </View>

      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={done_modal}>
        {/* // visible={true}> */}

       


        <View style={[styles.kyc_Container]}>
          <View style={[styles.kyc_Content, { height: "20%",width:"90%" }]}>
          <Icon
        name={"check-circle-outline"}
        type={"materialCommunity"}
        size={60}
        color={"green"}
      />
         <Text style={[styles.submitButtonText,{textAlign:"left",fontSize:20,marginTop:19}]}>Transaction Successful</Text>
          </View>
        </View>

      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={open_web_view}
      >
        <View style={{ height: hp(100), width: wp(100), backgroundColor: "white", borderRadius: 10}}>
          <TouchableOpacity style={{ alignSelf: "flex-end", marginRight: 10, marginTop: 10 }} onPress={() => { setopen_web_view(false); }}>
            <Icon name={"close"} type={"antDesign"} size={28} color={"black"} />
          </TouchableOpacity>

          {loading && (
            <ActivityIndicator
              size="large"
              color="green"
              style={{justifyContent:"center",alignItems:"center"}}
            />
          )}

          <WebView
            source={{ uri: URL_OPEN }}
            onLoad={() => setLoading(false)}
            onLoadEnd={() => setLoading(false)}
          />
        </View>
      </Modal>

    </View>
  )
}
const styles = StyleSheet.create({
  webview: {
    height:"6%",
    width:"99%"
  },
  image_asset: {
    width: 30,
    height: 30,
  },
  headerContainer1_TOP: {
    backgroundColor: "#4CA6EA",
    // justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    width: wp(100),
    paddingHorizontal: wp(2),
  },
  logoImg_TOP: {
    height: hp("8"),
    width: wp("12"),
    marginLeft: wp(7.6),
  },
  text_TOP: {
    color: "white",
    fontSize: 19,
    fontWeight: "bold",
    alignSelf: "center",
    marginStart: wp(20)
  },
  text1_ios_TOP: {
    alignSelf:"center",
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      paddingTop:hp(3),
  },
  modalContainer_option_top: {
    // flex: 1,
    alignSelf: "flex-end",
    alignItems: 'center',
   // backgroundColor: 'rgba(0, 0, 0, 0.3)',
   width:"100%",
   height:"60%",
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
  // header end
  main: {
    backgroundColor: "#011434",
    width: wp("100%"),
    height: hp("100%")
  },
  select_asset_modal: {
    width: wp("95%"),
    // height:hp("40%"),
    backgroundColor: "rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)",
    marginTop: "5%",
    alignSelf: "center",
    borderRadius: 10,
    padding: 10
  },
  select_asset_heading: {
    fontWeight: "bold",
    fontSize: 20,
    color: "#fff"
  },
  search_bar: {
    color: "#fff",
    borderColor: "#485DCA",
    borderWidth: 1.3,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 19,
    marginTop: 10
  },
  next_btn: {
    width: wp("19%"),
    height: hp("6%"),
    borderColor: "#485DCA",
    borderWidth: 1.3,
    justifyContent: "center",
    borderRadius: 10,
    alignSelf: "flex-end",
    marginTop: 19
  },
  Price_card: {
    width: wp("68%"),
    height: hp("14%"),
    borderColor: "#485DCA",
    borderWidth: 1.3,
    justifyContent: "flex-start",
    alignContent:"flex-start",
    borderRadius: 10,
    marginTop: 19,
    backgroundColor: "#011434",
    padding:10
  },
  next_btn_txt: {
    fontSize: 19,
    color: "#fff",
    textAlign: "center",
  },
  ScrollView_contain: {
    height: hp("50%"),
    marginTop: 15
  },
  left_icon: {
    position: "absolute",
    width: wp(8),
    backgroundColor: "rgba(255,255,255,0.2)",
    marginTop: 23.5,
    padding: 5,
    borderRadius: 10,
    zIndex: 20,
  },
  ScrollView: {
    backgroundColor: "rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)",
    padding: 8,
    borderRadius: 10,
    marginHorizontal: 19
  },
  card: {
    width: wp("29%"),
    marginRight: 10,
    borderWidth: 1.9,
    borderColor: 'gray',
    borderRadius: 10,
    padding: 8,
    backgroundColor: "#011434",
    flexDirection: "column",
    paddingVertical: 3
  },
  card_text: {
    fontSize: 19,
    color: "#fff",
    textAlign: "center",
  },
  kyc_Container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  kyc_Content: {
    backgroundColor: "rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)",
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: "90%",
    height: "24%"
  },
  kyc_text: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: "#fff"
  },
  logoImg_kyc: {
    height: hp("9"),
    width: wp("12"),
  },
  radio_text_selectio: {
    color: "#fff",
    fontSize: 19
  },
  radio_btn_selectio: {
    width: "9.4%",
    height: "100%",
    backgroundColor: "green",
    borderColor: "gray",
    borderWidth: 3,
    borderRadius: 15
  },
  detailsHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#fff"
  },
  detailsSubHeading: {
    fontSize: 16,
    marginBottom: 10,
    color: "#fff"
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailsLabel: {
    width: '40%',
    fontSize: 16,
    color: "#fff"
  },
  detailsInput: {
    width: '60%',
    borderWidth: 1,
    borderColor: "#485DCA",
    borderRadius: 5,
    padding: 5,
    color: "#fff",
  },
  formContainer: {
    width: '100%',
    marginTop: 15
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold"
  },
  notFoundText: {
    color: '#fff',
    marginTop:120,
    marginLeft:120,
    fontSize:20

  }
})
export default Payout;