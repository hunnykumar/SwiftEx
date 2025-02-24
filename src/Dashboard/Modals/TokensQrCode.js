import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Share } from "react-native";
import QRCode from "react-native-qrcode-svg";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Clipboard from '@react-native-clipboard/clipboard';
import darkBlue from "../../../assets/darkBlue.png"
import { alert } from "../reusables/Toasts";

const TokenQrCode = ({ modalVisible, setModalVisible, iconType, qrvalue, isDark }) => {

  const copyToClipboard = () => {
    alert("success","Address copy successfully!");
    Clipboard.setString(qrvalue);
    setModalVisible(false)
  };

  const shareQR = async () => {
    try {
      await Share.share({
        message: qrvalue,
      });
    } catch (error) {
      console.log("Error sharing QR code", error);
    }
  };

  return (
    <Modal visible={modalVisible} animationType="slide">
      <View style={[styles.modalBackground, { backgroundColor: isDark ? "black" : "#ffffffaa" }]}>
        <View style={[styles.header, { backgroundColor: isDark ? "black" : "#ffffffaa" }]}>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Icon name="arrow-left" size={33} color={isDark ? "#fff" : "#000"} />
          </TouchableOpacity>
          <Text style={[styles.textCon, { color: isDark ? "#fff" : "#000", }]}> {iconType}</Text>
        </View>
        <View style={[styles.modalContainer, { backgroundColor: isDark ? "#222" : "#23262F99" }]}>
            <QRCode value={qrvalue} size={270} backgroundColor={isDark ? "#222" : "#fff"} color="#4169e1" logo={darkBlue}/>
        </View>
        <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={copyToClipboard}>
              <Icon name="content-copy" size={29} color="#4169e1" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={shareQR}>
              <Icon name="share-variant" size={29} color="#4169e1" />
            </TouchableOpacity>
          </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    alignSelf:"center",
    justifyContent:"center"
  },
  header: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop:"11%",
    margin: 10,
    marginBottom:"50%"
  },
  actionContainer: {
    marginTop:40,
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  iconButton: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: "#23262F99",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  textCon: {
    fontSize: 23,
    fontWeight:"600"
  }
});

export default TokenQrCode;