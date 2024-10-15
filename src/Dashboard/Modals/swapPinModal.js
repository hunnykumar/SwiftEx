import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import title_icon from "../../../assets/title_icon.png";
import darkBlue from "../../../assets/darkBlue.png";
import ReactNativePinView from "react-native-pin-view";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { Platform } from "react-native";
import {
  setPlatform,
  setWalletType,
} from "../../components/Redux/actions/auth";
import Modal from "react-native-modal";
import { useNavigation } from "@react-navigation/native";
import { SwapEthForTokens } from "../tokens/swapFunctions";
import { SwapTokensToTokens, UniSwap } from "../tokens/UniswapFunctions";
import { SwapLoadingComponent } from "../../utilities/loadingComponent";
import { alert } from "../reusables/Toasts";
import { getAllBalances } from "../../utilities/web3utilities";
const SwapPinModal = ({
  pinViewVisible,
  setPinViewVisible,
  setModalVisible,
  setTradeVisible,
  pancakeSwap,
  coin0,
  coin1,
  swapType,
  SaveTransaction,
  setLoading,
  amount,
}) => {
  const state = useSelector((state) => state);
  const [status, setStatus] = useState("pinset");
  const [showRemoveButton, setShowRemoveButton] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [showCompletedButton, setShowCompletedButton] = useState(false);
  const [loader, setLoader] = useState(false);
  const pinView = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();

  const navigation = useNavigation();

  const Spin = new Animated.Value(0);
  const SpinValue = Spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(async () => {
    const Check = await AsyncStorage.getItem(`pin`);
    console.log(Check);
    if (Check) {
      setStatus("pinset");
    }
    console.log(Platform.OS);
    if (Platform.OS === "ios") {
      const platform = "ios";
      dispatch(setPlatform(platform)).then((response) => {
        console.log(response);
      });
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
    }).start();

    Animated.timing(Spin, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    if (enteredPin.length > 0) {
      setShowRemoveButton(true);
    } else {
      setShowRemoveButton(false);
    }
    if (enteredPin.length === 6) {
      setShowCompletedButton(true);
      // change start
         const Pin = await AsyncStorage.getItem("pin");
                    if (JSON.parse(Pin) === enteredPin) {
                      try {
                        setPinViewVisible(false);
                        setLoader(true);
                        setLoading(true);
                        const walletType = await AsyncStorage.getItem(
                          "walletType"
                        );
                        console.log(JSON.parse(walletType));
                        const Wallet = await state.wallet;
                        console.log(Wallet);
                        if (JSON.parse(walletType) === "Ethereum") {
                          if (Wallet) {
                            if (coin0.symbol === "WETH") {
                              await SwapEthForTokens(
                                Wallet.privateKey,
                                Wallet.address,
                                coin1.address,
                                amount
                              )
                                .then(async (response) => {
                                  console.log(response);
                                  if (response) {
                                    if (response.code === 400) {
                                      return alert(
                                        "errro",
                                        "server error please try again"
                                      );
                                    } else if (response.code === 401) {
                                      console.log(response);
                                      const type = "Swap";
                                      const wallettype = JSON.parse(walletType);
                                      const chainType = "Eth";
                                      await SaveTransaction(
                                        type,
                                        response.tx.transactionHash,
                                        wallettype,
                                        chainType
                                      )
                                        .then((resp) => {
                                          setLoader(false);
                                          setLoading(false);
                                          setTradeVisible(false);
                                          setModalVisible(false);
                                          setPinViewVisible(false);
                                          getAllBalances(state,dispatch)
                                          alert(
                                            "success",
                                            "Your Tx Hash : " +
                                              response.tx.transactionHash
                                          );
                                          navigation.navigate("Transactions");
                                        })
                                        .catch((e) => {
                                          setLoading(false);
                                          setLoader(false);
                                          setPinViewVisible(false);
                                          alert("error", e.message);
                                          console.log(e);
                                        });
                                    } else if (response.code === 404) {
                                      setLoading(false);
                                      setLoader(false);
                                      setTradeVisible(false);
                                      setPinViewVisible(false);
                                      return alert("error", "pair not found");
                                    } else {
                                      setLoading(false);
                                      setLoader(false);
                                      setTradeVisible(false);
                                      setPinViewVisible(false);
                                      return alert("error", response);
                                    }
                                  } else {
                                    setLoading(false);
                                    setLoader(false);
                                    setTradeVisible(false);
                                    setPinViewVisible(false);
                                    return alert("error", "server error");
                                  }
                                })
                                .catch((e) => {
                                  setLoading(false);
                                  setLoader(false);
                                  setTradeVisible(false);
                                  setPinViewVisible(false);
                                  alert("error", e.message);
                                  console.log(e);
                                });
                            } else if (coin1.symbol === "WETH") {
                              await UniSwap(
                                Wallet.privateKey,
                                Wallet.address,
                                coin0.address,
                                amount
                              )
                                .then(async (response) => {
                                  console.log(response);
                                  if (response) {
                                    if (response.code === 401) {
                                      console.log(
                                        "Your Tx Hash : " + response.tx
                                      );
                                      const type = "Swap";
                                      const wallettype = JSON.parse(walletType);
                                      const chainType = "Eth";
                                      await SaveTransaction(
                                        type,
                                        response.tx,
                                        wallettype,
                                        chainType
                                      )
                                        .then((resp) => {
                                          setLoading(false);
                                          setLoader(false);
                                          setTradeVisible(false);
                                          setModalVisible(false);
                                          setPinViewVisible(false);
                                          alert(
                                            "success",
                                            "Your Tx Hash : " + response.tx
                                          );
                                          getAllBalances(state,dispatch)
  
                                          navigation.navigate("Transactions");
                                        })
                                        .catch((e) => {
                                          setLoading(false);
                                          setLoader(false);
                                          setTradeVisible(false);
                                          setPinViewVisible(false);
                                          alert("error", e.message);
                                          console.log(e);
                                        });
                                    } else if (response.code === 400) {
                                      setPinViewVisible(false);
                                      setLoader(false);
                                      return alert(
                                        "error",
                                        "error while swapping. please try again"
                                      );
                                    } else if (response === 404) {
                                      setLoading(false);
                                      setLoader(false);
                                      setTradeVisible(false);
                                      setPinViewVisible(false);
                                      return alert("error", "pair not found");
                                    } else {
                                      setLoading(false);
                                      setLoader(false);
                                      setTradeVisible(false);
                                      setPinViewVisible(false);
                                      return alert("error", response);
                                    }
                                  } else {
                                    setLoading(false);
                                    setLoader(false);
                                    setTradeVisible(false);
                                    setPinViewVisible(false);
                                    return alert("error", "server error");
                                  }
                                })
                                .catch((e) => {
                                  setLoading(false);
                                  setLoader(false);
                                  setTradeVisible(false);
                                  setPinViewVisible(false);
                                  alert("error", e.message);
                                  console.log(e);
                                });
                            } else {
                              await SwapTokensToTokens(
                                Wallet.privateKey,
                                Wallet.address,
                                coin0.address,
                                coin1.address,
                                amount
                              )
                                .then(async (response) => {
                                  console.log(response);
                                  if (response) {
                                    if (response.code == 401) {
                                      console.log(response);
                                      const type = "Swap";
                                      const wallettype = JSON.parse(walletType);
                                      const chainType = "Eth";
                                      const saveTransaction =
                                        await SaveTransaction(
                                          type,
                                          response.tx,
                                          wallettype,
                                          chainType
                                        )
                                          .then((resp) => {
                                            setLoading(false);
                                            setLoader(false);
                                            setTradeVisible(false);
                                            setModalVisible(false);
                                            setPinViewVisible(false);
                                            alert(
                                              "sucess",
                                              "Your Tx Hash : " + response.tx
                                            );
                                            getAllBalances(state,dispatch)
  
                                            navigation.navigate("Transactions");
                                          })
                                          .catch((e) => {
                                            setLoading(false);
                                            setLoader(false);
                                            setTradeVisible(false);
                                            setPinViewVisible(false);
                                            alert("error", e.message);
                                            console.log(e);
                                          });
                                    } else if (response === 404) {
                                      setLoading(false);
                                      setLoader(false);
                                      setTradeVisible(false);
                                      setPinViewVisible(false);
                                      return alert("error", "pair not found");
                                    } else {
                                      setLoading(false);
                                      setLoader(false);
                                      setTradeVisible(false);
                                      setPinViewVisible(false);
                                      return alert("error", response);
                                    }
                                  } else {
                                    setLoading(false);
                                    setLoader(false);
                                    setTradeVisible(false);
                                    setPinViewVisible(false);
                                    return alert("error", "server error");
                                  }
                                })
                                .catch((e) => {
                                  setLoader(false);
                                  setLoading(false);
                                  setTradeVisible(false);
                                  setPinViewVisible(false);
                                  alert("error", e.message);
                                  console.log(e);
                                });
                            }
                          } else {
                            setLoading(false);
                            setLoader(false);
                            setPinViewVisible(false);
                            alert("error", "no wallets found");
                          }
                        } else if (JSON.parse(walletType) === "BSC") {
                          const swap = await pancakeSwap(Wallet.privateKey);
                          setLoading(false);
                          setLoader(false);
                          setModalVisible(false);
                          setTradeVisible(false);
                          setPinViewVisible(false);
                          getAllBalances(state,dispatch)
  
                        } else if (JSON.parse(walletType) === "Multi-coin") {
                          if (swapType === "ETH") {
                            if (Wallet) {
                              if (coin0.symbol === "WETH") {
                                await SwapEthForTokens(
                                  Wallet.privateKey,
                                  Wallet.address,
                                  coin1.address,
                                  amount
                                )
                                  .then(async (response) => {
                                    console.log(response);
                                    if (response) {
                                      if (response.code === 400) {
                                        setPinViewVisible(false);
                                        return alert(
                                          "error",
                                          "server error please try again"
                                        );
                                      } else if (response.code === 401) {
                                        console.log(response);
                                        const type = "Swap";
                                        const wallettype = JSON.parse(walletType);
                                        const chainType = "Eth";
                                        await SaveTransaction(
                                          type,
                                          response.tx.transactionHash,
                                          wallettype,
                                          chainType
                                        )
                                          .then((resp) => {
                                            setLoading(false);
                                            setLoader(false);
                                            setTradeVisible(false);
                                            setModalVisible(false);
                                            setPinViewVisible(false);
                                            alert(
                                              "success",
                                              "Your Tx Hash : " +
                                                response.tx.transactionHash
                                            );
                                            getAllBalances(state,dispatch)
  
                                            navigation.navigate("Transactions");
                                          })
                                          .catch((e) => {
                                            setLoading(false);
                                            setLoader(false);
                                            setPinViewVisible(false);
                                            alert("error", e.message);
                                            console.log(e);
                                          });
                                      } else if (response.code === 404) {
                                        setLoading(false);
                                        setLoader(false);
                                        setTradeVisible(false);
                                        setPinViewVisible(false);
                                        return alert("error", "pair not found");
                                      } else {
                                        setLoading(false);
                                        setLoader(false);
                                        setTradeVisible(false);
                                        setPinViewVisible(false);
                                        return alert("error", response.message);
                                      }
                                    } else {
                                      setLoading(false);
                                      setLoader(false);
                                      setTradeVisible(false);
                                      setPinViewVisible(false);
                                      return alert(
                                        "error",
                                        response
                                          ? response.message
                                          : "server error"
                                      );
                                    }
                                  })
                                  .catch((e) => {
                                    setLoading(false);
                                    setLoader(false);
                                    setTradeVisible(false);
                                    setPinViewVisible(false);
                                    alert("error", e.message);
                                    console.log(e);
                                  });
                              } else if (coin1.symbol === "WETH") {
                                await UniSwap(
                                  Wallet.privateKey,
                                  Wallet.address,
                                  coin0.address,
                                  amount
                                )
                                  .then(async (response) => {
                                    console.log(response);
                                    if (response) {
                                      if (response.code === 401) {
                                        console.log(
                                          "success",
                                          "Your Tx Hash : " + response.tx
                                        );
                                        const type = "Swap";
                                        const wallettype = JSON.parse(walletType);
                                        const chainType = "Eth";
                                        await SaveTransaction(
                                          type,
                                          response.tx,
                                          wallettype,
                                          chainType
                                        )
                                          .then((resp) => {
                                            setLoading(false);
                                            setTradeVisible(false);
                                            setModalVisible(false);
                                            setPinViewVisible(false);
                                            setLoader(false);
                                            alert(
                                              "success",
                                              "Your Tx Hash : " + response.tx
                                            );
                                            getAllBalances(state,dispatch)
  
                                            navigation.navigate("Transactions");
                                          })
                                          .catch((e) => {
                                            setLoading(false);
                                            setLoader(false);
                                            setTradeVisible(false);
                                            setPinViewVisible(false);
                                            alert("error", e.message);
                                            console.log(e);
                                          });
                                      } else if (response.code === 400) {
                                        setPinViewVisible(false);
                                        setLoader(false);
                                        return alert(
                                          "error",
                                          "error while swapping. please try again"
                                        );
                                      } else if (response === 404) {
                                        setLoading(false);
                                        setLoader(false);
                                        setTradeVisible(false);
                                        setPinViewVisible(false);
                                        return alert("error", "pair not found");
                                      } else {
                                        setLoading(false);
                                        setLoader(false);
                                        setTradeVisible(false);
                                        setPinViewVisible(false);
                                        return alert("error", response);
                                      }
                                    } else {
                                      setLoading(false);
                                      setLoader(false);
                                      setTradeVisible(false);
                                      setPinViewVisible(false);
                                      return alert("error", "server error");
                                    }
                                  })
                                  .catch((e) => {
                                    setLoading(false);
                                    setLoader(false);
                                    setTradeVisible(false);
                                    setPinViewVisible(false);
                                    alert("error", e.message);
                                    console.log(e);
                                  });
                              } else {
                                await SwapTokensToTokens(
                                  Wallet.privateKey,
                                  Wallet.address,
                                  coin0.address,
                                  coin1.address,
                                  amount
                                )
                                  .then(async (response) => {
                                    console.log(response);
                                    if (response) {
                                      if (response.code == 401) {
                                        console.log(response);
                                        const type = "Swap";
                                        const wallettype = JSON.parse(walletType);
                                        const chainType = "Eth";
                                        const saveTransaction =
                                          await SaveTransaction(
                                            type,
                                            response.tx,
                                            wallettype,
                                            chainType
                                          )
                                            .then((resp) => {
                                              setLoading(false);
                                              setLoader(false);
                                              setTradeVisible(false);
                                              setModalVisible(false);
                                              setPinViewVisible(false);
                                              alert(
                                                "error",
                                                "Your Tx Hash : " + response.tx
                                              );
                                              getAllBalances(state,dispatch)
  
                                              navigation.navigate("Transactions");
                                            })
                                            .catch((e) => {
                                              setLoading(false);
                                              setLoader(false);
                                              setTradeVisible(false);
                                              setPinViewVisible(false);
                                              alert("error", e.message);
                                              console.log(e);
                                            });
                                      } else if (response === 404) {
                                        setLoading(false);
                                        setLoader(false);
                                        setTradeVisible(false);
                                        setPinViewVisible(false);
                                        return alert("error", "pair not found");
                                      } else {
                                        setLoading(false);
                                        setLoader(false);
                                        setTradeVisible(false);
                                        setPinViewVisible(false);
                                        return alert("error", response);
                                      }
                                    } else {
                                      setLoading(false);
                                      setLoader(false);
                                      setTradeVisible(false);
                                      setPinViewVisible(false);
                                      return alert("error", "server error");
                                    }
                                  })
                                  .catch((e) => {
                                    setLoading(false);
                                    setLoader(false);
                                    setTradeVisible(false);
                                    setPinViewVisible(false);
                                    alert("error", e.message);
                                    console.log(e);
                                  });
                              }
                            } else {
                              setLoading(false);
                              setLoader(false);
                              setPinViewVisible(false);
                              alert("error", "no wallets found");
                            }
                          } else if (swapType === "BSC") {
                            const swap = await pancakeSwap(Wallet.privateKey);
                            setLoading(false);
                            setLoader(false);
                            setModalVisible(false);
                            setTradeVisible(false);
                            setPinViewVisible(false);
                            getAllBalances(state,dispatch)
  
                          }
                        }
                      } catch (e) {
                        setLoading(false);
                        setLoader(false);
                        setTradeVisible(false);
                        setPinViewVisible(false);
                        alert("error", e.message);
                        console.log(e);
                      }
                    } else {
                      setLoader(false);
                      setLoading(false);
                      alert("error", "Incorrect pin try again.");
                      pinView.current.clearAll();//for clear the pin when pin worng.
                    }
                  
       ///////change end
    } else {
      setShowCompletedButton(false);
    }
  }, [fadeAnim, enteredPin]);

  return (
    <Modal
      animationIn="fadeInUpBig"
      animationOut="fadeOutDownBig"
      animationInTiming={500}
      animationOutTiming={650}
      isVisible={pinViewVisible}
      useNativeDriver={true}
      statusBarTranslucent={true}
      onBackdropPress={() => setPinViewVisible(false)}
      onBackButtonPress={() => {
        setPinViewVisible(false);
      }}
    >
      <Animated.View // Special animatable View
        style={{ opacity: fadeAnim }}
      >
        <View style={style.Body}>
          <Animated.Image
            style={{
              width: wp("12"),
              height: hp("12"),
              padding: 30,
              marginTop: hp(19),
              transform: [{ rotate: SpinValue }],
            }}
            source={darkBlue}
          />
          <Text style={style.welcomeText}> Hi,</Text>
          <Text style={style.welcomeText1}>
            {" "}
            {status == "verify"
              ? "Please re enter pin"
              : status === "pinset"
              ? "Please enter your pin"
              : "Please create a pin"}
          </Text>
          <View style={{ marginTop: hp(5) }}>
            {loader ? <SwapLoadingComponent /> : <View></View>}

            <ReactNativePinView
                inputSize={23}
                ref={pinView}
                pinLength={6}
                buttonSize={60}
                // customLeftButtonViewStyle={{backgroundColor:'gray'}}
                onValueChange={(value) => setEnteredPin(value)}
                buttonAreaStyle={{
                  marginTop: 24,
                }}
                inputAreaStyle={{
                  marginBottom: 24,
                }}
                inputViewEmptyStyle={{
                  backgroundColor: "transparent",
                  borderWidth: 1,
                  borderColor: "#fff",
                }}
                inputViewFilledStyle={{
                  backgroundColor: "#fff",
                }}
                // buttonViewStyle={{
                //   borderWidth: 1,
                //   borderColor: "#FFF",
                // }}
                buttonTextStyle={{
                  color: "#fff",
                }}
              onButtonPress={async (key) => {
                if (key === "custom_left") {
                  pinView.current.clear();
                }
                ////////////old
                // if (key === "custom_right") {
                //   const Pin = await AsyncStorage.getItem("pin");

                //   if (JSON.parse(Pin) === enteredPin) {
                //     try {
                //       setPinViewVisible(false);
                //       setLoader(true);
                //       setLoading(true);
                //       const walletType = await AsyncStorage.getItem(
                //         "walletType"
                //       );
                //       console.log(JSON.parse(walletType));
                //       const Wallet = await state.wallet;
                //       console.log(Wallet);
                //       if (JSON.parse(walletType) === "Ethereum") {
                //         if (Wallet) {
                //           if (coin0.symbol === "WETH") {
                //             await SwapEthForTokens(
                //               Wallet.privateKey,
                //               Wallet.address,
                //               coin1.address,
                //               amount
                //             )
                //               .then(async (response) => {
                //                 console.log(response);
                //                 if (response) {
                //                   if (response.code === 400) {
                //                     return alert(
                //                       "errro",
                //                       "server error please try again"
                //                     );
                //                   } else if (response.code === 401) {
                //                     console.log(response);
                //                     const type = "Swap";
                //                     const wallettype = JSON.parse(walletType);
                //                     const chainType = "Eth";
                //                     await SaveTransaction(
                //                       type,
                //                       response.tx.transactionHash,
                //                       wallettype,
                //                       chainType
                //                     )
                //                       .then((resp) => {
                //                         setLoader(false);
                //                         setLoading(false);
                //                         setTradeVisible(false);
                //                         setModalVisible(false);
                //                         setPinViewVisible(false);
                //                         getAllBalances(state,dispatch)
                //                         alert(
                //                           "success",
                //                           "Your Tx Hash : " +
                //                             response.tx.transactionHash
                //                         );
                //                         navigation.navigate("Transactions");
                //                       })
                //                       .catch((e) => {
                //                         setLoading(false);
                //                         setLoader(false);
                //                         setPinViewVisible(false);
                //                         alert("error", e.message);
                //                         console.log(e);
                //                       });
                //                   } else if (response.code === 404) {
                //                     setLoading(false);
                //                     setLoader(false);
                //                     setTradeVisible(false);
                //                     setPinViewVisible(false);
                //                     return alert("error", "pair not found");
                //                   } else {
                //                     setLoading(false);
                //                     setLoader(false);
                //                     setTradeVisible(false);
                //                     setPinViewVisible(false);
                //                     return alert("error", response);
                //                   }
                //                 } else {
                //                   setLoading(false);
                //                   setLoader(false);
                //                   setTradeVisible(false);
                //                   setPinViewVisible(false);
                //                   return alert("error", "server error");
                //                 }
                //               })
                //               .catch((e) => {
                //                 setLoading(false);
                //                 setLoader(false);
                //                 setTradeVisible(false);
                //                 setPinViewVisible(false);
                //                 alert("error", e.message);
                //                 console.log(e);
                //               });
                //           } else if (coin1.symbol === "WETH") {
                //             await UniSwap(
                //               Wallet.privateKey,
                //               Wallet.address,
                //               coin0.address,
                //               amount
                //             )
                //               .then(async (response) => {
                //                 console.log(response);
                //                 if (response) {
                //                   if (response.code === 401) {
                //                     console.log(
                //                       "Your Tx Hash : " + response.tx
                //                     );
                //                     const type = "Swap";
                //                     const wallettype = JSON.parse(walletType);
                //                     const chainType = "Eth";
                //                     await SaveTransaction(
                //                       type,
                //                       response.tx,
                //                       wallettype,
                //                       chainType
                //                     )
                //                       .then((resp) => {
                //                         setLoading(false);
                //                         setLoader(false);
                //                         setTradeVisible(false);
                //                         setModalVisible(false);
                //                         setPinViewVisible(false);
                //                         alert(
                //                           "success",
                //                           "Your Tx Hash : " + response.tx
                //                         );
                //                         getAllBalances(state,dispatch)

                //                         navigation.navigate("Transactions");
                //                       })
                //                       .catch((e) => {
                //                         setLoading(false);
                //                         setLoader(false);
                //                         setTradeVisible(false);
                //                         setPinViewVisible(false);
                //                         alert("error", e.message);
                //                         console.log(e);
                //                       });
                //                   } else if (response.code === 400) {
                //                     setPinViewVisible(false);
                //                     setLoader(false);
                //                     return alert(
                //                       "error",
                //                       "error while swapping. please try again"
                //                     );
                //                   } else if (response === 404) {
                //                     setLoading(false);
                //                     setLoader(false);
                //                     setTradeVisible(false);
                //                     setPinViewVisible(false);
                //                     return alert("error", "pair not found");
                //                   } else {
                //                     setLoading(false);
                //                     setLoader(false);
                //                     setTradeVisible(false);
                //                     setPinViewVisible(false);
                //                     return alert("error", response);
                //                   }
                //                 } else {
                //                   setLoading(false);
                //                   setLoader(false);
                //                   setTradeVisible(false);
                //                   setPinViewVisible(false);
                //                   return alert("error", "server error");
                //                 }
                //               })
                //               .catch((e) => {
                //                 setLoading(false);
                //                 setLoader(false);
                //                 setTradeVisible(false);
                //                 setPinViewVisible(false);
                //                 alert("error", e.message);
                //                 console.log(e);
                //               });
                //           } else {
                //             await SwapTokensToTokens(
                //               Wallet.privateKey,
                //               Wallet.address,
                //               coin0.address,
                //               coin1.address,
                //               amount
                //             )
                //               .then(async (response) => {
                //                 console.log(response);
                //                 if (response) {
                //                   if (response.code == 401) {
                //                     console.log(response);
                //                     const type = "Swap";
                //                     const wallettype = JSON.parse(walletType);
                //                     const chainType = "Eth";
                //                     const saveTransaction =
                //                       await SaveTransaction(
                //                         type,
                //                         response.tx,
                //                         wallettype,
                //                         chainType
                //                       )
                //                         .then((resp) => {
                //                           setLoading(false);
                //                           setLoader(false);
                //                           setTradeVisible(false);
                //                           setModalVisible(false);
                //                           setPinViewVisible(false);
                //                           alert(
                //                             "sucess",
                //                             "Your Tx Hash : " + response.tx
                //                           );
                //                           getAllBalances(state,dispatch)

                //                           navigation.navigate("Transactions");
                //                         })
                //                         .catch((e) => {
                //                           setLoading(false);
                //                           setLoader(false);
                //                           setTradeVisible(false);
                //                           setPinViewVisible(false);
                //                           alert("error", e.message);
                //                           console.log(e);
                //                         });
                //                   } else if (response === 404) {
                //                     setLoading(false);
                //                     setLoader(false);
                //                     setTradeVisible(false);
                //                     setPinViewVisible(false);
                //                     return alert("error", "pair not found");
                //                   } else {
                //                     setLoading(false);
                //                     setLoader(false);
                //                     setTradeVisible(false);
                //                     setPinViewVisible(false);
                //                     return alert("error", response);
                //                   }
                //                 } else {
                //                   setLoading(false);
                //                   setLoader(false);
                //                   setTradeVisible(false);
                //                   setPinViewVisible(false);
                //                   return alert("error", "server error");
                //                 }
                //               })
                //               .catch((e) => {
                //                 setLoader(false);
                //                 setLoading(false);
                //                 setTradeVisible(false);
                //                 setPinViewVisible(false);
                //                 alert("error", e.message);
                //                 console.log(e);
                //               });
                //           }
                //         } else {
                //           setLoading(false);
                //           setLoader(false);
                //           setPinViewVisible(false);
                //           alert("error", "no wallets found");
                //         }
                //       } else if (JSON.parse(walletType) === "BSC") {
                //         const swap = await pancakeSwap(Wallet.privateKey);
                //         setLoading(false);
                //         setLoader(false);
                //         setModalVisible(false);
                //         setTradeVisible(false);
                //         setPinViewVisible(false);
                //         getAllBalances(state,dispatch)

                //       } else if (JSON.parse(walletType) === "Multi-coin") {
                //         if (swapType === "ETH") {
                //           if (Wallet) {
                //             if (coin0.symbol === "WETH") {
                //               await SwapEthForTokens(
                //                 Wallet.privateKey,
                //                 Wallet.address,
                //                 coin1.address,
                //                 amount
                //               )
                //                 .then(async (response) => {
                //                   console.log(response);
                //                   if (response) {
                //                     if (response.code === 400) {
                //                       setPinViewVisible(false);
                //                       return alert(
                //                         "error",
                //                         "server error please try again"
                //                       );
                //                     } else if (response.code === 401) {
                //                       console.log(response);
                //                       const type = "Swap";
                //                       const wallettype = JSON.parse(walletType);
                //                       const chainType = "Eth";
                //                       await SaveTransaction(
                //                         type,
                //                         response.tx.transactionHash,
                //                         wallettype,
                //                         chainType
                //                       )
                //                         .then((resp) => {
                //                           setLoading(false);
                //                           setLoader(false);
                //                           setTradeVisible(false);
                //                           setModalVisible(false);
                //                           setPinViewVisible(false);
                //                           alert(
                //                             "success",
                //                             "Your Tx Hash : " +
                //                               response.tx.transactionHash
                //                           );
                //                           getAllBalances(state,dispatch)

                //                           navigation.navigate("Transactions");
                //                         })
                //                         .catch((e) => {
                //                           setLoading(false);
                //                           setLoader(false);
                //                           setPinViewVisible(false);
                //                           alert("error", e.message);
                //                           console.log(e);
                //                         });
                //                     } else if (response.code === 404) {
                //                       setLoading(false);
                //                       setLoader(false);
                //                       setTradeVisible(false);
                //                       setPinViewVisible(false);
                //                       return alert("error", "pair not found");
                //                     } else {
                //                       setLoading(false);
                //                       setLoader(false);
                //                       setTradeVisible(false);
                //                       setPinViewVisible(false);
                //                       return alert("error", response.message);
                //                     }
                //                   } else {
                //                     setLoading(false);
                //                     setLoader(false);
                //                     setTradeVisible(false);
                //                     setPinViewVisible(false);
                //                     return alert(
                //                       "error",
                //                       response
                //                         ? response.message
                //                         : "server error"
                //                     );
                //                   }
                //                 })
                //                 .catch((e) => {
                //                   setLoading(false);
                //                   setLoader(false);
                //                   setTradeVisible(false);
                //                   setPinViewVisible(false);
                //                   alert("error", e.message);
                //                   console.log(e);
                //                 });
                //             } else if (coin1.symbol === "WETH") {
                //               await UniSwap(
                //                 Wallet.privateKey,
                //                 Wallet.address,
                //                 coin0.address,
                //                 amount
                //               )
                //                 .then(async (response) => {
                //                   console.log(response);
                //                   if (response) {
                //                     if (response.code === 401) {
                //                       console.log(
                //                         "success",
                //                         "Your Tx Hash : " + response.tx
                //                       );
                //                       const type = "Swap";
                //                       const wallettype = JSON.parse(walletType);
                //                       const chainType = "Eth";
                //                       await SaveTransaction(
                //                         type,
                //                         response.tx,
                //                         wallettype,
                //                         chainType
                //                       )
                //                         .then((resp) => {
                //                           setLoading(false);
                //                           setTradeVisible(false);
                //                           setModalVisible(false);
                //                           setPinViewVisible(false);
                //                           setLoader(false);
                //                           alert(
                //                             "success",
                //                             "Your Tx Hash : " + response.tx
                //                           );
                //                           getAllBalances(state,dispatch)

                //                           navigation.navigate("Transactions");
                //                         })
                //                         .catch((e) => {
                //                           setLoading(false);
                //                           setLoader(false);
                //                           setTradeVisible(false);
                //                           setPinViewVisible(false);
                //                           alert("error", e.message);
                //                           console.log(e);
                //                         });
                //                     } else if (response.code === 400) {
                //                       setPinViewVisible(false);
                //                       setLoader(false);
                //                       return alert(
                //                         "error",
                //                         "error while swapping. please try again"
                //                       );
                //                     } else if (response === 404) {
                //                       setLoading(false);
                //                       setLoader(false);
                //                       setTradeVisible(false);
                //                       setPinViewVisible(false);
                //                       return alert("error", "pair not found");
                //                     } else {
                //                       setLoading(false);
                //                       setLoader(false);
                //                       setTradeVisible(false);
                //                       setPinViewVisible(false);
                //                       return alert("error", response);
                //                     }
                //                   } else {
                //                     setLoading(false);
                //                     setLoader(false);
                //                     setTradeVisible(false);
                //                     setPinViewVisible(false);
                //                     return alert("error", "server error");
                //                   }
                //                 })
                //                 .catch((e) => {
                //                   setLoading(false);
                //                   setLoader(false);
                //                   setTradeVisible(false);
                //                   setPinViewVisible(false);
                //                   alert("error", e.message);
                //                   console.log(e);
                //                 });
                //             } else {
                //               await SwapTokensToTokens(
                //                 Wallet.privateKey,
                //                 Wallet.address,
                //                 coin0.address,
                //                 coin1.address,
                //                 amount
                //               )
                //                 .then(async (response) => {
                //                   console.log(response);
                //                   if (response) {
                //                     if (response.code == 401) {
                //                       console.log(response);
                //                       const type = "Swap";
                //                       const wallettype = JSON.parse(walletType);
                //                       const chainType = "Eth";
                //                       const saveTransaction =
                //                         await SaveTransaction(
                //                           type,
                //                           response.tx,
                //                           wallettype,
                //                           chainType
                //                         )
                //                           .then((resp) => {
                //                             setLoading(false);
                //                             setLoader(false);
                //                             setTradeVisible(false);
                //                             setModalVisible(false);
                //                             setPinViewVisible(false);
                //                             alert(
                //                               "error",
                //                               "Your Tx Hash : " + response.tx
                //                             );
                //                             getAllBalances(state,dispatch)

                //                             navigation.navigate("Transactions");
                //                           })
                //                           .catch((e) => {
                //                             setLoading(false);
                //                             setLoader(false);
                //                             setTradeVisible(false);
                //                             setPinViewVisible(false);
                //                             alert("error", e.message);
                //                             console.log(e);
                //                           });
                //                     } else if (response === 404) {
                //                       setLoading(false);
                //                       setLoader(false);
                //                       setTradeVisible(false);
                //                       setPinViewVisible(false);
                //                       return alert("error", "pair not found");
                //                     } else {
                //                       setLoading(false);
                //                       setLoader(false);
                //                       setTradeVisible(false);
                //                       setPinViewVisible(false);
                //                       return alert("error", response);
                //                     }
                //                   } else {
                //                     setLoading(false);
                //                     setLoader(false);
                //                     setTradeVisible(false);
                //                     setPinViewVisible(false);
                //                     return alert("error", "server error");
                //                   }
                //                 })
                //                 .catch((e) => {
                //                   setLoading(false);
                //                   setLoader(false);
                //                   setTradeVisible(false);
                //                   setPinViewVisible(false);
                //                   alert("error", e.message);
                //                   console.log(e);
                //                 });
                //             }
                //           } else {
                //             setLoading(false);
                //             setLoader(false);
                //             setPinViewVisible(false);
                //             alert("error", "no wallets found");
                //           }
                //         } else if (swapType === "BSC") {
                //           const swap = await pancakeSwap(Wallet.privateKey);
                //           setLoading(false);
                //           setLoader(false);
                //           setModalVisible(false);
                //           setTradeVisible(false);
                //           setPinViewVisible(false);
                //           getAllBalances(state,dispatch)

                //         }
                //       }
                //     } catch (e) {
                //       setLoading(false);
                //       setLoader(false);
                //       setTradeVisible(false);
                //       setPinViewVisible(false);
                //       alert("error", e.message);
                //       console.log(e);
                //     }
                //   } else {
                //     setLoader(false);
                //     setLoading(false);
                //     alert("error", "invalid pin.please try again!");
                //     pinView.current.clearAll();//for clear the pin when pin worng.
                //   }
                // }
              }}
              customLeftButton={
                showRemoveButton ? (
                  <Icon name={"ios-backspace"} size={36} color={"gray"} />
                ) : undefined
              }
              customRightButton={
                showCompletedButton ? (
                  <Icon name={"ios-chevron-forward-circle"} size={36} color={"#FFF"} />
                ) : undefined
              }
            />
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default SwapPinModal;

const style = StyleSheet.create({
  Body: {
    display: "flex",
    backgroundColor: "#131E3A",
    height: hp(100),
    width: wp(100),
    alignItems: "center",
    textAlign: "center",
    borderRadius: hp(2),
    alignSelf: "center",
  },
  welcomeText: {
    fontSize: 19,
    fontWeight: "200",
    color: "white",
    // marginTop: hp(2),
  },
  welcomeText1: {
    fontSize: 19,
    fontWeight: "200",
    color: "white",
    marginTop: hp(1),
  },
  welcomeText2: {
    fontSize: 20,
    fontWeight: "200",
    color: "white",
    marginTop: hp(10),
  },
  Button: {
    marginTop: hp(20),
  },
  tinyLogo: {
    width: wp("5"),
    height: hp("5"),
    padding: 30,
    marginTop: hp(10),
  },
  Text: {
    marginTop: hp(5),
    fontSize: 15,
    fontWeight: "200",
    color: "white",
  },
});
