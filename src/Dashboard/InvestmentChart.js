import React, { useState, useEffect, useRef, useMemo } from "react";
import { StyleSheet, View, Text, Image, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Modal, TouchableWithoutFeedback, FlatList } from "react-native";
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
import stellar from "../../assets/Stellar_(XLM).png"
import dydxImg from "../../assets/dydx.jpeg";
import { GetBalance, getAllBalances } from "../utilities/web3utilities";
import { getXrpBalance,getEthBalance } from "../components/Redux/actions/auth";
import alert from "./reusables/Toasts";
import Icon from "../icon";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { RAPID_STELLAR, SET_ASSET_DATA } from "../components/Redux/actions/type";
import { enableBiometrics } from "../biometrics/biometric";
import { STELLAR_URL } from "./constants";
import ResponsiveLineChart from "./exchange/crypto-exchange-front-end-main/src/components/ResponsiveLineChart";
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
      console.log("_++++++",response.USD)
      setEthPrice(response.USD);
    });
    await getBnbPrice().then((response) => {
      setBnbPrice(response.USD);
      console.log("_++++++",response.USD)
    });
    await getXLMPrice().then((response) => {
      setcurrent_xlm(response.USD);
      console.log("_++++++",response.USD)
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

  useEffect(() => {
    let isMounted = true;
  
    const initialize = async () => {
      const biometric = await AsyncStorageLib.getItem("Biometric");
        if ((biometric === null || biometric !== "SET")) {
          setACTIVATION_MODAL(true);
        }
      if (!isMounted) return;
      setLoading(true);
  
      try {
        await Promise.all([
          getTokenBalance(),
          getData(),
          getEthBnbPrice(),
          get_stellar()
        ]);
        
  
        if (!isMounted) return;
  
        const updatedChainData = chainnData.map(chain => {
          switch (chain.name) {
            case "Ethereum":
              return {
                ...chain,
                avl: ethBalance ? `${ethBalance} ETH` : "0.00 ETH",
                dollaravl: ethPrice ? `$ ${ethPrice}` : "$ 0.00"
              };
            
            case "XLM":
              return {
                ...chain,
                avl: xmlBalance ? `${xmlBalance} DYDX` : "0.00 DYDX",
                dollaravl: current_xlm ? `$ ${current_xlm}` : "$ 0.00"
              };
      
            case "Binance":
              return {
                ...chain,
                avl: bnbBalance ? `${bnbBalance} BNB` : "0.00 BNB",
                dollaravl: bnbPrice >= 0 ? `$ ${bnbPrice}` : "$ 300"
              };
      
            default:
              return chain;
          }
        });
      
        if (!isMounted) return;
        setchainnData(updatedChainData);
  
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    initialize();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setxmlBalance("0.00"); 
        await getData();
        await getData_dispatch();
        getTokenBalance(); 
        get_stellar(); 
        const updatedChainData = chainnData.map(chain => {
          switch (chain.name) {
            case "Ethereum":
              return {
                ...chain,
                avl: ethBalance ? `${ethBalance} ETH` : "0.00 ETH",
                dollaravl: ethPrice ? `$ ${ethPrice}` : "$ 0.00"
              };
            
            case "XLM":
              return {
                ...chain,
                avl: xmlBalance ? `${xmlBalance} XLM` : "0.00 XLM",
                dollaravl: current_xlm ? `$ ${current_xlm}` : "$ 0.00"
              };
      
            case "Binance":
              return {
                ...chain,
                avl: bnbBalance ? `${bnbBalance} BNB` : "0.00 BNB",
                dollaravl: bnbPrice >= 0 ? `$ ${bnbPrice}` : "$ 300"
              };
      
            default:
              return chain;
          }
        });
      
        setchainnData(updatedChainData);
        console.log("--2`",chainnData)
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
  const [chainnData,setchainnData] =useState([
    { id: 1,symbole:"ETH", name: "Ethereum", avl: ethBalance ? ethBalance +" ETH": 0.00+" ETH", dollaravl: ethPrice?"$ "+ethPrice:"$ 0.00", status: "+1.8%", statusColor: "#40BF6A", img: "https://tokens.pancakeswap.finance/images/0x2170Ed0880ac9A755fd29B2688956BD959F933F8.png", bgColor: "#181F2C", viewColor: "rgba(45, 170, 32, 0.15)" },
    { id: 2,symbole:"XLM", name: "DYDX", avl: xmlBalance ? xmlBalance+" DYDX" : 0.00 +" DYDX", dollaravl: "$ "+current_xlm?"$ "+current_xlm:"$ 0.00", status: "+1.8%", statusColor: "#BF404D", img: dydxImg, bgColor: "#FF971A26", viewColor: "#AA202226" },
    { id: 3,symbole:"BNB", name: "Binance", avl: bnbBalance?bnbBalance+" BNB":0.00+" BNB", dollaravl: "$ "+bnbPrice >= 0 ? "$ "+bnbPrice : "$ "+300, status: "+1.8%", statusColor: "#40BF6A", img: "https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1696501970", bgColor: "rgba(243, 186, 47, 0.3)rgba(243, 47, 153, 0.3)", viewColor: "rgba(45, 170, 32, 0.15)" },
    { id: 4,symbole:"BTC", name: "Bitcoin", avl: "0 BTC", dollaravl: "$ 0.00", status: "+1.8%", statusColor: "#40BF6A", img: "https://tokens.pancakeswap.finance/images/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c.png", bgColor: "#FF971A26", viewColor: "rgba(45, 170, 32, 0.15)" },
  ]);
 const renderCoins = ({ item }) => {
  return (
    <TouchableOpacity 
    disabled={item.id === 4} 
    style={[
      styles.coinMainCon, 
      { backgroundColor: state.THEME.THEME === false ? "#FFFFFF" : "#18181C" }
    ]} 
    onPress={() => navigation.navigate("Asset_info", { asset_type: item.symbole })}
  >
    {item.id === 4 && (
      <View style={[styles.TokenInfo]}>
        <Text style={styles.TokenInfoText}>Arriving soon</Text>
      </View>
    )}
  
    {/* Left: Coin Image & Info */}
    
{/* Left: Coin Image & Info */}
<View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
  {/* Coin Image */}
  <View style={[styles.coinImgCon, { backgroundColor: item.bgColor }]}>
    <Image 
      source={item.name === "DYDX" ? item.img : { uri: item.img }} 
      style={item.name === "DYDX" ? { width: 49, height: 49 } : { width: 39, height: 39 }} 
    />
  </View>

  {/* Coin Info - Adjusted with marginLeft */}
  <View style={[styles.coinInfoCon, { marginLeft: 10 }]}>
    <Text style={[styles.coinInfoCon.coinInfoText, { color: state.THEME.THEME === false ? "black" : "#FFFFFF" }]}>
      {item.name}
    </Text>
    <Text style={styles.coinInfoCon.coinBalText}>
      {parseFloat(item.avl).toFixed(1)} {item.symbole==="XLM"?"DYDX":item.symbole}
    </Text>
    <View style={styles.coinInfoCon.coinSubCon}>
      <Text style={[styles.coinInfoCon.coinInfoText, { color: state.THEME.THEME === false ? "black" : "#FFFFFF" }]}>
        {item.dollaravl}
      </Text>
    </View>
  </View>
</View>

  
    {/* Center: Coin Chart */}
    <View style={{ flex: 1, alignItems: "center" }}>
      <ResponsiveLineChart width={89} height={70} symbol={item.symbole} />
    </View>
  
    {/* Right: Action Buttons */}
    {item?.id!==4?<View style={{ alignItems: "center", paddingRight: 5 }}>
      <TouchableOpacity 
        disabled={item.id === 4} 
        style={[styles.actionBuyBtn, { backgroundColor: "#23262F", margin: 2 }]} 
        onPress={() => {
          state?.STELLAR_ADDRESS_STATUS === false 
            ? navigation.navigate("exchange") 
            : navigation.navigate("Temptrade");
        }}
      >
        <Text style={styles.actionRowBtnText}>Trade</Text>
      </TouchableOpacity>
  
      <TouchableOpacity 
        disabled={item.id === 4} 
        style={styles.actionBuyBtn} 
        onPress={() => navigation.navigate("payout")}
      >
        <Text style={styles.actionRowBtnText}>Buy</Text>
      </TouchableOpacity>
    </View>:<View style={{ width: 107,}}/>}
  </TouchableOpacity>
  
  )
}
  return (
        <View style={[styles.watchlistCon,{backgroundColor:state.THEME.THEME===false?"rgba(244, 244, 244, 1)":"#23262F1A"}]}>
        {/* <Text style={[styles.watchlistCon.watchlistConHeading,{color:state.THEME.THEME===false?"black":"#fff"}]}>Watchlist</Text> */}
    <ScrollView
    showsVerticalScrollIndicator={false}
     style={{backgroundColor:state.THEME.THEME===false?"rgba(244, 244, 244, 1)":"#23262F1A"}}
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
            getAllBalances(state, dispatch)
          }}
        />
      }

      nestedScrollEnabled={true} contentContainerStyle={{ paddingBottom: hp(60) }} sp>
      {
        loading===true?<ActivityIndicator color={"green"} size={"large"} style={{marginTop:hp(10)}}/>
        :
        <>
        <FlatList
          data={chainnData}
          renderItem={renderCoins}
          keyExtractor={item => item.id}
        />
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
    </View>
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
  },
  watchlistCon: {
    backgroundColor: "rgba(244, 244, 244, 1)",
    width: "100%",
    height: "100%",
    paddingVertical: 10,
    paddingHorizontal:20,
    watchlistConHeading: {
      fontSize: 18,
      fontWeight: "600",
      color: "#FFFFFF",
      paddingBottom:8
    }
  },
  coinMainCon: {
    flexDirection: "row",
    backgroundColor: "#18181C",
    marginVertical: 4,
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRadius: 10,
    justifyContent: "space-between"
  },
  coinImgCon: {
    width: 50,
    height: 50,
    left: 5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10
  },
  coinInfoCon: {
    marginLeft:Platform.OS==="ios"?"2%":0,
    height: 53,
    coinInfoText: {
      fontSize: 13,
      color: "#FFFFFF",
      fontWeight: "600"
    },
    coinBalText: {
      color: "gray",
      fontSize: 13,
      fontWeight: "600"
    },
    coinStatusText: {
      fontSize: 11,
      fontWeight: "500"
    },
    coinSubCon: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start"
    },
    coinPerCon: {
      borderRadius: 10,
      // width: "28%",
      paddingHorizontal: 3,
      height: "90%",
      alignItems: "center",
      marginLeft: 5
    }
  },
  actionRowBtn: {
    width: 51,
    height: 27,
    borderRadius: 6,
    backgroundColor:"#23262F",
    justifyContent:"center",
    alignItems:"center",
  },
  actionBuyBtn: {
    width: 105,
    height: 29,
    top:4,
    borderRadius: 6,
    backgroundColor:"#2164C1",
    justifyContent:"center",
    alignItems:"center"
  },
  actionRowBtnCon:{ 
    flexDirection: "row",
    justifyContent:"space-between",
    width:106
  },
  actionRowBtnText:{
    fontSize:13,
    color:"#fff",
    textAlign:"center"
  },
  TokenInfo: {
    position: "absolute",
    backgroundColor: "orange",
    paddingVertical: 10,
    // paddingHorizontal: 15,
    borderRadius: 5,
    alignItems:"center",
    elevation: 5,
    zIndex:10,
    right: 10,
    width: 104,
  },
  TokenInfoText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});