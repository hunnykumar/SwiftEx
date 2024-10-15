import { View, Text, StyleSheet, Image, TouchableOpacity,Pressable, Platform } from "react-native";
import React, { useState } from "react";
import Icon from "../icon";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import IconWithCircle from "../Screens/iconwithCircle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions, useNavigation } from "@react-navigation/native";
import darkBlue from "../../assets/darkBlue.png";
import { REACT_APP_LOCAL_TOKEN } from "./exchange/crypto-exchange-front-end-main/src/ExchangeConstants";
import { width } from "@mui/system";
import { useSelector } from "react-redux";

export const ExchangeHeader = (props) => {
  const navigation = useNavigation();
  const { isLogOut = true } = props;
  return (
    <View style={styles.headerContainer}>
      <Icon
        name={"left"}
        type={"antDesign"}
        size={20}
        color={"#fff"}
        onPress={() => {
         // navigation.goBack();
        }}
      />
      <Text style={{ color: "#fff", fontWeight: "700" }}>Exchange</Text>
      {isLogOut ? (
        <TouchableOpacity style={{ alignItems: "center" }} onPress={()=>{
          console.log('clicked')
          const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
          AsyncStorage.removeItem(LOCAL_TOKEN);
          navigation.navigate("exchangeLogin");
        }}>
          <Icon
            name={"logout"}
            type={"materialCommunity"}
            size={20}
            color={"#E96A6A"}
            onPress={() => {
              console.log('clicked')
              const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
              AsyncStorage.removeItem(LOCAL_TOKEN);
              //navigation.navigate("Settings");
            }}
          />
          <Text style={{ color: "#E96A6A" }}>Logout</Text>
        </TouchableOpacity>
      ) : (
        <Text style={{ width: "10%" }}>{""}</Text>
      )}
    </View>
  );
};

export const WalletHeader = (props) => {
  const { title, title1, IconName, IconType } = props;
  const navigation = useNavigation();
  const state=useSelector((state)=>state);
  return (
    // <View style={styles.walletContainer} onPress={() => {
    //   // navigation.goBack();
    // }}>
    //   <Icon
    //     name={"left"}
    //     type={"antDesign"}
    //     size={20}
    //     color={"#fff"}
    //     onPress={() => {
    //       navigation.goBack("");
    //     }}
    //   />
    //   {/* {Platform.OS == "android" ?<Text style={styles.text1}>{title}</Text>:<Text style={styles.text1_ios}>{title}</Text>} */}
    //    {/* <Text style={styles.text1}>{title}</Text> */}
    //   {/* <View style={{ alignItems: "center" }}>
    //     <Text style={{ color: "#E96A6A" }}>{title1}</Text>
    //   </View> */}
    //   <TouchableOpacity onPress={()=>{navigation.navigate("Home")}}>
    //    {Platform.OS==='ios'?<Image source={darkBlue} style={styles.logoImg_ios}/>:<Image source={darkBlue} style={styles.logoImg}/>}
    //   </TouchableOpacity>
    // </View>
    <View style={[styles.header,{backgroundColor:state.THEME.THEME===false? "#4CA6EA":"black",borderWidth:0.5,borderBottomColor:state.THEME.THEME===false? "#4CA6EA":"gray"}]}>
    <TouchableOpacity style={styles.backButton} onPress={()=>{navigation.goBack()}}>
    <Icon name={"left"} type={"antDesign"} size={29} color={"white"}/>
    </TouchableOpacity>
    {Platform.OS==='android'?<Text style={[styles.headerText_android,]}>{title}</Text>:<Text style={styles.headerText}>{title}</Text>}
    <TouchableOpacity onPress={()=>{navigation.goBack()}}>
    <Image source={darkBlue} style={styles.headerImage} />
    </TouchableOpacity>
  </View>  
  );
};
export const SwapHeader = (props) => {
  const { title, title1, setVisible } = props;
  const navigation = useNavigation();
  const state=useSelector((state)=>state);

  return (
    <View style={[styles.walletContainer,{backgroundColor:state.THEME.THEME===false?"#4CA6EA":"black"}]}>
      <Icon
        name={"left"}
        type={"antDesign"}
        size={25}
        color={"#fff"}
        onPress={() => {
          setVisible(false)
        }}
      />
      <Text style={styles.text_1}>{title}</Text>
      <View style={{ alignItems: "center" }}>
        <Text style={{ color: "#E96A6A" }}>{title1}</Text>
      </View>
    </View>
  );
};




export const HomeHeader = (props) => {
  const { title, title1, IconName, IconType } = props;
  const navigation = useNavigation();

  return (
    <TouchableOpacity style={styles.walletContainer} onPress={() => {
      navigation.goBack("Home");
    }}>
      <Icon
        name={"left"}
        type={"antDesign"}
        size={20}
        color={"#fff"}
        onPress={() => {
          navigation.goBack("");
        }}
      />
      <Text style={styles.text1}>{title}</Text>
      <View style={{ alignItems: "center" }}>
        <Text style={{ color: "#E96A6A" }}>{title1}</Text>
      </View>
    </TouchableOpacity>
  );
};



export const ExchangeHeaderIcon = (props) => {
  const { title, isLogOut=true  } = props;
  const navigation = useNavigation();

  const Navigate = () => {
    navigation.dispatch((state) => {
      // Remove the home route from the stack
      const routes = state.routes.filter((r) => r.name !== "exchange");

      return CommonActions.reset({
        ...state,
        routes,
        index: routes.length - 1,
      });
    });
  };
  return (
    <View style={styles.headerContainer1}>
      <View
        style={{
          justifyContent: "space-around",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity>
        <Icon
          name={"left"}
          type={"antDesign"}
          size={28}
          color={"white"}
          onPress={() => {
            navigation.goBack()
          //  const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
          //  AsyncStorage.removeItem(LOCAL_TOKEN);
          //  Navigate()
          //  navigation.goBack()
          }}
        />
        </TouchableOpacity>
      </View>
      { isLogOut ?Platform.OS==="android"?<Text style={styles.text}>Exchange</Text>:<Text style={[styles.text,styles.text1_ios]}>Exchange</Text>:Platform.OS==="android"?<Text style={{ color: "white",
    fontSize:19,
    fontWeight:"bold",
    alignSelf: "center",
    // textAlign: "center",
    marginStart:wp(21)}}>Exchange</Text>:<Text style={{ color: "white",
    fontSize:19,
    fontWeight:"bold",
    alignSelf: "center",
    // textAlign: "center",
    marginStart:wp(31),color: "white",
    fontWeight: "700",
    alignSelf: "center",
    marginStart: wp(23),
    top:19,
    fontSize:17}}>Exchange</Text>}
      
        <TouchableOpacity onPress={()=>{navigation.navigate("Home")}}>
        <Image source={darkBlue} style={styles.logoImg} />
        </TouchableOpacity>
      { isLogOut ? <View style={{ alignItems: "center" }}>
        <TouchableOpacity onPress={()=>{
          console.log('clicked')
           const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
           AsyncStorage.removeItem(LOCAL_TOKEN);
           Navigate()
           
      navigation.navigate('exchangeLogin')
        }}>

        <Icon
          name={"logout"}
          type={"materialCommunity"}
          size={30}
          // color={"#E96A6A"}
          color={"#fff"}
          onPress={() => {
            const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
            AsyncStorage.removeItem(LOCAL_TOKEN);
          //  navigation.navigate("Settings");
      navigation.navigate('exchangeLogin')

          }}
          />
        {/* <Text style={{ color: "#E96A6A" }}>Logout</Text> */}
          </TouchableOpacity>
      </View> :  <></>}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: "#fff",
    height: hp(47),
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: hp(40),
    alignSelf: "center",
    marginTop: hp(3),
  },
  dollarText: {
    textAlign: "center",
    color: "black",
    fontSize: 30,
    marginTop: hp(3),
  },
  textwithIcon: {
    flexDirection: "row",
    alignSelf: "center",
    marginTop: hp(2),
  },
  textColor: {
    color: "gray",
  },
  iconsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: hp(5),
  },
  iconTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  iconmainContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: hp(42),
    alignSelf: "center",
    marginTop: hp(5),
    height: hp(9),
    alignItems: "center",
    borderRadius: hp(2),
    padding: hp(2),
    backgroundColor: "#e8f0f8",
  },
  numberContainer: {
    backgroundColor: "#9bbfde",
    width: hp(4.3),
    height: hp(4.3),
    borderRadius: hp(10),
    justifyContent: "center",
    alignItems: "center",
  },
  number: {
    textAlign: "center",
    color: "#fff",
    backgroundColor: "#145DA0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: hp(10),
  },
  headerContainer: {
    backgroundColor: "#010C66",
    height: hp(10),
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    width: wp(100),
    paddingHorizontal: wp(5),
  },
  headerContainer1: {
    backgroundColor: "#4CA6EA",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    width: wp(100),
    paddingHorizontal: wp(2),
  },
  walletContainer: {
    backgroundColor: "#4CA6EA",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    paddingVertical: hp(2),
    width: wp(100),
    paddingHorizontal: wp(2),
    height:wp(17),
    borderBottomColor:"#4CA6EA",
    borderWidth:1
  },
  logoImg: {
    height: hp("9"),
    width: wp("12"),
    marginLeft: wp(14),
  },
  logoImg_ios: {
    height: hp("9"),
    width: wp("12"),
    marginLeft: wp(20),
  },
  text: {
    color: "white",
    fontSize:19,
    fontWeight:"bold",
    alignSelf: "center",
    // textAlign: "center",
    marginStart:wp(31)
  },
  text1: {
    color: "white",
    fontWeight: "700",
    marginLeft:wp(31),
    fontSize:17,
  },
  text_1: {
    color: "white",
    fontWeight: "700",
    marginRight:wp(8.6),
    fontSize:17,
    fontWeight:"700"
  },
  text1_ios: {
    color: "white",
    fontWeight: "700",
    alignSelf: "center",
    marginStart: wp(31),
    top:19,
    fontSize:17
  },
  header: {
    backgroundColor: '#4CA6EA',
    paddingTop: 10,
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingHorizontal: 10,
  },
  headerText_android:{
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    paddingTop:3,
    paddingLeft:32
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    paddingTop:30,
    paddingLeft:53
  },
  headerImage: {
    width: 80,
    height: 60,
    borderRadius: 20,
    marginRight: 3,
  }
});
