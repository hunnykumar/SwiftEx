import { useIsFocused, useNavigation } from "@react-navigation/native";
import { ActivityIndicator, Alert, Image, Keyboard, Linking, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { REACT_APP_LOCAL_TOKEN } from "../../ExchangeConstants";
import { useEffect, useRef, useState } from "react";
import Icon from "../../../../../../icon";
import darkBlue from "../../../../../../../assets/darkBlue.png";
import Bridge from "../../../../../../../assets/Bridge.png";
import QRCode from "react-native-qrcode-svg";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { useSelector } from "react-redux";
import { RNCamera } from 'react-native-camera';
import { Exchange_screen_header } from "../../../../../reusables/ExchangeHeader";
import { alert } from "../../../../../reusables/Toasts";
import { STELLAR_URL } from "../../../../../constants";
import { SaveTransaction } from "../../../../../../utilities/utilities";
import Snackbar from "react-native-snackbar";
import ErrorComponet from "../../../../../../utilities/ErrorComponet";
import { GetStellarAvilabelBalance, GetStellarUSDCAvilabelBalance } from "../../../../../../utilities/StellarUtils";
const StellarSdk = require('stellar-sdk');
StellarSdk.Network.useTestNetwork();

const send_recive = ({route}) => {
    const {bala,asset_name}=route.params;
    console.log("----------------usdtAsse-----------------",bala,asset_name)
    const usdtAsset = new StellarSdk.Asset("USDC", "GALANI4WK6ZICIQXLRSBYNGJMVVH3XTZYFNIVIDZ4QA33GJLSFH2BSID");
  const cameraRef = useRef(null);
    const state = useSelector((state) => state);
    const FOCUSED = useIsFocused();
    const navigation = useNavigation();
    const [modalContainer_menu, setmodalContainer_menu] = useState(false);
    const [mode_selected, setmode_selected] = useState("SED");
    const [recepi_address, setrecepi_address] = useState("");
    const [recepi_memo, setrecepi_memo] = useState("");
    const [recepi_amount, setrecepi_amount] = useState("");
    const [lastScannedData, setLastScannedData] = useState(null);
    const [Payment_loading,setPayment_loading]=useState(false);
    const [qrvalue, setqrvalue] = useState("");
    const [isModalVisible, setModalVisible] = useState(false);
    const [ErroVisible,setErroVisible]=useState(false);
    const [resStellarbal, setresStellarbal] = useState("");
    const [Loading, setLoading] = useState(false);


  const onBarCodeRead = (e) => {
    if (e?.data && e?.data !== lastScannedData) {
      setLastScannedData(e?.data); // Update the last scanned data
      setErroVisible(false)
      alert("success", "QR Code Decoded successfully..");
      setrecepi_address(e?.data);
      setModalVisible(false);
  
      if (!validateStellarAddress(e?.data)) {
        setModalVisible(false);
        setErroVisible(false)
        setrecepi_address("");
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
          { text: "Open", onPress: () => Linking.openSettings() },
        ]
      );
    }
    // No need to explicitly toggle modal visibility on "READY"
    // Let `toggleModal` or user actions handle visibility
  };
    const toggleModal = () => {
        setModalVisible(!isModalVisible);
      };

    const get_data=async()=>{
      setresStellarbal(0.00)
        // setLoading(true);
            setqrvalue(state?.wallet?.xrp?.address)
            // if(asset_name==="native")
            // {
            //   GetStellarAvilabelBalance(state?.STELLAR_PUBLICK_KEY).then((result) => {
            //     setresStellarbal(result?.availableBalance)
            //     setLoading(false);
            //   }).catch(error => {
            //     console.log('Error loading account:', error);
            //     setLoading(false);
            //   });
            // }
            // if(asset_name==="USDC"||asset_name==="ETH"||asset_name==="BTC")
            // {
            //   GetStellarUSDCAvilabelBalance(state?.STELLAR_PUBLICK_KEY,asset_name).then((result) => {
            //     console.log("-------jhdkjas",result)
            //     setresStellarbal(result?.availableBalance)
            //     setLoading(false);
            //   }).catch(error => {
            //     console.log('Error loading account:', error);
            //     setLoading(false);
            //   });
            // }
    }
    function validateStellarAddress(address) {
      if (address.length !== 56 || address[0] !== 'G') {
          return false;
      }
      try {
          StellarSdk.StrKey.decodeEd25519PublicKey(address);
          return true;
      } catch (e) {
          return false;
      }
  }
  async function send_XLM(sourceSecret, destinationPublic, amount) {
    Keyboard.dismiss();
    try {
    const server = new StellarSdk.Server(STELLAR_URL.URL);
    StellarSdk.Networks.TESTNET;
      // Load the source account
      const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
      const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
  
      // Create the transaction
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: await server.fetchBaseFee(),
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destinationPublic,
            asset: asset_name==="native"?StellarSdk.Asset.native():usdtAsset,
            amount: amount,
          })
        )
        .addMemo(StellarSdk.Memo.text(recepi_memo)) 
        .setTimeout(30)
        .build();
  
      // Sign the transaction
      transaction.sign(sourceKeypair);
  
      // Submit the transaction
      const transactionResult = await server.submitTransaction(transaction);
      console.log('Transaction successful!', transactionResult);
      Snackbar.show({
        text: "Transaction successful!",
        duration: Snackbar.LENGTH_LONG,
        backgroundColor:'green', 
      });
      setrecepi_address('');
      setrecepi_amount('');
      setrecepi_memo('');
      setPayment_loading(false);
      try {
        const user_current = await state.user;
        const type = "Send";
        const chainType = "XLM";
        const walletType=await state.walletType;
        const saveTransaction = await SaveTransaction(
          type,
          transactionResult.hash,
          user_current,
          chainType,
          walletType,
          chainType
        );
        console.log(saveTransaction);
        navigation.navigate("Transactions");
      } catch (e) {
        console.log(e);
      }
    } catch (error) {
      console.error('Error sending XLM:', error);
      Snackbar.show({
        text: "Transaction Failed",
        duration: Snackbar.LENGTH_LONG,
        backgroundColor:'red', 
      });
      setrecepi_address('');
      setrecepi_amount('');
      setrecepi_memo('');
      setPayment_loading(false);
    }
  }


  const Send_Asseet = async () => {
    Keyboard.dismiss()
    setPayment_loading(true);
    try {
      if (!recepi_address || !recepi_amount) {
        Snackbar.show({
          text: "Recipient Address and Amount Required.",
          duration: Snackbar.LENGTH_LONG,
          backgroundColor:'red', 
      });
        setPayment_loading(false);
      }else {
        if (validateStellarAddress(recepi_address)) {
          Snackbar.show({
            text: "Valid Stellar address",
            duration: Snackbar.LENGTH_LONG,
            backgroundColor:'green', 
        });
          if(parseFloat(recepi_amount)>(asset_name==="native"?resStellarbal:resStellarbal))
          {
            Snackbar.show({
              text: "Insuficint balance",
              duration: Snackbar.LENGTH_LONG,
              backgroundColor:'red', 
          });
            setPayment_loading(false);
          }
          else{
           if(parseFloat(recepi_amount)===0)
           {
             Snackbar.show({
               text: "Invalid amount",
               duration: Snackbar.LENGTH_LONG,
               backgroundColor: 'red',
             });
            setPayment_loading(false);
           }else{
            send_XLM(state.STELLAR_SECRET_KEY, recepi_address, recepi_amount)
           }
          }
        } else {
          Snackbar.show({
            text: "Invalid Stellar address",
            duration: Snackbar.LENGTH_LONG,
            backgroundColor:'red', 
        });
          setrecepi_address('');
          setrecepi_amount('');
          setrecepi_memo('');
          setPayment_loading(false);
        }
      }
    } catch (error) {
      console.log("---Send_Asset---", error)
      setPayment_loading(false);
    }
  }

    useEffect(() => {
        setLoading(false)
        setErroVisible(false)
        setPayment_loading(false)
        get_data()
        setmode_selected("SED");
    }, [FOCUSED])

  // Reset lastScannedData when modal is closed
  useEffect(() => {
    if (!isModalVisible) {
      setLastScannedData(null);
    }
  }, [isModalVisible]);
    return (
        <>
     <Exchange_screen_header title="Transaction" onLeftIconPress={() => navigation.goBack()} onRightIconPress={() => console.log('Pressed')} />
     <ErrorComponet
          isVisible={ErroVisible}
          onClose={() => setErroVisible(false)}
          message="The scanned QR code contains an invalid public key. Please make sure you're scanning the correct QR code and try again."
        />
            <View style={styles.main_con}>
                <View style={styles.mode_con}>
                    <TouchableOpacity style={[styles.mode_sele, { backgroundColor: mode_selected === "SED" ? "green" : "#011434" }]} onPress={() => { setmode_selected("SED") }}>
                        <Text style={styles.mode_text}>Send</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.mode_sele, { backgroundColor: mode_selected === "RVC" ? "green" : "#011434" }]} onPress={() => { setmode_selected("RVC") }}>
                        <Text style={styles.mode_text}>Receive</Text>
                    </TouchableOpacity>
                </View>
                {
                    mode_selected === "SED" ?
                        <>
                            <View style={[styles.text_input,{flexDirection:"row",alignItems:"center"}]}>
                            <TextInput placeholder="Enter stellar address" placeholderTextColor={"gray"} value={recepi_address} style={{height:"100%",width:"80%",fontSize:19,color:"#fff"}}  onChangeText={(value) => { setrecepi_address(value) }} />
                           <TouchableOpacity onPress={()=>{toggleModal();}}>
                            <Icon
                            name={"qrcode-scan"}
                            type={"materialCommunity"}
                            size={28}
                            color={"white"}
                            />
                            </TouchableOpacity>
                            </View>
                            <Text style={[styles.mode_text, { textAlign: "left", marginLeft: 19, fontSize: 16, marginTop: 10 }]}>Available: {resStellarbal}</Text>
                            <Text style={[styles.mode_text, { textAlign: "left", marginLeft: 19, fontSize: 18, marginTop: 15 }]}>Amount</Text>
                            <TextInput placeholder="Enter amount" placeholderTextColor={"gray"} value={recepi_amount} returnKeyType="done" keyboardType="number-pad" style={[styles.text_input,{marginTop: 2}]} onChangeText={(value) => { setrecepi_amount(value) }} />
                            <Text style={[styles.mode_text, { textAlign: "left", marginLeft: 19, fontSize: 18, marginTop: 15 }]}>Transaction memo</Text>
                            <TextInput placeholder="Enter transaction memo" placeholderTextColor={"gray"} value={recepi_memo} style={[styles.text_input,{marginTop: 2}]} onChangeText={(value) => { setrecepi_memo(value) }} />

                            <TouchableOpacity disabled={Payment_loading} style={[styles.mode_sele, { height: 60, backgroundColor: Payment_loading  ? "#011434" : "green", marginTop: 40, alignSelf: "center" }]} onPress={() => {Send_Asseet()}}>
                                {Payment_loading?<ActivityIndicator color={"green"}/>:<Text style={styles.mode_text}>Send</Text>}
                            </TouchableOpacity>
                        </> :
                        <View style={styles.QR_con}>
                            <View style={{ alignSelf: "center", marginTop: hp(5) }}>
                                <QRCode
                                    value={qrvalue ? qrvalue : "NA"}
                                    size={250}
                                    color="black"
                                    backgroundColor="white"
                                    logo={{
                                        url: "https://raw.githubusercontent.com/AboutReact/sampleresource/master/logosmalltransparen.png",
                                    }}
                                    logoSize={30}
                                    logoMargin={2}
                                    logoBorderRadius={15}
                                />
                            </View>
                            <Text style={styles.addressTxt}>
                                {qrvalue ? qrvalue : ""}
                            </Text>
                        </View>
                }
           <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
         <RNCamera
            ref={cameraRef}
            style={styles.preview}
            onBarCodeRead={onBarCodeRead}
            captureAudio={false}
            onStatusChange={({ status }) => handleCameraStatus(status)} // Use onStatusChange
          >
            <>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => { setModalVisible(false); }}>
                  <Icon name="arrow-left" size={24} color="#fff" style={styles.backIcon} />
                </TouchableOpacity>
                <Text style={[styles.title, { marginTop: Platform.OS === "ios" ? hp(5) : 0 }]}>Scan QR Code</Text>
              </View>
              <View style={styles.rectangleContainer}>
                <View style={styles.rectangle}>
                  <View style={styles.innerRectangle} />
                </View>
              </View>
            </>
          </RNCamera>
    </Modal>
            </View>
        </>
    )
}
const styles = StyleSheet.create({
    main_con: {
        backgroundColor: "#011434",
        height: "100%"
    },
    QR_con: {
        alignSelf: "center",
        marginTop: hp(10),
        backgroundColor: "#fff",
        height: 390,
        width: 300,
        borderRadius: 10
    },
    addressTxt: {
        marginTop: hp(3),
        width: wp(65),
        alignSelf: "center",
        color: "black",
        fontWeight: "600"
    },
    mode_con: {
        height: 60,
        width: "100%",
        flexDirection: "row",
        alignSelf: "center",
        justifyContent: "space-around",
        marginTop: 10
    },
    text_input: {
        alignSelf: "center",
        color: "#fff",
        height: 50,
        width: "95%",
        fontSize: 20,
        borderWidth: 1.9,
        borderColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
        borderRadius: 19,
        paddingLeft: 10,
        marginTop: 19
    },
    mode_text: {
        color: "#fff",
        textAlign: "center",
        fontSize: 21,
        fontWeight: "bold",
    },
    mode_sele: {
        height: "90%",
        width: "45%",
        borderWidth: 1.9,
        borderColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
        borderRadius: 19,
        justifyContent: "center"
    },
    headerContainer1_TOP: {
        backgroundColor: "#4CA6EA",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "center",
        flexDirection: "row",
        width: wp(100),
        paddingHorizontal: wp(0.3),
    },
    logoImg_TOP: {
        height: hp("8"),
        width: wp("12"),
        marginLeft: wp(22),
    },
    text_TOP: {
        color: "white",
        fontSize: 19,
        fontWeight: "bold",
        alignSelf: "center",
        marginStart: wp(34)
    },
    text1_ios_TOP: {
        // alignSelf:"center",
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        paddingTop:hp(3),
        marginStart: wp(29)
    },
    modalContainer_option_top: {
        // flex: 1,
        alignSelf: "flex-end",
        alignItems: 'center',
        // backgroundColor: 'rgba(0, 0, 0, 0.3)',
        width: "100%",
        height: "60%",
    },
    modalContainer_option_sub: {
        alignSelf: "flex-end",
        backgroundColor: 'rgba(33, 43, 83, 1)',
        padding: 10,
        borderRadius: 10,
        width: "65%",
        height: "70%"
    },
    modalContainer_option_view: {
        flexDirection: "row",
        marginTop: 25,
        alignItems: "center",
    },
    modalContainer_option_text: {
        fontSize: 20,
        fontWeight: "bold",
        color: "gray",
        marginStart: 5
    },
    QR_scan_con:{
        width:wp(80),
        height:hp(40),
        borderRadius:5,
        justifyContent:"center",
        alignItems:"center"
      },
      preview: {
        flex:1
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
        height: 60,
      },
      backIcon: {
        marginRight:wp(28),
      },
      title: {
        fontSize: 18,
        fontWeight: 'bold',
        color:"#fff"
      },
})
export default send_recive;