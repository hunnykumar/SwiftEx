import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Icon from "../icon";

const PrivacyPolicy = () => {
  return (
    <View style={Styles.mainContainer}>
      <Text style={Styles.heading}>Legal</Text>
      <Text style={Styles.wordsContainer}>
        Please review the Trust Wallet Terms of Service and Privacy Policy.
      </Text>
      <View style={Styles.iconwithTextmainContainer}>
        <View style={Styles.iconwithTextContainer1}>
          <Text style={{color:"gray"}}>Privacy Policy</Text>
          <Icon name={"greater-than"} type={"materialCommunity"} size={hp(3)} />
        </View>
        <View style={Styles.iconwithTextContainer}>
          <Text style={{color:"gray"}}>Terms of Service</Text>
          <Icon name={"greater-than"} type={"materialCommunity"} size={hp(3)} />
        </View>
      </View>
      <View style={Styles.btmContainer}>
        <View style={Styles.markedContainer}>
          <Icon
            type={"materialCommunity"}
            name={"checkbox-marked"}
            size={hp(2.3)}
            color={"#006bd2"}
            style={{ backgroundColor: "#fff" }}
          />
          <Text style={Styles.markedWordsContainer}>
            I've read and accept the Terms of Service and Privacy Policy.
          </Text>
        </View>
        <TouchableOpacity style={Styles.btnContainer}>
          <Text style={{color:"#fff"}}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const Styles = StyleSheet.create({
  mainContainer: {
    height: "100%",
    backgroundColor: "#fff",
    position: "relative",
  },
  heading: {
    fontSize: hp(3),
    textAlign: "center",
    marginTop: hp(3),
  },
  wordsContainer: {
    textAlign: "center",
    fontSize: hp(1.6),
    marginVertical: hp(6),
    color:"gray"
  },
  iconwithTextmainContainer: {
    borderWidth: StyleSheet.hairlineWidth * 1,
    width: hp(43),
    borderRadius: hp(1),
    alignSelf: "center",
    borderColor:"gray"
  },
  iconwithTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: hp(43),
    alignSelf: "center",
    padding: hp(2),
  },
  iconwithTextContainer1: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: hp(43),
    padding: hp(2),
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
  },
  markedContainer: {
    flexDirection: "row",
    alignSelf: "center",
  },
  markedWordsContainer: {
    fontSize: hp(1.6),
    color:"#006bd2"
  },
  btnContainer: {
    backgroundColor: "#006bd2",
    width: hp(40),
    height: hp(6),
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: hp(0.7),
    marginTop:hp(2)
  },
  btmContainer: {
    paddingBottom:hp(6),
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
  },
});
export default PrivacyPolicy;
