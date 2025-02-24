import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  AppState,
  BackHandler,
  Alert,
  ScrollView,
  Dimensions,
  TouchableOpacity
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setWalletType } from "../components/Redux/actions/auth";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import InvestmentChart from "./InvestmentChart";
import Nfts from "./Nfts";
import { Animated, Platform, UIManager } from "react-native";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { setCurrentWallet } from "../components/Redux/actions/auth";
import { useWindowDimensions } from "react-native";
import {
  TabView,
  SceneMap,
  TabBar,
  TabBarIndicator,
} from "react-native-tab-view";
import { useIsFocused, useNavigationState, useRoute } from "@react-navigation/native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
// import useFirebaseCloudMessaging from "./notifications/firebaseNotifications";
import {
  getEthBalance,
  getMaticBalance,
  getBalance,
  getXrpBalance,
} from "../components/Redux/actions/auth";
import { useBiometrics } from "../biometrics/biometric";
import LockAppModal from "./Modals/lockAppModal";
import Web3 from "web3";
import { SaveTransaction } from "../utilities/utilities";
import { alert } from "./reusables/Toasts";
import { resolve } from "bluebird";
import { reject } from "lodash";
import store from "././../../src/components/Redux/Store"
import PushNotification from 'react-native-push-notification';
import { WSS_TEST } from "./constants";
import useFirebaseCloudMessaging from "./notifications/firebaseNotifications";
 
  const handleLocalNotification = (msg) => {
    PushNotification.localNotification({
      channelId: 'app',
      title: 'SwiftEx Notification',
      message: msg,
      playSound: true,
      soundName: 'default',
      vibration: 300,
    });
  };
function listion(addressToMonitor) {
// const addressToMonitor= store.getState().wallet.address;
  console.log('>>>>>>',addressToMonitor)
  const web3 = new Web3(new Web3.providers.WebsocketProvider(WSS_TEST.WSS_SEP))

  web3.eth.subscribe('newBlockHeaders', (error, blockHeader) => {
    if (!error) {
      try {
        web3.eth.getBlock(blockHeader.number, true)
          .then((block) => {
            block.transactions.forEach((transaction) => {
              setDelay(200)
              if (transaction.to === addressToMonitor) {
                console.log('Transaction to the monitored address detected:', transaction.from);
                alert("Success", "Eth Transactions Recieved Check history.");
                SaveTransaction("Recieved", transaction.hash, "App", "null", "Multi-coin", "Eth");
                handleLocalNotification("ETH Transactions Recieved.");
              }
            });
          })
          .catch((err) => {
            console.error('Error fetching block:', err);
          });
      } catch (e) {
        console.log(e)
      }
    } else {
      console.error('Error:', error);
    }
  })
    .on('error', (err) => {
      console.error('Error:', err);
    });

  async function setDelay(time) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({});
      }, time);
    });

  }  
}
// listion()

const Home2 = ({ navigation }) => {
  const route = useRoute();
  const state = useSelector((state) => state);
  const dispatch = useDispatch();
  const [index, setIndex] = useState(0);
  const layout = useWindowDimensions();
  const currentState = useRef(AppState.currentState);
  const [appState, setAppState] = useState(currentState.current);
  const [transactions, setTransactions] = useState();
  const [visible, setVisible] = useState(false)
  const [routes] = useState([
    { key: "first", title: "Assets" },
    { key: "second", title: "Tokens" },
  ]);
  const Navigation = useNavigation();
  const { getToken, requestUserPermission } = useFirebaseCloudMessaging();
  const isFocused = useIsFocused();
  const getAllBalance = async () => {
    try {
      const wallet = await AsyncStorageLib.getItem("wallet");
      const address = (await state.wallet.address)
        ? await state.wallet.address
        : "";

      AsyncStorageLib.getItem("walletType").then(async (type) => {
        console.log("hi" + JSON.parse(type));
        if (!state.wallet.address) {
          console.log('no wallet selected');
        } else if (JSON.parse(type) == "Matic") {
          await dispatch(getMaticBalance(address))
            .then(async (res) => {
              let bal = await AsyncStorageLib.getItem("MaticBalance");
              console.log(bal);
              if (res) {
                console.log(res);
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
                console.log(res);
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
            console.log(res);
          }
        } else if (JSON.parse(type) == "Xrp") {
          console.log("entering xrp balance");
          try {
            const resp = dispatch(getXrpBalance(address))
              .then((response) => {
                console.log(response);
              })
              .catch((e) => {
                console.log(e);
              });
          } catch (e) {
            console.log(e);
          }
          //await getXrpBal(address)
          /* await getXrpBal(address)
          .catch((e)=>{
            console.log(e)
          })*/
        } else if (JSON.parse(type) == "Multi-coin") {
          await dispatch(getMaticBalance(address))
            .then(async (res) => {
              console.log("hi poly" + res.MaticBalance);

              let bal = await AsyncStorageLib.getItem("MaticBalance");
              console.log(bal);
              if (res) {
                console.log(res);
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
                console.log(res);
              } else {
                console.log("coudnt get balance");
              }
            })
            .catch((e) => {
              console.log(e);
            });

          const balance = await state.walletBalance;
          if (balance) {
            console.log(res);
          }
        } else {
          setType("");
          /*const wallet = await state.wallet.address;

          if (wallet) {
            await dispatch(getBalance(wallet))
              .then(async () => {
                const bal = await state.walletBalance;

                if (bal) {
                  GetBalance(bal);
                } else {
                  GetBalance(0);
                }
              })
              .catch((e) => {
                console.log(e);
              });
          }*/
          //alert('No wallet selected')
        }
      });
    } catch (e) {
      console.log(e);
    }
  };

  const SetCurrentWallet = async () => {
    let user = await AsyncStorageLib.getItem("currentWallet");
    let mainUser = await AsyncStorageLib.getItem("user");
    console.log("hi", mainUser);
    console.log(user);
    let walletType = await AsyncStorageLib.getItem("walletType");
    let wallet = await AsyncStorageLib.getItem(`Wallet`).then((wallet) => {
      console.log("888881101091091090190190909---------",wallet)
      console.log("------888881101091091090190190909---------") 
      console.log("My Wallet", JSON.parse(wallet));
      if (JSON.parse(wallet).xrp) {
        dispatch(
          setCurrentWallet(
            JSON.parse(wallet).address,
            user,
            JSON.parse(wallet).privateKey,
            JSON.parse(wallet).mnemonic,
            JSON.parse(wallet).xrp.address
              ? JSON.parse(wallet).xrp.address
              : "",
            JSON.parse(wallet).xrp.privateKey
              ? JSON.parse(wallet).xrp.privateKey
              : "",
            (walletType = "Multi-coin")
          )
        );
      } else {
        dispatch(
          setCurrentWallet(
            JSON.parse(wallet).address,
            user,
            JSON.parse(wallet).privateKey
          )
        );
      }
      console.log(mainUser);
      dispatch(setWalletType(JSON.parse(walletType)));
      dispatch(setUser(mainUser));
      getAllBalance().catch((e) => {
        console.log(e);
      });
    });

    return wallet;
  };

  // setTimeout(()=>{
  //   getAllBalance().catch((e) => {
  //     console.log(e);
  //   });
  // },10000)
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        await getAllBalance();
      } catch (e) {
        console.error(e);
      }
    };
  
    fetchBalances();

    const timeoutId = setTimeout(() => {
      const addressToMonitor = store.getState().wallet.address;
      console.log('><<<<', addressToMonitor);
      listion(addressToMonitor);
    }, 6000);
    return () => {
      clearTimeout(timeoutId);
    };
  }, []); 
  
  // useEffect(() => {
  //   getAllBalance().catch((e) => {
  //     console.log(e);
  //   });
  //    setTimeout(()=>{
  //     const addressToMonitor= store.getState().wallet.address;
  //     console.log('><<<<',addressToMonitor)
  //    listion(addressToMonitor)
  //    },6000)
  // }, [])

  const renderTabBar = (props) => {
    return (
      <View style={[Styles.tabCon,{backgroundColor:state.THEME.THEME===false?"#F4F4F4":"#23262F99"}]}>
        {props.navigationState.routes.map((route, i) => {
          const isActive = index === i;
          return (
            <TouchableOpacity
              key={i}
              style={[
                Styles.tabCard,
                { backgroundColor: isActive ? "#2164C1" : "#23262F99" }
              ]}
              onPress={() => setIndex(i)}
            >
              <Text style={Styles.tabCardText}>
                {route.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const FirstRoute = () => (
    <ScrollView style={{ flex: 1 }}>
      <InvestmentChart />
    </ScrollView>
  );

  const SecondRoute = () => (
    <View>
      <Nfts />
    </View>
  );

  const renderScene = SceneMap({
    first: InvestmentChart,
    second: Nfts,
  });

  // useEffect(async () => {
  //   // getWallets(state.user, readData,dispatch, importAllWallets)
  //   Animated.timing(fadeAnim, {
  //     toValue: 1,
  //     duration: 1000,
  //   }).start();

  //   Animated.timing(translation, {
  //     toValue: 1,
  //     delay: 0.1,
  //     useNativeDriver: true,
  //   }).start();
  //   /* if (!state.wallet.address) {
  //     try {
  //       await SetCurrentWallet().catch((e) => {
  //         console.log(e);
  //       });
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   }
  // */
  // }, []);
  useEffect(() => {
    const set_wallet=async()=>{
      try {
        await SetCurrentWallet().catch((e) => {
          console.log(e);
        });
  
      } catch (e) {
        console.log(e);
      }
    }
    set_wallet()
  }, []);

  // useEffect(() => {
  //   AppState.addEventListener("change", (changedState) => {
  //     currentState.current = changedState;
  //     setAppState(currentState.current);
  //     console.log(currentState.current);
  //     if (currentState.current === "background") {
  //       console.log(currentState.current);

  //       //navigation.navigate("appLock");
  //       /* if(routeName.name!=='exchangeLogin'){
            
  //         }*/
  //       setVisible(true)
  //     }
  //   });
  // }, []);

    const currentRout = useNavigationState(state => {
      const route = state.routes[state.index];
      return route.name;
    });

  const extractRouteName = (key) => {
    const [routeName] = key.split('-');
    return routeName;
  };
  const currentRoute = useNavigationState(state => state.routes[state.index]?.state?.history[1]?.key);
  useEffect(() => {
    const handleAppStateChange = (changedState) => {
      currentState.current = changedState;
      setAppState(currentState.current);
      console.log(currentState.current);
      
      if (currentState.current === "background") {
        if (currentRoute && (extractRouteName(currentRoute) === "On/Off Ramp" || currentRout === "Wallet")) {
        } else {
          setVisible(true);
        }
      }
    };
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      subscription.remove(); 
    };
  }, [currentRoute, currentRout]); 
  // useEffect(() => {
  //   const handleAppStateChange = (changedState) => {
  //     currentState.current = changedState;
  //     setAppState(currentState.current);
  //     console.log(currentState.current);
  //     if (currentState.current === "background") {
        
  //       // if (currentRoute !== routeName) {
  //       //   setVisible(true);
  //       // }
  //       if (currentRoute && extractRouteName(currentRoute) === "On/Off Ramp"||currentRout==="Wallet") {
  //       }
  //       else{
  //         setVisible(true);
  //       }
  //     }
  //   };
    
  //   AppState.addEventListener("change", handleAppStateChange);

  //   return () => {
  //     AppState.removeEventListener("change", handleAppStateChange);
  //   };
  // }, [currentRoute,currentRout]);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        Alert.alert("Hold on!", "Are you sure you want to exit?", [
          { text: "Cancel" },
          { text: "Yes", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [])
  );

  useEffect(() => {
    requestUserPermission();
    getToken();
  }, []);
  useEffect(() => {
    
    console.log('wallet changed')
  }, [state.wallet.name])

  /*useFocusEffect(
    React.useCallback(() => {
      try {
        getTransactions().then((res) => {
          console.log(res);
          checkIncomingTx(res);
        });
      } catch (e) {
        console.log(e);
      }
    }, [])
  );*/
  useFocusEffect(
    useCallback(() => {
      setIndex(0);
    }, [])
  );
  return (
    <View style={{backgroundColor:state.THEME.THEME===false?"#fff":"black"}}>
      <View style={[Styles.container,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
        <TabView
          swipeEnabled={true}
          navigationState={{ index, routes }}
          renderTabBar={renderTabBar}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: Dimensions.get('window').width }}
        />
      </View>
        <LockAppModal pinViewVisible={visible} setPinViewVisible={setVisible} />
    </View>
  );
};

export default Home2;
const Styles = StyleSheet.create({
  tabCon: {
    marginVertical: "8%",
    flexDirection: "row",
    width: "90%",
    height: "6%",
    alignSelf: "center",
    justifyContent: "space-between",
    backgroundColor: "#23262F99",
    borderRadius: 13,
    padding: 2,
  },
  tabCard: {
    alignItems: "center",
    justifyContent: "center",
    height: "99%",
    width: "49%",
    padding: 10,
    borderRadius: 13,
  },
  tabCardText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600"
  },
  container: {
    // display: "flex",
    backgroundColor:"black",
    height: hp("100"),
    width: wp("100"),
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    // zIndex: 100,
  },
  content: {
    display: "flex",
    flexDirection: "row",
    marginTop: 0,
    color: "white",
    width: wp(100),
    zIndex: 100,
  },
  text: {
    color: "grey",
    fontWeight: "bold",
  },
  text2: {
    color: "grey",
    fontWeight: "bold",
  },
  priceUp: {
    color: "rgba(0,153,51,0.6)",
  },
  priceDown: {
    color: "rgba(204,51,51,0.6)",
  },
});
/*<View style={{marginTop:10}}>
<Button title='logout'  onPress={onLogout}/>
</View> 

<Card.Content style={{ height: 100 }}>
      <Chart
      name={item.symbol}
      setPercent={setPercent}
  />
 </Card.Content>
      
*/
/*
<View style={Styles.content}>
    <TouchableOpacity style={{ borderBottomWidth:color==='tokens'?2:0,borderColor:'black', width:wp(50), alignItems:'center', alignContent:'center'}}>
      <Text style={{color:color==='tokens'?'blue':'grey',
    fontWeight:'bold'}} onPress={()=>{
      setColor('tokens')
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    }}>Tokens</Text>
    </TouchableOpacity>
    <TouchableOpacity style={{borderBottomWidth:color==='nfts'?2:0 ,width:wp(50), alignItems:'center', alignContent:'center'}}>
      <Text style={{color:color==='nfts'?'blue':'grey',
    fontWeight:'bold'}} onPress={()=>{
      setColor('nfts')
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    }}>NFTs</Text>
    </TouchableOpacity>
      </View>
      <ScrollView style={{marginTop:5, display:'flex', flexDirection:'row'}}
      vertical={true}
    showsHorizontalScrollIndicator={false}
    scrollEventThrottle={200}
    decelerationRate="fast"
    pagingEnabled
      >
                <View  style={{display:'flex', flexDirection:'row'}}>
                <View style={{ right:color==='tokens'?wp(0):wp(100)}}>
                <InvestmentChart/>
                </View>
                <View style={{position:'absolute', left:color==='nfts'?wp(0):wp(100)}}>
                <Nfts/>
                </View>
                </View>
      
      </ScrollView>
  

*/

