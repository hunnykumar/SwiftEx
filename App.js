import "./global";
// import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, AppState, BackHandler, Platform, StatusBar } from "react-native";
import { Provider as StoreProvider } from "react-redux";
import store from "./src/components/Redux/Store";
import NavigationProvider from "./src/Routes/Navigation";
import { Provider as PaperProvider } from "react-native-paper";
import { LogBox } from "react-native";
import { NativeBaseProvider } from "native-base";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Moralis from "moralis"
import { API_KEYS, MORALIS_API_KEY, STRIPE_URL } from "./src/Dashboard/constants";
import { StripeProvider } from "@stripe/stripe-react-native";

LogBox.ignoreLogs(["Setting a timer"]);



export default function App() {
  const [ready, setReady] = useState(false);
  LogBox.ignoreAllLogs()
  LogBox.ignoreLogs(["Setting a timer"]);
  LogBox.ignoreLogs(["Animated: `useNativeDriver`"]);
  LogBox.ignoreLogs(['Failed prop type: Invalid prop `data[0]` supplied to `XAxis`, expected one of type [number, object]'])

  LogBox.ignoreLogs([
    "Can't perform a React state update on an unmounted component",
  ]);
  LogBox.ignoreLogs([
    "The provided value 'ms-stream' is not a valid 'responseType'",
  ]);
  LogBox.ignoreLogs([
    "The provided value 'moz-chunked-arraybuffer' is not a valid 'responseType'",
  ]);
  LogBox.ignoreLogs([
    "verified is not a valid icon name for family FontAwesome"
  ])

  
  useEffect(() => {
    setTimeout(async () => {
      
      setReady(true);
      await Moralis.start({
        apiKey: MORALIS_API_KEY.apiKey//API_KEYS.MORALIS
      })
    }, 1500);
  }, []);
  // useEffect(() => {
  //   const disableBackButton = () => {
  //     return true;
  //   };
  //   if(Platform.OS==="android")
  //   { BackHandler.addEventListener('hardwareBackPress', disableBackButton);
  //   return () => {
  //     BackHandler.removeEventListener('hardwareBackPress', disableBackButton);
  //   };}

  // }, []);

 
  return (
    <StripeProvider
      publishableKey={STRIPE_URL.KEY}
      // urlScheme="" // required for 3D Secure and bank redirects
    >

    <StoreProvider store={store}>
      <NativeBaseProvider>
        <PaperProvider>
          
            <View style={styles.container}>
              {/* <StatusBar  backgroundColor="#011434" /> */}
              {Platform.OS==="ios"?<StatusBar hidden={true}/>:<StatusBar barStyle={"light-content"} backgroundColor={"#011434"}/>}

              <NavigationProvider />
            </View>
        </PaperProvider>
      </NativeBaseProvider>
    </StoreProvider>
  </StripeProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    backgroundColor: "#131E3A",
    color: "white",
  },
  content: {
    padding: 40,
  },
});
