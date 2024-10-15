import { View, Text, StyleSheet } from "react-native";
import React from "react";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Icon from "../../icon";

const IconWithCircle = (props) => {
  const { name, type, title, onPress } = props;
  return (
    <View>
      <View style={styles.mainContainer}>
        <Icon
          name={name}
          type={type}
          size={21}
          style={{ marginHorizontal: hp(0.7) }}
          color="#fff"
          onPress={onPress}
        />
      </View>

      <Text style={styles.text}>{title}</Text>
    </View>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: "#145DA0",
    width: hp(6),
    height: hp(6),
    borderRadius: hp(10),
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: hp(1),
  },
  text: {
    color: "#145DA0",
    textAlign: "center",
  },
});

export default IconWithCircle;
