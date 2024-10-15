import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { TextInput, Checkbox, Switch } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import darkBlue from "../../assets/darkBlue.png";
import { useDispatch, useSelector } from "react-redux";
import { Generate_Wallet2 } from "../components/Redux/actions/auth";
import { alert } from "./reusables/Toasts";
import Icon from "../icon";

const GenerateWallet = (props) => {
  const [Checked, setCheckBox] = useState(false);
  const [Checked2, setCheckBox2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disable, setDisable] = useState(false);

  const dispatch = useDispatch();

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

    Animated.timing(Spin, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, Spin]);

  return (
    <Animated.View // Special animatable View
      style={{ opacity: fadeAnim }}
    >
      <View style={style.Body}>
        <Text style={style.headingText}> Back up your wallet now!</Text>

        <Text style={style.nextText}>
          In the next step you will see Secret Phrase that allows you to recover
          a wallet.
        </Text>
        <Animated.Image style={style.logoStyle} source={darkBlue} />

        <TouchableOpacity style={style.textview} onPress={() => setCheckBox(!Checked)}>
          {/* <Switch value={Checked} onValueChange={() => setCheckBox(!Checked)} />
           */}
           <Icon
            name={"check-circle"}
            type={"materialCommunity"}
            size={25}
            color={Checked?"green":"gray"}
            onPress={() => setCheckBox(!Checked)}
            />
          <Text style={style.txtStyle}>
            If I lose my private key , my funds will be lost
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={style.textview} onPress={() => setCheckBox2(!Checked2)}>
          {/* <Switch
            value={Checked2}
            onValueChange={() => setCheckBox2(!Checked2)}
          /> */}
          <Icon
            name={"check-circle"}
            type={"materialCommunity"}
            size={25}
            color={Checked2?"green":"gray"}
            onPress={() => setCheckBox2(!Checked2)}
            />
          <Text style={style.txtStyle}>
            If I share my private key , my funds can get stolen
          </Text>
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <Text> </Text>
        )}

        <TouchableOpacity
          style={
            Checked && Checked2
              ? style.btnview
              : { ...style.btnview, backgroundColor: "gray" }
          }
          disabled={loading ? true : Checked && Checked2 ? false : true}
          // disabled={disable ? true : false}

          onPress={() => {
            setLoading(true);
            setTimeout(() => {
              dispatch(Generate_Wallet2()).then((response) => {
                if (response) {
                  if (response.status === "success") {
                    setLoading(false);

                    console.log(response.wallet);
                    const wallet = {
                      wallet: response.wallet,
                    };
                    console.log(wallet);
                    props.navigation.navigate("PrivateKey", {
                      wallet,
                    });
                  } else {
                    setLoading(false);

                    alert(
                      "error",
                      "wallet generation failed. Please try again"
                    );
                  }
                } else {
                  setLoading(false);

                  alert("error", "Wallet creation failed . Please try again");
                }
              });
            }, 1);
          }}
        >
          <Text
            style={
              Checked && Checked2 ? { color: "white" } : { color: "#D3D3D3" }
            }
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default GenerateWallet;

const style = StyleSheet.create({
  Body: {
    display: "flex",
    backgroundColor: "#131E3A",
    height: hp(100),
    width: wp(100),
    alignItems: "center",
    textAlign: "center",
    // justifyContent:"center"
  },
  welcomeText: {
    fontSize: 17,
    fontWeight: "200",
    color: "white",
    marginTop: hp(5),
  },
  welcomeText2: {
    fontSize: 15,
    color: "white",
  },
  Button: {
    marginTop: hp(10),
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
  input: {
    height: hp("5%"),
    marginBottom: hp("2"),
    color: "black",
    marginTop: hp("2"),
    width: wp("65"),
    paddingRight: wp("7"),
    backgroundColor: "white",
  },
  txtStyle: {
    color: "white",
    textAlign: "center",
    width: wp(58),
    textAlign: "left",
    fontSize: 15,
    marginLeft:wp(4)
  },
  textview: {
    display: "flex",
    flexDirection: "row",
    marginTop: hp(5),
    width: wp(80),
    justifyContent: "flex-start",
    marginTop: hp(6),
    alignSelf: "center",
    alignItems: "center",
  },
  btnview: {
    backgroundColor: "#4CA6EA",
    width: wp(80),
    paddingVertical: hp(2),
    alignItems: "center",
    borderRadius: hp(1),
    alignSelf: "center",
    marginTop: hp(10),
  },
  headingText: {
    fontWeight: "700",
    fontSize: 18,
    color: "white",
    marginTop: hp(6),
  },
  logoStyle: {
    width: wp("40"),
    height: hp("25"),
    padding: 30,
    marginTop: hp(6),
  },
  nextText: {
    marginTop: hp(3),
    textAlign: "left",
    color: "white",
    width: wp(80),
  },
});
