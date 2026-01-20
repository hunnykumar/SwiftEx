import AsyncStorageLib from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useDispatch, useSelector } from "react-redux";
import ToggleSwitch from "toggle-switch-react-native";
import { REACT_APP_HOST, REACT_APP_LOCAL_TOKEN } from "./src/Dashboard/exchange/crypto-exchange-front-end-main/src/ExchangeConstants";
import Icon from "./src/icon";
import { SET_APP_THEME } from "./src/components/Redux/actions/type";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Wallet_screen_header } from "./src/Dashboard/reusables/ExchangeHeader";
import CustomInfoProvider from "./src/Dashboard/exchange/crypto-exchange-front-end-main/src/components/CustomInfoProvider";
import authApi from "./src/Dashboard/exchange/crypto-exchange-front-end-main/src/authApi";
import { colors } from "./src/Screens/ThemeColorsConfig";
const Settings = (props) => {
  const navi = useNavigation();
  const focused = useIsFocused();
  const [Checked, setCheckBox] = useState(false);
  const [userProfileLoading, setuserProfileLoading] = useState(false);
  const [userProfile, setuserProfile] = useState(null);
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const theme = state.THEME.THEME ? colors.dark : colors.light;
  useEffect(() => {
    const insilize_data = async () => {
      try {
        const Checked = await AsyncStorageLib.getItem("APP_THEME");
        setCheckBox(Checked === null ? false : Checked === "false" ? false : true);
        await AsyncStorageLib.setItem("APP_THEME", JSON.stringify(state.THEME.THEME));
        setuserProfileLoading(true);
        checkUserLoginStatus();
      } catch (error) {
        console.log("====****.", error)
      }
    }
    insilize_data()
  }, [focused, state.THEME.THEME, Checked])

  const checkUserLoginStatus = async () => {
    try {
      const token = await AsyncStorageLib.getItem("UserAuthID");
      if (!token) {
        setuserProfile(null);
        setuserProfileLoading(false);
      } else {
        await getUserProfile()
      }
    } catch (error) {
      console.log("error-while-checkUserLoginStatus", error)
      setuserProfile(null);
      setuserProfileLoading(false);
    }
  }
  const getUserProfile = async () => {
    const result = await authApi.get(REACT_APP_HOST + "/v1/users/profile");
    if (result.success) {
      setuserProfile(result.data.user);
      setuserProfileLoading(false);
    } else {
      console.log('Failed to fetch:', result);
      setuserProfile(null);
      setuserProfileLoading(false)
      CustomInfoProvider.show("error", "Unable to get user profile.");
    }
  }

  const logout = async () => {
    try {
        await AsyncStorageLib.removeItem("UserAuthID");
        setuserProfileLoading(true);
        await checkUserLoginStatus();
        CustomInfoProvider.show("success", "Logged out successfully. Guest Mode enabled.");
    } catch (error) {
      console.log("(--)---", error)
    }
  }

  const TransactionSkeleton = () => (
    <View style={[styles.skeletonCard, { backgroundColor: theme.cardBg }]}>
      <View style={styles.skeletonRow}>
        <View style={[styles.skeletonCircle, { backgroundColor: theme.inactiveTx }]} />
        <View style={styles.skeletonContent}>
          <View style={[styles.skeletonLine, { backgroundColor: theme.inactiveTx, width: '60%' }]} />
          <View style={[styles.skeletonLine, { backgroundColor: theme.inactiveTx, width: '40%', marginTop: 8 }]} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ backgroundColor: theme.bg, height: hp(100) }}>
      <Wallet_screen_header elementestID={"setting_back"} title="Settings" onLeftIconPress={() => navi.goBack()} />
      {userProfileLoading ? <TransactionSkeleton /> :
        <View style={[styles.profileCard, { backgroundColor: theme.cardBg }]}>
          <View style={[styles.profileIcon, { backgroundColor: theme.smallCardBg }]}>
            <Text style={[styles.profileIconTxt, { color: theme.headingTx }]}>{userProfile?.email?.charAt(0)?.toLocaleUpperCase() || "G"}</Text>
          </View>
          <View style={styles.profileInfoContainer}>
            <Text style={[styles.profileName, { color: theme.headingTx }]}>{userProfile?.email?.split("@")[0] || "Guest"}</Text>
            <Text style={[styles.profileEmail, { color: theme.inactiveTx }]}>{userProfile?.email || "Guest"}</Text>
          </View>
          {!userProfile ?
            <TouchableOpacity onPress={() => { props.navigation.navigate("exchangeLogin",{diractPath:"Settings"}) }} style={styles.loginBtn}>
              <Text style={styles.loginBtnTxt}>Login</Text>
            </TouchableOpacity> : <Icon type={"material"} name="verified" size={25} color={"#4052D6"} style={{ alignSelf: "center" }} />}
        </View>}

      <View style={[styles.multicardContainer, { backgroundColor: theme.cardBg }]}>
        <TouchableOpacity
          style={[styles.card, { borderBottomColor: theme.inactiveTx }]}
          onPress={() => {
            props.navigation.navigate("AllWallets");
          }}
        >
          <View style={styles.iconCon}>
            <Icon type={"ionicon"} name="wallet" size={31} color={"#4052D6"} />
          </View>
          <Text style={[styles.text, { color: theme.headingTx }]}>Choose Wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cardWithToggel, { borderBottomColor: theme.inactiveTx }]}
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
              <Icon name="moon-o" type={"fa"} size={31} color={"#4052D6"} />
            </View>
            <Text style={[styles.text, { color: theme.headingTx }]}>Dark Mode</Text>
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
          style={[styles.card, { borderBottomWidth: 0, borderBottomColor: theme.inactiveTx }]}
          onPress={() => {
            props.navigation.navigate("Transactions");
          }}
        >
          <View style={styles.iconCon}>
            <Icon type={"materials"} name="history" size={31} color={"#4052D6"} />
          </View>
          <Text style={[styles.text, { color: theme.headingTx }]}>Transactions</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.multicardContainer, { backgroundColor: theme.cardBg }]}>
        <TouchableOpacity
          style={[styles.card, { borderBottomColor: theme.inactiveTx }]}
          onPress={() => {
            props.navigation.navigate("ExchangeHome");
          }}
        >
          <View style={styles.iconCon}>
            <Icon type={"ionicon"} name="git-compare" size={31} color={"#4052D6"} />

          </View>
          <Text style={[styles.text, { color: theme.headingTx }]}>Exchange</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { borderBottomColor: theme.inactiveTx }]}
          onPress={async () => {
            props.navigation.navigate("Biometric");
          }}
        >
          <View style={styles.iconCon}>
            <Icon type={Platform.OS === 'android' ? "ionicon" : "material"} name={Platform.OS === 'android' ? "finger-print" : "lock-outline"} size={31} color={"#4052D6"} />
          </View>
          <Text style={[styles.text, { color: theme.headingTx }]}>{Platform.OS === 'android' ? "Biometric Authenticaton" : "Authenticaton"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { borderBottomWidth: 0, borderBottomColor: theme.inactiveTx }]}
          onPress={() => {
            CustomInfoProvider.show("Info", "Help Center will be added soon.");
          }}
        >
          <View style={styles.iconCon}>
            <Icon type={"feather"} name="help-circle" size={31} color={"#4052D6"} />
          </View>
          <Text style={[styles.text, { color: theme.headingTx }]}>Help Center</Text>
        </TouchableOpacity>

      </View>

      <TouchableOpacity
        style={[styles.singleCard, { backgroundColor: theme.cardBg }]}
        onPress={() => { logout() }}>
        <View style={styles.iconCon}>
          <Icon type={"material"} name="logout" size={31} color={"#4052D6"} />
        </View>
        <Text style={[styles.text, { color: theme.headingTx }]}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Settings;
const styles = StyleSheet.create({
  text: {
    color: "black",
    fontSize: hp("2"),
    fontWeight: "600",
    marginHorizontal: wp(1.5),
  },
  singleCard: {
    width: wp(93),
    flexDirection: "row",
    alignSelf: "center",
    borderRadius: 20,
    marginTop: hp(1.5),
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    paddingVertical: hp(0.6),
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
    marginTop: hp(1.5)
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
  },
  profileCard: {
    width: wp(93),
    alignSelf: "center",
    borderRadius: 16,
    paddingHorizontal: wp(3.3),
    paddingVertical: hp(1.4),
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
  },
  profileInfoContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: hp(0),
  },
  profileEmail: {
    marginTop: hp(-0.3),
    fontSize: 16
  },
  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(2),
    borderWidth: 0.8,
    borderColor: "#4052D6",
    elevation: 10
  },
  profileIconTxt: {
    fontSize: 30,
    fontWeight: "500",
  },
  loginBtn: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.7),
    backgroundColor: "#4052D6",
    borderRadius: 10,
    alignContent: "center",
    justifyContent: "center"
  },
  loginBtnTxt: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "400"
  },
  skeletonCard: {
    width: wp(93),
    alignSelf: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  skeletonRow: {
    flexDirection: 'row',
  },
  skeletonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  skeletonContent: {
    flex: 1,
    justifyContent: 'center',
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  },
});