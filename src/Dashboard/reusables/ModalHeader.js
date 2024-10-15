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

const ModalHeader = ({ Function, name }) => {
  if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const translation = useRef(new Animated.Value(0)).current;

  useEffect(async () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
    }).start();

    Animated.timing(translation, {
      toValue: 1,
      delay: 0.1,
      useNativeDriver: true,
    }).start();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  return (
    <Animated.View
      style={{
        backgroundColor: "#131E3A",
        height: hp("7"),
        width: wp(90),
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
            Function()
          }}
        ></Button>

        <Text
          style={{
            marginTop: 20,
            fontWeight: "bold",
            color: "#FFFFFF",
            marginRight:  wp(35),
            fontSize: 22,
            fontFamily: "sans-serif",
          }}
        >
          {name}
        </Text>
      </View>
    </Animated.View>
  );
};

export default ModalHeader;
