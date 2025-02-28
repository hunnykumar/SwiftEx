import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  Pressable,
  ScrollView,
  Keyboard,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Animated } from "react-native";
import title_icon from "../../assets/title_icon.png";
import { useDispatch, useSelector } from "react-redux";
import { alert } from "./reusables/Toasts";
import  Clipboard from "@react-native-clipboard/clipboard";
import Icon from "../icon";
import { Button } from "native-base";
import { Wallet_screen_header } from "./reusables/ExchangeHeader";
import { useNavigation } from "@react-navigation/native";
const PrivateKey = (props) => {
  const navi=useNavigation();
  const [text_input_up,settext_input_up]=useState(false);
  const [accountName, setAccountName] = useState("");
  const [visible, setVisible] = useState(false);
  const[ mnemonic,setMnemonic]= useState()
  const[disable,setDisable]=useState(true)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();

  const Spin = new Animated.Value(0);
  const SpinValue = Spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const copyToClipboard = (string) => {
    Clipboard.setString(string);
    alert("success","Copied");
  };

  useEffect( () => {
    setAccountName('')
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
    }).start();

   const fetch_new=async()=>{
    console.log(props.route.params.wallet.wallet.mnemonic);
    const mnemonic = props.route.params.wallet.wallet.mnemonic.match(/\b(\w+)'?(\w+)?\b/g)
    console.log("My mnemonic",mnemonic)
    setMnemonic(mnemonic)
   }
   fetch_new()
  }, []);

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
  
  const RenderItem = ({ item, index }) => {
    console.log("-------------", item);
    return (
      <Pressable style={style.pressable} onPress={()=>{
        console.log("Hello World")
      }}>
        <Text style={[style.pressText,{color:"black"}]}>{index + 1}</Text>

        <Text style={[style.itemText,{color:"black"}]}>{item}</Text>
      </Pressable>
    );
  };
  const handleUsernameChange = (text) => {
    // Remove whitespace from the username
    const formattedUsername = text.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '');
    setAccountName(formattedUsername);
  };
  return (
    <>
    <Wallet_screen_header title="Private Key" onLeftIconPress={() => navi.goBack()} />
    <View style={{ backgroundColor: "white", height: hp(100),marginBottom:hp(15) }}>
      <Animated.View // Special animatable View
        style={{ opacity: fadeAnim }}
      >
        <View style={style.Body}>
          {/* <Animated.Image
          style={{
            width: wp("5"),
            height: hp("5"),
            padding: 30,
            marginTop: hp(3),
          }}
          source={title_icon}
        /> */}
          <Text style={style.backupText}>Backup Mnemonic Phrase</Text>
          <Text style={style.welcomeText1}>
            Please select the Mnemonic in order to ensure the backup is
            correct.
          </Text>
        </View>
        <View style={{ marginTop: hp(3) }}>
          <FlatList
            data={mnemonic}
            // data={props.route.params.wallet.wallet.mnemonic}
            renderItem={RenderItem}
            numColumns={3}
            contentContainerStyle={{
              alignSelf: "center",
            }}
          />
        </View>
        <View style={{display:'flex',justifyContent:'center',alignItems:'center',marginTop:10}}>
          <Button 
          onPress={()=>{
            copyToClipboard(props.route.params.wallet.wallet.mnemonic)
          }}
          >Copy</Button>
        </View>
        <View style={style.dotView}>
          <Icon name="dot-single" type={"entypo"} size={20} />
          <Text style={{ color: "black" }}>
          Keep your mnemonic in a safe place, isolated from any network.
          </Text>
        </View>
        <View style={style.dotView1}>
          <Icon name="dot-single" type={"entypo"} size={20} />
          <Text style={style.welcomeText}>
          Do not share it through email, photos, social media, apps, etc.
          </Text>
        </View>

        {/* <Text selectable={true} style={style.welcomeText2}>
          {props.route.params.wallet.wallet.mnemonic}
        </Text> */}
        <View style={{marginTop:text_input_up?"-60%":10}}>
        <Text style={style.accountText}> Account Name</Text>
        <TextInput
          style={[style.input,{color:"black"}]}
          placeholder="Enter your account name"
          value={accountName}
          onChangeText={(text) => {handleUsernameChange(text)}}
          placeholderTextColor="gray"
          autoCapitalize={"none"}
          maxLength={20}
          />
          </View>
        <TouchableOpacity
          style={{alignSelf: "center",
          alignItems: "center",
          // backgroundColor:accountName && !/\s/.test(accountName) ?'green':"grey",
          backgroundColor:!accountName || !/\S/.test(accountName)?"gray":"green",
          marginTop: hp(2),
         width: wp(60),
          padding: 10,
          borderRadius: 10,
        }}
          // disabled={accountName && !/\s/.test(accountName)  ? false : true}
          disabled={!accountName || !/\S/.test(accountName)}
          onPress={() => {
            //setVisible(!visible)
            console.log(accountName.length)
            if (!accountName) {
              return alert("error", "you must set an account name to continue");
            }
            let wallet = props.route.params.wallet.wallet;
            wallet.accountName = accountName;
            
            console.log(wallet);
            props.navigation.navigate("Check Mnemonic", {
              wallet,
              mnemonic
            });
          }}
        >
          <Text style={{color:'white'}}>Next</Text>
        </TouchableOpacity>

        {/* <View style={style.Button}> */}

        {/* </View> */}
      </Animated.View>
    </View>
    </>
  );
};

export default PrivateKey;

const style = StyleSheet.create({
  Body: {
    width: wp(100),
    alignItems: "center",
    textAlign: "center",
  },
  welcomeText: {
    color: "black",
  },
  welcomeText1: {
    marginLeft: wp(4.7),
    color: "gray",
    marginLeft: wp(4),
    width: wp(90),
  },
  welcomeText2: {
    fontSize: 20,
    fontWeight: "200",
    color: "black",
  },
  Button: {
    backgroundColor: "red",
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
    backgroundColor: "white",
    borderWidth: 1,
    paddingHorizontal:wp(3),
    borderRadius: 10,
    width: wp(80),
    height: hp(5),
    marginTop: hp(1),
    alignSelf: "center",
  },
  pressable: {
    borderColor: "#D7D7D7",
    borderWidth: 0.5,
    backgroundColor: "#F2F2F2",
    width: wp(30),
    justifyContent: "center",
    paddingVertical: hp(2),
    paddingHorizontal: 3,
    position: "relative",
  },
  pressText: {
    alignSelf: "flex-end",
    paddingRight: 5,
    top: 0,
    position: "absolute",
  },
  itemText: {
    textAlign: "left",
    marginVertical: 6,
    marginHorizontal: wp(1.5),
  },
  backupText: {
    fontWeight: "bold",
    fontSize: 17,
    color: "black",
    marginLeft: 20,
    marginTop: hp(3),
    marginBottom: hp(2),
  },
  dotView: {
    flexDirection: "row",
    alignItems: "center",
    width: wp(90),
    marginLeft: 18,
    marginTop: hp(4),
  },
  dotView1: {
    flexDirection: "row",
    alignItems: "center",
    width: wp(80),
    marginLeft: 18,
    marginTop: hp(2),
  },
  accountText: { color: "black", marginHorizontal: wp(9), marginTop: hp(1) },
  nextButton: {
    alignSelf: "center",
    alignItems: "center",
    backgroundColor: "green",
    marginTop: hp(4),
    width: wp(60),
    padding: 10,
    borderRadius: 10,
  },
});
