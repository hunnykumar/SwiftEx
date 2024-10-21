import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
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

const ImportBinanceWallet = ({
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
  const [label, setLabel] = useState("privateKey");
  const [privateKey, setPrivateKey] = useState("");
  const [json, setJson] = useState();
  const [jsonKey, setJsonKey] = useState();
  const [optionVisible, setOptionVisible] = useState(false);
  const [provider, setProvider] = useState("");
  const [text, setText] = useState("");
  const [message, setMessage] = useState(false);
  const [disable, setDisable] = useState(true);
  const navigation = useNavigation();

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

  useEffect(()=>{
    if(!accountName)
    {
      setDisable(true)
    }
    

    if(accountName && (privateKey || mnemonic || json))
    {
      let valid
      if(label==='mnemonic'){
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

      if (accountName && (mnemonic || privateKey || json) && valid) {
        setDisable(false);
      } else {
        setDisable(true);
      }
    } else {
      setMessage("");
    }
    },[mnemonic,privateKey,json,accountName])

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
        onBackdropPress={() => setWalletVisible(false)}
        // statusBarTranslucent={true}
        onBackButtonPress={() => {
          setWalletVisible(false);
        }}
      >
        <View style={style.Body}>
          {/* <ModalHeader Function={closeModal} name={'Binance'}/> */}
<Icon type={'entypo'} name='cross' color={'gray'} size={24} onPress={onCrossPress} style={style.crossIcon}/>
          <Text style={style.text}>Binance Wallet</Text>
          <View style={style.Button}>
            <TouchableOpacity
              style={
                label == "privateKey"
                  ? { ...style.tabBtns, borderColor: "#4CA6EA" }
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
                style={{ color: label == "privateKey" ? "#4CA6EA" : "grey" }}
              >
                PrivateKey
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                label == "mnemonic"
                  ? { ...style.tabBtns, borderColor: "#4CA6EA" }
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
              <Text style={{ color: label == "mnemonic" ? "#4CA6EA" : "grey" }}>
                Mnemonic
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                label == "JSON"
                  ? { ...style.tabBtns, borderColor: "#4CA6EA" }
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
              <Text style={{ color: label == "JSON" ? "#4CA6EA" : "grey" }}>
                JSON key
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
              style={{ width: wp("78%"),color:"black" }}
              placeholder={accountName ? accountName : "Wallet 1"}
              placeholderTextColor={"gray"}
            />
          </View>

          <View style={style.inputView}>
            <TouchableOpacity
              onPress={async () => {
                // // setText('abc')
                // console.log(text)
                // setText(text)
                // // setText('abc')
                // console.log(label)
                const text = await Clipboard.getStringAsync();
                if(label==='mnemonic')
                {
                  // Paste(setMnemonic);
                  setMnemonic(text)
                  setText(text);
                }else if(label==='privateKey'){
                  // Paste(setPrivateKey);
                  setText(text);
                  setPrivateKey(text);
                 // setText(text)
                }else if(label==='JSON'){
                  // Paste(setJson);
                  setJson(text)
                 setText(text)
                }
              }}
            >
              <Text style={style.paste}>Paste</Text>
            </TouchableOpacity>
            <Text style={{color:"black"}}>Phrase</Text>
            <TextInput
              style={[style.input,{color:"black"}]}
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

          {optionVisible ? <View style={style.labelInputContainer}>
          {optionVisible ? <Text style={style.label}>Name</Text> : null}
          <TextInput
            style={{
              display: optionVisible === false ? "none" : "flex",
              color:"black"
            }}
            value={jsonKey}
            onChangeText={(text) => {
              setJsonKey(text);
            }}
            placeholderTextColor="gray"
            autoCapitalize={"none"}
            placeholder="JSON password"
          />
          </View> : null}


          
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
              if (!accountName) {
                return alert("error", "Please enter an wallet name to proceed");
              }
              setLoading(true);
              if (label === "mnemonic") {
                try {
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
                  /* const response = saveUserDetails(wallet.address).then(async (response)=>{
                     
      
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
                      address: wallet.address,
                      privateKey: wallet.privateKey,
                      mnemonic: trimmedPhrase,
                      name: accountName,
                      walletType: "BSC",
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

                  //setVisible(!visible)
                } catch (e) {
                  console.log(e);
                  alert(e);
                  setLoading(false);
                }
              } else if (label === "privateKey") {
                try {
                  const check = ethers.utils.isHexString(privateKey, 32);
                  if (!check) {
                    setLoading(false);
                    return alert(
                      "error",
                      "Incorrect PrivateKey. Please provide a valid privatekey"
                    );
                  }
                  const user = await AsyncStorageLib.getItem("user");
                  const walletPrivateKey = new ethers.Wallet(privateKey);
                  console.log(walletPrivateKey);
                  const mnemonic = walletPrivateKey._mnemonic();
                  console.log(mnemonic);
                  const Keys = walletPrivateKey._signingKey();
                  const privatekey = Keys.privateKey;
                  const wallet = {
                    address: walletPrivateKey.address,
                    privateKey: privatekey,
                  };
                  /*const response = saveUserDetails(wallet.address).then(async (response)=>{
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
                    address: wallet.address,
                    privateKey: wallet.privateKey,
                    name: accountName,
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
                      address: wallet.address,
                      privateKey: wallet.privateKey,
                      name: accountName,
                      walletType: "BSC",
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

                  let result = [];
                } catch (e) {
                  console.log(e);
                  setLoading(false);
                  return alert(e);
                }
              } else {
                try {
                  const user = await AsyncStorageLib.getItem("user");

                  ethers.Wallet.fromEncryptedJson(json, jsonKey)
                    .then(async (wallet) => {
                      console.log("Address: " + wallet.address);
                      const Wallet = {
                        address: wallet.address,
                        privateKey: wallet.privateKey,
                      };
                      /*const response = saveUserDetails(wallet.address).then(async (response)=>{
      
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
      return  alert(e)
    })*/
                      const accounts = {
                        address: wallet.address,
                        privateKey: wallet.privateKey,
                        name: accountName,
                      };
                      let wallets = [];
                      const data = await AsyncStorageLib.getItem(
                        `${user}-wallets`
                      )
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
                          address: wallet.address,
                          privateKey: wallet.privateKey,
                          name: accountName,
                          walletType: "BSC",
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
                    })
                    .catch((e) => {
                      console.log(e);
                      setLoading(false);
                      setWalletVisible(false);
                      setVisible(false);
                      setModalVisible(false);
                    });
                } catch (e) {
                  setLoading(false);
                  setWalletVisible(false);
                  setVisible(false);
                  setModalVisible(false);
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

export default ImportBinanceWallet;

const style = StyleSheet.create({
  Body: {
    backgroundColor: "white",
    height: hp(75),
    width: wp(97),
    textAlign: "center",
    alignSelf: "center",
    borderRadius:hp(1),
    marginTop:hp(5)
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
    width: wp("90"),
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
  text:{
    textAlign:"center",
    fontSize:15,
    fontWeight:"700",
    marginTop:hp(1),
    color:"black"
  },
  crossIcon:{
    alignSelf:"flex-end",
    padding:hp(1)
  }
});
