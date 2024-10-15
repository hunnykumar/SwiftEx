import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "../../../../../../icon";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useState } from "react";

export default function Subscription_det({ route }) {
  const { ID } = route.params;
  const FOCUSED = useIsFocused();
  const navigation = useNavigation();
  const [avl_plan, setavl_plan] = useState([
    { id: 1, month: "1 month", save_on_price: 16, org_price: "5", current_price: "Free", type: "Mothly", subscriber_type: "" },
    { id: 2, month: "3 month", save_on_price: 16, org_price: "15", current_price: "$ 14.6", type: "Quarter", subscriber_type: "MOST POPULAR" },
    { id: 3, month: "Yearly", save_on_price: 16, org_price: "60", current_price: "$ 58", type: "Yearly", subscriber_type: "BEST VALUE" }
  ]);
  return (
    <View style={styles.content} onPress={() => { Keyboard.dismiss() }}>
      <Icon
        name={"left"}
        type={"antDesign"}
        size={30}
        color={"white"}
        style={styles.top_back}
        onPress={() => navigation.goBack()}
      />
      <Text style={styles.top_heading}>Plan Details</Text>
      <View style={styles.plan_container} >
        <View style={styles.plan_details}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: hp(0.5), marginHorizontal: wp(3) }}>
            <Text style={styles.comman_text}>{avl_plan[ID].month}</Text>
            <View style={[styles.right_container, { marginTop: hp(2), marginRight: wp(2) }]}>
              <Text style={styles.comman_text_1}>{avl_plan[ID].current_price}</Text>
              <Text style={[styles.comman_text_1, { fontSize: 13, fontWeight: "400" }]}>{avl_plan[ID].type}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.note_txt}>
          Unlimited Transactions: Enjoy seamless transactions without any limits{'\n\n'}
          Manage Multiple Wallets: Easily manage and switch between different wallets.{'\n\n'}
          Unlimited Transactions: Enjoy seamless transactions without any limits{'\n\n'}
          Advanced Analytics: Access detailed reports and insights on your transactions and account activity.{'\n\n'}
          Enhanced Security: Benefit from advanced encryption and multi-factor authentication for added security{'\n\n'}
          Exclusive Offers & Discounts: Unlock special deals and offers available only to premium members.{'\n\n'}
          Early Access to New Features: Be the first to try out upcoming features and updates before anyone else{'\n\n'}
        </Text>
      </View>
        <Text style={styles.btom_txt}>Terms And Conditions / Privacy Police</Text>
    </View>
  )
}


const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: "#011434",
  },
  top_back: {
    marginLeft: wp(4.3),
    marginTop: hp(3)
  },
  top_heading: {
    marginTop: hp(4),
    fontSize: 30,
    fontWeight: "600",
    color: "#fff",
    marginHorizontal: wp(6)
  },
  plan_container: {
    width: wp(90),
    alignSelf: "center",
    marginTop: hp(2),
    borderColor: "#2F9CDC",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10
  },
  note_txt: {
    fontSize: 15,
    color: "gray",
    marginTop: hp(3)
  },
  btom_txt: {
    fontSize: hp(1.6),
    color: "rgba(255, 255, 255, 0.77)",
    fontWeight: "600",
    alignSelf: "center",
    marginTop: hp(4)
  },
  comman_text: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800"
  },
  comman_text_1: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800"
  },
  right_container: {
    alignItems: "center"
 },
});