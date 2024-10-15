import React, { useEffect, useState } from "react";
import { View, Text, Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setUser, Extend, Collapse } from "../components/Redux/actions/auth";
import Home2 from "./Home2";
import Settings from "../../Settings";
import Ionicons from "react-native-vector-icons/Ionicons";
import Market from "./Market";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MyHeader from "./MyHeader";
import Wallet from "./Wallet";
import MyHeader2 from "./MyHeader2";
import store from "../components/Redux/Store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { REACT_APP_LOCAL_TOKEN } from "./exchange/crypto-exchange-front-end-main/src/ExchangeConstants";
import { ExchangeNavigation } from "./exchange/crypto-exchange-front-end-main/src/Navigation";
import { ExchangeLogin } from "./exchange/crypto-exchange-front-end-main/src/pages/auth/ExchangeLogin";
import { AppHeader } from "./reusables/AppHeader";

const Tab = createBottomTabNavigator();

const Dashboard = ({ navigation }) => {
  const statee = useSelector((state) => state);
  const extend = useSelector((state) => state.extended);
  const dispatch = useDispatch();
  const [extended, setExtended] = useState(extend);
  const [token, setToken] = useState("");

  const updateState = () => {
    const data = store.getState();
    setState(data);
  };

  const changeState = () => {
    dispatch(Extend())
      .then((response) => {
        if (response.status === "success") {
          updateState();
        }
      })
      .catch((error) => console.error(error));
  };

  const collapseState = () => {
    dispatch(Collapse())
      .then((response) => {
        if (response.status === "success") {
          updateState();
        }
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    const fetchToken = async () => {
      const LOCAL_TOKEN = REACT_APP_LOCAL_TOKEN;
      const token = await AsyncStorage.getItem(LOCAL_TOKEN);
      setToken(token);
    };

    fetchToken();
  }, []);

  const Header1 = (title, state) => (
    <MyHeader
      title={title}
      state={state}
      changeState={changeState}
      extended={extended}
      setExtended={setExtended}
    />
  );

  const Header2 = (title, state) => (
    <MyHeader2
      title={title}
      state={state}
      changeState={collapseState}
      extended={extended}
      setExtended={setExtended}
    />
  );

  const Header3 = (title) => <AppHeader name={title} />;

  return (
    <Tab.Navigator
      shifting={false}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size = 25 }) => {
          let iconName;

          switch (route.name) {
            case "Home":
              iconName = "ios-home-sharp";
              break;
            case "Wallet":
              iconName = "ios-wallet-sharp";
              break;
            case "Assets":
              iconName = "ios-pie-chart-sharp";
              break;
            case "Market":
              iconName = "ios-bar-chart-sharp";
              break;
            case "Settings":
              iconName = "ios-settings-sharp";
              break;
            case "Exchange":
              iconName = "swap-vertical-outline";
              break;
            default:
              iconName = "ios-home-sharp";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },

        tabBarLabel: ({ focused }) => {
          const iconColor = focused
            ? statee.THEME.THEME === false
              ? "#131E3A"
              : "#145DA0"
            : statee.THEME.THEME === false
            ? "#131E3A"
            : "gray";

          return (
            <Text
              style={{
                color: iconColor,
                fontSize: 18,
                textAlign: "center",
                marginBottom: Platform.OS === "android" ? 10 : 10,
              }}
            >
              {route.name}
            </Text>
          );
        },

        tabBarActiveTintColor:
          statee.THEME.THEME === false ? "#131E3A" : "#145DA0",
        tabBarInactiveTintColor:
          statee.THEME.THEME === false ? "white" : "gray",
        tabBarStyle: {
          backgroundColor: statee.THEME.THEME === false ? "#4CA6EA" : "black",
          height: Platform.OS === "android" ? 70 : 80,
          borderTopColor:
            statee.THEME.THEME === false ? "#131E3A" : "#145DA0",
          borderTopWidth: 1,
        },
        headerTitleAlign: "center",
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home2}
        options={{
          tabBarHideOnKeyboard: true,
          header: () =>
            statee.extended === false
              ? Header1("Home", statee)
              : Header2("Home", statee),
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={Wallet}
        options={{
          header: () => Header3("Wallet"),
          headerShown: true,
          unmountOnBlur: true,
        }}
      />
      <Tab.Screen
        name="Market"
        component={Market}
        options={{
          header: () => Header3("Market"),
          headerShown: true,
          unmountOnBlur: true,
        }}
      />
      <Tab.Screen
        name="Exchange"
        component={token ? ExchangeNavigation : ExchangeLogin}
        options={{
          headerShown: false,
          tabBarStyle: { display: token ? "flex" : "none" },
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          header: () => Header3("Settings"),
          headerShown: true,
        }}
      />
    </Tab.Navigator>
  );
};

export default Dashboard;
