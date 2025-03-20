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
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import { Wallet_screen_header } from "./reusables/ExchangeHeader";
import { useNavigation } from "@react-navigation/native";
const MyPrivateKey = (props) => {
  const navi=useNavigation()
    const state = useSelector((state)=>state)
  const [accountName, setAccountName] = useState("");
  const [visible, setVisible] = useState(false);
  const[ mnemonic,setMnemonic]= useState([])
  const[privateKey,setPrivateKey] = useState('')
  const[disable,setDisable]=useState(true)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();
  const [STTELLAR_KEY,setSTTELLR]=useState("");

  const Spin = new Animated.Value(0);
  const SpinValue = Spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const copyToClipboard = (string) => {
    Clipboard.setString(string);
    alert("success","Copied");
  };

  // useEffect(async () => {
  //   get_stellar()
  //   Animated.timing(fadeAnim, {
  //     toValue: 1,
  //     duration: 1000,
  //   }).start();
  //   let mnemonic =[]
  //   mnemonic = await state.wallet.mnemonic.match(/\b(\w+)'?(\w+)?\b/g)
  //   const privateKey = await state.wallet.privateKey
  //   console.log("Muy mnemonic",mnemonic)
  //   if(mnemonic!=null)
  //   {

  //     setMnemonic(mnemonic)
  //   }else{
  //    setPrivateKey(privateKey)
  //     console.log(privateKey)
  //   }
  // }, []);
  

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
    }).start();

    const fetch_STRL = async () => {
      try {
        get_stellar()
      } catch (error) {
        console.log("-=-----", error)
      }
    }

    const set_private_keys = async () => {
      try {
        let mnemonic = []
        mnemonic = await state.wallet.mnemonic.match(/\b(\w+)'?(\w+)?\b/g)
        const privateKey = await state.wallet.privateKey
        console.log("Muy mnemonic", mnemonic)
        if (mnemonic != null) {
          setMnemonic(mnemonic)
        } else {
          setPrivateKey(privateKey)
          console.log(privateKey)
        }
      } catch (error) {
        console.log("===", error)
      }
    }

    fetch_STRL()
    set_private_keys()
  }, []);

  const RenderItem = ({ item, index }) => {
    console.log("-------------", item);
    return (
      <Pressable style={[style.pressable,{backgroundColor:state.THEME.THEME===false?"#fff":"black"}]} onPress={()=>{
        console.log("Hello World")
      }}>
        <Text style={[style.pressText,{color:state.THEME.THEME===false?"black":"#fff"}]}>{index + 1}</Text>

        <Text style={[style.itemText,{color:state.THEME.THEME===false?"black":"#fff"}]}>{item}</Text>
      </Pressable>
    );
  };
  const get_stellar = async () => {
    try {
        const storedData = await AsyncStorageLib.getItem('myDataKey');
        // if (storedData !== null) {
        //     const parsedData = JSON.parse(storedData);
        //     const matchedData = parsedData.filter(item => item.Ether_address === state.wallet.address);
        //     const secret_Key = matchedData[0].secretKey;
            setSTTELLR(state?.wallet?.xrp?.privateKey);
        // }
        // else {
        //     console.log('No data found in AsyncStorage');
        // }
    } catch (error) {
        console.log("Error in get_stellar")
    }
}
  return (
    <View style={{ backgroundColor:state.THEME.THEME===false?"#fff":"black", height: hp(100) }}>
          <Wallet_screen_header title="Secret Key" onLeftIconPress={() => navi.goBack()} />
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
          <Text style={[style.backupText,{color:state.THEME.THEME===false?"black":"#fff"}]}>Backup Mnemonic Phrase</Text>
          <Text style={[style.welcomeText1,{color:state.THEME.THEME===false?"black":"#fff"}]}>
            Please select the Mnemonic in order to ensure the backup is
            correct.
          </Text>
        </View>
        <View style={{ marginTop: hp(3),backgroundColor:state.THEME.THEME===false?"#fff":"black" }}>
         {mnemonic.length>0?
          
           <FlatList
           data={mnemonic}
           // data={props.route.params.wallet.wallet.mnemonic}
           renderItem={RenderItem}
           numColumns={3}
           contentContainerStyle={{
             alignSelf: "center",
            }}
            />
            :<Text>{privateKey}</Text>
          }
        </View>
        <View style={{display:'flex',justifyContent:'center',alignItems:'center',marginTop:10}}>
          <Button 
          onPress={async()=>{
            const mnemonic = await state.wallet.mnemonic
            if(mnemonic)
            {

              copyToClipboard(mnemonic)
            }else{
              copyToClipboard(privateKey)
            }
          }}
          >Copy</Button>
        </View>

        <Text style={{ color:state.THEME.THEME===false?"black":"#fff", marginLeft: wp(4.7), }}>
            DYDX Private Key
          </Text>
        <View style={{ marginLeft: wp(1),flexDirection:"row",justifyContent:"space-around",alignItems:'center',marginTop:10}}>
        <Text style={{ color:state.THEME.THEME===false?"black":"#fff",width:wp(70) }}>
            {STTELLAR_KEY}
          </Text>
          <Button 
          onPress={async()=>{
              copyToClipboard(STTELLAR_KEY)
          }}
          >Copy</Button>
        </View>


        
        <View style={style.dotView}>
          <Icon name="dot-single" type={"entypo"} size={20} color={state.THEME.THEME===false?"black":"#fff"}/>
          <Text style={{color:state.THEME.THEME===false?"black":"#fff"}}>
          Keep your mnemonic in a safe place, isolated from any network.
          </Text>
        </View>
        <View style={style.dotView1}>
          <Icon name="dot-single" type={"entypo"} size={20} color={state.THEME.THEME===false?"black":"#fff"}/>
          <Text style={[style.welcomeText,{color:state.THEME.THEME===false?"black":"#fff"}]}>
           Do not share it through email, photos, social media, apps, etc.
          </Text>
        </View>

        {/* <Text selectable={true} style={style.welcomeText2}>
          {props.route.params.wallet.wallet.mnemonic}
        </Text> */}


       
        

        {/* <View style={style.Button}> */}

        {/* </View> */}
      </Animated.View>
    </View>
  );
};

export default MyPrivateKey;

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
    marginTop: hp(2),
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
    width: wp(90),
    marginLeft: 18,
    marginTop: hp(2),
  },
  accountText: { color: "black", marginHorizontal: wp(9), marginTop: hp(4) },
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
