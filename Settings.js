import AsyncStorageLib from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform, StatusBar, SafeAreaView, Image
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useDispatch, useSelector } from "react-redux";
import ToggleSwitch from "toggle-switch-react-native";
import { REACT_APP_LOCAL_TOKEN } from "./src/Dashboard/exchange/crypto-exchange-front-end-main/src/ExchangeConstants";
import Icon from "./src/icon";
import { SET_APP_THEME } from "./src/components/Redux/actions/type";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Wallet_screen_header } from "./src/Dashboard/reusables/ExchangeHeader";
import useFirebaseCloudMessaging from "./src/Dashboard/notifications/firebaseNotifications";
const Settings = (props) => {
  const { usergetToken } = useFirebaseCloudMessaging();
  const navi = useNavigation();
  const focused = useIsFocused();
  const [Checked, setCheckBox] = useState(false);
  const [PUSH_NOTIFICATION, setPUSH_NOTIFICATION] = useState(false)
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  useEffect(() => {
    const insilize_data = async () => {
      try {
        const Checked = await AsyncStorageLib.getItem("APP_THEME");
        setCheckBox(Checked === null ? false : Checked === "false" ? false : true);
        await AsyncStorageLib.setItem("APP_THEME", JSON.stringify(state.THEME.THEME));
      } catch (error) {
        console.log("====****.", error)
      }
    }
    insilize_data()
  }, [focused, state.THEME.THEME, Checked])

  const logout_from_app = async () => {
    try {
      props.navigation.navigate("Passcode");
    } catch (error) {
      console.log("(--)---", error)
    }
  }
  return (
    <>
      <Wallet_screen_header elementestID={"setting_back"} title="Settings" onLeftIconPress={() => navi.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: state.THEME.THEME === false ? "white" : "black" }]}>
        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate("AllWallets");
          }}
          style={[styles.accountBox, { backgroundColor: state.THEME.THEME === false ? "rgba(244, 244, 244, 1)" : "#171616", borderColor: "rgba(255, 255, 255, 0.2)" }]}
        >
          <View style={styles.iconCon}>
            <Icon
              name="wallet-outline"
              type={"materialCommunity"}
              size={25}
              color={"#2164C1"}
            />
          </View>
          <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Choose Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.accountBox1, { backgroundColor: state.THEME.THEME === false ? "rgba(244, 244, 244, 1)" : "#171616", borderColor: "rgba(255, 255, 255, 0.2)" }]}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.iconCon}>
              <Icon name="moon-o" type={"fa"} size={25} color={"#2164C1"} />
            </View>
            <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Dark Mode</Text>
          </View>
          <View style={Platform.OS == "android" ? { paddingRight: wp(2) } : { paddingRight: wp(3.5) }}>
            <ToggleSwitch
              isOn={Checked}
              onColor="green"
              offColor="gray"
              labelStyle={{ color: "black", fontWeight: "900" }}
              size="small"
              onToggle={async () => {
                setCheckBox(!Checked);
                dispatch({
                  type: SET_APP_THEME,
                  payload: { THEME: Checked === false ? true : false },
                });

              }}
            />
          </View>


        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.accountBox, { backgroundColor: state.THEME.THEME === false ? "rgba(244, 244, 244, 1)" : "#171616", borderColor: "rgba(255, 255, 255, 0.2)" }]}
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
          <View style={styles.iconCon}>
            <Icon type={"fa"} name="exchange" size={25} color={"#2164C1"} />
          </View>
          <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Exchange</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.accountBox, { backgroundColor: state.THEME.THEME === false ? "rgba(244, 244, 244, 1)" : "#171616", borderColor: "rgba(255, 255, 255, 0.2)" }]}
          onPress={() => {
            props.navigation.navigate("Transactions");
          }}
        >
          <View style={styles.iconCon}>
            <Icon type={"fa"} name="dollar" size={25} color={"#2164C1"} />
          </View>
          <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.accountBox, { backgroundColor: state.THEME.THEME === false ? "rgba(244, 244, 244, 1)" : "#171616", borderColor: "rgba(255, 255, 255, 0.2)" }]}
          onPress={() => {
            //alert("coming soon");
            props.navigation.navigate("Biometric");
          }}
        >
          {Platform.OS === 'android' ?
            <View style={styles.iconCon}>
              <Icon type={"ionicon"} name="finger-print" size={25} color={"#2164C1"} />
            </View> :
            <View style={styles.iconCon}>
              <Icon type={"material"} name="lock-outline" size={25} color={"#2164C1"} />
            </View>}
          {Platform.OS === 'android' ? <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Biometric Authenticaton</Text> : <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Authenticaton</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.accountBox, { backgroundColor: state.THEME.THEME === false ? "rgba(244, 244, 244, 1)" : "#171616", borderColor: "rgba(255, 255, 255, 0.2)" }]}
          onPress={() => {
            alert("Coming soon.")
          }}
        >
          <View style={styles.iconCon}>
            <Icon type={"antDesign"} name="setting" size={25} color={"#2164C1"} />
          </View>
          <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Preference</Text>
        </TouchableOpacity>


        <View style={[styles.accountBox1, { backgroundColor: state.THEME.THEME === false ? "rgba(244, 244, 244, 1)" : "#171616", borderColor: "rgba(255, 255, 255, 0.2)" }]}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.iconCon}>
              <Icon type={"materialCommunity"} name="bell-outline" size={25} color={"#2164C1"} />
            </View>
            <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Push Notification</Text>
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
          style={[styles.accountBox, { backgroundColor: state.THEME.THEME === false ? "rgba(244, 244, 244, 1)" : "#171616", borderColor: "rgba(255, 255, 255, 0.2)" }]}
          onPress={() => {
            //props.navigation.navigate('ImportWallet')
            alert("Coming soon.")
          }}
          onLongPress={() => {
            usergetToken()
          }}
        >
          <View style={styles.iconCon}>
            <Icon type={"feather"} name="help-circle" size={25} color={"#2164C1"} />
          </View>
          <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Help Center</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.accountBox, { backgroundColor: state.THEME.THEME === false ? "rgba(244, 244, 244, 1)" : "#171616", borderColor: "rgba(255, 255, 255, 0.2)" }]}
          onPress={() => { logout_from_app() }}>
          <View style={styles.iconCon}>
            <Icon name="chevron-right" size={25} color={"#2164C1"} />
          </View>
          <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Log Out</Text>
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
    marginHorizontal: wp(1.5),
  },
  accountBox: {
    width: wp(93),
    flexDirection: "row",
    alignSelf: "center",
    borderRadius: 20,
    marginTop: hp(1.5),
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    paddingVertical: "4.5%",
    paddingHorizontal: 10,
  },
  accountBox1: {
    paddingHorizontal: 10,
    width: wp(93),
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "space-between",
    borderRadius: 20,
    marginTop: hp(1.5),
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    paddingVertical: "4.5%"
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
  iconCon: {
    width: 55,
    height: 55,
    marginLeft: 10,
    marginRight: wp(1.5),
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2164C140",
  }
});