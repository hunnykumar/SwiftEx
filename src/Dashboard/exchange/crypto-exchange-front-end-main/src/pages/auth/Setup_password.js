import { useToast } from "native-base";
import { ActivityIndicator, Image, Keyboard, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Exchange_Login_screen } from "../../../../../reusables/ExchangeHeader";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import darkBlue from "../../../../../../../assets/darkBlue.png";
import { getAuth } from "../../api";
import { REACT_APP_HOST } from "../../ExchangeConstants";
import { useEffect, useState } from "react";
import { ShowErrotoast, Showsuccesstoast } from "../../../../../reusables/Toasts";

const Setup_password = (props) => {
    const navigation = useNavigation();
    const FOCUSED=useIsFocused();
    const toast = useToast();
    const [Loading, setLoading] = useState(false);
    const [passcode, setpasscode] = useState("");
    const [con_passcode, setcon_passcode] = useState("");

    useEffect(()=>{
        setLoading(false)
    },[FOCUSED])
    const onChangepass = (input) => {
        const formattedInput = input.replace(/\s/g, '');
        setpasscode(formattedInput);
    };
    const onChangeconpass = (input) => {
        const formattedInput = input.replace(/\s/g, '');
        setcon_passcode(formattedInput);
    };

    const submitpasscode = async () => {
      try {
        setLoading(true);

        const token = await getAuth();
        if (!passcode || !con_passcode) {
            setLoading(false);
            setcon_passcode("");
            setpasscode("");
            setTimeout(() => {
                ShowErrotoast(toast, "Both fields are required");
            }, 400)
        }
        else {
            const result = passcode === con_passcode;
            if (result === true) {
                console.log("-----",props.route.params.Email.toLowerCase())
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("Authorization", "Bearer " + token);
                const raw = JSON.stringify({
                    "email": props.route.params.Email.toLowerCase(),
                    "passcode": con_passcode
                });
                const requestOptions = {
                    method: "POST",
                    headers: myHeaders,
                    body: raw,
                    redirect: "follow"
                };

                fetch(REACT_APP_HOST + "/users/updatePasscode", requestOptions)
                    .then((response) => response.json())
                    .then((result) => {
                        console.log(result);
                        setLoading(false);
                        if (result.success === true) {
                            setpasscode("");
                            setcon_passcode("");
                            setTimeout(() => {
                                Showsuccesstoast(toast, "Choose a subscription and hold for more information.");
                            }, 400)
                            navigation.navigate("Subscription");
                        } else {
                            setpasscode("");
                            setcon_passcode("");
                            setTimeout(() => {
                                ShowErrotoast(toast, "Something went worng.");
                            }, 400)
                        }
                    })
                    .catch((error) => {
                        setLoading(false);
                        console.error(error)
                    });
            }
            else {
                setLoading(false);
                setpasscode("");
                setcon_passcode("");
                setTimeout(() => {
                    ShowErrotoast(toast, "Password Not Match.");
                }, 400)
            }
        }
      } catch (error) {
        console.log("---000--Error",error)
      }

    }
    return (
        <View style={styles.container}>
            <Exchange_Login_screen title="" onLeftIconPress={() => navigation.navigate("Home")} />
            <Image style={styles.tinyLogo} source={darkBlue} />
            <View style={{ justifyContent: "center", alignItems: "center", paddingHorizontal: wp(9) }}>
                <Text style={{ marginVertical: 15, color: "white", alignSelf: "flex-start",fontSize:19 }}>Password</Text>
                <TextInput
                    secureTextEntry={true}
                    placeholderTextColor="gray"
                    style={[styles.input, { color: "black", backgroundColor: "#fff" }]}
                    // theme={{ colors: { text: "white" } }}
                    value={passcode}
                    placeholder={"ABC@!123"}
                    onChangeText={(text) => {
                        onChangepass(text)
                    }}
                    autoCapitalize="none"
                    keyboardType="default"
                />
                {/* Set con-pass code  */}
                <Text style={{ marginVertical: 15, color: "white",alignSelf:"flex-start",fontSize:19 }}>Confirm Password</Text>
                <TextInput
                    secureTextEntry={true}
                    placeholderTextColor="gray"
                    style={[styles.input, { color: "black", backgroundColor: "#fff" }]}
                    value={con_passcode}
                    placeholder={"ABC@!123"}
                    onChangeText={(text) => {
                        onChangeconpass(text);
                    }}
                    autoCapitalize="none"
                    keyboardType="default"
                />
                {passcode.length < 8 || con_passcode.length < 8 ? <Text style={{ color: "#B51E14", marginTop: 6 }}>Your password must be at least 8 characters long.</Text> : <></>}
            </View>

            {Loading ? (
    <View style={styles.PresssableBtn} disabled={true}>
        <ActivityIndicator color={"white"} />
    </View>
) : (
    <TouchableOpacity
        disabled={passcode.length < 8 || con_passcode.length < 8}
        onPress={() => {
            submitpasscode();
            Keyboard.dismiss();
        }}
        style={styles.PresssableBtn}
    >
        <Text style={styles.buttonText}>Verify</Text>
    </TouchableOpacity>
)}

        </View>
    )
}
export default Setup_password;

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