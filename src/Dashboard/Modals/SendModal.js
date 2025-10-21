import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Animated } from "react-native";
import { useSelector } from "react-redux";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Modal from "react-native-modal";
import ChooseTokens from "../tokens/ChooseTokens";
import "react-native-get-random-values";
import "@ethersproject/shims";
import Icon from "../../icon";

const SendModal = ({ modalVisible, setModalVisible }) => {
  const state = useSelector((state) => state);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Modal
      isVisible={modalVisible}
      onBackdropPress={() => setModalVisible(false)}
      onBackButtonPress={() => setModalVisible(false)}
      useNativeDriver
      hideModalContentWhileAnimating
      style={styles.modal}
    >
      <Animated.View
        style={[
          styles.Body,
          {
            opacity: fadeAnim,
            backgroundColor: state.THEME.THEME ? "#242426" : "#F4F4F8",
          },
        ]}
      >
        <View style={styles.topCon}>
          <View>
            <Text
              style={{
                fontSize: 19,
                marginTop: 15,
                color: state.THEME.THEME ? "#E3DFDF" : "#272729",
                fontWeight: "500",
              }}
            >
              Send
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: state.THEME.THEME ? "#D4C8C8" : "#272729",
                fontWeight: "400",
              }}
            >
              Send crypto directly to from your wallet
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.crossIcon,
              { backgroundColor: state.THEME.THEME ? "black" : "#FFFFFF" },
            ]}
            onPress={() => setModalVisible(false)}
          >
            <Icon
              type={"entypo"}
              name="cross"
              color={state.THEME.THEME ? "white" : "black"}
              size={29}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Icon
            type={"ionicon"}
            name="information-circle"
            color={"#ECB742"}
            size={29}
          />
          <Text
            style={{
              fontSize: 15,
              color: "#ECB742",
              fontWeight: "400",
              marginLeft: 3,
            }}
          >
            Always double-check the wallet address before sending crypto.
          </Text>
        </View>

        <ChooseTokens setModalVisible={setModalVisible} />
      </Animated.View>
    </Modal>
  );
};

export default SendModal;

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  Body: {
    width: wp(100),
    borderTopLeftRadius: hp(3),
    borderTopRightRadius: hp(3),
    paddingBottom: hp(3),
    paddingTop: hp(2),
  },
  infoCard: {
    width: wp(90),
    borderRadius: hp(3),
    marginTop: hp(0.5),
    backgroundColor: "#FEF6D8",
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  crossIcon: {
    borderRadius: 50,
    width: 30,
    height: 30,
  },
  topCon: {
    margin: 20,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
