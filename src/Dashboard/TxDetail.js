import React, { useEffect,  useState } from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import {  useSelector } from "react-redux";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { Wallet_screen_header } from "./reusables/ExchangeHeader";
import { useNavigation } from "@react-navigation/native";
import { STELLAR_URL } from "./constants";

export const TxDetail = (props) => {
  const navi=useNavigation();
  const type = useSelector((state) => state.walletType);
  const [walletType, setWalletType] = useState();
  const url = `https://bscscan.com/tx/${props?.route?.params?.data?.hash}`;
  const etherUrl = `https://etherscan.io/tx/${props?.route?.params?.data?.hash}`;
  const MaticUrl = `https://mumbai.polygonscan.com/tx/${props?.route?.params?.data?.hash}`;
  const XrpUrl = `https://test.bithomp.com/explorer/${props?.route?.params?.data?.hash}`;
  const XLMUrl = `${STELLAR_URL.EXPERT_URL}/tx/${props?.route?.params?.data?.hash}`;
  console.log(props?.route?.params?.data?.hash);
  useEffect(() => {
    const fetch_wallets=async()=>{
      try {
        AsyncStorageLib.getItem("walletType").then(async (Type) => {
          if (JSON.parse(Type) == "Ethereum") {
            setWalletType("Ethereum");
          } else if (JSON.parse(Type) == "Matic") {
            setWalletType("Matic");
          } else if (JSON.parse(Type) == "Xrp") {
            setWalletType("Xrp");
          } else if (JSON.parse(Type) == "BSC") {
            setWalletType("BSC");
          } else if (JSON.parse(Type) == "Multi-coin") {
            if (props?.route?.params?.data?.chainType === "Eth") {
              setWalletType("Ethereum");
            }else if (props?.route?.params?.data?.chainType === "eth") {
              setWalletType("Ethereum");
            } else if (props?.route?.params?.data?.chainType === "BSC") {
              setWalletType("BSC");
            } else if (props?.route?.params?.data?.chainType === "Matic") {
              setWalletType("Matic");
            } else if (props?.route?.params?.data?.chainType === "Xrp") {
              setWalletType("Xrp");
            } else if (props?.route?.params?.data?.chainType === "XLM") {
              setWalletType("XLM");
            } else {
              return alert(
                "no chainType found in multi-coin transaction. Error 404"
              );
            }
          }
        });
      } catch (error) {
        console.log("{--=",error)
      }
    }
    fetch_wallets()
  }, []);
  return (
    <>
    <Wallet_screen_header title="Transaction Details" onLeftIconPress={() => navi.goBack()} />
    <View style={styles.container}>
      <WebView
        source={{
          uri:
            walletType == "Ethereum"
              ? etherUrl
              : walletType == "Matic"
              ? MaticUrl
              : walletType == "Xrp"
              ? XrpUrl
              :walletType=='BSC'
              ?url
              :walletType==="XLM"?XLMUrl: url,
        }}
      /> 
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // marginTop:2,
    // height: 100,
  },
  content: {
    padding: 40,
  },
  list: {
    marginTop: 30,
  },
});
