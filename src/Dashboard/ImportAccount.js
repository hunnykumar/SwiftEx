import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";
import { TextInput, Checkbox } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import title_icon from "../../assets/title_icon.png";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Card,
  Title,
  Paragraph,
  CardItem,
  WebView,
} from "react-native-paper";
import Bnbimage from "../../assets/bnb-icon2_2x.png";
import Etherimage from "../../assets/ethereum.png";
import darkBlue from "../../assets/multicoin_wallet.png"
import Xrpimage from "../../assets/xrp.png";
import stellar from "../../assets/Stellar_(XLM).png"
import Maticimage from "../../assets/matic.png";

const ImportAccount = (props) => {
  const [Checked, setCheckBox] = useState(false);
  const [Checked2, setCheckBox2] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  let LeftContent = (props) => <Avatar.Image {...props} source={title_icon} />;
  let EtherLeftContent = (props) => (
    <Avatar.Image {...props} source={Etherimage} />
  );
  let BnbLeftContent = (props) => <Avatar.Image {...props} source={Bnbimage} />;
  let XrpLeftContent = (props) => <Avatar.Image {...props} source={Xrpimage} />;
  let MaticLeftContent = (props) => (
    <Avatar.Image {...props} source={Maticimage} />
  );

  const Wallets = [
    {
      name: "ethereum",
    },
    {
      name: "Binance smart chain",
      LeftContent: Bnbimage,
    },
    {
      name: "Xrp",
      LeftContent: Xrpimage,
    },
    {
      name: "Polygon(Matic)",
      LeftContent: Maticimage,
    },
  ];
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
        <TouchableOpacity
          style={style.Box1}
          onPress={() => {
            props.navigation.navigate("Import Multi-Coin Wallet");
          }}
        >
          <Image source={darkBlue} style={style.img1} />
          <Text style={[style.text1,{marginHorizontal: wp(2.5),}]}>Multi-Chain Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={style.Box}
          onPress={() => {
            props.navigation.navigate("Import Binance");
          }}
        >
          <Image source={Bnbimage} style={style.img} />
          <Text style={style.text}>Binance Smart Chain</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={style.Box}
          onPress={() => {
            props.navigation.navigate("Import Ethereum");
          }}
        >
          <Image source={Etherimage} style={style.img} />
          <Text style={style.text}>Ethereum</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={style.Box}
          onPress={() => {
            props.navigation.navigate("Import Polygon");
          }}
        >
          <Image source={Maticimage} style={style.img} />
          <Text style={style.text}>Polygon(Matic)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={style.Box}
          onPress={() => {
            props.navigation.navigate("Import Xrp");
          }}
        >
          <Image source={Xrpimage} style={style.img} />

          <Text style={style.text}>Xrp</Text>
        </TouchableOpacity> */}

        {/* <TouchableOpacity
          style={style.Box}
          onPress={() => {
            props.navigation.navigate("ImportStellar");
          }}
        >
          <Image source={stellar} style={style.img} />

          <Text style={style.text}>Stellar</Text>
        </TouchableOpacity> */}
      </View>
    </Animated.View>
  );
};

export default ImportAccount;

const style = StyleSheet.create({
  Body: {
    backgroundColor: "white",
    height: hp(100),
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "200",
    color: "black",
    marginTop: hp(5),
  },
  welcomeText2: {
    fontSize: 15,
    fontWeight: "200",
    color: "white",
    marginTop: hp(1),
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
    width: wp("70"),
    paddingRight: wp("7"),
    backgroundColor: "white",
  },
  Box: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: wp(6),
    marginTop: hp(3),
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
    padding: 8,
    borderColor: "#DADADA",
  },
  Box1:{
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: wp(4),
    marginTop: hp(3),
    borderBottomWidth: StyleSheet.hairlineWidth * 1,
    padding: 8,
    borderColor: "#DADADA",
  },
  text: {
    marginHorizontal: wp(4),
  },
  text1:{
    marginHorizontal: wp(3),

  },
  img: {
    height: hp(4),
    width: wp(8),
  },
  img1:{
    height: hp(6),
    width: wp(11.9),
  }
});
