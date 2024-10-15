import {
  APP_FEE_PERCENTAGE,
  BID_STATUS_ENUM,
  OFFER_STATUS_ENUM,
  TX_FEE_IN_USD,
} from "../utils/constants";
import { useEffect, useState } from "react";
import { GET, PATCH, authRequest } from "../api";
import { convertCurrencies } from "../utils/currencyConversion";
import { View, StyleSheet, ScrollView, Button, TextInput } from "react-native";
import { Text, Box } from "native-base";
import Modal from "react-native-modal";
import { ActivityIndicator, DataTable } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Button as Btn } from "native-base";
import { useToast } from "native-base";
import { ShowToast } from "../../../../reusables/Toasts";
// import SnackBar from "react-native-snackbar-component";
import WebView from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "react-native-linear-gradient";
import { TouchableOpacity } from "react-native";
import Icon from "../../../../../icon";

const UpdateBidModal = ({
  bid,
  getBids,
  setSnackbarVisible,
  setPaymentUrl,
  onCrossPress,
}) => {
  const [modalMessage, setModalMessage] = useState("");
  const [updatedBid, setUpdatedBid] = useState({ pricePerUnit: "" });
  const [txFeeInUsd, setTxFeeInUsd] = useState(TX_FEE_IN_USD);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [breakDowns, setBreakdowns] = useState({
    finalPayable: 0,
    appFee: 0,
    subTotal: 0,
    convertedTxFee: null,
    convertedUnitPrice: null,
  });

  const offer = bid.offer;
  const toast = useToast();
  useEffect(() => {
    console.log("Offer", offer);
    getTxFeeData(offer.assetName, offer.chainId);
  }, []);

  const handleOpen = () => {
    setUpdatedBid({ pricePerUnit: "" });
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const getTxFeeData = async (txName, chainId) => {
    try {
      const { err, res: { gasPriceInUsd = TX_FEE_IN_USD } = {} } =
        await authRequest(`/users/getTxFeeData/${txName}/${chainId}`, GET);
      if (err) return setModalMessage(`${err.status}: ${err.message}`);

      return setTxFeeInUsd(Number(gasPriceInUsd));
    } catch (err) {
      console.log(err);
      setModalMessage(err.message || "Something went wrong");
    }
  };

  const handleChange = (event) => {
    const { name, value } = event;

    const newState = { ...updatedBid };
    newState[name] = value;

    setUpdatedBid(newState);
    calTotalPayable(newState.pricePerUnit, bid.currencyName);
  };

  const updateBid = async () => {
    try {
      setLoading(true);
      const { err, res } = await authRequest(
        `/bids/updateBidPrice/${bid._id}`,
        PATCH,
        updatedBid
      );
      if (err) {
        setLoading(false);
        return setModalMessage(`${err.status}: ${err.message}`);
      }

      if (res) {
        console.log(res);
        if (res.paymentUrl) {
          setPaymentUrl(res.paymentUrl);
          setLoading(false);
          setOpen(false);
          setSnackbarVisible(true);
          return;
        }
      }
      await getBids();
      setLoading(false);
      setOpen(false);
      ShowToast(toast, "Bid updated successfuly");
      return setModalMessage("success");
    } catch (err) {
      console.log(err);
      setLoading(false);
      setModalMessage(err.message || "Something went wrong");
    }
  };

  const calTotalPayable = async (pricePerUnit, currencyName) => {
    const subTotal = pricePerUnit * offer.amount;
    const convertedUnitPrice =
      currencyName !== offer.currencyName
        ? await convertCurrencies(
            currencyName,
            offer.currencyName,
            pricePerUnit
          )
        : null;
    const appFee = (subTotal * APP_FEE_PERCENTAGE).toFixed(2);
    let convertedTxFee = txFeeInUsd / 2;
    if (currencyName !== "USD")
      convertedTxFee = await convertCurrencies(
        "USD",
        currencyName,
        txFeeInUsd / 2
      );
    const finalPayable =
      subTotal + subTotal * APP_FEE_PERCENTAGE + convertedTxFee;
    setBreakdowns({
      finalPayable,
      appFee,
      subTotal,
      convertedTxFee,
      convertedUnitPrice,
    });
  };

  return (
    <>
      <View>
        <View style={{ marginHorizontal: wp(5) }}>
          <TouchableOpacity
            style={styles.updateBtn}
            onPress={() => {
              handleOpen();
            }}
          >
            <Text style={{ color: "white" }}>Update</Text>
          </TouchableOpacity>
        </View>

        {/* <TouchableOpacity
          onPress={() => {
            handleOpen();
          }}
          style={styles.cancelBtn}
        >
          <Text style={{ color: "white" }}>Update</Text>
        </TouchableOpacity> */}
        <Modal
          animationIn="slideInRight"
          animationOut="slideOutRight"
          animationInTiming={100}
          animationOutTiming={200}
          isVisible={open}
          useNativeDriver={true}
          useNativeDriverForBackdrop={true}
          backdropTransitionOutTiming={0}
          hideModalContentWhileAnimating
          onBackdropPress={() => {
            setOpen(false);
          }}
          onBackButtonPress={() => {
            //setShowModal(!showModal);
            setOpen(false);
          }}
        >
          <View style={styles.modalView}>
            <Icon
              type={"entypo"}
              name="cross"
              color={"gray"}
              size={24}
              style={styles.crossIcon}
              onPress={() => {
                setOpen(false);
              }}
            />
            <Text style={styles.addtxt}>Adding Offer</Text>
            <View style={styles.assetText}>
              <Text style={{ fontWeight: "700", color: "white" }}>
                Enter Asset amount
              </Text>
              <TextInput
                mx="3"
                style={{
                  borderBottomWidth: 1.5,
                  borderColor: "#407EC9",
                  color: "white",
                  width: wp(15),
                  textAlign: "center",
                }}
                placeholder="0.01"
                placeholderTextColor={"white"}
                w="30%"
                onChangeText={(text) => {
                  let event = {
                    value: text,
                    name: "pricePerUnit",
                  };
                  handleChange(event);
                }}
                value={updatedBid.pricePerUnit}
              />
            </View>

            <Text style={{ marginTop: hp(1), color: "white" }}>
              Bid unit price with current value:
              <Text bold>
                {bid.pricePerUnit} {bid.currencyName}
              </Text>
            </Text>
            <Text style={{ color: "red" }}>{modalMessage}</Text>

            <View style={{ display: "flex", flexDirection: "column" }}>
              <View>
                {breakDowns.convertedUnitPrice !== 0 &&
                  breakDowns.convertedUnitPrice && (
                    <>
                      <Text style={styles.txt}>Converted Unit Price:</Text>
                      <Text style={styles.txt}>
                        {breakDowns.convertedUnitPrice}{" "}
                        <Text bold style={styles.txt}>
                          {offer.currencyName}
                        </Text>
                      </Text>
                    </>
                  )}
              </View>
              <View style={styles.textView}>
                <Text bold style={styles.txt}>
                  Subtotal:
                </Text>
                <Text style={styles.txt}>
                  {breakDowns.subTotal}{" "}
                  <Text style={styles.txt}>{bid.currencyName}</Text>
                </Text>
              </View>

              <View style={styles.textView}>
                <Text bold style={styles.txt}>
                  App Fee:
                </Text>
                <Text style={styles.txt}>
                  {breakDowns.appFee}{" "}
                  <Text style={styles.txt}>{bid.currencyName}</Text> (
                  <Text style={styles.txt}>{100 * APP_FEE_PERCENTAGE}%</Text>)
                </Text>
              </View>

              <View style={styles.textView}>
                <Text bold style={styles.txt}>
                  Transaction Fee:
                </Text>
                <Text style={styles.txt}>
                  {txFeeInUsd / 2} <Text>USD</Text>{" "}
                  {breakDowns.convertedTxFee && (
                    <>
                      (
                      <Text style={styles.txt}>
                        {breakDowns.convertedTxFee} {bid.currencyName}
                      </Text>
                      )
                    </>
                  )}
                </Text>
              </View>

              <View style={styles.textView}>
                <Text bold style={styles.txt}>
                  Total:
                </Text>
                <Text style={styles.txt}>
                  {breakDowns.finalPayable} <Text bold>{bid.currencyName}</Text>
                </Text>
              </View>
            </View>

            <View style={styles.btnView}>
              <LinearGradient
                style={styles.linearBtn}
                start={[1, 0]}
                end={[0, 1]}
                colors={["rgba(70, 169, 234, 1)", "rgba(185, 116, 235, 1)"]}
              >
                <TouchableOpacity onPress={updateBid}>
                  <Text style={styles.txt}>
                    {loading ? (
                      <ActivityIndicator size={"small"} color="blue" />
                    ) : (
                      "Confirm"
                    )}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setOpen(false);
                }}
              >
                <Text style={{ color: "#D19292" }}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.noteTxt}>
              <Text bold style={styles.txt}>
                Note:
              </Text>{" "}
              The above totals are just estimations that can vary depending on
              currency rates
            </Text>
          </View>
        </Modal>
      </View>
    </>
  );
};

export const BidsListView = ({ bids, getBids }) => {
  const [message, setMessage] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [txModal, setTxModal] = useState(false);
  const navigation = useNavigation();
  const toast = useToast();
  const SeeTransactions = () => {
    return (
      <View>
        <Modal
          animationIn="slideInRight"
          animationOut="slideOutRight"
          animationInTiming={100}
          animationOutTiming={200}
          isVisible={txModal}
          useNativeDriver={true}
          onBackdropPress={() => {
            setTxModal(false);
          }}
          onBackButtonPress={() => {
            //setShowModal(!showModal);
            setTxModal(false);
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
            <WebView
              source={{ uri: `${paymentUrl}` }}
              onNavigationStateChange={(data) => {
                if (data?.url?.includes(`offers?session_id`)) {
                  ///do if payment successfull
                  ShowToast(toast, "Payment Success");
                  navigation.navigate("/Transactions");
                }

                if (data.url.includes("offers?payFailed=true")) {
                  ///do if payment is cancelled
                  setTxModal(false);
                  ShowToast(toast, "Payment failed");
                }
              }}
            />
          </View>
        </Modal>
      </View>
    );
  };

  const cancelBid = async (bidId) => {
    try {
      const { err } = await authRequest(`/bids/cancelBid/${bidId}`, PATCH);
      if (err) return setMessage(`${err.status}: ${err.message}`);

      await getBids();
      return setMessage("success");
    } catch (err) {
      console.log(err);
      setMessage(err.message || "Something went wrong");
    }
  };
  return (
    bids && (
      <>
        <View style={{ backgroundColor: "#131E3A" }}>
          <Text color={"blue.400"}>{message}</Text>
          <LinearGradient
            style={styles.linearStyle1}
            start={[1, 0]}
            end={[0, 1]}
            colors={["rgba(1, 12, 102, 1)", "rgba(224, 93, 154, 1)"]}
          >
            <ScrollView nestedScrollEnabled horizontal>
              <ScrollView nestedScrollEnabled={true}>
                <View style={styles.tableHeader}>
                  <Text style={styles.AssetText}>Asset Amount</Text>
                  <Text style={styles.AssetText}>Bid Unit Price</Text>
                  <Text style={styles.AssetText}>Bid Currency</Text>
                  <Text style={styles.AssetText}>Offer Unit Price</Text>
                  <Text style={styles.AssetText}>Offer Currency</Text>
                  <Text style={styles.AssetText}>Offer Issuer</Text>
                  <Text
                    style={{
                      color: "#fff",
                      width: wp(20),
                      textAlign: "center",
                    }}
                  >
                    Status
                  </Text>
                </View>
                {bids.length ? (
                  <>
                    {bids.map((bid, index) => (
                      <View>
                        <ScrollView
                          horizontal={true}
                          key={bid._id}
                          contentContainerStyle={styles.mainDataContainer}
                        >
                          <Text style={styles.textColor}>
                            {bid.offer.assetName}
                          </Text>
                          <Text style={styles.textColor}>
                            {bid.offer.amount}
                          </Text>
                          <Text style={styles.textColor}>
                            {bid.currencyName}
                          </Text>
                          <Text style={styles.textColor}>
                            {bid.offer.pricePerUnit}
                          </Text>
                          <Text style={styles.textColor}>
                            {bid.offer.currencyName}
                          </Text>
                          <Text style={styles.textColor}>{bid.issuerName}</Text>
                          <Text
                            style={{
                              color: "#33B3EA",
                              width: wp(20),
                              // textAlign: "center",
                              // color: "#fff",
                              // width: wp(16),
                              // marginHorizontal: 10,
                              textAlign: "center",
                            }}
                          >
                            {bid.status}
                          </Text>
                        </ScrollView>
                        {bid.offer.status === OFFER_STATUS_ENUM.ACTIVE && (
                          <View
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              margin: 2,
                            }}
                          >
                            {bid.status === BID_STATUS_ENUM.ACTIVE && (
                              <>
                                <UpdateBidModal
                                  bid={bid}
                                  getBids={getBids}
                                  setSnackbarVisible={setSnackbarVisible}
                                  setPaymentUrl={setPaymentUrl}
                                />
                                <TouchableOpacity
                                  style={styles.updateBtn}
                                  onPress={() => cancelBid(bid._id)}
                                >
                                  <Text style={{ color: "white" }}>Cancel</Text>
                                </TouchableOpacity>
                              </>
                            )}
                            {bid.status === BID_STATUS_ENUM.CANCELED && (
                              <TouchableOpacity
                                style={styles.updateBtn1}
                                onPress={() => cancelBid(bid._id)}
                              >
                                <Text style={{ color: "white" }}>
                                  Re-Activate
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}
                      </View>
                    ))}
                  </>
                ) : (
                  <View>
                    <Text style={styles.showText}>No Offers to show !</Text>
                  </View>
                )}

                {/* <SnackBar
                  visible={snackbarVisible}
                  position={"top"}
                  textMessage="Bid is an exact match. Proceed to complete the transaction"
                  actionHandler={() => {
                    //Linking.openURL(paymentUrl)
                    setTxModal(true);
                    SeeTransactions();
                    setSnackbarVisible(false);
                  }}
                  actionText="Proceed"
                /> */}
              </ScrollView>
              <SeeTransactions />
            </ScrollView>
          </LinearGradient>
        </View>
      </>
    )
  );
};

const styles = StyleSheet.create({
  container: {
    width: wp(100),
    height: hp(50),
    color: "black",
    paddingBottom: wp(5),
  },
  container2: {
    width: wp(100),
    height: hp(57),
    color: "black",
  },
  scrollView: {
    width: wp(100),
  },
  tableHeader: {
    // width: wp(95),
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
    borderColor: "#EE96DF",
    paddingVertical: hp(1),
    margin: 10,
  },
  table: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
    textAlign: "center",
    backgroundColor: "#E2808A",
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
    width: wp(20),
    // marginHorizontal: 10,
    textAlign: "center",
  },
  linearStyle1: {
    width: wp(95),
    height: hp(44),
    marginBottom: hp(3),
    marginVertical: hp(2),
    borderRadius: 10,
    alignSelf: "center",
  },
  showText: {
    color: "#fff",
    marginHorizontal: wp(2),
    marginVertical: hp(2),
  },
  textColor: {
    // color: "#fff",
    // width: wp(10),
    // textAlign: "center",
    color: "#fff",
    width: wp(20),
    textAlign: "center",
  },
  mainDataContainer: {
    // flexDirection: "row",
    // justifyContent: "space-between",
    // // width: wp(95),
    // alignItems: "center",
    // alignSelf: "center",
    // marginTop: hp(1),
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: hp(1),
    margin: 10,
  },
  cancelBtn: {
    width: wp(17),
    alignItems: "center",
    marginLeft: 10,
    backgroundColor: "#010C66",
    borderRadius: hp(0.6),
    marginLeft: wp(2),
    padding: 3,
  },
  textView: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: wp(60),
    marginTop: hp(2),
  },
  linearBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: wp(30),
    alignSelf: "flex-end",
    borderRadius: hp(1),
    // marginTop: hp(3),
    alignSelf: "center",
    height: hp(5),
    // marginRight: wp(4),
  },
  txt: {
    color: "white",
  },
  modalView: {
    backgroundColor: "#131E3A",
    paddingTop: hp(2),
    paddingBottom: hp(5),
    // height: hp(70),
    borderRadius: hp(1),
    alignSelf: "center",
    width: wp(90),
    alignItems: "center",
    justifyContent: "center",
  },
  addtxt: { fontWeight: "700", color: "white", fontSize: 16 },
  assetText: {
    flexDirection: "row",
    alignItems: "center",
    width: wp(55),
    justifyContent: "space-between",
    marginTop: hp(2),
  },
  btnView: {
    flexDirection: "row",
    marginTop: hp(3),
    alignItems: "center",
    justifyContent: "space-between",
    width: wp(70),
  },
  cancelBtn: {
    borderColor: "#D19292",
    borderWidth: 1.5,
    width: wp(30),
    borderRadius: hp(1),
    paddingVertical: hp(0.9),
    alignItems: "center",
  },
  noteTxt: {
    width: wp(70),
    alignSelf: "center",
    marginTop: hp(3),
    color: "white",
  },
  crossIcon: {
    alignSelf: "flex-end",
    padding: hp(1.2),
  },
  updateBtn: {
    backgroundColor: "#4CA6EA",
    width: wp(22),
    padding: 5,
    alignItems: "center",
    borderRadius: hp(1),
  },
  updateBtn1:{
    backgroundColor: "#4CA6EA",
    width: wp(22),
    padding: 5,
    alignItems: "center",
    borderRadius: hp(1),
    marginHorizontal:wp(6) ,
    alignSelf:"center"
  }
});
