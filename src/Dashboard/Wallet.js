import React, { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  KeyboardAvoidingView,
  View,
  Pressable,
  Button,
  Modal,
  FlatList,
  TouchableOpacity,
  Alert,StatusBar,Platform
} from "react-native";
import { TextInput } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { Animated, AppState } from "react-native";
import walletImage from "../../assets/walletImage.png";
import { LinearGradient } from "react-native-linear-gradient";

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import SelectWallet from "./Modals/SelectWallet";
import "react-native-get-random-values";
import "@ethersproject/shims";
import NewWalletModal from "./Modals/newWallet";
import Icon from "react-native-vector-icons/FontAwesome";
import { useIsFocused } from "@react-navigation/native";
var ethers = require("ethers");
const xrpl = require("xrpl");

const Wallet = ({ navigation }) => {
  const foucuse=useIsFocused();
  const [visible, setVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newWalletModal, setNewWalletModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const state=useSelector((state)=>state);
  useEffect(()=>{
      setNewWalletModal(false);
  },[foucuse])
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View>
      {Platform.OS === 'ios' &&  <StatusBar hidden={true}/>}
      <View
        style={{
          height: hp(95),
          marginTop: "auto",
          backgroundColor: state.THEME.THEME===false?"#fff":"black",
          borderRadius: 0,
        }}
      >
        <Animated.Image
          style={{
            width: wp("70"),
            height: hp("30"),
            padding: 30,
            marginTop: hp(13),
            marginLeft: wp(15),
            borderRadius: wp(10),
          }}
          source={walletImage}
        />
        <View
          style={{
            marginTop: hp(10),
            display: "flex",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 20, color: state.THEME.THEME===false?"black":"#fff",fontWeight:"700"}}>
            Private and secure
          </Text>
          <Text style={{ color: state.THEME.THEME===false?"black":"#fff",fontWeight:"400" }}>
            Private Keys never leave your device
          </Text>
        </View>
        <TouchableOpacity onPress={() => {
              navigation.navigate("MyWallet");
            }}>
        <View style={styles.wallet}>
          <Pressable onPress={() => {
              navigation.navigate("MyWallet");
            }}>
            <Text style={{color:"white",fontWeight:"700"}}>My Wallet</Text>
          </Pressable>
          <Icon
          onPress={() => {
            navigation.navigate("MyWallet");
          }}
            name="chevron-right"
            size={hp("2")}
            color="white"
          />
        </View>
        </TouchableOpacity>
       
       <View style={{flexDirection:"row",justifyContent:"center",marginTop:hp(5),width:wp(80),alignSelf:"center",}}> 
       <View style={styles.Button}>
          {/* <LinearGradient
            start={[1, 0]}
            end={[0, 1]}
            colors={["rgba(70, 169, 234, 1)", "rgba(185, 116, 235, 1)"]}
            style={styles.PresssableBtn}
          > */}
            <TouchableOpacity
            // style={{width:wp(30),alignItems:"center",backgroundColor:"black"}}
            style={styles.PresssableBtn}
              onPress={() => {
                setNewWalletModal(true);
              }}
            >
              <Text style={{color:"white",fontWeight:"700"}}>Create Wallet</Text>
            </TouchableOpacity>
          {/* </LinearGradient> */}
          {/* <Button
            title="Create wallet"
            color={"green"}
            onPress={() => {
              setNewWalletModal(true);
            }}
          ></Button> */}

        </View>
        <View style={styles.Button}>
            <TouchableOpacity
            style={[styles.PresssableBtn,{marginLeft:wp(1.9)}]}
              onPress={() => {
                setVisible(true);
              }}
            >
              <Text style={{color:"white",fontWeight:"700"}}>Import Wallet</Text>
            </TouchableOpacity>
        </View>
        <View style={styles.Button}>
            <TouchableOpacity
            style={[styles.PresssableBtn,{marginLeft:wp(1.9)}]}
              onPress={() => {
                navigation.navigate("AllWallets")
              }}
            >
              <Text style={{color:"white",fontWeight:"700",textAlign:"center"}}>Choose Wallet</Text>
            </TouchableOpacity>
        </View>
        

       </View>

      </View>
      <SelectWallet
        visible={visible}
        setVisible={setVisible}
        setModalVisible={setModalVisible}
      />
      <NewWalletModal
        visible={newWalletModal}
        onCrossPress={()=>{setNewWalletModal(false)}}
        setVisible={setNewWalletModal}
        setModalVisible={setModalVisible}
      />
    </Animated.View>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "red",
    width: wp(80),
  },
  Text: {
    marginTop: hp(1),
    fontSize: 15,
    fontWeight: "200",
    color: "black",
    fontWeight:"300"
  },
  Button: {
    display: "flex",
    alignContent: "center",
    alignItems: "center",
    marginTop: hp(2),
  },
  addButton: {
    position: "absolute",
    zIndex: 11,
    right: 20,
    bottom: 40,
    backgroundColor: "red",
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addButton2: {
    position: "absolute",
    zIndex: 11,
    left: 20,
    bottom: 40,
    backgroundColor: "green",
    width: 80,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  accountBox: {
    alignItems: "center",
    backgroundColor: "red",
    width: wp(80),
    alignSelf: "center",
  },
  text: {
    color: "white",
    fontSize: hp("2.3"),
    fontWeight: "bold",
    marginLeft: wp("20"),
  },
  PresssableBtn: {
    backgroundColor: "#4CA6EA",
    // padding: hp(),
    height:hp(5),
    justifyContent:"center",
    width: wp(28),
    alignSelf: "center",
    paddingHorizontal: Platform.OS==="android"?wp(1):wp(2),
    borderRadius: hp(0.8),
    marginBottom: hp(2),
    alignItems: "center",
  },
  wallet:{
    backgroundColor:"#4CA6EA",
    borderRadius:hp(1),
    flexDirection:"row",
    alignSelf:"center",
    alignItems:"center",
    justifyContent:"space-between",
    marginTop:hp(2),
    width:wp(75),
    padding:hp(2)
  }
});
