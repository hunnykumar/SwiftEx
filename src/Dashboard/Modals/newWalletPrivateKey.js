import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import title_icon from "../../../assets/title_icon.png";
import { useDispatch, useSelector } from "react-redux";
import {
  AddToAllWallets,
  getBalance,
  setCurrentWallet,
  setUser,
  setToken,
  setWalletType,
} from "../../components/Redux/actions/auth";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import DialogInput from "react-native-dialog-input";
import { encryptFile } from "../../utilities/utilities";
import { urls } from "../constants";
import Modal from "react-native-modal";
import CheckNewWalletMnemonic from "./checkNewWalletMnemonic";
import ModalHeader from "../reusables/ModalHeader";
import Icon from "../../icon";

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
  const [visible, setVisible] = useState(false);
  const [newWallet, setNewWallet] = useState(Wallet);
  const [data, setData] = useState();
  const [user, setUser] = useState("");
  const [text_input_up,settext_input_up]=useState(false);

  const [MnemonicVisible, setMnemonicVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();

  const Spin = new Animated.Value(0);
  const SpinValue = Spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(()=>{
    const  Keybord_state_cls=Keyboard.addListener('keyboardDidHide',()=>{
      settext_input_up(false);
    });
    const  Keybord_state_opn=Keyboard.addListener('keyboardDidShow',()=>{
      settext_input_up(true);
    });
    
    return ()=>{
      Keybord_state_cls.remove();
      Keybord_state_opn.remove();
    }
  },[]);
  
  async function saveUserDetails() {
    let response;
    try {
      response = await fetch(`http://${urls.testUrl}/user/saveUserDetails`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailId: accountName,
          walletAddress: Wallet.address,
        }),
      })
        .then((response) => response.json())
        .then(async (responseJson) => {
          if (responseJson.responseCode === 200) {
            alert("success", "success");
            return responseJson.responseCode;
          } else if (responseJson.responseCode === 400) {
            alert(
              "error",
              "account with same name already exists. Please use a different name"
            );
            return responseJson.responseCode;
          } else {
            alert("error", "Unable to create account. Please try again");
            return 401;
          }
        })
        .catch((error) => {
          setVisible(!visible);

          alert(error);
        });
    } catch (e) {
      setVisible(!visible);

      console.log(e);
      alert("error", e);
    }
    console.log(response);
    return response;
  }

  const closeModal = () => {
    SetVisible(false);
  };
  const mnemonic = Wallet?.mnemonic.match(/\b(\w+)'?(\w+)?\b/g)

  console.log("My mnemonic", mnemonic);

  useEffect(() => {
    const fetch_wallet=async()=>{
      try {
        console.log(Wallet);
        let wallet = Wallet;
        wallet.Mnemonic = mnemonic;
        setNewWallet(wallet);
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
    console.log("============------------", item);
    setData(data);
    return (
      <TouchableOpacity style={[style.flatBtn,{backgroundColor:state.THEME.THEME===false?"#011434":"black"}]}>
        <Text style={{ textAlign: "right",color:"#fff" }}>{index + 1}</Text>
        <Text style={{ color:"#fff" }}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View // Special animatable View
      style={{ opacity: fadeAnim }}
    >
      <Modal
        animationIn="slideInRight"
        animationOut="slideOutRight"
        animationInTiming={500}
        animationOutTiming={650}
        isVisible={Visible}
        statusBarTranslucent={true}
        // style={{backgroundColor:"blue",height:hp(100),top:20,width:wp(100),alignSelf:"center"}}
        useNativeDriverForBackdrop={true}
        backdropTransitionOutTiming={0}
        hideModalContentWhileAnimating
        onBackdropPress={() => {
          SetVisible(false);
        }}
        onBackButtonPress={() => {
          SetVisible(false);
        }}
      >

        <View style={[style.Body,{backgroundColor:state.THEME.THEME===false?"#011434":"black"}]}>
          {/* <ModalHeader Function={closeModal} name={'Private Key'}/> */}
          <Icon
            type={"entypo"}
            name={"cross"}
            color={"#fff"}
            size={24}
            style={style.croosIcon}
            onPress={onCrossPress}
          />
          <Text style={[style.backupText,{color:"#fff"}]}>Backup Mnemonic Phrase</Text>
          <Text style={style.welcomeText1}>
            Please select the mnemonic in order to ensure the backup is
            correct.
          </Text>

          <View style={{ marginTop: hp(3) }}>
            <FlatList
              data={mnemonic}
              renderItem={RenderItem}
              numColumns={3}
              contentContainerStyle={{
                alignSelf: "center",
              }}
            />
          </View>

          <View style={style.dotView}>
            <Icon name="dot-single" type={"entypo"} size={20} color={"gray"}/>
            <Text style={{ color: "gray" }}>
              Keep your mnemonic in a safe place isolated from network
            </Text>
          </View>
          <View style={style.dotView1}>
            <Icon name="dot-single" type={"entypo"} size={20} color={"gray"}/>
            <Text style={{ color: "gray", width: "90%" }}>
              Don't share and store mnemonic with a network, such as
              email,photo, social apps, and so on
            </Text>
          </View>
          {/* <Text selectable={true} style={style.welcomeText2}>
            {Wallet ? Wallet.mnemonic : ""}
          </Text> */}
          {/* <Text style={style.welcomeText2}> Account Name</Text> */}

          <View style={[style.labelInputContainer,{marginTop:text_input_up?"-60%":38}]}>
            <Text style={[style.label,{backgroundColor:state.THEME.THEME===false?"#011434":"black"}]}>Account Name</Text>
            <TextInput
              value={accountName}
              onChangeText={(text) => {
                setAccountName(text);
              }}
              style={{ width: wp("78%") }}
              placeholder={user ? user : "Enter your account name"}
              placeholderTextColor={"gray"}
              maxLength={20}
            />
          </View>

          {/* <TextInput
          placeholder="Enter your account name"
            style={style.input}
            value={accountName}
            placeholder='Enter account name'
            onChangeText={(text) => setAccountName(text)}
            autoCapitalize={"none"}
          /> */}

          <View style={{ width: wp(95) }}>
            <TouchableOpacity
              style={{
                // backgroundColor:
                  // accountName && !/\s/.test(accountName) ? "#4CA6EA" : "gray",
                  backgroundColor:!accountName || !/\S/.test(accountName)?"gray":"rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)",
                width: wp(55),
                alignSelf: "center",
                alignItems: "center",
                borderRadius: 10,
                marginTop: hp(1.5),
                paddingVertical: hp(1.7),
                borderColor:"#145DA0",
                borderWidth:0.9
              }}
              // disabled={accountName && !/\s/.test(accountName) ? false : true}
              disabled={!accountName || !/\S/.test(accountName)}
              onPress={() => {
                Keyboard.dismiss();
                //setVisible(!visible)
                let wallet = Wallet;
                wallet.accountName = accountName;
                wallet.Mnemonic = mnemonic;
                setNewWallet(wallet);
                console.log(newWallet);
                setMnemonicVisible(true);
              }}
            >
              <Text style={{ color: "white" }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
        {MnemonicVisible && (
          <CheckNewWalletMnemonic
            Wallet={newWallet}
            SetVisible={setMnemonicVisible}
            onCrossPress={() => {
              setMnemonicVisible(false);
            }}
            Visible={MnemonicVisible}
            setModalVisible={setModalVisible}
            SetPrivateKeyVisible={SetVisible}
            setNewWalletVisible={setNewWalletVisible}
          />
        )}
      </Modal>
    </Animated.View>
  );
};

export default NewWalletPrivateKey;

const style = StyleSheet.create({
  Body: {
    backgroundColor: "white",
    // paddingVertical:hp(2),
    height: hp(90),
    borderRadius: hp(2),
    width: wp(95),
    alignSelf: "center",
    paddingBottom: hp(2),
    marginTop: hp(3),
    borderColor:"#145DA0",
    borderWidth:0.9,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "200",
    color: "white",
    marginTop: hp(5),
  },
  welcomeText2: {
    fontSize: 14,
    color: "black",
    textAlign: "center",
    marginTop: hp(3),
  },
  Button: {
    marginTop: hp(0),
  },
  tinyLogo: {
    width: wp("5"),
    height: hp("5"),
    padding: 30,
    marginTop: hp(10),
  },
  Text: {
    marginTop: hp(5),
    fontSize: 15,
    fontWeight: "200",
    color: "white",
  },
  input: {
    marginTop: hp(2),
    width: wp("70"),
    height: hp(5),
    borderRadius: hp(1),
    backgroundColor: "white",
    paddingHorizontal: wp(4),
    alignSelf: "center",
    borderWidth: StyleSheet.hairlineWidth * 1,
  },
  verifyText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: hp(2),
  },
  wordText: {
    color: "black",
    textAlign: "center",
    marginTop: hp(1),
    width: wp(88),
    marginHorizontal: wp(5),
  },
  ButtonView: {
    backgroundColor: "#4CA6EA",
    width: wp(40),
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 10,
    marginTop: hp(1.5),
    paddingVertical: hp(1.7),
  },
  flatBtn: {
    backgroundColor: "#F2F2F2",
    borderRadius: hp(0.3),
    width: wp(28),
    paddingVertical: hp(2),
    borderWidth: 0.3,
    borderColor: "#D7D7D7",
    padding: 6,
  },
  backupText: {
    fontWeight: "bold",
    fontSize: 17,
    color: "black",
    marginLeft: 20,
    marginBottom: hp(1),
  },
  welcomeText1: {
    marginLeft: wp(4.7),
    color: "gray",
    // marginLeft: wp(4),
    width: wp(90),
  },
  dotView: {
    flexDirection: "row",
    alignItems: "center",
    width: wp(90),
    marginLeft: 18,
    marginTop: hp(3),
  },
  dotView1: {
    flexDirection: "row",
    alignItems: "center",
    width: wp(90),
    marginLeft: 18,
    marginTop: hp(2),
  },
  welcomeText: {
    color: "black",
    textAlign: "center",
  },
  labelInputContainer: {
    position: "relative",
    width: wp(90),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    marginTop: hp(4),
    borderRadius: wp(2),
    backgroundColor: "white",
    borderWidth: 1,
    paddingLeft: wp(3),
    paddingVertical: hp(1.2),
    borderColor: "#DADADA",
  },
  label: {
    position: "absolute",
    zIndex: 100,
    backgroundColor: "#011434",
    paddingHorizontal: 5,
    left: 12,
    color: "#4CA6EA",
    top: -12,
    borderRadius:10
  },
  croosIcon: {
    alignSelf: "flex-end",
    padding: hp(1.2),
  },
});
//  const mnemonic = Wallet?.mnemonic.match(/\b(\w+)'?(\w+)?\b/g)
