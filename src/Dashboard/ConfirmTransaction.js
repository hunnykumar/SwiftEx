import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import DialogInput from "react-native-dialog-input";
import { SaveTransaction } from "../utilities/utilities";
import { useNavigation } from "@react-navigation/native";
import "react-native-get-random-values";
import "@ethersproject/shims";
import TransactionPinModal from "./Modals/transactionPinModal";
import { useBiometricsForSendTransaction } from "../biometrics/biometric";
import { useToast } from "native-base";
import { alert, ShowToast } from "./reusables/Toasts";
import { CommonActions } from "@react-navigation/native";
import Icon from "../icon";
import { EthereumSecret } from "./constants";
const { Alchemy, Network, Wallet, Utils } = require("alchemy-sdk");

var ethers = require("ethers");
const ConfirmTransaction = (props) => {
  const state = useSelector((state) => state);
  const [Cost, setCost] = useState();
  const [disable, setDisable] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [walletType, setWalletType] = useState("");
  const [pinViewVisible, setPinViewVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const toast = useToast();
  // const a = props?.route?.pararms?.info;
  // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaa',a)

  const Navigate = () => {
    navigation.dispatch((state) => {
      // Remove the home route from the stack
      const routes = state.routes.filter((r) => r.name !== "Confirm Tx");

      return CommonActions.reset({
        ...state,
        routes,
        index: routes.length - 1,
      });
    });
  };

  async function sendTx() {
    let provider = props.route.params.info.provider;
    let type = props.route.params.info.type;
    let rawTransaction = props.route.params.info.rawTransaction;
    const emailid = await state.user;
    const token = await state.token;
    setLoading(true);
    setDisable(true);
    if (type === "Eth") {
      
      console.log("________________________________________________")
      console.log("----",rawTransaction)
      console.log("________________________________________________")
      const settings = {
        apiKey: EthereumSecret.apiKey,
        network: Network.ETH_SEPOLIA,
      }
      const alchemy = new Alchemy(settings);
      let txx = await alchemy.core.sendTransaction(rawTransaction)
        .catch((e) => {
          console.log(e);
          setLoading(false);
        });
      const tx = txx.wait();
      console.log("Sent transaction", await tx);

      if (txx.hash) {
        try {
          const type = "Send";
          const chainType = "Eth";
          const saveTransaction = await SaveTransaction(
            type,
            txx.hash,
            emailid,
            token,
            walletType,
            chainType
          );

          console.log(saveTransaction);
          ShowToast(toast, "Transaction Successful");

          setLoading(false);
          setDisable(false);
          Navigate();
          navigation.navigate("Transactions");
        } catch (e) {
          setLoading(false);
          setDisable(false);
          console.log(e);

          alert("error", e);
        }
      }
    } else if (type === "Matic") {
      let alchemy = provider;
      let txx = await alchemy.core.sendTransaction(rawTransaction);
      console.log("Sent transaction", txx.hash);
      if (txx.hash) {
        try {
          const type = "Send";
          const chainType = "Matic";

          const saveTransaction = await SaveTransaction(
            type,
            txx.hash,
            emailid,
            token,
            walletType
          );

          console.log(saveTransaction);
          ShowToast(toast, "Transaction Successful");

          setLoading(false);
          setDisable(false);
          setPinViewVisible(false);
          Navigate();
          navigation.navigate("Transactions");
        } catch (e) {
          setDisable(false);
          setLoading(false);
          console.log(e);
          alert("error", e);
        }
      }
    } else if (type === "BSC") {
      const txx = await provider.sendTransaction(rawTransaction).catch((e) => {
        return alert("error", e);
      }); //SendTransaction(signer, token)
      if (txx.hash) {
        try {
          const type = "Send";
          const chainType = "BSC";

          const saveTransaction = await SaveTransaction(
            type,
            txx.hash,
            emailid,
            token,
            walletType,
            chainType
          );

          console.log(saveTransaction);
          ShowToast(toast, "Transaction Successful");

          setLoading(false);
          setDisable(false);
          Navigate();
          navigation.navigate("Transactions");
        } catch (e) {
          setDisable(false);
          setLoading(false);
          console.log(e);
          alert("error", e);
        }
      }
    } else {
      try {
        const client = provider;
        const signed = rawTransaction;
        const tx = await client.submitAndWait(signed.tx_blob);
        const type = "Send";
        const chainType = "Xrp";

        const saveTransaction = await SaveTransaction(
          type,
          signed.hash,
          emailid,
          token,
          walletType,
          chainType
        );

        console.log(saveTransaction);
        ShowToast(toast, "Transaction Successful");

        setLoading(false);
        setDisable(false);
        console.log(tx);
        Navigate();
        navigation.navigate("Transactions");
      } catch (e) {
        setDisable(false);
        setLoading(false);
        console.log(e);
        alert("error", "please try again");
      }
    }
  }

  useEffect(async () => {
    const user = await state.user;
    console.log(user);
    AsyncStorageLib.getItem("walletType").then(async (type) => {
      console.log(JSON.parse(type));
      const Type = JSON.parse(type);
      setWalletType(Type);
    });
    const fee = props.route.params.info.fee;
    const transactionCost = fee.toString();
    setCost(ethers.utils.formatEther(transactionCost));
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={style.mainContainer}>
      <View style={style.BttView}>
        <Text style={{ marginHorizontal: wp(3) }}>
          {props?.route?.params?.info?.amount}
          {/* -100 BTT */}
          {/* <Text style={{ fontSize: 10 }}>($0.02)</Text> */}
        </Text>
      </View>

      <Text style={style.fromTxt}>From</Text>
      <Text style={style.fromAdd}>
        {props?.route?.params?.info?.addressFrom}
      </Text>

      <Text style={style.fromTxt}>To</Text>
      <Text style={style.toAdd}>
        {props?.route?.params?.info?.addressTo}
      </Text>

      <View style={style.networkTxt}>
        <Text>Network fee</Text>
        <Text style={style.dollarTxt}>
          {/* 0.1 TRX ($0.00) */}
          {Cost ? Cost : "evaluating fees"} {props?.route?.params?.info?.type}
        </Text>
      </View>

      <View
        style={{
          backgroundColor: "#eeeeee",
          marginTop: hp(3),
          width: wp(100),
          alignSelf: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: hp(1.6),
          paddingHorizontal: wp(5.5),
        }}
      >
        <Text>Max Total</Text>
        <Text style={style.dollarTxt}>
          {/* $0.03 */}
          (Amount+fee) : {props?.route?.params?.info?.finalAmount}
        </Text>
      </View>
      {Loading ? (
        <View style={{ marginBottom: hp("-4") }}>
          <ActivityIndicator size="small" color="white" />
        </View>
      ) : (
        <Text> </Text>
      )}

      <TouchableOpacity
        style={style.doneBtn}
        disabled={disable ? true : false}
        onPress={async () => {
          //setVisible(!visible)

          const biometric = await AsyncStorageLib.getItem("Biometric");
          if (biometric === "SET") {
            try {
              useBiometricsForSendTransaction(sendTx);
              return;
            } catch (e) {
              console.log(e);
            }
          }

          //checkBioMetric()
          const type = props?.route?.params?.info?.type;
          console.log(type);
          setPinViewVisible(true);
          setLoading(true);
          setDisable(true);
        }}
      >
        <Text style={{ color: "white" }}>{Loading?<ActivityIndicator size={'small'} color={'white'}/>: 'Send'}</Text>
      </TouchableOpacity>

      <TransactionPinModal
        setPinViewVisible={setPinViewVisible}
        pinViewVisible={pinViewVisible}
        provider={props?.route?.params?.info?.provider}
        type={props?.route?.params?.info?.type}
        rawTransaction={props?.route?.params?.info?.rawTransaction}
        walletType={walletType}
        SaveTransaction={SaveTransaction}
        setLoading={setLoading}
        setDisable={setDisable}
      />
    </View>
  );
};

export default ConfirmTransaction;

const style = StyleSheet.create({
  Body: {
    backgroundColor: "white",
    height: hp(100),
    width: wp(100),
    textAlign: "center",
  },
  mainContainer: { backgroundColor: "white", height: hp(100) },
  input: {
    height: hp("5%"),
    marginBottom: hp("2"),
    color: "#fff",
    marginTop: hp("2"),
    width: wp("70"),
    paddingRight: wp("7"),
    backgroundColor: "white",
    borderColor: "white",
  },
  BttView: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: hp(2),
    borderBottomWidth: 0.3,
    paddingVertical: hp(1),
    width: wp(90),
  },
  downloadBtn: {
    // backgroundColor: "red",
    borderRadius: hp(3),
    width: wp(10),
    borderWidth: 0.3,
    height: hp(5),
    alignItems: "center",
    justifyContent: "center",
  },
  fromTxt: {
    color: "black",
    fontWeight: "700",
    marginHorizontal: wp(6),
    marginTop: hp(2),
    fontSize: 15,
  },
  fromAdd: {
    marginHorizontal: wp(6),
    color: "gray",
    marginTop: hp(1),
  },
  toAdd: {
    marginHorizontal: wp(6),
    color: "gray",
    borderBottomWidth: 0.3,
    paddingVertical: 12,
  },
  networkTxt: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp(90),
    alignItems: "center",
    alignSelf: "center",
    marginTop: hp(2),
  },
  dollarTxt: { color: "gray", fontSize: 12 },
  doneBtn: {
    backgroundColor: "#3574B6",
    alignItems: "center",
    alignSelf: "center",
    width: wp(90),
    marginTop: hp(20),
    paddingVertical: hp(1.8),
    borderRadius: hp(1),
  },
});
