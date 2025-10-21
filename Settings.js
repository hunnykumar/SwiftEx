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
import CustomInfoProvider from "./src/Dashboard/exchange/crypto-exchange-front-end-main/src/components/CustomInfoProvider";
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
    <View style={{backgroundColor:state.THEME.THEME === false ? "#FFFFFF" : "#1B1B1C",height:hp(100)}}>
      <Wallet_screen_header elementestID={"setting_back"} title="Settings" onLeftIconPress={() => navi.goBack()} />
        <TouchableOpacity
          onPress={() => {
            props.navigation.navigate("AllWallets");
          }}
          style={[styles.singleBigCard, { backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426" }]}
        >
          <View style={styles.iconCon}>
            <Icon
              name="wallet"
              type={"ionicon"}
              size={31}
              color={state.THEME.THEME ? "#4052D6" : "#5B65E1"}
            />
          </View>
          <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Choose Wallet</Text>
        </TouchableOpacity>

        <View style={[styles.multicardContainer, { backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426" }]}>
          <TouchableOpacity
            style={[styles.cardWithToggel, { backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426",borderBottomColor: state.THEME.THEME?"black":"#fff"}]}
            onPress={async () => {
              setCheckBox(!Checked);
              dispatch({
                type: SET_APP_THEME,
                payload: { THEME: Checked === false ? true : false },
              });

            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.iconCon}>
                <Icon name="moon-o" type={"fa"} size={31} color={state.THEME.THEME ? "#4052D6" : "#5B65E1"} />
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
            style={[styles.card, { backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426",borderBottomColor: state.THEME.THEME?"black":"#fff" }]}
            onPress={async () => {
                props.navigation.navigate("ExchangeHome");
            }}
          >
            <View style={styles.iconCon}>
              <Icon type={"ionicon"} name="git-compare" size={31} color={state.THEME.THEME ? "#4052D6" : "#5B65E1"} />
            </View>
            <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Exchange</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426", borderBottomWidth: 0,borderBottomColor: state.THEME.THEME?"black":"#fff" }]}
            onPress={() => {
              props.navigation.navigate("Transactions");
            }}
          >
            <View style={styles.iconCon}>
              <Icon type={"materials"} name="history" size={31} color={state.THEME.THEME ? "#4052D6" : "#5B65E1"} />
            </View>
            <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Transactions</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.multicardContainer, { backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426" }]}>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426",borderBottomColor: state.THEME.THEME?"black":"#fff" }]}
            onPress={() => {
              props.navigation.navigate("Biometric");
            }}
          >
            <View style={styles.iconCon}>
              <Icon type={Platform.OS === 'android' ? "ionicon" : "material"} name={Platform.OS === 'android' ? "finger-print" : "lock-outline"} size={31} color={state.THEME.THEME ? "#4052D6" : "#5B65E1"} />
            </View>
            <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>{Platform.OS === 'android' ? "Biometric Authenticaton" : "Authenticaton"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, { backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426",borderBottomColor: state.THEME.THEME?"black":"#fff" }]}
            onPress={() => {
              CustomInfoProvider.show("Info","Preference will be added soon.");
            }}
          >
            <View style={styles.iconCon}>
              <Icon type={"ionicon"} name="options" size={31} color={state.THEME.THEME ? "#4052D6" : "#5B65E1"} />
            </View>
            <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Preference</Text>
          </TouchableOpacity>


          <View style={[styles.card, { backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426", borderBottomWidth: 0,borderBottomColor: state.THEME.THEME?"black":"#fff"}]}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.iconCon}>
                <Icon type={"material"} name="edit-notifications" size={31} color={state.THEME.THEME ? "#4052D6" : "#5B65E1"} />
              </View>
              <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Push Notification</Text>
            </View>

          </View>
        </View>
        <TouchableOpacity
          style={[styles.singleBigCard, { backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426" }]}
          onPress={() => {
            CustomInfoProvider.show("Info","Help Center will be added soon.");
          }}
          onLongPress={() => {
            usergetToken()
          }}
        >
          <View style={styles.iconCon}>
            <Icon type={"feather"} name="help-circle" size={31} color={state.THEME.THEME ? "#4052D6" : "#5B65E1"} />
          </View>
          <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Help Center</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.singleBigCard, { backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426" }]}
          onPress={() => { logout_from_app() }}>
          <View style={styles.iconCon}>
            <Icon type={"material"} name="logout" size={31} color={state.THEME.THEME ? "#4052D6" : "#5B65E1"} />
          </View>
          <Text style={[styles.text, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Log Out</Text>
        </TouchableOpacity>
    </View>
  );
};

export default Settings;
const styles = StyleSheet.create({
  container: {
    display: "flex",
    backgroundColor: "#fff",
    width: wp(100),
    alignContent: "center",
    paddingBottom: 100,
  },
  text: {
    color: "black",
    fontSize: hp("2"),
    fontWeight: "600",
    marginHorizontal: wp(1.5),
  },
  singleBigCard: {
    width: wp(93),
    flexDirection: "row",
    alignSelf: "center",
    borderRadius: 20,
    marginTop: hp(1.5),
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    paddingVertical: hp(2),
    paddingHorizontal: 10,
  },
  card: {
    width: wp(90),
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1
  },
  multicardContainer: {
    width: wp(93),
    justifyContent: "center",
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: hp(1),
    marginTop: 20
  },
  cardWithToggel: {
    width: wp(90),
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1
  },
  iconCon: {
    width: 58,
    height: 63,
    marginLeft: 10,
    marginRight: wp(0.1),
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  }
});