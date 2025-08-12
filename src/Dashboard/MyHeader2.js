import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
  Touchable,
  TouchableOpacity,
  Pressable, StatusBar, SafeAreaView, Image, Modal, TouchableWithoutFeedback, ActivityIndicator
} from "react-native";
import { Button, Text } from "react-native-paper";
import FontAwesome from "react-native-vector-icons";
import SendModal from "./Modals/SendModal";
import RecieveModal from "./Modals/RecieveModal";
import { useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useDispatch, useSelector } from "react-redux";
import {
  getEthBalance,
  getMaticBalance,
  getBalance,
  getXrpBalance,
} from "../components/Redux/actions/auth";
import { Animated } from "react-native";
import SwapModal from "./Modals/SwapModal";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { urls } from "./constants";
import {
  getEtherBnbPrice,
  getEthPrice,
  getBnbPrice,
  getXrpPrice,
  getXLMPrice,
} from "../utilities/utilities";
import { tokenAddresses } from "./constants";
import { FaucetModal } from "./Modals/faucetModal";
import Icon from "../icon";
// import IconWithCircle from "../Screens/iconwithCircle";
import darkBlue from "../../assets/darkBlue.png"
import Wallet_selection_bottom from "./Wallets/Wallet_selection_bottom";
import WalletSyncComponent from "../walletSync/WalletSyncComponent";
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental(true)
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const MyHeader2 = ({ title, changeState, state, extended, setExtended }) => {
  state = useSelector((state) => state);
  const state2 = useSelector((state) => state.walletBalance);
  const EthBalance = useSelector((state) => state.EthBalance);
  const bnbBalance = useSelector((state) => state.walletBalance);
  const xrpBalance = useSelector((state) => state.XrpBalance);
  const XLMBalance = useSelector((state) => state?.assetData);
  const walletState = useSelector((state) => state.wallets);
  const type = useSelector((state) => state.walletType);

  console.log(state.wallets);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [modalVisible3, setModalVisible3] = useState(false);
  const [swapType, setSwapType] = useState("");
  const [balance, GetBalance] = useState(0.0);
  const [wallet, getWallet] = useState(walletState ? walletState : []);
  const [Type, setType] = useState("");
  const [user, setUser] = useState("");
  const [bnbPrice, setBnbPrice] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [xrpPrice, setXrpPrice] = useState(0);
  const [balanceUsd, setBalance] = useState(0.0);
  const [XLMPrice, setXLMPrice] = useState(0.0);
  const [Wallet_modal, setWallet_modal] = useState(false);
  const [Loading_upper, setLoading_upper] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [balanceVisible, setbalanceVisible] = useState(false);
  const [walletSyncOpen,setwalletSyncOpen]=useState(false);
  // onPress={() => setModalVisible(true)}
  if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
  const openModal1 = () => {
    setModalVisible(true);
    setModalVisible2(false);
    setModalVisible3(false);
  };

  const openModal2 = () => {
    setModalVisible(false);
    setModalVisible2(true);
    setModalVisible3(false);
  };
  const openModal3= async()=>{
    const walletType = await AsyncStorageLib.getItem("walletType");
    console.log(JSON.parse(walletType));
    if (!JSON.parse(walletType))
      return alert("please select a wallet first to swap tokens");
    if (
      JSON.parse(walletType) === "BSC" ||
      JSON.parse(walletType) === "Ethereum" ||
      JSON.parse(walletType) === "Multi-coin"
    ) {
      setModalVisible(false);
      setModalVisible2(false);
      // setModalVisible3(true); //uncommet for old swap and comment EthSwap
      navigation.navigate("EthSwap")
    } else {
      alert("Swapping is only supported for Ethereum and Binance ");
    }
  }
  const Logo = () => {
    return <Icons name="bitcoin" size={20} color="white" />;
  };
  const translation = useRef(new Animated.Value(0)).current;
  const getXrpBal = async (address) => {
    console.log(address);

    try {
      const response = await fetch(
        `http://${urls.testUrl}/user/getXrpBalance`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: address,
          }),
        }
      )
        .then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson);
          if (responseJson) {
            setType("XRP");
            console.log(responseJson.responseData);
            GetBalance(
              responseJson.responseData ? responseJson.responseData : 0
            );
          } else {
            console.log(response);
          }
        })
        .catch((e) => {
          console.log(e);
          //alert('unable to update balance')
        });

      return response;
    } catch (e) {
      console.log(e);
    }
  };

  const getAllBalance = async () => {
    try {
      const wallet = await AsyncStorageLib.getItem("wallet");
      const address = (await state.wallet.address)
        ? await state.wallet.address
        : "";
      const wType = await type;

      AsyncStorageLib.getItem("walletType").then(async (type) => {
        console.log("hi" + JSON.parse(type));
        if (!state.wallet.address) {
          GetBalance(0.0);
          setType("");
        } else if (JSON.parse(type) == "Matic") {
          await dispatch(getMaticBalance(address))
            .then(async (res) => {
              let bal = await AsyncStorageLib.getItem("MaticBalance");
              console.log(bal);
              if (res) {
                setType("Mat");
                GetBalance(bal);
              } else {
                console.log("coudnt get balance");
              }
            })
            .catch((e) => {
              console.log(e);
            });
        } else if (JSON.parse(type) == "Ethereum") {
          dispatch(getEthBalance(address))
            .then(async (e) => {
              const Eth = await e.EthBalance;
              let bal = await AsyncStorageLib.getItem("EthBalance");

              if (Eth) {
                setType("Eth");
                GetBalance(Eth);
              } else {
                console.log("coudnt get balance");
              }
            })
            .catch((e) => {
              console.log(e);
            });
        } else if (JSON.parse(type) == "BSC") {
          const balance = await state.walletBalance;
          if (balance) {
            GetBalance(balance);
            setType("BNB");
          }
        } else if (JSON.parse(type) == "Xrp") {
          console.log("entering xrp balance");
          try {
            const resp = dispatch(getXrpBalance(address))
              .then((response) => {
                console.log(response);
                setType("XRP");
                console.log(response.XrpBalance);
                GetBalance(response.XrpBalance ? response.XrpBalance : 0);
              })
              .catch((e) => {
                console.log(e);
              });
            //await getXrpBal(address)
            //await getXrpBal(address)
          } catch (e) {
            console.log(e);
          }
        } else if (JSON.parse(type) == "Multi-coin") {
          await dispatch(getMaticBalance(address))
            .then(async (res) => {
              console.log("hi poly" + res.MaticBalance);

              let bal = await AsyncStorageLib.getItem("MaticBalance");
              console.log(bal);
              if (res) {
                setType("Mat");
                GetBalance(bal);
              } else {
                console.log("coudnt get balance");
              }
            })
            .catch((e) => {
              console.log(e);
            });

          dispatch(getEthBalance(address))
            .then(async (e) => {
              const Eth = await e.EthBalance;
              let bal = await AsyncStorageLib.getItem("EthBalance");
              console.log("hi" + Eth);
              console.log(bal);
              if (Eth) {
                setType("Eth");
                GetBalance(bal);
              } else {
                console.log("coudnt get balance");
              }
            })
            .catch((e) => {
              console.log(e);
            });

          const balance = await state.walletBalance;
          if (balance) {
            GetBalance(balance);
            setType("BNB");
          }
        } else {
          setType("");
        }
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect( () => {
    const get_bal=async()=>{
      try {
        getAllBalance().catch((e) => {
          console.log(e);
        });
      } catch (e) {
        console.log(e);
      }
    }
    get_bal()
    Animated.timing(translation, {
      toValue: 1,
      delay: 0.1,
      useNativeDriver: true,
    }).start();
  }, [state2, wallet,state.walletBalance,state.EthBalance,state.XrpBalance,state.MaticBalance]);

  useEffect(() => {
    const get_ALL_BALE=async()=>{
      try {
        getAllBalance().catch((e) => {
          console.log(e);
        });
      } catch (e) {
        console.log(e);
      }
    }
    get_ALL_BALE()
  }, [state.wallet.address, state.wallet.name, state.walletType,state.walletBalance,state.EthBalance,state.XrpBalance,state.MaticBalance]);

  const openExtended = () => {
    changeState();
    // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };
  const calculateUsdValue = (balance, price) => {
    const balanceNum = Number(balance);
    const priceNum = Number(price)
    
    if (isNaN(balanceNum) || isNaN(priceNum)) {
      return 0;
    }
    return balanceNum * priceNum;
  };
  const getBalanceInUsd = (ethBalance, bnbBalance, xrpBalance) => {
    const lumansBalance = XLMBalance?.filter(balance => balance.asset_type === "native")[0]?.balance || "0";

    console.log("My wallet Type", Type);
    console.log(ethBalance, bnbBalance, xrpBalance, xrpPrice);
    const ethInUsd =calculateUsdValue (ethBalance, ethPrice);
    const bnbInUsd =calculateUsdValue(bnbBalance,bnbPrice);
    const xrpInUsd =calculateUsdValue(xrpBalance,xrpPrice);
    const XLMInUsd =calculateUsdValue(lumansBalance,XLMPrice);
    console.log("Eth balance", ethInUsd);
    console.log("BNB balance", bnbInUsd);
    console.log("Xrp balance", xrpInUsd);
    console.log("Xrp balance",state?.assetData[0]?.balance);

    AsyncStorageLib.getItem("walletType").then((Type) => {
      console.log("Async type", Type);
      if (JSON.parse(Type) === "Ethereum") {
        const totalBalance = Number(ethInUsd)+Number(XLMInUsd);
        setBalance(totalBalance.toFixed(1));
        return;
      } else if (JSON.parse(Type) === "BSC") {
        const totalBalance = Number(bnbInUsd)+Number(XLMInUsd);
        setBalance(totalBalance.toFixed(1));
        return;
      } else if (JSON.parse(Type) === "Xrp") {
        const totalBalance = Number(xrpInUsd);
        console.log("Xrpl $", totalBalance);
        setBalance(totalBalance.toFixed(1));
        return;
      } else if (JSON.parse(Type) === "Matic") {
        setBalance(0.0);
        return;
      } else if (JSON.parse(Type) === "Multi-coin") {
        const totalBalance =
          Number(ethInUsd) + Number(bnbInUsd) +Number(XLMInUsd);
        console.log(totalBalance);
        setBalance(totalBalance.toFixed(1));
        return;
      }
    });
    return;
    // setLoading(false)
  };
  
  const getETHBNBPrice = async () => {
    /* await getEtherBnbPrice(tokenAddresses.ETH, tokenAddresses.BNB)
    .then((resp) => {
      console.log(resp);
      setEthPrice(resp.Ethprice);
      setBnbPrice(resp.Bnbprice);
    })
    .catch((e) => {
      console.log(e);
    });*/
    await getEthPrice().then((response) => {
      console.log("eth price = ", response.USD);
      setEthPrice(response.USD);
    });
    await getBnbPrice().then((response) => {
      console.log("BNB price= ", response.USD);
      setBnbPrice(response.USD);
    });
    await getXrpPrice().then((response) => {
      console.log("XRP price =", response.USD);
      setXrpPrice(response.USD);
    });
    await getXLMPrice().then((response) => {
      console.log("XLM price= ", response.USD);
      setXLMPrice(response.USD);
    });

    return true

  };
  console.log("-asde-",balanceUsd)

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
    }).start();

    Animated.timing(translation, {
      toValue: 1,
      delay: 0.1,
      useNativeDriver: true,
    }).start();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  useEffect(() => {
    const get_BAL=async()=>{
      try {
        console.log(balanceUsd);
        //getEthPrice()
        getETHBNBPrice();
        getBalanceInUsd(EthBalance, bnbBalance, xrpBalance);
      } catch (error) {
        console.log(":::",error)
      }
    }
    get_BAL()
  }, [
    ethPrice,
    bnbPrice,
    EthBalance,
    bnbBalance,
    xrpPrice,
    xrpBalance,
    Type,
    state.wallet.name,
    state?.assetData,
  ]);

  useEffect(() => {
    let isMounted = true;
    const getBalances = async () => {
      if (!isMounted) return;
      try {
        await getETHBNBPrice();
        if (!isMounted) return;
        getBalanceInUsd(EthBalance, bnbBalance, xrpBalance);
      } catch (error) {
        console.error("Balance fetch error:", error);
      }
    };
    getBalances();
    return () => {
      isMounted = false;
    };
  }, []);
  // useEffect(async () => {
  //   console.log(balanceUsd);
  //   //getEthPrice()
  //   getETHBNBPrice()
  //   .then(()=>{
  //     getBalanceInUsd(EthBalance, bnbBalance, xrpBalance);
  //   })
  // }, []);
  useEffect(() => {
    const set_user_current=async()=>{
      try {
        const user = await state.wallet.name;
        if (user) {
          setUser(user);
        }
        setTimeout(()=>{
          setLoading_upper(false)
        },600)
      } catch (error) {
        console.log("::::",error)
      }
    }
    set_user_current()
  }, [state.wallet.name]);
  const handleClosewalletmodal = () => {
    setWallet_modal(false);
  };
  return (
    <SafeAreaView style={{ backgroundColor: state.THEME.THEME===false?"#fff":"black",marginTop:0 }}>
       {Platform.OS==="ios"?<StatusBar hidden={true}/>:<StatusBar barStyle={"light-content"} backgroundColor={state.THEME.THEME ? "black":"#fff"}/>}
      <View>
        {
          Loading_upper?<ActivityIndicator color={"green"}/>:
            <View style={[styles.headerContainer,{ backgroundColor: state.THEME.THEME===false?"#fff":"black"}]}>

              <View style={styles.walletCon}>
                <View style={styles.walletNameandBal}>
                <View style={{flexDirection:"row",alignItems:"center"}}>
                <Text style={[styles.walletNameandBal.walletNamefontText,{ color:state.THEME.THEME === false ? "black":"#fff"}]}>{user.slice(0, 11)} </Text>
                  <TouchableOpacity onPress={() => { setWallet_modal(true) }}>
                    <Icon name="chevron-down-outline" type={"ionicon"} size={21} color={state.THEME.THEME === false ? "black":"#fff"} />
                  </TouchableOpacity>
                </View>
                  <View style={styles.walletSubCon}>
                    <View style={{width:"60%"}}>
                    <Text lineBreakMode={"tail"} style={[styles.walletNameandBal.walletNamefontBal,{color:state.THEME.THEME === false ? "black":"#fff"}]}>{balanceVisible ? "$ " + balanceUsd? "$ "+balanceUsd:"$ 0.0"  : "$ X.XX"} </Text>
                    </View>
                    {balanceVisible ?
                        <Icon name="eye-off-outline" type={"ionicon"} size={26} color={"gray"} onPress={() => { setbalanceVisible(balanceVisible ? false : true) }} />:
                        <Icon name="eye-outline" type={"ionicon"} size={26} color={"gray"} onPress={() => { setbalanceVisible(balanceVisible ? false : true) }}/>
                       }
                  </View>
                </View>
                <TouchableOpacity style={[styles.bellCon,{backgroundColor:state.THEME.THEME === false ? "#F4F4F4":"#18181C"}]} onPress={() => {setwalletSyncOpen(walletSyncOpen?false:true)}}>
                  <Icon name="notifications-outline" type={"ionicon"} size={26} color={state.THEME.THEME === false ? "#1F2286":"gray"} />
                </TouchableOpacity>
              </View>
              {/* Feature section */}
              <View style={styles.featureCon}>
                {/* recive card */}
                <TouchableOpacity style={[styles.featureCard,{backgroundColor:state.THEME.THEME===false?"#F4F4F4":"#23262F99"}]} onPress={() => { openModal2()}}>
                <Icon name="qr-code-outline" type={"ionicon"}  color={"#2164C1"} size={35} />
                  <Text style={[styles.featureCard.featureCardText,{color:state.THEME.THEME===false?"black":"#FFFFFF"}]}>Recive</Text>
                </TouchableOpacity>
                {/* send card */}
                <TouchableOpacity style={[styles.featureCard,{backgroundColor:state.THEME.THEME===false?"#F4F4F4":"#23262F99"}]} onPress={() => { openModal1()}}>
                <Icon name="paper-plane-outline" type={"ionicon"}  color={"#2164C1"} size={35} />
                  <Text style={[styles.featureCard.featureCardText,{color:state.THEME.THEME===false?"black":"#FFFFFF"}]}>Send</Text>
                </TouchableOpacity>
                {/* swap card */}
                <TouchableOpacity style={[styles.featureCard,{backgroundColor:state.THEME.THEME===false?"#F4F4F4":"#23262F99"}]}  onPress={() => { openModal3()}}>
                <Icon name="swap" type={"antDesign"}  color={"#2164C1"} size={35} />
                  <Text style={[styles.featureCard.featureCardText,{color:state.THEME.THEME===false?"black":"#FFFFFF"}]}>Swap</Text>
                </TouchableOpacity>
                {/* buy card */}
                <TouchableOpacity style={[styles.featureCard,{backgroundColor:state.THEME.THEME===false?"#F4F4F4":"#23262F99"}]} onPress={() => navigation.navigate("KycComponent",{tabName:"Buy"})}>
                <Icon name="dollar-sign" type={"feather"}  color={"#2164C1"} size={35} />
                  <Text style={[styles.featureCard.featureCardText,{color:state.THEME.THEME===false?"black":"#FFFFFF"}]}>Buy</Text>
                </TouchableOpacity>
              </View>

              {/* <FaucetModal showModal={showModal} setShowModal={setShowModal} /> */}

              {/* <TouchableOpacity style={{backgroundColor: state.THEME.THEME===false?"silver":"black",borderRadius:16,justifyContent:"space-between",alignItems:"center",paddingHorizontal:'1%',flexDirection:"row",width:wp(40),borderColor:"#145DA0",borderWidth:1.5}} onPress={()=>{setWallet_modal(true)}}>
         <View style={{flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
         <Image
                 source={darkBlue}
                 style={{width:35,height:35}}
               />
       <Text style={{color:state.THEME.THEME===false?"white":"#fff",fontWeight: "bold",marginRight:4,fontSize:16}}>{user.slice(0,11)}</Text>
         </View>
       <Icon name="chevron-down-outline" type={"ionicon"} size={21} color={"#fff"} />
     </TouchableOpacity> */}

              {/* <Pressable onPress={() => alert("Notifications will be added soon")}>
         <Icon name="bell" type={"fontisto"} size={24} color={ state.THEME.THEME===false?"black":"#fff"} />
       </Pressable> */}
            </View>


        }
        {/* <View style={{ marginVertical: hp(2) }}>
        <Text style={[styles.dollartxt,{color:state.THEME.THEME===false?"black":"#fff"}]}>
        $ {balanceUsd >= 0 ? balanceUsd : 0.0}
        </Text>
        <Text
          style={{
            color:state.THEME.THEME===false?"black":"#fff",
            textAlign: "center",
            fontWeight: "400",
            fontStyle: "italic",
            fontSize: 20,
          }}
        >
          {user ? user : "main wallet"}
        </Text>
      </View> */}
        {/* <View style={styles.buttons}>
          <TouchableOpacity onPress={() => { openModal1() }}>
            <IconWithCircle
              name={"arrowup"}
              type={"antDesign"}
              title={"Send"}
            // onPress={() => setModalVisible(!modalVisible)}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { openModal2() }}>
            <IconWithCircle
              name={"arrowdown"}
              type={"antDesign"}
              title={"Receive"}
            // onPress={() => setModalVisible2(true)}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={async () => { openModal3() }}>
            <IconWithCircle
              name={"swap-horizontal"}
              type={"ionicon"}
              title={"Swap"}
            // onPress={async () => {
            //   const walletType = await AsyncStorageLib.getItem("walletType");
            //   console.log(JSON.parse(walletType));
            //   if (!JSON.parse(walletType))
            //     return alert("please select a wallet first to swap tokens");
            //   if (
            //     JSON.parse(walletType) === "BSC" ||
            //     JSON.parse(walletType) === "Ethereum" ||
            //     JSON.parse(walletType) === "Multi-coin"
            //   ) {
            //     setModalVisible3(true);
            //   } else {
            //     alert("Swapping is only supported for Ethereum and Binance ");
            //   }
            // }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("buycrypto")}>
            <IconWithCircle
              name={"credit-card-outline"}
              type={"materialCommunity"}
              title={"Buy"}
            // onPress={() => navigation.navigate("buycrypto")}
            />
          </TouchableOpacity>
        </View> */}
        <SendModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
        />
        <RecieveModal
          modalVisible={modalVisible2}
          setModalVisible={setModalVisible2}
        />
        <SwapModal
          modalVisible={modalVisible3}
          setModalVisible={setModalVisible3}
          swapType={swapType}
        />
{/* 
        <TouchableOpacity
          style={[styles.iconmainContainer, { backgroundColor: state.THEME.THEME === false ? "#fff" : "black", borderColor: "#145DA0", borderWidth: 1 }]}
          onPress={() => {
            navigation.navigate("Market");
          }}
        >
          <View style={styles.iconTextContainer}>
            <Icon name="graph" type={"simpleLine"} size={hp(3)} color={state.THEME.THEME === false ? "black" : "#fff"} />
            <Text style={{ marginHorizontal: hp(1), color: state.THEME.THEME === false ? "black" : "#fff" }}>
              Market insights
            </Text>
          </View>
        </TouchableOpacity> */}
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
                {/* <IconWithCircle
                  name={"arrowdown"}
                  type={"antDesign"}
                  title={""}
                // onPress={() => setModalVisible(!modalVisible)}
                /> */}
                {/* #2196F3 */}
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
                <Wallet_selection_bottom onClose={handleClosewalletmodal} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={walletSyncOpen}
          onRequestClose={() => setwalletSyncOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => { setwalletSyncOpen(false) }}>
            <View style={styles.modalBackground}>
              <View style={[styles.walletConnectModalView]}>
                <WalletSyncComponent close={()=>{setwalletSyncOpen(false)}} openModal={()=>{setwalletSyncOpen(true)}}/>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default MyHeader2;
const styles = StyleSheet.create({
  walletCon: {
    paddingHorizontal: 19,
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  walletNameandBal: {
    walletNamefontText: {
      fontSize: 19,
      color: "#FFFFFF",
      fontWeight: "500"
    },
    walletNamefontBal: {
      fontSize: 32,
      color: "#FFFFFF",
      fontWeight: "800"
    },
  },
  walletSubCon: {
    flexDirection: "row",
    alignItems: "center"
  },
  bellCon: {
    backgroundColor: "#18181C",
    padding: 5,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 5
  },
  featureCon: {
    paddingHorizontal: 15,
    flexDirection: "row",
    marginTop: "8%",
    justifyContent: "space-between",
    alignItems: "center",
    height: 90,
    width: "100%",
    marginBottom:1
  },
  featureCard: {
    backgroundColor: "#23262F99",
    alignItems: "center",
    justifyContent: "center",
    height: "99%",
    width: "22.5%",
    borderRadius: 19,
    featureCardText: {
      marginTop:1.4,
      fontSize: 13,
      color: "#FFFFFF",
      fontWeight: "500"
    }
  },
  profile: {
    borderWidth: 1,
    width: wp("15.1"),
    height: hp("7.7"),
    marginTop: hp("5"),
    marginRight: wp("5"),
    borderRadius: 10,
  },
  profileText: {
    color: "white",
    fontWeight: "bold",
    marginTop: hp("1"),
    marginLeft: wp("3"),
  },
  text: {
    bottom: wp("33"),
    color: "white",
  },
  textDesign: {
    color: "white",
    fontStyle: "italic",
    fontWeight: "bold",
    marginLeft: wp("3"),
  },
  textDesign2: {
    color: "black",
    fontWeight: "bold",
    marginLeft: wp("5"),
  },
  textDesign3: {
    color: "black",
    fontWeight: "bold",
    marginLeft: wp("2"),
  },
  textDesign4: {
    color: "black",
    fontWeight: "bold",
    marginLeft: wp("4"),
  },
  buttons: {
    marginTop: hp(2),
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  addButton: {
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: "#3574B6",
    width: wp("13"),
    height: hp("6"),
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addButton2: {
    position: "absolute",
    zIndex: 11,
    left: 20,
    bottom: 90,
    backgroundColor: "green",
    width: 80,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  container: {
    backgroundColor: "#000C66",
    position: "absolute",
    padding: 10,
    width: wp("50"),
    marginTop: hp("15"),
    marginLeft: wp("23"),
  },
  dropdown: {
    height: hp("6"),
    width: wp("50"),
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginTop: hp("1"),
    marginRight: 20,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "#000C66",
    left: wp("13"),
    zIndex: -999,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "white",
    height: hp("3"),
    bottom: hp("8"),
  },
  placeholderStyle: {
    fontSize: 16,
    color: "white",
  },
  selectedTextStyle: {
    fontSize: 11,
    color: "white",
  },
  iconStyle: {
    width: 20,
    height: 20,
    backgroundColor: "white",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  faucetText: {
    color: "black",
  },
  faucetBtn: {
    backgroundColor: "#4CA6EA",
    width: wp(15),
    alignItems: "center",
    borderRadius: 5,
  },
  headerContainer: {
    width: wp(99),
  },
  dollartxt: {
    color: "black",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: hp(1),
  },
  wallet: {
    flexDirection: "row",
    alignSelf: "center",
  },
  text: {
    color: "black",
    textAlign: "center",
  },
  iconTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  iconmainContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: hp(42),
    alignSelf: "center",
    marginTop: hp(3),
    height: hp(9),
    alignItems: "center",
    borderRadius: hp(2),
    padding: hp(2),
    backgroundColor: "#e8f0f8",
  },
  numberContainer: {
    backgroundColor: "#9bbfde",
    width: hp(4.3),
    height: hp(4.3),
    borderRadius: hp(10),
    justifyContent: "center",
    alignItems: "center",
  },
  number: {
    textAlign: "center",
    color: "#fff",
    backgroundColor: "#145DA0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: hp(10),
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
  walletConnectModalView:{
    width: wp(100),
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
    elevation: 5
  },
});
/*
 <View style={styles.buttons}>
          <TouchableOpacity
    style={styles.addButton}
    onPress={() => {
       
        }}>
    <Text style={styles.addButtonText}>Import</Text>
  </TouchableOpacity>
   
    <TouchableOpacity
      style={styles.addButton}
      onPress={() => {
      
      }}>
      <Text style={styles.addButtonText}>Close</Text>
    </TouchableOpacity>
  
          
          </View>
          <View style={styles.container}>
        <Text style={styles.label}>
          My Wallets
        </Text>
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={Data?Data:WalletData}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? state.wallet.name ?state.wallet.name :'Select Wallet'  : 'Select wallet'}
          searchPlaceholder="Search..."
          value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={async (item) => {
            console.log(item.label)
            setValue(item.value);
            console.log(item.privateKey)
            setIsFocus(false);

            try{
             await dispatch(setCurrentWallet(item.value, item.label, item.privateKey))
            .then( (response) => {
              if(response){
             //console.log(response)
             alert(`Wallet selected :${item.label}`)
            }
            else{
              alert('failed to select wallet. please try again')
            }
              
              
            })
            .catch((error) => {
              
              console.log(error)
              alert('failed to select wallet. please try again')
              
            });
     
            }catch(e){
              alert('failed to select wallet')
            }
          }}
          renderLeftIcon={() => (
            <AntDesign
              style={styles.icon}
              color={isFocus ? 'blue' : 'white'}
              name="Safety"
              size={20}
            />
          )}
        />
      </View>

      <View style={styles.wallet}>
          <Text style={styles.textDesign3}>
            <Text>{balance ? balance : 0}</Text> {Type}
          </Text>
          
        </View>
        <Text style={styles.text}>
            {state.wallet
              ? state.wallet.name
                ? state.wallet.name
                : state.wallet.accountName
                ? state.wallet.accountName
                : "Main Wallet"
              : "No connected wallet"}
          </Text>
*/
