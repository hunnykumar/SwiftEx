import { useIsFocused, useNavigation } from "@react-navigation/native";
import { ActivityIndicator, Button, FlatList, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { REACT_APP_LOCAL_TOKEN } from "../../ExchangeConstants";
import { useEffect, useState } from "react";
import Icon from "../../../../../../icon";
import darkBlue from "../../../../../../../assets/darkBlue.png";
import CLICKPESA from "../../../../../../../assets/CLICKPESA.png";
import ethereum from "../../../../../../../assets/ethereum.png";
import stellar from "../../../../../../../assets/Stellar_(XLM).png";


import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import Snackbar from "react-native-snackbar";
import { SET_ASSET_DATA } from "../../../../../../components/Redux/actions/type";
import { STELLAR_URL } from "../../../../../constants";
const StellarSdk = require('stellar-sdk');
const Assets_manage = () => {
    const FOCUSED = useIsFocused();
    const navigation = useNavigation();
    const dispatch_ = useDispatch()
    const [modalContainer_menu, setmodalContainer_menu] = useState(false);
    const [TRUST_ASSET, setTRUST_ASSET] = useState(false);
    const [Loading,setLoading]=useState(false);
    const [Loading_assets_bal,setLoading_assets_bal]=useState(false);
    const [assets, setassets] = useState([
        {
            "asset_type": "native",
            "balance": "0.0000000",
            "buying_liabilities": "0.0000000",
            "selling_liabilities": "0.0000000",
        },
    ]);
    const state = useSelector((state) => state);

    const get_stellar = async () => {
        try {
            setLoading_assets_bal(true)
            // const storedData = await AsyncStorageLib.getItem('myDataKey');
            // if (storedData !== null) {
            //     const parsedData = JSON.parse(storedData);
            //     const matchedData = parsedData.filter(item => item.Ether_address === state.wallet.address);
            //     const publicKey = matchedData[0].publicKey;
                StellarSdk.Network.useTestNetwork();
                const server = new StellarSdk.Server(STELLAR_URL.URL);
                server.loadAccount(state.STELLAR_PUBLICK_KEY)
                    .then(account => {
                        setassets([])
                        setassets(account.balances)
                        dispatch_({
                            type: SET_ASSET_DATA,
                            payload: account.balances,
                          })
                        setLoading_assets_bal(false)
                    })
                    .catch(error => {
                        console.log('Error loading account:', error);
                        setLoading_assets_bal(false)
                    });
            // }
            // else {
            //     console.log('No data found in AsyncStorage');
            // }
        } catch (error) {
            console.log("Error in get_stellar")
            setLoading_assets_bal(false)
        }
    }

    const AVL_ASSETS = [
        { name: 'USDC', domain: "USDC (center.io)",img:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" },
        { name: 'Tanzania Shiling', domain: "TZS (connect.clickpesa.com)",img:CLICKPESA },
        { name: 'BTC', domain: "BTC (ultracapital.xyz)",img:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png" },
        { name: 'ETH', domain: "ETH (ultracapital.xyz)",img:ethereum },
        { name: 'EURC', domain: "EURC (circle.com)",img:"https://assets.coingecko.com/coins/images/26045/thumb/euro-coin.png?1655394420" },
        { name: 'yUSDC', domain: "yUSDC (ultracapital.xyz)",img:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png" },
        { name: 'yXLM', domain: "yXLM (ultracapital.xyz)",img:stellar },
    ];



    const changeTrust = async () => {
        setLoading(true)
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
                        setassets(account.balances)
                        setLoading(false)
                        dispatch_({
                            type: SET_ASSET_DATA,
                            payload: account.balances,
                          })
                    });
                })
                .catch(error => {
                    console.log('Error loading account:', error);
                    setLoading(false)
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

    const alert_message=(message_new)=>{
        Snackbar.show({
            text: message_new,
            duration: Snackbar.LENGTH_SHORT,
            backgroundColor:'orange',
        });
    }

    useEffect(() => {
        setLoading_assets_bal(false)
        get_stellar()
    }, [FOCUSED])
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
        marginTop:Platform.OS==="ios"?hp(4):hp(0)
      }}>Assets</Text>

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

            <View style={[styles.main_con]}>
                <Text style={styles.mode_text}>My Assets</Text>
                <View style={styles.assets_con}>
                    {assets.map((list, index) => {
                        return (
                            <TouchableOpacity style={styles.assets_card} onPress={() => { navigation.navigate("send_recive",{bala:list.balance,asset_name:list.asset_type === "native" ? "Lumens" : list.asset_code}) }}>
                                <View style={{ flexDirection: "column" }}>
                                    <Text style={[styles.mode_text, { fontSize: 19, fontWeight: "300" }]}>{list.asset_type === "native" ? "Lumens" : list.asset_code=== "USDC"&&"USDC"}</Text>
                                    <Text style={[styles.mode_text, { fontSize: 16, fontWeight: "300", color: "silver" }]}>{list.asset_type === "native" ? "(stellar.org)" : list.asset_code==="USDC" && "(centre.io)"}</Text>
                                </View>
                                {/* <ScrollView style={{height:hp52)}}> */}

                                {Loading_assets_bal===true?<ActivityIndicator color={"green"}/>:<Text style={[styles.mode_text, { fontSize: 19, fontWeight: "300" }]}>{list.balance.slice(0, 6)}</Text>}
                                {/* </ScrollView> */}
                            </TouchableOpacity>
                        )
                    })}
                </View>
                <TouchableOpacity style={[styles.assets_con, { alignItems: "center", marginTop: 60 }]} onPress={() => { setTRUST_ASSET(true) }}>
                    <Text style={[styles.mode_text, { fontSize: 19, fontWeight: "300" }]}>Add Asset</Text>
                </TouchableOpacity>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={TRUST_ASSET}
                onRequestClose={() => {
                    setTRUST_ASSET(!TRUST_ASSET);
                }}
            >
                <View style={styles.modalView}>
                   <View style={{flexDirection:"row",justifyContent:"space-between",width:"100%"}}>
                     <Text style={styles.modal_heading}>Add Asset</Text>
                     <TouchableOpacity disabled={Loading} onPress={()=>{setTRUST_ASSET(false)}}>
                     <Icon
                            name={"close"}
                            type={"antDesign"}
                            size={28}
                            color={"white"}
                        />
                     </TouchableOpacity>
                   </View>
                    <TextInput placeholder="Search assests by code home domain" placeholderTextColor={"gray"} style={styles.search_bar} />
                    {AVL_ASSETS.map((list, index) => {
                        return (
                            <View style={[styles.search_bar, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                {index==0||index==2||index==5||index==4?<Image source={{uri:list.img}} style={styles.modal_IMG} />:<Image source={list.img} style={styles.modal_IMG} />}
                                    <View>
                                        <Text style={styles.modal_sub_heading}>{list.name}</Text>
                                        <Text style={[styles.modal_sub_heading, { fontSize: 10, color: "gray" }]}>{list.domain}</Text>
                                    </View>
                                </View>
                                {assets.some((list_item)=>list_item.asset_code===list.name)?
                                    <View style={styles.btn}>
                                        <Icon
                                            name={"check-decagram"}
                                            type={"materialCommunity"}
                                            size={22}
                                            color={"green"}
                                            style={{paddingHorizontal:"10%"}}
                                        />
                                    </View> :
                                <TouchableOpacity style={styles.btn} disabled={Loading} onPress={()=>{
                                    list.name==="USDC"?changeTrust():alert_message(list.name+' Added Soon.')
                                }}>
                                    <Text style={[styles.modal_sub_heading]}>{Loading&&index==0?(<ActivityIndicator color={"green"}/>):("Add Asset")}</Text>
                                </TouchableOpacity>
                                }
                            </View>
                        )
                    })}
                </View>
            </Modal>

        </>
    )
}
const styles = StyleSheet.create({
    btn: {
        borderColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
        borderWidth: 1.3,
        padding: 5,
        borderRadius: 10,
        marginRight: 10,
    },
    main_con: {
        backgroundColor: "#011434",
        height: "100%",
        padding: 19
    },
    search_bar: {
        marginTop: 19,
        borderColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
        borderWidth: 1.3,
        width: wp(85),
        padding: 5,
        paddingStart: 10,
        borderRadius: 10,
        color: "#fff"
    },
    assets_card: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10
    },
    assets_con: {
        width: wp(90),
        borderWidth: 1.9,
        borderColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
        borderRadius: 15,
        marginTop: 19,
        padding: 10,
    },
    mode_text: {
        color: "#fff",
        textAlign: "left",
        fontSize: 21,
        fontWeight: "bold",
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
    modalView: {
        // margin: 2,
        backgroundColor: "rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)",
        borderRadius: 20,
        padding: 19,
        alignItems: 'flex-start',
        justifyContent:"center",
        marginTop:60,
        paddingLeft:32
    },
    modal_heading: {
        fontSize: 23,
        color: "#fff",
        fontWeight: "600"
    },
    modal_sub_heading: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "600"
    },
    modal_IMG: {
        height: hp(6),
        width: wp(12.5),
        marginRight:5
    },
})
export default Assets_manage;