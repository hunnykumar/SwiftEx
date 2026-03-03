import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  AppState,
  BackHandler,
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
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { setCurrentWallet } from "../components/Redux/actions/auth";
import {
  TabView,
  SceneMap,
} from "react-native-tab-view";
import { useIsFocused, useNavigationState, useRoute } from "@react-navigation/native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  getEthBalance,
  getMaticBalance,
  getXrpBalance,
} from "../components/Redux/actions/auth";
import LockAppModal from "./Modals/lockAppModal";
import useFirebaseCloudMessaging from "./notifications/firebaseNotifications";
import CustomInfoProvider from "./exchange/crypto-exchange-front-end-main/src/components/CustomInfoProvider";

const Home2 = ({ navigation }) => {
  const state = useSelector((state) => state);
  const dispatch = useDispatch();
  const [index, setIndex] = useState(0);
  const currentState = useRef(AppState.currentState);
  const [appState, setAppState] = useState(currentState.current);
  const [visible, setVisible] = useState(false)
  const [routes] = useState([
    { key: "first", title: "Assets" },
    { key: "second", title: "Add Assets" },
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
      console.log("888881101091091090190190909---------", wallet)
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

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        await getAllBalance();
      } catch (e) {
        console.log(e);
      }
    };

    fetchBalances();
  }, []);

  const renderTabBar = (props) => {
    return (
      <View style={[[Styles.tabCon,{backgroundColor:state.THEME.THEME?"#242426":"#F3F5F6"}]]}>
        {props.navigationState.routes.map((route, i) => {
          const isActive = index === i;
          return (
            <TouchableOpacity
              key={i}
              style={[
                Styles.tabCard,
                { backgroundColor: isActive ? "#4052D6" : state.THEME.THEME?"#242426":"#F3F5F6" }
              ]}
              onPress={() => setIndex(i)}
            >
              <Text style={[Styles.tabCardText,{color:isActive ?"#FFFFFF":state.THEME.THEME?"#FFFFFF":"black"}]}>
                {route.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderScene = SceneMap({
    first: InvestmentChart,
    second: Nfts,
  });
  useEffect(() => {
    const set_wallet = async () => {
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


  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        CustomInfoProvider.show("Hold on!", "Are you sure you want to exit?", [
          { text: "Cancel", style: "cancel" },
          { text: "Yes", onPress: () => BackHandler.exitApp() },
        ])
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

  useFocusEffect(
    useCallback(() => {
      setIndex(0);
    }, [])
  );
  return (
    <View style={{ backgroundColor: state.THEME.THEME === false ? "#fff" : "#1B1B1C" }}>
      <View style={[Styles.container, { backgroundColor: state.THEME.THEME === false ? "#fff" : "#1B1B1C" }]}>
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
    marginVertical: hp(2),
    flexDirection: "row",
    width: "90%",
    height: "7%",
    alignSelf: "center",
    justifyContent: "space-between",
    borderRadius: 25,
    padding: 3,
  },
  tabCard: {
    alignItems: "center",
    justifyContent: "center",
    height: "99%",
    width: "49%",
    padding: 10,
    borderRadius: 23,
  },
  tabCardText: {
    fontSize: 19,
    fontWeight: "600"
  },
  container: {
    backgroundColor: "black",
    height: hp(90),
    width: wp("100"),
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
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
  }
});