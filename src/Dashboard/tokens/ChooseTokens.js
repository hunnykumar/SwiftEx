import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import { useSelector } from "react-redux";
import { Title } from "react-native-paper";
import Bnbimage from "../../../assets/bnb-icon2_2x.png";
import Etherimage from "../../../assets/ethereum.png";
import stellar from "../../../assets/Stellar_(XLM).png";
import { useNavigation } from "@react-navigation/native";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { alert } from "../reusables/Toasts";
import Icon from "../../icon";

const ChooseTokens = ({ setModalVisible }) => {
  const state = useSelector((state) => state);
  const [walletType, setWalletType] = useState(false);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const Spin = new Animated.Value(0);

  useEffect(() => {
    const fetch_token = async () => {
      try {
        const walletType = await AsyncStorageLib.getItem("walletType");
        const Type = JSON.parse(walletType);
        setWalletType(Type)
      } catch (error) {
        console.log("=[[]>", error)
      }
    }
    fetch_token()


    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1,
    }).start();

    Animated.timing(Spin, {
      toValue: 1,
      duration: 1,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, Spin]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
      }}
    >
        <View style={style.Body}>
          <TouchableOpacity
            style={walletType === 'BSC' || walletType === 'Multi-coin' ? [style.card, {backgroundColor: state.THEME.THEME === false ? "#FFFFFF" : "#1B1B1C" }] : style.disableBox}
            onPress={async () => {
              setModalVisible(false);
              navigation.navigate("SendXLM");
            }}
          >
            <View style={style.flatView}>
              <Image source={stellar} style={style.img} />
              <Text style={{ marginHorizontal: wp(2),fontSize:16,fontWeight:"600", color: state.THEME.THEME === false ? "black" : "#E0E0E0" }}>XLM</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={walletType === 'BSC' || walletType === 'Multi-coin' ? [style.card, {backgroundColor: state.THEME.THEME === false ? "#FFFFFF" : "#1B1B1C" }] : style.disableBox}
            onPress={async () => {
              const walletType = await AsyncStorageLib.getItem("walletType");
              const Type = JSON.parse(walletType);
              console.log(Type)
              if (Type === "BSC" || Type === 'Multi-coin') {
                setModalVisible(false);

                let token = "BNB";
                navigation.navigate("Send", {
                  token: token,
                });
              } else {
                return alert("error", 'Please select a bnb wallet')
              }
            }}
          >
            <View style={style.flatView}>
              <Image source={Bnbimage} style={style.img} />
              <Text style={{ marginHorizontal: wp(2),fontSize:16,fontWeight:"600", color: state.THEME.THEME === false ? "black" : "#E0E0E0" }}>BNB</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[style.card, {backgroundColor: state.THEME.THEME === false ? "#FFFFFF" : "#1B1B1C",marginBottom:10 }]}
            onPress={async () => {
              const walletType = await AsyncStorageLib.getItem("walletType");
              const Type = JSON.parse(walletType);
              if (Type === "Ethereum" || Type === 'Multi-coin') {
                setModalVisible(false);

                let token = "Ethereum";
                navigation.navigate("Send", {
                  token: token,
                });
              } else {
                return alert("error", 'please select an ethereum wallet')
              }
            }}
          >
            <View style={style.flatView}>
              <Image source={Etherimage} style={style.img} />
              <Text style={{ marginHorizontal: wp(2),fontSize:16,fontWeight:"600", color: state.THEME.THEME === false ? "black" : "#E0E0E0" }}>Ethereum</Text>
              <View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
    </Animated.View>
  );
};

export default ChooseTokens;

const style = StyleSheet.create({
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
  Body: {
    alignSelf: "center",
    width: wp(100),
    alignItems: "center",
    textAlign: "center",
    borderRadius: 20,
  },
  Text: {
    marginTop: hp(5),
    fontSize: 15,
    fontWeight: "200",
    color: "white",
  },
  card: {
    width: wp(93),
    borderRadius: hp(3),
    paddingVertical: hp(1.5),
    marginTop: hp(1.5),
    paddingHorizontal:5
  },
  disableBox: {
    width: wp(90),
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: hp(1),
    backgroundColor: "#F0F8FF",
    paddingVertical: hp(1.5),
    marginTop: hp(2),
  },
});
