import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Alert,
  Modal,
  PermissionsAndroid,
  Linking
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSelector } from "react-redux";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { isInteger } from "lodash";
import { isFloat } from "validator";
import { RNCamera } from 'react-native-camera';
import { useToast } from "native-base";
import { Wallet_screen_header } from "../../../../reusables/ExchangeHeader";
import ErrorComponet from "../../../../../utilities/ErrorComponet";
import { Paste } from "../../../../../utilities/utilities";
import Icon from "../../../../../icon";
import { alert, ShowErrotoast, Showsuccesstoast } from "../../../../reusables/Toasts";
import { isAddress } from "ethers/lib/utils";
import { ethers } from "ethers";
import { PGET, PPOST, proxyRequest } from "../api";
import { getTokenBalancesUsingAddress } from "../utils/getWalletInfo/EtherWalletService";
const TokenSend = ({ route }) => {
  const toast = useToast();
  const FOCUSED = useIsFocused()
  const [show, setshow] = useState(false);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState();
  const [Loading, setLoading] = useState(false);
  const [balance, setBalance] = useState();
  const [disable, setdisable] = useState(false);
  const [Message, setMessage] = useState("");
  const [Payment_loading, setPayment_loading] = useState(false);
  const cameraRef = useRef(null);
  const state = useSelector((state) => state);
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [lastScannedData, setLastScannedData] = useState(null);
  const [ErroVisible, setErroVisible] = useState(false);





  const sendBNBToken = async (tokenAddress,tokenDecimals) => {
    try {
      const BNBERC20ABI = [
        "function transfer(address to, uint256 value) public returns (bool)"
      ];
      // Load wallet with private key
      const wallet = new ethers.Wallet(state?.wallet?.privateKey);
      // Load ERC-20 contract
      const tokenContract = new ethers.Contract(tokenAddress, BNBERC20ABI, wallet);
      // Fetch token decimals
      const decimals = tokenDecimals;
      // Convert amount to correct format
      const formattedAmount = ethers.utils.parseUnits(amount, decimals);
      const unsigned = await tokenContract.populateTransaction.transfer(address, formattedAmount);
      // Send transaction
      const {res,err} = await proxyRequest("/v1/bsc/transaction/prepare", PPOST, { unsignedTx:unsigned,walletAddress:wallet.address });
      const upgradedTx = {
        ...res,
        gasLimit: ethers.BigNumber.from(res.gasLimit),
        gasPrice: ethers.BigNumber.from(res.gasPrice),
        value: res.value ? ethers.BigNumber.from(res.value) : ethers.BigNumber.from(0),
      };
      const signedTx = await wallet.signTransaction(upgradedTx);
      const respoExe = await proxyRequest("/v1/bsc/transaction/broadcast", PPOST, {signedTx:signedTx});
      if(respoExe?.res?.txHash)
      {
        alert("success", `Transaction successful!`);
      }
    } catch (error) {
      console.log("Transaction Error:", error);
      alert("error", "Transaction failed. Check logs.");
    } finally {
      setAddress();
      setAmount();
      setdisable(false);
      setPayment_loading(false);
    }
  };
  // send Ether tokens
  const sendEthTokens = async (tokenAddress,tokenDecimals) => {
    try {
      const usdtAbi = [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function transfer(address to, uint256 amount) returns (bool)"
      ];
        // Load wallet with private key
        const wallet = new ethers.Wallet(state?.wallet?.privateKey);
        // Load ERC-20 contract
        const tokenContract = new ethers.Contract(tokenAddress, usdtAbi, wallet);
        // Fetch token decimals
        const decimals = tokenDecimals;
        // Convert amount to correct format
        const formattedAmount = ethers.utils.parseUnits(amount, decimals);
        const unsigned = await tokenContract.populateTransaction.transfer(address, formattedAmount);
        // Send transaction
      const preInfo = await proxyRequest(`/v1/eth/wallet-address/${wallet.address}/info`, PGET);
      if (preInfo.err) {
        alert("error", "Something went wrong...")
      }
      const upgradedTx = {
        ...unsigned,
        gasLimit: ethers.BigNumber.from(60000),
        gasPrice: ethers.BigNumber.from(preInfo.res.gasFeeData.gasPrice),
        nonce: preInfo.res.transactionCount,
        chainId: 11155111,
        value: ethers.BigNumber.from(0)
      };
      const signedTx = await wallet.signTransaction(upgradedTx);
      console.log("signedTx", upgradedTx)
      const respoExe = await proxyRequest("/v1/eth/transaction/broadcast", PPOST, { signedTx: signedTx });
      console.log("respoExe:00---", respoExe)
      if (respoExe?.res?.txHash) {
        alert("success", `Transaction successful!`);
      }
    } catch (error) {
      console.error("Transaction Error:", error);
      Alert.alert("Error", "Transaction failed. Check logs.");
    } finally {
      setAddress();
      setAmount();
      setdisable(false);
      setPayment_loading(false);
    }
  };


  const toggleModal = () => {
    checkPermission();
  };

  const onBarCodeRead = (e) => {
    if (e?.data && e?.data !== lastScannedData) {
      setLastScannedData(e?.data);
      setErroVisible(false)
      alert("success", "QR Code Decoded successfully..");
      setAddress("");
      setAddress(e?.data);
      setModalVisible(false);

      if (!validateTokenAddress(e?.data)) {
        setModalVisible(false);
        setErroVisible(false)
        setAddress("");
        setErroVisible(true)
      }
    }
  };
  const handleCameraStatus = (status) => {
    if (status === "NOT_AUTHORIZED") {
      setModalVisible(false);
      Alert.alert(
        "Camera Permissions Required.",
        "Please enable camera permissions in settings to scan QR code.",
        [
          { text: "Close", style: "cancel" },
          { text: "Open", onPress: () => Linking?.openSettings() },
        ]
      );
    }
  };
  useEffect(() => {
    const insilize = async () => {
      try {
        setErroVisible(false)
        setAddress()
        setAmount()
        setdisable(false)
        setLoading(true)
        setMessage();
        setPayment_loading(false);
        if (route?.params?.tokenType === "Ethereum") {
          const newToken = await fetchTokenInfo(route?.params?.tokenAddress);
          setBalance(newToken?.balance);
          setLoading(false);
        }
        else {
          const newToken = await fetchBNBTokenInfo(route?.params?.tokenAddress);
          setBalance(newToken?.balance);
          setLoading(false);
        }
      } catch (error) {
        console.log("-TokenEffect---", error)
        setBalance(0.00);
        setLoading(false);
      }
    }
    insilize()
  }, [FOCUSED])
  useEffect(() => {
    const new_data = async () => {
      try {
        let inputValidation;
        let inputValidation1;
        if (amount) {
          inputValidation = isFloat(amount);
          inputValidation1 = isInteger(amount);
          console.log(amount, balance, JSON.stringify(balance) < JSON.stringify(amount))
          if (Number(balance) < Number(amount)) {
            setMessage("Low Balance");
            setdisable(true)
          } else if (!inputValidation && !inputValidation1) {
            setMessage("Please enter a valid amount");
            setdisable(true)
          } else {
            setdisable(false)
            setMessage("");
          }
        }
      } catch (error) {
        console.log("Token Send Error=", error)
      }
    }
    new_data()
  }, [amount]);

  // Fetch token details
  const fetchTokenInfo = async (address) => {
    try {
      if (address && state?.wallet?.address) {
        const fetchedTokens = await getTokenBalancesUsingAddress(address, state?.wallet?.address, "ETH")
        console.log("walleetREspo--", fetchedTokens)
        if (fetchedTokens.status) {
          return fetchedTokens.tokenInfo[0]
        }
      }
    } catch (error) {
      console.error(`Error fetching token info for ${address}:`, error);
      throw new Error('Invalid token address or failed to fetch data');
    }
  };

  // Fetch BNB token details
  const fetchBNBTokenInfo = async (address) => {
    try {
      if (address && state?.wallet?.address) {
        const fetchedTokens = await getTokenBalancesUsingAddress(address, state?.wallet?.address, "BSC")
        console.log("walleetREspo--", fetchedTokens)
        if (fetchedTokens.status) {
          return fetchedTokens.tokenInfo[0]
        }
      }
    } catch (error) {
      console.error(`Error fetching token info for ${address}:`, error);
      throw new Error('Invalid token address or failed to fetch data');
    }
  };

  const handleUsernameChange = (text) => {
    // Remove whitespace from the username
    const formattedUsername = text.replace(/\s/g, '');
    setAddress(formattedUsername);
  };
  function validateTokenAddress(address) {
    try {
      if (!address || address.length !== 42) {
        setAddress('');
        alert("error", 'Please enter a valid token contract address.');
        return false;
      }
      if (!isAddress(address)) {
        setAddress('');
        alert("error", "Invalid Token address.");
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  const checkPermission = async () => {
    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      if (result === true) {
        setModalVisible(!isModalVisible);
      } else {
        const requestResult = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        if (requestResult === PermissionsAndroid.RESULTS.GRANTED) {
          setModalVisible(!isModalVisible);
        } else {
          ShowErrotoast(toast, "Permissions not allowed");
        }
      }
    } else {
      // iOS permission is handled through Info.plist
      setModalVisible(!isModalVisible);
    }
  };


  // Reset lastScannedData when modal is closed
  useEffect(() => {
    if (!isModalVisible) {
      setLastScannedData(null);
    }
  }, [isModalVisible]);
  return (
    <>
      <Wallet_screen_header title="Send" onLeftIconPress={() => navigation.goBack()} />
      <ErrorComponet
        isVisible={ErroVisible}
        onClose={() => setErroVisible(false)}
        message="The scanned QR code contains an invalid public key. Please make sure you're scanning the correct QR code and try again."
      />
      <View style={{ backgroundColor: state.THEME.THEME === false ? "#fff" : "black", height: hp(100) }}>
        <View style={style.inputView}>
          <TextInput
            value={address}
            onChangeText={(input) => {
              console.log(input);
              handleUsernameChange(input);
            }}
            placeholder="Recipient Address"
            placeholderTextColor={"gray"}
            style={[style.input, { color: state.THEME.THEME === false ? "black" : "#fff" }]}
          />
          <TouchableOpacity onPress={() => { toggleModal() }}>
            <Icon name="scan" type={"ionicon"} size={20} color={"blue"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            Paste(setAddress)
          }}>
            <Text style={style.pasteText}>PASTE</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", width: wp(90) }}>
          <Text style={[style.balance_heading, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Available balance :-{" "}</Text>
          <View style={{ width: wp(13), flexDirection: "row" }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: wp(11) }}>
              <Text style={[style.balance, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>
                {balance ? balance : show === false ? <Text style={{ color: "#C1BDBD" }}>0</Text> : <></>}
              </Text>
            </ScrollView>
          </View>
          <View style={{ height: "100%" }}>
            {Loading === true ? <ActivityIndicator color={"green"} style={{ marginTop: 15, marginLeft: 5 }} /> : <></>}
          </View>
        </View>
        <View style={style.inputView}>
          <TextInput
            value={amount}
            keyboardType="numeric"
            returnKeyType="done"
            onChangeText={(input) => {
              console.log(input);
              setAmount(input);
            }}
            placeholder="Amount"
            placeholderTextColor={"gray"}
            style={[style.input, { color: state.THEME.THEME === false ? "black" : "#fff" }]}
          ></TextInput>
          <TouchableOpacity
            onPress={() => {
              if (!balance || parseFloat(balance) === 0) {
                ShowErrotoast(toast, "Invalid Amount");
              } else {
                setAmount(balance);
              }
            }}
          >
            <Text style={{ color: "blue" }}>MAX</Text>
          </TouchableOpacity>
        </View>
        <Text style={style.msgText}>{Message}</Text>

        <TouchableOpacity
          disabled={disable}
          style={[style.btnView, { backgroundColor: disable ? "gray" : "#3574B6" }]}
          onPress={() => {
            Keyboard.dismiss()
            setPayment_loading(true);
            if (!amount || parseFloat(amount) === 0) {
              ShowErrotoast(toast, "Invalid Amount");
              setPayment_loading(false);
              setAmount('')
            } else {
              if (!address || !amount) {
                ShowErrotoast(toast, "Recipient Address and Amount Required")
                setPayment_loading(false);
              }
              else {
                setdisable(true)
                if (validateTokenAddress(address)) {
                  Showsuccesstoast(toast, "Valid token address");
                  // sendToken(walletPublickKey, address, amount) --TO DO
                  if (route?.params?.tokenType === "Binance") {
                    sendBNBToken(route?.params?.tokenAddress,route?.params?.tokenDecimals)
                  }
                  if (route?.params?.tokenType === "Ethereum") {
                    sendEthTokens(route?.params?.tokenAddress,route?.params?.tokenDecimals)
                  }
                } else {
                  console.log('Invalid token address');
                  ShowErrotoast(toast, "Invalid token address");
                  setAddress();
                  setdisable(false);
                  setPayment_loading(false);
                }
              }
            }
          }}
        >
          {Payment_loading === true ? <ActivityIndicator color={"#fff"} /> : <Text style={{ color: "#fff", fontSize: 16 }}>Send</Text>}
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <RNCamera
          ref={cameraRef}
          style={style.preview}
          onBarCodeRead={onBarCodeRead}
          captureAudio={false}
          onStatusChange={({ status }) => handleCameraStatus(status)} // Use onStatusChange
        >
          <>
            <View style={style.header}>
              <TouchableOpacity onPress={() => { setModalVisible(false); }}>
                <Icon name="arrow-left" size={24} color="#fff" style={style.backIcon} />
              </TouchableOpacity>
              <Text style={[style.title, { marginTop: Platform.OS === "ios" ? hp(5) : 0 }]}>Scan QR Code</Text>
            </View>
            <View style={style.rectangleContainer}>
              <View style={style.rectangle}>
                <View style={style.innerRectangle} />
              </View>
            </View>
          </>
        </RNCamera>
      </Modal>
    </>

  );
};

export default TokenSend;

const style = StyleSheet.create({
  Body: {
    display: "flex",
    backgroundColor: "white",
    height: hp(100),
    width: wp(100),
  },
  Text: {
    fontSize: 18,
    color: "black",
  },
  welcomeText2: {
    fontSize: 15,
    fontWeight: "200",
    color: "white",
    marginTop: hp(1),
  },
  Button: {
    marginTop: hp(10),
  },

  Text: {
    marginTop: hp(5),
    fontSize: 15,
    fontWeight: "200",
    color: "white",
  },
  textInput2: {
    borderWidth: 1,
    borderColor: "grey",
    width: wp(90),
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    height: wp(8),
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.0,

    elevation: 24,
  },
  inputView: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    width: wp(93),
    alignSelf: "center",
    borderColor: "#C1BDBD",
    marginTop: hp(3),
    paddingVertical: hp(1.5),
    borderRadius: hp(1),
  },
  pasteText: { color: "blue", marginHorizontal: wp(3) },
  balance: { marginLeft: wp(1), marginTop: hp(2) },
  balance_heading: { marginLeft: wp(5), marginTop: hp(2) },
  extraInfoCon: { flexDirection: "row", alignItems: "center", marginLeft: wp(5), marginTop: hp(1.5), marginBottom: wp(-3) },
  input: {
    width: wp(70),
    alignSelf: "center",
    paddingHorizontal: wp(4),
  },
  msgText: { color: "red", textAlign: "center" },
  btnView: { width: wp(40), height: hp(6.6), alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: hp(8), backgroundColor: "blue", borderRadius: 19 },
  QR_con: {
    width: wp(80),
    height: hp(40),
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center"
  },
  preview: {
    flex: 1
  },
  rectangleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rectangle: {
    height: 250,
    width: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    height: hp(10),
  },
  backIcon: {
    marginRight: wp(28),
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#fff"
  },
  AccountmodalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  AccounsubContainer: {
    backgroundColor: "#131E3A",
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: "98%",
    height: "29%",
    justifyContent: "center"
  },
  AccounbtnContainer: {
    width: wp(39),
    height: hp(5),
    backgroundColor: "rgba(33, 43, 83, 1)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderColor: "#4CA6EA",
    borderWidth: 1
  },
  Accounbtntext: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff"
  },
  AccounheadingContainer: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    color: "#fff"
  }
});