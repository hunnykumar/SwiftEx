import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useSelector } from "react-redux";
import { Title } from "react-native-paper";
import Modal from "react-native-modal";
import Bnbimage from "../../../assets/bnb-icon2_2x.png";
import stellar from "../../../assets/Stellar_(XLM).png";
import Etherimage from "../../../assets/ethereum.png";
import RecieveAddress from "./ReceiveAddress";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { alert } from "../reusables/Toasts";
import Icon from "../../icon";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import TokenQrCode from "./TokensQrCode";

const RecieveModal = ({ modalVisible, setModalVisible }) => {
  const [visible, setVisible] = useState(false);
  const [iconType, setIconType] = useState("");
  const state = useSelector((state) => state);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setIconType("");
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Modal
      isVisible={modalVisible}
      onBackdropPress={() => setModalVisible(false)}
      onBackButtonPress={() => setModalVisible(false)}
      useNativeDriver={true}
      hideModalContentWhileAnimating
      style={styles.modal}
    >
      <Animated.View
        style={[
          styles.Body,
          { opacity: fadeAnim, backgroundColor: state.THEME.THEME ? "#242426" : "#F4F4F8" }]}
      >
        <View style={styles.topCon}>
          <View>
            <Text style={{ fontSize: 19,marginTop:15, color: state.THEME.THEME ? "#E3DFDF" : "#272729",fontWeight:"500" }}>Receive</Text>
            <Text style={{ fontSize: 16, color: state.THEME.THEME ? "#D4C8C8" : "#272729",fontWeight:"400" }}>Receive crypto directly to your wallet  </Text>
          </View>
          <TouchableOpacity style={[styles.crossIcon,{backgroundColor: state.THEME.THEME ?"black":"#FFFFFF"}]} onPress={() => setModalVisible(false)}>
            <Icon
              type={"entypo"}
              name="cross"
              color={state.THEME.THEME?"white":"black"}
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
        <Text style={{ fontSize: 15, color: "#ECB742",fontWeight:"400",marginLeft:3}}>Always double-check the wallet address before receiving crypto.</Text>
        </View>

        <View style={styles.cardCon}>
          {[
            { icon: stellar, name: "XLM", type: "XLM" },
            { icon: Bnbimage, name: "BNB", type: "BNB", walletTypes: ["BSC", "Multi-coin"] },
            { icon: Etherimage, name: "Ethereum", type: "ETH", walletTypes: ["Ethereum", "eth", "Multi-coin"] }
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                {
                  backgroundColor: state.THEME.THEME ? "#1B1B1C" : "#FFFFFF",
                },
              ]}
              onPress={async () => {
                if (item.walletTypes) {
                  const walletType = await AsyncStorageLib.getItem("walletType");
                  if (!item.walletTypes.includes(JSON.parse(walletType))) {
                    alert(
                      "error",
                      `Please select ${item.name} wallet to receive ${item.name}`
                    );
                    return;
                  }
                }
                setIconType(item.type);
                setVisible(true);
              }}
            >

              <View style={styles.flatView}>
                <Image source={item.icon} style={styles.img} />
                <Text style={{ marginHorizontal: wp(2), color: state.THEME.THEME ? "#E0E0E0" : "black",fontSize:16,fontWeight:"600" }}>
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{marginBottom:30}}/>
        </View>
         <TokenQrCode
          modalVisible={visible}
          setModalVisible={setVisible}
          iconType={iconType}
          qrvalue={iconType==="XLM"?state?.STELLAR_PUBLICK_KEY:state?.wallet?.address}
          isDark={state.THEME.THEME}
        />
      </Animated.View>
    </Modal>
  );
};

export default RecieveModal;

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  Body: {
    width: wp(100),
    borderTopLeftRadius: hp(3),
    borderTopRightRadius: hp(3),
  },
  flatView: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: wp(2),
  },
  img: {
    height: hp(5.5),
    width: wp(11),
    borderRadius: hp(3)
  },
  card: {
    width: wp(93),
    borderRadius: hp(3),
    paddingVertical: hp(1.5),
    marginTop: hp(1.5),
    paddingHorizontal:5
  },
  infoCard: {
    width: wp(90),
    borderRadius: hp(3),
    marginTop: hp(0.5),
    backgroundColor:"#FEF6D8",
    alignSelf:"center",
    borderRadius:15,
    alignItems:"center",
    flexDirection:"row",
    paddingVertical:5,
    paddingHorizontal:10
  },
  crossIcon: {
    borderRadius:50,
    width:30,
    height:30
  },
  cardCon:{
    justifyContent: "center",
    alignItems: "center"
  },
  topCon: {
    margin: 20,
    marginBottom:10,
    flexDirection:"row",
    justifyContent:"space-between"
  }
});
