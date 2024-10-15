const xrpl = require("xrpl");
import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AddToAllWallets } from "../../components/Redux/actions/auth";
import { urls } from "../constants";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import "@ethersproject/shims";
import { ethers } from "ethers";
import Modal from "react-native-modal";
import { useNavigation } from "@react-navigation/native";
import ModalHeader from "../reusables/ModalHeader";
import { utils } from "xrpl-accountlib";
import { alert } from "../reusables/Toasts";
import { Paste } from "../../utilities/utilities";
import * as Clipboard from "@react-native-clipboard/clipboard";
import Icon from "../../icon";

const ImportXrpWalletModal = ({
  props,
  setWalletVisible,
  Visible,
  setModalVisible,
  onCrossPress
}) => {
  const [loading, setLoading] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [visible, setVisible] = useState(false);
  const [Wallet, setWallet] = useState();
  const [label, setLabel] = useState("mnemonic");
  const [privateKey, setPrivateKey] = useState();
  const [optionVisible, setOptionVisible] = useState(false);
  const [provider, setProvider] = useState("");
  const [text, setText] = useState("");
  const [disable, setDisable] = useState(true);
  const [message, setMessage] = useState("");

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const Spin = new Animated.Value(0);

  async function saveUserDetails(address) {
    let response;
    const user = await AsyncStorageLib.getItem("user");
    console.log(user);
    const token = await AsyncStorageLib.getItem("token");
    try {
      response = await fetch(`http://${urls.testUrl}/user/saveUserDetails`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          user: user,
          walletAddress: address,
          accountName: accountName,
        }),
      })
        .then((response) => response.json())
        .then(async (responseJson) => {
          if (responseJson.responseCode === 200) {
            alert("success");
            return responseJson.responseCode;
          } else if (responseJson.responseCode === 400) {
            alert(
              "account with same name already exists. Please use a different name"
            );
            return responseJson.responseCode;
          } else {
            alert("Unable to create account. Please try again");
            return 401;
          }
        })
        .catch((error) => {
          alert(error);
        });
    } catch (e) {
      console.log(e);
      alert(e);
    }
    console.log(response);
    return response;
  }

  const closeModal = () => {
    setWalletVisible(false);
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
    }).start();

    Animated.timing(Spin, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, Spin]);

  useEffect(() => {
    if (!accountName) {
      setDisable(true)
    }
    if (accountName && (mnemonic || privateKey)) {
      let valid
      if (label === 'mnemonic') {
        const phrase = mnemonic.trimStart();
        const trimmedPhrase = phrase.trimEnd();
        valid = utils.isValidMnemnic(trimmedPhrase);
        if (!valid) {
          setMessage('Please enter a valid mnemonic')
        }
        else {
          setMessage('')
        }

      } else if (label === 'privateKey') {

        valid = utils.isValidSeed(privateKey)
        if (!valid) {
          setMessage('Please enter a valid private key')
        }
      } else if (label === "privateKey") {
        valid = utils.isValidSeed(privateKey);
        if (!valid) {
          setMessage("Please enter a valid private key");
        } else {
          setMessage("");
        }
        console.log(valid);
      } else {
        setMessage("");
      }

      if (accountName && (mnemonic || privateKey) && valid) {
        setDisable(false);
      } else {
        setDisable(true);
      }
    } else {
      setMessage("");
    }
  }, [mnemonic, privateKey, accountName])


  return (
    <Animated.View // Special animatable View
      style={{ opacity: fadeAnim }}
    >
      <Modal
        animationIn="slideInRight"
        animationOut="slideOutRight"
        animationInTiming={500}
        animationOutTiming={650}
        isVisible={Visible}
        useNativeDriver={true}
        // statusBarTranslucent={true}
        onBackdropPress={() => setWalletVisible(false)}
        onBackButtonPress={() => {
          setWalletVisible(false);
        }}
      >
        <View style={style.Body}>
          {/* <ModalHeader Function={closeModal} name={'XRP'}/> */}
          <Icon type={'entypo'} name='cross' size={24} color={'gray'} onPress={onCrossPress} style={style.crossIcon} />
          <Text style={style.text}>XRP Wallet</Text>

          <View style={style.Button}>
            <TouchableOpacity
              style={
                label == "mnemonic"
                  ? { ...style.tabBtns, borderColor: "#4CA6EA" }
                  : style.tabBtns
              }
              color={label == "mnemonic" ? "green" : "grey"}
              onPress={() => {
                setLabel("mnemonic");
                if (text) {
                  setMnemonic(text);
                }
                setOptionVisible(false);
              }}
            >
              <Text style={{ color: label == "mnemonic" ? "#4CA6EA" : "grey" }}>
                Mnemonic
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                label == "privateKey"
                  ? { ...style.tabBtns, borderColor: "#4CA6EA" }
                  : style.tabBtns
              }
              title={"privateKey"}
              color={label == "privateKey" ? "green" : "grey"}
              onPress={() => {
                setLabel("privateKey");
                if (text) {
                  setPrivateKey(text);
                }
                setOptionVisible(true);
              }}
            >
              <Text
                style={{ color: label == "privateKey" ? "#4CA6EA" : "grey" }}
              >
                PrivateKey
              </Text>
            </TouchableOpacity>
          </View>

          <View style={style.labelInputContainer}>
            <Text style={style.label}>Name</Text>

            <TextInput
              value={accountName}
              onChangeText={(text) => {
                setAccountName(text);
              }}
              style={{ width: wp("78%") }}
              placeholder={accountName ? accountName : "Wallet 1"}
              placeholderTextColor={"gray"}
            />
          </View>


          <View style={style.inputView}>
            <TouchableOpacity
              onPress={async () => {
                const text = await Clipboard.getStringAsync();
                // console.log(text)
                // setText(text)
                // setText('abc')
                console.log(label)
                if (label === 'mnemonic') {
                  // Paste(setMnemonic);
                  setMnemonic(text)
                  setText(text)
                } else if (label === 'privateKey') {
                  // Paste(setPrivateKey);
                  setPrivateKey(text)
                  setText(text)
                }
              }}
            >
              <Text style={style.paste}>Paste</Text>
            </TouchableOpacity>
            <Text>Phrase</Text>
            <TextInput
              style={style.input}
              value={text}
              onChangeText={(text) => {
                if (label === "mnemonic") {
                  setMnemonic(text);
                  setText(text);
                } else if (label === "privateKey") {
                  setPrivateKey(text);
                  setText(text);
                } else {
                  return alert(`please input ${label} to proceed `);
                }
              }}
              placeholder={
                label === "privateKey"
                  ? "Enter your private Key here"
                  : label === "JSON"
                    ? "Enter your secret JSON Key here"
                    : "Enter your secret phrase here"
              }
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="green" />
          ) : (
            <Text> </Text>
          )}
          <View
            style={{
              display: "flex",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "red" }}>{message}</Text>
          </View>

          <TouchableOpacity
            style={style.btn}
            disabled={disable||!accountName || !/\S/.test(accountName)?true:false}
            onPress={async () => {
              const user = await AsyncStorageLib.getItem("user");
              if (!accountName) {
                return alert("error", "Please enter an wallet name to proceed");
              }
              setLoading(true);
              if (label === "mnemonic") {
                try {
                  console.log("mnemonic" + mnemonic);
                  /*Wallet {
  "classicAddress": "rBF6yd1gkfBQ4DbgjjFb8eG2QNPHYGgyZH",
  "privateKey": "ED3C6A54C6B61A02CF1739FAA2E1D7CD2384CFB23ABE5B8C6C94E13552E196FA5C",
  "publicKey": "ED79A51B1B6CA6701A10143380A7B6520A23F900AE21F8CE2877BE62DAA84A7F17",
  "seed": "sEdTB7KBmtuNsMqGK5rTbUkgi5GXzWb",
} */

                  const phrase = mnemonic.trimStart();
                  const trimmedPhrase = phrase.trimEnd();

                  const xrpWalletFromM =
                    xrpl.Wallet.fromMnemonic(trimmedPhrase);
                  console.log(xrpWalletFromM);
                  const entropy = ethers.utils.mnemonicToEntropy(trimmedPhrase);
                  console.log(
                    "\t===> seed Created from mnemonic",
                    entropy.split("x")[1]
                  );
                  const xrpWallet = xrpl.Wallet.fromEntropy(
                    entropy.split("x")[1]
                  ); // This is suggested because we will get seeds also
                  console.log(xrpWallet); // Produces different addresses

                  const privateKey = xrpWallet.seed;
                  const wallet = {
                    classicAddress: xrpWallet.classicAddress,
                    address: xrpWallet.classicAddress,
                    privateKey: privateKey,
                  };
                  /* const response = await saveUserDetails(wallet.address).then(async (response)=>{
                      if(response===400){
                        return 
                      }
                     else if(response===401){
                        return 
                      }
                    }).catch((e)=>{
                      console.log(e)
                      setLoading(false)
                      setWalletVisible(false)
                      setVisible(false)
                      setModalVisible(false)


                    })*/
                  const accounts = {
                    classicAddress: wallet.classicAddress,
                    address: wallet.address,
                    privateKey: privateKey,
                    name: accountName,
                    wallets: [],
                  };
                  let wallets = [];
                  const data = await AsyncStorageLib.getItem(`${user}-wallets`)
                    .then((response) => {
                      console.log(response);
                      JSON.parse(response).map((item) => {
                        wallets.push(item);
                      });
                    })
                    .catch((e) => {
                      setWalletVisible(false);
                      setVisible(false);
                      setModalVisible(false);
                      console.log(e);
                    });

                  //wallets.push(accounts)
                  const allWallets = [
                    {
                      classicAddress: wallet.classicAddress,
                      address: wallet.classicAddress,
                      privateKey: privateKey,
                      name: accountName,
                      walletType: "Xrp",
                      wallets: wallets,
                    },
                  ];
                  // AsyncStorageLib.setItem(`${accountName}-wallets`,JSON.stringify(wallets))

                  dispatch(AddToAllWallets(allWallets, user)).then(
                    (response) => {
                      if (response) {
                        if (response.status === "Already Exists") {
                          alert(
                            "error",
                            "Account with same name already exists"
                          );
                          setLoading(false);
                          return;
                        } else if (response.status === "success") {
                          setTimeout(() => {
                            setLoading(false);
                            setWalletVisible(false);
                            setVisible(false);
                            setModalVisible(false);
                            navigation.navigate("AllWallets");
                          }, 0);
                        } else {
                          alert("error", "failed please try again");
                          return;
                        }
                      }
                    }
                  );

                  // dispatch(getBalance(wallet.address))
                  //dispatch(setProvider('https://data-seed-prebsc-1-s1.binance.org:8545'))
                } catch (e) {
                  console.log(e);
                  alert("error", e);
                  setLoading(false);
                  setWalletVisible(false);
                  setVisible(false);
                  setModalVisible(false);
                }
              } else {
                try {
                  console.log("hi" + privateKey);
                  const walletPrivateKey = xrpl.Wallet.fromSecret(privateKey);
                  console.log(walletPrivateKey);
                  const privatekey = walletPrivateKey.seed;
                  const wallet = {
                    address: walletPrivateKey.classicAddress,
                    privateKey: privatekey,
                    classicAddress: walletPrivateKey.classicAddress,
                  };
                  /* const response = await saveUserDetails(wallet.address).then(async (response)=>{
                      
                      if(response===400){
                        return 
                      }
                     else if(response===401){
                        return 
                      }
                    }).catch((e)=>{
                      console.log(e)
                      setLoading(false)
                      setWalletVisible(false)
                      setVisible(false)
                      setModalVisible(false)


                    })*/
                  const accounts = {
                    classicAddress: wallet.classicAddress,
                    address: wallet.address,
                    privateKey: privateKey,
                    name: accountName,
                    wallets: [],
                  };
                  let wallets = [];
                  const data = await AsyncStorageLib.getItem(`${user}-wallets`)
                    .then((response) => {
                      console.log(response);
                      JSON.parse(response).map((item) => {
                        wallets.push(item);
                      });
                    })
                    .catch((e) => {
                      setWalletVisible(false);
                      setVisible(false);
                      setModalVisible(false);
                      console.log(e);
                    });

                  //wallets.push(accounts)
                  const allWallets = [
                    {
                      classicAddress: wallet.classicAddress,
                      address: wallet.classicAddress,
                      privateKey: privateKey,
                      name: accountName,
                      walletType: "Xrp",
                      wallets: wallets,
                    },
                  ];
                  // AsyncStorageLib.setItem(`${accountName}-wallets`,JSON.stringify(wallets))

                  dispatch(AddToAllWallets(allWallets, user)).then(
                    (response) => {
                      if (response) {
                        if (response.status === "Already Exists") {
                          alert(
                            "error",
                            "Account with same name already exists"
                          );
                          setLoading(false);
                          return;
                        } else if (response.status === "success") {
                          setTimeout(() => {
                            setLoading(false);
                            setWalletVisible(false);
                            setVisible(false);
                            setModalVisible(false);
                            navigation.navigate("AllWallets");
                          }, 0);
                        } else {
                          alert("error", "failed please try again");
                          return;
                        }
                      }
                    }
                  );

                  // dispatch(getBalance(wallet.address))
                  //dispatch(setProvider('https://data-seed-prebsc-1-s1.binance.org:8545'))
                } catch (e) {
                  console.log(e);
                  setLoading(false);
                  setWalletVisible(false);
                  setVisible(false);
                  setModalVisible(false);
                  alert("error", e);
                }
              }

              setWalletVisible(false);
              setVisible(false);
              setModalVisible(false);
              setLoading(false);
            }}
          >
            <Text style={{ color: "white" }}>Import</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Animated.View>
  );
};

export default ImportXrpWalletModal;

const style = StyleSheet.create({
  Body: {
    backgroundColor: "white",
    height: hp(75),
    width: wp(97),
    textAlign: "center",
    alignSelf: "center",
    marginTop: hp(5),
    borderRadius: hp(1)
  },

  welcomeText: {
    fontSize: 15,
    fontWeight: "200",
    color: "black",
    marginLeft: 10,
  },
  welcomeText2: {
    fontSize: 15,
    fontWeight: "200",
    color: "white",
    marginTop: hp(1),
  },
  Button: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: wp(75),
    marginTop: hp(3),
    marginBottom: hp(3),
    alignSelf: "center",
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
  input: {
    height: hp("5%"),
    marginBottom: hp("2"),
    color: "black",
    marginTop: hp("2"),
    width: wp("85"),
    paddingRight: wp("7"),
    backgroundColor: "white",
  },

  labelInputContainer: {
    position: "relative",
    width: wp(90),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    marginTop: hp(3),
    borderRadius: wp(2),
    backgroundColor: "white",
    borderWidth: 1,
    paddingLeft: wp(3),
    paddingVertical: hp(1.2),
    borderColor: "#DADADA",
  },
  label: {
    position: "absolute",
    zIndex: 100,
    backgroundColor: "white",
    paddingHorizontal: 5,
    left: 12,
    color: "#4CA6EA",
    top: -12,
  },
  inputView: {
    borderWidth: 1,
    width: wp(90),
    alignSelf: "center",
    padding: 10,
    marginTop: hp(3),
    borderRadius: hp(1),
    borderColor: "#DADADA",
  },
  input: {
    height: hp("5%"),
    marginBottom: hp("2"),
    color: "black",
    marginTop: hp("2"),
    width: wp("90"),
    paddingRight: wp("7"),
    backgroundColor: "white",
  },
  paste: { textAlign: "right", color: "#4CA6EA" },
  btn: {
    backgroundColor: "#4CA6EA",
    paddingVertical: hp(1.6),
    width: wp(90),
    alignSelf: "center",
    borderRadius: hp(1),
    alignItems: "center",
  },
  tabBtns: {
    borderBottomWidth: 1,
    width: "26%",
    alignItems: "center",
    padding: 3,
  },
  text: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
    // marginTop:hp(3)
  },
  crossIcon: {
    alignSelf: "flex-end",
    padding: hp(1.5)
  }
});
