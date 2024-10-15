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
} from "react-native";
import { TextInput } from "react-native-paper";
import { LinearGradient } from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { ScrollView } from "react-native-gesture-handler";
import AsyncStorageLib from "@react-native-async-storage/async-storage";
import PhoneInput from "react-native-phone-number-input";
import { signup } from "../../api";
import { useSelector } from "react-redux";
import {ShowErrotoast, alert} from '../../../../../reusables/Toasts'
import { useToast } from "native-base";

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
    const { err } = await signup({
      ...formContent,
      phoneNumber: `${formContent.email}`,
    });
    setLoading(false);
    console.log(err)
    if (err.message === "Otp Send successfully") {
        navigation.navigate("exchangeLogin", {
        phoneNumber: formContent.email,
      });
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
            <Text style={{ color: "#fff", marginBottom: 20, fontSize: 16,textAlign:"center",marginTop:hp(3) ,fontWeight:"700"}}>
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
                <Text style={styles.text}>Last name</Text>
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
                  Email address
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
              <Text
                style={styles.input}
              >{formContent.walletAddress}
              </Text>
            </View>
           <View style={{height:32}}>
           {showMessage ? (
              // <Text style={{ color: "white",marginStart:13}}>{message}</Text>
              <Text style={{ color: "white",marginStart:13}}></Text>
            ) : (
              <View></View>
            )}
           </View>

<TouchableOpacity
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
                      <View style={{display:'flex', alignContent:'center', alignItems:'center', alignSelf:'center', marginLeft:wp(70)}}>
                        <ActivityIndicator size="small" color="white" />
                      </View>
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
    marginBottom: hp("2"),
    color: "#fff",
    marginTop: hp("1"),
    width: wp("70"),
    paddingRight: wp("7"),
    backgroundColor: "#131E3A",
    borderRadius: wp("20"),
    marginLeft: wp("10"),
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
  tinyLogo: {
    width: wp("5"),
    height: hp("5"),
    padding: 20,
  },
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
    // fontSize: 24,
  },
  lowerbox: {
    marginTop: hp(8),
    height:hp(6),
    width: 400,
    backgroundColor: "#003166",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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

