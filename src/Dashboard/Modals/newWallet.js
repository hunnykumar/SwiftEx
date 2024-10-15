import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { TextInput, Checkbox, Switch } from "react-native-paper";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import title_icon from "../../../assets/title_icon.png";
import { useDispatch, useSelector } from "react-redux";
import { Generate_Wallet2 } from "../../components/Redux/actions/auth";
import Modal from "react-native-modal";
import NewWalletPrivateKey from "./newWalletPrivateKey";
import ModalHeader from "../reusables/ModalHeader";
import { alert } from "../reusables/Toasts";
//import { TouchableOpacity } from "react-native-gesture-handler";
import { LinearGradient } from "react-native-linear-gradient";
import darkBlue from "../../../assets/darkBlue.png";
import Icon from "../../icon";
import AsyncStorageLib from "@react-native-async-storage/async-storage";

const NewWalletModal = ({ props,onCrossPress, visible, setVisible, setModalVisible }) => {
  const state=useSelector((state)=>state);
  const [Checked, setCheckBox] = useState(false);
  const [Checked2, setCheckBox2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newWalletPrivateKey, setNewWalletPrivateKey] = useState(false);
  const [Wallet, setWallet] = useState();
  const dispatch = useDispatch();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const Spin = new Animated.Value(0);
  const SpinValue = Spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const closeModal = () => {
    setVisible(false);
  };
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
      <Modal
        animationIn="slideInRight"
        animationOut="slideOutRight"
        animationInTiming={500}
        animationOutTiming={650}
        style={{}}
        
        isVisible={visible}
        // statusBarTranslucent={true}
        useNativeDriver={true}
        useNativeDriverForBackdrop={true}
        backdropTransitionOutTiming={0}
        hideModalContentWhileAnimating
        onBackdropPress={() => setVisible(false)}
        onBackButtonPress={() => {
          setVisible(false);
        }}
      >
        <View style={[style.Body,{backgroundColor:state.THEME.THEME===false?"#011434":"black"}]}>
          <TouchableOpacity disabled={loading} onPress={onCrossPress}>
          <Icon type={'entypo'} name='cross' size={29} color={"white"} style={style.crossIcon} />
          </TouchableOpacity>
          <View style={{alignSelf:"center",alignItems:"center"}}>
          <Animated.Image
            style={{
              width: wp("12"),
              height: hp("12"),
              padding: 30,
            }}
            source={darkBlue}
          />

          <Text style={style.welcomeText}> Back up you wallet now </Text>
          <Text style={style.welcomeText}>
            In the next page , you will see your secret phrase
          </Text>
          <TouchableOpacity
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: hp(5),
              alignItems: "center",
            }}
            onPress={()=>{setCheckBox(!Checked)}}
          >
            <Icon
            name={"check-circle"}
            type={"materialCommunity"}
            size={25}
            color={Checked?"green":"gray"}
            onPress={() => setCheckBox(!Checked)}
            />
            <View style={{ marginLeft: 10 }}>
            <Text style={style.welcomeText2}>
              If i loose my private key , my funds will be lost
            </Text>
              {/* <Switch
                value={Checked}
                onValueChange={() => setCheckBox(!Checked)}
              /> */}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: hp(5),
              alignItems: "center",
            }}
            onPress={() => setCheckBox2(!Checked2)}
          >
            <Icon
          name={"check-circle"}
          type={"materialCommunity"}
          size={25}
          color={Checked2?"green":"gray"}
          onPress={() => setCheckBox2(!Checked2)}
          />
            <View style={{ marginLeft: 10 }}>
            <Text style={style.welcomeText2}>
              If i share my private key , my funds can get stolen
            </Text>
              {/* <Switch
                value={Checked2}
                onValueChange={() => setCheckBox2(!Checked2)}
              /> */}
            </View>
          </TouchableOpacity>
          {loading ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Text> </Text>
          )}
<TouchableOpacity
            style={[style.PresssableBtn,{width:wp(30),alignItems:"center",backgroundColor:  Checked && Checked2? "rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)":"gray"}]}
              disabled={loading ? true : Checked && Checked2 ? false : true}
              onPress={async() => {
                await AsyncStorageLib.setItem('wallet_backup',await state.wallet.address);
                setLoading(true);
                setTimeout(() => {
                  dispatch(Generate_Wallet2()).then((response) => {
                    if (response) {
                      if (response.status === "success") {
                        setLoading(false);

                        console.log(response.wallet);
                        const wallet = response.wallet;
                        setWallet(wallet);
                        setNewWalletPrivateKey(true);
                      } else {
                        setLoading(false);

                        alert(
                          "error",
                          "wallet generation failed. Please try again"
                        );
                      }
                    } else {
                      setLoading(false);

                      alert(
                        "error",
                        "Wallet creation failed . Please try again"
                      );
                    }
                  });
                }, 1);
              }}
            >
          {/* <LinearGradient
            start={[1, 0]}
            end={[0, 1]}
            colors={
              Checked && Checked2
                ? ["rgba(33, 43, 83, 1)","rgba(28, 41, 77, 1)"]
                : ["gray", "gray"]
            }
            // style={style.PresssableBtn}
          > */}

              <Text style={{ color: "white" }}>Continue</Text>
          {/* </LinearGradient> */}
            </TouchableOpacity>
          </View>
          {/* <ModalHeader Function={closeModal} name={"Import"} /> */}
          
        </View>
        <NewWalletPrivateKey
          Wallet={Wallet}
          onCrossPress={()=>{setNewWalletPrivateKey(false)}}
          SetVisible={setNewWalletPrivateKey}
          Visible={newWalletPrivateKey}
          setModalVisible={setModalVisible}
          setNewWalletVisible={setVisible}
        />
      </Modal>
    </Animated.View>
  );
};

export default NewWalletModal;

const style = StyleSheet.create({
  Body: {
    borderColor:"#145DA0",
    borderWidth:0.9,
    paddingTop:hp(1),
    paddingBottom:hp(8),
    justifyContent: "center",
    borderRadius: hp(2),
    width: wp(94),
    // alignItems: "center",
    alignSelf:"center",
    textAlign: "center",
  },
  welcomeText: {
    color: "white",
    marginTop: hp(2),
    fontWeight:"900"
  },
  welcomeText2: {
    fontSize: 15,
    fontWeight: "300",
    color: "white",
    marginTop: hp(1),
    width: wp(70),
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
  PresssableBtn: {
    padding: hp(1),
    width: wp(30),
    alignSelf: "center",
    paddingHorizontal: wp(3),
    borderRadius: hp(0.8),
    marginBottom: hp(2),
    marginTop:hp(3),
    alignItems: "center",
    borderColor:"rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
    borderWidth:1.3,
  },
  crossIcon:{
    alignSelf:"flex-end",
    padding:hp(1)
  }
});
