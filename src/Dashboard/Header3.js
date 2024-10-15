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
import { Extend } from "../components/Redux/actions/auth";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated, LayoutAnimation, Platform, UIManager } from "react-native";
import { useState } from "react";
const MyHeader3 = ({ title }) => {
  const state = useSelector((state) => state);
  const [platform, setPlatform] = useState("");

  const dispatch = useDispatch();

  if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const translation = useRef(new Animated.Value(0)).current;

  useEffect(async () => {
    const platform = await state.platform;
    if (platform) {
      setPlatform(platform);
    }
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
    <Animated.View style={{ backgroundColor: "#131E3A", height: hp("10") }}>
      <View
        style={{
          display: "flex",
          alignItems: "center",
          alignContent: "center",
          height: hp("10"),
          backgroundColor: "#000C66",
          color: "#FFFFFF",
        }}
      >
        <Text
          style={{
            marginTop: platform === "ios" ? hp(5) : 20,
            fontWeight: "bold",
            color: "#FFFFFF",
            fontSize: 22,
            fontFamily: "sans-serif",
            marginRight: 10,
          }}
        >
          {title}
        </Text>
      </View>
    </Animated.View>
  );
};

export default MyHeader3;
