import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { TextInput, Checkbox } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import title_icon from "../../../assets/title_icon.png";
import title_icon2 from "../../../assets/multicoin_wallet.png";

import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Card,
  Title,
  Paragraph,
  CardItem,
  WebView,
} from "react-native-paper";
import Bnbimage from "../../../assets/bnb-icon2_2x.png";
import Etherimage from "../../../assets/ethereum.png";
import Xrpimage from "../../../assets/xrp.png";
import Maticimage from "../../../assets/matic.png";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native-gesture-handler";
import {
  setCurrentWallet,
  setWalletType,
} from "../../components/Redux/actions/auth";
import {
  getEthBalance,
  getXrpBalance,
  getMaticBalance,
} from "../../components/Redux/actions/auth";
import { urls } from "../constants";
import { useNavigation } from "@react-navigation/native";
import Header from "../reusables/Header";
import { RPC, WSS } from "../constants";
import { alert } from "../reusables/Toasts";
import Icon from "../../icon";
import { delay } from "lodash";
import { Wallet_screen_header } from "../reusables/ExchangeHeader";

const xrpl = require("xrpl");

//'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850'
const AllWallets = (props) => {
  const state = useSelector((state) => state);
  const navigation = useNavigation();
  console.log(state.walletType);
  const [Wallets, setAllWallets] = useState([]);
  let wallet = [];
  const dispatch = useDispatch();

  let LeftContent = title_icon2;
  let multiCoinLeftContent = title_icon2;
  let EtherLeftContent = Etherimage;
  let BnbLeftContent = Bnbimage;
  let XrpLeftContent = Xrpimage;
  let MaticLeftContent = (props) => (
    <Avatar.Image {...props} source={Maticimage} />
  );
  const getALlWallets = async () => {
    const user = await AsyncStorageLib.getItem("user");
    console.log(user);
    const data = await AsyncStorageLib.getItem(`${user}-wallets`);

    // setAllWallets(JSON.parse(data))
    console.log(JSON.parse(data));
    return JSON.parse(data);
  };
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
            console.log(responseJson.responseData);
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

  const getBalance = async () => {
    try {
      const wallet = await AsyncStorageLib.getItem("wallet");
      const address = (await state.wallet.address)
        ? await state.wallet.address
        : JSON.parse(wallet).address;

      AsyncStorageLib.getItem("walletType").then(async (type) => {
        console.log("hi" + JSON.parse(type));
        if (!state.wallet.address) {
          // alert("no wallet selected");
        } else if (JSON.parse(type) == "Matic") {
          await dispatch(getMaticBalance(address))
            .then(async (res) => {
              console.log("hi poly" + res.MaticBalance);

              let bal = await AsyncStorageLib.getItem("MaticBalance");
              console.log(bal);
              if (res) {
                console.log("hi poly" + res.MaticBalance);
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
              console.log("hi" + Eth);
              console.log(bal);
              if (Eth) {
                console.log(Eth);
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
            console.log("My bsc balance" + balance);
          }
        } else if (JSON.parse(type) == "Xrp") {
          //const resp = await getXrpBal(address)
          dispatch(getXrpBalance(state.wallet.xrp.address)).catch((e) => {
            console.log(e);
          });
          AsyncStorageLib.getItem("Wallet")
            .then((wallet) => {
              console.log("classic address" + JSON.parse(wallet).address);
              if (wallet) {
                //const resp =  dispatch(getXrpBalance(await state.wallet.address));
                //console.log(resp);
              }
            })
            .catch((e) => {
              console.log(e);
            });
        } else if (JSON.parse(type) == "Multi-coin") {
          console.log("Multi-coin");

          await dispatch(getMaticBalance(address))
            .then(async (res) => {
              console.log("hi poly" + res.MaticBalance);

              let bal = await AsyncStorageLib.getItem("MaticBalance");
              console.log(bal);
              if (res) {
                console.log("hi poly" + res.MaticBalance);
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
                console.log(Eth);
              } else {
                console.log("coudnt get balance");
              }
            })
            .catch((e) => {
              console.log(e);
            });

          const balance = await state.walletBalance;
          if (balance) {
            console.log("My bsc balance" + balance);
          }
          dispatch(getXrpBalance(state.wallet.xrp.address));
        } else {
          const wallet = await state.wallet.address;
          console.log("hello" + wallet);
          /* if (wallet) {
            await dispatch(getBalance(state.wallet.address))
              .then(async () => {
                const bal = await state.walletBalance;
                console.log("My" + bal);
              })
              .catch((e) => {
                console.log(e);
              });
          }*/
        }
      });
    } catch (e) {
      console.log(e);
    }
  };
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const Spin = new Animated.Value(0);
  const SpinValue = Spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const headerFunction = () => {
    return navigation.canGoBack();
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const fetch_all_wallets = async () => {
      try {
        let allwallets = [];
        const data = await getALlWallets();
        allwallets.push(data);
        console.log(data);
        console.log(allwallets);
        setAllWallets(allwallets);
      } catch (error) {
        console.log("{{{P[[[[", error)
      }
    }
    fetch_all_wallets()
  }, []);

  return (
    <ScrollView contentContainerStyle={[style.body,{backgroundColor: state.THEME.THEME===false?"#fff":"black"}]}>
    <Wallet_screen_header elementestID={"all_wallets_back"} title="All Wallets" onLeftIconPress={() => navigation.goBack()} />
      {Wallets[0] ? (
        Wallets[0].map((item,index) => {
          if (item.walletType === "BSC") {
            LeftContent = BnbLeftContent;
          } else if (item.walletType === "Ethereum") {
            LeftContent = EtherLeftContent;
          } else if (item.walletType === "Matic") {
            LeftContent = MaticLeftContent;
          } else if (item.walletType === "Xrp") {
            LeftContent = XrpLeftContent;
          } else if (item.walletType === "Multi-coin") {
            LeftContent = multiCoinLeftContent;
          }
          else {
            LeftContent = multiCoinLeftContent;
          }
          return (
            <View key={index}>
              <TouchableOpacity
                key={item.name}
                style={style.Box}
                onPress={() => {
                  // props.navigation.navigate('Import Multi-Coin Wallet')
                  if (item.walletType) {
                    console.log(item.mnemonic);
                    AsyncStorageLib.setItem("currentWallet", item.name);
                    if (item.xrp) {
                      dispatch(
                        setCurrentWallet(
                          item.address,
                          item.name,
                          item.privateKey,
                          item.mnemonic ? item.mnemonic : "",
                          item.xrp.address ? item.xrp.address : "",
                          item.xrp.privateKey ? item.xrp.privateKey : "",
                          (item.walletType = "Multi-coin")
                        )
                      ).then((response) => {
                        console.log(response);
                        if (response) {
                          if (response.status == "success") {
                            AsyncStorageLib.setItem(
                              "walletType",
                              JSON.stringify(item.walletType)
                            );
                            dispatch(setWalletType(item.walletType));
                            // getBalance(state);

                            alert("success", "Wallet Selected " + item.name);
                            delay(()=>{
                              navigation.navigate("Home");
                            },400)
                          } else {
                            alert(
                              "error",
                              "error while selecting wallet. please try again"
                            );
                          }
                        } else {
                          alert(
                            "error",
                            "error while selecting wallet. please try again"
                          );
                        }
                      });
                    } else if (item.walletType == "Xrp") {
                      dispatch(
                        setCurrentWallet(
                          item.classicAddress,
                          item.name,
                          item.privateKey,
                          item.mnemonic ? item.mnemonic : ""
                        )
                      ).then(async (response) => {
                        console.log(response);
                        if (response) {
                          console.log(item.walletType);
                          console.log("resp =", response);

                          dispatch(setWalletType(item.walletType));
                          await getXrpBal(item.classicAddress).catch((e) => {
                            console.log(e);
                          });
                          //dispatch(getXrpBalance(item.classicAddress));
                          await AsyncStorageLib.setItem(
                            "walletType",
                            JSON.stringify(item.walletType)
                          );

                          /*  await getXrpBal(item.classicAddress)
                          .then((response)=>{
                            console.log(response)
                          })*/
                          //dispatch(getXrpBalance(item.classicAddress))
                          alert("success", `Wallet selected : ${item.name}`);
                        } else {
                          alert(
                            "error",
                            "error while selecting wallet. please try again"
                          );
                        }
                      });
                    } else {
                      dispatch(
                        setCurrentWallet(
                          item.address,
                          item.name,
                          item.privateKey,
                          item.mnemonic ? item.mnemonic : ""
                        )
                      ).then((response) => {
                        console.log(response);
                        if (response) {
                          if (response.status == "success") {
                            AsyncStorageLib.setItem(
                              "walletType",
                              JSON.stringify(item.walletType)
                            );
                            dispatch(setWalletType(item.walletType));
                            getBalance(state);
                            alert("success", "Wallet Selected " + item.name);
                          } else {
                            alert(
                              "error",
                              "error while selecting wallet. please try again"
                            );
                          }
                        } else {
                          alert(
                            "error",
                            "error while selecting wallet. please try again"
                          );
                        }
                      });
                    }
                  } else {
                    alert(
                      "error",
                      "wallet not supported. Please try selecting a different wallet"
                    );
                  }
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent:"space-between"

                  }}
                >
                  <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                  }}>
                  <Image style={item.walletType === "Multi-coin" ? style.multiImgStyle : style.img} source={LeftContent} />
                  <Text style={{color:state.THEME.THEME===false?"black":"#fff", marginHorizontal: wp(3) }} left={LeftContent}>
                    {item.name}
                  </Text>
                  </View>
                  {item.name===state.wallet.name&&
                  <View style={{
                    flexDirection: "row",
                    alignItems: "center"
                  }}>
                   <View style={{backgroundColor:"green",padding:wp(1),marginRight:wp(2),borderRadius:8}}>
                 <Text style={{color:"#fff",fontSize:17 }}>
                    Active
                  </Text>
                 </View>
                 <View accessibilityLabel={"check_decagram"}>
                 <Icon
                    name="check-decagram"
                    type={"materialCommunity"}
                    size={hp(3)}
                    color="green"
                  />
                 </View>
                  </View>}
                </View>

              </TouchableOpacity>
            </View>
          );
        })
      ) : (
        <Text style={style.NoText}>No wallets found</Text>
      )}
    </ScrollView>
  );
};

export default AllWallets;

const style = StyleSheet.create({
  body: { backgroundColor: "white", height: hp(100) },
  welcomeText: {
    fontSize: 20,
    fontWeight: "200",
    color: "black",
    marginTop: hp(5),
  },
  wallet: {
    textAlign: "center",
    marginTop: hp(3),
    fontSize: 16,
  },
  NoText: {
    textAlign: "center",
    marginTop: hp(2),
  },
  welcomeText2: {
    fontSize: 15,
    fontWeight: "200",
    color: "white",
    marginTop: hp(1),
  },
  Button: {
    marginTop: hp(10),
  },

  Text: {
    marginTop: hp(5),
    fontSize: 15,
    fontWeight: "200",
    color: "white",
  },
  Box: {
    marginHorizontal: wp(6),
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
    padding: 10,
    // marginTop: hp(2),
    borderColor: "#D7D7D7",
  },
  Box2: {
    height: hp("15%"),
    width: wp("75"),
    fontSize: 20,
    fontWeight: "200",
    color: "white",
    marginTop: hp(1),
    display: "flex",
    alignItems: "center",
    alignContent: "center",
    backgroundColor: "white",
  },
  Box3: {
    height: hp("15%"),
    width: wp("75"),
    fontSize: 20,
    fontWeight: "200",
    color: "white",
    marginTop: hp(2),
    display: "flex",
    alignItems: "center",
    alignContent: "center",
    backgroundColor: "white",
    borderTopWidth: 1,
  },
  img: {
    height: hp(4.5),
    width: hp(4.5),
    borderRadius: hp(3),
    marginHorizontal: wp(2.3)
  },
  multiImgStyle: {
    height: hp(7),
    width: hp(7),
    borderRadius: hp(3),

  }
});
