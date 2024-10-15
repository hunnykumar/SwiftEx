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
import title_icon from "../../assets/title_icon.png";
import { useDispatch, useSelector } from "react-redux";
import { Generate_Wallet2 } from "../components/Redux/actions/auth";
import {
  AddToAllWallets,
  getBalance,
  setCurrentWallet,
  setUser,
  setToken,
  setWalletType,
} from "../components/Redux/actions/auth";
import { encryptFile, Paste } from "../utilities/utilities";
import DialogInput from "react-native-dialog-input";
import { urls } from "./constants";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import "react-native-get-random-values";
import "@ethersproject/shims";
import { ethers } from "ethers";
import { genrateAuthToken, genUsrToken } from "./Auth/jwtHandler";
import { alert } from "./reusables/Toasts";
import styles from "../Screens/splash/style";
const xrpl = require("xrpl");

const ImportMunziWallet = (props) => {
  const [loading, setLoading] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [visible, setVisible] = useState(false);
  const [Wallet, setWallet] = useState();
  const [disable, setDisable] = useState(true);
  const [message, setMessage] = useState("");

  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const Spin = new Animated.Value(0);
  const SpinValue = Spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

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
    if (accountName && mnemonic) {
      let valid;
      const phrase = mnemonic.trimStart();
      const trimmedPhrase = phrase.trimEnd();
      valid = ethers.utils.isValidMnemonic(trimmedPhrase);
      if (!valid) {
        setMessage("Please enter a valid mnemonic");
      } else {
        setMessage("");
      }

      if (accountName && mnemonic && valid) {
        setDisable(false);
      } else {
        setDisable(true);
      }
    } else {
      setMessage("");
    }
  }, [mnemonic]);

  return (
    <Animated.View // Special animatable View
      style={{ opacity: fadeAnim }}
    >
      <View style={style.Body}>
        <View style={style.labelInputContainer}>
          <Text style={style.label}>Name</Text>
          <TextInput
            value={accountName}
            onChangeText={(text) => setAccountName(text)}
            style={{ width: wp("78%") }}
            placeholder={accountName?accountName: "Wallet 1"}
            placeholderTextColor={"gray"}
          />
        </View>
        <View
          style={style.inputView}
        >
          <TouchableOpacity onPress={async ()=>{
           // setText('abc')
              Paste(setMnemonic)
              setDisable(false)        
          }}>
          <Text style={style.paste}>Paste</Text>
          </TouchableOpacity>
          <Text>Phrase</Text>
          <TextInput
            style={style.input}
            value={mnemonic}
            placeholder="Please enter your mnemonic phrase here"
            placeholderTextColor={"gray"}
            onChangeText={(text) => {
              setMnemonic(text);
            }}
          />
        </View>
        {!accountName?<Text style={[style.text,{color:"red"}]}>Input Wallet Name</Text>:<></>}
        <Text style={style.text}>
          Typically 12 (sometimes 18.24) words separated by single spaces
        </Text>
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
            style={[style.btn,{backgroundColor:!accountName || !/\S/.test(accountName)?"gray":"green",}]}
            disabled={disable||!accountName || !/\S/.test(accountName)?true:false}
            onPress={async () => {
              const pin = await AsyncStorageLib.getItem("pin");
              if (!accountName) {
                return alert("error", "Please enter an wallet name to proceed");
              }
              setLoading(true);
              setTimeout(async () => {
                try {
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

                  const xrpWalletFromM =
                    xrpl.Wallet.fromMnemonic(trimmedPhrase);
                  const entropy = ethers.utils.mnemonicToEntropy(trimmedPhrase);
                  console.log(
                    "\t===> seed Created from mnemonic",
                    entropy.split("x")[1]
                  );
                  const xrpWallet = xrpl.Wallet.fromEntropy(
                    entropy.split("x")[1]
                  ); // This is suggested because we will get seeds also
                  console.log(xrpWallet); // Produces different addresses

                  const accountFromMnemonic =
                    ethers.Wallet.fromMnemonic(trimmedPhrase);
                  const Keys = accountFromMnemonic._signingKey();
                  const privateKey = Keys.privateKey;
                  const wallet = {
                    address: accountFromMnemonic.address,
                    privateKey: privateKey,
                    xrp: {
                      address: xrpWallet.classicAddress,
                      privateKey: xrpWallet.seed,
                    },
                  };
                  /* const response = saveUserDetails(accountFromMnemonic.address).then((response)=>{
                if(response.code===400){
                  return alert(response.message)
                }
                else if(response.code===401){
                  return alert(response.message)
                }
              }).catch((e)=>{
                setLoading(false)

                console.log(e)
              })*/
                  console.log(pin);
                  const body = {
                    accountName: accountName,
                    pin: JSON.parse(pin),
                  };
                  const token = genUsrToken(body);
                  console.log(token);

                  const accounts = {
                    address: wallet.address,
                    privateKey: wallet.privateKey,
                    mnemonic: trimmedPhrase,
                    name: accountName,
                    xrp: {
                      address: xrpWallet.classicAddress,
                      privateKey: xrpWallet.seed,
                    },
                    walletType: "Multi-coin",
                    wallets: [],
                  };
                  let wallets = [];
                  wallets.push(accounts);
                  const allWallets = [
                    {
                      address: wallet.address,
                      privateKey: wallet.privateKey,
                      mnemonic: trimmedPhrase,
                      name: accountName,
                      xrp: {
                        address: xrpWallet.classicAddress,
                        privateKey: xrpWallet.seed,
                      },
                      walletType: "Multi-coin",
                    },
                  ];

                  AsyncStorageLib.setItem(
                    "wallet",
                    JSON.stringify(allWallets[0])
                  );
                  AsyncStorageLib.setItem(
                    `${accountName}-wallets`,
                    JSON.stringify(allWallets)
                  );
                  AsyncStorageLib.setItem("user", accountName);
                  AsyncStorageLib.setItem("currentWallet", accountName);
                  AsyncStorageLib.setItem("token", token);
                  dispatch(setUser(accountName));
                  dispatch(
                    setCurrentWallet(
                      wallet.address,
                      accountName,
                      wallet.privateKey,
                      trimmedPhrase,
                      xrpWallet.classicAddress,
                      xrpWallet.seed,
                      (walletType = "Multi-coin")
                    )
                  );
                  dispatch(AddToAllWallets(wallets, accountName));
                  dispatch(getBalance(wallet.address));
                  dispatch(setToken(token));
                  //dispatch(setProvider('https://data-seed-prebsc-1-s1.binance.org:8545'))
                  dispatch(setWalletType("Multi-coin"));
                  setLoading(false);

                  props.navigation.navigate("HomeScreen");
                } catch (e) {
                  alert("error", e);
                  setLoading(false);
                }

                // setVisible(!visible)
                setLoading(false);
              }, 1);
            }}
          >
            <Text style={{color:"white"}}>Import</Text>
          </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default ImportMunziWallet;

const style = StyleSheet.create({
  Body: {
    backgroundColor: "white",
    height: hp(100),
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
    marginTop: hp(10),
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
    width: wp("90"),
    paddingRight: wp("7"),
    backgroundColor: "white",
  },
  textInput: {
    width: wp(90),
    borderWidth: StyleSheet.hairlineWidth * 1,
    borderColor: "gray",
    alignSelf: "center",
    marginTop: hp(3),
    paddingVertical: hp(8),
    borderRadius: hp(1),
  },

  input2: {
    borderWidth: 1,
    borderColor: "grey",
    height: hp(5),
    width: wp(95),
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
  labelInputContainer1: {
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
    paddingVertical: hp(8),
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
  text: {
    marginHorizontal: wp(6),
    marginTop: hp(5),
    color: "gray",
  },
  inputView:{
    borderWidth: 1,
    width: wp(90),
    alignSelf: "center",
    padding: 10,
    marginTop: hp(3),
    borderRadius: hp(1),
    borderColor: "#DADADA",
  },
  input:{ paddingVertical: hp(4) },
  paste:{ textAlign: "right",color:"#4CA6EA" },
  btn:{
    backgroundColor: "#4CA6EA",
    paddingVertical: hp(1.6),
    width: wp(90),
    alignSelf: "center",
    borderRadius: hp(1),
    alignItems: "center",
  }
});
