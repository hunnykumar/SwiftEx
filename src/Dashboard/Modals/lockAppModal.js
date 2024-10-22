import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import title_icon from "../../../assets/title_icon.png";
import ReactNativePinView from "react-native-pin-view";
import Icon from "react-native-vector-icons/Ionicons";
import ICON from "../../icon"
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { Platform } from "react-native";
import {
  setPlatform,
  setWalletType,
} from "../../components/Redux/actions/auth";
import Modal from "react-native-modal";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { decodeUserToken } from "../Auth/jwtHandler";
import { SendLoadingComponent } from "../../utilities/loadingComponent";
import darkBlue from '../../../assets/darkBlue.png'
import { alert } from "../reusables/Toasts";
import { enableBiometrics } from "../../biometrics/biometric";
const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true })
const LockAppModal = ({ pinViewVisible, setPinViewVisible }) => {
  const state = useSelector((state) => state);
  const [pin, setPin] = useState();
  const [status, setStatus] = useState("pinset");
  const [showRemoveButton, setShowRemoveButton] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [showCompletedButton, setShowCompletedButton] = useState(false);
  const [loader, setLoader] = useState(false);
  const pinView = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();

  const navigation = useNavigation();
  const FOCUSED=useIsFocused()
  const Spin = new Animated.Value(0);
  const SpinValue = Spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  function useBiometrics(){ 
    rnBiometrics.simplePrompt({promptMessage: 'Confirm fingerprint'})
  .then((resultObject) => {
    const { success } = resultObject
    if (success) {
      console.log('successful biometrics provided')
      setPinViewVisible(false)
    } else {
      console.log('user cancelled biometric prompt')
    }
  })
  .catch(() => {
    console.log('biometrics failed')
  })
}
useEffect(() => {
  const checkBiometricSetting = async () => {
    if (pinViewVisible) {
      const biometric = await AsyncStorage.getItem("Biometric");
      if (biometric === "SET") {
        useBiometrics();
      }
    }
  };
  checkBiometricSetting();
}, [FOCUSED, pinViewVisible]);



useEffect(() => {
  const checkPinAndAnimate = async () => {
    if (pinViewVisible) {
      const biometric = await AsyncStorage.getItem("Biometric");
      if (biometric === "SET") {
        useBiometrics();
      }
    }
    
    const Check = await AsyncStorage.getItem(`pin`);
    console.log(Check);
    if (Check) {
      setStatus("pinset");
    }
    
    console.log(Platform.OS);
    if (Platform.OS === "ios") {
      const platform = "ios";
      dispatch(setPlatform(platform)).then((response) => {
        console.log(response);
      });
    }

    // Animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false, // Important: set this according to your needs
    }).start();

    Animated.timing(Spin, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // Update remove button visibility
    setShowRemoveButton(enteredPin.length > 0);

    // Check entered pin length
    if (enteredPin.length === 6) {
      const Pin = await AsyncStorage.getItem("pin");
      if (JSON.parse(Pin) === enteredPin) {
        console.log(Pin);
        setPinViewVisible(false);
      } else {
        pinView.current.clearAll();
        alert("error", "Incorrect pin, try again.");
      }
    } else {
      setShowCompletedButton(false);
    }
  };

  checkPinAndAnimate(); // Call the async function

}, [fadeAnim, enteredPin, pinViewVisible]); 


  return (
    <Modal
      animationIn="fadeInUpBig"
      animationOut="fadeOutDownBig"
      animationInTiming={500}
      animationOutTiming={650}
      isVisible={pinViewVisible}
      useNativeDriver={true}
      statusBarTranslucent={true}
      style={style.Body}
    //  onBackdropPress={() => setPinViewVisible(false)}
      // onBackButtonPress={() => {
      //   setPinViewVisible(false);
      // }}
    >
      <Animated.View // Special animatable View
      style={{ opacity: fadeAnim, }}
    >
      <View style={style.Body}>
        <Animated.Image
          style={{
            width: wp("30"),
            height: hp("12"),
            padding: 30,
            marginTop: hp(0),
            //transform: [{ rotate: SpinValue }],
          }}
          source={darkBlue}
        />
        <Text style={style.welcomeText}> Hi,</Text>
        <Text style={style.welcomeText1}>
          {" "}
          {status == "verify"
            ? "Please Re-enter your pin"
            : status === "pinset"
            ? "Please enter your pin"
            : "Please create a pin"}
        </Text>
        <View style={{ marginTop: hp(5) }}>
          <ReactNativePinView
            inputSize={25}
            ref={pinView}
            pinLength={6}
            buttonSize={50}
            onValueChange={(value) => setEnteredPin(value)}
            buttonAreaStyle={{
              marginTop: 30,
            }}
            inputAreaStyle={{
              // marginBottom: 24,
            }}
            inputViewEmptyStyle={{
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: "#FFF",
            }}
            inputViewFilledStyle={{
              backgroundColor: "#FFF",
            }}
            buttonViewStyle={{
              borderWidth: 1,
              borderColor: "#FFF",
              marginVertical:hp(1)
            }}
            buttonTextStyle={{
              color: "#FFF",
            }}
            onButtonPress={async (key) => {
              console.log(key);
              if (key === "custom_left") {
                const biometric = await AsyncStorage.getItem("Biometric");
                if (biometric === "SET") {
                  useBiometrics();
                }else{
                      Platform.OS==="android"?
                      alert('error','Enable biometrics in your device settings.'):
                      alert('error','Enable face Id in your device settings.')
                }
              }
              if (key === "custom_right") {
                pinView.current.clear();
              }
            }}
            customLeftButton={
              
              <ICON
                type={"materialCommunity"} 
                name={Platform.OS==="android"?"fingerprint":"face-recognition"}
                size={36}
                color={"gray"}
                onPress={async ()=>{
                  const biometric = await AsyncStorage.getItem("Biometric");
                  if (biometric === "SET") {
                    useBiometrics();
                  }else{
                      await enableBiometrics()
                  }
                }}
              />
          
          }
          customRightButton={
              showRemoveButton ? (
                <Icon name={"backspace"} size={36} color={"gray"} />
              ) : undefined
            }
            // customRightButton={
            //   showCompletedButton ? (
            //     <Icon
            //       name={"ios-chevron-forward-circle"}
            //       size={36}
            //       color={"#FFF"}
            //     />
            //   ) : <Icon
            //   name={"ios-chevron-forward-circle"}
            //   size={36}
            //   color={"#FFF"}
            // />
            // }
          />
        </View>
      </View>
    </Animated.View>
    </Modal>
  );
};

export default LockAppModal;

const style = StyleSheet.create({
  Body: {
    display: "flex",
    backgroundColor: "#131E3A",
    height: hp(109),
    width: wp(100),
    alignItems: "center",
    textAlign: "center",
    marginRight:wp(10),
    marginTop:hp(3),
    justifyContent:"center"
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: "200",
    color: "white",
    marginTop: hp(3),
  },
  welcomeText2: {
    fontSize: 20,
    fontWeight: "200",
    color: "white",
    marginTop: hp(10),
  },
  Button: {
    marginTop: hp(20),
  },
  tinyLogo: {
    width: wp("5"),
    height: hp("5"),
    padding: 30,
    marginTop: hp(10),
  },
  Text: {
    marginTop: hp(5),
    fontSize: 15,
    fontWeight: "200",
    color: "white",
  },
  welcomeText1:{
    fontSize: 16,
    fontWeight: "200",
    color: "white",
    marginTop: hp(1),
  }
});
