import { SaveTransaction } from "../../utilities/utilities";
import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  Platform,
  Image,
  Alert,
  PermissionsAndroid,
  Linking
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import title_icon from "../../../assets/title_icon.png";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { RNCamera } from 'react-native-camera';
import {
  getBalance,
  getEthBalance,
  getMaticBalance,
  getXrpBalance,
} from "../../components/Redux/actions/auth";
import { SendCrypto } from "./sendFunctions";
import "react-native-get-random-values";
import "@ethersproject/shims";
import { urls } from "../constants";
import { checkAddressValidity, checkXrpAddress } from "../../utilities/web3utilities";
import { isFloat, isInteger, Paste } from "../../utilities/utilities";
import { alert } from "../reusables/Toasts";
import Icon from "../../icon";
import { WalletHeader } from "../header";
import { NavigationActions } from "react-navigation";
import darkBlue from "../../../assets/darkBlue.png"
var ethers = require("ethers");
const xrpl = require("xrpl");
//'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850'
const SendTokens = (props) => {
  const cameraRef = useRef(null);
  const [qrData, setQrData] = useState('');
  const EthBalance = useSelector((state) => state.EthBalance);
  const MaticBalance = useSelector((state) => state.MaticBalance);
  const type = useSelector((state) => state.walletType);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [Loading, setLoading] = useState(false);
  const [balance, setBalance] = useState();
  const [walletType, setWallettype] = useState("");
  const [disable, setDisable] = useState(true);
  const [message, setMessage] = useState("");
  const state = useSelector((state) => state);
  const dispatch = useDispatch();
  const isFocused=useIsFocused();
  const [show,setshow]=useState(false);
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const onBarCodeRead = (e) => {
    if (e.data !== qrData) { 
      setQrData(e.data);
      alert("success","QR Code Decoded successfully..");
      setAddress("");
      setAddress(e.data);
      toggleModal();
    }
  };

  const getXrpBal = async (address) => {
    console.log(address);

    try {
      const response = await fetch(
        `http://${urls.testUrl}/user/getXrpBalance`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: address,
          }),
        }
      )
        .then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson);
          if (responseJson) {
            console.log(responseJson.responseData);
            setBalance(
              responseJson.responseData ? responseJson.responseData : 0
            );
          } else {
            console.log(response);
          }
        })
        .catch((e) => {
          console.log(e);
          //alert('unable to update balance')
        });

      return response;
    } catch (e) {
      console.log(e);
    }
  };

  const Balance = async (Type) => {
    try {
      const wallet = await AsyncStorageLib.getItem("wallet");
      const address = (await state.wallet.address)
        ? await state.wallet.address
        : JSON.parse(wallet).address;
      console.log(state.wallet.address);
      if (!state.wallet.address) {
        setBalance(0);

        alert("error", "please select a wallet first");
      } else {
        if (Type) {
          if (Type == "Ethereum") {
            setBalance(EthBalance._z?EthBalance._z:EthBalance);
            // await dispatch(
            //   getEthBalance(
            //     state.wallet.address ? state.wallet.address : address
            //   )
            // ).then((res) => {
            //   console.log(res.EthBalance);
            //   setBalance(res.EthBalance);
            // });
          } else if (Type == "Matic") {
            console.log(MaticBalance);
            await dispatch(
              getMaticBalance(
                state.wallet.address ? state.wallet.address : address
              )
            ).then(async (res) => {
              let bal = await AsyncStorageLib.getItem("MaticBalance");
              console.log(bal);
              console.log(res.MaticBalance);
              setBalance(bal);
            });
          } else if (Type === "Multi-coin-Xrp") {
            try {
              await AsyncStorageLib.getItem("wallet")
                .then(async (wallet) => {
                  console.log("XrpMulti", JSON.parse(wallet));
                  await dispatch(getXrpBalance(JSON.parse(wallet).xrp.address))
                    .then((res) => {
                      console.log(res.XrpBalance);
                      setBalance(res.XrpBalance ? res.XrpBalance : 0);
                    })
                    .catch((e) => {
                      console.log(e);
                    });
                })
                .catch((e) => {
                  console.log(e);
                });
            } catch (e) {
              console.log(e);
            }
          } else if (Type == "Xrp") {
            try {
              await AsyncStorageLib.getItem("wallet")
                .then(async (wallet) => {
                  console.log(JSON.parse(wallet).address);
                  await dispatch(getXrpBalance(JSON.parse(wallet).address))
                    .then((res) => {
                      console.log(res.XrpBalance);
                      setBalance(res.XrpBalance );
                    })
                    .catch((e) => {
                      console.log(e);
                    });
                })
                .catch((e) => {
                  console.log(e);
                });
            } catch (e) {
              console.log(e);
            }
          } else if (Type == "BNB") {
            await dispatch(getBalance(state.wallet.address))
              .then(async (response) => {
                console.log(response);
                const res = await response;
                if (res.status == "success") {
                  console.log(res);
                  setBalance(res.walletBalance);
                  console.log("success");
                }
              })
              .catch((error) => {
                console.log(error);
              });
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const new_data=async()=>{
      try {
          console.log(props?.route?.params?.token);
          const Type = await AsyncStorageLib.getItem("walletType");
          setWallettype(JSON.parse(Type));
    
          await Balance(props?.route?.params?.token).catch((e) => {
            console.log(e);
          });
        } catch (e) {
          console.log(e);
        }
    }

    setshow(true);
    new_data()
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
    }).start();
    setshow(false);
  }, [isFocused]);

  useEffect(() => {
    const data_fetch=async()=>{
      try {
        let inputValidation;
    let inputValidation1;
    let valid
    let xrpInvalid
    console.log(props?.route?.params?.token)
    if(props?.route?.params?.token==='Multi-coin-Xrp' || walletType==='Xrp')
    {
      if(balance<11)
      {
        xrpInvalid=true
        setMessage("Your minnimum balance should be 10 to send XRP");

      }
      valid = checkXrpAddress(address)
    }else{
      valid = checkAddressValidity(address);

    }
    inputValidation = isFloat(amount);
    inputValidation1 = isInteger(amount);
    console.log(inputValidation, inputValidation1);
    if (
      amount &&
      balance &&
      address &&
      Number(amount)>0 &&
      !xrpInvalid &&
      Number(amount) <= Number(balance) &&
      valid &&
      (inputValidation || inputValidation1)
    ) {
      setDisable(false);
    } else {
      setDisable(true);
    }

    if (address) {
      if (!valid) {
        setMessage("Please enter a valid address");
      } else {
        setMessage("");
      }
    }
      } catch (error) {
        console.log("[",error)
      }
    }
    data_fetch()
  }, [amount, address]);
  useEffect(() => {
     const data=async()=>{
      try {
        let inputValidation;
        let inputValidation1;
        if (amount) {
          inputValidation = isFloat(amount);
          inputValidation1 = isInteger(amount);
             console.log(amount,balance,JSON.stringify(balance)<JSON.stringify(amount))
          if (Number(balance)<Number(amount)) {
            setMessage("Low Balance");
          } else if (!inputValidation && !inputValidation1) {
            setMessage("Please enter a valid amount");
          } else {
            setMessage("");
          }
        }
      } catch (error) {
        console.log("*",error)
      }
     }
     data()
  }, [amount]);
  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => {
    checkPermission();
};
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
        alert("error","Permissions not allowed");
      }
    }
  } else {
    // iOS permission is handled through Info.plist
    setModalVisible(!isModalVisible);
  }
};
  async function a()
  {
    
  }
  return (
    <Animated.View // Special animatable View
      style={{ opacity: fadeAnim }}
    >
{Platform.OS==="ios"?<View style={{backgroundColor:state.THEME.THEME===false?"#4CA6EA":"black",flexDirection:"row",height: hp(8),borderBottomColor:"gray",borderColor:state.THEME.THEME===false?"gray":"black",borderWidth:0.5}}>
<Icon type={'antDesign'} name='left' size={29} color={'white'} onPress={()=>{navigation.goBack()}} style={{padding:hp(1.5),marginTop:'3%'}}/>
<Text style={{color:"white",alignSelf:"center",marginLeft:"19%",marginTop:'9%',fontSize:19}}>Transaction Details</Text>
<TouchableOpacity onPress={()=>{navigation.navigate("Home")}}>
<Image source={darkBlue} style={{height: hp("9"),
    width: wp("12"),
    marginLeft: Platform.OS==="ios"?wp(11):wp(6)}}/>
</TouchableOpacity>
    </View>:
<View style={{backgroundColor:state.THEME.THEME===false?"#4CA6EA":"black",flexDirection:"row",borderWidth:0.5,borderBottomColor:"gray",borderColor:state.THEME.THEME===false?"gray":"black",}}>
<Icon type={'antDesign'} name='left' size={29} color={'white'} onPress={()=>{navigation.goBack()}} style={{padding:hp(1.5),marginTop:'3%'}}/>
<Text style={{color:"white",alignSelf:"center",marginLeft:"20%",fontWeight:'bold',fontSize:17}}>Transaction Details</Text>
<TouchableOpacity onPress={()=>{navigation.navigate("Home")}}>
<Image source={darkBlue} style={{height: hp("9"),
    width: wp("12"),
    marginLeft: wp(15)}}/>
</TouchableOpacity>
</View>}
      {/* <WalletHeader title={props.route.params.token}/> */}
      <View style={{ backgroundColor:state.THEME.THEME===false?"#fff":"black", height: hp(100) }}>
        <View style={style.inputView}>
          <TextInput
          value={address}
            onChangeText={(input) => {
              if (input && address) { 
                setDisable(false);
              } else {
                setDisable(true);
              }
              console.log(input);
              setAddress(input);
            }}
            placeholder="Recipient Address"
            placeholderTextColor={"gray"}
            style={[style.input,{color:state.THEME.THEME===false?"black":"#fff"}]}
          ></TextInput>
          <TouchableOpacity onPress={()=>{
            toggleModal()
          }}>
          <Icon name="scan" type={"ionicon"} size={20} color={"blue"}/>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>{
            Paste(setAddress)
          }}>
          <Text style={style.pasteText}>PASTE</Text>
          </TouchableOpacity>
        </View>
        <View style={{flexDirection:"row",width:wp(90)}}>
        <Text style={[style.balance_heading,{color:state.THEME.THEME===false?"black":"#fff"}]}>Available balance :-{" "}</Text>
        <View style={{width:wp(13)}}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{width:wp(11)}}>
        <Text style={[style.balance,{color:state.THEME.THEME===false?"black":"#fff"}]}>
          {balance ? balance : show===false?<Text style={{ color: "#C1BDBD" }}>0</Text>:<></>}
        </Text>
              </ScrollView>
        </View>
        {show===true?<ActivityIndicator color={"green"} style={{top:hp(1)}}/>:<></>}
        </View>
        <View style={style.inputView}>
          <TextInput
            value={amount}
            keyboardType="numeric"
            onChangeText={(input) => {
              if (amount && address) {
                setDisable(false);
              } else {
                setDisable(true);
              }
              console.log(input);
              setAmount(input);
            }}
            placeholder="Amount"
            placeholderTextColor={"gray"}
            style={[style.input,{color:state.THEME.THEME===false?"black":"#fff"}]}
          ></TextInput>
          <Pressable
           
            onPress={() => {
              console.log("pressed", amount, balance);
              setAmount(balance);
            }}
          >
            <Text  onPress={()=>{console.log("pressed", amount, balance);
              setAmount(balance)}} style={{ color: "blue" }}>MAX</Text>
          </Pressable>
        </View>
        {Loading ? (
          <View style={{ marginBottom: hp("-4") }}>
            <ActivityIndicator size="small" color="blue" />
          </View>
        ) : (
          <Text> </Text>
        )}

        <Text style={style.msgText}>{message}</Text>

        {/* <View style={style.btnView}> */}
          <TouchableOpacity
            disabled={disable}
            style={[style.btnView,{backgroundColor:disable?"gray":"#3574B6"}]}
            onPress={async () => {
              console.log(walletType);
              let privateKey;
              const myAddress = await state.wallet.address;
              const token = props.route.params.token;
              const wallet = await AsyncStorageLib.getItem("Wallet");
              console.log(wallet);
              if(token==='Multi-coin-Xrp')
              {
                const xrpAddress = await state.wallet.xrp.address
                if(address==xrpAddress)
                {
                  return alert('error','address cannot be same as your address')

                }
              }
              if(address== myAddress)
              {
                return alert('error','address cannot be same as your address')
              }
              if (amount && balance && Number(amount) > Number(balance)) {
                setLoading(false);
                console.log(amount, balance);
                return alert(
                  "error",
                  "You don't have enough balance to do this transaction "
                );
              }

              if (token === "Multi-coin-Xrp") {
                privateKey = (await state.wallet.xrp.privateKey)
                  ? await state.wallet.xrp.privateKey
                  : JSON.parse(wallet).xrp.privateKey;
              } else {
                privateKey = (await state.wallet.privateKey)
                  ? await state.wallet.privateKey
                  : JSON.parse(wallet).privateKey;
              }
              console.log(privateKey);
              /* if(balance<amount){
    console.log(balance,amount)
    return alert('You dont have enough balance to do this transaction')
  }*/

              if (
                walletType &&
                token &&
                myAddress &&
                privateKey &&
                amount &&
                address
              ) {
                await SendCrypto(
                  address,
                  amount,
                  privateKey,
                  balance,
                  setLoading,
                  walletType,
                  setDisable,
                  myAddress,
                  token,
                  navigation
                );
              }
            }}
          >
            <Text style={{color:"#fff",fontSize:16}}>Send</Text>
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
    >
          {({ status }) => {
            if (status==="NOT_AUTHORIZED") {
              setModalVisible(false),
              Alert.alert("Camera Permissions Required.","Please enable camera permissions in settings to scan QR code.",
              [
                {text:"Close",style:"cancel"},
                {text:"Open",onPress:()=>{
                    Linking.openSettings()
                }},
              ])
            }
            if (status === "READY" && isModalVisible)
              {
                setModalVisible(true)
              }
            return (
              <>
                <View style={style.header}>
                  <TouchableOpacity onPress={() => { setModalVisible(false) }}>
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
            )
          }}
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
      {/* </View> */}
    </Animated.View>
  );
};

export default SendTokens;

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
  input: {
    width: wp(70),
    alignSelf: "center",
    paddingHorizontal: wp(4),
  },
  msgText: { color: "red", textAlign: "center" },
  btnView: { width: wp(40),height:hp(6.6),alignSelf: "center",alignItems:"center",justifyContent:"center", marginTop: hp(8),borderRadius:19 },
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
    height: hp(10)
  },
  backIcon: {
    marginRight:wp(28),
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color:"#fff"
  },
});