import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Button,
  AppState,
  ActivityIndicator,
  TextInput,
} from "react-native";
import MyHeader from "./MyHeader";
import MyHeader2 from "./MyHeader2";
import { useDispatch, useSelector } from "react-redux";
import * as FileSystem from "react-native-fs";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { tokenAddresses, urls } from "./constants";
import Etherimage from "../../assets/ethereum.png";
import {
  Avatar,
  Card,
  Title,
  Paragraph,
  CardItem,
  WebView,
} from "react-native-paper";
import {
  getEthBalance,
  getMaticBalance,
  getBalance,
} from "../components/Redux/actions/auth";
import {
  getBnbPrice,
  getEtherBnbPrice,
  getEthPrice,
} from "../utilities/utilities";
import Icon from "../icon";
import { GetPrivateKeyModal } from "./Modals/getPrivateKeyModal";
import { Wallet_screen_header } from "./reusables/ExchangeHeader";
import { useNavigation } from "@react-navigation/native";
import BackupWallet from "./exchange/crypto-exchange-front-end-main/src/components/BackupWallet";
const { StorageAccessFramework } = FileSystem;

const MyWallet = (props) => {
  const navigation=useNavigation();
  const state = useSelector((state) => state);
  const User = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [extended, setExtended] = useState(false);
  const [loading, setLoading] = useState();
  const [bnbLoading, setBnbLoading] = useState(false);
  const [user, setUser] = useState("");
  const [balance, setBalance] = useState(0);
  const [bnbBalance, setBnbBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [bnbPrice, setBnbPrice] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [visible, setVisible] = useState(false);
  const [backupVisible, setbackupVisible] = useState(false);
  let LeftContent = (props) => (
    <Avatar.Image
      {...props}
      source={{
        uri: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850",
      }}
    />
  );
  let LeftContent2 = (props) => <Avatar.Image {...props} source={Etherimage} />;

  const getBalanceInUsd = (ethBalance, bnbBalance) => {
    const ethInUsd = ethBalance * ethPrice;
    const bnbInUsd = bnbBalance * bnbPrice;
    console.log(ethInUsd);
    console.log(bnbInUsd);
    const totalBalance = ethInUsd + bnbInUsd;
    console.log(totalBalance);
    setBalance(totalBalance.toFixed(1));
    setLoading(false);
  };

  const getEthBnbBalance = async () => {
    const address = await state.wallet.address;
    console.log(address);
    if (address) {
      //setLoading(true)
      dispatch(getEthBalance(address))
        .then(async (e) => {
          const Eth = await e.EthBalance;
          let bal = await AsyncStorageLib.getItem("EthBalance");

          if (Eth) {
            setEthBalance(Number(Eth).toFixed(2));
            setLoading(false);
          } else {
            console.log("coudnt get balance");
            setLoading(false);
          }
        })
        .catch((e) => {
          console.log(e);
          //setLoading(false)
        });
      dispatch(getBalance(address))
        .then(async () => {
          const bal = await state.walletBalance;
          console.log("My" + bal);
          if (bal) {
            setBnbBalance(Number(bal).toFixed(2));
            setLoading(false);
          } else {
            setBnbBalance(0);
            setLoading(false);
          }
        })
        .catch((e) => {
          console.log(e);
          setLoading(false);
        });
    }
  };

  const getEthBnbPrice = async () => {
    const user = await AsyncStorageLib.getItem("user");
    setUser(user);
    setLoading(true);

    /* await getEtherBnbPrice(tokenAddresses.ETH, tokenAddresses.BNB)
    .then((resp) => {
      console.log(resp);
      setEthPrice(resp.Ethprice);
      setBnbPrice(resp.Bnbprice);
    })
    .catch((e) => {
      console.log(e);
    });*/
    await getEthPrice().then((response) => {
      setEthPrice(response.USD);
    });
    await getBnbPrice().then((response) => {
      setBnbPrice(response.USD);
    });
  };
  
  useEffect(() => {
    const fetch_wallet_name=async()=>{
     try {
       const user = await state.wallet.name;
       setUser(user);
     } catch (error) {
       console.log("[=-=",error)
     }
    }
    fetch_wallet_name()
 }, []);
  

  return (
    <View style={[styles.mainView,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
       <Wallet_screen_header title="Wallet" onLeftIconPress={() => navigation.goBack()} />
      <View style={[styles.labelInputContainer,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
        <Text style={[styles.label,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>Name</Text>
      
        <Text style={{width:wp("78%"),color:'gray'}}>{user ? user : "Main Wallet 1"}</Text>
      </View>

      <TouchableOpacity onPress={() => {
              setVisible(!visible);
            }}>
        <View style={styles.mainContainer}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => {
              setVisible(!visible);
            }}
          >
            <Icon name="document-text-sharp" type={"ionicon"} size={20} color={state.THEME.THEME===false?"black":"#fff"} />
            <Text style={[styles.secretText,{color:state.THEME.THEME===false?"black":"#fff"}]}>Show Secret Phrase</Text>
          </TouchableOpacity>
          <View style={styles.rightIcon}>
            <Icon name="right" type={"antDesign"} color={state.THEME.THEME===false?"black":"#fff"} size={20} onPress={() => {
              setVisible(!visible);
            }}/>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={async() => {
            setbackupVisible(!backupVisible);
            }}  style={[styles.mainContainer,{marginTop: hp(1), paddingVertical: hp(1.5),}]}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => {
              setbackupVisible(!backupVisible);
            }}
          >
            <Icon name="document-text-sharp" type={"ionicon"} size={20} color={state.THEME.THEME===false?"black":"#fff"} />
            <Text style={[styles.secretText,{color:state.THEME.THEME===false?"black":"#fff"}]}>Backup Secrets</Text>
          </TouchableOpacity>
          <View style={styles.rightIcon}>
            <Icon name="cloud-download-outline" type={"materialCommunity"} color={state.THEME.THEME===false?"black":"#fff"} size={24} onPress={() => {
              setbackupVisible(!backupVisible);
            }}/>
        </View>
      </TouchableOpacity>

      <Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>
        If you lose access to this device,your funds will be lost,unless you
        back up!
      </Text>
      <GetPrivateKeyModal
        visible={visible}
        setVisible={setVisible}
        onCrossPress={() => {
          setVisible(false);
        }}
      />
      <BackupWallet open={backupVisible} close={() => setbackupVisible(false)}/>
    </View>
  
  );
};

export default MyWallet;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    height: hp("10"),
    justifyContent: "center",
    color: "white",
  },
  text: {
    color: "white",
    fontSize: hp("3"),
    fontWeight: "bold",
    marginTop: hp(2),
  },
  text3: {
    color: "white",
    fontSize: hp("3"),
    fontWeight: "bold",
    fontFamily: "sans-serif",
    fontStyle: "italic",
    marginTop: hp("2"),
  },
  text2: {
    color: "white",
    fontSize: hp("2"),
    fontWeight: "bold",
    fontFamily: "sans-serif",
    fontStyle: "italic",
    marginTop: hp("5"),
  },
  content: {
    height: hp("80"),
    width: wp(92),
    margin: hp("1"),
    backgroundColor: "#131E3A",
    textAlign: "center",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 10,
    alignContent: "center",
  },
  content2: {
    display: "flex",
    borderWidth: wp("1"),
    margin: hp("2"),
    marginTop: hp("7"),
    padding: 15,
    backgroundColor: "black",
    borderRadius: 30,
    textAlign: "center",
    alignItems: "center",
  },
  btn: {
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#131E3A",
    width: wp("30"),
    marginLeft: wp("25"),
    marginTop: hp("5"),
  },
  container2: {
    flex: 1,
    backgroundColor: "#98B3B7",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    color: "black",
    fontSize: hp("3"),
    padding: 26,
  },
  noteHeader: {
    backgroundColor: "#42f5aa",
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  footer: {
    flex: 1,
    backgroundColor: "#ddd",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  textInput: {
    alignSelf: "stretch",
    color: "black",
    padding: 20,
    backgroundColor: "#ddd",
    borderTopWidth: 2,
    borderTopColor: "#ddd",
  },

  addButton: {
    position: "absolute",
    zIndex: 11,
    right: wp("10"),
    bottom: hp("14"),
    backgroundColor: "red",
    width: wp("20"),
    height: hp("10"),
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addButton2: {
    position: "absolute",
    zIndex: 11,
    left: 20,
    bottom: hp("14"),
    backgroundColor: "green",
    width: wp("20"),
    height: hp("10"),
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: hp("2"),
  },
  input: {
    height: hp("6"),
    marginBottom: hp("2"),
    color: "#fff",
    marginTop: hp("2"),
    width: wp("70"),
    paddingRight: wp("7"),
    backgroundColor: "#131E3A",
  },
  PresssableBtn: {
    backgroundColor: "#4CA6EA",
    padding: hp(1),
    width: wp(30),
    marginTop: hp(2),
    alignSelf: "center",
    paddingHorizontal: wp(3),
    borderRadius: hp(0.8),
    marginBottom: hp(2),
    alignItems: "center",
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
  mainContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp(100),
    alignSelf: "center",
    marginTop: hp(4),
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DADADA",
    paddingVertical: hp(1.7),
  },
  mainView: { backgroundColor: "white", height: hp(100) },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: wp(4),
  },
  text: { color: "gray", marginHorizontal: wp(4), marginTop: hp(3) },
  rightIcon: { marginRight: wp(3) },
  secretText: { marginHorizontal: wp(3) },
});
