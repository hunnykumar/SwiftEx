import { useEffect, useState } from "react";
import { authRequest, GET, POST } from "../api";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Modal2 from "react-native-modal";
import { ActivityIndicator, Colors, DataTable } from "react-native-paper";
import { OFFER_STATUS_ENUM } from "../utils/constants";
import { PATCH } from "../api";
import { LinearGradient } from "react-native-linear-gradient";
import { alert } from "../../../../reusables/Toasts";
import Icon from "../../../../../icon";
export const OfferBidsView = ({
  offer,
  self = false,
  setChange,
  onCrossPress,
}) => {
  const [modalMessage, setModalMessage] = useState("");
  const [bids, setBids] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    getOfferDetails();
  }, []);
  useEffect(() => {
    getOfferDetails();
  }, [open, loading, isSubmitting, isCancelling]);

  const getOfferDetails = async () => {
    try {
      const { err, res } = await authRequest(
        `/offers/getOfferDetails/${offer._id}`,
        GET
      );
      if (err) return setModalMessage(`${err.message}`);
      console.log(res.offerBids);
      setBids(res.offerBids);
    } catch (err) {
      console.log(err);
      setModalMessage(err.message || "Something went wrong");
    }
  };

  const acceptBid = async (bid) => {
    setChange(true);
    try {
      setIsSubmitting(true);
      const { err } = await authRequest(`/offers/acceptABid`, POST, {
        offerId: offer._id,
        bidId: bid._id,
      });
      if (err) {
        alert("error", `${err.message}`);
        setLoading(false);
        return setModalMessage(`${err.message}`);
      }
      getOfferDetails();
      setModalMessage("success");
      setLoading(false);
      setOpen(false);
      setChange(false);
      return alert("success", "Bid Accepted Successfully");
    } catch (err) {
      console.log(err);
      setLoading(false);

      setModalMessage(err.message || "Something went wrong");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
      getOfferDetails();
    }
  };

  const cancelBid = async () => {
    try {
      setChange(true);
      setIsCancelling(true);
      const { err } = await authRequest(
        `/offers/cancelMatchedBid/${offer._id}`,
        PATCH
      );
      if (err) return setModalMessage(`${err.message}`);
      getOfferDetails();
      setModalMessage("success");
      setLoading(false);
      setOpen(false);
      return alert("success", "Bid Cancelled Successfully");
    } catch (err) {
      console.log(err);
      setModalMessage(err.message || "Something went wrong");
      setLoading(false);
      setChange(false);
    } finally {
      setIsCancelling(false);
      setLoading(false);
      getOfferDetails();
    }
  };

  return (
    <>
      <View>
        <TouchableOpacity
          style={{
            width: wp(16),
            marginLeft: wp(4),
            height: hp(3),
            backgroundColor: "#010C66",
            borderRadius: 6,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={handleOpen}
        >
          <Text style={{ fontSize: 13, color: "white" }}>See Bids</Text>
        </TouchableOpacity>

        <Modal2
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
          {/* <View style={styles.modalContainer}> */}

          <Text style={styles.textColor}>{modalMessage}</Text>

          <View style={styles.container}>
            <Icon
              type={"entypo"}
              name="cross"
              size={24}
              color={"gray"}
              style={styles.crossIcon}
              onPress={() => {
                setOpen(false);
              }}
            />
            <Text style={styles.bidPrice}>
              {"1.4 Eth for 1,00,000 INR Unit Price!"}
            </Text>
            <View style={styles.bidContainer}>
              <Text style={styles.Text}>Bid Amount</Text>
              <Text style={styles.Text}>Bidder</Text>
              <Text style={styles.Text}>Status</Text>
              {self && <Text></Text>}
            </View>
            <ScrollView
              style={{ height: "55%" }}
              showsVerticalScrollIndicator={false}
            >
              {bids.length ? (
                bids.map((bid, index) => (
                  <>
                    <View key={bid._id} style={styles.bidContainer2}>
                      <Text style={styles.Text}>{bid.pricePerUnit}</Text>
                      <Text style={styles.Text}>
                        {bid.user.firstName} {bid.user.lastName}
                      </Text>
                      <Text style={styles.Text}>{bid.status}</Text>
                    </View>

                    {self && !offer.winnerBid ? (
                      <View>
                        <LinearGradient
                          //loading={isSubmitting}
                          onPress={async () => {
                            setLoading(true);
                            acceptBid(bid);
                          }}
                          style={styles.linearBtn}
                          start={[1, 0]}
                          end={[0, 1]}
                          colors={[
                            "rgba(70, 169, 234, 1)",
                            "rgba(185, 116, 235, 1)",
                          ]}
                        >
                          <TouchableOpacity>
                            <Text style={styles.textColor}>Accept Bid</Text>
                          </TouchableOpacity>
                        </LinearGradient>
                      </View>
                    ) : self &&
                      bid._id === offer.winnerBid &&
                      offer.status === OFFER_STATUS_ENUM.MATCHED ? (
                      <View>
                        <Button
                          title={"Cancel bid"}
                          color={"#4CA6EA"}
                          //loading={isCancelling}
                          onPress={async () => {
                            setLoading(true);
                            cancelBid();
                          }}
                        >
                          Cancel Bid
                        </Button>
                      </View>
                    ) : (
                      <LinearGradient
                        style={styles.linearBtn}
                        start={[1, 0]}
                        end={[0, 1]}
                        colors={[
                          "rgba(70, 169, 234, 1)",
                          "rgba(185, 116, 235, 1)",
                        ]}
                      >
                        <TouchableOpacity
                        style={{width:wp(23),alignItems:"center",paddingVertical:hp(0.8)}}
                        >
                          <Text style={styles.textColor}>No Actions</Text>
                        </TouchableOpacity>
                      </LinearGradient>
                    )}
                  </>
                ))
              ) : (
                <View>
                  <Text style={styles.bidText}>No bids found</Text>
                </View>
              )}
            </ScrollView>

            {loading ? (
              <ActivityIndicator size={"large"} color={"blue"} />
            ) : (
              <View></View>
            )}
          </View>

          {loading ? (
            <ActivityIndicator size={"large"} color={"blue"} />
          ) : (
            <View></View>
          )}
          {/* </View> */}
        </Modal2>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "#131E3A",
    height: hp(70),
    borderRadius: 16,
    justifyContent: "center",
    width: wp(90),
    alignSelf: "center",
    alignItems: "center",
  },
  textColor: {
    color: "#fff",
    textAlign: "center",
    width: wp(60),
  },
  yesnomainView: {
    marginVertical: hp(3),
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "space-evenly",
    width: wp(80),
  },
  yesbtnContainer: {
    width: wp(25),
    height: hp(4.5),
    justifyContent: "center",
    borderRadius: 7,
    backgroundColor: "#53A3EA",
    alignItems: "center",
  },
  nobtnContainer: {
    width: wp(25),
    height: hp(4.5),
    justifyContent: "center",
    borderRadius: 7,
    backgroundColor: "#C85350",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#131E3A",
    // height: hp(65),
    borderRadius: 16,
    paddingBottom: 10,
    justifyContent: "center",
    // marginTop: hp(10),
    alignSelf: "center",
    alignItems: "center",
    width: wp("90%"),
  },
  scrollView: {
    width: wp(90),
  },
  tableHeader: {
    backgroundColor: "#DCDCDC",
  },
  table: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "black",
  },
  content: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
    textAlign: "center",
    height: hp(100),
    color: "black",
  },
  Text: {
    color: "#fff",
    width: wp(20),
    textAlign: "center",
  },
  bidContainer: {
    width: wp(75),
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: wp(4),
    marginTop: hp(2),
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
    borderColor: "#4FA4EA",
    paddingBottom: hp(1),
  },
  bidContainer2: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: hp(2),
    width: wp(75),
    marginLeft: wp(4),
  },
  bidPrice: {
    textAlign: "center",
    color: "#fff",
    width: wp(78),
    alignSelf: "center",
    paddingVertical: hp(2),
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
    borderColor: "#4FA4EA",
  },
  linearBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: wp(23),
    alignSelf: "flex-end",
    borderRadius: hp(1),
    marginTop: hp(3),
    marginRight: wp(4),
  },
  bidText: {
    color: "#fff",
    marginTop: hp(2),
    marginHorizontal: wp(5),
  },
  crossIcon: {
    alignSelf: "flex-end",
    padding: hp(1.5),
  },
});
