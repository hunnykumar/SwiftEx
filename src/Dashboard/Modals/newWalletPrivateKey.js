import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  AddToAllWallets,
  setCurrentWallet,
} from "../../components/Redux/actions/auth";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal";
import Icon from "../../icon";
import { colors } from "../../Screens/ThemeColorsConfig";
import { checkWalletExistOrNot } from "../Wallets/WalletManagement";
import apiHelper from "../exchange/crypto-exchange-front-end-main/src/apiHelper";
import { REACT_APP_HOST } from "../exchange/crypto-exchange-front-end-main/src/ExchangeConstants";
import AccessNativeStorage from "../Wallets/AccessNativeStorage";
import { alert } from "../reusables/Toasts";
import { useNavigation } from "@react-navigation/native";
import Clipboard from "@react-native-clipboard/clipboard";

const NewWalletPrivateKey = ({
  props,
  Wallet,
  Visible,
  SetVisible,
  setModalVisible,
  setNewWalletVisible,
  onCrossPress,
}) => {
  const state=useSelector((state)=>state);
  const [accountName, setAccountName] = useState("");
  const [data, setData] = useState();
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();
  const navigation=useNavigation();

  useEffect(()=>{
    const  Keybord_state_cls=Keyboard.addListener('keyboardDidHide',()=>{
    });
    const  Keybord_state_opn=Keyboard.addListener('keyboardDidShow',()=>{
    });
    
    return ()=>{
      Keybord_state_cls.remove();
      Keybord_state_opn.remove();
    }
  },[]);
  
  const mnemonic = Wallet?.mnemonic.match(/\b(\w+)'?(\w+)?\b/g)

  useEffect(() => {
    setAccountName("")
    const fetch_wallet=async()=>{
      try {
        console.log(Wallet);
        let wallet = Wallet;
        wallet.Mnemonic = mnemonic;
      } catch (error) {
        console.log("=-===",error)
      }
    }
    fetch_wallet()
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
    }).start();
  }, []);

  const RenderItem = ({ item, index }) => {
    setData(data);
    return (
      <TouchableOpacity style={[style.flatBtn,{backgroundColor:theme.cardBg}]}>
        <Text style={{ textAlign: "right",color:theme.headingTx}}>{index + 1}</Text>
        <Text style={{ color:theme.headingTx }}>{item}</Text>
      </TouchableOpacity>
    );
  };
  const handleUsernameChange = (text) => {
    const formattedUsername = text.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '');
    setAccountName(formattedUsername);
  };
  const theme = state.THEME.THEME ? colors.dark : colors.light;

  const handleWallet = async () => {
    console.debug(JSON.stringify(Wallet,null,2))
    try {
      setLoading(true);
      const user = await AsyncStorageLib.getItem("user");
      let wallets = [];
      const data = await AsyncStorageLib.getItem(
        `${user}-wallets`
      )
        .then((response) => {
          console.log(response);
          JSON.parse(response).map((item) => {
            wallets.push(item);
          });
        })
        .catch((e) => {
          setModalVisible(false);
          console.log(e);
        });

      const allWallets = [
        {
          address: Wallet.address,
          name: Wallet.accountName,
          walletType: "Multi-coin",
          xrp: {
            address: Wallet.xrp.address,
          },
          stellarWallet: {
            publicKey: Wallet.stellarWallet.publicKey,
          },
          wallets: wallets,
        },
      ];

      dispatch(AddToAllWallets(allWallets, user)).then(
        async (response) => {
          if (response) {
            if (response.status === "Already Exists") {
              alert(
                "error",
                "Account with same name already exists"
              );
              setLoading(false);
              return;
            } else if (response.status === "success") {
              const result = await apiHelper.post(REACT_APP_HOST + '/v1/wallet', {
                "addresses": {
                  "eth": Wallet.address,
                  "xlm": Wallet.stellarWallet.publicKey,
                  "bnb": Wallet.address,
                  "multi": Wallet.address
                },
                "isPrimary": true
              });
              if (result.success) {
                alert("success", "wallet synced!");
              } else {
                alert("error", "unable to sync wallet.");
                console.log('Error:', result.error, 'Status:', result.status);
              }
              AsyncStorageLib.setItem("currentWallet", Wallet?.accountName)
              await AccessNativeStorage.saveWallet({
                name: Wallet.accountName,
                address: Wallet.address,
                privatekey: Wallet.privateKey,
                stellarPublicKey: Wallet.stellarWallet.publicKey,
                stellarPrivateKey: Wallet.stellarWallet.secretKey,
                mnemonic: Wallet.mnemonic,
                walletType: "Multi-coin"
              })
              dispatch(
                setCurrentWallet(
                  Wallet?.address,
                  Wallet?.accountName,
                )
              )
              setTimeout(() => {
                setLoading(false);
                SetVisible(false);
                setModalVisible(false);
                setNewWalletVisible(false);
                navigation.navigate("AllWallets");
              }, 0);
            } else {
              alert("error", "failed please try again");
              return;
            }
          }
        }
      );
    } catch (e) {
      setLoading(false);
      SetVisible(false);
      setModalVisible(false);
      setNewWalletVisible(false);
      alert("error", "Failed to import wallet. Please try again");
    }
  }

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
    >
      <Modal
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={500}
        animationOutTiming={650}
        isVisible={Visible}
        statusBarTranslucent={true}
        useNativeDriverForBackdrop={true}
        backdropTransitionOutTiming={0}
        hideModalContentWhileAnimating
        onBackdropPress={() => {
          SetVisible(false);
        }}
        onBackButtonPress={() => {
          SetVisible(false);
        }}
        style={style.modalCon}
      >

        <View style={[style.Body,{backgroundColor:theme.bg}]}>
          <Icon
            name={"close-circle-outline"} 
            type={"materialCommunity"}
            color={theme.headingTx}
            size={30}
            style={style.croosIcon}
            onPress={onCrossPress}
          />
            <Text style={[style.label,{color:theme.headingTx}]}>Account Name</Text>
            <TextInput
              value={accountName}
              returnKeyType="done"
              onChangeText={(text) => {
                handleUsernameChange(text)
              }}
              style={[style.labelInputContainer,{color:theme.headingTx,backgroundColor:theme.cardBg}]}
              placeholder={user ? user : "Enter your account name"}
              placeholderTextColor={"gray"}
              maxLength={20}
            />

          <Text style={[style.backupText,{color:theme.headingTx}]}>Backup Mnemonic Phrase</Text>
          <Text style={[style.welcomeText1,{color:theme.inactiveTx}]}>Keep your mnemonic in a safe place, isolated from any network.</Text>

          <View style={{ marginTop: hp(2) }}>
            <FlatList
              data={mnemonic}
              renderItem={RenderItem}
              keyExtractor={(item, index) => index}
              numColumns={3}
              contentContainerStyle={{
                alignSelf: "center",
              }}
            />
          </View>

          <View style={style.dotView}>
            <Icon name="dot-single" type={"entypo"} size={24} color={theme.inactiveTx}/>
            <Text style={{ color: theme.inactiveTx, width: "90%" }}>
            Do not share it through email, photos, social media, apps, etc.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              Clipboard.setString(Wallet?.mnemonic);
              alert("success", "Copied");
            }}
            style={{backgroundColor:"#4052D6",borderRadius:15,width:wp(90),marginTop:hp(1.5),paddingVertical:14,alignSelf:"center",alignItems:"center" }}
          >
            <Text style={{ color: "white",fontSize:16  }}>Copy</Text>
          </TouchableOpacity>

          <View style={{ width: wp(100),marginBottom:hp(5) }}>
            <TouchableOpacity
              style={{
                backgroundColor:!accountName || !/\S/.test(accountName)||loading?"gray":"#4052D6",
                width: wp(90),
                alignSelf: "center",
                alignItems: "center",
                borderRadius: 20,
                marginVertical: hp(3),
                paddingVertical: hp(1.7),
              }}
              disabled={!accountName || !/\S/.test(accountName)||loading}
              onPress={async() => {
                Keyboard.dismiss();
                const checkWalletName=await checkWalletExistOrNot(accountName);
                if(!checkWalletName){
                  let wallet = Wallet;
                  wallet.accountName = accountName;
                  wallet.Mnemonic = mnemonic;
                  handleWallet();
                }
              }}
            >
              <Text style={{ color: "white",fontSize:16  }}>{loading?<ActivityIndicator/>:"Create"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

export default NewWalletPrivateKey;

const style = StyleSheet.create({
  modalCon:{
    justifyContent: "flex-end",
    margin: 0,
  },
  Body: {
    borderTopLeftRadius:20,
    borderTopRightRadius:20,
    justifyContent: "flex-end",
    margin: 0,
    width:wp(100)
  },
  flatBtn: {
    borderRadius: hp(0.5),
    width: wp(30),
    paddingVertical: hp(2),
    borderWidth: 0.3,
    borderColor: "#D7D7D7",
    padding: 6,
  },
  backupText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "black",
    marginLeft: 20,
    marginBottom: hp(1),
    marginTop:hp(2.5)
  },
  welcomeText1: {
    marginLeft: wp(4.7),
    width: wp(90),
  },
  dotView: {
    flexDirection: "row",
    alignItems: "center",
    width: wp(85),
    marginLeft: 18,
    marginTop: hp(2),
  },
  labelInputContainer: {
    marginTop:hp(1),
    width: wp(90),
    alignItems: "center",
    alignSelf: "center",
    borderRadius: wp(2),
    paddingLeft: wp(3),
    paddingVertical: hp(1.6),
    fontSize:15,
  },
  label: {
    marginLeft: 20,
    fontSize:16,
    fontWeight: "bold",
  },
  croosIcon: {
    alignSelf: "flex-end",
    padding: 10,
  },
});