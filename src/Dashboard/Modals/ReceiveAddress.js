import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Clip,
  Image,
  Pressable,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Card, Title } from "react-native-paper";
import Bnbimage from "../../../assets/bnb-icon2_2x.png";
import Etherimage from "../../../assets/ethereum.png";
import maticImage from "../../../assets/matic.png";
import xrpImage from "../../../assets/xrp.png";
import stellar from "../../../assets/Stellar_(XLM).png";
import Modal from "react-native-modal";
import QRCode from "react-native-qrcode-svg";
import  Clipboard from "@react-native-clipboard/clipboard";
import Moralis from "moralis";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
// import SnackBar from "react-native-snackbar-component";
import { checkPendingTransactions, getAllBalances } from "../../utilities/web3utilities";
import Header from "../reusables/Header";
import ModalHeader from "../reusables/ModalHeader";
import { alert } from "../reusables/Toasts";
import Icon from "../../icon";
import { WalletHeader } from "../header";
const RippleAPI = require("ripple-lib").RippleAPI;

const RecieveAddress = ({ modalVisible, setModalVisible, iconType }) => {
  const state = useSelector((state) => state);
  const WalletAddress = useSelector((state) =>
    iconType === "Xrp" && state.wallet.xrp
      ? state.wallet.xrp.address
      : state.wallet.address
  );
  const [selected, setSelected] = useState(false);
  const [selected1, setSelected1] = useState(false);
  const [selected2, setSelected2] = useState(false);
  const [qrvalue, setQrvalue] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [transactions, setTransactions] = useState("");
  const [Stellar_add, setStellar_add] = useState("");
  const [newTx, setNewTx] = useState();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const get_stellar = async () => {
        // const storedData = await AsyncStorageLib.getItem('myDataKey');
        //     const parsedData = JSON.parse(storedData);
        //     const matchedData = parsedData.filter(item => item.Ether_address === state.wallet.address);
        //     const publicKey = matchedData[0].publicKey;
            setStellar_add(state.STELLAR_PUBLICK_KEY)
    }

  let EtherLeftContent = (props) => (
    <Avatar.Image {...props} source={Etherimage} size={50} />
  );
  let BnbLeftContent = (props) => (
    <Avatar.Image {...props} source={Bnbimage} size={50} />
  );
  let maticLeftContent = (props) => (
    <Avatar.Image {...props} source={maticImage} size={50} />
  );
  let xrpLeftContent = (props) => (
    <Avatar.Image {...props} source={xrpImage} size={50} />
  );
  //iconType==='BNB'?BnbLeftContent:iconType==='ETH'?EtherLeftContent:maticLeftContent

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const onShare = async () => {
    try {
      const result = await Share.share({
        message: `${iconType==="XLM"?Stellar_add:state.wallet.address}`,//TO-DO
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert("error", error.message);
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(
      iconType==="XLM"?Stellar_add:iconType === "Xrp" && state.wallet.xrp
        ? state.wallet.xrp.address
        : state.wallet.address
    );
    alert("success", "Copied");
    closeModal()
  };

  const saveTransactions = async (txData) => {
    const user = await state.user;
    let userTransactions = [];

    await AsyncStorageLib.getItem(`${user}-transactions`).then(
      async (transactions) => {
        console.log(JSON.parse(transactions));
        const data = JSON.parse(transactions);
        if (data) {
          data.map((item) => {
            userTransactions.push(item);
          });
          console.log(userTransactions);

          userTransactions.push(txData);
          await AsyncStorageLib.setItem(
            `${user}-transactions`,
            JSON.stringify(userTransactions)
          );

          return userTransactions;
        } else {
          let transactions = [];

          transactions.push(txData);
          await AsyncStorageLib.setItem(
            `${user}-transactions`,
            JSON.stringify(transactions)
          );
          console.log(transactions);
          return transactions;
        }
      }
    );
  };

  const findNewTransactions = async (transactions, allTransactions) => {
    const walletType = await AsyncStorageLib.getItem("walletType");
    let newArr = [];
    const walletAddress = await state.wallet.address;
    let now = +new Date();
    var oneDay = 24 * 60 * 60 * 1000;
    //console.log('Retreiving all transactions from',  minTimestamp);

    allTransactions.filter(async (item, index) => {
      let found;
      let createdAt = +new Date(Date.parse(item.block_timestamp.toString()));

      if (walletAddress) {
        //console.log( item.to_address.toUpperCase() == (await state.wallet.address).toUpperCase(),item.hash);
      }
      for (let index = 0; index < transactions.length; index++) {
        if (item.hash == transactions[index].hash) {
          found = true;
        }
      }
      console.log(found);
      if (!found) {
        console.log("TX_Time = ", item.block_timestamp);
        console.log("created at = ", now, createdAt);

        if (
          item.to_address.toUpperCase() ==
            (await state.wallet.address).toUpperCase() &&
          now - createdAt < oneDay
        ) {
          newArr.push({
            chainType:
              walletType === "BSC"
                ? "BSC"
                : walletType == "Ethereum"
                ? "Eth"
                : walletType == "Xrp"
                ? "Xrp"
                : walletType == "Matic"
                ? "Matic"
                : "Eth",
            hash: item.hash,
            type: "receive",
            walletType: JSON.parse(walletType),
          });
        }
      }
    });

    console.log("hi", newArr);

    //console.log("Hi", pendingData);
    return newArr;
  };

  const getTransactions = async () => {
    const user = await AsyncStorageLib.getItem("user");
    const resp = await AsyncStorageLib.getItem(`${user}-transactions`).then(
      (transactions) => {
        const data = JSON.parse(transactions);
        // console.log(data)
        if (data) {
          setTransactions(data.reverse());
          return data;
        } else {
          return [];
        }
      }
    );
    return resp;
  };

  const checkIncomingTx = async (transactions, chainId) => {
    try {
      /* await Moralis.start({
        apiKey: "KRXC1pBilfY526QDwlrM1pINBUFgtZ2cLcSB8KYQyvlq3vHbrdknIZlfTK5DL1D0"
      });*/
      const response =
        await Moralis.EvmApi.transaction.getWalletTransactionsVerbose({
          chain: chainId,
          address: await state.wallet.address,
        });
      const allTx = response.raw.result;
      //  console.log(transactions);
      console.log("Hi Tx", response.raw.result);

      findNewTransactions(transactions, allTx).then((data) => {
        console.log(data);
        //let saved
        data.map((e) => {
          //console.log(e);
          if (e) {
            setTimeout(() => {
              setSnackbarVisible(true);
              setNewTx(e);
            }, 0);
            /*saveTransactions(e)
            .then(()=>{
              return true
              
            })*/
          }
        });
      });
    } catch (e) {
      console.error(e);
    }
  };

  const getIncomingXrpTx = (allTransactions, walletType) => {
    // This example connects to a public Test Net server
    const api = new RippleAPI({
      server: "wss://s.altnet.rippletest.net:51233",
    });
    api
      .connect()
      .then(async () => {
        console.log("Connected");

        const account_objects_request = {
          id: 2,
          command: "account_tx",
          account: await state.wallet.address,
          ledger_index_min: -1,
          ledger_index_max: -1,
          binary: false,
          limit: 2,
          forward: false,
        };

        return api.connection.request(account_objects_request);
      })
      .then((response) => {
        let receiveTransactions = [];
        let newRecTx = [];
        //console.log("account_objects response:", response.transactions[0].tx, await state.wallet.address)
        const allTx = response.transactions;
        allTx.map(async (item) => {
          console.log(item.tx);
          if (item.tx.Destination === WalletAddress) {
            console.log(true);
            receiveTransactions.push({
              hash: item.tx.hash,
            });
          }
          //console.log(receiveTransactions)
        });

        console.log(receiveTransactions);
        //console.log(allTransactions)
        let found;
        let newArr = [];
        receiveTransactions.filter((item) => {
          console.log(item);
          for (let index = 0; index < allTransactions.length; index++) {
            if (item.hash == allTransactions[index].hash) {
              found = true;
            }
          }
          console.log(found);
          if (!found) {
            newArr.push({
              chainType: "Xrp",
              hash: item.hash,
              type: "receive",
              walletType: walletType,
            });
          }
        });
        //console.log(newArr)
        newArr.map((e) => {
          console.log(e);
          if (e) {
            setTimeout(() => {
              setSnackbarVisible(true);
              setNewTx(e);
            }, 0);
          }
        });
        return newArr;

        // Disconnect and return
      })
      .then(() => {
        api.disconnect().then(() => {
          console.log("Disconnected");
          process.exit();
        });
      })
      .catch(console.error);
  };

  const getNewTransactions = async () => {
    try {
      getTransactions().then(async (res) => {
        //console.log(res);
        const walletType = await AsyncStorageLib.getItem("walletType");
        console.log(JSON.parse(walletType));
        if (JSON.parse(walletType) == "BSC") {
          checkIncomingTx(res ? res : [], "97");
        } else if (JSON.parse(walletType) == "Ethereum") {
          checkIncomingTx(res ? res : [], "5");
        } else if (JSON.parse(walletType) == "Matic") {
          checkIncomingTx(res ? res : [], "0x13881");
        } else if (JSON.parse(walletType) == "Xrp") {
          await getIncomingXrpTx(res ? res : [], "Xrp");
        } else {
          //alert(`Saving receive tx for ${walletType} is  not supported yet`)
          console.log(JSON.parse(walletType));
        }
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const fetch_address=async()=>{
      try {
        if (WalletAddress) {
          setQrvalue(WalletAddress);
        }
        //  await check()
      } catch (error) {
        console.log("--.-",error)
      }
    }
    fetch_address()
  }, []);

  useEffect( () => {
    const fetch_str = async () => {
      try {
        // await checkPendingTransactions(WalletAddress)
        get_stellar()
      } catch (error) {
        console.log("---", error)
      }
    }
    fetch_str()
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchTransactions = async () => {
        try {
          const res = await getTransactions();
          console.log(res);
  
          const walletType = await AsyncStorageLib.getItem("walletType");
          const parsedWalletType = JSON.parse(walletType);
  
          console.log(parsedWalletType);
  
          if (parsedWalletType === "BSC") {
            checkIncomingTx(res ? res : [], "97");
          } else if (parsedWalletType === "Ethereum") {
            checkIncomingTx(res ? res : [], "5");
          } else if (parsedWalletType === "Matic") {
            checkIncomingTx(res ? res : [], "0x13881");
          } else if (parsedWalletType === "Xrp") {
            await getIncomingXrpTx(res ? res : [], "Xrp");
          } else if (parsedWalletType === "Multi-coin") {
          } else {
            // alert(`Saving receive tx for ${walletType} is  not supported yet`)
            console.log(`Saving receive tx for ${parsedWalletType} is not supported yet`);
          }
        } catch (e) {
          console.log(e);
        }
      };
  
      fetchTransactions();
    }, [])
  );
  
  // useFocusEffect(
  //   React.useCallback(() => {
  //     try {
  //       getTransactions().then(async (res) => {
  //         consolse.log(res);
  //         const walletType = await AsyncStorageLib.getItem("walletType");
  //         console.log(JSON.parse(walletType));
  //         if (JSON.parse(walletType) == "BSC") {
  //           checkIncomingTx(res ? res : [], "97");
  //         } else if (JSON.parse(walletType) == "Ethereum") {
  //           checkIncomingTx(res ? res : [], "5");
  //         } else if (JSON.parse(walletType) == "Matic") {
  //           checkIncomingTx(res ? res : [], "0x13881");
  //         } else if (JSON.parse(walletType) == "Xrp") {
  //           await getIncomingXrpTx(res ? res : [], "Xrp");
  //         } else if (JSON.parse(walletType) === "Multi-coin") {
  //         } else {
  //           // alert(`Saving receive tx for ${walletType} is  not supported yet`)
  //           console.log(JSON.parse(walletType));
  //         }
  //       });
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   }, [])
  // );

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <Animated.View // Special animatable View
      style={{ opacity: fadeAnim }}
    >
      <Modal
        // animationIn="slideInLeft"
        // animationOut="slideOutRight"
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={500}
        animationOutTiming={650}
        isVisible={modalVisible}
        useNativeDriver={true}
        useNativeDriverForBackdrop={true}
        backdropTransitionOutTiming={0}
        hideModalContentWhileAnimating
        statusBarTranslucent={true}
        style={[style.modal,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}
        onBackButtonPress={() => {
          setModalVisible(false);
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setModalVisible(false);
          }}
          style={{
            position: "absolute",
            top: 0,
            alignSelf: "flex-start",
            alignItems: "flex-start",
            padding: 15,
            width: "100%",
            // backgroundColor: "#4CA6EA",
          }}
        >
          <Icon
            // name={"left"}
            name={"close"}
            type={"antDesign"}
            size={30}
            // color={"#fff"}
            color={state.THEME.THEME===false?"black":"#fff"}
            onPress={() => {
              setModalVisible(false);
            }}
          />
        </TouchableOpacity>
        <View style={[style.barCode,{backgroundColor:state.THEME.THEME===false?"#fff":"black",borderColor: "#4169e",borderWidth:1}]}>
          <TouchableOpacity style={style.flatView}>
            <Image
              style={{ width: wp(10), height: hp(5) }}
              source={
                iconType === "BNB"? Bnbimage: iconType === "ETH"? Etherimage: iconType === "Xrp"? xrpImage: iconType==="XLM"?stellar:maticImage
              }
            />

            <Text style={{ marginHorizontal: wp(2), color: "#4169e1" }}>
              {iconType}
            </Text>
          </TouchableOpacity>

          <View style={{ alignSelf: "center", marginTop: hp(1) }}>
            <QRCode
              //QR code value
              value={iconType==="XLM"?Stellar_add:qrvalue ? qrvalue : "NA"}
              //size of QR Code
              size={250}
              //Color of the QR Code (Optional)
              color={state.THEME.THEME===false?"black":"#4169e1"}
              //Background Color of the QR Code (Optional)
              backgroundColor={state.THEME.THEME===false?"#fff":"black"}
              //Logo of in the center of QR Code (Optional)
              logo={{
                url: "https://raw.githubusercontent.com/AboutReact/sampleresource/master/logosmalltransparen.png",
              }}
              //Center Logo size  (Optional)
              logoSize={30}
              //Center Logo margin (Optional)
              logoMargin={2}
              //Center Logo radius (Optional)
              logoBorderRadius={15}
              //Center Logo background (Optional)
              // logoBackgroundColor="yellow"
            />
          </View>
          <Text style={[style.addressTxt,{color:state.THEME.THEME===false?"black":"#fff"}]}>
            {iconType==="XLM"?Stellar_add:WalletAddress ? WalletAddress :""}
          </Text>
        </View>

        <View style={style.btnView}>
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              style={style.copyBtn}
              onPress={() => {
                copyToClipboard();
                setSelected(true);
                setSelected1(false);
                // setSnackbarVisible(true)
              }}
            >
              <Icon
                name="content-copy"
                type={"materialCommunity"}
                size={20}
                color={"white"}
              />
            </TouchableOpacity>
            <Text style={style.btnTextColor}>Copy</Text>
          </View>

          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => {
                onShare();
                setSelected1(true);
                setSelected(false);
              }}
              style={style.amount}
            >
              <Icon name="share" type={"feather"} size={20} color={"#4169e1"} />
            </TouchableOpacity>

            <Text style={style.btnTextColor}>Share</Text>
          </View>
        </View>

        {/* <SnackBar
          visible={snackbarVisible}
          position={"bottom"}
          textMessage="New Receive Tx Found. Proceed to save it"
          actionHandler={() => {
            console.log("pressed");
            setTimeout(() => {
              console.log(newTx);
              saveTransactions(newTx);
              alert(
                "success",
                "Tx Saved! Check Transactions page for more details about the Tx"
              );
              setSnackbarVisible(false);
              setModalVisible(false);
              getAllBalances(state,dispatch)

              //navigation.navigate("Transactions")
            }, 0);
          }}
          actionText="Proceed"
        /> */}
      </Modal>
    </Animated.View>
  );
};

export default RecieveAddress;

const style = StyleSheet.create({
  Body: {
    backgroundColor: "white",
    height: hp(90),
    width: wp(95),
    alignSelf: "center",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "200",
    color: "black",
    marginTop: hp(5),
  },
  welcomeText2: {
    fontSize: 15,
    fontWeight: "200",
    color: "white",
    marginTop: hp(1),
  },
  Button: {
    marginTop: hp(10),
    width: wp(20),
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "space-between",
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
    width: wp("70"),
    paddingRight: wp("7"),
    backgroundColor: "white",
  },
  Box: {
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
    height: hp("17%"),
    width: wp("75"),
    fontSize: 20,
    fontWeight: "200",
    alignSelf: "center",
    color: "white",
    marginTop: hp(2),
    alignItems: "center",
    alignContent: "center",
    backgroundColor: "white",
    borderTopWidth: 1,
  },
  modal: {
    backgroundColor: "#fff",
    width: wp(100),
    top: 20,
    alignSelf: "center",
    alignItems: "center",
  },
  barCode: {
    backgroundColor: "#fff",
    height: hp(50),
    borderRadius: hp(1),
    width: wp(80),
    justifyContent: "center",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
    shadowRadius: wp(1),
    overflow: "hidden",
    shadowOpacity: 0.2,
    shadowColor: "#000",
    backgroundColor: "white",
    borderColor: "rgba(238, 227, 232,1)",
  },
  flatView: {
    flexDirection: "row",
    marginHorizontal: wp(5),
    padding: 10,
    alignItems: "center",
    alignSelf: "center",
  },
  addressTxt: {
    marginTop: hp(3),
    width: wp(54),
    alignSelf: "center",
    color: "black",
    fontWeight:"600"
  },
  btnView: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp(56),
    marginTop: hp(3),
  },
  copyBtn: {
    height: hp(6),
    width: hp(6),
    backgroundColor: "#4169e1",
    borderRadius: hp(3),
    alignItems: "center",
    justifyContent: "center",
  },
  amount: {
    height: hp(6),
    width: hp(6),
    backgroundColor: "rgba(115, 167, 242, 0.2)",
    borderRadius: hp(3),
    alignItems: "center",
    justifyContent: "center",
  },
  btnTextColor: { color: "#4169e1" },
});
