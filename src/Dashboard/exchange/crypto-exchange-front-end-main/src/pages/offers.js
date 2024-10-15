import OffersButton from "../../../../../Dashboard/offersButton";
import { useEffect, useState } from "react";
import { authRequest, GET } from "../api";
import { NewBidModal } from "../components/newBid.modal";
import { OfferBidsView } from "../components/offerBids.modal";
import { TabView, SceneMap } from "react-native-tab-view";
import { ActivityIndicator, DataTable } from "react-native-paper";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
  Image,
  Linking,
  Modal,
  Platform
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { CHAIN_ID_TO_SCANNER } from "../web3";
import { LinearGradient } from "react-native-linear-gradient";
import Icon from "../../../../../icon";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native";
import darkBlue from "../../../../../../assets/darkBlue.png";
import Bridge from "../../../../../../assets/Bridge.png";
import { REACT_APP_LOCAL_TOKEN } from "../ExchangeConstants";
import { useIsFocused } from '@react-navigation/native';
import WebView from "react-native-webview";



export const OfferListView = ({ self = false, offers, profile, setChange }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    OfferListViewHome()
    OfferListView()
  }, [open, offers, profile, setChange])

  return (
    <View style={{ backgroundColor: "#131E3A" }}>
      <LinearGradient
        style={styles.linearStyle}
        start={[1, 0]}
        end={[0, 1]}
        colors={["rgba(1, 12, 102, 1)", "rgba(224, 93, 154, 1)"]}
      >
        <ScrollView nestedScrollEnabled horizontal>
          <ScrollView nestedScrollEnabled>
            <View style={styles.tableHeader}>
              <Text style={styles.AssetText}>Asset</Text>
              <Text style={styles.AssetText}>Amount</Text>
              <Text style={styles.AssetText}>Unit Price (of Eth)</Text>
              <Text style={styles.AssetText}>Total Price (In INR)</Text>
              <Text style={styles.AssetText}>Currency</Text>
              <View style={{ position: "relative" }}>
                <Icon
                  name={"info"}
                  type={"feather"}
                  style={styles.infoIcon}
                  color={"#DBAFC9"}
                />
                <Text style={styles.textColor}>Status</Text>
              </View>
            </View>
            <ScrollView>
              {offers ? (
                offers.map((offer) => {
                  if (self)
                    return (
                      offer.issuer === profile._id && (
                        <>
                          <View key={offer._id}>
                            <ScrollView key={offer._id}>
                              <View
                                key={offer._id}
                                style={styles.Table1Container}
                              >
                                <View>
                                  <Text style={styles.textColor}>
                                    {offer.assetName}
                                  </Text>
                                  <Text style={styles.textColor}>
                                    {offer.amount}
                                  </Text>
                                </View>

                                <Text style={styles.textColor}>
                                  {offer.pricePerUnit}
                                </Text>
                                <Text
                                  style={styles.textColor}
                                  numberOfLines={1}
                                >
                                  {offer.totalPrice}
                                </Text>
                                <Text style={styles.textColor}>
                                  {offer.currencyName}
                                </Text>
                                <Text style={styles.textColor}>
                                  {offer.status}
                                </Text>
                              </View>
                            </ScrollView>
                            <OfferBidsView
                              offer={offer}
                              self={self}
                              setChange={setChange}
                            />
                          </View>
                        </>
                      )
                    );
                  return (
                    offer.issuer !== profile._id && (
                      <>
                        <ScrollView>
                          <View key={offer._id} style={styles.Table1Container}>
                            <Text style={styles.textColor}>
                              {offer.assetName}
                            </Text>
                            <Text style={styles.textColor}>
                              {offer.amount} {"Bid"}
                            </Text>
                            <Text style={styles.textColor}>
                              {Number(offer.pricePerUnit).toFixed(2)}
                            </Text>
                            <Text style={styles.textColor}>
                              {Number(offer.totalPrice).toFixed(2)}
                            </Text>
                            <Text style={styles.textColor}>
                              {offer.currencyName}
                            </Text>

                            <Text style={styles.statusColor}>
                              {offer.status}
                            </Text>
                          </View>
                        </ScrollView>
                        <View style={{ flexDirection: "row" }}>
                          <View style={{ marginRight: 20 }}>
                            <OfferBidsView
                              offer={offer}
                              setChange={setChange}
                            />
                          </View>
                          <NewBidModal offer={offer} />
                        </View>
                      </>
                    )
                  );
                })
              ) : (
                <View>
                  <ActivityIndicator size={"small"} color={"blue"} />
                </View>
              )}
            </ScrollView>
          </ScrollView>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};
export const OfferListViewHome = () => {
  const isFocused = useIsFocused();
  const [history, sethistory] = useState([]);
  const [open_details, setopen_details] = useState(false);
  const [id,setid]=useState("");
  const getAllTransactions = async () => {
    try {
      const transactions = await AsyncStorageLib.getItem("offer_data");

      if (transactions) {
        const parsedTransactions = JSON.parse(transactions);
        sethistory(parsedTransactions)
        console.log("<<<<<>", parsedTransactions)
        return parsedTransactions;
      } else {
        console.log("No transactions found.");
        return [];
      }
    } catch (error) {
      console.error("Error getting all transactions:", error);
      throw error;
    }
  };

  useEffect(() => {
    getAllTransactions();
    setid("");
  }, [isFocused])
  return (
    // <View style={{ backgroundColor: "#131E3A" }}>
    <View style={{ backgroundColor: "#011434", flex: 1 }}>

      <Text style={{ color: "white", marginLeft: 13, marginTop: 13, fontWeight: "bold", fontSize: 19 }}>Created Offers</Text>
      {/* <LinearGradient
        style={styles.linearStyle1}
        start={[1, 0]}
        end={[0, 1]}
        colors={["rgba(1, 12, 102, 1)", "rgba(224, 93, 154, 1)"]}
      > */}
      <View style={[styles.linearStyle1, { backgroundColor: "rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)" }]}>
        <ScrollView nestedScrollEnabled horizontal>
          <ScrollView nestedScrollEnabled={true}>
            <View style={styles.tableHeader}>
              <Text style={styles.AssetText}>View</Text>
              <Text style={styles.AssetText}>Asset</Text>
              <Text style={styles.AssetText}>Amount</Text>
              <Text style={styles.AssetText}>Price</Text>
              <Text style={styles.AssetText}>Type</Text>
              <Text style={styles.textColor}>Status</Text>
            </View>
            <>
              {history.length === 0 ? <Text style={{ color: "white", margin: 10, fontWeight: "bold", fontSize: 19 }}>{"No Offer Records."}</Text> :
                history.map((offer, index) => {
                  return (
                    <>
                      <View key={index}>
                        <ScrollView horizontal={true} key={offer._id}>
                          <View
                            key={index}
                            style={styles.mainDataContainer}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                width: wp(20),
                                color: "#4CA6EA",
                              }}
                              //  onPress={()=>{ Linking.openURL("https://stellar.expert/explorer/testnet/tx/"+offer.date);}}
                              onPress={() => { setopen_details(true),setid(offer.date) }}
                            >
                              Details
                            </Text>

                            <Text style={styles.textColor}>
                              {offer.asset.code}
                            </Text>

                            <Text style={styles.textColor}>
                              {offer.amount}
                            </Text>

                            <Text style={styles.textColor}>
                              {offer.price}
                            </Text>
                            <Text style={styles.textColor}>
                              {offer.forTransaction}
                            </Text>
                            <Text style={[styles.textColor, { color: "green", fontWeight: "bold", }]}>
                              {offer.status}
                            </Text>
                            <Modal
                              animationType="slide"
                              transparent={true}
                              visible={open_details}
                            >
                              <View style={{ height: hp(70.8), width: "94%", backgroundColor: "white", margin: 10, borderRadius: 10, marginTop: hp(15) }}>
                                <TouchableOpacity style={{ alignSelf: "flex-end", marginRight: 10, marginTop: 10 }} onPress={() => { setopen_details(false); }}>
                                  <Icon name={"close"} type={"antDesign"} size={28} color={"black"} />
                                </TouchableOpacity>
                                <WebView source={{ uri: `https://stellar.expert/explorer/testnet/tx/${id}`}} />
                              </View>
                            </Modal>
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
      </View>
      {/* </LinearGradient> */}
    </View>
  )
};

export const OfferView = () => {
  const navigation = useNavigation();
  const [offers, setOffers] = useState();
  const [change, setChange] = useState(false);
  const [modalContainer_menu,setmodalContainer_menu]=useState(false);

  const [profile, setProfile] = useState({
    isVerified: false,
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    isEmailVerified: true,
  });
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
      }}>Offers</Text>

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

            <TouchableOpacity style={styles.modalContainer_option_top} onPress={() => { setmodalContainer_menu(false) }}>
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
      <View style={{ height: hp(100), backgroundColor: "#131E3A" }}>
        <OfferListViewHome
          self={true}
          profile={profile}
          offers={offers}
          setChange={setChange}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  mainDataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp(90),
    alignItems: "center",
    alignSelf: "center",
    marginTop: hp(1),
  },
  linearStyle: {
    width: wp(95),
    height: hp(62),
    marginBottom: hp(3),
    marginVertical: hp(2),
    borderRadius: 10,
    alignSelf: "center",
    paddingBottom: hp(2),
  },
  transactionBtn: {
    width: wp(40),
    alignSelf: "center",
    borderRadius: 8,
    borderColor: "#EE96DF",
    borderWidth: StyleSheet.hairlineWidth * 1,
    padding: 8,
    alignItems: "center",
    marginTop: hp(2),
  },
  linearStyle1: {
    width: wp(94),
    height: hp(70),
    marginBottom: hp(3),
    marginVertical: hp(2),
    borderRadius: 10,
    paddingBottom: hp(1),
    alignSelf: "center",
  },

  container2: {
    width: wp(100),
    height: hp(57),
    color: "black",
  },
  scrollView: {
    // width: wp(100),
    alignSelf: "center",
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

  infoIcon: {
    alignSelf: "flex-end",
    position: "absolute",
    // left:10,
    top: -8,
    right: 5,
  },
  seeBidStyle: {
    flexDirection: "row",
    width: wp(20),
    marginHorizontal: wp(4),
  },
  offersText: {
    color: "#fff",
    textAlign: "center",
    marginTop: hp(2),
    fontSize: hp(2.1),
  },
  mainDataContainer: {
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: hp(1),
    margin: 10,
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
    alignSelf:"center",
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      paddingTop:hp(3),
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