import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useSelector } from "react-redux";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Icon from "../icon";
import { GetPrivateKeyModal } from "./Modals/getPrivateKeyModal";
import { Wallet_screen_header } from "./reusables/ExchangeHeader";
import { useNavigation } from "@react-navigation/native";
import BackupWallet from "./exchange/crypto-exchange-front-end-main/src/components/BackupWallet";

const MyWallet = (props) => {
  const navigation = useNavigation();
  const state = useSelector((state) => state);
  const [user, setUser] = useState("");
  const [visible, setVisible] = useState(false);
  const [backupVisible, setbackupVisible] = useState(false);

  useEffect(() => {
    const fetch_wallet_name = async () => {
      try {
        const user = await state.wallet.name;
        setUser(user);
      } catch (error) {
        console.log("[=-=", error)
      }
    }
    fetch_wallet_name()
  }, []);


  return (
    <View style={[styles.mainView, { backgroundColor: state.THEME.THEME === false ? "#fff" : "#1B1B1C" }]}>
      <Wallet_screen_header title="Wallet" onLeftIconPress={() => navigation.goBack()} />
      <View style={[styles.card, { backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426" }]}>
        <Text style={[styles.label, { color: state.THEME.THEME === false ? "#6C757D" : "#8B93A7" }]}>
          Wallet Name
        </Text>
        <View style={[styles.inputContainer, {
          backgroundColor: state.THEME.THEME === false ? "#FFFFFF" : "#1B1B1C",
        }]}>
          <Text style={{ color: state.THEME.THEME === false ? "black":"#FFFFFF", fontSize: 19 }}>{user ? user : "Main Wallet 1"}</Text>
        </View>
      </View>
      
      <TouchableOpacity onPress={() => { setVisible(!visible) }} style={[styles.btnCard, { backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426" }]}>
        <View style={{ flexDirection: "row", }}>
          <View style={[styles.iconCon,{backgroundColor:"#5B65E133"}]}>
            <Icon name="eye" type={"materialCommunity"} color={"#5B65E1"} size={24} />
          </View>
          <View style={styles.iconContainer}>
            <Text style={[styles.secretText, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Show Secret Phrase</Text>
            <Text style={[styles.secretSubText, { color: state.THEME.THEME === false ? "black" : "#AAAAAA" }]}>View and manage your wallet</Text>
          </View>
        </View>
        <View style={styles.rightIcon}>
          <Icon name="right" type={"antDesign"} color={state.THEME.THEME === false ? "black" : "#fff"} size={20}/>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => {
        setbackupVisible(!backupVisible);
      }} style={[styles.btnCard, { backgroundColor: state.THEME.THEME === false ? "#F4F4F8" : "#242426" }]}>
        <View style={{ flexDirection: "row" }}>
          <View style={[styles.iconCon,{backgroundColor:"#40BF6A33"}]}>
            <Icon name="cloud-download-outline" type={"materialCommunity"} color={"#40BF6A"} size={24} />
          </View>
          <View style={styles.iconContainer}>
            <Text style={[styles.secretText, { color: state.THEME.THEME === false ? "black" : "#fff" }]}>Backup Secrets</Text>
            <Text style={[styles.secretSubText, { color: state.THEME.THEME === false ? "black" : "#AAAAAA" }]}>Secure your wallet</Text>
          </View>
        </View>
        <View style={styles.rightIcon}>
          <Icon name="right" type={"antDesign"} color={state.THEME.THEME === false ? "black" : "#fff"} size={20}/>
        </View>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <View style={{padding:5,borderRadius:50,backgroundColor:"#ECB742",marginRight:4}}>
        <Icon name="info" type={"antDesign"} color={"#fff"} size={18}/>
        </View>
        <Text style={{fontSize:12,color:"#ECB742",textAlign:"left",marginLeft:10, maxWidth:wp(70)}}>If you lose access to this device, your funds will be lost unless you back up your wallet.</Text>
      </View>

      <Text style={styles.text}>Your secret phrase is the only way to recover your wallet. Never share it with anyone.</Text>
      <GetPrivateKeyModal
        visible={visible}
        setVisible={setVisible}
        onCrossPress={() => {
          setVisible(false);
        }}
      />
      <BackupWallet open={backupVisible} close={() => setbackupVisible(false)} />
    </View>

  );
};

export default MyWallet;
const styles = StyleSheet.create({
  mainView: { 
     height: hp(100),
  },
  iconContainer: {
    alignItems: "flex-start",
    marginLeft: wp(0.5),
  },
  text: {
    color: "gray",
    marginHorizontal: wp(4),
    marginTop: hp(3),
    fontSize:15,
    textAlign:"center"
  },
  rightIcon: {
    marginRight: wp(3)
  },
  secretText: {
    marginHorizontal: wp(3),
    fontSize: 18
  },
  secretSubText: {
    marginHorizontal: wp(3),
    fontSize: 14
  },
  card: {
    borderRadius: 16,
    padding: wp(3),
    marginBottom: hp(1.5),
    marginHorizontal:19,
  },
  btnCard: {
    borderRadius: 16,
    padding: wp(3),
    paddingVertical:hp(2),
    marginBottom: hp(1.5),
    marginHorizontal:19,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoCard: {
    backgroundColor:"#FEF6D8",
    borderRadius: 16,
    padding: wp(3),
    paddingVertical:hp(2),
    marginTop: hp(1.5),
    marginHorizontal:19,
    flexDirection: "row",
    alignItems:"flex-start",
    borderRadius:15
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: hp(1.5),
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
  },
  iconCon:{
    justifyContent:"center",
    alignItems:"center",
    borderRadius:10,
    padding:10
  }
});
