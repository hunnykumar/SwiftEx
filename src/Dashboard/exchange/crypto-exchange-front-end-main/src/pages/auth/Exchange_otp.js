import { useToast } from "native-base";
import { ActivityIndicator, Image, Keyboard, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Exchange_Login_screen } from "../../../../../reusables/ExchangeHeader";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import darkBlue from "../../../../../../../assets/darkBlue.png";
import { getAuth, verifyLoginOtp } from "../../api";
import { REACT_APP_HOST } from "../../ExchangeConstants";
import { useEffect, useState } from "react";
import { ShowErrotoast } from "../../../../../reusables/Toasts";
import Snackbar from "react-native-snackbar";
import authApi from "../../authApi";
import apiHelper from "../../apiHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Exchange_otp = (props) => {
    const navigation = useNavigation();
    const FOCUSED=useIsFocused();
    const toast = useToast();
    const [Loading, setLoading] = useState(false);
    const [passcode, setpasscode] = useState("");
    const [rePassword, setrePassword] = useState("");
    const [otp, setOtp] = useState();
    

    useEffect(()=>{
        setLoading(false)
        setOtp(null)
    },[FOCUSED])

    const submitOtp = async () => {
        try {
            setLoading(true);
          if (!otp) {

            setLoading(false);
              Snackbar.show({
                text: "Otp required.",
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: 'red',
              });
          }else{
            const result = await apiHelper.post(REACT_APP_HOST+"/v1/auth/verify-user",{
                "email": props.route.params.Email,
                "otp": Number(otp)
            });
            console.log("---result--",result)
            if (result.success) {
                setOtp(null);
                setLoading(false);
                await AsyncStorage.setItem("UserAuthID", result.data.token) 
                navigation.navigate("exchange");
                Snackbar.show({
                    text: "Login Success.",
                    duration: Snackbar.LENGTH_SHORT,
                    backgroundColor: 'green',
                  });
                // navigation.navigate("ExchangeDetailsSubmittion");
            } else {
                setLoading(false);
                ShowErrotoast(toast,result.error);
                setOtp(null);
            }
          }
        } catch (err) {
            setLoading(false);
            console.log("---",err)
        } finally {
          setLoading(false);
        }

      };

      const submitOtpWithPassCode = async () => {
        try {
            setLoading(true);
          if (!otp) {

            setLoading(false);
              Snackbar.show({
                text: "Otp required.",
                duration: Snackbar.LENGTH_SHORT,
                backgroundColor: 'red',
              });
          }else{
            const result = await apiHelper.post(REACT_APP_HOST+"/v1/auth/reset-password",{
                "email": props.route.params.Email,
                "otp": Number(otp),
                "password":rePassword
            });
            console.log("---result--",result)
            if (result.data.success) {
                setOtp(null);
                setLoading(false); 
                navigation.goBack();
                Snackbar.show({
                    text: "Password Reset Success.",
                    duration: Snackbar.LENGTH_SHORT,
                    backgroundColor: 'green',
                  });
                // navigation.navigate("ExchangeDetailsSubmittion");
            } else {
                setLoading(false);
                ShowErrotoast(toast,result.error);
                setOtp(null);
            }
          }
        } catch (err) {
            setLoading(false);
            console.log("---",err)
        } finally {
          setLoading(false);
        }

      };
      const onChangepass = (input) => {
          const formattedInput = input.replace(/\s/g, '');
          setrePassword(formattedInput);
      };
    return (
        <View style={styles.container}>
            <Exchange_Login_screen title="" onLeftIconPress={() => navigation.goBack()} />
            <Image style={styles.tinyLogo} source={darkBlue} />
            <View style={{ justifyContent: "center", alignItems: "center", paddingHorizontal: wp(9) }}>
                <Text style={{ marginVertical: 15, color: "white", alignSelf: "flex-start",fontSize:19 }}>Verification Code</Text>
                <TextInput
                id="verificationCodeInput"
                testID="verificationCodeInput"
                    placeholderTextColor="gray"
                    style={[styles.input, { color: "black", backgroundColor: "#fff" }]}
                    maxLength={6}
                    value={otp}
                    placeholder={"000000"}
                    onChangeText={(text) => {
                        setOtp(text)
                    }}
                    autoCapitalize="none"
                    keyboardType="number-pad"
                    returnKeyType="done"
                />
                
                
            </View>
            {props.route.params.type==="OP_FUG"&&
            <View style={{ justifyContent: "center", alignItems: "center", paddingHorizontal: wp(9) }}>
                <Text style={{ marginVertical: 15, color: "white", alignSelf: "flex-start",fontSize:19 }}>Password</Text>
                <TextInput
                id="verificationCodePass"
                testID="verificationCodePass"
                    placeholderTextColor="gray"
                    style={[styles.input, { color: "black", backgroundColor: "#fff" }]}
                    maxLength={10}
                    value={rePassword}
                    placeholder={"Abcd!123"}
                    onChangeText={(text) => {
                        onChangepass(text)
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="done"
                />
            </View>}

            {Loading ? (
    <View style={styles.PresssableBtn} disabled={true}>
        <ActivityIndicator color={"white"} />
    </View>
) : (
    <TouchableOpacity
        id="submitOtpBtn"
        testID="submitOtpBtn"
        disabled={Loading}
        onPress={() => {
            Keyboard.dismiss();
            props.route.params.type==="OP_FUG"?submitOtpWithPassCode():submitOtp()
        }}
        style={styles.PresssableBtn}
    >
        <Text style={styles.buttonText}>Verify</Text>
    </TouchableOpacity>
)}

        </View>
    )
}
export default Exchange_otp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#131E3A",
        color: "#fff",
    },
    tinyLogo: {
        width: wp("20"),
        height: hp("13"),
        marginTop: hp(5),
        alignSelf: "center",
    },
    input: {
        paddingVertical: hp(1),
        paddingLeft: wp(7),
        color: "#fff",
        width: wp("84"),
        borderRadius: hp(1),
        borderWidth: StyleSheet.hairlineWidth * 2,
        borderColor: "gray",
    },
    PresssableBtn: {
        backgroundColor: "rgba(33, 43, 83, 1)rgba(28, 41, 77, 1)",
        padding: hp(2),
        width: wp(80),
        borderColor: "rgba(72, 93, 202, 1)rgba(67, 89, 205, 1)",
        borderWidth: 1.3,
        alignSelf: "center",
        paddingHorizontal: wp(3),
        borderRadius: hp(2.5),
        marginBottom: hp(1),
        alignItems: "center",
        marginTop: hp(10),
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 18,
    },

})