import { Paste, SaveTransaction } from "../../utilities/utilities";
import React, { useRef, useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Platform,
    Image,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Button,
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
import { Animated } from "react-native";

import { useDispatch, useSelector } from "react-redux";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Icon from "../../icon";
import darkBlue from "../../../assets/darkBlue.png"
import { delay, isInteger } from "lodash";
import { ShowErrotoast, Showsuccesstoast, alert } from "../reusables/Toasts";
import { isFloat } from "validator";
import { RNCamera } from 'react-native-camera';
import { REACT_APP_LOCAL_TOKEN } from "../exchange/crypto-exchange-front-end-main/src/ExchangeConstants";
import { useToast } from "native-base";
import { STELLAR_URL } from "../constants";
import { Wallet_screen_header } from "../reusables/ExchangeHeader";
import ErrorComponet from "../../utilities/ErrorComponet";
import { GetStellarAvilabelBalance } from "../../utilities/StellarUtils";
import StellarAccountReserve from "../exchange/crypto-exchange-front-end-main/src/utils/StellarReserveComponent";
import WalletActivationComponent from "../exchange/crypto-exchange-front-end-main/src/utils/WalletActivationComponent";
// const StellarSdK = require('stellar-base');
import * as StellarSdk from '@stellar/stellar-sdk';
StellarSdk.Networks.PUBLIC
const SendXLM = (props) => {
    const toast=useToast();
    const FOCUSED = useIsFocused()
    const [show, setshow] = useState(false);
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState();
    const [Loading, setLoading] = useState(false);
    const [balance, setBalance] = useState();
    const [reservedBalance, setreservedBalance] = useState();
    const [steller_key, setsteller_key] = useState();
    const [steller_key_private, setsteller_key_private] = useState();
    const [disable, setdisable] = useState(false);
    const [ACTIVATION_MODAL, setACTIVATION_MODAL] = useState(false);
    const [ACTIVATION_MODAL_PROD, setACTIVATION_MODAL_PROD] = useState(false);
    const [Message, setMessage] = useState("");
    const [Payment_loading,setPayment_loading]=useState(false);
    const cameraRef = useRef(null);
    const [qrData, setQrData] = useState('');
    const state = useSelector((state) => state);
    const navigation = useNavigation();
    const [isModalVisible, setModalVisible] = useState(false);
    const [token, settoken] = useState("");
    const [lastScannedData, setLastScannedData] = useState(null);
    const [ErroVisible,setErroVisible]=useState(false);
    const [reservedError, setreservedError] = useState(false);
    const toggleModal = () => {
        checkPermission();
    };

    const onBarCodeRead = (e) => {
      if (e?.data && e?.data !== lastScannedData) {
        setLastScannedData(e?.data); // Update the last scanned data
        setErroVisible(false)
        alert("success", "QR Code Decoded successfully..");
        setAddress("");
        setAddress(e?.data);
        setModalVisible(false);
    
        if (!validateStellarAddress(e?.data)) {
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
      // No need to explicitly toggle modal visibility on "READY"
      // Let `toggleModal` or user actions handle visibility
    };
    useEffect(() => {
    const insilize=async()=>{
      try {
        setreservedError(false)
        setErroVisible(false)
        const token_1 = await AsyncStorageLib.getItem(REACT_APP_LOCAL_TOKEN);
        settoken(token_1)
        setACTIVATION_MODAL(false)
        setACTIVATION_MODAL_PROD(false)
          setAddress()
          setAmount()
          setdisable(false)
          getData()
          setLoading(true)
          setMessage();
          setPayment_loading(false);
      } catch (error) {
        console.log("----",error)
      }
    }
    insilize()
    }, [])
    useEffect(() => {
      const insilize1=async()=>{
        try {
            getData()
            setMessage();
        } catch (error) {
          console.log("----",error)
        }
      }
      insilize1()
      }, [ACTIVATION_MODAL_PROD])
    
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
        console.log("=", error)
      }
    }
    new_data()
  }, [amount]);
    const getData = async () => {
        try {
          setsteller_key(state.STELLAR_PUBLICK_KEY)
          setsteller_key_private(state.STELLAR_SECRET_KEY)
            get_stellar(state.STELLAR_PUBLICK_KEY);
            // const data = await AsyncStorageLib.getItem('myDataKey');
            // if (data) {
            //     const parsedData = JSON.parse(data);
            //     const matchedData = parsedData.filter(item => item.Ether_address === state.wallet.address);
            //     const publicKey = matchedData[0].publicKey;
            //     setsteller_key(publicKey)
            //     get_stellar(publicKey);
            //     const secretKey_Key = matchedData[0].secretKey;
            //     setsteller_key_private(secretKey_Key)
            // } else {
            //     console.log('No data found for key steller keys');
            // }
        } catch (error) {
            console.error('Error getting data for key steller keys:', error);
        }
    }

    const get_stellar = async (steller_key) => {
      StellarSdk.Networks.PUBLIC
      const server = new StellarSdk.Horizon.Server(STELLAR_URL.URL);
        server.loadAccount(steller_key)
            .then(account => {
                account.balances.forEach(balance => {
                    if (balance.asset_type === "native") {
                      GetStellarAvilabelBalance(steller_key).then((result) => {
                        setBalance(result?.availableBalance)
                        setreservedBalance(result?.totalReserved)
                        setLoading(false);
                        }).catch(error => {
                          console.log('Error loading account:', error);
                          setLoading(false);
                      });
                        // console.log(`${balance.asset_code}: ${balance.balance}`);
                        // setBalance(balance.balance)
                    }
                });
                // setLoading(false)
            })
            .catch(error => {
                console.log('Error loading account:', error);
                setLoading(false);
                setdisable(true);
                setMessage("Activation required for Stellar Account")
                if(STELLAR_URL.USERTYPE!=="PROD"){
                  setACTIVATION_MODAL(true)
                }
                else{
                  setACTIVATION_MODAL_PROD(true);
                }
            });
    }
    const ActivateModal = () => {
      setACTIVATION_MODAL_PROD(false);
      navigation.goBack()
    };
    const handleUsernameChange = (text) => {
        // Remove whitespace from the username
        const formattedUsername = text.replace(/\s/g, '');
        setAddress(formattedUsername);
    };
    function validateStellarAddress(address) {
        // Check if the address is 56 characters long and starts with 'G'
        if (address.length !== 56 || address[0] !== 'G') {
            return false;
        }
        try {
            // Use StellarSdk to verify if it's a valid Stellar address
            StellarSdk.StrKey.decodeEd25519PublicKey(address);
            return true;
        } catch (e) {
            return false;
        }
    }

        async function send_XLM(sourceSecret, destinationPublic, amount) {
            Keyboard.dismiss();
            try {
              Showsuccesstoast(toast,"Sending Payment");
              const server = new StellarSdk.Horizon.Server(STELLAR_URL.URL);
              StellarSdk.Networks.PUBLIC;
              // Load the source account
              const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
              const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
          
              // Create the transaction
              const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
                  fee: await server.fetchBaseFee(),
                  networkPassphrase: StellarSdk.Networks.PUBLIC,
              })
              .addOperation(
                  StellarSdk.Operation.payment({
                      destination: destinationPublic,
                      asset: StellarSdk.Asset.native(),
                      amount: amount,
                  })
              )
              .setTimeout(30)
              .build();
          
              // Sign the transaction
              transaction.sign(sourceKeypair);
          
              // Submit the transaction
              const transactionResult = await server.submitTransaction(transaction);
              console.log('Transaction successful!', transactionResult);
              Showsuccesstoast(toast,"Transaction successful!");
              setdisable(false);
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
                await get_stellar(steller_key);
                setAmount('')
                setAddress('')
                navigation.navigate("Transactions",{txType:"STR"});
              } catch (e) {
                console.log(e);
                setAmount('')
                setAddress('')
              }
            } catch (error) {
              setAmount('')
              setAddress('')
              console.error('Error sending XLM:', error);
              ShowErrotoast(toast,"Transaction Failed");
              setdisable(false);
              setPayment_loading(false);
            }
          }
        
            const checkPermission = async () => {
              if (Platform.OS === 'android') {
                const result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
                if (result===true) {
                    setModalVisible(!isModalVisible);
                } else {
                  const requestResult = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
                  if (requestResult === PermissionsAndroid.RESULTS.GRANTED) {
                    setModalVisible(!isModalVisible);
                  } else {
                    ShowErrotoast(toast,"Permissions not allowed");
                  }
                }
              } else {
                // iOS permission is handled through Info.plist
                setModalVisible(!isModalVisible);
              }
            };
            
            const CHECK_LOGIN=async()=>{
              token ?[setACTIVATION_MODAL(false),navigation.navigate("exchange")]:[setACTIVATION_MODAL(false),navigation.navigate("exchangeLogin")]
            }
            const handleCloseModal = () => {
              setreservedError(false);
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
         <WalletActivationComponent 
       isVisible={ACTIVATION_MODAL_PROD}
       onClose={() => {ActivateModal}}
       onActivate={()=>{setACTIVATION_MODAL_PROD(false)}}
       navigation={navigation}
       appTheme={state.THEME.THEME}
       shouldNavigateBack={true}
      />
         <StellarAccountReserve
                isVisible={reservedError}
                onClose={handleCloseModal}
                title="Reserved"
              />
            <View style={{ backgroundColor: state.THEME.THEME===false?"#fff":"black", height: hp(100) }}>
                <View style={style.inputView}>
                    <TextInput
                        value={address}
                        onChangeText={(input) => {
                            console.log(input);
                            handleUsernameChange(input);
                        }}
                        placeholder="Recipient Address"
                        placeholderTextColor={"gray"}
                        style={[style.input,{color:state.THEME.THEME===false?"black":"#fff"}]}
                    />
                    <TouchableOpacity onPress={() => {toggleModal()}}>
                        <Icon name="scan" type={"ionicon"} size={20} color={"blue"} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        Paste(setAddress)
                    }}>
                        <Text style={style.pasteText}>PASTE</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: "row", width: wp(90) }}>
                    <Text style={[style.balance_heading,{color:state.THEME.THEME===false?"black":"#fff"}]}>Available balance :-{" "}</Text>
                    <View style={{ width: wp(13), flexDirection: "row" }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: wp(11) }}>
                            <Text style={[style.balance,{color:state.THEME.THEME===false?"black":"#fff"}]}>
                                {balance ? balance : show === false ? <Text style={{ color: "#C1BDBD" }}>0</Text> : <></>}
                            </Text>
                        </ScrollView>
                    </View>
                    <View style={{ height: "100%" }}>
                        {Loading === true ? <ActivityIndicator color={"green"} style={{ marginTop: 15, marginLeft: 5 }} /> : <></>}
                    </View>
                </View>
          <TouchableOpacity style={style.extraInfoCon} onPress={() => {setreservedError(!reservedError)}}>
            <Icon
              name={"information-outline"}
              type={"materialCommunity"}
              color={"rgba(129, 108, 255, 0.97)"}
              size={21}
            />
            <Text style={[{ color: state.THEME.THEME === false ? "black" : "#fff" }]}> {!reservedBalance?"":reservedBalance+" XLM are reserved"}</Text>
          </TouchableOpacity>
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
                        style={[style.input,{color:state.THEME.THEME===false?"black":"#fff"}]}
                    ></TextInput>
                    <TouchableOpacity
                        onPress={() => {
                            if(!balance||parseFloat(balance)===0)
                            {
                              ShowErrotoast(toast,"Invalid Amount");
                            }else{
                              setAmount(balance);
                            }
                        }}
                    >
                        <Text style={{ color: "blue" }}>MAX</Text>
                    </TouchableOpacity>
                </View>
                <Text style={style.msgText}>{Message}</Text>
                {/* <View style={style.btnView}> 
                    <Button
                        disabled={disable}
                        color="blue"
                        title="Send"
                        onPress={() => {
                            setdisable(true)
                            if (validateStellarAddress(address)) {
                                Showsuccesstoast(toast,"Valid Stellar address");
                                send_XLM(setsteller_key_private, address, amount)
                            } else {
                                console.log('Invalid Stellar address');
                                ShowErrotoast(toast,"Invalid Stellar address");
                                setAddress();
                                setdisable(false);
                            }
                        }}
                    />
                            </View> */}

                    <TouchableOpacity
                        disabled={disable}
                        style={[style.btnView,{backgroundColor:disable?"gray":"#3574B6"}]}
                        onPress={() => {
                            Keyboard.dismiss()
                            setPayment_loading(true);
                            if(!amount||parseFloat(amount)===0)
                            {
                              ShowErrotoast(toast,"Invalid Amount");
                              setPayment_loading(false);
                              setAmount('')
                            }else{
                              if(!address||!amount)
                           {
                             ShowErrotoast(toast,"Recipient Address and Amount Required")
                             setPayment_loading(false);
                           }
                           else{
                            setdisable(true)
                           if (validateStellarAddress(address)) {
                               Showsuccesstoast(toast,"Valid Stellar address");
                               send_XLM(steller_key_private, address, amount)
                           } else {
                               console.log('Invalid Stellar address');
                               ShowErrotoast(toast,"Invalid Stellar address");
                               setAddress();
                               setdisable(false);
                             setPayment_loading(false);
                           }
                           }
                            }
                        }}
                    >
                        {Payment_loading===true?<ActivityIndicator color={"#fff"}/>:<Text style={{color:"#fff",fontSize:16}}>Send</Text>}
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
        {/* <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <View style={{ backgroundColor: '#145DA0', padding: 20, borderRadius: 10,width:"90%",height:"50%" }}>
            <Text style={{color:"white",fontWeight:"700",alignSelf:"center",fontSize:19}} onPress={()=>{
              toggleModal();
            }}>Scan QR.</Text>
              <View style={style.QR_con}>
                <RNCamera
                  ref={cameraRef}
                  style={style.preview}
                  onBarCodeRead={onBarCodeRead}
                  captureAudio={false}
                >
                  <View style={style.rectangleContainer}>
                    <View style={style.rectangle} />
                  </View>
                </RNCamera>
              </View>
          </View>
        </View> */}
      </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={ACTIVATION_MODAL}
          >
          <View style={style.AccountmodalContainer}>
            <View style={style.AccounsubContainer}>
              <Icon
                name={"alert-circle-outline"}
                type={"materialCommunity"}
                size={60}
                color={"orange"}
              />
              <Text style={style.AccounheadingContainer}>{token ?" ":"Login to "}Activate Stellar Wallet</Text>
              <View style={{ flexDirection: "row",justifyContent:"space-around",width:wp(90),marginTop:hp(3),alignItems:"center" }}>
                <TouchableOpacity style={style.AccounbtnContainer} onPress={() => {setACTIVATION_MODAL(false),navigation.goBack()}}>
                   <Text style={style.Accounbtntext}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={style.AccounbtnContainer} onPress={()=>{CHECK_LOGIN()}}>
                   <Text style={style.Accounbtntext}>{token?"Activate ":"Login " }and Fund</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        </>

    );
};

export default SendXLM;

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
    extraInfoCon: { flexDirection:"row",alignItems:"center",marginLeft: wp(5), marginTop: hp(1.5),marginBottom:wp(-3) },
    input: {
        width: wp(70),
        alignSelf: "center",
        paddingHorizontal: wp(4),
    },
    msgText: { color: "red", textAlign: "center" },
    btnView: { width: wp(40),height:hp(6.6),alignSelf: "center",alignItems:"center",justifyContent:"center", marginTop: hp(8),backgroundColor:"blue",borderRadius:19 },
    QR_con:{
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
        height: hp(10),
      },
      backIcon: {
        marginRight:wp(28),
      },
      title: {
        fontSize: 18,
        fontWeight: 'bold',
        color:"#fff"
      },
      AccountmodalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      AccounsubContainer:{
        backgroundColor:"#131E3A",
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: "98%",
        height: "29%",
        justifyContent: "center"
      },
      AccounbtnContainer:{
        width:wp(39),
        height:hp(5),
        backgroundColor:"rgba(33, 43, 83, 1)",
        alignItems:"center",
        justifyContent:"center",
        borderRadius:10,
        borderColor:"#4CA6EA",
        borderWidth:1
      },
      Accounbtntext:{
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff"
      },
      AccounheadingContainer:{
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 10,
        color: "#fff"
      }
});