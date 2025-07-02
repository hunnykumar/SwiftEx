import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  NativeModules,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import title_icon from "../../../assets/title_icon.png";
import { useDispatch, useSelector } from "react-redux";
import { AddToAllWallets,setCurrentWallet } from "../../components/Redux/actions/auth";
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
const { EthereumWallet } = NativeModules;

const xrpl = require("xrpl");

const ImportMultiCoinWalletModal = ({
  props,
  setWalletVisible,
  Visible,
  setModalVisible,
  onCrossPress
}) => {
  const [loading, setLoading] = useState(false);
  const [accountName, setAccountName] = useState();
  const [mnemonic, setMnemonic] = useState("");
  const [visible, setVisible] = useState(false);
  const [Wallet, setWallet] = useState();
  const [label, setLabel] = useState("privateKey");
  const [privateKey, setPrivateKey] = useState("");
  const [json, setJson] = useState();
  const [jsonKey, setJsonKey] = useState();
  const [optionVisible, setOptionVisible] = useState(false);
  const [provider, setProvider] = useState("");
  const [disable, setDisable] = useState(true);
  const [message, setMessage] = useState("");

  const navigation = useNavigation();

  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const Spin = new Animated.Value(0);

  async function saveUserDetails(address) {
    let response;
    const user = await AsyncStorageLib.getItem("user");
    const token = await AsyncStorageLib.getItem("token");
    console.log(user);
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
            alert("success", "success");
            return responseJson.responseCode;
          } else if (responseJson.responseCode === 400) {
            alert(
              "error",
              "account with same name already exists. Please use a different name"
            );
            return responseJson.responseCode;
          } else {
            alert("error", "Unable to create account. Please try again");
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
    if (accountName && mnemonic) {
      let valid
      const phrase = mnemonic.trimStart();
      const trimmedPhrase = phrase.trimEnd();
      valid = ethers.utils.isValidMnemonic(trimmedPhrase);
      if (!valid) {
        setMessage('Please enter a valid mnemonic')
      }
      else {
        setMessage('')
      }

      if (accountName && mnemonic && valid) {
        setDisable(false);
      } else {
        setDisable(true);
      }
    } else {
      setMessage("");
    }
  }, [mnemonic, accountName])

  const handleUsernameChange = (text) => {
    // Remove whitespace from the username
    const formattedUsername = text.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '');
    setAccountName(formattedUsername);
  };
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
          {/* <ModalHeader Function={closeModal} name={'Multi-Coin'}/> */}
          <Icon type={'entypo'} name='cross' color={'gray'} size={24} style={style.crossIcon} onPress={onCrossPress} />
          <Text style={style.coinText}>Multi-Chain Wallet</Text>
          <View style={style.labelInputContainer}>
            <Text style={style.label}>Name</Text>
            <TextInput
              value={accountName}
              maxLength={20}
              onChangeText={(text) =>{handleUsernameChange(text)}}
              style={{ width: wp("78%"),color:"black" }}
              placeholder={accountName ? accountName : "Wallet 1"}
              placeholderTextColor={"gray"}
            />
          </View>


          <View style={style.inputView}>
            <TouchableOpacity
              onPress={async () => {
                // setText('abc')
                Paste(setMnemonic);

              }}
            >
              <Text style={style.paste}>Paste</Text>
            </TouchableOpacity>
            <Text style={{color:"#4CA6EA"}}>Phrase</Text>
            <TextInput
              placeholder={"Please enter your mnemonic phrase here"}
              style={[style.input,{color:"black"}]}
              value={mnemonic}
              onChangeText={(text) => {
                setMnemonic(text);
              }}
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
              if (!accountName) {
                return alert("error", "Please enter an wallet name to proceed");
              }
              setLoading(true);
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
                // const xrpWalletFromM = xrpl.Wallet.fromMnemonic(trimmedPhrase); // UNCOMMENT
                const accountFromMnemonic = await EthereumWallet.recoverMultiChainWallet(trimmedPhrase);
                const wallet = {
                  address: accountFromMnemonic.ethereum.address,
                  privateKey: accountFromMnemonic.ethereum.privateKey,
                  xrp: {
                    // address: xrpWallet.classicAddress, // UNCOMMENT
                    // privateKey: xrpWallet.seed, // UNCOMMENT
                    address: "000000000",
                    privateKey: "000000000",
                  },
                  stellarWallet: {
                    publicKey: accountFromMnemonic.stellar.publicKey,
                    secretKey: accountFromMnemonic.stellar.secretKey
                  },

                };
                /* const response = saveUserDetails(accountFromMnemonic.address).then(async (response)=>{
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
                    xrp: {
                      // address: xrpWallet.classicAddress, // UNCOMMENT
                      // privateKey: xrpWallet.seed,  // UNCOMMENT
                      address: "000000000",
                      privateKey: "000000000",
                    },
                    stellarWallet: {
                      publicKey: wallet.stellarWallet.publicKey,
                      secretKey: wallet.stellarWallet.secretKey
                    },
                    walletType: "Multi-coin",
                    wallets: wallets,
                  },
                ];
                // AsyncStorageLib.setItem(`${accountName}-wallets`,JSON.stringify(wallets))

                dispatch(AddToAllWallets(allWallets, user)).then((response) => {
                  if (response) {
                    if (response.status === "Already Exists") {
                      alert("error", "Account with same name already exists");
                      setLoading(false);
                      return;
                    } else if (response.status === "success") {
                      dispatch(
                        setCurrentWallet(
                          wallet.address,
                          accountName,
                          wallet.privateKey,
                          trimmedPhrase
                        )
                      )
                      setTimeout(() => {
                        setLoading(false);
                        setWalletVisible(false);
                        setVisible(false);
                        setModalVisible(false);
                    AsyncStorageLib.setItem("currentWallet", accountName);
                        navigation.navigate("AllWallets");
                      }, 0);
                    } else {
                      alert("error", "failed please try again");
                      return;
                    }
                  }
                });

                // dispatch(getBalance(wallet.address))
                //dispatch(setProvider('https://data-seed-prebsc-1-s1.binance.org:8545'))

                let result = [];
              } catch (e) {
                console.log("--====000---",e)
                alert("error", e);
                setLoading(false);
                setWalletVisible(false);
                setVisible(false);
                setModalVisible(false);
              }

              // setVisible(!visible)
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

export default ImportMultiCoinWalletModal;

const style = StyleSheet.create({
  Body: {
    display: "flex",
    backgroundColor: "white",
    height: hp(75),
    width: wp(97),
    textAlign: "center",
    borderRadius: hp(1),
    alignSelf: "center",
    marginTop: hp(5)
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
    marginTop: hp(0),
    display: "flex",
    flexDirection: "row",
    alignContent: "space-around",
    alignItems: "center",
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
  input: {
    height: hp("5%"),
    marginBottom: hp("2"),
    color: "black",
    marginTop: hp("2"),
    width: wp("90"),
    paddingRight: wp("7"),
    backgroundColor: "white",
  },
  jsonInput: {
    borderWidth: StyleSheet.hairlineWidth * 1,
    marginTop: hp(3),
    width: wp(90),
    borderRadius: hp(1),
    paddingVertical: hp(1.6),
    alignSelf: "center",
    paddingHorizontal: wp(2),
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
  text: {
    marginHorizontal: wp(6),
    marginTop: hp(5),
    color: "gray",
  },
  btn: {
    backgroundColor: "#4CA6EA",
    paddingVertical: hp(1.6),
    width: wp(90),
    alignSelf: "center",
    borderRadius: hp(1),
    alignItems: "center",
  },
  paste: { textAlign: "right", color: "#4CA6EA" },
  coinText: {
    textAlign: "center",
    marginTop: hp(1.5),
    fontSize: 15,
    fontWeight: "700",
    color:"black"
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
  crossIcon: {
    alignSelf: "flex-end",
    padding: hp(1.5)
  }
});
