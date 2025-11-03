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
import title_icon from "../../../assets/title_icon.png";
import { useDispatch, useSelector } from "react-redux";
import {
  AddToAllWallets,
  getBalance,
  setCurrentWallet,
  setUser,
  setToken,
  setProvider,
  setWalletType,
} from "../../components/Redux/actions/auth";
import { urls } from "../constants";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import "react-native-get-random-values";
import "@ethersproject/shims";
import { ethers } from "ethers";
import Modal from "react-native-modal";
import ModalHeader from "../reusables/ModalHeader";
import { alert } from "../reusables/Toasts";
import { Paste } from "../../utilities/utilities";
import  Clipboard from "@react-native-clipboard/clipboard";
import Icon from "../../icon";
import * as StellarSdk from '@stellar/stellar-sdk';

const ImportEthereumModal = ({
  props,
  setWalletVisible,
  Visible,
  setModalVisible,
}) => {
  const [loading, setLoading] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [visible, setVisible] = useState(false);
  const [Wallet, setWallet] = useState();
  const [label, setLabel] = useState("privateKey");
  const [privateKey, setPrivateKey] = useState("");
  const [json, setJson] = useState();
  const [jsonKey, setJsonKey] = useState();
  const [optionVisible, setOptionVisible] = useState(false);
  const [provider, setProvider] = useState("");
  const [message, setMessage] = useState(false);
  const [disable, setDisable] = useState(true);
  const [text, setText] = useState("");
  const navigation = useNavigation();
  const state = useSelector((state) => state);

  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const Spin = new Animated.Value(0);

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

    if (accountName && (privateKey || mnemonic || json)) {
      let valid
      if (label === 'mnemonic') {
        const phrase = mnemonic.trimStart();
        const trimmedPhrase = phrase.trimEnd();
        valid = ethers.utils.isValidMnemonic(trimmedPhrase);
        if (!valid) {
          setMessage("Please enter a valid mnemonic");
        } else {
          setMessage("");
        }
      } else if (label === "privateKey") {
        valid = ethers.utils.isHexString(privateKey, 32);
        if (!valid) {
          setMessage("Please enter a valid private key");
        } else {
          setMessage("");
        }
      }
      if (label === 'JSON') {
        const phrase = mnemonic.trimStart();
        const trimmedPhrase = phrase.trimEnd();
        valid = ethers.utils.isValidMnemonic(trimmedPhrase);
        if (!valid) {
          setMessage("Please enter a valid mnemonic");
        } else {
          setMessage("");
        }
      }

      if (accountName && (mnemonic || privateKey || json) && valid) {
        setDisable(false);
      } else {
        setDisable(true);
      }
    } else {
      setMessage("");
    }
  }, [mnemonic, privateKey, json, accountName])


  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
    >
      <Modal
        isVisible={Visible}
        onBackdropPress={() => setWalletVisible(false)}
        onBackButtonPress={() => setWalletVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver
        hideModalContentWhileAnimating
        style={style.modal}
        avoidKeyboard={true}
      >

      <Animated.View style={[style.overlay]}>
        <View style={[style.Body, { backgroundColor: state.THEME.THEME ? "#242426" : "#F4F4F8" }]}>
            <View style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: 30
                    }}>
        <View style={{
              paddingHorizontal: 10,
              alignItems: "flex-start"
            }}>
              <Text style={[style.coinText, { color: state.THEME.THEME ? "#fff" : "black" }]}>Ethereum Wallet</Text>
              <Text style={[style.coinSubText, { color: state.THEME.THEME ? "#AAAAAA" : "black" }]}>Import your wallet using your secret recovery phrase.</Text>
            </View>
            <Icon type={'entypo'} name='circle-with-cross' color={state.THEME.THEME? "#fff" : "black" } size={26} style={[style.crossIcon]} onPress={()=>{setWalletVisible(false);}} />
          </View>
          <View style={style.infoCard}>
            <Icon type={'entypo'} name='info-with-circle' color={"#ECB742"} size={20} />
            <Text style={[style.coinSubText, { color: "#ECB742", marginLeft: 5 }]}>Never share this phrase. Enter it here only to recover your wallet.</Text>
          </View>
          <View style={style.Button}>
            <TouchableOpacity
              style={
                label == "privateKey"
                  ? { ...style.tabBtns, borderColor: "#5B65E1" }
                  : style.tabBtns
              }
              color={label == "privateKey" ? "green" : "grey"}
              onPress={() => {
                setOptionVisible(false);
                setLabel("privateKey");
                if (text) {
                  setPrivateKey(text);
                }
              }}
            >
              <Text
                style={{ color: label == "privateKey" ? "#5B65E1" : "grey" }}
              >
                PrivateKey
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                label == "mnemonic"
                  ? { ...style.tabBtns, borderColor: "#5B65E1" }
                  : style.tabBtns
              }
              color={label == "mnemonic" ? "green" : "grey"}
              onPress={() => {
                setOptionVisible(false);
                setLabel("mnemonic");
                if (text) {
                  setMnemonic(text);
                }
              }}
            >
              <Text style={{ color: label == "mnemonic" ? "#5B65E1" : "grey" }}>
                Mnemonic
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                label == "JSON"
                  ? { ...style.tabBtns, borderColor: "#5B65E1" }
                  : style.tabBtns
              }
              color={label == "JSON" ? "green" : "grey"}
              onPress={() => {
                setLabel("JSON");
                setOptionVisible(true);
                if (text) {
                  setJson(text);
                }
              }}
            >
              <Text style={{ color: label == "JSON" ? "#5B65E1" : "grey" }}>
                JSON key
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[style.card, { backgroundColor: state.THEME.THEME === false ? "#FFFFFF" : "#1B1B1C" }]}>
              <Text style={[style.label, { color: state.THEME.THEME === false ? "#6C757D" : "#8B93A7" }]}>Wallet Name</Text>
              <View style={[style.inputContainer, {
                backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426",
              }]}>
            <TextInput
              value={accountName}
              maxLength={20}
              onChangeText={(text) => {
                setAccountName(text);
              }}
              style={[style.crossChainTextInput,{  color: state.THEME.THEME === false ?"black":"#fff" }]}
              placeholder={accountName ? accountName : "Wallet 1"}
              placeholderTextColor={"gray"}
            />
          </View>
          </View>

          <View style={[style.card, { backgroundColor: state.THEME.THEME === false ? "#FFFFFF" : "#1B1B1C" }]}>
              <View style={{flexDirection:"row",justifyContent:"space-between"}}>
              <Text style={[style.label, { color: state.THEME.THEME === false ? "#6C757D" : "#8B93A7" }]}>Phrase</Text>
            <TouchableOpacity
              onPress={async () => {
                const text = await Clipboard.getString();
                console.log(label)
                if (label === 'mnemonic') {
                  setMnemonic(text)
                setText(text)
                } else if (label === 'privateKey') {
                  setPrivateKey(text)
                  setText(text)
                } else if (label === 'JSON') {
                  setJson(text)
                  setText(text)
                }
              }}
              style={{flexDirection:"row"}}
            >
              <Icon type={'material'} name='content-copy' color={"#5B65E1"} size={19} />
              <Text style={style.paste}> PASTE</Text>
            </TouchableOpacity>
              </View>
              <View style={[style.inputContainer, {
                backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426",
              }]}>
            <TextInput
              style={[style.crossChainTextInput,{  color: state.THEME.THEME === false ?"black":"#fff" }]}
              value={text}
              onChangeText={(text) => {
                if (label === "privateKey") {
                  setText(text);
                  setPrivateKey(text);
                } else if (label === "mnemonic") {
                  setText(text);
                  setMnemonic(text);
                } else if (label === "JSON") {
                  setText(text);
                  setJson(text);
                  setMnemonic(text);
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
              placeholderTextColor={"gray"}
            />
          </View>
          </View>


            {optionVisible ? (
              <View style={[style.card, { backgroundColor: state.THEME.THEME === false ? "#FFFFFF" : "#1B1B1C" }]}>
                <Text style={[style.label, { color: state.THEME.THEME === false ? "#6C757D" : "#8B93A7" }]}>Key</Text>
                <View style={[style.inputContainer, {
                  backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426",
                }]}>
                  <TextInput
                    style={[style.crossChainTextInput,{
                      display: optionVisible === false ? "none" : "flex",
                      color: "black"
                    }]}
                    value={jsonKey}
                    onChangeText={(text) => {
                      setJsonKey(text);
                    }}
                    placeholderTextColor="gray"
                    autoCapitalize={"none"}
                    placeholder="JSON password"
                  />
                </View>
              </View>
            ) : null}

          {loading&&(<ActivityIndicator size="large" color="green" />)}
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
              if (!accountName) {
                return alert("error", "Please enter an wallet name to proceed");
              }
              setLoading(true);

              if (label === "mnemonic") {
                const user = await AsyncStorageLib.getItem("user");

                const phrase = mnemonic.trimStart();
                const trimmedPhrase = phrase.trimEnd();
                const check = ethers.utils.isValidMnemonic(trimmedPhrase);
                if (!check) {
                  setLoading(false);

                  return alert(
                    "error",
                    "Incorrect Mnemonic. Please provide a valid Mnemonic"
                  );
                }
                const accountFromMnemonic = new ethers.Wallet.fromMnemonic(
                  trimmedPhrase
                );
                const Keys = accountFromMnemonic._signingKey();
                const privateKey = Keys.privateKey;
                const wallet = {
                  address: accountFromMnemonic.address,
                  privateKey: privateKey,
                };
                
                const accounts = {
                  address: wallet.address,
                  privateKey: wallet.privateKey,
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

                const allWallets = [
                  {
                    address: wallet.address,
                    privateKey: wallet.privateKey,
                    mnemonic: trimmedPhrase,
                    name: accountName,
                    walletType: "Ethereum",
                    wallets: wallets,
                  },
                ];

                dispatch(AddToAllWallets(allWallets, user)).then((response) => {
                  if (response) {
                    if (response.status === "Already Exists") {
                      alert("error", "Account with same name already exists");
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
                });

              } else if (label === "privateKey") {
                const check = ethers.utils.isHexString(privateKey, 32);
                if (!check) {
                  setLoading(false);
                  return alert(
                    "error",
                    "Incorrect PrivateKey. Please provide a valid privatekey"
                  );
                }
                const user = await AsyncStorageLib.getItem("user");
                const pair =await StellarSdk.Keypair.random();
                console.log("StellaeKeys-using-private keys:---",pair.publicKey(),"privat--",pair.secret())
                const walletPrivateKey = new ethers.Wallet(privateKey);
                console.log(walletPrivateKey);
                const Keys = walletPrivateKey._signingKey();
                const privatekey = Keys.privateKey;
                const wallet = {
                  address: walletPrivateKey.address,
                  privateKey: privatekey,
                  xrp: {
                    address: "000000000",
                    privateKey: "000000000",
                  },
                  stellarWallet: {
                    publicKey: pair.publicKey(),
                    secretKey: pair.secret()
                  },
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


                const allWallets = [
                  {
                    address: wallet.address,
                    privateKey: wallet.privateKey,
                    name: accountName,
                    xrp: {
                      address: "000000000",
                      privateKey: "000000000",
                    },
                    stellarWallet: {
                      publicKey: wallet.stellarWallet.publicKey,
                      secretKey: wallet.stellarWallet.secretKey
                    },
                    walletType: "Ethereum",
                    wallets: wallets,
                  },
                ];


                dispatch(AddToAllWallets(allWallets, user)).then((response) => {
                  if (response) {
                    if (response.status === "Already Exists") {
                      alert("error", "Account with same name already exists");
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
                });
              } if (label === "JSON") {
                const user = await AsyncStorageLib.getItem("user");

                const phrase = mnemonic.trimStart();
                const trimmedPhrase = phrase.trimEnd();
                const check = ethers.utils.isValidMnemonic(trimmedPhrase);
                if (!check) {
                  setLoading(false);

                  return alert(
                    "error",
                    "Incorrect Mnemonic. Please provide a valid Mnemonic"
                  );
                }
                const accountFromMnemonic = new ethers.Wallet.fromMnemonic(
                  trimmedPhrase
                );
                const Keys = accountFromMnemonic._signingKey();
                const privateKey = Keys.privateKey;
                const wallet = {
                  address: accountFromMnemonic.address,
                  privateKey: privateKey,
                };
              
                const accounts = {
                  address: wallet.address,
                  privateKey: wallet.privateKey,
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

                const allWallets = [
                  {
                    address: wallet.address,
                    privateKey: wallet.privateKey,
                    mnemonic: trimmedPhrase,
                    name: accountName,
                    walletType: "Ethereum",
                    wallets: wallets,
                  },
                ];

                dispatch(AddToAllWallets(allWallets, user)).then((response) => {
                  if (response) {
                    if (response.status === "Already Exists") {
                      alert("error", "Account with same name already exists");
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
                });

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
        </Animated.View>
      </Modal>
    </Animated.View>
  );
};

export default ImportEthereumModal;

const style = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  overlay: {
    justifyContent: "flex-end",
  },
  Body: {
    width: wp(100),
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignSelf: "center",
    paddingHorizontal: 15,
  },
  coinText: {
    fontSize: 16,
    fontWeight: "500",
  },
  coinSubText: {
    fontSize: 13,
    fontWeight: "400",
  },
  infoCard: {
    marginVertical: 15,
    backgroundColor: "#FEF6D8",
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center"
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
    justifyContent: "space-between",
    width: wp(85),
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
  textInput: {
    borderWidth: 1,
    borderColor: "grey",
    height: hp(20),
    width: wp(85),
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
  },
  input2: {
    borderWidth: 1,
    borderColor: "grey",
    height: hp(5),
    width: wp(85),
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,
    backgroundColor: "white",

    elevation: 24,
  },
  tabBtns: {
    borderBottomWidth: 1,
    width: "26%",
    alignItems: "center",
    padding: 3,
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
  card: {
    borderRadius: 16,
    padding: wp(3),
    marginBottom: hp(1.5)
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: hp(1.5),
    letterSpacing: 0.3,
    paddingVertical:1.5
  },
  inputContainer: {
    alignItems: "flex-start",
    borderRadius: 12,
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
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
  paste: {
    fontSize:15,
    fontWeight:"500",
    color: "#5B65E1"
   },
   btn: {
    backgroundColor: "#5B65E1",
    paddingVertical: hp(1.6),
    width: wp(95),
    alignSelf: "center",
    borderRadius: hp(1),
    alignItems: "center",
    justifyContent:"center",
    marginBottom:15
  },
  text: {
    textAlign: "center",
    marginTop: hp(1),
    fontSize: 15,
    fontWeight: "700",
    color:"black"
  },
  crossIcon: {
    marginTop:hp(-4),
    height: 31,
    width: 30,
    padding: 3,
    borderRadius: 30
  },
  crossChainTextInput:{
    width:"100%",
    paddingHorizontal: wp(2),
    paddingVertical:  Platform.OS=="android"?hp(1):hp(2),
  }
});
