import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import darkBlue from "../../assets/darkBlue.png";
import ReactNativePinView from "react-native-pin-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setPlatform } from "../components/Redux/actions/auth";
import { useBiometrics } from "../biometrics/biometric";
import { useFocusEffect } from "@react-navigation/native";
import { alert } from "./reusables/Toasts";
import { SET_APP_THEME } from "../components/Redux/actions/type";
import Icon from "../icon";

const Passcode = (props) => {
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState("");
  const [showRemoveButton, setShowRemoveButton] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [showCompletedButton, setShowCompletedButton] = useState(false);
  const pinView = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();

  const Spin = new Animated.Value(0);
  const SpinValue = Spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useFocusEffect(
    React.useCallback(() => {
      const checkBioMetric = async () => {
        const biometric = await AsyncStorage.getItem("Biometric");
        if (biometric === "SET") {
          useBiometrics(props.navigation);
        }
      };
      checkBioMetric();
    }, [])
  );

  useEffect(() => {
    const initializeApp = async () => {
      const Checked = await AsyncStorage.getItem("APP_THEME");
      dispatch({
        type: SET_APP_THEME,
        payload: { THEME: Checked === null ? false : Checked === "false" ? false : true },
      });

      const Check = await AsyncStorage.getItem("pin");
      const biometric = await AsyncStorage.getItem("Biometric");
      
      if (biometric === "SET") {
        useBiometrics(props.navigation);
      }

      if (Check) {
        setStatus("pinset");
      }

      if (Platform.OS === "ios") {
        dispatch(setPlatform("ios"));
      }

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      Animated.timing(Spin, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    };

    initializeApp();
  }, []);

  useEffect(() => {
    const handlePinEntry = async () => {
      setShowRemoveButton(enteredPin.length > 0);
      setShowCompletedButton(enteredPin.length === 6);

      if (enteredPin.length === 6) {
        if (status === "verify") {
          if (pin === enteredPin) {
            await AsyncStorage.setItem("pin", JSON.stringify(pin));
            pinView.current.clearAll();
            props.navigation.navigate("Welcome");
          } else {
            pinView.current.clearAll();
            setTimeout(() => {
              alert("error", "PIN did not match. Please try again.");
            }, 200);
            setStatus("");
          }
        } else if (status === "pinset") {
          const storedPin = await AsyncStorage.getItem("pin");
          const user = await AsyncStorage.getItem("user");
          const wallets = await AsyncStorage.getItem(`${user}-wallets`);

          if (JSON.parse(storedPin) === enteredPin) {
            pinView.current.clearAll();
            props.navigation.navigate(user ? "HomeScreen" : "Welcome");
          } else {
            pinView.current.clearAll();
            setTimeout(() => {
              alert("error", "Incorrect pin try again.");
            }, 100);
          }
        } else {
          setPin(enteredPin);
          setStatus("verify");
          pinView.current.clearAll();
        }
      }
    };

    handlePinEntry();
  }, [enteredPin]);

  const handleBiometrics = async () => {
    const biometric = await AsyncStorage.getItem("Biometric");
    if (biometric === "SET") {
      useBiometrics(props.navigation);
    } else {
      alert('error', Platform.OS === "android"
        ? 'Enable biometrics in your device settings.'
        : 'Enable face Id in your device settings.'
      );
    }
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={style.Body}>
        <Animated.Image
          style={{
            width: wp("20"),
            height: hp("15"),
            padding: 30,
            marginTop: hp(2),
            transform: [{ rotate: SpinValue }],
          }}
          source={darkBlue}
        />
        <Text style={style.welcomeText}> Hi,</Text>
        <Text style={style.welcomeText}>
          {status === "verify"
            ? "Please Re-enter your pin"
            : status === "pinset"
            ? "Please enter your pin"
            : "Please create a pin"}
        </Text>
        <View style={{ marginTop: hp(2) }}>
          <ReactNativePinView
            inputSize={23}
            ref={pinView}
            pinLength={6}
            buttonSize={60}
            onValueChange={setEnteredPin}
            buttonAreaStyle={{
              marginTop: 24,
            }}
            inputAreaStyle={{
              marginBottom: 24,
            }}
            inputViewEmptyStyle={{
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: "#fff",
            }}
            inputViewFilledStyle={{
              backgroundColor: "#fff",
            }}
            buttonTextStyle={{
              color: "#fff",
            }}
            onButtonPress={(key) => {
              if (key === "custom_right") {
                pinView.current.clear();
              }
            }}
            customLeftButton={
              <Icon
                type={"materialCommunity"}
                name={Platform.OS === "android" ? "fingerprint" : "face-recognition"}
                size={36}
                color={"gray"}
                onPress={handleBiometrics}
              />
            }
            customRightButton={
              showRemoveButton ? (
                <Icon type={"materialCommunity"} name={"backspace"} size={36} color={"gray"} />
              ) : undefined
            }
          />
          <View style={style.textView}>
            <Text style={style.simpleText}>Passcode adds an extra layer of security</Text>
            <Text style={style.simpleText}>when using the app</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default Passcode;

const style = StyleSheet.create({
  Body: {
    display: "flex",
    backgroundColor:'#131E3A',
    height: hp(100),
    justifyContent: "center",
    width: wp(100),
    alignItems: "center",
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "200",
    color: "#fff",
    marginTop: hp(2),
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
  textView:{
marginTop:"25%"
  },
  simpleText:{
    textAlign:"center",
    color:"#fff"
  }
});
