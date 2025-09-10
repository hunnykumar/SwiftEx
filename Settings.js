// import AsyncStorageLib from "@react-native-async-storage/async-storage";
// import React from "react";
// import {
//   StyleSheet,
//   Text,
//   View,
//   Button,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   Alert,
// } from "react-native";
// import {
//   widthPercentageToDP as wp,
//   heightPercentageToDP as hp,
// } from "react-native-responsive-screen";
// import Icon from "react-native-vector-icons/FontAwesome";
// import { useDispatch } from "react-redux";
// import { logout } from "./src/components/Redux/actions/auth";
// import { REACT_APP_LOCAL_TOKEN } from "./src/Dashboard/exchange/crypto-exchange-front-end-main/src/ExchangeConstants";

// const Settings = (props) => {
//   const dispatch = useDispatch();
//   return (
//     <View style={styles.container}>
//       <View style={[styles.accountBox,{backgroundColor:state.THEME.THEME===false?"rgba(244, 244, 244, 1)":"#171616",borderColor:"rgba(255, 255, 255, 0.2)"}]}>
//         <TouchableOpacity
//           onPress={() => {
//             props.navigation.navigate("AllWallets");
//           }}
//         >
//           <Text style={styles.text}>My Wallets</Text>
//           <Icon
//             name="chevron-right"
//             size={hp("4")}
//             color="white"
//             style={{ marginLeft: wp("63"), marginTop: hp("-4") }}
//           />
//         </TouchableOpacity>
//       </View>
//       <View style={styles.accountBox2}>
//         <TouchableOpacity
//           onPress={() => {
//             props.navigation.navigate("Transactions");
//           }}
//         >
//           <Text style={styles.text}>Transactions</Text>
//           <Icon
//             name="chevron-right"
//             size={hp("4")}
//             color="white"
//             style={{ marginLeft: wp("65"), marginTop: hp("-4") }}
//           />
//         </TouchableOpacity>
//       </View>
//       <View style={styles.accountBox2}>
//         <TouchableOpacity
//           onPress={async () => {
//             const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
//             const token = await AsyncStorageLib.getItem(LOCAL_TOKEN);
//             console.log(token);

//             if (token) {
//               props.navigation.navigate("exchange");
//             } else {
//               props.navigation.navigate("exchangeLogin");
//             }
//           }}
//         >
//           <Text style={styles.text}>Exchange</Text>
//           <Icon
//             name="chevron-right"
//             size={hp("4")}
//             color="white"
//             style={{ marginLeft: wp("65"), marginTop: hp("-4") }}
//           />
//         </TouchableOpacity>
//       </View>
//       <View style={styles.accountBox2}>
//         <TouchableOpacity
//           onPress={() => {
//             //alert("coming soon");
//             props.navigation.navigate("Biometric");

//           }}
//         >
//           <Text style={styles.text}>Biometric Authenticaton</Text>
//           <Icon
//             name="chevron-right"
//             size={hp("4")}
//             color="white"
//             style={{ marginLeft: wp("65"), marginTop: hp("-4") }}
//           />
//         </TouchableOpacity>
//       </View>
//       <View style={styles.accountBox2}>
//         <TouchableOpacity
//           onPress={() => {
//             //props.navigation.navigate('ImportWallet')
//             alert("coming soon");
//           }}
//         >
//           <Text style={styles.text}>Payment Methods</Text>
//           <Icon
//             name="chevron-right"
//             size={hp("4")}
//             color="white"
//             style={{ marginLeft: wp("65"), marginTop: hp("-4") }}
//           />
//         </TouchableOpacity>
//       </View>
//       <View style={styles.accountBox3}>
//         <TouchableOpacity
//           onPress={() => {
//             const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
//             // AsyncStorageLib.removeItem('user')
//             AsyncStorageLib.removeItem(LOCAL_TOKEN);
//             props.navigation.navigate("Passcode");
//             /* dispatch(logout()).then((res)=>{
//       }).catch((e)=>{
//         console.log(e)
//       })*/
//           }}
//         >
//           <Text style={styles.text}>Logout</Text>
//           <Icon
//             name="chevron-right"
//             size={hp("4")}
//             color="white"
//             style={{ marginLeft: wp("65"), marginTop: hp("-4") }}
//           />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default Settings;
// const styles = StyleSheet.create({
//   container: {
//     display: "flex",
//     backgroundColor: "white",
//     height: hp("500"),
//     width: wp("100"),
//     alignContent: "center",
//     alignItems: "center",
//   },
//   text: {
//     color: "white",
//     fontSize: hp("2.3"),
//     fontWeight: "bold",
//     fontFamily: "sans-serif",
//     fontStyle: "italic",
//     marginLeft: wp("10"),
//   },
//   accountBox: {
//     borderWidth: 5,
//     width: wp(95),
//     paddingTop: hp("2"),
//     borderRadius: 20,
//     borderColor: "#131E3A",
//     height: hp("9"),
//     marginTop: hp(7),
//     backgroundColor: "#000C66",
//     textAlign: "center",
//     display: "flex",
//     alignItems: "center",
//   },
//   accountBox2: {
//     borderWidth: 5,
//     paddingTop: hp("2"),
//     borderRadius: 20,
//     borderColor: "#131E3A",
//     height: hp("9"),
//     width: wp(95),
//     marginTop: 8,
//     backgroundColor: "#000C66",
//     textAlign: "center",
//     display: "flex",
//     alignItems: "center",
//   },
//   accountBox3: {
//     borderWidth: 5,
//     paddingTop: hp("2"),
//     borderRadius: 20,
//     borderColor: "#131E3A",
//     height: hp("9"),
//     marginLeft: 40,
//     marginRight: 40,
//     marginTop: 10,
//     backgroundColor: "#000C66",
//     textAlign: "center",
//     display: "flex",
//     alignItems: "center",
//   },
// });

import AsyncStorageLib from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,StatusBar, SafeAreaView,Image
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useDispatch, useSelector } from "react-redux";
import ToggleSwitch from "toggle-switch-react-native";
import { Switch } from "react-native-paper";
import { REACT_APP_LOCAL_TOKEN } from "./src/Dashboard/exchange/crypto-exchange-front-end-main/src/ExchangeConstants";
import Icon from "./src/icon";
import { SET_APP_THEME } from "./src/components/Redux/actions/type";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Wallet_screen_header } from "./src/Dashboard/reusables/ExchangeHeader";
import useFirebaseCloudMessaging from "./src/Dashboard/notifications/firebaseNotifications";
const Settings = (props) => {
  const { usergetToken } = useFirebaseCloudMessaging();
  const navi=useNavigation();
  const focused=useIsFocused();
  const [Checked, setCheckBox] = useState(false);
  const [PUSH_NOTIFICATION,setPUSH_NOTIFICATION]=useState(false)
  const dispatch = useDispatch();
  const state=useSelector((state)=>state);
  useEffect(()=>{
   const insilize_data=async()=>{
   try {
    const Checked=await AsyncStorageLib.getItem("APP_THEME");
    setCheckBox(Checked===null?false:Checked==="false"?false:true);
    await AsyncStorageLib.setItem("APP_THEME",JSON.stringify(state.THEME.THEME));
   } catch (error) {
    console.log("====****.",error)
   }
   }
   insilize_data()
  },[focused,state.THEME.THEME,Checked])

  const logout_from_app=async()=>{
    try {
      // const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
            //AsyncStorageLib.removeItem('user')
            // AsyncStorageLib.removeItem(LOCAL_TOKEN);
            props.navigation.navigate("Passcode");
            /* dispatch(logout()).then((res)=>{
      }).catch((e)=>{
        console.log(e)
      })*/
    } catch (error) {
      console.log("(--)---",error)
    }
  }
  return (
    <>
    <Wallet_screen_header title="Settings" onLeftIconPress={() => navi.goBack()} />
    <ScrollView contentContainerStyle={[styles.container,{backgroundColor:state.THEME.THEME===false?"white":"black"}]}>
      {/* <Text style={[styles.setHeading,{color:state.THEME.THEME===false?"black":"#fff"}]}>Settings</Text> */}
      <TouchableOpacity
        onPress={() => {
          props.navigation.navigate("AllWallets");
        }}
        style={[styles.accountBox,{backgroundColor:state.THEME.THEME===false?"rgba(244, 244, 244, 1)":"#171616",borderColor:"rgba(255, 255, 255, 0.2)"}]}
      >
        <Icon
          name="wallet-outline"
          type={"materialCommunity"}
          size={hp(2)}
          color={state.THEME.THEME===false?"black":"#fff"}
          style={styles.iconCon} 
        />
        <Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Choose Wallet</Text>
      </TouchableOpacity>
        <TouchableOpacity
          // onPress={() => {
          //   props.navigation.navigate("Transactions");
          // }}
          style={[styles.accountBox1,{backgroundColor:state.THEME.THEME===false?"rgba(244, 244, 244, 1)":"#171616",borderColor:"rgba(255, 255, 255, 0.2)"}]}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon name="moon-o" type={"fa"} size={hp(2)} color={state.THEME.THEME===false?"black":"#fff"} style={styles.iconCon} />
            <Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Dark Mode</Text>
          </View>
          <View style={Platform.OS == "android" ? { paddingRight: wp(2) } : { paddingRight: wp(3.5) }}>
            <ToggleSwitch
              isOn={Checked}
              onColor="green"
              offColor="gray"
              labelStyle={{ color: "black", fontWeight: "900" }}
              size="small"
              onToggle={async() => {
                setCheckBox(!Checked);
                dispatch({
                  type: SET_APP_THEME,
                  payload: { THEME: Checked===false?true:false},
                });
                
              }}
            />
          </View>

         
        </TouchableOpacity>

      <TouchableOpacity
        style={[styles.accountBox,{backgroundColor:state.THEME.THEME===false?"rgba(244, 244, 244, 1)":"#171616",borderColor:"rgba(255, 255, 255, 0.2)"}]}
        onPress={async () => {
          const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
          const token = await AsyncStorageLib.getItem(LOCAL_TOKEN);
          console.log(token);

          if (token) {
            props.navigation.navigate("exchange");
          } else {
            props.navigation.navigate("exchangeLogin");
          }
        }}
      >
        <Icon type={"fa"} name="exchange" size={hp(2)} color={state.THEME.THEME===false?"black":"#fff"} style={styles.iconCon} />
        <Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Exchange</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.accountBox,{backgroundColor:state.THEME.THEME===false?"rgba(244, 244, 244, 1)":"#171616",borderColor:"rgba(255, 255, 255, 0.2)"}]}
        onPress={() => {
          props.navigation.navigate("Transactions");
        }}
      >
        <Icon type={"fa"} name="dollar" size={hp(2)} color={state.THEME.THEME===false?"black":"#fff"} style={styles.iconCon} />
        <Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Transactions</Text>
      </TouchableOpacity>

<TouchableOpacity
        style={[styles.accountBox,{backgroundColor:state.THEME.THEME===false?"rgba(244, 244, 244, 1)":"#171616",borderColor:"rgba(255, 255, 255, 0.2)"}]}
        onPress={() => {
          //alert("coming soon");
          props.navigation.navigate("Biometric");
        }}
      >
        {/* <Icon type={"ionicon"} name="finger-print" size={hp(2)} color={state.THEME.THEME===false?"black":"#fff"} style={styles.iconCon} /> */}
        {Platform.OS === 'android' ?<Icon type={"ionicon"} name="finger-print" size={hp(2)} color={state.THEME.THEME===false?"black":"#fff"} style={styles.iconCon} />: <Icon type={"material"} name="lock-outline" size={hp(2)} color={state.THEME.THEME===false?"black":"#fff"} style={styles.iconCon} />}
        {Platform.OS === 'android' ? <Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Biometric Authenticaton</Text>:<Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Authenticaton</Text>}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.accountBox,{backgroundColor:state.THEME.THEME===false?"rgba(244, 244, 244, 1)":"#171616",borderColor:"rgba(255, 255, 255, 0.2)"}]}
        onPress={() => {
          //props.navigation.navigate('ImportWallet')
          alert("Coming soon.")
        }}
      >
        <Icon type={"antDesign"} name="setting" size={hp(2)} color={state.THEME.THEME===false?"black":"#fff"} style={styles.iconCon} />
        <Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Preference</Text>
      </TouchableOpacity>

     
         <View style={[styles.accountBox1,{backgroundColor:state.THEME.THEME===false?"rgba(244, 244, 244, 1)":"#171616",borderColor:"rgba(255, 255, 255, 0.2)"}]}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Icon type={"materialCommunity"} name="bell-outline" size={hp(2)} color={state.THEME.THEME===false?"black":"#fff"} style={styles.iconCon}/>
            <Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Push Notification</Text>
          </View>
          <View style={Platform.OS == "android" ? { paddingRight: wp(2) } : { paddingRight: wp(3.5) }}>
            <ToggleSwitch
              isOn={PUSH_NOTIFICATION}
              onColor="green"
              offColor="gray"
              labelStyle={{ color: "black", fontWeight: "900" }}
              size="small"
              onToggle={() => {
                setPUSH_NOTIFICATION(!PUSH_NOTIFICATION);
              }}
            />
          </View>

        </View>
      <TouchableOpacity
        style={[styles.accountBox,{backgroundColor:state.THEME.THEME===false?"rgba(244, 244, 244, 1)":"#171616",borderColor:"rgba(255, 255, 255, 0.2)"}]}
        onPress={() => {
          //props.navigation.navigate('ImportWallet')
          alert("Coming soon.")
        }}
        onLongPress={()=>{
          usergetToken()
        }}
      >
        <Icon type={"feather"} name="help-circle" size={hp(2)} color={state.THEME.THEME===false?"black":"#fff"} style={styles.iconCon} />
        <Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Help Center</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
          style={[styles.accountBox,{backgroundColor:state.THEME.THEME===false?"rgba(244, 244, 244, 1)":"#171616",borderColor:"rgba(255, 255, 255, 0.2)"}]}
          onPress={() => {logout_from_app()}}>
          <Icon name="chevron-right" size={hp(2)} color={state.THEME.THEME===false?"black":"#fff"} style={styles.iconCon} />
          <Text style={[styles.text,{color:state.THEME.THEME===false?"black":"#fff"}]}>Log Out</Text>
        </TouchableOpacity>
    </ScrollView>
    </>
  );
};

export default Settings;
const styles = StyleSheet.create({
  container: {
    display: "flex",
    backgroundColor: "#fff",
    // height: hp(100),
    width: wp(100),
    alignContent: "center",
    paddingBottom: 100,
  },
  setHeading: {
    fontSize: hp(2.5),
    marginHorizontal: wp(6),
    marginTop: hp(4),
  },
  text: {
    color: "black",
    fontSize: hp("2"),
    fontWeight: "600",
    // fontFamily:"",
    marginHorizontal: wp(3),
  },
  accountBox: {
    width: wp(93),
    flexDirection: "row",
    alignSelf:"center",
    borderRadius: 20,
    marginTop: hp(1.5),
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    paddingVertical:"4.5%",
    paddingHorizontal:10,
  },
  accountBox1: {
    paddingHorizontal:10,
    width: wp(93),
    flexDirection: "row",
    alignSelf:"center",
    justifyContent: "space-between",
    borderRadius: 20,
    marginTop: hp(1.5),
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    paddingVertical:"4.5%"
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderColor: "gray",
  },
  switchContainer: {
    marginHorizontal: hp(24),
    borderRadius: hp(20),
    borderWidth: 1,
    borderColor: "gray",
    backgroundColor: "#EBE8FC",
  },
  Switchbtn: {
    height: hp(4.5),
  },
  iconCon:{
    marginLeft:10
  }
});
