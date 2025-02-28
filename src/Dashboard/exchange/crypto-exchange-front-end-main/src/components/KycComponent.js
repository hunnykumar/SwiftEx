import { useEffect, useState } from "react";
import { 
    Keyboard,
  KeyboardAvoidingView, 
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
import InfoCustomAlert from "../components/InfoCustomAlert";
import { useNavigation } from "@react-navigation/native";
import { Exchange_screen_header } from "../../../../reusables/ExchangeHeader";
import Icon from "../../../../../icon";

const KycComponent = ({ route }) => {
    const navigation = useNavigation();
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [amountSend, setamountSend] = useState(0.00);
    const { width, height } = useWindowDimensions();

    useEffect(() => {
      setVisibleAlert(false);
      setamountSend(0.00);
    }, []);

    const visibleClose = () => {
      setVisibleAlert(false);
      navigation.navigate("exchangeLogin")
    };

    // Calculate dynamic widths based on screen size
    const getContainerWidth = () => {
      return Math.min(380, width - 30);
    };

    const getPairButtonWidth = () => {
      return (getContainerWidth() - 20) / 2;
    };

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
                heading="Oops! You're in Guest Mode"
                subHeading="Looks like you're in Guest Mode. Log in to unlock this feature and enjoy the full experience!"
                btnText="Login"
                onclose={visibleClose}
              />
            )}

            {/* Pair container */}
            <View style={[styles.pariViewCon, { width: "100%",paddingHorizontal:6 }]}>
              <TouchableOpacity 
                style={[
                  styles.pairNameCon, 
                  { backgroundColor: "#2164C1", width: getPairButtonWidth() }
                ]}
              >
                <Text style={styles.pairNameText}>XLM</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pairNameCon, { width: getPairButtonWidth() }]}
              >
                <Text style={styles.pairNameText}>USDC</Text>
              </TouchableOpacity>
            </View>

            {/* First Amount Container */}
            <View style={[styles.amountInfoCon, { width:"100%" }]}>
              <View style={styles.amountInfoHeader}>
                <Text style={styles.amountInfoText}>You Send</Text>
                <Text style={styles.amountInfoText}>Min:6.16</Text>
              </View>
              <View style={styles.amountInputCon}>
                <View style={[styles.amountSubCon, { width: getContainerWidth() * 0.4 }]}>
                  <TextInput 
                    placeholder="Deposit amount..." 
                    placeholderTextColor="gray"
                    value={amountSend}
                    style={styles.amountInput}
                    onChangeText={(text)=>{setamountSend(text)}}
                    returnKeyType="done"
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.amountFlagCon}>
                  <View style={styles.currencySelector}>
                    <View style={styles.downBoxCon}>
                      <Icon name="currency-usd" type="materialCommunity" color="#fff" size={30} />
                    </View>
                    <Text style={styles.currencyText}>USD</Text>
                  </View>
                  <TouchableOpacity style={styles.downBoxCon}>
                    <Icon name="chevron-down" type="materialCommunity" color="#fff" size={30} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Info Container */}
            <View style={styles.infoCon}>
              <View style={styles.infoRow}>
                <Icon name="circle-small" type="materialCommunity" color="#fff" size={30} />
                <Text style={styles.infoText}>No extra fees</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="circle-small" type="materialCommunity" color="#fff" size={30} />
                <Text style={styles.infoText}>Estimation rate : 1USD = 0.00050591 ETH</Text>
              </View>
            </View>

            {/* Wallet Address */}
            <View style={[styles.walletAddress, { width: "100%" }]}>
              <Text style={styles.sectionTitle}>Wallet Address</Text>
              <View style={styles.addressContainer}>
                <Text style={styles.addressText} numberOfLines={1}>
                  Ofx3849473743287328hgfe84739743287328hgfe84739
                </Text>
              </View>
            </View>

            {/* Second Amount Container */}
            <View style={[styles.amountInfoCon, { width: "100%", marginTop: 20 }]}>
              <View style={styles.amountInfoHeader}>
                <Text style={styles.amountInfoText}>You Receive</Text>
                <Text style={styles.amountInfoText}>Min:6.16</Text>
              </View>
              <View style={styles.amountInputCon}>
                <View style={[styles.amountSubCon, { width: getContainerWidth() * 0.4 }]}>
                  <TextInput
                   editable={false}
                    placeholder="Deposit amount..." 
                    placeholderTextColor="gray"
                    value="0.0505905"
                    style={styles.amountInput}
                  />
                </View>
                <View style={styles.amountFlagCon}>
                  <View style={styles.currencySelector}>
                    <View style={styles.downBoxCon}>
                      <Icon name="ethereum" type="materialCommunity" color="#fff" size={28} />
                    </View>
                    <Text style={styles.currencyText}>ETH</Text>
                  </View>
                  <TouchableOpacity style={styles.downBoxCon}>
                    <Icon name="chevron-down" type="materialCommunity" color="#fff" size={28} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Payment Methods */}
            <View style={[styles.paymentSection, { width: "100%" }]}>
              <Text style={styles.sectionTitle}>Pay via</Text>
              <View style={styles.paymentOptions}>
                <TouchableOpacity style={styles.paymentMethod}>
                  <Icon name="credit-card" type="materialCommunity" color="rgba(255, 255, 255, 0.7)" size={30} />
                  <Text style={styles.paymentText}>Credit Card</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.paymentMethod}>
                  <Icon name="apple" type="materialCommunity" color="rgba(255, 255, 255, 0.7)" size={30} />
                  <Text style={styles.paymentText}>Apple pay</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.paymentMethod}>
                  <Icon name="dots-horizontal" type="materialCommunity" color="rgba(255, 255, 255, 0.7)" size={30} />
                  <Text style={styles.paymentText}>More</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Buy Button */}
            <TouchableOpacity 
              style={[styles.buyBtn, { width: "100%" }]}
              onPress={() => setVisibleAlert(!visibleAlert)}
            >
              <Text style={styles.buyBtnText}>Buy</Text>
            </TouchableOpacity>
          </ScrollView>
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
  pariViewCon: {
    marginVertical: 20,
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
    padding: 15,
    alignSelf: "center",
  },
  amountInfoHeader: {
    flexDirection: "row",
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
    fontSize: 16,
    fontWeight: "900",
    color: "#fff",
    padding: 0,
  },
  amountFlagCon: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 10,
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
  downBoxCon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#18212F",
    alignItems: "center",
    justifyContent: "center",
  },
  infoCon: {
    paddingHorizontal: -15,
    marginVertical: 15,
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
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 10,
    marginLeft:"2%"
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
});

export default KycComponent;