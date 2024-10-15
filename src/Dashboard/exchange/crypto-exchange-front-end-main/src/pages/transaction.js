import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { authRequest, GET, POST } from "../api";
import { GOERLI_ETHERSCAN } from "../utils/constants";
import { DataTable } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import Bridge from "../../../../../../assets/Bridge.png";
const StellarSdk = require('stellar-sdk');
import { useNavigation } from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform
} from "react-native";
import darkBlue from "../../../../../../assets/darkBlue.png";

import { WebView } from "react-native-webview";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useWindowDimensions } from "react-native";
import { TabView, SceneMap } from "react-native-tab-view";
import Modal from "react-native-modal";
import { CHAIN_ID_TO_SCANNER } from "../web3";
import { LinearGradient } from "react-native-linear-gradient";
import Icon from "../../../../../icon";
import { REACT_APP_LOCAL_TOKEN } from "../ExchangeConstants";
import OffersButton from "../../../../offersButton";
import { OfferListView } from "./offers";
import { alert } from "../../../../reusables/Toasts";
import { ActivityIndicator } from "react-native";
import { useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from "react-redux";
import { STELLAR_URL } from "../../../../constants";
export const TransactionsListView = ({
  transactions,
  self = false,
  fetchTxPageData,
  setUpdateTx,
  setPressed,
}) => {
  const [open, setOpen] = useState(false);
  const [txLink, setTxLink] = useState("");
  const proceedToPayment = (tx) => setOpen(true);
  const navigation = useNavigation();
  const SeeTransactions = (tx) => {
    console.log(tx.tx);
    return (
      <View>
        
      </View>
    );
  };

  return (
    transactions && (
      <View style={styles.mainContainer}>
        <LinearGradient
          style={styles.linearStyle}
          start={[1, 0]}
          end={[0, 1]}
          colors={["rgba(1, 12, 102, 1)", "rgba(224, 93, 154, 1)"]}
        >
          <View style={styles.tableHeader}>
            <Text style={styles.AssetText}>Asset Amount</Text>
            <Text style={styles.AssetText}>Unit Price</Text>
            <Text style={styles.AssetText}>Total Price</Text>
            <Text style={styles.AssetText}>Currency</Text>
            <View style={{ position: "relative" }}>
              <Icon
                name={"info"}
                type={"feather"}
                style={styles.infoIcon}
                color={"#DBAFC9"}
              />
              <Text style={styles.AssetText}>Status</Text>
            </View>
          </View>
          <ScrollView>
            {transactions.length ? (
              <>
                {transactions.map((tx) => (
                  <ScrollView contentContainerStyle={styles.scrollView}>
                    <View key={tx._id} style={styles.Table1Container}>
                      <Text style={styles.textColor}>
                        {tx.assetName} {tx.amount}
                      </Text>
                      <Text style={styles.textColor}>{tx.pricePerUnit}</Text>
                      <Text style={styles.textColor}>{tx.totalPrice}</Text>
                      <Text style={styles.textColor}>{tx.currency}</Text>
                      {tx.status !== "SUCCEEDED" && (
                        <Text style={styles.statusColor}>{tx.status}</Text>
                      )}

                      <SeeTransactions tx={txLink} />
                    </View>
                    {tx.status === "PAYMENT_PENDING" && (
                      <View>
                        <TouchableOpacity
                          style={styles.procedBtn}
                          onPress={() => {
                            console.log(tx.sessionUrl);
                            setTxLink(tx.sessionUrl);
                            setOpen(true);
                          }}
                        >
                          <Text style={{ color: "white", fontSize: 12 }}>
                            Proceed to pay
                          </Text>
                        </TouchableOpacity>
                        {/* <Button
                            title="Proceed to pay"
                            onPress={() => {
                              console.log(tx.sessionUrl);
                              setTxLink(tx.sessionUrl);
                              setOpen(true);
                            }}
                          ></Button> */}
                      </View>
                    )}

                    {tx.status === "SUCCEEDED" && (
                      <TouchableOpacity
                        style={styles.procedBtn}
                        title="See Tx"
                        onPress={() => {
                          console.log(tx.cryptoTxHash);
                          setTxLink(
                            `${CHAIN_ID_TO_SCANNER[tx.chainId]}/tx/${
                              tx.cryptoTxHash
                            }`
                          );
                          setOpen(true);
                        }}
                      >
                        <Text style={{ color: "white" }}> See tx</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                ))}
              </>
            ) : (
              <View>
                <Text style={styles.NoText}>No Transactions Here</Text>
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      </View>
    )
  );
};

const OffersListView = ({ transactions, self = false }) => {
  const [open, setOpen] = useState(false);
  const [txLink, setTxLink] = useState("");

  const SeeTransactions = (tx) => {
    console.log("hi", tx.tx);
    return (
      <View>
        <Modal
          animationIn="slideInRight"
          animationOut="slideOutRight"
          animationInTiming={100}
          animationOutTiming={200}
          isVisible={open}
          useNativeDriver={true}
          onBackdropPress={() => {
            setOpen(false);
          }}
          onBackButtonPress={() => {
            //setShowModal(!showModal);
            setOpen(false);
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#fff",
              marginTop: 50,
              height: 10,
            }}
          >
            <WebView source={{ uri: `${GOERLI_ETHERSCAN}/tx/${tx.tx}` }} />
          </View>
        </Modal>
      </View>
    );
  };

  return (
    transactions && (
      <View style={styles.mainContainer}>
        <LinearGradient
          style={styles.linearStyle}
          start={[1, 0]}
          end={[0, 1]}
          colors={["rgba(1, 12, 102, 1)", "rgba(224, 93, 154, 1)"]}
        >
          <View style={styles.tableHeader}>
            <Text style={styles.AssetText}>Asset Amount</Text>
            <Text style={styles.AssetText}>Unit Price</Text>
            <Text style={styles.AssetText}>Total Price</Text>
            <Text style={styles.AssetText}>Currency</Text>
            <View style={{ position: "relative" }}>
              <Icon
                name={"info"}
                type={"feather"}
                style={styles.infoIcon}
                color={"#DBAFC9"}
              />
              <Text style={styles.AssetText}>Status</Text>
            </View>
          </View>
          <ScrollView>
            {transactions.length ? (
              <>
                {transactions.map((tx) => (
                  <ScrollView>
                    <View key={tx._id} style={styles.Table1Container}>
                      <Text style={styles.textColor}>
                        {tx.assetName} {tx.amount}
                      </Text>
                      <Text style={styles.textColor}>{tx.pricePerUnit}</Text>
                      <Text style={styles.textColor}>{tx.totalPrice}</Text>
                      <Text style={styles.textColor}>{tx.currency}</Text>
                      {tx.status !== "SUCCEEDED" && (
                        <Text style={styles.transferdColor}>{tx.status}</Text>
                      )}

                      {tx.status === "SUCCEEDED" && (
                        <Button
                          title="See Tx"
                          onPress={() => {
                            if (tx.cryptoTxHash) {
                              console.log(tx.cryptoTxHash);
                              setTxLink(tx.cryptoTxHash);
                              setOpen(true);
                            }
                          }}
                        >
                          See tx
                        </Button>
                      )}
                      <SeeTransactions tx={txLink} />
                    </View>
                  </ScrollView>
                ))}
              </>
            ) : (
              <View>
                <Text style={styles.NoText}>No Transactions Here</Text>
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      </View>
    )
  );
};

export const TransactionView = () => {
  const state = useSelector((state) => state);
  const isFocused = useIsFocused();
  StellarSdk.Network.useTestNetwork();
        const server = new StellarSdk.Server(STELLAR_URL.URL);
  const navigation = useNavigation();
  const [pull, setPull] = useState([])
  const [Key,setKey]=useState("");
  const [load,setload]=useState(false);
  const [modalContainer_menu,setmodalContainer_menu]=useState(false);

const getData = async () => {
  try {
    fetchData_(state.STELLAR_PUBLICK_KEY);
    // const storedData = await AsyncStorageLib.getItem('myDataKey');
    // if (storedData !== null) {
    //   const parsedData = JSON.parse(storedData);
    //   const matchedData = parsedData.filter(item => item.Ether_address === state.wallet.address);
    //   console.log('Retrieved data:', matchedData);
    //   const publicKey = matchedData[0].publicKey;
    //   fetchData_(publicKey);
    // }
    // else {
    //   console.log('No data found in AsyncStorage');
    // }
  } catch (error) {
    console.log('Error retrieving data:', error);
  }
};
useEffect(()=>{
  getData();
},[isFocused]);
const fetchData_ = async (key) => {
  setload(true);
  try {
    const response =await fetch(STELLAR_URL.URL+'/accounts/'+key+'/trades?limit=30&order=desc')
    if (!response.ok) {
      console.log("`HTTP error! Status: ${response.status}")
    }
    if(response.status==='404')
    {
     setPull([]);
     setload(false);
    }
    else{
    const apiResponse = await response.json();
    const records = apiResponse._embedded.records;
    setPull(records)
    setload(false);
  }
  } catch (error) {
    console.log('Error fetching data:', error);
    setload(false);
  }
};
  return (
    <>
   <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // padding: 10,
      backgroundColor: '#4CA6EA',
      elevation: 4,
    }}>
      {/* Left Icon */}
      <Icon
              name={"left"}
              type={"antDesign"}
              size={28}
              color={"white"}
              style={{marginLeft:wp(2)}}
              onPress={() =>navigation.goBack()}
            />

      {/* Middle Text */}
      <Text style={{
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color:"#fff",
        flex: 1,
        marginLeft:wp(13),
        marginTop:Platform.OS==="ios"?hp(3):hp(0)
      }}>Transactions</Text>

      {/* Right Image and Menu Icon */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
      }}>
         <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Image
          source={darkBlue}
          style={{
            height: hp("8"),
            width: wp("12"),
            marginRight: 10,
            borderRadius: 15,
          }}
        />
        </TouchableOpacity>
        <TouchableOpacity
            onPress={() => {
              setmodalContainer_menu(true)
            }}
          >
        <Icon
              name={"menu"}
              type={"materialCommunity"}
              size={30}
              color={"#fff"}
            />
        </TouchableOpacity>
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalContainer_menu}>

            <TouchableOpacity style={[styles.modalContainer_option_top,{marginTop:-330,marginRight:-20}]} onPress={() => { setmodalContainer_menu(false) }}>
              <View style={styles.modalContainer_option_sub}>



                <TouchableOpacity style={styles.modalContainer_option_view}>
                  <Icon
                    name={"anchor"}
                    type={"materialCommunity"}
                    size={30}
                    color={"gray"}
                  />
                  <Text style={styles.modalContainer_option_text}>Anchor Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalContainer_option_view}>
                  <Icon
                    name={"badge-account-outline"}
                    type={"materialCommunity"}
                    size={30}
                    color={"gray"}
                  />
                  <Text style={styles.modalContainer_option_text}>KYC</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalContainer_option_view} onPress={()=>{navigation.navigate("Wallet")}}>
      <Icon
        name={"wallet-outline"}
        type={"materialCommunity"}
        size={30}
        color={"white"}
      />
      <Text style={[styles.modalContainer_option_text,{color:"white"}]}>Wallet</Text>
      </TouchableOpacity>

                <TouchableOpacity style={styles.modalContainer_option_view} onPress={() => {
                  console.log('clicked');
                  const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
                  AsyncStorage.removeItem(LOCAL_TOKEN);
                  setmodalContainer_menu(false)
                  navigation.navigate('exchangeLogin');
                }}>
                  <Icon
                    name={"logout"}
                    type={"materialCommunity"}
                    size={30}
                    color={"#fff"}
                  />
                  <Text style={[styles.modalContainer_option_text, { color: "#fff" }]}>Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalContainer_option_view} onPress={() => { setmodalContainer_menu(false) }}>
                  <Icon
                    name={"close"}
                    type={"materialCommunity"}
                    size={30}
                    color={"#fff"}
                  />
                  <Text style={[styles.modalContainer_option_text, { color: "#fff" }]}>Close Menu</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
      </View>
    </View>
      <View style={{ height: hp(100), backgroundColor: "#011434" }}>
      <Text style={{color:"white",marginLeft:13,marginTop:13,fontWeight:"bold",fontSize:19}}>All Trades Transaction.</Text>
    <View style={{ backgroundColor: "#011434" }}>
      {/* <LinearGradient
        style={styles.linearStyle1}
        start={[1, 0]}
        end={[0, 1]}
        colors={["rgba(1, 12, 102, 1)", "rgba(224, 93, 154, 1)"]}
      > */}
      <View style={[styles.linearStyle1,{backgroundColor:"rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)"}]}>
        <ScrollView nestedScrollEnabled horizontal>
          <ScrollView nestedScrollEnabled={true}>
            <View style={styles.tableHeader}>
              <Text style={styles.AssetText}>Base Asset</Text>
              <Text style={styles.AssetText}>Base Amount</Text>
              <Text style={styles.AssetText}>Counter Asset</Text>
              <Text style={styles.AssetText}>Counter Amount</Text>
              <Text style={styles.textColor}>Status</Text>
              <Text style={styles.AssetText}>Created</Text>
            </View>
            <>
            {pull.length===0?<Text style={{color:"white",margin:10,fontWeight:"bold",fontSize:19}}>{load===true?<ActivityIndicator color={"white"}/>:"No Trade Records."}</Text>: pull.map((offer,index) => {
                 return (
                   <>
                   <View key={index}>
                     <ScrollView horizontal={true} key={offer._id}>
                       <View
                         key={index}
                         style={styles.mainDataContainer}
                       >
                         <Text style={styles.textColor}>
                           {offer.base_asset_code}
                         </Text>

                         <Text style={styles.textColor}>
                           {offer.base_amount}
                         </Text>

                         <Text style={styles.textColor}>
                           {offer.counter_asset_code}
                         </Text>
                         <Text style={styles.textColor}>
                           {offer.counter_amount}
                         </Text>
                         <Text style={[styles.textColor,{color:"green",fontWeight: "bold",}]}>
                           {"Success"}
                         </Text>
                         <Text
                           style={{
                             textAlign: "center",
                             width: wp(20),
                             color: "#4CA6EA",
                           }}
                         >
                           {offer.ledger_close_time}
                         </Text>
                       </View>
                     </ScrollView>
                   </View>
                 </>
                   )
                 })
               }
                 </>
          </ScrollView>
        </ScrollView>
      {/* </LinearGradient> */}
      </View>
    </View>



      </View>
    </>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: "#131E3A",
    height: hp(100),
  },
  scrollView: {
    width: wp(90),
  },
  tableHeader: {
    width: wp(90),
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
    borderColor: "#EE96DF",
    paddingVertical: hp(1),
  },
  table: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  content: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
    textAlign: "center",
    height: hp(100),
  },
  AssetText: {
    color: "#fff",
    width: wp(15),
    textAlign: "center",
  },
  linearStyle: {
    width: wp(95),
    height: hp(30),
    marginBottom: hp(3),
    marginVertical: hp(2),
    borderRadius: 10,
    alignSelf: "center",
  },
  textColor: {
    color: "#fff",
    width: wp(15),
    textAlign: "center",
  },
  statusColor: {
    color: "#DFE96A",
    width: wp(15),
    textAlign: "center",
  },
  transferdColor: {
    color: "#1EEC7D",
    width: wp(18.5),
    textAlign: "center",
  },
  Table1Container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: wp(92),
    marginTop: hp(2),
    marginBottom: hp(1),
    alignSelf: "center",
  },
  scrollView: {
    // width: wp(100),
    alignSelf: "center",
  },
  infoIcon: {
    alignSelf: "flex-end",
    position: "absolute",
    // left:10,
    top: -8,
    right: -5,
  },
  NoText: {
    color: "#fff",
    marginVertical: hp(2),
    marginHorizontal: wp(4),
  },
  transactionText: {
    color: "#fff",
    textAlign: "center",
    marginTop: hp(2),
    fontSize: hp(2.1),
  },
  transactionBtn: {
    width: wp(30),
    alignSelf: "center",
    borderRadius: 8,
    borderColor: "#EE96DF",
    borderWidth: StyleSheet.hairlineWidth * 1,
    padding: 8,
    alignItems: "center",
    marginTop: hp(5),
  },
  procedBtn: {
    backgroundColor: "#010C66",
    width: wp(26),
    padding: 8,
    alignItems: "center",
    borderRadius: 6,
    marginLeft: wp(5),
  },
  mainDataContainer: {
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: hp(1),
    margin: 10,
  },
  tableHeader: {
    // width: wp(90),
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
    borderColor: "#EE96DF",
    paddingVertical: hp(1),
  },
  table: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: "white",
  },
  content: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
    textAlign: "center",
    height: hp(100),
    backgroundColor: "white",
  },
  textColor: {
    color: "#fff",
    width: wp(20),
    textAlign: "center",
  },
  Table1Container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // width: wp(90),
    marginTop: hp(2),
    marginBottom: hp(1),
    alignSelf: "center",
  },
  statusColor: {
    color: "#38B0EA",
    width: wp(17),
    textAlign: "center",
  },
  PriceText: {
    color: "#fff",
    width: wp(15),
  },
  AssetText: {
    color: "#fff",
    width: wp(20),
    textAlign: "center",
  },
  currencyText: {
    color: "#fff",
    width: wp(15),
    marginLeft: wp(10),
  },
  amountText: {
    color: "#fff",
    width: wp(10),
    textAlign: "center",
    marginHorizontal: wp(5),
  },
  amountText1: {
    color: "#fff",
    width: wp(10),
    marginHorizontal: wp(5),
    textAlign: "center",
  },



  headerContainer1_TOP: {
    backgroundColor: "#4CA6EA",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    width: wp(100),
    paddingHorizontal: wp(2),
  },
  logoImg_TOP: {
    height: hp("8"),
    width: wp("12"),
    marginLeft: wp(15),
  },
  text_TOP: {
    color: "white",
    fontSize:19,
    fontWeight:"bold",
    alignSelf: "center",
    // textAlign: "center",
    marginStart:wp(26.5)
  },
  text1_ios_TOP: {
    alignSelf:"center",
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      paddingTop:hp(3),
  },
  linearStyle1: {
    width: wp(95),
    height: hp(70),
    marginBottom: hp(3),
    marginVertical: hp(2),
    borderRadius: 10,
    paddingBottom: hp(1),
    alignSelf: "center",
  },
  modalContainer_option_top: {
    // flex: 1,
    alignSelf:"flex-end",
    alignItems: 'center',
   // backgroundColor: 'rgba(0, 0, 0, 0.3)',
   width:"100%",
   height:"60%",
  },
  modalContainer_option_sub:{
    alignSelf:"flex-end",
    backgroundColor: 'rgba(33, 43, 83, 1)',
  padding: 10,
  borderRadius: 10,
  width:"65%",
  height:"70%"
},
modalContainer_option_view:{
  flexDirection:"row",
  marginTop:25,
  alignItems:"center",
},
modalContainer_option_text:{
fontSize:20,
fontWeight:"bold",
color:"gray",
marginStart:5
}
});