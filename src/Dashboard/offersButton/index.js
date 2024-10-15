import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { LinearGradient } from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const OffersButton = (props) => {
  const {
    onPress,
    value = "Bid" | "My Offers",
    jumpTo,
    onPressBid,
    onPressOffer,
    firstColor,
    secondColor,
    title1 = "Bid",
    title2 = "My Offers",
    textStyle2,
    textStyle1,
  } = props;
  const navigation = useNavigation();

  const [offers, setOffers] = useState(value ? value : "Bid");

  return (
    <View style={[styles.toggleContainer]}>
      <LinearGradient
        colors={firstColor}
        style={{ borderRadius: 5 }}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.toggleBtn,
            offers == "Bid" ? { borderRadius: hp(4) } : { borderRadius: null },
          ]}
          onPress={onPressBid}
        >
          <Text style={[textStyle1]}>{title1}</Text>
        </TouchableOpacity>
      </LinearGradient>
      <LinearGradient colors={secondColor}
              style={{ borderRadius: 5 }}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0}}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.toggleBtn2]}
          
          onPress={onPressOffer}
        >
          <Text style={[textStyle2]}>{title2}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};
const styles = StyleSheet.create({
  toggleContainer: {
    alignSelf: "center",
    marginTop: hp(1),
    borderColor: "#407EC9",
    borderWidth: StyleSheet.hairlineWidth * 1,
    flexDirection: "row",
    borderRadius: 5,
  },
  toggleBtn: {
    width: wp(43),
    justifyContent: "space-around",
    alignItems: "center",
    height: hp(6),
    flexDirection: "row",
    alignSelf: "center",
  },
  toggleBtn2: {
    width: wp(43),
    height: hp(6),
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    alignSelf: "center",
  },
});
export default OffersButton;
