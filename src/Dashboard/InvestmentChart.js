import React, { useState, useEffect, useRef, useMemo } from "react";
import { StyleSheet, View, Text, Image, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Modal, TouchableWithoutFeedback } from "react-native";
import {
  Avatar,
  Card,
  Title,
  Paragraph,
  CardItem,
  WebView,
} from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useDispatch, useSelector } from "react-redux";
import Etherimage from "../../assets/ethereum.png";
import { Animated, LayoutAnimation, Platform, UIManager } from "react-native";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { getBnbPrice, getEthPrice, getXLMPrice } from "../utilities/utilities";
import Maticimage from "../../assets/matic.png";
import Xrpimage from "../../assets/xrp.png";
import stellar from "../../assets/Stellar_(XLM).png"
import bnbimage from "../../assets/bnb-icon2_2x.png";
import { GetBalance, getAllBalances } from "../utilities/web3utilities";
import { getXrpBalance,getEthBalance } from "../components/Redux/actions/auth";
import alert from "./reusables/Toasts";
import Icon from "../icon";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { RAPID_STELLAR, SET_ASSET_DATA } from "../components/Redux/actions/type";
import { enableBiometrics } from "../biometrics/biometric";
import { STELLAR_URL } from "./constants";
const StellarSdk = require('stellar-sdk');

function InvestmentChart(setCurrentWallet) {
  const navigation=useNavigation()
  const foused=useIsFocused()
  const state = useSelector((state) => state);
  const [pull, setPull] = useState(false)
  const wallet = useSelector((state) => state.wallet);
  const [bnbBalance, getBnbBalance] = useState(0.00);
  const [xrpBalance, GetXrpBalance] = useState(0.00);
  const [maticBalance, getMaticBalance] = useState(0.00);
  const [ethBalance, getEthBalance_] = useState(0.00);
  const [xmlBalance, setxmlBalance] = useState(0.00);
  const [current_xlm, setcurrent_xlm] = useState(0.00)
  const EthBalance = useSelector((state) => state.EthBalance);
  const XrpBalance = useSelector((state) => state.XrpBalance);
  const walletState = useSelector((state) => state.wallets);
  const type = useSelector((state) => state.walletType);
  const [publicKey, setPublicKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [ethPrice, setEthPrice] = useState();
  const [bnbPrice, setBnbPrice] = useState();
  const [loading, setLoading] = useState(false);
  const [ACTIVATION_MODAL, setACTIVATION_MODAL] = useState(false);
  const dispatch = useDispatch()
  const getEthBnbPrice = async () => {
    await getEthPrice().then((response) => {
      setEthPrice(response.USD);
    });
    await getBnbPrice().then((response) => {
      setBnbPrice(response.USD);
    });
    await getXLMPrice().then((response) => {
      setcurrent_xlm(response.USD);
    });
  };
  const getData = async () => {
    try {
      const storedData = await AsyncStorageLib.getItem('myDataKey');
      if (storedData !== null) {
        const parsedData = JSON.parse(storedData);
        const matchedData = parsedData.filter(item => item.Ether_address === state.wallet.address);
        const publicKey = matchedData[0].publicKey;
        setPublicKey(publicKey)
        get_stellar(publicKey);
        const secretKey_Key = matchedData[0].secretKey;
        setSecretKey(secretKey_Key)
    } else {
        console.log('No data found for key steller keys');
    }
    } catch (error) {
      const preser_backup = await AsyncStorageLib.getItem('wallet_backup');
      const storedData = await AsyncStorageLib.getItem('myDataKey');
      if (storedData !== null) {
        const parsedData = JSON.parse(storedData);
        const matchedData = parsedData.filter(item => item.Ether_address === preser_backup);
        const publicKey = matchedData[0].publicKey;
        setPublicKey(publicKey)
        get_stellar(publicKey);
        const secretKey_Key = matchedData[0].secretKey;
        setSecretKey(secretKey_Key)
      }
      console.error('Error retrieving data:', error);
    }
  };


  const getTokenBalance = async () => {
    const bal = await state.walletBalance;
    const EthBalance = await state.EthBalance;
    const xrpBalance = await state.XrpBalance;
    const maticBalance = await state.MaticBalance;
    const wallet = await state.wallet
    console.log('wall', wallet.address)
    AsyncStorageLib.getItem("walletType").then(async (type) => {

      console.log(JSON.parse(type))
      if (JSON.parse(type) === "Ethereum") {
        if (EthBalance) {
          getEthBalance_(Number(EthBalance).toFixed(2));
          getBnbBalance(0.00);
          getMaticBalance(0.00);
          GetXrpBalance(0.00);
        } else {
          getEthBalance_(0.00);
          getBnbBalance(0.00);
          getMaticBalance(0.00);
          GetXrpBalance(0.00);
        }
      } else if (JSON.parse(type) === "BSC") {
        // provider = new ethers.providers.JsonRpcProvider(RPC.BSCRPC)
        // const balance = provider.getBalance(address)
        // console.log('balance',balance)
        if (bal) {
          getBnbBalance(Number(bal).toFixed(2));
          getEthBalance_(0.00);
          getMaticBalance(0.00);
          GetXrpBalance(0.00);
        } else {
          getBnbBalance(0.00);
          getEthBalance_(0.00);
          getMaticBalance(0.00);
          GetXrpBalance(0.00);
        }
      } else if (JSON.parse(type) === "Xrp") {
        console.log('fetching')
        // provider = new ethers.providers.JsonRpcProvider(RPC.BSCRPC)
        // const balance = provider.getBalance(address)
        // console.log('balance',balance)
        if (xrpBalance) {
          dispatch(getXrpBalance(wallet.address))
          GetXrpBalance(xrpBalance)
          getBnbBalance(0.00);
          getEthBalance_(0.00);
          getMaticBalance(0.00);
        } else {
          getBnbBalance(0.00);
          getEthBalance_(0.00);
          getMaticBalance(0.00);
          GetXrpBalance(0.00);
        }
      } else if (JSON.parse(type) === "Multi-coin") {
        // provider = new ethers.providers.JsonRpcProvider(RPC.BSCRPC)
        // const balance = await provider.getBalance(address)
        // console.log('balances=',balance)
        if (
          EthBalance >= 0
        ) {
          getEthBalance_(Number(EthBalance).toFixed(2));

        } else {
          getEthBalance_(0.00);
        }
        if (bal >= 0) {
          console.log('bal', bal)
          getBnbBalance(Number(bal).toFixed(2));
        } else {
          getBnbBalance(0.00);
        }
        if (xrpBalance >= 0) {
          try {

            dispatch(getXrpBalance(wallet.xrp.address))
          } catch (e) {
            console.log(e)
          }

          // GetXrpBalance(Number(xrpBalance).toFixed(2)); //UNCOMMENT


        } else {
          GetXrpBalance(0.00);
        }
        if (maticBalance >= 0) {
          // getMaticBalance(Number(maticBalance).toFixed(2)); //UNCOMMENT
        } else {
          getMaticBalance(0.00);
        }
      } else {
        getEthBalance_(0.00);
        getBnbBalance(0.00);
        getMaticBalance(0.00);
        GetXrpBalance(0.00);
      }
      setPull(false)
    });
  }
  useEffect(()=>{
    // await getData_dispatch();
    const get_dataa=async()=>{
     try {
      await get_stellar();
     } catch (error) {
      console.log(error)
     }
    }
    get_dataa()
   
  },[foused])

  useEffect( () => {
   const insilize=async()=>{
      setLoading(true);
      try {
        await getTokenBalance();
        await getData();
        // await getTokenBalance()
        getEthBnbPrice();
        get_stellar();
        setTimeout(()=>{
          setLoading(false);
        },1000)
        setTimeout(async()=>{
          const biometric = await AsyncStorageLib.getItem("Biometric");
                if (biometric === "SET") {
                }
                else{
                  setACTIVATION_MODAL(true)
                }
        },1500)
      } catch (e) {
        console.log(e)
        setLoading(false);
      }
   }
   insilize()
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setxmlBalance("0.00"); 
        await getData();
        await getData_dispatch();
        getTokenBalance(); 
        get_stellar(); 
      } catch (e) {
        console.log(e);
      }
    };
  
    fetchData();
  }, [state.STELLAR_PUBLICK_KEY,wallet.address, wallet.name, EthBalance, bnbBalance, XrpBalance, state.walletBalance, state.EthBalance, state.XrpBalance, state.MaticBalance]);

  let LeftContent = (props) => (
    <Avatar.Image
      {...props}
      source={{
        uri: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850",
      }}
    />
  );
  let LeftContent2 = (props) => <Avatar.Image {...props} source={Etherimage} />;
  const getData_dispatch = async () => {
    try {
      console.log("_+_+_+UPDATING STATE_+_+_")
      const storedData = await AsyncStorageLib.getItem('myDataKey');
      if (storedData !== null) {
        const parsedData = JSON.parse(storedData);
        const matchedData = parsedData.filter(item => item.Ether_address === state.wallet.address);
        try {
          StellarSdk.Network.useTestNetwork();
          const server = new StellarSdk.Server(STELLAR_URL.URL);
          server.loadAccount(matchedData[0].publicKey)
            .then(account => {
              dispatch({
                type: SET_ASSET_DATA,
                payload: account.balances,
              })
              account.balances.forEach(balance => {
              dispatch({
                type: RAPID_STELLAR,
                payload: {
                  ETH_KEY:matchedData[0].Ether_address,
                  STELLAR_PUBLICK_KEY:matchedData[0].publicKey,
                  STELLAR_SECRET_KEY:matchedData[0].secretKey,
                  STELLAR_ADDRESS_STATUS:true
                },
              })
              dispatch(getEthBalance(matchedData[0].Ether_address))
              console.log("==Dispacthed success==")
              });
            })
            .catch(error => {
              console.log('Error loading account:', error);
              // active_account()
              dispatch({
                type: RAPID_STELLAR,
                payload: {
                  ETH_KEY:matchedData[0].Ether_address,
                  STELLAR_PUBLICK_KEY:matchedData[0].publicKey,
                  STELLAR_SECRET_KEY:matchedData[0].secretKey,
                  STELLAR_ADDRESS_STATUS:false
                },
              })
              console.log("==Dispacthed success==")
              console.log(':===ERROR STELLER ACCOUNT NEED TO ACTIVATE===:');
            });
        } catch (error) {
          console.log("Error in get_stellar")
          const preser_backup = await AsyncStorageLib.getItem('wallet_backup');
          const storedData = await AsyncStorageLib.getItem('myDataKey');
          if (storedData !== null) {
            const parsedData = JSON.parse(storedData);
            const matchedData = parsedData.filter(item => item.Ether_address === preser_backup);
            const publicKey = matchedData[0].publicKey;
            setPublicKey(publicKey)
            get_stellar(publicKey);
            const secretKey_Key = matchedData[0].secretKey;
            setSecretKey(secretKey_Key)
            StellarSdk.Network.useTestNetwork();
            const server = new StellarSdk.Server(STELLAR_URL.URL);
            server.loadAccount(matchedData[0].publicKey)
              .then(account => {
                dispatch({
                  type: SET_ASSET_DATA,
                  payload: account.balances,
                })
                account.balances.forEach(balance => {
                dispatch({
                  type: RAPID_STELLAR,
                  payload: {
                    ETH_KEY:matchedData[0].Ether_address,
                    STELLAR_PUBLICK_KEY:matchedData[0].publicKey,
                    STELLAR_SECRET_KEY:matchedData[0].secretKey,
                    STELLAR_ADDRESS_STATUS:true
                  },
                })
                dispatch(getEthBalance(matchedData[0].Ether_address))
                console.log("==Dispacthed success==")
                });
              })
              .catch(error => {
                console.log('Error loading account:', error);
                // active_account()
                dispatch({
                  type: RAPID_STELLAR,
                  payload: {
                    ETH_KEY:matchedData[0].Ether_address,
                    STELLAR_PUBLICK_KEY:matchedData[0].publicKey,
                    STELLAR_SECRET_KEY:matchedData[0].secretKey,
                    STELLAR_ADDRESS_STATUS:false
                  },
                })
                console.log("==Dispacthed success==")
                console.log(':===ERROR STELLER ACCOUNT NEED TO ACTIVATE===:');
              });
          }
         }
    } else {
        console.log('No data found for key steller keys to dispacth');
    }
    } catch (error) {
      const preser_backup = await AsyncStorageLib.getItem('wallet_backup');
      const storedData = await AsyncStorageLib.getItem('myDataKey');
      if (storedData !== null) {
        const parsedData = JSON.parse(storedData);
        const matchedData = parsedData.filter(item => item.Ether_address === preser_backup);
        const publicKey = matchedData[0].publicKey;
        setPublicKey(publicKey)
        get_stellar(publicKey);
        const secretKey_Key = matchedData[0].secretKey;
        setSecretKey(secretKey_Key)
      }
      console.error('Error retrieving data:', error);
    }
  };
  const get_stellar = async () => {
    // const publicKey="GANYSCWEP2XDKE76CTEWJTKUXS7EFPNT5XH22YESHK7DMGUXESD4SYMJ";
    try {
      console.log("<><", publicKey)

      StellarSdk.Network.useTestNetwork();
      const server = new StellarSdk.Server(STELLAR_URL.URL);
      server.loadAccount(publicKey)
        .then(account => {
          console.log('Balances for account:', publicKey);
          account.balances.forEach(balance => {
            if (balance.asset_type === "native") {
              console.log(`${balance.asset_type}: ${balance.balance}`);
              const temp_bal = balance.balance;
              const fullString = temp_bal.toString();
              // Extract the first 3 digits
              const substring = fullString.slice(0, 4);
              // Convert the substring back to an integer (optional)
              const displayedInt = parseFloat(substring).toFixed(2)
              setxmlBalance(displayedInt?displayedInt:0.00)
            }
          });
        })
        .catch(error => {
          const test="0.00"
          setxmlBalance(test)
          console.log('Error loading account:', error);
          alert("error", "Need to fund amount.")
        });
    } catch (error) {
      console.log("Error in get_stellar")
    }
  }
 useEffect(()=>{
   const get_new_all_bal = async () => {
   try {
    await getData_dispatch();
    getData();
    get_stellar();
   } catch (error) {
    console.log(error)
   }
   }
   get_new_all_bal()
 },[])

  return (
    <ScrollView
     style={{backgroundColor:state.THEME.THEME===false?"#fff":"black"}}
      refreshControl={
        <RefreshControl
          refreshing={pull}
          tintColor="#4CA6EA"
          onRefresh={() => {
            setPull(true);
            getData_dispatch()
            getTokenBalance();
            get_stellar();
            getData();
          }}
        />
      }

      nestedScrollEnabled={true} contentContainerStyle={{ paddingBottom: hp(60) }} sp>
      {
        loading===true?<ActivityIndicator color={"green"} size={"large"} style={{marginTop:hp(10)}}/>
        :<>
        <View style={{flexDirection:"row" ,alignItems:"center",width:wp(96)}}>
        <TouchableOpacity style={styles.refresh} onPress={() => {
        getAllBalances(state, dispatch)
      }}>
 <Icon type={"materialCommunity"} name="refresh" size={hp(3)} color={state.THEME.THEME===false?"black":"#fff"} style={{ marginLeft: 1 }} />
      </TouchableOpacity>
      <View style={{flexDirection:"row",justifyContent:"flex-end",width:wp(80),marginTop:hp(1.6)}}>
      <Text style={{color:state.THEME.THEME===false?"black":"#fff",fontSize:16,fontWeight:"500"}}>Balance</Text>
      </View>
        </View>
    

      <TouchableOpacity style={styles.flatlistContainer} onPress={()=>{navigation.navigate("Asset_info",{asset_type:"ETH"})}}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={Etherimage} style={styles.img} />
          <View style={styles.ethrumView}>
            <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}>Ethereum</Text>
            <Text
              style={{
                color: "grey",
                fontWeight: "bold",
              }}
            >
              $ {ethPrice >= 0 ? ethPrice : 1300}
            </Text>
          </View>
        </View>

        <Text
          style={{
            color:state.THEME.THEME===false?"black":"#fff",
            fontWeight: "bold",
          }}
        >
          {ethBalance ? ethBalance : 0} ETH
        </Text>
      </TouchableOpacity>
      {/* <TouchableOpacity style={styles.flatlistContainer} onPress={()=>{navigation.navigate("Asset_info",{asset_type:"Matic"})}} >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={Maticimage} style={styles.img} />
          <View style={styles.ethrumView}>
            <Text>Matic</Text>
            <Text
              style={{
                color: "grey",
                fontWeight: "bold",
              }}
            >
              $ {4}
            </Text>
          </View>
        </View>

        <Text
          style={{
            color: "black",
            fontWeight: "bold",
          }}
        >
          {maticBalance ? maticBalance : 0} MAT
        </Text>
      </TouchableOpacity> */}
      {/* <TouchableOpacity style={styles.flatlistContainer} onPress={()=>{navigation.navigate("Asset_info",{asset_type:"XRP"})}}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={Xrpimage} style={styles.img} />
          <View style={styles.ethrumView}>
            <Text>XRP</Text>
            <Text
              style={{
                color: "grey",
                fontWeight: "bold",
              }}
            >
              $ {0.78}
            </Text>
          </View>
        </View>

        <Text
          style={{
            color: "black",
            fontWeight: "bold",
          }}
        >
          {xrpBalance ? xrpBalance : 0} XRP
        </Text>
      </TouchableOpacity> */}

      <TouchableOpacity style={styles.flatlistContainer} onPress={()=>{navigation.navigate("Asset_info",{asset_type:"XLM"})}}>
      

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={stellar} style={styles.img} />
          <View style={styles.ethrumView}>
            <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}>XLM</Text>
            <Text
              style={{
                color: "grey",
                fontWeight: "bold",
              }}
            >
              $ {current_xlm?current_xlm:0.78}
            </Text>
          </View>
        </View>

        <Text
          style={{
            color:state.THEME.THEME===false?"black":"#fff",
            fontWeight: "bold",
          }}
        >
          {xmlBalance ? xmlBalance : 0.00} XLM
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.flatlistContainer]} onPress={()=>{navigation.navigate("Asset_info",{asset_type:"BNB"})}}>



        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Image source={bnbimage} style={styles.img} />
          <View style={styles.ethrumView}>
            <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}>BNB</Text>
            <Text
              style={{
                color: "grey",
                fontWeight: "bold",
              }}
            >
              ${bnbPrice >= 0 ? bnbPrice : 300}
            </Text>
            {/* <Text
              style={{
                color: "grey",
                fontWeight: "bold",
              }}
            >
              Available Soon
            </Text> */}
          </View>
        </View>
        <Text
          style={{
            color:state.THEME.THEME===false?"black":"#fff",

            fontWeight: "bold",
          }}
        >
          {bnbBalance ? bnbBalance : 0} BNB
        </Text>
      </TouchableOpacity>
      {/* <TouchableOpacity style={styles.flatlistContainer} onPress={()=>{navigation.navigate("Asset_info",{asset_type:"BNB"})}}> */}
      <TouchableOpacity style={[styles.flatlistContainer,{marginVertical: hp(0),backgroundColor:state.THEME.THEME===false?"#F7F7F7":"#3C3C3C", width: wp(100),height:hp(10),paddingHorizontal:wp(5),borderTopColor:state.THEME.THEME===false?"#fff":"black",borderColor:state.THEME.THEME===false?"silver":"black",borderWidth:1 }]} >



        <View style={{ flexDirection: "row", alignItems: "center"}}>
          <Image source={{uri:"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png"}} style={styles.img} />
          <View style={styles.ethrumView}>
            <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}>BTC</Text>
            <Text
              style={{
                color: "grey",
                fontWeight: "bold",
              }}
            >
              $1209
            </Text>
            <Text
              style={{
                color: "grey",
                fontWeight: "bold",
              }}
            >
              Available Soon
            </Text>
          </View>
        </View>
        <Text
          style={{
            color:state.THEME.THEME===false?"black":"#fff",

            fontWeight: "bold",
          }}
        >
          0.00 BTC
        </Text>
      </TouchableOpacity>
        </>
      }
 <Modal
          animationType="fade"
          transparent={true}
          visible={ACTIVATION_MODAL}
          >
            <TouchableWithoutFeedback onPress={()=>{setACTIVATION_MODAL(false)}}>
          <View style={styles.AccountmodalContainer}>
            <View style={styles.AccounsubContainer}>
              <Icon
                name={"alert-circle-outline"}
                type={"materialCommunity"}
                size={60}
                color={"orange"}
              />
              <Text style={styles.AccounheadingContainer}>Activate {Platform.OS==="android"?"biometric authentication":"Face ID"}</Text>
              <Text style={[styles.AccounheadingContainer,{fontSize: 10,}]}>Make your wallet even more secure with biometric login.</Text>
              <Text style={[styles.AccounheadingContainer,{fontSize: 10,marginTop: 0}]}>Use your fingerprint or facial recognition for fast and secure access.</Text>
              <View style={{ flexDirection: "row",justifyContent:"space-around",width:wp(80),marginTop:hp(3),alignItems:"center" }}>
                <TouchableOpacity style={styles.AccounbtnContainer} onPress={() => {setACTIVATION_MODAL(false)}}>
                   <Text style={styles.Accounbtntext}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.AccounbtnContainer} onPress={async()=>{setACTIVATION_MODAL(false),await enableBiometrics() }}>
                   <Text style={styles.Accounbtntext}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
            </View>

            </TouchableWithoutFeedback>
        </Modal>
    </ScrollView>
  );
}

export default InvestmentChart;

const styles = StyleSheet.create({
  flatlistContainer: {
    flexDirection: "row",
    marginVertical: hp(3),
    width: "80%",
    justifyContent: "space-between",
    alignItems: "center",
    width: wp(90),
    alignSelf: "center",
    marginBottom: 0,
  },
  img: { height: hp(5), width: wp(10), borderWidth: 1, borderRadius: hp(3) },
  ethrumView: {
    marginHorizontal: wp(4),
  },
  view: {
    flex: 1,
    height: 75,
  },
  chart: {
    height: 75,
  },
  priceUp: {
    color: "rgb(0,153,51)",
  },
  priceDown: {
    color: "rgb(204,51,51)",
  },
  refresh: { borderColor: "#4CA6EA",borderWidth:1, width: wp(10), paddingVertical: hp(0.3), marginTop: hp(1.9), marginLeft: wp(5), alignItems: "center", borderRadius: hp(1) },
  AccountmodalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  AccounsubContainer:{
    backgroundColor:"#131E3A",
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: "90%",
    height: "35%",
    justifyContent: "center"
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
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    color: "#fff"
  }
});