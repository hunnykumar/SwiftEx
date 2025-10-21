import React, { useState, useEffect, useRef, useMemo } from "react";
import { StyleSheet, View, Text, Image, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback, FlatList } from "react-native";
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
import { GetBalance, getAllBalances } from "../utilities/web3utilities";
import { getXrpBalance,getEthBalance } from "../components/Redux/actions/auth";
import alert from "./reusables/Toasts";
import Icon from "../icon";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { RAPID_STELLAR, SET_ASSET_DATA } from "../components/Redux/actions/type";
import { enableBiometrics } from "../biometrics/biometric";
import { STELLAR_URL } from "./constants";
import fetchAllTokensData from "../utilities/TokenUtils";
import LinearGradient from "react-native-linear-gradient";
import { CustomQuotes } from "./exchange/crypto-exchange-front-end-main/src/utils/CustomQuotes";
import * as StellarSdk from '@stellar/stellar-sdk';
import Modal from "react-native-modal";

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
  const [TokenChain, setTokenChain] = useState(null);
  const [TokenName, setTokenName] = useState(null);
  const [TokenAddress, setTokenAddress] = useState(null);
  const [CustomImport, setCustomImport] = useState(false);
  const [tokenInfoList, setTokenInfoList] = useState(null);
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
    setTokenAddress(null)
    setTokenName(null)
    setTokenChain(null)
    setCustomImport(false)
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
        fetchAllTokensData(state?.wallet.address)
          .then(result => setTokenInfoList(result?.tokens))
          .catch(error => {
            console.log("---> Error from Token Info", error)
            setTokenInfoList(null)
          })
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
          StellarSdk.Networks.PUBLIC
          const server = new StellarSdk.Horizon.Server(STELLAR_URL.URL);
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
            StellarSdk.Networks.PUBLIC
            const server = new StellarSdk.Horizon.Server(STELLAR_URL.URL);
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

      StellarSdk.Networks.PUBLIC
      const server = new StellarSdk.Horizon.Server(STELLAR_URL.URL);
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
    fetchAllTokensData(state?.wallet.address)
    .then(result => setTokenInfoList(result?.tokens))
    .catch(error => {
      console.log("---> Error from Token Info", error)
      setTokenInfoList(null)
    })
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
    { id: 1,symbole:"ETH",subSymbole:"ETH",tokenName:"WETH",address:"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", name: "Ethereum", avl: ethBalance ? ethBalance +" ETH": 0.00+" ETH", dollaravl: ethPrice?"$ "+ethPrice:"$ 0.00", status: "+1.8%", statusColor: "#40BF6A", img: "https://tokens.pancakeswap.finance/images/0x2170Ed0880ac9A755fd29B2688956BD959F933F8.png", bgColor: "#181F2C", viewColor: "rgba(45, 170, 32, 0.15)" },
    { id: 2,symbole:"XLM",subSymbole:"XLM",tokenName:"XLM",address:"", name: "XLM", avl: xmlBalance ? xmlBalance+" XLM" : 0.00 +" XLM", dollaravl: "$ "+current_xlm?"$ "+current_xlm:"$ 0.00", status: "+1.8%", statusColor: "#BF404D", img: "https://stellar.myfilebase.com/ipfs/QmSTXU2wn1USnmd5ZypA5zMze259wEPSDP3i8wivyr9qiq", bgColor: "#FF971A26", viewColor: "#AA202226" },
    { id: 3,symbole:"BNB",subSymbole:"BSC",tokenName:"WBNB",address:"0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", name: "Binance", avl: bnbBalance?bnbBalance+" BNB":0.00+" BNB", dollaravl: "$ "+bnbPrice >= 0 ? "$ "+bnbPrice : "$ "+300, status: "+1.8%", statusColor: "#40BF6A", img: "https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1696501970", bgColor: "rgba(243, 186, 47, 0.3)rgba(243, 47, 153, 0.3)", viewColor: "rgba(45, 170, 32, 0.15)" },
    { id: 4,symbole:"BTC",subSymbole:"BTC",tokenName:"",address:"", name: "Bitcoin", avl: "0 BTC", dollaravl: "$ 0.00", status: "+1.8%", statusColor: "#40BF6A", img: "https://tokens.pancakeswap.finance/images/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c.png", bgColor: "#FF971A26", viewColor: "rgba(45, 170, 32, 0.15)" },
  ]);
 const renderCoins = ({ item }) => {
  return (
    <TouchableOpacity
      disabled={item.id === 4}
      style={[
        styles.coinCard,
        { 
          backgroundColor: state.THEME.THEME === false ? "#F3F5F6" : "#242426",
        }
      ]}
      onPress={() => navigation.navigate("Asset_info", { asset_type: item })}
    >
      {item.id === 4 && (
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>{`Arriving\nsoon`}</Text>
        </View>
      )}

      <View style={styles.coinContent}>
        <View style={[styles.coinIcon, { backgroundColor: item.bgColor }]}>
          <Image
            source={{ uri: item.img }}
            style={styles.coinImage}
          />
        </View>

        <View style={styles.coinInfo}>
          <Text style={[styles.coinName, { color: state.THEME.THEME === false ? "#000" : "#FFF" }]}>
            {item.name}
          </Text>
          <View style={styles.coinPriceRow}>
            <Text style={styles.coinPrice}>{item.dollaravl}</Text>
          </View>
        </View>

        <View style={styles.balanceSection}>
          <Text style={[styles.balanceAmount, { color: state.THEME.THEME === false ? "#000" : "#FFF" }]}>
            {parseFloat(item.avl).toFixed(2)} {item.symbole}
          </Text>
          <Text style={[styles.balanceUsd,{ color: state.THEME.THEME === false ? "#000" : "#FFF" }]}>
          ${(parseFloat(item.avl) * parseFloat(item.dollaravl.replace('$ ', '') || 0)).toFixed(5)}</Text>
        </View>
        {item?.id !== 4 ? (
          <TouchableOpacity
            disabled={item.id === 3}
            style={[
              styles.tradeButton
            ]}
            onPress={() => {
              if (item?.id === 2) {
                navigation.navigate("newOffer_modal", 
                  item?.id === 1 && { tradeAssetType: item?.symbole }
                );
              } else {
                setTokenChain(item?.subSymbole?.toUpperCase());
                setTokenName(item?.tokenName?.toUpperCase());
                setTokenAddress(item?.address);
                setCustomImport(true);
              }
            }}
          >
            <Text style={styles.tradeButtonText}>Trade</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.tradeButtonPlaceholder} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const renderTokens = ({ item }) => {
  return (
    <TouchableOpacity
      style={[
        styles.coinCard,
        { backgroundColor: state.THEME.THEME === false ? "#F3F5F6" : "#242426" }
      ]}
      onPress={() => navigation.navigate("Asset_info", { asset_type: item })}
    >
      <View style={styles.coinContent}>
        <View style={[styles.coinIcon, { backgroundColor: "#F7931A1A" }]}>
          {item?.img_url ? (
            <Image
              source={{ uri: item?.img_url }}
              style={styles.coinImage}
            />
          ) : (
            <LinearGradient
              colors={['#3b82f6', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientIcon}
            >
              <Text style={styles.iconLetter}>{item?.name?.charAt(0)}</Text>
            </LinearGradient>
          )}
        </View>
        <View style={styles.coinInfo}>
          <View style={styles.tokenHeader}>
            <Text style={[styles.coinName, { color: state.THEME.THEME === false ? "#000" : "#FFF" }]}>
              {item?.symbol?.toUpperCase()}
            </Text>
            <Text style={styles.networkBadge}>({item?.network})</Text>
          </View>
          <Text style={styles.coinPrice}>$ {item?.price}</Text>
        </View>
        <View style={styles.balanceSection}>
          <Text style={[styles.balanceAmount, { color: state.THEME.THEME === false ? "#000" : "#FFF" }]}>
            {parseFloat(item?.balance || 0)?.toFixed(2)}{" "+item.network}
          </Text>
          <Text style={[styles.balanceUsd,{ color: state.THEME.THEME === false ? "#000" : "#FFF" }]}>${(parseFloat(item.balance || 0) * parseFloat(item.price || 0)).toFixed(5)}</Text>
        </View>
        <TouchableOpacity
          disabled={item?.network === "BSC" || (item?.network === "ETH" && item?.symbol?.toUpperCase() !== "USDT")}
          style={[styles.tradeButton,]}
          onPress={() => {
            setTokenChain(item?.network);
            setTokenName(item?.symbol?.toUpperCase());
            setTokenAddress(item?.address);
            setCustomImport(true);
          }}
        >
          <Text style={styles.tradeButtonText}>Trade</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
  return (
    <View style={[styles.watchlistCon,{backgroundColor:state.THEME.THEME===false?"#FFFFFF":"#1B1B1C"}]}>
    <ScrollView
    showsVerticalScrollIndicator={false}
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
        <FlatList
          data={tokenInfoList}
          renderItem={renderTokens}
          keyExtractor={(item,index) => {index}}
        />
        </>


    
      }
        <Modal
          animationType="slide"
          animationInTiming={50}
          visible={ACTIVATION_MODAL}
          onRequestClose={()=>{setACTIVATION_MODAL(false)}}
          useNativeDriver={true}
          useNativeDriverForBackdrop={true}
          hideModalContentWhileAnimating
          onBackdropPress={()=>{setACTIVATION_MODAL(false)}}
          onBackButtonPress={()=>{setACTIVATION_MODAL(false)}}
          style={styles.accountContainer}
          >
            <TouchableWithoutFeedback onPress={()=>{setACTIVATION_MODAL(false)}}>
          <View style={[styles.AccountmodalContainer,{ backgroundColor: state.THEME.THEME === false ? "#F4F4F8":"#242426" }]}>
              <Icon
                name={"alert-circle-outline"}
                type={"materialCommunity"}
                size={60}
                color={"orange"}
              />
              <Text style={[styles.AccounheadingContainer,{color:state.THEME.THEME === false ? "black":"#fff"}]}>Activate {Platform.OS==="android"?"Biometric Authentication":"Face ID Authentication"}</Text>
              <Text style={[styles.AccounheadingContainer,{fontSize: 15,color:state.THEME.THEME === false ? "black":"#fff",textAlign:"center",marginTop:3}]}>{`Keep your crypto safe without slowing down.\nQuick access with fingerprint or Face ID.`}</Text>
              <View style={{ paddingHorizontal:1,marginTop:hp(2),alignItems:"center" }}>
                <TouchableOpacity style={styles.AccounbtnContainer} onPress={async()=>{setACTIVATION_MODAL(false),await enableBiometrics() }}>
                   <Text style={styles.Accounbtntext}>Continue</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.AccounbtnSkipContainer} onPress={() => {setACTIVATION_MODAL(false)}}>
                   <Text style={[styles.Accounbtntext,{color:"gray"}]}>Skip</Text>
                </TouchableOpacity>
              </View>
            </View>

            </TouchableWithoutFeedback>
        </Modal>
        <CustomQuotes
          isVisible={CustomImport}
          onClose={()=>{setCustomImport(false)}}
          tokenChain={TokenChain}
          tokenName={TokenName}
          tokenAddress={TokenAddress}
          ACTIVATED={state?.STELLAR_ADDRESS_STATUS}
        />
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
  accountContainer: {
    justifyContent: "flex-end",
    margin: 0,
    backgroundColor:"rgba(0, 0, 0, 0.2)"
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
    paddingHorizontal:0,
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
    padding: 5,
    height:90,
    borderRadius: 10,
    justifyContent: "space-between",
    width:"99%",
    alignSelf:"center"
  },
  coinImgCon: {
    width: 55,
    height: 55,
    left: 10,
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
    width: 90,
    height: 39,
    top:4,
    borderRadius: 15,
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
  tokenImage: {
    width: 39,
    height: 39,
  },
  tokenName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  coinCard: {
    marginBottom: 5,
    padding: 10,
    paddingHorizontal:17
  },
  coinContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinIcon: {
    width: 59,
    height: 59,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  coinImage: {
    width: 45,
    height: 45,
    borderRadius: 20,
  },
  gradientIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconLetter: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  coinInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  coinName: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 4,
  },
  coinPriceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinPrice: {
    fontSize: 15,
    color: "#888",
    marginRight: 8,
  },
  coinStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
  tokenHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  networkBadge: {
    fontSize: 10,
    color: "#888",
    marginLeft: 6,
  },
  balanceSection: {
    alignItems: "flex-end",
    marginRight: 18,
    minWidth: 80,
  },
  balanceAmount: {
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 2,
  },
  balanceSymbol: {
    fontSize: 11,
    color: "#888",
  },
  tradeButton: {
    backgroundColor: "#5B6FED",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 80,
    alignItems: "center",
  },
  tradeButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  tradeButtonPlaceholder: {
    width: 80,
  },
  comingSoonBadge: {
    position: "absolute",
    backgroundColor: "#FF9800",
    borderRadius: 8,
    alignItems: "center",
    elevation: 5,
    zIndex: 10,
    right: 16,
    top: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  comingSoonText: {
    textAlign:"center",
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  AccountmodalContainer: {
    paddingVertical: hp(3),
    paddingHorizontal: wp(2),
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: "center",
  },
  AccounsubContainer: {
    backgroundColor: "#131E3A",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "90%",
    height: "35%",
    justifyContent: "center",
  },
  AccounbtnContainer: {
    width:wp(90),
    padding:20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor:"#5B65E1"
  },
  AccounbtnSkipContainer: {
    marginTop:5
  },
  Accounbtntext: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  AccounheadingContainer: {
    fontSize: 21.9,
    fontWeight: "bold",
    marginTop: 10,
    color: "#fff",
  },
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
  refresh: {
    borderColor: "#4CA6EA",
    borderWidth: 1,
    width: wp(10),
    paddingVertical: hp(0.3),
    marginTop: hp(1.9),
    marginLeft: wp(5),
    alignItems: "center",
    borderRadius: hp(1),
  },
});