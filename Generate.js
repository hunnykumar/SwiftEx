import { useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSelector } from "react-redux";
import { Wallet_screen_header } from "./src/Dashboard/reusables/ExchangeHeader";
import { useNavigation } from "@react-navigation/native";

export default function Generate() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const state = useSelector((state) => state);
  const navigation=useNavigation();
  return (
    <View style={[styles.container,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]}>
      <Wallet_screen_header title="Buy" onLeftIconPress={() => navigation.goBack()} />
      {loading&&<View style={{justifyContent:"center",alignSelf:"center",height:"100%",width:"100%"}}>
        <ActivityIndicator size="large" color={"green"} />
      </View>}
       <WebView
       source={{ uri: url }}
       onLoad={() => setLoading(true)}
       onLoadEnd={() => setLoading(false)}
     />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 0,
    height: 10,
  },
  content: {
    padding: 40,
  },
  list: {
    marginTop: 30,
  },
});
