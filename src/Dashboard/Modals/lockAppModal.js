import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Animated, Alert, Image, Modal, Platform, } from "react-native";
import darkBlue from "../../../assets/darkBlue.png";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useDispatch } from "react-redux";
import { useFocusEffect, useIsFocused, useNavigation } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { SET_APP_THEME } from "../../components/Redux/actions/type";
import { alert } from "../reusables/Toasts";
import { useBiometrics_run } from "../../biometrics/biometric";
import Icon from "../../icon";

const LockAppModal = ({ pinViewVisible, setPinViewVisible }) => {
  const [pin, setPin] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();
  const [status, setStatus] = useState("pinset");
  const [tempPin, setTempPin] = useState("");
  const FOCUSED=useIsFocused();
  const handlePress = async (value) => {
    if (pin.length < 6) {
      const newPin = pin + value;
      setPin(newPin);
      if (newPin.length === 6) {
        if (status === "pinset") {
          const storedPin = await AsyncStorage.getItem("pin");
          if (JSON.parse(storedPin) === newPin) {
            setIsSuccess(true);
            setTimeout(() => {
              resetInput();
              setPinViewVisible(false)
            }, 500);
          } else {
            triggerShake();
            setIsError(true);
            setTimeout(() => {
              resetInput();
            }, 1000);
          }
        }
      }
    }
  };



  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const resetInput = () => {
    setPin("");
    setIsError(false);
    setIsSuccess(false);
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true, 
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const checkBiometricSetting = async () => {
      if (pinViewVisible) {
        const biometric = await AsyncStorage.getItem("Biometric");
        if (biometric === "SET") {
          const data=await useBiometrics_run();
          if(data)
          {
            setPinViewVisible(false)
          }
        }
      }
    };
    checkBiometricSetting();
  }, [FOCUSED, pinViewVisible]);
  useEffect(() => {
    const initializeApp = async () => {
      const Checked = await AsyncStorage.getItem("APP_THEME");
      dispatch({
        type: SET_APP_THEME,
        payload: { THEME: Checked === null ? false : Checked === "false" ? false : true },
      });
      const Check = await AsyncStorage.getItem("pin");
      if (Check) {
        setStatus("pinset");
      }
      if (Platform.OS === "ios") {
        dispatch(setPlatform("ios"));
      }
    };
    initializeApp();
  }, []);

  const handleBiometrics = async () => {
    const biometric = await AsyncStorage.getItem("Biometric");
    if (biometric === "SET") {
      const data=await useBiometrics_run()
      if(data)
      {
        setPinViewVisible(false)
      }
    } else {
      alert('error', Platform.OS === "android"
        ? 'Enable biometrics in SwiftEx app settings.'
        : 'Enable face Id in SwiftEx app settings.'
      );
    }
  };
  return (
    <Modal visible={pinViewVisible}>
      <View style={[styles.container]}>
        <View style={styles.upper_con}>
          <Image
            style={{
              width: wp("20"),
              height: hp("15"),
              padding: 30,
              marginTop: hp(2),
            }}
            source={darkBlue}
          />
          <View style={styles.text_con}>
            <Text style={styles.text_style}>Hi,</Text>
            <Text style={[styles.text_style, { marginTop: 10 }]}>{status === "verify"
              ? "Please Re-enter your pin"
              : status === "pinset"
                ? "Please enter your pin"
                : "Please create a pin"}</Text>
          </View>
          <Animated.View
            style={[
              styles.pinContainer,
              { transform: [{ translateX: shakeAnimation }] },
            ]}
          >
            {[0, 1, 2, 3, 4, 5].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.pinBox,
                  isError && styles.pinBoxError,
                  isSuccess && styles.pinBoxSuccess,
                ]}
              >
                {pin.length > index && (
                  <View
                    style={[
                      styles.dot,
                      isError && styles.dotError,
                      isSuccess && styles.dotSuccess,
                    ]}
                  />
                )}
              </View>
            ))}
          </Animated.View>
        </View>
        <View style={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => handlePress(key.toString())}
              style={styles.key}
            >
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => { handleBiometrics() }} style={styles.key}>
            <Icon
             type={"materialCommunity"}
             name={Platform.OS==="android"?"fingerprint":"face-recognition"}
             size={36}
             color={"gray"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handlePress("0")} style={styles.key}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.key}>
            <Icon
                type={"materialCommunity"}
                name={"backspace"}
                size={36}
                color={"gray"}
              />
          </TouchableOpacity>
        </View>
        <View style={styles.text_con}>
          <Text style={[styles.text_style, { fontSize: 13, color: "gray" }]}>Passcode adds an extra layer of security</Text>
          <Text style={[styles.text_style, { fontSize: 13, color: "gray" }]}>when using the app</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  upper_con: {
    height: "50%",
    alignItems: "center",
    width: "100%",
    paddingTop: 40
  },
  text_con: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10
  },
  text_style: {
    fontSize: 19,
    color: "#fff"
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#011434"
  },
  pinContainer: {
    flexDirection: "row",
    marginBottom: 20,
    marginTop: 20
  },
  pinBox: {
    width: 48,
    height: 50,
    margin: 5,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  pinBoxError: {
    borderColor: "red",
  },
  pinBoxSuccess: {
    borderColor: "green",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "silver",
  },
  dotError: {
    backgroundColor: "red",
  },
  dotSuccess: {
    backgroundColor: "green",
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "center"
  },
  key: {
    width: 60,
    height: 60,
    marginHorizontal: 33,
    marginVertical: 5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  keyText: {
    fontSize: 23,
    fontWeight: "bold",
    color: "white",
  },
});

export default LockAppModal;