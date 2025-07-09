import { useCallback, useEffect, useState } from "react";
import { 
  ActivityIndicator,
  Alert,
    FlatList,
    Image,
    Keyboard,
  KeyboardAvoidingView, 
  Modal, 
  Platform, 
  ScrollView,
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback, 
  View,
  useWindowDimensions
} from "react-native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import InfoCustomAlert from "../components/InfoCustomAlert";
import { useNavigation } from "@react-navigation/native";
import { Exchange_screen_header } from "../../../../reusables/ExchangeHeader";
import Icon from "../../../../../icon";
import { authRequest, GET, getToken, POST } from "../api";
import DeviceInfo from "react-native-device-info";
import { useSelector } from "react-redux";
import { debounce } from "lodash";
import AlchemyFiatTokens from "../../../../../utilities/AlchemyFiatSupprort.json";
import AlchemyFiatSellTokens from "../../../../../utilities/AlchemyFiatSellSupprort.json";
import AlchemyCryptoTokens from "../../../../../utilities/AlchemyCryptoSupprort.json";


const KycComponent = ({ route }) => {
    const state=useSelector((state)=>state)
    const navigation = useNavigation();
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [VisibleAlertLoading, setVisibleAlertLoading] = useState(false);
    const [infoHeading, setinfoHeading] = useState("Oops! You're in Guest Mode");
    const [infoSubHeading, setinfoSubHeading] = useState("Looks like you're in Guest Mode. Log in to unlock this feature and enjoy the full experience!");
    const [infoBtnHeading, setinfoBtnHeading] = useState("Login");
    const [infoBtnAction, setinfoBtnAction] = useState(true);
    const [btnLoading, setbtnLoading] = useState(false);
    const [qoutesLoading, setqoutesLoading] = useState(false);
    const [amountSend, setamountSend] = useState(0.00);
    const { width, height } = useWindowDimensions();
    const [operationType,setoperationType]=useState("BUY");
    const [operationError,setoperationError]=useState(null);
    const [QoutesRes,setQoutesRes]=useState(null);
    const [tokenModalVisible,setTokenModalVisible]=useState(false);
    const [tokenModalType,settokenModalType]=useState(0);
    const [selectedfiat,setSelectedfiat]=useState(null);
    const [selectedCrypto,setSelectedCrypto]=useState(null);
    const [payWayaCode,setPayWayaCode]=useState("10001");
    useEffect(() => {
      setPayWayaCode("10001")
      setinfoHeading("Oops! You're in Guest Mode");
      setinfoSubHeading("Looks like you're in Guest Mode. Log in to unlock this feature and enjoy the full experience!");
      setinfoBtnHeading("Login");
      setinfoBtnAction(true)
      setbtnLoading(false)
      setVisibleAlert(false);
      setVisibleAlertLoading(false)
      setamountSend(0.00);
      setoperationType("BUY");
      setoperationError(null);
      setqoutesLoading(false);
      settokenModalType(0);
    }, []);

  const visibleClose = async() => {
    if (infoBtnAction) {
      setVisibleAlert(false);
      navigation.navigate("exchangeLogin")
    }
    if (infoBtnAction===false) {
      await proccedKyc()
    }
    if (infoBtnAction===null) {
      setVisibleAlert(false);
    }
  };

  const proccedKyc = async () => {
    try {
      setVisibleAlertLoading(true);
      const payload = {
        "businessSubType": "BUY"
      }
      const { res, err } = await authRequest("/users/alchemyUserRegister", POST, payload);
      const respo = JSON.parse(res.res)
      if(res.status===false)
      {
        setVisibleAlertLoading(false);
        setVisibleAlert(false);
        Alert.alert("Oops!","Somthing went wrong.");
      }
      if(res.status&&respo.success)
      {
       setVisibleAlertLoading(false);
       setVisibleAlert(false);
       navigation.navigate("TxDetails",{userKycUrl:respo.model})
      }
    } catch (error) {
      setVisibleAlertLoading(false);
      setVisibleAlert(false);
      console.log("proccedKyc Error", error)
    }
  }

    // Calculate dynamic widths based on screen size
    const getContainerWidth = () => {
      return Math.min(380, width - 30);
    };

    const getPairButtonWidth = () => {
      return (getContainerWidth() - 20) / 2;
    };

  const handleUser = async () => {
    setbtnLoading(true)
    const { res, err } = await authRequest("/users/:id", GET)
    const deviceID = await DeviceInfo.getUniqueIdSync()
    if (err?.message === "Internal server error") {
      Alert.alert("info", "Somthing went wrong");
      setbtnLoading(false);
    }
    if (res?.email === deviceID) {
      setinfoHeading("Oops! You're in Guest Mode");
      setinfoSubHeading("Looks like you're in Guest Mode. Log in to unlock this feature and enjoy the full experience!");
      setinfoBtnHeading("Login");
      setinfoBtnAction(true)
      setVisibleAlert(true)
      setbtnLoading(false);
    }else{
      await checkUserKyc();
    }
  }

  const fetchQoutes =async (amount,actionType,cryptoSelection,fiatSelection) => {
    const payload = {
      "crypto": cryptoSelection?.crypto||"USDT",
      "network": cryptoSelection?.network||"ETH",
      "fiat": fiatSelection?.currency||"USD",
      "amount": amount,
      "side": actionType
  }
    const { res, err } = await authRequest("/users/alchemyQuotes", POST, payload);
    const respo = JSON.parse(res.res)
    if(res.status&&respo.success)
    {
      setQoutesRes(respo.data)
      setqoutesLoading(false);
    }
    else{
      console.log("alchemyQuotes Error---",respo)
      setqoutesLoading(false);
      setamountSend("");
      Alert.alert("info",respo?.returnMsg||"Something went wrong..");
    }

  };

  // wait and get Qoutes
  const waitAndQoutesFetch = useCallback(debounce(fetchQoutes, 1000), []);

  const handleChange = (text) => {
    const payAmount=text.replace(/[^0-9.]/g, '')
    
    if(!payAmount||payAmount==="0"||parseFloat(payAmount)===0)
    {
      setamountSend("");
      setoperationError("Invalid amount");
      if(selectedCrypto===null||selectedfiat===null)
        {
          setamountSend("");
          setoperationError("fiat & crypto both selection requird.");
        }
    }
    else{
      if(selectedCrypto===null||selectedfiat===null)
      {
        setamountSend("");
        setoperationError("fiat & crypto both selection requird.");
      }else{
        setQoutesRes(null);
        setqoutesLoading(true);
        setoperationError(null);
        waitAndQoutesFetch(payAmount,operationType,selectedCrypto,selectedfiat)
      }
    }
  };
  
  const checkUserKyc=async()=>{
    try {
      const { res, err } = await authRequest("/users/alchemyKycStatus", POST);
      const respo = JSON.parse(res.res)
      console.log(respo)
      if (err) {
        Alert.alert("info", "Somthing went wrong");
        setbtnLoading(false);
      }
      if (!respo.success && respo.code === "2003" && respo.error||res.status && respo?.model?.kycStatus === 0) {
        setinfoHeading("Oops! Kyc requird");
        setinfoSubHeading("This feature is currently unavailable as your KYC is incomplete. Please finish the verification process to gain full access.");
        setinfoBtnHeading("Procced Now");
        setinfoBtnAction(false)
        setVisibleAlert(true)
        setbtnLoading(false);
      }
      if (res.status && respo?.model?.kycStatus !== 0) {
        // setinfoHeading("You're all set!");
        // setinfoSubHeading("Your KYC is complete enjoy full access to all features!");
        // setinfoBtnHeading("Got it!");
        // setinfoBtnAction(null)
        // setVisibleAlert(true)
        // setbtnLoading(false);
        if (operationType === "BUY") {
          await proccedBuy()
        }
        else{
          await proccedSell()
        }
      }
    } catch (error) {
      console.log("userKycError", error)
      setbtnLoading(false);
    }  
  }

  const proccedBuy = async () => {
    try {
      const payload = {
        "side": "BUY",
        "amount": amountSend,
        "fiat": selectedfiat?.currency,
        "crypto": selectedCrypto?.crypto,
        "depositType": 2,
        "address": state?.ETH_KEY,
        "network": selectedCrypto?.network,
        "payWayCode": payWayaCode,
        "orderType": "4",
        "memo":"test"
      }
      console.log(payload)
      const { res, err } = await authRequest("/users/alchemyCreateOrder", POST, payload);
      const respo = JSON.parse(res.res)
      console.log(respo.data.payUrl)
      if(res.status===false)
      {
        setbtnLoading(false);
        Alert.alert("Oops!","Somthing went wrong.");
      }
      if(res.status&&respo.success)
      {
        setbtnLoading(false);
        navigation.navigate("TxDetails",{userKycUrl:respo.data.payUrl})
      }
    } catch (error) {
      setbtnLoading(false);
      console.log("proccedKyc Error", error)
      Alert.alert("Oops!","Somthing went wrong.");
    }
  }

  const proccedSell = async () => {
    try {
      const payload = {
        "amount": amountSend,
        "fiat": selectedfiat?.currency,
        "crypto": selectedCrypto?.crypto,
        "network": selectedCrypto?.network,
      }
      const { res, err } = await authRequest("/users/alchemySellOrderCreate", POST, payload);
      if(res.status===false)
      {
        setbtnLoading(false);
        Alert.alert("Oops!","Somthing went wrong.");
      }
      if(res.status)
      {
        setbtnLoading(false);
        navigation.navigate("TxDetails",{userKycUrl:res.res})
      }
    } catch (error) {
      setbtnLoading(false);
      console.log("proccedSell Error", error)
      Alert.alert("Oops!","Somthing went wrong.");
    }
  }

  useEffect(()=>{
    setSelectedCrypto(null);
    setSelectedfiat(null);
    setbtnLoading(false);
    setVisibleAlert(false);
    setVisibleAlertLoading(false)
    setamountSend(0.00);
    setoperationError(null);
    setqoutesLoading(false);
    setQoutesRes(null);
  },[operationType])

  const renderTokenItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.tokenItem} 
      onPress={() =>{tokenModalType===0?[setSelectedfiat(item),setTokenModalVisible(false)]:[setSelectedCrypto(item),setTokenModalVisible(false)]}}
    >
      <Image
        source={{ uri: item.icon }}
        style={styles.tokenIcon}
      />
      <View style={styles.tokenInfo}>
        <Text style={styles.tokenSymbol}>{tokenModalType===0?item.payWayName:item.crypto}</Text>
        <Text style={styles.tokenName}>{tokenModalType===0?`${item.countryName} (${item.currency})`:item.network}</Text>
      </View>
      <View>
        <Text style={styles.tokenName}>Max Buy</Text>
        <Text style={styles.tokenName}>{tokenModalType === 0 ? item.payMax : item.maxPurchaseAmount}</Text>
      </View>
    </TouchableOpacity>
  );

    return (
      <View style={styles.mainCom}>
        <TouchableWithoutFeedback onPress={()=>{Keyboard.dismiss()}}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
        >
          <Exchange_screen_header 
            title={route?.params?.tabName??"Buy"} 
            onLeftIconPress={() => navigation.goBack()} 
            onRightIconPress={() => console.log('Pressed')} 
          />
          
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {visibleAlert && (
              <InfoCustomAlert 
                heading={infoHeading}
                subHeading={infoSubHeading}
                btnText={infoBtnHeading}
                onclose={visibleClose}
                onskip={()=>{setVisibleAlert(false)}}
                loading={VisibleAlertLoading}
              />
            )}

            {/* Pair container */}
            <View style={[styles.pariViewCon, { width: "100%",paddingHorizontal:6 }]}>
              <TouchableOpacity 
                style={[
                  styles.pairNameCon, 
                  { backgroundColor: operationType==="BUY"?"#2164C1":"#1F2937", width: getPairButtonWidth() }
                ]}
                onPress={()=>{setoperationType("BUY")}}
              >
                <Text style={styles.pairNameText}>Buy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pairNameCon, { backgroundColor: operationType==="SELL"?"#2164C1":"#1F2937",width: getPairButtonWidth() }]}
                onPress={()=>{setoperationType("SELL")}}
              >
                <Text style={styles.pairNameText}>Sell</Text>
              </TouchableOpacity>
            </View>

            {/* fiat and crypto selection */}

              <View style={styles.typeSelection}>
              {operationType==="BUY"? <View style={styles.amountFlagCon}>
                  <View style={styles.currencySelector}>
                    <View style={styles.downBoxCon}>
                      <Icon name="currency-usd" type="materialCommunity" color="#fff" size={30} />
                    </View>
                    <Text style={styles.currencyText}>{selectedfiat?.currency||"Select fiat"}</Text>
                  </View>
                  <TouchableOpacity style={styles.downBoxCon} onPress={()=>{settokenModalType(0),setTokenModalVisible(true)}}>
                    <Icon name="chevron-down" type="materialCommunity" color="#fff" size={30} />
                  </TouchableOpacity>
                </View>:<View style={styles.amountFlagCon}>
                  <View style={styles.currencySelector}>
                    <View style={styles.downBoxCon}>
                    {selectedCrypto?.icon?<Image source={{ uri: selectedCrypto?.icon }}style={styles.tokenIcon}/>:<Icon name="ethereum" type="materialCommunity" color="#fff" size={28} />}
                    </View>
                    <View style={{flexDirection:"column"}}>
                    <Text style={styles.currencyText}>{selectedCrypto?.crypto||"Select crypto"}</Text>
                    {selectedCrypto?.network&&<Text style={styles.currencySubText}>{selectedCrypto?.network}</Text>}
                    </View>
                  </View>
                  <TouchableOpacity style={styles.downBoxCon} onPress={()=>{settokenModalType(1),setTokenModalVisible(true)}}>
                    <Icon name="chevron-down" type="materialCommunity" color="#fff" size={28} />
                  </TouchableOpacity>
                </View>}

                {operationType==="SELL"? <View style={styles.amountFlagCon}>
                  <View style={styles.currencySelector}>
                    <View style={styles.downBoxCon}>
                      <Icon name="currency-usd" type="materialCommunity" color="#fff" size={30} />
                    </View>
                    <Text style={styles.currencyText}>{selectedfiat?.currency||"Select fiat"}</Text>
                  </View>
                  <TouchableOpacity style={styles.downBoxCon} onPress={()=>{settokenModalType(0),setTokenModalVisible(true)}}>
                    <Icon name="chevron-down" type="materialCommunity" color="#fff" size={30} />
                  </TouchableOpacity>
                </View>:
                <View style={styles.amountFlagCon}>
                  <View style={styles.currencySelector}>
                    <View style={styles.downBoxCon}>
                    {selectedCrypto?.icon?<Image source={{ uri: selectedCrypto?.icon }}style={styles.tokenIcon}/>:<Icon name="ethereum" type="materialCommunity" color="#fff" size={28} />}
                    </View>
                    <View style={{flexDirection:"column"}}>
                    <Text style={styles.currencyText}>{selectedCrypto?.crypto||"Select crypto"}</Text>
                    {selectedCrypto?.network&&<Text style={styles.currencySubText}>{selectedCrypto?.network}</Text>}
                    </View>
                  </View>
                  <TouchableOpacity style={styles.downBoxCon} onPress={()=>{settokenModalType(1),setTokenModalVisible(true)}}>
                    <Icon name="chevron-down" type="materialCommunity" color="#fff" size={28} />
                  </TouchableOpacity>
                </View>}
              </View>

            {/* First Amount Container */}
            <View style={styles.amountInfoCon}>
              <View style={styles.amountInfoHeader}>
                <Text style={styles.amountInfoText}>You Send</Text>
                <Text style={styles.amountInfoText}>Min:{operationType==="BUY"?selectedfiat?.payMin||0.0:selectedCrypto?.minPurchaseAmount||0.0}</Text>
              </View>
              <View style={styles.amountInputCon}>
                <View style={[styles.amountSubCon, { width: getContainerWidth() * 0.4 }]}>
                  <TextInput 
                    placeholder="Amount" 
                    placeholderTextColor="gray"
                    value={amountSend}
                    style={styles.amountInput}
                    onChangeText={(text)=>{setamountSend(text)}}
                    returnKeyType="done"
                    keyboardType="decimal-pad"
                    onSubmitEditing={()=>{
                      handleChange(amountSend)
                    }}
                  />
                </View>
              </View>
            </View>
              {operationError!==null&&<Text style={styles.errorText}>{operationError}</Text>}


            {/* Second Amount Container */}
            <View style={styles.amountInfoCon}>
              <View style={styles.amountInfoHeader}>
                <Text style={styles.amountInfoText}>You Receive</Text>
                <Text style={styles.amountInfoText}>Min:{operationType==="SELL"?selectedfiat?.payMin||0.0:selectedCrypto?.minPurchaseAmount||0.0}</Text>
              </View>
              <View style={styles.amountInputCon}>
                <View style={[styles.amountSubCon, { width: getContainerWidth() * 0.4, borderBottomColor:"gray" }]}>
                  <TextInput
                   editable={false}
                    placeholder="0.0" 
                    placeholderTextColor="gray"
                    value={operationType==="BUY"?QoutesRes?.cryptoQuantity:QoutesRes?.fiatQuantity}
                    style={[styles.amountInput,{color:"gray"}]}
                  />
                </View>
                
              </View>
            </View>

            {/* Wallet Address */}
            <View style={styles.walletAddress}>
            <Text style={styles.sectionTitle}>Wallet Address:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft:10}}>
                <Text style={styles.addressText}>{state?.ETH_KEY}</Text>
                </ScrollView>
            </View>

              {/* Info Container */}
                {qoutesLoading&&QoutesRes===null?
              <View style={[styles.infoCon,{paddingVertical:19,alignItems:"center"}]}>
                  <ActivityIndicator color={"#fff"} size={"large"}/>
                  <Text style={[styles.addressText,{fontSize:16}]}>Fetching Qoutes Details....</Text>
                </View>:
                  QoutesRes!==null&&
                  <View style={styles.infoCon}>
                  <View style={styles.infoRow}>
                  <Icon name="circle-small" type="materialCommunity" color="#fff" size={30} />
                  <Text style={styles.infoText}>Your Order : {operationType==="BUY"?QoutesRes?.cryptoQuantity:QoutesRes?.fiatQuantity||0.0} {QoutesRes?.crypto||"USDT"} for {amountSend} {QoutesRes?.fiat||"USD"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="circle-small" type="materialCommunity" color="#fff" size={30} />
                  <Text style={styles.infoText}>Processing fee : {QoutesRes?.rampFee||0.0} {QoutesRes?.fiat||"USD"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="circle-small" type="materialCommunity" color="#fff" size={30} />
                  <Text style={styles.infoText}>Estimation rate : 1 {QoutesRes?.crypto||"USDT"} = {QoutesRes?.cryptoPrice||0.0} {QoutesRes?.fiat||"USD"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Icon name="circle-small" type="materialCommunity" color="#fff" size={30} />
                  <Text style={styles.infoText}>Network fee : {QoutesRes?.networkFee||0.0} {QoutesRes?.crypto||"USDT"}</Text>
                </View>
                </View>}

            {/* Payment Methods */}
            {operationType==="BUY"&&<View style={[styles.paymentSection, { width: "100%" }]}>
              <Text style={[styles.sectionTitle,{marginLeft:"2%"}]}>Pay via</Text>
              <View style={styles.paymentOptions}>
                <TouchableOpacity style={[styles.paymentMethod,{borderColor:payWayaCode==="10001"?"green":"rgba(255, 255, 255, 0.25)",borderWidth:payWayaCode==="10001"?1:0.5}]} onPress={()=>{setPayWayaCode("10001")}}>
                  <Icon name="credit-card" type="materialCommunity" color="rgba(255, 255, 255, 0.7)" size={30} />
                  <Text style={styles.paymentText}>Credit Card</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.paymentMethod,{borderColor:payWayaCode==="501"?"green":"rgba(255, 255, 255, 0.25)",borderWidth:payWayaCode==="501"?1:0.5}]} disabled={Platform.OS==="android"} onPress={()=>{setPayWayaCode("501")}}>
                  <Icon name="apple" type="materialCommunity" color="rgba(255, 255, 255, 0.7)" size={30} />
                  <Text style={styles.paymentText}>Apple pay</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.paymentMethod,{borderColor:payWayaCode==="701"?"green":"rgba(255, 255, 255, 0.25)",borderWidth:payWayaCode==="701"?1:0.5}]} onPress={()=>{setPayWayaCode("701")}}>
                  <Icon name="google" type="materialCommunity" color="rgba(255, 255, 255, 0.7)" size={29} />
                  <Text style={styles.paymentText}>G-Pay</Text>
                </TouchableOpacity>
              </View>
            </View>}

            {/* Buy Button */}
            <TouchableOpacity 
              style={[styles.buyBtn, { width: "100%",backgroundColor:btnLoading||qoutesLoading||parseFloat(amountSend)===0||!amountSend||selectedCrypto===null||selectedfiat===null?"gray":"#2164C1" }]}
              disabled={btnLoading||qoutesLoading||parseFloat(amountSend)===0||!amountSend||selectedCrypto===null||selectedfiat===null}
              onPress={() => {handleUser()}}
            >
              {btnLoading?<ActivityIndicator size={"small"} color={"#fff"}/>:<Text style={styles.buyBtnText}>{operationType==="BUY"?"Buy Crypto":"Sell Crypto"}</Text>}
            </TouchableOpacity>
          </ScrollView>
            <Modal
              animationType="slide"
              transparent={true}
              visible={tokenModalVisible}
              onRequestClose={() => setTokenModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHandle} />

                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select a {tokenModalType===0?"fiat":"crypto"}</Text>
                    <TouchableOpacity onPress={() => setTokenModalVisible(false)}>
                      <MaterialIcons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={tokenModalType===0?operationType==="BUY"?AlchemyFiatTokens:AlchemyFiatSellTokens:AlchemyCryptoTokens}
                    renderItem={renderTokenItem}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              </View>
            </Modal>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </View>
    );
};

const styles = StyleSheet.create({
  mainCom: {
    flex: 1,
    backgroundColor: "#011434",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  typeSelection: {
    marginVertical: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1F2937",
    alignItems: "center",
    height: 58,
    width:"100%",
    alignSelf: "center",
    borderRadius: 16,
    paddingHorizontal: 1.5,
  },
  pariViewCon: {
    marginTop: 20,
    marginBottom:6,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#1F2937",
    alignItems: "center",
    height: 58,
    alignSelf: "center",
    borderRadius: 16,
    paddingHorizontal: 4,
  },
  pairNameCon: {
    height: 47,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F2937",
  },
  pairNameText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  amountInfoCon: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical:5,
    alignSelf: "center",
    flexDirection:"row",
    justifyContent:"space-between",
    width: "100%", 
    marginVertical:6
  },
  amountInfoHeader: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  amountInfoText: {
    fontSize: 16,
    color: "gray",
  },
  amountInputCon: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountSubCon: {
    borderBottomWidth: 2,
    borderBottomColor: "#fff",
  },
  amountInput: {
    fontSize: 20,
    fontWeight: "500",
    color: "#fff",
    padding: 0,
  },
  amountFlagCon: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 5,
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencyText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 8,
  },
  currencySubText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    fontWeight:"600",
    marginLeft: 1,
  },
  downBoxCon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#18212F",
    alignItems: "center",
    justifyContent: "center",
  },
  infoCon: {
    marginVertical: -4,
    padding: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF33",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  infoText: {
    fontSize: 13,
    color: "#fff",
    marginLeft: -10,
  },
  walletAddress: {
    flexDirection:"row",
    marginTop:10,
    marginBottom: 15,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF33",
    justifyContent:"space-between",
    alignItems:"center"
  },
  sectionTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    // marginBottom: 10,
    // marginLeft:"2%"
  },
  addressContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFFFFF33",
  },
  addressText: {
    fontSize: 19,
    color: "#fff",
  },
  paymentSection: {
    marginTop: 15,
  },
  paymentOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  paymentMethod: {
    width: 105,
    height: 62,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.25)",
    borderWidth: 0.5,
    borderRadius: 20,
    padding: 5,
  },
  paymentText: {
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 5,
  },
  buyBtn: {
    backgroundColor: "#2164C1",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 30,
  },
  buyBtnText: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '70%',
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#666',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tokenIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  tokenInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tokenSymbol: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  tokenName: {
    fontSize: 14,
    color: '#999',
  },
});

export default KycComponent;