import { Image, Text } from "react-native";
import React, { useEffect } from "react";
import splashImg from "../../../assets/splashscreen_image.png";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import styles from "./style";

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    navigation.navigate("Passcode");
    // setTimeout(async () => {
    //   navigation.navigate("Passcode");
    // }, 0);
  }, []);
  return (
    // <ImageBackground source={splashImg} style={styles.mainContainer}>
     <Image source={splashImg} style={styles.mainContainer}/>
    // </ImageBackground>
  );
};

export default SplashScreen;
