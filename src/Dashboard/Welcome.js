import React, { useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

import W1 from "../../assets/W1.png";
import W2 from "../../assets/W2.png";
import W3 from "../../assets/W3.png";
import W4 from "../../assets/W4.png";
import CustomImageSlider from '../../Custom_scroller'; // Make sure to create this file
import { createGuestUser } from "./exchange/crypto-exchange-front-end-main/src/api";

const Welcome = (props) => {
  const images = [W4, W2, W3, W1];
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
      useNativeDriver: true,
    }).start();

    Animated.timing(Spin, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, Spin]);

  useEffect(()=>{
    createGuestUser()
  },[]);

  return (
    <View style={styles.container}>
      <CustomImageSlider images={images} />
      
      <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.createView}
          onPress={() => props.navigation.navigate("GenerateWallet")}
        >
          <Text style={styles.btnText}>CREATE A NEW WALLET</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => props.navigation.navigate("Import")}>
          <Text style={styles.importText}>Import Wallet</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131E3A',
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  createView: {
    width: wp(70),
    borderRadius: 8,
    paddingVertical: hp(1),
    backgroundColor: "#000C66",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: hp(2),
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
  },
  importText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "200",
    color: "white",
  },
});

export default Welcome;

const style = StyleSheet.create({
  Body: {
    display: "flex",
    backgroundColor: "#131E3A",
    width: wp(100),
    height: hp(100),
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "200",
    color: "white",
  },
  welcomeText2: {
    fontWeight: "200",
    color: "white",
  },

  tinyLogo: {
    width: wp("5"),
    height: hp("5"),
    padding: 30,
    marginTop: hp(10),
  },
  Text: {
    textAlign:"center",
    marginTop: hp(1),
    marginBottom:hp(2),
    fontSize: 15,
    fontWeight: "200",
    color: "white",
  },
  privateText: {
    color: "#fff",
    fontSize: 22,
    marginTop: hp(8),
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
  },
  createView: {
    width:wp(70),
    borderRadius: 8,
    paddingVertical:hp(1),
    backgroundColor: "#000C66",
    // height: "6%",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: hp(10),
  },
  imageContainer: {
    // width:hp(100),
    // height: hp(30),
    justifyContent: "center",
  },
  imageStyle: {
    width: "100%",
    height: "100%",
  },
});
