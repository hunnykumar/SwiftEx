import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";

import { LinearGradient } from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import PhoneInput from "react-native-phone-number-input";
import { saveToken, signup } from "../../api";
import { useSelector } from "react-redux";
import {ShowErrotoast, alert} from '../../../../../reusables/Toasts'
import { useToast } from "native-base";
import { Exchange_Login_screen } from "../../../../../reusables/ExchangeHeader";
import darkBlue from "../../../../../../../assets/darkBlue.png";
import Icon from "../../../../../../icon";

export const ExchangeRegister = (props) => {
  const toast=useToast();
  const state = useSelector((state) => state);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showMessage, setShowMessage] = useState();
  const [message, setMessage] = useState("");
  const [platform, setPlatform] = useState("");
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [formattedValue, setFormattedValue] = useState("");
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [formContent, setFormContent] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: email,
    email: "",
    accountAddress: "",
    walletAddress: state.wallet ? state.wallet.address : "",
    password: "",
  });

  const phoneInput = useRef(null);

  const navigation = useNavigation();

  const handleSubmit = async () => {
    setLoading(true);
    const { err,res } = await signup({
      ...formContent,
      phoneNumber: `${formContent.email}`,
    });
    setLoading(false);
    console.log(err,res)
    if (res.message === "Otp Send successfully") {
      navigation.navigate("Exchange_otp", {
        Email: res.token,
        type:"new_res"
      });
    }
    if(err.message==="Otp not Send.")
    {
      ShowErrotoast(toast,"Something went wrong.");
    }
    if(err.message==="Email already registered")
    {
      ShowErrotoast(toast,"Email already registered");
    }
    if(err.message==="Wallet already registered")
    {
      ShowErrotoast(toast,"Wallet already registered");
    }
    if (Array.isArray(err.message) && err.message.includes("email must be an email")) {
      ShowErrotoast(toast, "Email must be an email");
    }
    if (Array.isArray(err.message) && err.message.includes("lastName should not be empty")) {
      ShowErrotoast(toast, "Last name should not be empty");
    }
    if (Array.isArray(err.message) && err.message.includes("firstName should not be empty")) {
      ShowErrotoast(toast, "First name should not be empty");
    }
    
    if (err) {
      setShowMessage(true);
      return setMessage(err.message);
    }
  };

  const onChangename = (input) => {
    const formattedInput = input.replace(/\s/g, '');
    setFormContent({ ...formContent, firstName: formattedInput })
  };
  const onChangelast = (input) => {
    const formattedInput = input.replace(/\s/g, '');
    setFormContent({ ...formContent, lastName: formattedInput })
  };
  const onChangelmail = (input) => {
    // const formattedInput = input.replace(/\s/g, '').toLowerCase();
    setFormContent({ ...formContent, email: input.toLowerCase() })
  };

  return (
    <>
    <Exchange_Login_screen title="" onLeftIconPress={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.container} behavior="height">
        <ScrollView>
          <View
            style={{
              display: "flex",
              // alignItems: "center",
              textAlign: "center",
              justifyContent: "space-evenly",
              marginTop: platform === "ios" ? hp(20) : hp("1"),
              color: "white",
            }}
          >
            <Image style={styles.tinyLogo} source={darkBlue} />
            <Text style={{ color: "#fff", paddingVertical:hp(0.4), fontSize: 20,textAlign:"center" ,fontWeight:"700"}}>
              Create your exchange account
            </Text>



            <View style={styles.inp}>
                <Text style={styles.text}>First Name</Text>

              <TextInput
                style={styles.input}
                theme={{ colors: { text: "white" } }}
                value={formContent.firstName}
                placeholder={"Enter your first name"}
                onChangeText={(text) =>
                  onChangename(text)
                }
                autoCapitalize={"none"}
                placeholderTextColor="gray"
                
              />
            </View>



            <View style={styles.inp}>
                <Text style={styles.text}>Last Name</Text>
              <TextInput
                placeholderTextColor="gray"
                style={styles.input}
                theme={{ colors: { text: "white" } }}
                value={formContent.lastName}
                placeholder={"Enter your last name"}
                onChangeText={(text) =>
                  onChangelast(text)
                }
              />
            </View>
            
            <View style={styles.inp}>
                <Text style={styles.text}>
                  Email Address
                </Text>
              <TextInput
                placeholderTextColor="gray"
                style={styles.input}
                theme={{ colors: { text: "white" } }}
                value={formContent.email}
                placeholder={"Enter your email address"}
                keyboardType='email-address'
                onChangeText={(text) =>
                   onChangelmail(text)
                }
              />
            </View>
            <View style={styles.inp}>
                <Text style={styles.text}>
                  Wallet Address
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.input}>
              <Text
                style={{ color: "black",fontSize:18,textAlign:"center",marginTop:hp(1.3)}}
                >{formContent.walletAddress}
              </Text>
                </ScrollView>
            </View>
            <View style={{ flexDirection:"row",alignSelf:"flex-start",marginHorizontal:wp(10),marginTop:hp(3)}}>
              <Icon name={"information-outline"} type={"materialCommunity"} size={27} color={"gray"} />
              <Text style={{ color: "gray",fontSize:19,marginLeft:wp(2) }}>First Name should not be empty</Text>
            </View>
            <View style={{ flexDirection:"row",alignSelf:"flex-start",marginHorizontal:wp(10),marginTop:hp(1)}}>
              <Icon name={"information-outline"} type={"materialCommunity"} size={27} color={"gray"} />
              <Text style={{ color: "gray",fontSize:19,marginLeft:wp(2) }}>Last Name should not be empty</Text>
            </View>
            <View style={{ flexDirection:"row",alignSelf:"flex-start",marginHorizontal:wp(10),marginTop:hp(1)}}>
              <Icon name={"information-outline"} type={"materialCommunity"} size={27} color={"gray"} />
              <Text style={{ color: "gray",fontSize:19,marginLeft:wp(2) }}>Email  should not be empty</Text>
            </View>
<TouchableOpacity
  disabled={loading}
  onPress={() => {
    handleSubmit();
  }}
  style={styles.PresssableBtn}
>
              {/* <LinearGradient
                colors={["#12c2e9", "#c471ed", "#f64f59"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 1 }}
                style={styles.PresssableBtn}
              > */}
                  <Text style={styles.buttonText}>
                    {loading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                      "Create my account"
                    )}
                  </Text>
              {/* </LinearGradient> */}
                </TouchableOpacity>
            <View style={styles.lowerbox}>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("exchangeLogin");
                }}
              >
                <Text style={styles.lowerboxtext}>
                  <Text style={{ color: "#78909c" }}>
                    Already have an account?
                  </Text>{" "}
                  login now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};
const styles = StyleSheet.create({
  input: {
    height: hp("5%"),
    color: "black",
    marginTop: hp(0.5),
    width: wp(80),
    backgroundColor: "#fff",
    borderRadius: 4,
    marginLeft: wp("10"),
    fontSize:18,
    paddingHorizontal:wp(1)
  },
  content: {
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "space-evenly",
    marginTop: hp("1"),
    color: "white",
  },
  inp: {
    marginTop: hp(3),
    color: "#FFF",
   
  },
  tinyLogo: {
    width: wp("20"),
    height: hp("13"),
    marginTop: hp(0.3),
    alignSelf: "center",
  },
  btn: {
    width: wp("80"),
    borderRadius: 380,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.8)",
    marginTop: hp(2),
  },
  icon: {
    display: "flex",
    flexDirection: "row",
    marginTop: hp("10"),
    marginLeft: wp("15"),
  },
  text: {
    color: "#FFFFFF",
    marginBottom: wp("5"),
    fontSize: hp("5"),
  },
  // tinyLogo: {
  //   width: wp("5"),
  //   height: hp("5"),
  //   padding: 20,
  // },
  icon: {
    display: "flex",
    flexDirection: "row",
    marginTop: hp("2"),
    marginLeft: wp("4"),
  },
  icon2: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: hp("5"),
    paddingLeft: wp("2"),
  },
  button: {
    width:wp(80),
    paddingVertical:hp(1),
    alignSelf:"center",
    borderRadius:hp(1),
    marginTop:hp(2),
    paddingVertical:hp(1.5),
    marginBottom:hp(3)

  },
  PresssableBtn: {
    backgroundColor: "rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)",
    padding: hp(2),
    width: wp(80),
    borderColor:"rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
    borderWidth:1.3,
    alignSelf: "center",
    paddingHorizontal: wp(3),
    borderRadius: hp(2.5),
    marginBottom: hp(1),
    alignItems: "center",
    marginTop:Platform.OS==="android"?hp(2):hp(4),
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  },
  lowerbox: {
    marginTop: hp(0.2),
    height:hp(3),
    width: 400,
    display: "flex",
    alignItems: "center",
    textAlign: "center",
    justifyContent: "center",
    alignSelf:"center"
  },
  lowerboxtext: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    alignSelf: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#131E3A",
    height: 10,
    color: "#fff",
  },
  contentIos: {
    flex: 1,
    backgroundColor: "#131E3A",
    height: 10,
    color: "#fff",
  },
  text:{
    color:"white",
    marginHorizontal:wp(11),
    fontSize:16,
  }
});

