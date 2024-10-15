import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated, LayoutAnimation, Platform, UIManager } from "react-native";

const TokenHeader = ({ setVisible, name }) => {
  
 
  return (
    <View
      style={{
        backgroundColor: "#131E3A",
        height: hp("7"),
        width: wp(100),
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          height: hp("7"),
          backgroundColor: "#000C66",
          color: "#FFFFFF",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        }}
      >
        <Button
          color="#fff"
          labelStyle={{ fontSize: 24 }}
          icon="arrow-left-bold"
          style={{ marginTop: 20 }}
          onPress={() => {
            setVisible(false);
          }}
        ></Button>

        <Text
          style={{
            marginTop: 20,
            fontWeight: "bold",
            color: "#FFFFFF",
            marginRight: 170,
            fontSize: 22,
            fontFamily: "sans-serif",
          }}
        >
          {name}
        </Text>
      </View>
    </View>
  );
};

export default TokenHeader;
