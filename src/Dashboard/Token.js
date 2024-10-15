import React from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  StyleSheet,
  Text,
  StatusBar,
  Image,
  ScrollView,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Icon from "../icon";
const DATA = [
  {
    id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
    title1: "BNB",
    title: "$313.83+",
    percenteg: "1.68%",
    uri: require("../../assets/bnb-icon2_2x.png"),
  },
  {
    id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
    title1: "BTC",
    title: "$27,330.32+",
    percenteg: "1.97%",
    uri: require("../../assets/matic.png"),
  },
  {
    id: "58694a0f-3da1-471f-bd96-145571e29d72",
    title1: "ETH",
    title: "$1,856.41+",
    percenteg: "231%",
    uri: require("../../assets/ethereum.png"),
  },
  {
    id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
    title1: "BNB",
    title: "$313.83+",
    percenteg: "1.68%",
    uri: require("../../assets/matic.png"),
  },
  {
    id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
    title1: "BTC",
    title: "$27,330.32+",
    percenteg: "1.97%",
    uri: require("../../assets/bnb-icon2_2x.png"),
  },
  {
    id: "3ac68afc-c605-48d3-a4f8-fbd91aa97f63",
    title1: "BTC",
    title: "$27,330.32+",
    percenteg: "1.97%",
    uri: require("../../assets/bnb-icon2_2x.png"),
  },
];

const Token = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {DATA.map((item) => {
        return (
          <View style={styles.mainContainer}>
            <Image source={item.uri} style={styles.img} />
            <View style={styles.numberContainer}>
              <View style={styles.textContainer}>
                <Text>{item.title1}</Text>
                <View style={styles.percentContainer}>
                  <Text>{item.title}</Text>
                  <Text style={{ color: "green" }}>{item.percenteg}</Text>
                </View>
              </View>
              <Text>0</Text>
            </View>
            <View></View>
          </View>
        );
      })}
      <View style={styles.addContainer}>
        <Icon
          type={"antDesign"}
          name={"pluscircle"}
          size={hp(3)}
          color={"#145DA0"}
        />
        <Text style={{ marginHorizontal: hp(2), color: "#145DA0" }}>
          Add Tokens
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: hp(3),
  },
  addContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: hp(7),
    marginVertical: hp(3),
  },
  container: {
    flex: 1,
    backgroundColor:"red"
    // backgroundColor: "#fff",
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 10,
  },
  img: {
    width: hp(8),
    height: hp(8),
  },
  textContainer: {
    marginHorizontal: hp(3),
  },
  numberContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: hp(35),
  },
  percentContainer: {
    flexDirection: "row",
  },
});


export default Token;

 
