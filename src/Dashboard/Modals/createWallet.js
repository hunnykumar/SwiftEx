import React, { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  View,
  Button,
  Modal,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Animated } from "react-native";
import title_icon from "../../../assets/Wallet1.png";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import SelectWallet from "./SelectWallet";
import "react-native-get-random-values";
import "@ethersproject/shims";
import NewWalletModal from "./newWallet";
import ModalHeader from "../reusables/ModalHeader";
var ethers = require("ethers");
const xrpl = require("xrpl");

const CreateWallet = ({ modalVisible, setModalVisible }) => {
  const [visible, setVisible] = useState(false);
  const [newWalletModal, setNewWalletModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const Spin = new Animated.Value(0);
  const SpinValue = Spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
    }).start();
  }, [fadeAnim]);

  const closeModal = () =>{
    setModalVisible(false)
  }
  return (
    <Animated.View // Special animatable View
      style={{ opacity: fadeAnim }}
    >
      <View
        style={{
          backgroundColor: "white",
          borderColor: "grey",
          borderRadius: 10,
        }}
      >
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          statusBarTranslucent={true}
          style={{ backgroundColor: "#fff" }}
          onBackdropPress={() => {
            console.log("requested");
            setModalVisible(false);
          }}
          onRequestClose={() => {
            // this.closeButtonFunction()

            setModalVisible(false);
          }}
        >
          <View
            style={{
              height: "90%",
              marginTop: "auto",
              backgroundColor: "white",
              borderRadius: 20,
            }}
          >
            <Animated.Image
              style={{
                width: wp("50"),
                height: hp("30"),
                padding: 30,
                marginTop: hp(10),
                marginLeft: wp(25),
                borderRadius: wp(10),
              }}
              source={title_icon}
            />
            <View
              style={{
                marginTop: hp(10),
                display: "flex",
                alignContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 20, color: "black" }}>
                Private and secure
              </Text>
              <Text>Private Keys never leave your device</Text>
            </View>
            <View style={styles.Button}>
              <Button
                title="Create wallet"
                color={"green"}
                onPress={() => {
                  setNewWalletModal(true);
                }}
              ></Button>
              <TouchableOpacity
                onPress={() => {
                  setVisible(true);
                }}
              >
                <Text style={styles.Text}>Import Wallet</Text>
              </TouchableOpacity>
            </View>
          </View>
          <SelectWallet
            visible={visible}
            setVisible={setVisible}
            setModalVisible={setModalVisible}
          />
          <NewWalletModal
            visible={newWalletModal}
            setVisible={setNewWalletModal}
            setModalVisible={setModalVisible}
          />
        </Modal>
      </View>
    </Animated.View>
  );
};

export default CreateWallet;

const styles = StyleSheet.create({
  Text: {
    marginTop: hp(5),
    fontSize: 15,
    fontWeight: "200",
    color: "black",
  },
  Button: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
    marginTop: hp(10),
  },
  addButton: {
    position: "absolute",
    zIndex: 11,
    right: 20,
    bottom: 40,
    backgroundColor: "red",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addButton2: {
    position: "absolute",
    zIndex: 11,
    left: 20,
    bottom: 40,
    backgroundColor: "green",
    width: 80,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});
//transform:[{rotate:SpinValue}]
